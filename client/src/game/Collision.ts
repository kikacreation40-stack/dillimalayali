import { Vector3 } from 'three';
import { BOUNDARY } from '../../../shared/constants';

export interface Obstacle { x: number; z: number; halfX: number; halfZ: number; height?: number }

export class Collision {
  readonly obstacles: Obstacle[] = [];
  readonly boundary = BOUNDARY;

  blocked(x: number, z: number, radius = 0.48): boolean {
    if (Math.abs(x) > this.boundary - radius || Math.abs(z) > this.boundary - radius) return true;
    return this.obstacles.some(b => {
      const dx = x - Math.max(b.x - b.halfX, Math.min(x, b.x + b.halfX));
      const dz = z - Math.max(b.z - b.halfZ, Math.min(z, b.z + b.halfZ));
      return dx * dx + dz * dz < radius * radius;
    });
  }

  move(position: Vector3, dx: number, dz: number): void {
    // Small substeps prevent tunnelling; separate axes let players slide along walls.
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.2));
    for (let i = 0; i < steps; i++) {
      if (!this.blocked(position.x + dx / steps, position.z)) position.x += dx / steps;
      if (!this.blocked(position.x, position.z + dz / steps)) position.z += dz / steps;
    }
  }
}
