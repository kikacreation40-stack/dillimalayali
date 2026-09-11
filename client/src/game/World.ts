import {
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  Scene
} from 'three';
import { Collision } from './Collision';
import { buildLandmarks } from './Landmarks';
import { LANDMARKS } from '../../../shared/constants';

export class World {
  readonly scene = new Scene();
  readonly collision = new Collision();
  private readonly materials = new Map<string, MeshStandardMaterial>();
  private readonly boxGeometry = new BoxGeometry(1, 1, 1);

  constructor() {
    // Atmospheric Delhi sky and horizon haze
    this.scene.background = new Color(0xd9e5e8);
    this.scene.fog = new Fog(0xd9e5e8, 75, 230);

    // Warm Indian sky and earthy terracotta ground bounce
    const hemiLight = new HemisphereLight(0xfff5e4, 0x6e6255, 1.4);
    this.scene.add(hemiLight);

    // Realistic Sun with soft shadows tuned for the Delhi cityscape
    const sun = new DirectionalLight(0xffeed6, 2.6);
    sun.position.set(-65, 120, 55);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 340;
    const shadowDist = 180;
    sun.shadow.camera.left = -shadowDist;
    sun.shadow.camera.right = shadowDist;
    sun.shadow.camera.top = shadowDist;
    sun.shadow.camera.bottom = -shadowDist;
    sun.shadow.bias = -0.0003;
    this.scene.add(sun);

    // Base manicured terrain (rich Delhi garden turf)
    const ground = new Mesh(new PlaneGeometry(640, 640), this.material(0x5a7d52, 0.9, 0.05));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Paved Delhi road network (Asphalt, curbs, sidewalks, and lane markings)
    this.buildRoads();

    // Central gathering lawn & promenade
    const centralLawn = new Mesh(new CircleGeometry(16, 48), this.material(0x65915d, 0.85, 0.05));
    centralLawn.rotation.x = -Math.PI / 2;
    centralLawn.position.set(-3, 0.08, 14);
    centralLawn.receiveShadow = true;
    this.scene.add(centralLawn);

    // Stone promenade walkways through the park
    this.box(-3, 0.08, 14, 3.2, 0.12, 33, 0xded2be, false, 0.7);
    this.box(-3, 0.08, 14, 31, 0.12, 3.2, 0xded2be, false, 0.7);

    // Teak and wrought-iron park benches
    for (const [x, z] of [[-10, 7], [6, 7], [-10, 22], [6, 22]]) this.bench(x, z);

    // Decorative Delhi welcoming signs
    this.sign(-8, 2.8, -2.5, 'A LITTLE DELHI', 'A LITTLE HOME · ഡൽഹി മലയാളി', 5.5);
    this.sign(10, 2.2, 18, 'നമുക്ക് കാണാം', 'MEET · EXPLORE · CONNECT', 4.2);

    // Surrounding Delhi urban architecture (Lutyens & modern Dholpur sandstone buildings)
    const cityColors = [0xdfbe96, 0xebd9be, 0xc98767, 0xd8ab92, 0xe4cdad, 0x9fb6a6];
    for (let i = 0; i < 8; i++) {
      const x = -91 + i * 23;
      if (Math.abs(x - 28) < 17) continue;
      this.delhiBuilding(x, -36, 15, 9 + (i % 3) * 3, 18, cityColors[i % cityColors.length]);
      if (i < 3 || i > 5) this.delhiBuilding(x, 40, 16, 10 + (i % 2) * 4, 17, cityColors[(i + 2) % cityColors.length]);
    }
    for (let i = 0; i < 5; i++) this.delhiBuilding(52, 4 + i * 22, 16, 9 + (i % 3) * 2, 16, cityColors[i]);
    for (const x of [-272, -190, -164, 120, 155, 210, 260]) this.delhiBuilding(x, -37, 15, 9, 17, cityColors[Math.abs(x) % cityColors.length]);
    for (const x of [120, 149, 175]) this.delhiBuilding(x, -207, 15, 10, 15, 0xd8ab92);

    // Build the prominent Delhi monuments and Kerala Hub
    buildLandmarks(this);

    // Authentic Delhi trees (Gulmohar with orange blossoms, Neem, and Kerala Coconut palms)
    this.trees();

    // Heritage Delhi streetlights with warm lantern glow
    for (let x = -80; x < 100; x += 22) {
      if (Math.abs(x - 28) < 10) continue;
      this.heritageStreetlamp(x, -4.8);
      this.heritageStreetlamp(x, -21.2);
    }

    // Border perimeter hedges
    for (const z of [-303, 303]) this.box(0, 1.2, z, 608, 2.4, 2, 0x4f704e, false, 0.9);
    for (const x of [-303, 303]) this.box(x, 1.2, 0, 2, 2.4, 608, 0x4f704e, false, 0.9);

    this.instanceBoxes();
  }

