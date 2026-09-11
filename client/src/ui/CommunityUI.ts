import { LANDMARKS, zoneAt } from '../../../shared/constants';
import { playerLabel, type PlayerState, type Reply } from '../../../shared/types';
import type { NetworkManager } from '../network/NetworkManager';

export class CommunityUI {
  readonly blocked = new Set<string>();
  readonly muted = new Set<string>();
  private signature = '';
  private zone = '';
  private reportTarget = '';
  private readonly map = document.querySelector<HTMLCanvasElement>('#minimap')!.getContext('2d')!;
  constructor(private network: NetworkManager, private notify: (message: string) => void) {
    document.querySelector('#online-button')!.addEventListener('click', () => document.querySelector('#online-panel')!.classList.toggle('hidden'));
    document.querySelector('#map-button')!.addEventListener('click', () => document.querySelector('#map-panel')!.classList.toggle('hidden'));
    document.querySelector('#report-cancel')!.addEventListener('click', () => document.querySelector('#report-panel')!.classList.add('hidden'));
    document.querySelector('#report-form')!.addEventListener('submit', e => {
      e.preventDefault();
      const reason = document.querySelector<HTMLTextAreaElement>('#report-reason')!.value;
      network.socket.timeout(5000).emit('player:report', { target: this.reportTarget, reason }, (err: Error | null, reply: Reply) => {
        document.querySelector('#report-status')!.textContent = err || !reply?.ok ? reply?.error || 'Could not send report.' : 'Report saved. The MVP has no live moderation team.';
        if (!err && reply?.ok) document.querySelector<HTMLTextAreaElement>('#report-reason')!.value = '';
      });
    });
    network.socket.on('disconnect', () => { this.blocked.clear(); this.muted.clear(); this.signature = ''; });
  }
  private action(kind: 'mute' | 'block', target: string): void {
    const set = kind === 'mute' ? this.muted : this.blocked;
    const enabled = !set.has(target);
    this.network.socket.timeout(5000).emit(`player:${kind}`, { target, enabled }, (err: Error | null, reply: Reply) => {
      if (err || !reply?.ok) this.notify(reply?.error || 'Action failed.');
      else { if (enabled) set.add(target); else set.delete(target); this.signature = ''; this.notify(`${kind === 'mute' ? 'Mute' : 'Block'} ${enabled ? 'enabled' : 'removed'} for this session.`); }
    });
  }
  update(players: PlayerState[], x: number, z: number, rotation: number): void {
    document.querySelector('#online-button')!.textContent = `ONLINE ${players.length}`;
    const signature = JSON.stringify(players.map(p => [p.id, p.name, p.hometown]));
    if (signature !== this.signature) {
      this.signature = signature;
      const panel = document.querySelector('#online-users')!; panel.replaceChildren();
      for (const p of players) {
        const row = document.createElement('div'); row.className = 'online-row';
        const name = document.createElement('strong'); name.textContent = playerLabel(p) + (p.id === this.network.id ? ' (you)' : ''); row.append(name);
        if (p.id !== this.network.id) {
          const actions = document.createElement('div');
          for (const kind of ['mute', 'block', 'report'] as const) {
            const button = document.createElement('button');
            button.textContent = kind === 'report' ? 'Report' : kind === 'mute' ? this.muted.has(p.id) ? 'Unmute' : 'Mute' : this.blocked.has(p.id) ? 'Unblock' : 'Block';
            button.setAttribute('aria-label', `${button.textContent} ${playerLabel(p)}`);
            button.addEventListener('click', () => {
              if (kind !== 'report') this.action(kind, p.id);
              else { this.reportTarget = p.id; document.querySelector('#report-title')!.textContent = `Report ${playerLabel(p)}`; document.querySelector('#report-status')!.textContent = ''; document.querySelector('#report-panel')!.classList.remove('hidden'); document.querySelector<HTMLTextAreaElement>('#report-reason')!.focus(); }
            }); actions.append(button);
          }
          row.append(actions);
        }
        panel.append(row);
      }
    }
    const zone = zoneAt(x, z);
    const label = LANDMARKS.find(l => l.id === zone)?.name || 'Central Avenue';
    document.querySelector('#location-name')!.textContent = label;
    if (zone !== this.zone) { this.zone = zone; if (this.network.ready) this.notify(`Welcome to ${label}`); }
    if (document.querySelector('#map-panel')!.classList.contains('hidden')) return;
    const ctx = this.map, scale = 190 / 600, px = (v: number) => 105 + v * scale;
    ctx.clearRect(0, 0, 210, 210); ctx.fillStyle = '#e4ead6'; ctx.fillRect(0, 0, 210, 210);
    ctx.strokeStyle = '#b7bba9'; ctx.lineWidth = 3;
    for (const points of [[-290,-13,290,-13],[28,-180,28,108],[-230,-13,-230,70],[-130,-13,-130,-80],[28,-180,220,-180],[180,-13,180,70]]) {
      ctx.beginPath(); ctx.moveTo(px(points[0]), px(points[1])); ctx.lineTo(px(points[2]), px(points[3])); ctx.stroke();
    }
    ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
    for (const l of LANDMARKS) { ctx.fillStyle = '#386d58'; ctx.beginPath(); ctx.arc(px(l.x), px(l.z), 3, 0, Math.PI * 2); ctx.fill(); ctx.fillText(l.short, px(l.x), px(l.z) - 7); }
    ctx.fillStyle = '#537562'; ctx.textAlign = 'left'; ctx.fillText('N ↑', 10, 16);
    ctx.save(); ctx.translate(px(x), px(z)); ctx.rotate(-rotation); ctx.fillStyle = '#e18e43'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(-4, -4); ctx.lineTo(4, -4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
}
