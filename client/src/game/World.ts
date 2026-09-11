import { AmbientLight, BoxGeometry, CanvasTexture, CircleGeometry, Color, ConeGeometry, CylinderGeometry, DirectionalLight, Fog, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshLambertMaterial, PlaneGeometry, Scene } from 'three';
import { Collision } from './Collision';
import { buildLandmarks } from './Landmarks';
import { LANDMARKS } from '../../../shared/constants';

export class World {
  readonly scene = new Scene();
  readonly collision = new Collision();
  private readonly materials = new Map<number, MeshLambertMaterial>();
  private readonly boxGeometry = new BoxGeometry(1, 1, 1);

  constructor() {
    this.scene.background = new Color(0xc4dce0);
    this.scene.fog = new Fog(0xc4dce0, 65, 185);
    this.scene.add(new AmbientLight(0xfff3de, 2.0));
    const sun = new DirectionalLight(0xffedd0, 2.3);
    sun.position.set(-35, 65, 30);
    this.scene.add(sun);
    const ground = new Mesh(new PlaneGeometry(640, 640), this.material(0xabc38b));
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
    this.box(0, 0.025, -13, 600, 0.05, 13, 0x818783);
    this.box(28, 0.025, 0, 13, 0.05, 216, 0x818783);
    this.box(0, 0.035, -4.8, 600, 0.07, 3, 0xe2d6b9);
    this.box(0, 0.035, -21.2, 600, 0.07, 3, 0xe2d6b9);
    this.box(19.8, 0.035, 0, 3, 0.07, 216, 0xe2d6b9);
    this.box(36.2, 0.035, 0, 3, 0.07, 216, 0xe2d6b9);
    for (let i = -290; i < 295; i += 9) {
      if (Math.abs(i - 28) > 9) this.box(i, 0.06, -13, 3, 0.02, 0.16, 0xede4cd);
      if (Math.abs(i + 13) > 9) this.box(28, 0.06, i, 0.16, 0.02, 3, 0xede4cd);
    }
    // A small central gathering lawn; detailed landmark zones arrive in Phase 2.
    const lawn = new Mesh(new CircleGeometry(15, 48), this.material(0x86b780));
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set(-3, 0.08, 14);
    this.scene.add(lawn);
    this.box(-3, 0.08, 14, 3, 0.12, 32, 0xe8d7b2);
    this.box(-3, 0.08, 14, 30, 0.12, 3, 0xe8d7b2);
    for (const [x, z] of [[-10, 7], [6, 7], [-10, 22], [6, 22]]) this.bench(x, z);
    this.sign(-8, 2.8, -2.5, 'A LITTLE DELHI', 'A LITTLE HOME', 5.5);
    this.sign(10, 2.2, 18, 'നമുക്ക് കാണാം', 'MEET. EXPLORE. CONNECT.', 4);
    const colors = [0xe2c298, 0xf0dfbc, 0xcc8f71, 0xd4a996, 0xe8cdac, 0xacc0b3];
    for (let i = 0; i < 8; i++) {
      const x = -91 + i * 23;
      if (Math.abs(x - 28) < 17) continue;
      this.building(x, -36, 15, 9 + (i % 3) * 3, 18, colors[i % colors.length]);
      if (i < 3 || i > 5) this.building(x, 40, 16, 10 + (i % 2) * 4, 17, colors[(i + 2) % colors.length]);
    }
    for (let i = 0; i < 5; i++) this.building(52, 4 + i * 22, 16, 9 + i % 3 * 2, 16, colors[i]);
    for (const x of [-272, -190, -164, 120, 155, 210, 260]) this.building(x, -37, 15, 9, 17, colors[Math.abs(x) % colors.length]);
    for (const x of [120, 149, 175]) this.building(x, -207, 15, 10, 15, 0xd4a996);
    buildLandmarks(this);
    this.trees();
    for (let x = -80; x < 100; x += 23) {
      if (Math.abs(x - 28) < 10) continue;
      this.box(x, 2.5, -4.8, 0.14, 5, 0.14, 0x49615a, true);
      this.box(x, 5, -4.8, 0.75, 0.3, 0.6, 0xf9e5ab);
    }
    // Hedges mark the playable border without an expensive physics system.
    for (const z of [-303, 303]) this.box(0, 1.2, z, 608, 2.4, 2, 0x6c946d);
    for (const x of [-303, 303]) this.box(x, 1.2, 0, 2, 2.4, 608, 0x6c946d);
    this.instanceBoxes();
  }

  material(color: number): MeshLambertMaterial {
    if (!this.materials.has(color)) this.materials.set(color, new MeshLambertMaterial({ color }));
    return this.materials.get(color)!;
  }

  box(x: number, y: number, z: number, w: number, h: number, d: number, color: number, solid = false): Mesh {
    const mesh = new Mesh(this.boxGeometry, this.material(color));
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    this.scene.add(mesh);
    if (solid) this.collision.obstacles.push({ x, z, halfX: w / 2, halfZ: d / 2, height: y + h / 2 });
    return mesh;
  }

