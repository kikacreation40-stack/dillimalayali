import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { io } from 'socket.io-client';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const profile = (name, hometown = 'Kollam') => ({ name, hometown, avatar: 'male', showName: true, showHometown: true, allowTalk: true });
const request = (socket, event, data) => new Promise((resolve, reject) => socket.timeout(2500).emit(event, data, (error, result) => error ? reject(error) : resolve(result)));
async function until(predicate, message) {
  const deadline = Date.now() + 3500;
  while (Date.now() < deadline) { if (predicate()) return; await sleep(25); }
  assert.fail(message);
}

test('multiplayer identity, proximity, moderation, vehicles, and capacity', { timeout: 45000 }, async t => {
  const directory = await mkdtemp(join(tmpdir(), 'dmw-test-'));
  const child = spawn(process.execPath, ['dist-server/server/index.js'], { env: { ...process.env, PORT: '0', REPORT_DIR: directory, CLIENT_ORIGIN: 'http://localhost:5173' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '', errors = ''; child.stdout.on('data', data => output += data); child.stderr.on('data', data => errors += data);
  const clients = [];
  t.after(async () => {
    clients.forEach(c => c.socket.disconnect());
    const exited = new Promise(resolve => child.once('exit', resolve)); child.kill('SIGTERM'); await exited;
    await rm(directory, { recursive: true, force: true });
  });
  await until(() => /listening on (\d+)/.test(output), 'server starts');
  const url = `http://127.0.0.1:${output.match(/listening on (\d+)/)[1]}`;
  async function connect(name, hometown) {
    const socket = io(url, { transports: ['websocket'], reconnection: false });
    const client = { socket, state: { players: [], vehicles: [] }, messages: [], closed: [], id: '' };
    clients.push(client);
    socket.on('world:snapshot', state => client.state = state);
    socket.on('chat:message', m => client.messages.push(m));
    socket.on('chat:closed', m => client.closed.push(m));
    await new Promise((resolve, reject) => { socket.once('connect', resolve); socket.once('connect_error', reject); });
    const reply = await request(socket, 'player:join', profile(name, hometown)); client.id = reply.id || '';
    return { client, reply };
  }
  const { client: a } = await connect('Arun');
  const { client: b } = await connect('Anu', 'Thrissur');
  const { client: c } = await connect('Nikhil', 'Ernakulam');
  await until(() => a.state.players.length === 3, 'join broadcasts all players');
  assert.notEqual(a.id, b.id);
  const invalid = await connect('   ', 'Mars'); assert.equal(invalid.reply.ok, false); invalid.client.socket.disconnect();
  assert.equal((await request(b.socket, 'player:profile', { ...profile('Anu', 'Thrissur'), showName: false, showHometown: false })).ok, true);
  await until(() => a.state.players.find(p => p.id === b.id)?.name === '', 'privacy stripped from broadcasts');
  assert.equal(a.state.players.find(p => p.id === b.id).hometown, '');
  await sleep(275); await request(b.socket, 'player:profile', { ...profile('Anu', 'Thrissur'), avatar: 'female' });
  await until(() => a.state.players.find(p => p.id === b.id)?.avatar === 'female', 'avatar changes reach other players');
  assert.equal((await request(a.socket, 'chat:request', b.id)).ok, true);
  assert.equal((await request(a.socket, 'chat:send', { to: b.id, text: 'Hi 👋 <b>plain text</b>' })).ok, true);
  await until(() => b.messages.length === 1, 'message arrives at neighbor');
  assert.equal(b.messages[0].text, 'Hi 👋 <b>plain text</b>'); assert.equal(c.messages.length, 0);
  assert.equal((await request(c.socket, 'chat:send', { to: b.id, text: 'unsolicited' })).ok, false);
  assert.equal((await request(a.socket, 'chat:send', { to: b.id, text: 'x'.repeat(281) })).ok, false);
  assert.equal((await request(b.socket, 'player:mute', { target: a.id, enabled: true })).ok, true);
  assert.equal((await request(a.socket, 'chat:send', { to: b.id, text: 'muted' })).ok, false);
  await sleep(225); await request(b.socket, 'player:mute', { target: a.id, enabled: false });
  await sleep(225); await request(b.socket, 'player:block', { target: a.id, enabled: true });
  assert.equal((await request(a.socket, 'chat:request', b.id)).ok, false);
  await sleep(225); await request(b.socket, 'player:block', { target: a.id, enabled: false });
  assert.equal((await request(b.socket, 'player:report', { target: a.id, reason: 'Automated test report' })).ok, true);
  const report = JSON.parse((await readFile(join(directory, 'reports.jsonl'), 'utf8')).trim());
  assert.equal(report.targetId, a.id); assert.equal(report.reason, 'Automated test report');
  const results = await Promise.all([request(a.socket, 'vehicle:enter', 'auto-park'), request(b.socket, 'vehicle:enter', 'auto-park')]);
  assert.equal(results.filter(r => r.ok).length, 1, 'vehicle has exactly one driver');
  const driver = results[0].ok ? a : b, other = results[0].ok ? b : a;
  await until(() => c.state.vehicles.find(v => v.id === 'auto-park')?.driverId === driver.id, 'driver visible to all');
  const vehicle = c.state.vehicles.find(v => v.id === 'auto-park');
  await sleep(125);
  driver.socket.emit('vehicle:update', { x: vehicle.x + 0.6, z: vehicle.z, rotation: 0.3 });
  await until(() => c.state.vehicles.find(v => v.id === 'auto-park')?.x > vehicle.x + 0.5, 'vehicle motion synchronizes');
  other.socket.emit('vehicle:update', { x: 100, z: 100, rotation: 0 });
  await sleep(150); assert(c.state.vehicles.find(v => v.id === 'auto-park').x < 10, 'non-driver cannot control vehicle');
  driver.socket.emit('vehicle:update', { x: 99999, z: 0, rotation: 0 });
  await sleep(125); assert(c.state.vehicles.find(v => v.id === 'auto-park').x < 10, 'world bounds enforced');
  assert.equal((await request(driver.socket, 'vehicle:exit', { x: vehicle.x + 2, z: vehicle.z })).ok, true);
  await sleep(800);
  assert.equal((await request(a.socket, 'chat:request', b.id)).ok, true);
  let position = a.state.players.find(p => p.id === a.id);
  const before = b.closed.length;
  for (let i = 0; i < 30; i++) { await sleep(90); position = { ...position, x: position.x - 0.45 }; a.socket.emit('player:update', position); }
  await until(() => b.closed.length > before, 'proximity conversation closes after moving apart');
  assert.equal((await request(a.socket, 'chat:send', { to: b.id, text: 'too far' })).ok, false);
  const last = a.state.players.find(p => p.id === a.id);
  a.socket.emit('player:update', { x: 250, z: 250, rotation: 0 }); await sleep(150);
  assert(Math.abs(a.state.players.find(p => p.id === a.id).x - last.x) < 1, 'teleport rejected');
  a.socket.emit('player:update', { x: null, z: [], rotation: 'bad' }); await sleep(100);
  assert(a.state.players.every(p => Number.isFinite(p.x)), 'malformed movement ignored');
  assert.equal((await request(c.socket, 'player:teleport', 'constructor')).ok, false);
  assert.equal((await request(c.socket, 'player:teleport', { x: 500, z: 500 })).ok, false);
  assert.equal((await request(c.socket, 'chat:request', b.id)).ok, true);
  assert.equal((await request(c.socket, 'vehicle:enter', 'auto-park')).ok, true);
  const closedBeforeTeleport = b.closed.length;
  assert.equal((await request(c.socket, 'player:teleport', 'RED_FORT')).ok, true);
  await until(() => a.state.players.find(p => p.id === c.id)?.zone === 'RED_FORT', 'teleport synchronized to other players');
  const fortArrival = a.state.players.find(p => p.id === c.id);
  assert.equal(fortArrival.x, 220); assert.equal(fortArrival.z, -177); assert.equal(fortArrival.vehicleId, null);
  assert.equal(a.state.vehicles.find(v => v.id === 'auto-park').driverId, null);
  assert(a.state.vehicles.find(v => v.id === 'auto-park').x < 10, 'vehicle remains at departure point');
  await until(() => b.closed.length > closedBeforeTeleport, 'teleport ends proximity conversation');
  assert.equal((await request(c.socket, 'player:teleport', 'INDIA_GATE')).ok, false, 'rapid repeat teleport is rejected');
  await sleep(1050);
  assert.equal((await request(c.socket, 'player:teleport', 'INDIA_GATE')).ok, true);
  await until(() => a.state.players.find(p => p.id === c.id)?.zone === 'INDIA_GATE', 'Red Fort to India Gate works');
  assert.equal(a.state.players.find(p => p.id === c.id).x, -230);
  await sleep(100); c.socket.emit('player:update', { x: -229.8, z: 84, rotation: Math.PI });
  await until(() => a.state.players.find(p => p.id === c.id)?.x === -229.8, 'walking works after teleport');
  // Fill the intended MVP capacity, then verify excess guests are rejected.
  for (let i = 0; i < 27; i++) assert.equal((await connect(`Guest ${i}`)).reply.ok, true);
  await until(() => c.state.players.length === 30, '30 concurrent players present');
  assert.equal((await connect('Overflow')).reply.ok, false);
  b.socket.disconnect(); await until(() => !c.state.players.some(p => p.id === b.id), 'disconnect removes player');
  assert.equal(errors, '', 'server has no runtime errors');
});
