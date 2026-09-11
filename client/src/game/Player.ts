import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshLambertMaterial } from 'three';
import type { AvatarStyle } from '../../../shared/types';

export class Player {
  readonly mesh = new Group();
  private readonly limbs: Group[] = [];
  private time = 0;
  private readonly femaleDetails = new Group();

  constructor(color = 0xe99854, avatar: AvatarStyle = 'male') {
    const shirt = new MeshLambertMaterial({ color });
    const skin = new MeshLambertMaterial({ color: 0xba815e });
    const trousers = new MeshLambertMaterial({ color: 0x304b52 });
    const hair = new MeshLambertMaterial({ color: 0x302f2a });
    const box = (w: number, h: number, d: number, y: number, material: MeshLambertMaterial) => {
      const mesh = new Mesh(new BoxGeometry(w, h, d), material);
      mesh.position.y = y;
      return mesh;
    };
    this.mesh.add(box(0.64, 0.73, 0.36, 1.18, shirt), box(0.44, 0.46, 0.43, 1.79, skin), box(0.46, 0.15, 0.45, 2.03, hair));
    this.femaleDetails.name = 'female-details';
    const longHair = box(0.48, 0.63, 0.16, 1.71, hair);
    longHair.position.z = -0.2;
    const ponytail = box(0.22, 0.45, 0.23, 1.48, hair);
    ponytail.position.z = -0.32;
    const tunic = new Mesh(new CylinderGeometry(0.32, 0.43, 0.55, 6), shirt);
    tunic.position.y = 0.83; tunic.scale.z = 0.7;
    this.femaleDetails.add(longHair, ponytail, tunic); this.mesh.add(this.femaleDetails);
    this.setAvatar(avatar);
    for (const side of [-1, 1]) {
      const arm = new Group();
      arm.position.set(side * 0.44, 1.49, 0);
      arm.add(box(0.2, 0.36, 0.28, -0.13, shirt), box(0.17, 0.34, 0.23, -0.46, skin));
      const leg = new Group();
      leg.position.set(side * 0.18, 0.83, 0);
      leg.add(box(0.25, 0.69, 0.28, -0.33, trousers), box(0.26, 0.14, 0.4, -0.74, hair));
      this.mesh.add(arm, leg);
      this.limbs.push(arm, leg);
    }
    this.mesh.position.set(0, 0.06, 11);
  }

  setAvatar(avatar: AvatarStyle): void { this.femaleDetails.visible = avatar === 'female'; }

  setColor(color: number): void {
    this.mesh.traverse(object => {
      if (object instanceof Mesh && object.geometry instanceof BoxGeometry && object.geometry.parameters.height === 0.73) (object.material as MeshLambertMaterial).color.setHex(color);
    });
  }
  disposeGeometry(): void {
    const materials = new Set<MeshLambertMaterial>();
    this.mesh.traverse(object => {
      if (object instanceof Mesh) { object.geometry.dispose(); if (!Array.isArray(object.material)) materials.add(object.material as MeshLambertMaterial); }
    });
    materials.forEach(m => m.dispose());
  }
  animate(dt: number, moving: boolean, running: boolean): void {
    this.time += dt * (running ? 13 : 8);
    this.limbs.forEach((limb, i) => {
      const target = moving ? Math.sin(this.time + (i === 0 || i === 3 ? 0 : Math.PI)) * (running ? 0.8 : 0.5) : 0;
      limb.rotation.x += (target - limb.rotation.x) * (1 - Math.exp(-15 * dt));
    });
  }
}
