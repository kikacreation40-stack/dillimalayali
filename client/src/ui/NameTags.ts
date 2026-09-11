import { PerspectiveCamera, Vector3 } from 'three';
import type { PlayerState } from '../../../shared/types';
import { playerLabel } from '../../../shared/types';

export class NameTags {
  private readonly tags = new Map<string, HTMLDivElement>();
  private readonly projected = new Vector3();
  update(players: PlayerState[], camera: PerspectiveCamera, localX: number, localZ: number): void {
    const visible = new Set<string>();
    for (const p of players) {
      if ((!p.name && !p.hometown) || Math.hypot(p.x - localX, p.z - localZ) > 35) continue;
      visible.add(p.id);
      let tag = this.tags.get(p.id);
      if (!tag) { tag = document.createElement('div'); tag.className = 'nametag'; document.querySelector('#tags')!.append(tag); this.tags.set(p.id, tag); }
      tag.textContent = playerLabel(p);
      this.projected.set(p.x, p.vehicleId ? 3.4 : 2.65, p.z).project(camera);
      tag.hidden = this.projected.z > 1 || this.projected.z < -1 || Math.abs(this.projected.x) > 1 || Math.abs(this.projected.y) > 1;
      tag.style.transform = `translate(-50%, -100%) translate(${(this.projected.x + 1) * innerWidth / 2}px, ${(1 - this.projected.y) * innerHeight / 2}px)`;
    }
    for (const [id, tag] of this.tags) if (!visible.has(id)) { tag.remove(); this.tags.delete(id); }
  }
}
