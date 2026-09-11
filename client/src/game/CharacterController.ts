import { Vector3 } from 'three';
import { WALK_SPEED, RUN_SPEED } from '../../../shared/constants';
import { Player } from './Player';
import { Collision } from './Collision';

export class CharacterController {
  enabled = false;
  mobile = { x: 0, z: 0, running: false };
  private readonly keys = new Set<string>();
  private readonly direction = new Vector3();
  private readonly up = new Vector3(0, 1, 0);

  constructor(private player: Player, private collision: Collision) {
    window.addEventListener('keydown', e => {
      if (!this.enabled) return;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        e.preventDefault();
        this.keys.add(e.code);
      }
    });
    window.addEventListener('keyup', e => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.clear());
  }

  clear(): void { this.keys.clear(); }

  axes(): { x: number; z: number; running: boolean } {
    const down = (...codes: string[]) => Number(this.enabled && codes.some(code => this.keys.has(code)));
    return { x: down('KeyD', 'ArrowRight') - down('KeyA', 'ArrowLeft') + (this.enabled ? this.mobile.x : 0), z: down('KeyS', 'ArrowDown') - down('KeyW', 'ArrowUp') + (this.enabled ? this.mobile.z : 0), running: !!down('ShiftLeft', 'ShiftRight') || (this.enabled && this.mobile.running) };
  }
  update(dt: number, yaw: number): void {
    const { x, z, running } = this.axes();
    this.direction.set(x, 0, z).clampLength(0, 1).applyAxisAngle(this.up, yaw);
    const moving = x !== 0 || z !== 0;
    if (moving) {
      const speed = running ? RUN_SPEED : WALK_SPEED;
      this.collision.move(this.player.mesh.position, this.direction.x * speed * dt, this.direction.z * speed * dt);
      const target = Math.atan2(this.direction.x, this.direction.z);
      const delta = Math.atan2(Math.sin(target - this.player.mesh.rotation.y), Math.cos(target - this.player.mesh.rotation.y));
      this.player.mesh.rotation.y += delta * (1 - Math.exp(-14 * dt));
    }
    this.player.animate(dt, moving, running);
  }
}
