import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import type { VehicleState } from '../../../shared/types';

export class Vehicle {
  readonly mesh = new Group();
  state: VehicleState;

  constructor(state: VehicleState) {
    this.state = state;
    const auto = state.kind === 'auto';

    // Authentic Delhi CNG Auto-Rickshaw colors: dark green bottom + bright canary yellow canopy
    const greenBody = new MeshStandardMaterial({ color: 0x1d663b, roughness: 0.45, metalness: 0.15 });
    const yellowRoof = new MeshStandardMaterial({ color: 0xf5bf26, roughness: 0.35, metalness: 0.1 });
    const carBody = new MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.3, metalness: 0.25 }); // Delhi cab
    const carStripe = new MeshStandardMaterial({ color: 0x228b58, roughness: 0.4, metalness: 0.1 });
    const darkChassis = new MeshStandardMaterial({ color: 0x242728, roughness: 0.8, metalness: 0.3 });
    const chrome = new MeshStandardMaterial({ color: 0xd8dde0, roughness: 0.15, metalness: 0.85 });
    const glass = new MeshStandardMaterial({ color: 0x8aa8af, roughness: 0.1, metalness: 0.6, transparent: true, opacity: 0.75 });
    const headlampMat = new MeshStandardMaterial({ color: 0xfffae0, emissive: 0xfff2aa, emissiveIntensity: 0.85, roughness: 0.2 });
    const taillampMat = new MeshStandardMaterial({ color: 0xcc2222, emissive: 0xaa1111, emissiveIntensity: 0.7, roughness: 0.3 });

    const box = (w: number, h: number, d: number, x: number, y: number, z: number, mat: MeshStandardMaterial) => {
      const m = new Mesh(new BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      this.mesh.add(m);
      return m;
    };

    if (auto) {
      // Main lower cabin (Green)
      box(1.5, 0.75, 2.0, 0, 0.75, -0.15, greenBody);
      // Yellow decorative accent strip
      box(1.52, 0.08, 1.95, 0, 1.08, -0.15, yellowRoof);
      // Front tapered nose / cowl
      box(0.95, 0.72, 0.9, 0, 0.74, 0.95, greenBody);
      // Front windshield frame & glass
      box(1.35, 0.7, 0.06, 0, 1.55, 0.65, glass);
      // Roof canopy with curved profile (Yellow)
      box(1.48, 0.12, 2.15, 0, 2.05, -0.05, yellowRoof);
      box(1.42, 0.08, 1.95, 0, 2.12, -0.05, yellowRoof);
      // Thin black roof pillars
      for (const x of [-0.68, 0.68]) {
        box(0.06, 1.05, 0.06, x, 1.52, -1.0, darkChassis);
        box(0.06, 1.05, 0.06, x, 1.52, 0.6, darkChassis);
      }
      // Black passenger bench seat
      box(1.3, 0.38, 0.65, 0, 0.88, -0.65, darkChassis);
      // Driver seat & handlebar
      box(0.55, 0.38, 0.45, 0, 0.88, 0.25, darkChassis);
      box(0.7, 0.05, 0.05, 0, 1.25, 0.6, chrome);
      // Yellow fare meter box
      box(0.18, 0.14, 0.12, 0.32, 1.28, 0.65, yellowRoof);
      // Iconic central round headlamp
      const headlamp = new Mesh(new CylinderGeometry(0.16, 0.16, 0.1, 14), headlampMat);
      headlamp.rotation.x = Math.PI / 2;
      headlamp.position.set(0, 0.86, 1.42);
      this.mesh.add(headlamp);
      const bezel = new Mesh(new CylinderGeometry(0.19, 0.19, 0.06, 14), chrome);
      bezel.rotation.x = Math.PI / 2;
      bezel.position.set(0, 0.86, 1.38);
      this.mesh.add(bezel);
      // Dual rear taillights
      box(0.18, 0.1, 0.04, -0.58, 0.72, -1.16, taillampMat);
      box(0.18, 0.1, 0.04, 0.58, 0.72, -1.16, taillampMat);
      // Front mudguard
      box(0.32, 0.25, 0.45, 0, 0.52, 1.08, yellowRoof);

      // 3 Wheels (1 front centered, 2 rear)
      const wheels: [number, number][] = [[0, 1.08], [-0.74, -0.72], [0.74, -0.72]];
      for (const [x, z] of wheels) {
        const tire = new Mesh(new CylinderGeometry(0.32, 0.32, 0.18, 14), darkChassis);
        tire.rotation.z = Math.PI / 2;
        tire.position.set(x, 0.32, z);
        tire.castShadow = true;
        this.mesh.add(tire);
        const rim = new Mesh(new CylinderGeometry(0.16, 0.16, 0.19, 10), chrome);
        rim.rotation.z = Math.PI / 2;
        rim.position.set(x, 0.32, z);
        this.mesh.add(rim);
      }
    } else {
      // Modern Delhi Sedan / Taxi
      box(1.7, 0.65, 3.4, 0, 0.68, 0, carBody);
      box(1.72, 0.08, 3.42, 0, 0.65, 0, carStripe);
      box(1.45, 0.55, 1.9, 0, 1.25, -0.2, carBody);
      box(1.35, 0.5, 0.05, 0, 1.22, 0.8, glass); // windshield
      box(1.35, 0.48, 0.05, 0, 1.22, -1.18, glass); // rear window
      for (const x of [-0.73, 0.73]) {
        box(0.04, 0.45, 1.7, x, 1.22, -0.2, glass); // side windows
        box(0.16, 0.1, 0.15, x, 0.98, 0.65, carBody); // side mirrors
      }
      box(1.4, 0.06, 1.7, 0, 1.55, -0.2, carBody); // roof
      // Headlights & Taillights
      box(0.28, 0.14, 0.04, -0.62, 0.72, 1.71, headlampMat);
      box(0.28, 0.14, 0.04, 0.62, 0.72, 1.71, headlampMat);
      box(0.3, 0.14, 0.04, -0.62, 0.74, -1.71, taillampMat);
      box(0.3, 0.14, 0.04, 0.62, 0.74, -1.71, taillampMat);
      // 4 Wheels
      for (const [x, z] of [[-0.82, 1.05], [0.82, 1.05], [-0.82, -1.05], [0.82, -1.05]]) {
        const tire = new Mesh(new CylinderGeometry(0.35, 0.35, 0.22, 14), darkChassis);
        tire.rotation.z = Math.PI / 2;
        tire.position.set(x, 0.35, z);
        tire.castShadow = true;
        this.mesh.add(tire);
        const rim = new Mesh(new CylinderGeometry(0.18, 0.18, 0.23, 10), chrome);
        rim.rotation.z = Math.PI / 2;
        rim.position.set(x, 0.35, z);
        this.mesh.add(rim);
      }
    }

    this.mesh.position.set(state.x, 0.06, state.z);
    this.mesh.rotation.y = state.rotation;
  }

  update(dt: number): void {
    const t = 1 - Math.exp(-14 * dt);
    this.mesh.position.x += (this.state.x - this.mesh.position.x) * t;
    this.mesh.position.z += (this.state.z - this.mesh.position.z) * t;
    const d = this.state.rotation - this.mesh.rotation.y;
    this.mesh.rotation.y += Math.atan2(Math.sin(d), Math.cos(d)) * t;
  }
}