  material(color: number, roughness = 0.75, metalness = 0.1): MeshStandardMaterial {
    const key = `${color}_${roughness}_${metalness}`;
    if (!this.materials.has(key)) {
      this.materials.set(key, new MeshStandardMaterial({ color, roughness, metalness }));
    }
    return this.materials.get(key)!;
  }

  box(x: number, y: number, z: number, w: number, h: number, d: number, color: number, solid = false, roughness = 0.75, metalness = 0.1): Mesh {
    const mesh = new Mesh(this.boxGeometry, this.material(color, roughness, metalness));
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    if (solid) this.collision.obstacles.push({ x, z, halfX: w / 2, halfZ: d / 2, height: y + h / 2 });
    return mesh;
  }

  cylinder(x: number, y: number, z: number, rTop: number, rBottom: number, h: number, color: number, solid = false, segments = 14, roughness = 0.75, metalness = 0.1): Mesh {
    const m = new Mesh(new CylinderGeometry(rTop, rBottom, h, segments), this.material(color, roughness, metalness));
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    this.scene.add(m);
    if (solid) this.collision.obstacles.push({ x, z, halfX: Math.max(rTop, rBottom), halfZ: Math.max(rTop, rBottom) });
    return m;
  }

  addPointLight(x: number, y: number, z: number, color: number, intensity: number, distance: number): PointLight {
    const light = new PointLight(color, intensity, distance);
    light.position.set(x, y, z);
    this.scene.add(light);
    return light;
  }

