import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshLambertMaterial } from 'three';
import type { VehicleState } from '../../../shared/types';

export class Vehicle {
  readonly mesh = new Group();
  state: VehicleState;
  constructor(state: VehicleState) {
    this.state = state;
    const auto = state.kind === 'auto';
    const body = new MeshLambertMaterial({ color: auto ? 0x488764 : 0xcb7962 });
    const roof = new MeshLambertMaterial({ color: auto ? 0xe6bd5c : 0xcb7962 });
    const dark = new MeshLambertMaterial({ color: 0x344744 });
    const glass = new MeshLambertMaterial({ color: 0xaccdcb });
    const box = (w: number, h: number, d: number, x: number, y: number, z: number, material: MeshLambertMaterial) => {
      const m = new Mesh(new BoxGeometry(w, h, d), material); m.position.set(x, y, z); this.mesh.add(m);
    };
    box(1.65, 0.75, auto ? 2.3 : 3.2, 0, 0.78, 0, body);
    box(1.55, 0.15, 1.8, 0, 2.15, -0.15, roof);
    box(1.4, 0.75, 0.08, 0, 1.63, 0.75, glass);
    for (const x of [-0.7, 0.7]) { box(0.12, 1.15, 0.12, x, 1.55, -0.9, dark); box(0.12, 1.15, 0.12, x, 1.55, 0.7, dark); }
    if (!auto) { box(1.5, 0.7, 0.08, 0, 1.6, -1, glass); box(0.08, 0.7, 1.6, -0.76, 1.6, -0.12, glass); box(0.08, 0.7, 1.6, 0.76, 1.6, -0.12, glass); }
    else box(1.2, 0.4, 0.7, 0, 1.1, -0.55, dark);
    const wheels = auto ? [[0, 1], [-0.83, -0.8], [0.83, -0.8]] : [[-0.83, 1.1], [0.83, 1.1], [-0.83, -1.1], [0.83, -1.1]];
    for (const [x, z] of wheels) { const m = new Mesh(new CylinderGeometry(0.36, 0.36, 0.22, 10), dark); m.rotation.z = Math.PI / 2; m.position.set(x, 0.4, z); this.mesh.add(m); }
    this.mesh.position.set(state.x, 0.06, state.z); this.mesh.rotation.y = state.rotation;
  }
  update(dt: number): void {
    const t = 1 - Math.exp(-14 * dt);
    this.mesh.position.x += (this.state.x - this.mesh.position.x) * t;
    this.mesh.position.z += (this.state.z - this.mesh.position.z) * t;
    const d = this.state.rotation - this.mesh.rotation.y;
    this.mesh.rotation.y += Math.atan2(Math.sin(d), Math.cos(d)) * t;
  }
}
