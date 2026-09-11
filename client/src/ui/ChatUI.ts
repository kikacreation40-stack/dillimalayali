import type { NetworkManager } from '../network/NetworkManager';
import type { ChatMessage, PlayerState, Reply } from '../../../shared/types';
import { playerLabel } from '../../../shared/types';
import { TALK_RADIUS } from '../../../shared/constants';

export class ChatUI {
  partner = '';
  nearest = '';
  private players: PlayerState[] = [];
  private readonly panel = document.querySelector<HTMLElement>('#chat')!;
  private readonly input = document.querySelector<HTMLInputElement>('#chat-input')!;
  private readonly log = document.querySelector<HTMLElement>('#chat-log')!;
  private readonly talk = document.querySelector<HTMLButtonElement>('#talk')!;
  constructor(private network: NetworkManager, private notify: (message: string) => void) {
    this.talk.addEventListener('click', () => this.request());
    document.querySelector('#chat-close')!.addEventListener('click', () => { network.socket.emit('chat:close'); this.panel.classList.add('hidden'); this.partner = ''; });
    network.socket.on('chat:opened', ({ partner }: { partner: string }) => {
      if (partner !== this.partner) this.log.replaceChildren();
      this.partner = partner; this.panel.classList.remove('hidden'); this.input.disabled = false;
      document.querySelector<HTMLButtonElement>('#chat-send')!.disabled = false;
      this.title(); this.notify('A neighbor is ready to talk. Say hello!');
    });
    network.socket.on('chat:closed', ({ reason }: { reason: string }) => this.end(reason));
    network.socket.on('disconnect', () => this.end('Connection lost. Rejoin to talk again.'));
    network.socket.on('chat:message', (message: ChatMessage) => {
      if (message.from !== this.partner && message.to !== this.partner) return;
      this.line(message.from === network.id ? 'You' : this.label(message.from), message.text);
    });
    document.querySelector('#chat-form')!.addEventListener('submit', e => {
      e.preventDefault();
      const text = this.input.value.trim(); if (!text || !this.partner) return;
      const sent = this.input.value;
      network.socket.timeout(5000).emit('chat:send', { to: this.partner, text }, (error: Error | null, reply: Reply) => {
        if (error || !reply?.ok) this.notify(reply?.error || 'Message could not be delivered.');
        else if (this.input.value === sent) this.input.value = '';
      });
    });
  }
  private label(id: string): string { const p = this.players.find(p => p.id === id); return p ? playerLabel(p) : 'Neighbor'; }
  private title(): void { document.querySelector('#chat-title')!.textContent = `Talking with ${this.label(this.partner)}`; }
  private line(name: string, text: string): void {
    const row = document.createElement('p'); const label = document.createElement('strong'); label.textContent = `${name}: `;
    row.append(label, document.createTextNode(text)); this.log.append(row);
    while (this.log.children.length > 60) this.log.firstElementChild!.remove();
    this.log.scrollTop = this.log.scrollHeight;
  }
  private end(reason: string): void {
    if (!this.partner) return;
    this.partner = ''; this.input.disabled = true; document.querySelector<HTMLButtonElement>('#chat-send')!.disabled = true;
    this.line('', reason); this.input.blur();
  }
  request(): void {
    if (this.partner) { this.input.focus(); return; }
    if (!this.nearest) return;
    this.network.socket.timeout(5000).emit('chat:request', this.nearest, (error: Error | null, reply: Reply) => {
      if (error || !reply?.ok) this.notify(reply?.error || 'Could not start the conversation.');
      else this.input.focus();
    });
  }
  focus(): void { if (this.partner) this.input.focus(); else this.request(); }
  update(players: PlayerState[], x: number, z: number, blocked: Set<string> = new Set()): void {
    this.players = players;
    const self = players.find(p => p.id === this.network.id);
    const nearby = players.filter(p => p.id !== this.network.id && self?.allowTalk && p.allowTalk && !blocked.has(p.id) && Math.hypot(p.x - x, p.z - z) <= TALK_RADIUS).sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z))[0];
    this.nearest = nearby?.id || '';
    this.talk.hidden = !nearby || !!this.partner;
    if (nearby) this.talk.textContent = `E · TALK — ${playerLabel(nearby)}`;
    if (this.partner) this.title();
  }
}