  private buildRoads(): void {
    const asphalt = 0x323739;
    const curbColor = 0xb4a999;
    const sidewalkColor = 0xd5cbba;
    const roadMarking = 0xf5f2eb;
    const yellowLine = 0xf5c338;

    // East-West Central Expressway
    this.box(0, 0.025, -13, 600, 0.05, 13.4, asphalt, false, 0.85);
    // North-South Arterial Avenue
    this.box(28, 0.025, 0, 13.4, 0.05, 216, asphalt, false, 0.85);

    // Raised concrete curbs
    this.box(0, 0.05, -6.2, 600, 0.08, 0.4, curbColor, false, 0.8);
    this.box(0, 0.05, -19.8, 600, 0.08, 0.4, curbColor, false, 0.8);
    this.box(21.2, 0.05, 0, 0.4, 0.08, 216, curbColor, false, 0.8);
    this.box(34.8, 0.05, 0, 0.4, 0.08, 216, curbColor, false, 0.8);

    // Paved pedestrian sidewalks with tactile paver edge
    this.box(0, 0.038, -4.6, 600, 0.07, 2.8, sidewalkColor, false, 0.7);
    this.box(0, 0.038, -21.4, 600, 0.07, 2.8, sidewalkColor, false, 0.7);
    this.box(19.6, 0.038, 0, 2.8, 0.07, 216, sidewalkColor, false, 0.7);
    this.box(36.4, 0.038, 0, 2.8, 0.07, 216, sidewalkColor, false, 0.7);

    // Yellow continuous edge safety lines
    this.box(0, 0.06, -6.6, 600, 0.02, 0.15, yellowLine, false, 0.6);
    this.box(0, 0.06, -19.4, 600, 0.02, 0.15, yellowLine, false, 0.6);
    this.box(21.6, 0.06, 0, 0.15, 0.02, 216, yellowLine, false, 0.6);
    this.box(34.4, 0.06, 0, 0.15, 0.02, 216, yellowLine, false, 0.6);

    // White dashed center lane lines along roads
    for (let i = -290; i < 295; i += 8) {
      if (Math.abs(i - 28) > 11) this.box(i, 0.06, -13, 3.8, 0.02, 0.22, roadMarking, false, 0.6);
      if (Math.abs(i + 13) > 11) this.box(28, 0.06, i, 0.22, 0.02, 3.8, roadMarking, false, 0.6);
    }

    // Realistic Zebra Crossings at the central intersection
    for (let j = -5.6; j <= 5.6; j += 1.4) {
      this.box(18, 0.06, -13 + j, 2.8, 0.02, 0.65, roadMarking, false, 0.6);
      this.box(38, 0.06, -13 + j, 2.8, 0.02, 0.65, roadMarking, false, 0.6);
      this.box(28 + j, 0.06, -3, 0.65, 0.02, 2.8, roadMarking, false, 0.6);
      this.box(28 + j, 0.06, -23, 0.65, 0.02, 2.8, roadMarking, false, 0.6);
    }
  }

  private delhiBuilding(x: number, z: number, w: number, h: number, d: number, color: number): void {
    // Sandstone main structure
    this.box(x, h / 2, z, w, h, d, color, true, 0.75, 0.05);
    // Classical roof parapet & molded cornices
    this.box(x, h + 0.35, z, w + 0.8, 0.5, d + 0.8, 0xf2e8d3, false, 0.7);
    this.box(x, 0.35, z, w + 0.5, 0.7, d + 0.5, 0xa9967f, false, 0.8);
    // Overhanging shade balconies and dark glass windows
    for (let level = 0; level < Math.floor(h / 3); level++) {
      for (let column = -1; column <= 1; column++) {
        for (const side of [-1, 1]) {
          // Glass window
          this.box(x + column * 4, 2.1 + level * 3, z + side * (d / 2 + 0.03), 1.5, 1.8, 0.08, 0x36484e, false, 0.2, 0.6);
          // Stone window sill and lintel
          this.box(x + column * 4, 1.1 + level * 3, z + side * (d / 2 + 0.15), 1.8, 0.15, 0.35, 0xf2e8d3, false, 0.7);
          this.box(x + column * 4, 3.1 + level * 3, z + side * (d / 2 + 0.15), 1.8, 0.18, 0.4, 0xf2e8d3, false, 0.7);
        }
      }
    }
    // Ground floor entrance awning
    this.box(x, 2.9, z + d / 2 + 0.7, w - 1.2, 0.22, 1.6, 0x4f6c5e, false, 0.7);
    // Rooftop water tank (Sintex black tank typical in Delhi)
    this.cylinder(x + w * 0.28, h + 1.2, z - d * 0.25, 0.8, 0.8, 1.4, 0x1f2122, false, 12, 0.5);
  }

  private bench(x: number, z: number): void {
    // Teak wooden slatted seat
    this.box(x, 0.65, z, 2.6, 0.16, 0.85, 0x935f3d, true, 0.6, 0.05);
    // Wooden backrest
    this.box(x, 1.18, z - 0.38, 2.6, 0.72, 0.14, 0xa56e48, false, 0.6, 0.05);
    // Cast iron ornate black legs
    for (const offset of [-0.96, 0.96]) {
      this.box(x + offset, 0.32, z, 0.14, 0.64, 0.7, 0x27302c, false, 0.4, 0.7);
    }
  }

