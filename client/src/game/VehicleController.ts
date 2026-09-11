import type { Player } from './Player';
import type { Collision } from './Collision';
import { DRIVE_SPEED } from '../../../shared/constants';

export class VehicleController {
  speed = 0;
  update(dt: number, throttle: number, steer: number, player: Player, collision: Collision): void {
    this.speed += throttle * 10 * dt;
    this.speed *= Math.exp(-(throttle ? 0.45 : 3) * dt);
    this.speed = Math.max(-5, Math.min(DRIVE_SPEED, this.speed));
    player.mesh.rotation.y -= steer * this.speed / DRIVE_SPEED * 1.9 * dt;
    const dx = Math.sin(player.mesh.rotation.y) * this.speed * dt;
    const dz = Math.cos(player.mesh.rotation.y) * this.speed * dt;
    const p = player.mesh.position;
    if (!collision.blocked(p.x + dx, p.z + dz, 1.8)) { p.x += dx; p.z += dz; } else this.speed = 0;
  }
}
