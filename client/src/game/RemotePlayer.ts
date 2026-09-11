import { Vector3 } from 'three';
import { Player } from './Player';
import type { PlayerState } from '../../../shared/types';

export class RemotePlayer extends Player {
  private readonly target = new Vector3();
  state: PlayerState;
  constructor(state: PlayerState) {
    super(state.color, state.avatar); this.state = state;
    this.receive(state); this.mesh.position.copy(this.target);
  }
  receive(state: PlayerState): void {
    this.state = state; this.setAvatar(state.avatar); this.target.set(state.x, 0.06, state.z);
    if (this.mesh.position.distanceToSquared(this.target) > 400) { this.mesh.position.copy(this.target); this.mesh.rotation.y = state.rotation; }
  }
  update(dt: number): void {
    const moving = this.mesh.position.distanceToSquared(this.target) > 0.002;
    this.mesh.position.lerp(this.target, 1 - Math.exp(-14 * dt));
    const d = this.state.rotation - this.mesh.rotation.y;
    this.mesh.rotation.y += Math.atan2(Math.sin(d), Math.cos(d)) * (1 - Math.exp(-14 * dt));
    this.mesh.visible = !this.state.vehicleId;
    this.animate(dt, moving, false);
  }
  dispose(): void {
    this.mesh.removeFromParent();
    this.disposeGeometry();
  }
}