  heritageStreetlamp(x: number, z: number): void {
    // Cast iron stepped base and fluted pole
    this.cylinder(x, 0.4, z, 0.24, 0.34, 0.8, 0x222c28, true, 10, 0.4, 0.7);
    this.cylinder(x, 2.8, z, 0.08, 0.12, 4.2, 0x222c28, true, 10, 0.4, 0.7);
    // Decorative scrolled top bracket
    this.box(x, 5.0, z, 0.9, 0.12, 0.16, 0x222c28, false, 0.4, 0.7);
    // Glowing warm glass lantern
    const lantern = new Mesh(new CylinderGeometry(0.25, 0.18, 0.5, 8), this.material(0xffefa8, 0.2, 0.1));
    (lantern.material as MeshStandardMaterial).emissive = new Color(0xffdf88);
    (lantern.material as MeshStandardMaterial).emissiveIntensity = 0.9;
    lantern.position.set(x, 5.2, z);
    this.scene.add(lantern);
  }

  sign(x: number, y: number, z: number, title: string, subtitle: string, width: number): void {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Rich forest green enamel Delhi signage with gold border
    const gradient = ctx.createLinearGradient(0, 0, 768, 256);
    gradient.addColorStop(0, '#193f35');
    gradient.addColorStop(1, '#0e2b24');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 768, 256);

