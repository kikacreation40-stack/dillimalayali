import express from 'express';
import { registerModeration } from './Moderation.js';
import { VehicleManager } from './VehicleManager.js';
import { ChatManager } from './ChatManager.js';
import { profileFrom } from './validation.js';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { randomUUID } from 'node:crypto';
import { BOUNDARY, DRIVE_SPEED, RUN_SPEED, TELEPORT_SPAWNS, TICK_RATE, zoneAt } from '../shared/constants.js';
import type { PlayerState, Reply, Snapshot } from '../shared/types.js';

const app = express();
const http = createServer(app);
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(s => s.trim());
const io = new Server(http, {
  cors: { origin: origins }, maxHttpBufferSize: 4096,
  allowRequest: (req, done) => done(null, !req.headers.origin || origins.includes(req.headers.origin)),
});
const vehicleManager = new VehicleManager();
const players = new Map<string, PlayerState>();
const sockets = new Map<string, string>();
const chat = new ChatManager(io, players, sockets);
const movementCredit = new Map<string, number>();
const lastMove = new Map<string, number>();
app.get('/health', (_req, res) => res.json({ ok: true, players: players.size }));
const publicPlayer = (p: PlayerState): PlayerState => ({ ...p, name: p.showName ? p.name : '', hometown: p.showHometown ? p.hometown : '' });
const snapshot = (): Snapshot => ({ players: [...players.values()].map(publicPlayer), vehicles: [...vehicleManager.vehicles.values()] });
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
io.on('connection', socket => {
  let id: string | undefined;
  let lastProfile = 0;
  let lastTeleport = 0;
  chat.register(socket, () => id);
  registerModeration(socket, () => id, players, chat);
  socket.on('player:join', (data: unknown, ack?: (reply: Reply) => void) => {
    if (id) { if (typeof ack === 'function') ack({ ok: true, id }); return; }
    if (players.size >= 30) { if (typeof ack === 'function') ack({ ok: false, error: 'The world is full. Please try again shortly.' }); return; }
    const profile = profileFrom(data);
    if (!profile) { if (typeof ack === 'function') ack({ ok: false, error: 'Enter a name (1–24 characters) and choose a district.' }); return; }
    id = randomUUID();
    const p: PlayerState = { id, ...profile, color: [0xe99854, 0x558eb0, 0xa276a9, 0x6c9c79][Math.floor(Math.random() * 4)], x: (players.size % 3) * 1.5, z: 11 + Math.floor(players.size / 3) * 1.3, rotation: 0, zone: 'COMMUNITY_PARK', vehicleId: null };
    players.set(id, p); sockets.set(id, socket.id); lastMove.set(id, Date.now());
    if (typeof ack === 'function') ack({ ok: true, id });
    io.emit('player:joined', publicPlayer(p));
    socket.emit('world:snapshot', snapshot());
  });
  socket.on('player:profile', (data, ack) => {
    const profile = profileFrom(data);
    if (!id || !profile || Date.now() - lastProfile < 250) { if (typeof ack === 'function') ack({ ok: false, error: 'Please wait a moment and try again.' }); return; }
    lastProfile = Date.now(); Object.assign(players.get(id)!, profile);
    if (typeof ack === 'function') ack({ ok: true });
    io.emit('world:snapshot', snapshot());
  });
  const move = (data: unknown, driving: boolean) => {
    const payload = data as Record<string, unknown> | null;
    if (!payload) return;
    const { x, z, rotation } = payload;
    moveValidated({ x, z, rotation }, driving);
  };
  const moveValidated = (data: { x: unknown; z: unknown; rotation: unknown }, driving: boolean) => {
    if (!id || !data || typeof data !== 'object') return;
    const p = players.get(id)!;
    if (!finite(data.x) || !finite(data.z) || !finite(data.rotation) || !!p.vehicleId !== driving) return;
    const elapsed = Math.min((Date.now() - lastMove.get(id)!) / 1000, 0.5);
    if (elapsed < 0.04) return;
    lastMove.set(id, Date.now());
    const speed = driving ? DRIVE_SPEED : RUN_SPEED;
    const credit = Math.min(speed * 0.25 + 0.7, (movementCredit.get(id) ?? 0.6) + speed * elapsed);
    movementCredit.set(id, credit);
    const distance = Math.hypot(data.x - p.x, data.z - p.z);
    if (Math.abs(data.x) > BOUNDARY - 0.5 || Math.abs(data.z) > BOUNDARY - 0.5 || distance > credit) {
      socket.emit('player:correction', { x: p.x, z: p.z, rotation: p.rotation }); return;
    }
    movementCredit.set(id, credit - distance);
    p.x = data.x; p.z = data.z; p.rotation = data.rotation % (Math.PI * 2); p.zone = zoneAt(p.x, p.z);
    if (p.vehicleId) { const v = vehicleManager.vehicles.get(p.vehicleId)!; if (v.driverId === id) { v.x = p.x; v.z = p.z; v.rotation = p.rotation; } }
  };
  socket.on('player:update', data => move(data, false));
  socket.on('vehicle:update', data => move(data, true));
  socket.on('player:teleport', (destination, ack) => {
    if (!id || typeof destination !== 'string' || !Object.hasOwn(TELEPORT_SPAWNS, destination)) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Choose a landmark from the teleport menu.' }); return;
    }
    if (Date.now() - lastTeleport < 1000) { if (typeof ack === 'function') ack({ ok: false, error: 'Wait a moment before teleporting again.' }); return; }
    lastTeleport = Date.now();
    const player = players.get(id)!;
    chat.close(id, 'Your neighbor teleported away.');
    vehicleManager.release(player);
    Object.assign(player, TELEPORT_SPAWNS[destination]); player.zone = destination;
    movementCredit.set(id, 0.6); lastMove.set(id, Date.now());
    socket.emit('player:teleported', { x: player.x, z: player.z, rotation: player.rotation });
    io.emit('world:snapshot', snapshot());
    if (typeof ack === 'function') ack({ ok: true });
  });
  socket.on('vehicle:enter', (vehicleId, ack) => {
    if (!id) return;
    const error = vehicleManager.enter(players.get(id)!, vehicleId);
    if (!error) { lastMove.set(id, Date.now()); socket.emit('player:correction', players.get(id)); io.emit('world:snapshot', snapshot()); }
    if (typeof ack === 'function') ack({ ok: !error, error });
  });
  socket.on('vehicle:exit', (data, ack) => {
    if (!id) return; const p = players.get(id)!;
    if (!p.vehicleId || !data || !finite(data.x) || !finite(data.z) || Math.hypot(data.x - p.x, data.z - p.z) > 4 || Math.abs(data.x) > BOUNDARY - 1 || Math.abs(data.z) > BOUNDARY - 1) { if (typeof ack === 'function') ack({ ok: false, error: 'Cannot exit here.' }); return; }
    vehicleManager.release(p); p.x = data.x; p.z = data.z; lastMove.set(id, Date.now());
    socket.emit('player:correction', p); io.emit('world:snapshot', snapshot()); if (typeof ack === 'function') ack({ ok: true });
  });
  socket.on('disconnect', () => {
    if (!id) return;
    vehicleManager.release(players.get(id)!);
    chat.disconnect(id);
    players.delete(id); sockets.delete(id); lastMove.delete(id); movementCredit.delete(id); io.emit('player:left', id);
  });
});
const tick = setInterval(() => { chat.tick(); io.emit('world:snapshot', snapshot()); }, 1000 / TICK_RATE);
const port = Number(process.env.PORT || 3001);
http.listen(port, '0.0.0.0', () => console.log(`Delhi Malayali World server listening on ${(http.address() as { port: number }).port}`));
function shutdown(): void { clearInterval(tick); io.close(); http.close(); }
process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
