import { Box3, MathUtils, PerspectiveCamera, Ray, Vector3 } from 'three';
import type { Collision } from './Collision';

export class CameraController {
  yaw = 0;
  private pitch = 0.44;
  private distance = 10;
  private dragging = false;
  private pointer = -1;
  private lastX = 0;
  private lastY = 0;
  enabled = false;
  private readonly target = new Vector3();
  private readonly desired = new Vector3();
  private readonly ray = new Ray();
  private readonly hit = new Vector3();
  private readonly walls: Box3[];

  constructor(readonly camera: PerspectiveCamera, canvas: HTMLCanvasElement, collision: Collision) {
    this.walls = collision.obstacles.filter(b => b.halfX > 0.6 && b.halfZ > 0.6).map(b => new Box3(new Vector3(b.x - b.halfX, 0, b.z - b.halfZ), new Vector3(b.x + b.halfX, b.height ?? 7, b.z + b.halfZ)));
    canvas.addEventListener('pointerdown', e => {
      if (!this.enabled) return;
      this.dragging = true; this.pointer = e.pointerId; this.lastX = e.clientX; this.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      if (!this.dragging || !this.enabled || e.pointerId !== this.pointer) return;
      this.yaw -= (e.clientX - this.lastX) * 0.005;
      this.pitch = MathUtils.clamp(this.pitch + (e.clientY - this.lastY) * 0.004, 0.16, 1.1);
      this.lastX = e.clientX; this.lastY = e.clientY;
    });
    canvas.addEventListener('pointerup', () => this.dragging = false);
    canvas.addEventListener('pointercancel', () => this.dragging = false);
    window.addEventListener('blur', () => this.dragging = false);
    canvas.addEventListener('wheel', e => {
      if (!this.enabled) return;
      e.preventDefault();
      this.distance = MathUtils.clamp(this.distance + e.deltaY * 0.012, 5, 16);
    }, { passive: false });
  }

  update(position: Vector3, dt: number): void {
    this.target.copy(position).y += 1.2;
    this.desired.set(
      position.x + Math.sin(this.yaw) * Math.cos(this.pitch) * this.distance,
      this.target.y + Math.sin(this.pitch) * this.distance,
      position.z + Math.cos(this.yaw) * Math.cos(this.pitch) * this.distance,
    );
    this.camera.position.lerp(this.desired, 1 - Math.exp(-7 * dt));
    this.ray.origin.copy(this.target); this.ray.direction.copy(this.camera.position).sub(this.target).normalize();
    let distance = this.camera.position.distanceTo(this.target);
    for (const wall of this.walls) if (this.ray.intersectBox(wall, this.hit)) distance = Math.min(distance, Math.max(0.6, this.hit.distanceTo(this.target) - 0.35));
    this.camera.position.copy(this.target).addScaledVector(this.ray.direction, distance);
    this.camera.lookAt(this.target);
  }

  snapTo(position: Vector3): void { this.update(position, 10); }
}