    ctx.strokeStyle = '#e6c875';
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, 744, 232);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff6de';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(title, 384, 108);

    ctx.fillStyle = '#e8d4a2';
    ctx.font = '22px sans-serif';
    ctx.fillText(subtitle, 384, 172);

    const texture = new CanvasTexture(canvas);
    const boardMat = new MeshStandardMaterial({ map: texture, roughness: 0.35, metalness: 0.2 });
    const edgeMat = this.material(0x193f35, 0.5, 0.3);

    const board = new Mesh(new BoxGeometry(width, width / 3.1, 0.12), [edgeMat, edgeMat, edgeMat, edgeMat, boardMat, edgeMat]);
    board.position.set(x, y, z);
    board.castShadow = true;
    this.scene.add(board);

    // Twin black steel mounting posts
    for (const offset of [-width * 0.36, width * 0.36]) {
      this.box(x + offset, y / 2, z, 0.12, y, 0.12, 0x26302c, true, 0.4, 0.6);
    }
  }

  private trees(): void {
    const positions: [number, number][] = [[-16, 3], [12, 3], [-17, 24], [12, 27], [-24, 13], [-9, 32]];
    for (let i = 0; i < 170; i++) {
      const x = -286 + ((i * 43) % 572);
      const z = -286 + ((i * 67) % 572);
      if (LANDMARKS.some(l => Math.hypot(x - l.x, z - l.z) < l.radius + 4) || Math.abs(z + 180) < 13 || Math.abs(x + 230) < 13 || Math.abs(x + 130) < 13 || Math.abs(x - 180) < 13) continue;
      if (Math.abs(z + 13) < 14 || Math.abs(x - 28) < 14 || (Math.abs(x) < 25 && z > -5 && z < 35) || this.collision.blocked(x, z, 3)) continue;
      positions.push([x, z]);
    }

    // Diverse tree varieties:
    // 1. Gulmohar with vibrant orange-red flower blossoms
    // 2. Leafy Delhi Neem / Peepal trees
    // 3. Kerala Coconut Palms in community zones
    const gulmoharMat = this.material(0xd94c2e, 0.8, 0.05); // Orange-red blossoms
    const neemMat = this.material(0x3e6e44, 0.85, 0.05); // Leafy Neem
    const trunkMat = this.material(0x5a4230, 0.9, 0.05);

    positions.forEach(([x, z], i) => {
      const isGulmohar = i % 3 === 0;
      const heightVar = 0.9 + (i % 5) * 0.12;

      // Realistic tapered tree trunk
      const trunk = new Mesh(new CylinderGeometry(0.24, 0.42, 3.6 * heightVar, 8), trunkMat);
      trunk.position.set(x, 1.8 * heightVar, z);
      trunk.castShadow = true;
      this.scene.add(trunk);
      this.collision.obstacles.push({ x, z, halfX: 0.35, halfZ: 0.35 });

      if (isGulmohar) {
        // Sprawling canopy with orange flowers
        const canopy1 = new Mesh(new ConeGeometry(3.6, 3.8 * heightVar, 8), gulmoharMat);
        canopy1.position.set(x, 4.4 * heightVar, z);
        canopy1.castShadow = true;
        const canopy2 = new Mesh(new ConeGeometry(2.4, 2.6 * heightVar, 7), this.material(0xe6613d, 0.8, 0.05));
        canopy2.position.set(x, 5.8 * heightVar, z);
        canopy2.castShadow = true;
        this.scene.add(canopy1, canopy2);
      } else {
        // Lush green Neem canopy
        const canopy = new Mesh(new ConeGeometry(3.2, 5.0 * heightVar, 8), neemMat);
        canopy.position.set(x, 4.6 * heightVar, z);
        canopy.castShadow = true;
        this.scene.add(canopy);
      }
    });

    // Tall graceful Kerala Coconut Palms near the Malayali Hub & Park
    const palmLocations: [number, number][] = [[-16, 18], [13, 14], [-22, 28], [7, 28], [-4, 38]];
    for (const [x, z] of palmLocations) {
      const palm = new Group();
      // Curved trunk
      const trunk = new Mesh(new CylinderGeometry(0.18, 0.32, 6.8, 8), this.material(0x8a6e50, 0.85));
      trunk.position.y = 3.4;
      trunk.rotation.z = 0.08;
      trunk.castShadow = true;
      palm.add(trunk);

      // Coconut bunch
      for (let c = 0; c < 4; c++) {
        const coconut = new Mesh(new CylinderGeometry(0.15, 0.15, 0.22, 6), this.material(0x564128, 0.8));
        coconut.position.set(Math.cos(c * 1.5) * 0.3, 6.2, Math.sin(c * 1.5) * 0.3);
        palm.add(coconut);
      }

      // Arching palm fronds
      for (let j = 0; j < 8; j++) {
        const leaf = new Mesh(new ConeGeometry(0.65, 4.4, 5), this.material(0x3b6e47, 0.75));
        leaf.rotation.z = 1.32;
        const branch = new Group();
        leaf.position.x = 1.6;
        branch.add(leaf);
        branch.rotation.y = (j * Math.PI) / 4;
        branch.position.y = 6.6;
        palm.add(branch);
      }
      palm.position.set(x, 0, z);
      this.scene.add(palm);
      this.collision.obstacles.push({ x, z, halfX: 0.35, halfZ: 0.35 });
    }
  }

  private instanceBoxes(): void {
    // Hundreds of static primitive boxes become a few dozen material batches for 60 FPS performance.
    const groups = new Map<MeshStandardMaterial, Mesh[]>();
    for (const child of this.scene.children) {
      if (child instanceof Mesh && child.geometry === this.boxGeometry) {
        const material = child.material as MeshStandardMaterial;
        const group = groups.get(material) || [];
        group.push(child);
        groups.set(material, group);
      }
    }
    for (const [material, meshes] of groups) {
      const batch = new InstancedMesh(this.boxGeometry, material, meshes.length);
      batch.castShadow = true;
      batch.receiveShadow = true;
      meshes.forEach((mesh, i) => {
        mesh.updateMatrix();
        batch.setMatrixAt(i, mesh.matrix);
        this.scene.remove(mesh);
      });
      batch.computeBoundingSphere();
      this.scene.add(batch);
    }
  }
}
