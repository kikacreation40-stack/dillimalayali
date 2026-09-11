import type { Socket } from 'socket.io';
import type { ChatManager } from './ChatManager.js';
import type { PlayerState } from '../shared/types.js';
import { appendFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export function registerModeration(socket: Socket, getId: () => string | undefined, players: Map<string, PlayerState>, chat: ChatManager): void {
  let lastReport = 0;
  let lastAction = 0;
  for (const action of ['mute', 'block'] as const) socket.on(`player:${action}`, (data, ack) => {
    const id = getId();
    if (!id || !data || typeof data.target !== 'string' || data.target === id || !players.has(data.target) || typeof data.enabled !== 'boolean' || Date.now() - lastAction < 200) { if (typeof ack === 'function') ack({ ok: false, error: 'Player unavailable or action too fast.' }); return; }
    lastAction = Date.now();
    const map = action === 'block' ? chat.blocked : chat.muted;
    let set = map.get(id); if (!set) { set = new Set(); map.set(id, set); }
    if (data.enabled) set.add(data.target); else set.delete(data.target);
    if (data.enabled && chat.partners.get(id) === data.target) chat.close(id, 'Conversation ended.');
    if (typeof ack === 'function') ack({ ok: true });
  });
  socket.on('player:report', async (data, ack) => {
    const id = getId();
    if (!id || !data || typeof data.target !== 'string' || data.target === id || !players.has(data.target) || typeof data.reason !== 'string' || !data.reason.trim() || data.reason.length > 500 || Date.now() - lastReport < 30000) { if (typeof ack === 'function') ack({ ok: false, error: 'Add a reason (1–500 characters). Reports are limited to one every 30 seconds.' }); return; }
    lastReport = Date.now();
    const report = { time: new Date().toISOString(), reporterId: id, targetId: data.target, reason: data.reason.trim(), zone: players.get(id)!.zone };
    try {
      const directory = process.env.REPORT_DIR || 'reports';
      await mkdir(directory, { recursive: true });
      await appendFile(join(directory, 'reports.jsonl'), JSON.stringify(report) + '\n', { mode: 0o600 });
      if (typeof ack === 'function') ack({ ok: true });
    } catch (error) { console.error('Report storage failed:', error); if (typeof ack === 'function') ack({ ok: false, error: 'Report could not be stored. Please try later.' }); }
  });
}
