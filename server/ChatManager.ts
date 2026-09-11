import type { Server, Socket } from 'socket.io';
import type { PlayerState } from '../shared/types.js';
import { CHAT_RADIUS, TALK_RADIUS } from '../shared/constants.js';

export class ChatManager {
  readonly partners = new Map<string, string>();
  readonly blocked = new Map<string, Set<string>>();
  readonly muted = new Map<string, Set<string>>();
  private readonly lastMessage = new Map<string, number>();
  constructor(private io: Server, private players: Map<string, PlayerState>, private sockets: Map<string, string>) {}
  send(id: string, event: string, data: unknown): void { const socket = this.sockets.get(id); if (socket) this.io.to(socket).emit(event, data); }
  denied(a: string, b: string): boolean { return !!(this.blocked.get(a)?.has(b) || this.blocked.get(b)?.has(a) || this.muted.get(a)?.has(b) || this.muted.get(b)?.has(a)); }
  nearby(a: string, b: string, radius: number): boolean {
    const p = this.players.get(a), q = this.players.get(b);
    return !!p && !!q && a !== b && p.allowTalk && q.allowTalk && !this.denied(a, b) && Math.hypot(p.x - q.x, p.z - q.z) <= radius;
  }
  close(id: string, reason: string): void {
    const other = this.partners.get(id); this.partners.delete(id);
    if (other && this.partners.get(other) === id) { this.partners.delete(other); this.send(other, 'chat:closed', { reason }); }
    this.send(id, 'chat:closed', { reason });
  }
  register(socket: Socket, getId: () => string | undefined): void {
    let lastRequest = 0;
    socket.on('chat:request', (target, ack) => {
      const id = getId();
      if (!id || typeof target !== 'string' || Date.now() - lastRequest < 700 || !this.nearby(id, target, TALK_RADIUS)) { if (typeof ack === 'function') ack({ ok: false, error: 'Talk is unavailable. Move closer or try another neighbor.' }); return; }
      lastRequest = Date.now();
      // Never interrupt someone who is already talking to another neighbor.
      if ((this.partners.has(target) && this.partners.get(target) !== id) || (this.partners.has(id) && this.partners.get(id) !== target)) { if (typeof ack === 'function') ack({ ok: false, error: 'Already in a conversation. Try again in a moment.' }); return; }
      this.partners.set(id, target); this.partners.set(target, id);
      this.send(id, 'chat:opened', { partner: target }); this.send(target, 'chat:opened', { partner: id });
      if (typeof ack === 'function') ack({ ok: true });
    });
    socket.on('chat:send', (data, ack) => {
      const id = getId(), now = Date.now();
      const fail = (error: string) => { if (typeof ack === 'function') ack({ ok: false, error }); };
      if (!id || !data || typeof data.to !== 'string' || typeof data.text !== 'string' || this.partners.get(id) !== data.to) return fail('Open a nearby conversation first.');
      if (!this.nearby(id, data.to, CHAT_RADIUS)) { this.close(id, 'Your neighbor moved away or is no longer available.'); return fail('Conversation ended.'); }
      const text = data.text.replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, '').trim();
      if (!text || text.length > 280) return fail('Use 1–280 characters.');
      if (now - (this.lastMessage.get(id) || 0) < 700) return fail('A little slower, please.');
      this.lastMessage.set(id, now);
      const message = { from: id, to: data.to, text, time: now };
      this.send(id, 'chat:message', message); this.send(data.to, 'chat:message', message);
      if (typeof ack === 'function') ack({ ok: true });
    });
    socket.on('chat:close', () => { const id = getId(); if (id) this.close(id, 'Conversation ended.'); });
  }
  tick(): void { for (const [id, other] of this.partners) if (!this.nearby(id, other, CHAT_RADIUS)) this.close(id, 'Your neighbor moved away or is no longer available.'); }
  disconnect(id: string): void { this.close(id, 'Your neighbor left the world.'); this.lastMessage.delete(id); this.blocked.delete(id); this.muted.delete(id); for (const set of [...this.blocked.values(), ...this.muted.values()]) set.delete(id); }
}
