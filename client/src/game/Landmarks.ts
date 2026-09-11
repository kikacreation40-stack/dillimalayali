import { CylinderGeometry, Mesh, TorusGeometry } from 'three';
import type { World } from './World';
import { LANDMARKS } from '../../../shared/constants';

export function buildLandmarks(world: World): void {
  const box = world.box.bind(world);
  const sign = world.sign.bind(world);
  const cylinder = (x: number, z: number, r: number, h: number, color: number) => {
    const m = new Mesh(new CylinderGeometry(r, r, h, 10), world.material(color));
    m.position.set(x, h / 2, z); world.scene.add(m);
    world.collision.obstacles.push({ x, z, halfX: r, halfZ: r });
  };
  // Wide connected avenues, with a few bends between distinct landmark plazas.
  for (const [x, z, w, d] of [[-230, 30, 12, 98], [-130, -50, 12, 80], [28, -98, 12, 172], [125, -180, 206, 12], [180, 31, 12, 98]]) {
    box(x, 0.035, z, w + 4, 0.05, d + 4, 0xe2d6b9);
    box(x, 0.06, z, w, 0.05, d, 0x818783);
  }
  // India Gate: two piers, a true open arch, and layered sandstone cornices.
  for (const x of [-236, -224]) box(x, 5, 70, 4, 10, 5, 0xd9b789, true);
  const arch = new Mesh(new TorusGeometry(4, 1.2, 4, 16, Math.PI), world.material(0xd9b789));
  arch.position.set(-230, 8, 70); world.scene.add(arch);
  box(-230, 13, 70, 16, 2, 6, 0xd9b789);
  box(-230, 14.4, 70, 18, 0.8, 7, 0xebc998);
  sign(-230, 15, 73.6, 'INDIA GATE', 'DELHI MALAYALI WORLD', 7);
  // Red Fort: an open central gateway framed by walls and crenellated towers.
  for (const x of [203, 237]) box(x, 5, -199, 24, 10, 5, 0xad5e4b, true);
  box(220, 10, -199, 12, 3, 5, 0xad5e4b);
  for (const x of [190, 210, 230, 250]) {
    cylinder(x, -199, 3.6, 13, 0xb56852);
    for (let j = 0; j < 6; j++) box(x + Math.cos(j * Math.PI / 3) * 3, 13.5, -199 + Math.sin(j * Math.PI / 3) * 3, 1.3, 1.5, 1.3, 0xad5e4b);
  }
  for (let x = 193; x < 249; x += 4) if (Math.abs(x - 220) > 6) box(x, 10.5, -199, 1.5, 1.5, 5, 0xad5e4b);
  // CP: a broken circular arcade, keeping wide entrances in four directions.
  for (let i = 0; i < 16; i++) {
    if (i % 4 === 0) continue;
    const a = i * Math.PI / 8;
    const x = -130 + Math.cos(a) * 27, z = -80 + Math.sin(a) * 27;
    box(x, 4, z, 8, 8, 8, 0xece7cf, true);
    box(x, 8.5, z, 10, 1, 10, 0xf7eed8);
    cylinder(-130 + Math.cos(a) * 21.5, -80 + Math.sin(a) * 21.5, 0.65, 6, 0xf7eed8);
  }
  // Market lane with colorful shop awnings and walkable central road.
  for (let i = 0; i < 6; i++) for (const side of [-1, 1]) {
    const x = 40 + i * 10, z = -180 + side * 17;
    box(x, 3, z, 8, 6, 9, [0xd4a67a, 0xd6977e, 0xa4b7a1][i % 3], true);
    box(x, 3.2, z - side * 5, 8, 0.3, 3, [0x518d78, 0xe1b65b, 0xbb7063][i % 3]);
    sign(x, 2.1, z + 4.6, ['CHAI', 'BOOKS', 'SPICES'][i % 3], 'CHANDNI CHOWK', 3);
  }
  // Elevated metro platform and stationary stylized train.
  box(180, 6, 78, 42, 1, 9, 0xaaa99b);
  for (const x of [165, 180, 195]) box(x, 3, 78, 1.5, 6, 2, 0xa9a89a, true);
  box(180, 8, 78, 33, 3, 4, 0xe8e5d7);
  box(180, 7.3, 80.1, 33, 0.5, 0.1, 0xb2514e);
  for (let x = 166; x <= 194; x += 4) box(x, 8.4, 80.1, 2.5, 1.1, 0.1, 0x5c848a);
  box(-3, 0.3, 30, 10, 0.6, 5, 0xb39371, true);
  sign(-3, 3.5, 32, 'MALAYALI COMMUNITY HUB', 'DELHI', 8);
  for (const l of LANDMARKS.filter(l => l.id !== 'COMMUNITY_PARK')) sign(l.x + 13, 3, l.z + 13, l.name.toUpperCase(), 'WELCOME · MAKE YOURSELF AT HOME', 7);
  sign(-20, 2.8, -4, '← INDIA GATE · CP', 'RED FORT · MARKET →', 7);
  sign(40, 2.8, -22, 'MARKET · FORT ↑', 'COMMUNITY PARK ↓', 6);
  sign(-138, 2.8, -15, 'CONNAUGHT PLACE ↑', 'INDIA GATE ←', 6);
  sign(170, 2.8, -4, 'METRO ↓', 'COMMUNITY PARK ←', 6);
}