  private building(x: number, z: number, w: number, h: number, d: number, color: number): void {
    this.box(x, h / 2, z, w, h, d, color, true);
    this.box(x, h + 0.2, z, w + 0.7, 0.4, d + 0.7, 0xf0e5ca);
    this.box(x, 0.3, z, w + 0.4, 0.6, d + 0.4, 0xb6a58c);
    for (let level = 0; level < Math.floor(h / 3); level++) {
      for (let column = -1; column <= 1; column++) {
        for (const side of [-1, 1]) this.box(x + column * 4, 2 + level * 3, z + side * (d / 2 + 0.02), 1.4, 1.7, 0.08, 0x658986);
      }
    }
    this.box(x, 2.9, z + d / 2 + 0.65, w - 1, 0.2, 1.5, 0x688f7c);
  }

  private bench(x: number, z: number): void {
    this.box(x, 0.65, z, 2.6, 0.2, 0.8, 0xa16f4e, true);
    this.box(x, 1.15, z - 0.37, 2.6, 0.7, 0.14, 0xb48058);
    for (const offset of [-0.95, 0.95]) this.box(x + offset, 0.3, z, 0.13, 0.6, 0.65, 0x4c6057);
  }

  sign(x: number, y: number, z: number, title: string, subtitle: string, width: number): void {
    const canvas = document.createElement('canvas');
    canvas.width = 768; canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#28594e'; ctx.fillRect(0, 0, 768, 256);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff2d0';
    ctx.font = 'bold 50px sans-serif'; ctx.fillText(title, 384, 112);
    ctx.font = '24px sans-serif'; ctx.fillText(subtitle, 384, 171);
    const board = new Mesh(new BoxGeometry(width, width / 3, 0.12), [this.material(0x28594e), this.material(0x28594e), this.material(0x28594e), this.material(0x28594e), new MeshBasicMaterial({ map: new CanvasTexture(canvas) }), this.material(0x28594e)]);
    board.position.set(x, y, z); this.scene.add(board);
    for (const offset of [-width * 0.35, width * 0.35]) this.box(x + offset, y / 2, z, 0.12, y, 0.12, 0x49615a, true);
  }

  private trees(): void {
    const positions: [number, number][] = [[-16, 3], [12, 3], [-17, 24], [12, 27], [-24, 13], [-9, 32]];
    for (let i = 0; i < 160; i++) {
      const x = -286 + ((i * 43) % 572);
      const z = -286 + ((i * 67) % 572);
      if (LANDMARKS.some(l => Math.hypot(x - l.x, z - l.z) < l.radius + 4) || Math.abs(z + 180) < 12 || Math.abs(x + 230) < 12 || Math.abs(x + 130) < 12 || Math.abs(x - 180) < 12) continue;
      if (Math.abs(z + 13) < 13 || Math.abs(x - 28) < 13 || (Math.abs(x) < 25 && z > -5 && z < 35) || this.collision.blocked(x, z, 3)) continue;
      positions.push([x, z]);
    }
    const trunks = new InstancedMesh(new CylinderGeometry(0.19, 0.27, 3.4, 6), this.material(0x927050), positions.length);
    const leaves = new InstancedMesh(new ConeGeometry(2.5, 5.2, 7), this.material(0x629477), positions.length);
    positions.forEach(([x, z], i) => {
      trunks.setMatrixAt(i, new Matrix4().makeTranslation(x, 1.7, z));
      leaves.setMatrixAt(i, new Matrix4().makeTranslation(x, 4.8, z));
      this.collision.obstacles.push({ x, z, halfX: 0.25, halfZ: 0.25 });
    });
    this.scene.add(trunks, leaves);
    for (const [x, z] of [[-16, 18], [13, 14]]) {
      const palm = new Group();
      const trunk = new Mesh(new CylinderGeometry(0.17, 0.3, 6, 6), this.material(0xa78a60));
      trunk.position.y = 3; palm.add(trunk);
      for (let j = 0; j < 6; j++) {
        const leaf = new Mesh(new ConeGeometry(0.62, 4, 4), this.material(0x568667));
        leaf.rotation.z = 1.25;
        const branch = new Group();
        leaf.position.x = 1.4; branch.add(leaf); branch.rotation.y = j * Math.PI / 3; branch.position.y = 6;
        palm.add(branch);
      }
      palm.position.set(x, 0, z); this.scene.add(palm);
      this.collision.obstacles.push({ x, z, halfX: 0.3, halfZ: 0.3 });
    }
  }

  private instanceBoxes(): void {
    // Hundreds of static primitive boxes become a few dozen material batches.
    const groups = new Map<MeshLambertMaterial, Mesh[]>();
    for (const child of this.scene.children) if (child instanceof Mesh && child.geometry === this.boxGeometry) {
      const material = child.material as MeshLambertMaterial;
      const group = groups.get(material) || []; group.push(child); groups.set(material, group);
    }
    for (const [material, meshes] of groups) {
      const batch = new InstancedMesh(this.boxGeometry, material, meshes.length);
      meshes.forEach((mesh, i) => { mesh.updateMatrix(); batch.setMatrixAt(i, mesh.matrix); this.scene.remove(mesh); });
      batch.computeBoundingSphere(); this.scene.add(batch);
    }
  }
}
