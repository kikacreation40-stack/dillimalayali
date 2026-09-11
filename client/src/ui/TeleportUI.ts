import { LANDMARKS } from '../../../shared/constants';
import type { Reply } from '../../../shared/types';
import type { NetworkManager } from '../network/NetworkManager';

export class TeleportUI {
  busy = false;
  constructor(network: NetworkManager, notify: (message: string) => void) {
    const panel = document.querySelector('#teleport-panel')!;
    const toggle = document.querySelector('#teleport-button')!;
    const status = document.querySelector('#teleport-status')!;
    const show = (visible: boolean) => { panel.classList.toggle('hidden', !visible); toggle.setAttribute('aria-expanded', String(visible)); };
    toggle.addEventListener('click', () => { show(panel.classList.contains('hidden')); document.querySelector('#online-panel')!.classList.add('hidden'); });
    document.querySelector('#teleport-close')!.addEventListener('click', () => show(false));
    for (const landmark of LANDMARKS) {
      const button = document.createElement('button'); button.textContent = landmark.name;
      button.addEventListener('click', () => {
        if (this.busy) return;
        if (!network.ready) { status.textContent = 'Connect to the world first.'; return; }
        this.busy = true; status.textContent = 'Taking you there…';
        network.socket.timeout(5000).emit('player:teleport', landmark.id, (error: Error | null, reply: Reply) => {
          this.busy = false;
          if (error || !reply?.ok) { status.textContent = reply?.error || 'Teleport failed. Please try again.'; return; }
          status.textContent = ''; show(false); (document.activeElement as HTMLElement)?.blur(); notify(`Welcome to ${landmark.name}`);
        });
      });
      document.querySelector('#teleport-destinations')!.append(button);
    }
    network.socket.on('disconnect', () => { this.busy = false; show(false); });
  }
}
