import { CircleGeometry, ConeGeometry, Mesh, MeshStandardMaterial, TorusGeometry } from 'three';
import type { World } from './World';
import { LANDMARKS } from '../../../shared/constants';

export function buildLandmarks(world: World): void {
  const box = world.box.bind(world);
  const sign = world.sign.bind(world);
  const cylinder = world.cylinder.bind(world);

  // Connecting paved avenues with sidewalks and curbs linking all landmark plazas
  for (const [x, z, w, d] of [
    [-230, 30, 13.4, 98],
    [-230, -10, 13.4, 50],
    [-130, -50, 13.4, 80],
    [28, -98, 13.4, 172],
    [125, -180, 206, 13.4],
    [180, 31, 13.4, 98],
    [-70, 100, 13.4, 150],
    [90, 110, 13.4, 150],
    [70, 20, 13.4, 50]
  ]) {
    // Sidewalk base
    box(x, 0.038, z, w + 4.8, 0.06, d + 4.8, 0xd5cbba, false, 0.75);
    // Paved asphalt roadway
    box(x, 0.06, z, w, 0.06, d, 0x323739, false, 0.85);
  }

  // =========================================================================
  // 1. INDIA GATE (Rajpath / Kartavya Path) - x: -230, z: 70
  // =========================================================================
  const redSandstone = 0x933d30;
  const yellowSandstone = 0xdfbe93;
  const paleDholpur = 0xebd9b7;

  // Stepped multi-tier plinth (Bharatpur red & Dholpur yellow sandstone)
  box(-230, 0.4, 70, 32, 0.8, 18, redSandstone, true, 0.8);
  box(-230, 0.9, 70, 28, 0.6, 15, yellowSandstone, false, 0.75);
  box(-230, 1.3, 70, 25, 0.5, 13, redSandstone, false, 0.8);

  // Massive twin pylons (supporting the grand triumphal arch)
  for (const x of [-237, -223]) {
    box(x, 2.5, 70, 6.4, 2.2, 8.4, redSandstone, true, 0.8);
    box(x, 8.5, 70, 5.6, 10.0, 7.6, yellowSandstone, true, 0.75);
    box(x + (x < -230 ? -2.7 : 2.7), 8.5, 70, 0.3, 5.5, 3.2, redSandstone, false, 0.8);
    box(x, 14.0, 70, 6.2, 1.2, 8.2, paleDholpur, false, 0.7);
  }

  // Grand triumphal archway barrel vault
  const arch = new Mesh(new TorusGeometry(5.2, 1.6, 6, 20, Math.PI), world.material(yellowSandstone, 0.75));
  arch.position.set(-230, 10.8, 70);
  arch.castShadow = true;
  world.scene.add(arch);

  box(-230, 12.8, 70, 8.6, 2.4, 7.6, yellowSandstone, false, 0.75);
  box(-230, 14.8, 70, 21.0, 1.4, 8.8, redSandstone, false, 0.8);
  box(-230, 16.2, 70, 19.4, 1.6, 8.0, yellowSandstone, false, 0.75);
  box(-230, 17.5, 70, 17.0, 1.0, 7.2, paleDholpur, false, 0.7);
  cylinder(-230, 18.3, 70, 3.0, 3.4, 0.8, redSandstone, false, 16, 0.8);

  // AMAR JAWAN JYOTI (Under the central arch)
  box(-230, 2.0, 70, 2.6, 0.9, 2.6, 0x181a1c, false, 0.2, 0.3);
  cylinder(-230, 2.9, 70, 0.05, 0.05, 0.9, 0x222222, false, 6, 0.3, 0.8);
  box(-230, 3.4, 70, 0.36, 0.2, 0.36, 0x3a4034, false, 0.4);
  for (const dx of [-0.95, 0.95]) {
    for (const dz of [-0.95, 0.95]) {
      cylinder(-230 + dx, 2.6, 70 + dz, 0.16, 0.12, 0.32, 0xd4af37, false, 8, 0.2, 0.9);
      const flame = cylinder(-230 + dx, 2.85, 70 + dz, 0.08, 0.02, 0.22, 0xff7722, false, 6, 0.2);
      (flame.material as MeshStandardMaterial).emissive.setHex(0xffaa22);
      (flame.material as MeshStandardMaterial).emissiveIntensity = 1.0;
    }
  }
  world.addPointLight(-230, 2.8, 70, 0xff8822, 2.2, 16);

  // Kartavya Path reflecting water pools flanking the plaza
  for (const z of [52, 88]) {
    box(-230, 0.12, z, 36, 0.24, 6.5, paleDholpur, false, 0.7);
    const water = box(-230, 0.18, z, 34, 0.14, 5.2, 0x2b6b80, false, 0.1, 0.4);
    (water.material as MeshStandardMaterial).roughness = 0.1;
  }
  for (const x of [-244, -230, -216]) {
    world.heritageStreetlamp(x, 57);
    world.heritageStreetlamp(x, 83);
  }

  sign(-230, 16.5, 74.2, 'INDIA GATE', 'ഭാരത കവാടം · DELHI MALAYALI WORLD', 7.5);

  // =========================================================================
  // 2. RED FORT (Lal Qila - Lahori Gate) - x: 220, z: -190
  // =========================================================================
  const fortRed = 0xa33e30;
  const fortAccent = 0xb44b3c;
  const marbleWhite = 0xf5eedd;

  for (const x of [198, 242]) {
    box(x, 6.0, -199, 22, 12.0, 5.5, fortRed, true, 0.85);
    for (let c = -9; c <= 9; c += 2.8) {
      box(x + c, 12.6, -199, 1.4, 1.4, 5.6, fortAccent, false, 0.8);
    }
  }

  box(220, 7.5, -199, 16, 15.0, 5.5, fortRed, true, 0.85);
  box(220, 4.0, -199, 6.5, 8.0, 6.0, 0x24120e, false, 0.9);
  box(220, 9.8, -196.0, 7.0, 0.4, 1.6, marbleWhite, false, 0.5);
  box(220, 11.2, -196.0, 6.6, 2.4, 0.4, marbleWhite, false, 0.5);

  for (const x of [186, 208, 232, 254]) {
    cylinder(x, 7.5, -199, 3.8, 4.2, 15.0, fortRed, true, 8, 0.85);
    cylinder(x, 15.2, -199, 4.5, 3.8, 0.5, fortAccent, false, 8, 0.8);

    if (x === 208 || x === 232) {
      for (let p = 0; p < 8; p++) {
        const px = x + Math.cos((p * Math.PI) / 4) * 2.8;
        const pz = -199 + Math.sin((p * Math.PI) / 4) * 2.8;
        cylinder(px, 17.0, pz, 0.18, 0.22, 3.2, fortRed, false, 6, 0.8);
      }
      cylinder(x, 19.2, -199, 0.6, 3.4, 2.2, marbleWhite, false, 12, 0.4);
      cylinder(x, 20.8, -199, 0.1, 0.2, 1.0, 0xd4af37, false, 6, 0.2, 0.9);
    }
  }

  for (let g = -3; g <= 3; g++) {
    cylinder(220 + g * 1.8, 15.8, -199, 0.2, 0.5, 1.2, marbleWhite, false, 8, 0.5);
  }

  cylinder(220, 19.5, -198.8, 0.1, 0.14, 8.0, 0xdddddd, false, 8, 0.2, 0.8);
  box(220 + 1.8, 22.8, -198.8, 3.4, 0.7, 0.06, 0xff7722, false, 0.7);
  box(220 + 1.8, 22.1, -198.8, 3.4, 0.7, 0.06, 0xffffff, false, 0.7);
  box(220 + 1.8, 21.4, -198.8, 3.4, 0.7, 0.06, 0x138808, false, 0.7);
  cylinder(220 + 1.8, 22.1, -198.75, 0.22, 0.22, 0.08, 0x000080, false, 12, 0.5);

  sign(220, 7.8, -195.8, 'RED FORT · ലാൽ കില', 'LAHORI GATE · DELHI', 7.5);

  // =========================================================================
  // 3. CONNAUGHT PLACE (CP - Inner Circle Colonnade) - x: -130, z: -80
  // =========================================================================
  const cpWhite = 0xf5efe4;
  const cpStone = 0xe8dfd0;
  const cpPillar = 0xf8f4ec;

  for (let i = 0; i < 16; i++) {
    if (i % 4 === 0) continue;
    const a = (i * Math.PI) / 8;
    const xOuter = -130 + Math.cos(a) * 31;
    const zOuter = -80 + Math.sin(a) * 31;
    const xInner = -130 + Math.cos(a) * 23;
    const zInner = -80 + Math.sin(a) * 23;
    const xMid = -130 + Math.cos(a) * 27;
    const zMid = -80 + Math.sin(a) * 27;

    box(xOuter, 5.5, zOuter, 9.5, 11.0, 9.5, cpWhite, true, 0.65);
    box(xOuter, 11.4, zOuter, 10.8, 1.2, 10.8, cpStone, false, 0.7);
    box(xMid, 0.12, zMid, 7.5, 0.18, 7.5, 0xd2c4b0, false, 0.6);
    box(xMid, 9.2, zMid, 9.5, 0.6, 9.5, cpWhite, false, 0.7);

    cylinder(xInner, 4.6, zInner, 0.55, 0.65, 8.8, cpPillar, false, 12, 0.6);
    cylinder(xMid, 4.6, zMid, 0.5, 0.6, 8.8, cpPillar, false, 12, 0.6);
    box(xOuter, 3.2, zOuter - 3.8, 5.5, 4.2, 0.4, 0x273b40, false, 0.2, 0.5);
  }

  const cpParkLawn = new Mesh(new CircleGeometry(15, 36), world.material(0x568252, 0.85));
  cpParkLawn.rotation.x = -Math.PI / 2;
  cpParkLawn.position.set(-130, 0.14, -80);
  world.scene.add(cpParkLawn);

  box(-130, 0.16, -80, 2.4, 0.08, 30, 0xded4c2, false, 0.7);
  box(-130, 0.16, -80, 30, 0.08, 2.4, 0xded4c2, false, 0.7);

  cylinder(-130, 11.0, -80, 0.14, 0.32, 22.0, 0xffffff, true, 10, 0.3, 0.6);
  box(-130 + 2.5, 20.6, -80, 4.8, 1.0, 0.08, 0xff7722, false, 0.7);
  box(-130 + 2.5, 19.6, -80, 4.8, 1.0, 0.08, 0xffffff, false, 0.7);
  box(-130 + 2.5, 18.6, -80, 4.8, 1.0, 0.08, 0x138808, false, 0.7);
  cylinder(-130 + 2.5, 19.6, -79.94, 0.32, 0.32, 0.1, 0x000080, false, 12, 0.5);

  sign(-130, 3.2, -62, 'CONNAUGHT PLACE · രാജീവ് ചൗക്ക്', 'INNER CIRCLE · DELHI', 7.5);

  // =========================================================================
  // 4. CHANDNI CHOWK BAZAAR (Old Delhi Market) - x: 65, z: -180
  // =========================================================================
  const haveliWall = [0xd6a378, 0xcc8972, 0xa5b8a0, 0xd0ab8c];
  const awningColors = [0x1d6645, 0xd94c34, 0xdfa52b, 0x2f5280];

  for (let i = 0; i < 6; i++) {
    for (const side of [-1, 1]) {
      const x = 38 + i * 11;
      const z = -180 + side * 18;

      box(x, 4.8, z, 9.2, 9.6, 9.0, haveliWall[i % haveliWall.length], true, 0.8);
      box(x, 9.8, z, 9.6, 1.0, 9.4, 0xecd9c2, false, 0.75);

      box(x, 6.8, z - side * 4.8, 4.2, 2.8, 1.6, 0x7a4929, false, 0.6);
      cylinder(x, 8.4, z - side * 4.8, 0.4, 2.2, 0.8, 0x9e5f35, false, 8, 0.6);
      box(x, 3.4, z - side * 5.4, 8.8, 0.25, 3.4, awningColors[i % awningColors.length], false, 0.6);

      if (side === 1 && i === 1) {
        box(x, 0.85, z - 7.5, 2.2, 0.9, 1.2, 0x5a3d28, true, 0.6);
        cylinder(x, 1.6, z - 7.5, 0.28, 0.35, 0.65, 0xd4af37, false, 10, 0.2, 0.9);
        for (let k = -0.6; k <= 0.6; k += 0.4) {
          cylinder(x + k, 1.4, z - 7.2, 0.08, 0.05, 0.16, 0xb86d48, false, 6, 0.8);
        }
      } else if (side === -1 && i === 2) {
        box(x, 0.75, z + 7.5, 2.6, 0.8, 1.2, 0x6e4e37, true, 0.6);
        cylinder(x - 0.7, 1.35, z + 7.5, 0.3, 0.25, 0.5, 0xe6b027, false, 8, 0.8);
        cylinder(x, 1.35, z + 7.5, 0.3, 0.25, 0.5, 0x48824a, false, 8, 0.8);
        cylinder(x + 0.7, 1.35, z + 7.5, 0.3, 0.25, 0.5, 0xb83227, false, 8, 0.8);
      }

      sign(x, 2.2, z + side * 4.9, ['ചായക്കട · CHAI', 'കേരള സ്പൈസസ്', 'പുസ്തകങ്ങൾ', 'വസ്ത്രങ്ങൾ'][i % 4], 'CHANDNI CHOWK', 3.4);
    }
  }

  for (let b = 42; b <= 86; b += 9) {
    box(b, 5.2, -180, 0.1, 0.15, 26, 0x222222, false, 0.5);
    for (let f = -10; f <= 10; f += 2.5) {
      box(b, 4.9, -180 + f, 0.4, 0.5, 0.04, [0xff7722, 0xffd700, 0x2e8b57][Math.abs(f) % 3], false, 0.6);
    }
  }

  sign(65, 3.2, -162, 'CHANDNI CHOWK · ചാന്ദ്‌നി ചൗക്ക്', 'OLD DELHI SPICE BAZAAR', 7.5);

  // =========================================================================
  // 5. DELHI METRO ELEVATED LINE - x: 180, z: 70
  // =========================================================================
  const concreteGrey = 0xbab8ad;
  const metroSilver = 0xe4e4de;
  const metroRed = 0xb82824;
  const metroGlass = 0x273b43;

  box(180, 6.2, 78, 56, 1.2, 10, concreteGrey, false, 0.85);

  for (const x of [160, 180, 200]) {
    cylinder(x, 3.0, 78, 1.2, 1.5, 6.0, concreteGrey, true, 8, 0.85);
    box(x, 5.4, 78, 3.8, 1.0, 9.6, concreteGrey, false, 0.85);
  }

  box(180, 7.3, 83.2, 56, 1.0, 0.4, concreteGrey, false, 0.8);
  box(180, 7.3, 72.8, 56, 1.0, 0.4, concreteGrey, false, 0.8);

  box(180, 8.8, 78, 36, 3.2, 4.2, metroSilver, false, 0.3, 0.4);
  box(180, 8.2, 80.15, 36, 0.6, 0.12, metroRed, false, 0.4, 0.2);
  box(180, 8.2, 75.85, 36, 0.6, 0.12, metroRed, false, 0.4, 0.2);
  box(160.8, 8.6, 78, 2.8, 2.6, 4.0, metroSilver, false, 0.3, 0.4);
  box(160.2, 8.8, 78, 0.8, 1.4, 3.6, metroGlass, false, 0.1, 0.8);
  cylinder(159.8, 7.8, 79.2, 0.16, 0.16, 0.1, 0xffffff, false, 8, 0.2);
  cylinder(159.8, 7.8, 76.8, 0.16, 0.16, 0.1, 0xffffff, false, 8, 0.2);

  for (let x = 166; x <= 196; x += 4.5) {
    box(x, 9.1, 80.15, 2.6, 1.4, 0.1, metroGlass, false, 0.1, 0.8);
    box(x, 9.1, 75.85, 2.6, 1.4, 0.1, metroGlass, false, 0.1, 0.8);
  }

  box(175, 10.9, 78, 2.2, 0.2, 1.8, 0x444444, false, 0.5, 0.8);
  cylinder(175, 11.6, 78, 0.08, 0.08, 1.4, 0x777777, false, 6, 0.4, 0.8);

  sign(180, 3.2, 60, 'DELHI METRO · ഡൽഹി മെട്രോ', 'RED LINE · RAPID TRANSIT', 7.5);

  // =========================================================================
  // 6. MALAYALI COMMUNITY HUB (Kerala House / Samiti) - x: -3, z: 30
  // =========================================================================
  const clayTileRed = 0xb44a38;
  const teakWood = 0x6e4325;
  const charupadi = 0x8a5430;
  const creamPlaster = 0xf5eedc;

  box(-3, 0.4, 30, 16, 0.8, 11, 0x5a554d, true, 0.85);
  box(-3, 2.6, 30, 14, 3.6, 9.2, creamPlaster, true, 0.75);

  for (const dx of [-6.8, -4.2, -1.6, 1.6, 4.2, 6.8]) {
    cylinder(-3 + dx, 2.5, 25.4, 0.18, 0.24, 3.4, teakWood, true, 8, 0.6);
  }
  box(-3, 1.4, 25.4, 14.2, 0.5, 0.3, charupadi, false, 0.6);

  box(-3, 5.0, 30, 18, 0.6, 13.2, clayTileRed, false, 0.7);
  box(-3, 5.8, 30, 14.5, 1.1, 10.5, clayTileRed, false, 0.7);
  box(-3, 6.6, 30, 10.5, 0.9, 7.5, clayTileRed, false, 0.7);

  box(-3, 5.9, 24.8, 5.6, 2.0, 0.4, teakWood, false, 0.6);
  cylinder(-3, 7.4, 24.8, 0.1, 0.25, 1.0, 0xd4af37, false, 8, 0.2, 0.9);

  // Padippura entrance
  box(-3, 1.8, 19.5, 0.8, 3.6, 0.8, teakWood, true, 0.6);
  box(2.6, 1.8, 19.5, 0.8, 3.6, 0.8, teakWood, true, 0.6);
  box(-0.2, 3.8, 19.5, 5.6, 0.4, 1.4, teakWood, false, 0.6);
  box(-0.2, 4.4, 19.5, 6.4, 0.7, 2.4, clayTileRed, false, 0.7);

  // Nilavilakku
  cylinder(-0.2, 0.3, 22.0, 0.65, 0.75, 0.4, 0xd4af37, false, 12, 0.2, 0.9);
  cylinder(-0.2, 1.2, 22.0, 0.12, 0.18, 1.4, 0xd4af37, false, 10, 0.2, 0.9);
  cylinder(-0.2, 1.9, 22.0, 0.75, 0.35, 0.3, 0xd4af37, false, 12, 0.2, 0.9);
  cylinder(-0.2, 2.4, 22.0, 0.1, 0.15, 0.7, 0xd4af37, false, 8, 0.2, 0.9);
  cylinder(-0.2, 2.9, 22.0, 0.55, 0.25, 0.25, 0xd4af37, false, 12, 0.2, 0.9);
  cylinder(-0.2, 3.3, 22.0, 0.08, 0.2, 0.6, 0xd4af37, false, 8, 0.2, 0.9);

  const lampFlame = cylinder(-0.2, 3.05, 22.0, 0.12, 0.04, 0.3, 0xff7722, false, 6, 0.2);
  (lampFlame.material as MeshStandardMaterial).emissive.setHex(0xffaa22);
  (lampFlame.material as MeshStandardMaterial).emissiveIntensity = 1.0;
  world.addPointLight(-0.2, 3.2, 22.0, 0xffa533, 2.0, 14);

  sign(-3, 3.6, 24.2, 'കേരള ഭവൻ · KERALA HOUSE', 'DELHI MALAYALI COMMUNITY HUB', 7.5);

  // =========================================================================
  // 7. QUTUB MINAR & IRON PILLAR - x: -70, z: 175
  // =========================================================================
  const qutubBase = 0x933b2c;
  const qutubUpper = 0xaa4433;
  const qutubMarble = 0xf5eedd;
  const qutubBalcony = 0x7c2d22;

  // Courtyard paved stone base
  box(-70, 0.4, 175, 34, 0.8, 34, 0xc8baa2, true, 0.85);

  // 1st Storey: Red sandstone with alternating angular and rounded fluted ribs
  cylinder(-70, 4.4, 175, 4.0, 4.7, 8.0, qutubBase, true, 24, 0.8);
  // 1st Balcony with projecting muqarnas stone bracket corbels
  cylinder(-70, 8.6, 175, 4.6, 4.0, 0.6, qutubBalcony, false, 24, 0.8);

  // 2nd Storey: Rounded fluted ribs
  cylinder(-70, 12.2, 175, 3.4, 3.9, 6.6, qutubUpper, false, 20, 0.8);
  // 2nd Balcony
  cylinder(-70, 15.7, 175, 4.0, 3.4, 0.5, qutubBalcony, false, 20, 0.8);

  // 3rd Storey: Angular fluted ribs
  cylinder(-70, 18.8, 175, 2.8, 3.3, 5.8, qutubUpper, false, 16, 0.8);
  // 3rd Balcony
  cylinder(-70, 21.9, 175, 3.3, 2.8, 0.5, qutubBalcony, false, 16, 0.8);

  // 4th Storey: White marble band and red sandstone
  cylinder(-70, 24.2, 175, 2.3, 2.7, 4.2, qutubMarble, false, 16, 0.5);
  // 4th Balcony
  cylinder(-70, 26.5, 175, 2.8, 2.3, 0.4, qutubBalcony, false, 16, 0.8);

  // 5th Storey: White marble top cupola storey
  cylinder(-70, 28.5, 175, 1.7, 2.2, 3.6, qutubMarble, false, 14, 0.5);
  // Minaret pinnacle / finial soaring into the sky (~31m high!)
  cylinder(-70, 30.8, 175, 0.1, 1.2, 1.8, 0xd4af37, false, 10, 0.3, 0.8);

  // HISTORIC IRON PILLAR OF DELHI (ഇരുമ്പ് സ്തംഭം) in the Qutub courtyard
  // Rust-resistant ancient forge-welded dark iron
  cylinder(-62, 3.6, 166, 0.28, 0.34, 6.4, 0x1e2124, true, 10, 0.4, 0.85);
  // Decorative bell-shaped capital and chakra finial
  cylinder(-62, 6.9, 166, 0.48, 0.28, 0.6, 0x2a2f34, false, 10, 0.4, 0.85);
  cylinder(-62, 7.4, 166, 0.12, 0.38, 0.5, 0x2a2f34, false, 8, 0.4, 0.85);
  // Stone protective barrier railing around the Iron Pillar
  for (let r = 0; r < 8; r++) {
    const rx = -62 + Math.cos((r * Math.PI) / 4) * 2.2;
    const rz = 166 + Math.sin((r * Math.PI) / 4) * 2.2;
    cylinder(rx, 0.6, rz, 0.08, 0.08, 1.2, 0x7a6c5a, false, 6, 0.8);
  }

  // Quwwat-ul-Islam ancient arched arcade screen walls
  for (const z of [160, 190]) {
    box(-70, 3.5, z, 28, 6.0, 1.6, qutubBase, true, 0.85);
    // Cutout open stone arches
    for (let ax = -10; ax <= 10; ax += 5) {
      box(-70 + ax, 2.5, z, 2.6, 4.2, 1.8, 0x22110c, false, 0.9);
    }
  }

  sign(-70, 3.2, 154, 'QUTUB MINAR · ക്വുതുബ് മിനാർ', 'UNESCO WORLD HERITAGE & IRON PILLAR · DELHI', 7.8);

  // =========================================================================
  // 8. LOTUS TEMPLE (Bahá'í House of Worship) - x: 90, z: 185
  // =========================================================================
  const lotusMarble = 0xfcf9f2;
  const lotusAccent = 0xebe3d5;
  const pondWater = 0x20788c;

  // Radial elevated marble podium (9-sided sacred geometry)
  cylinder(90, 0.6, 185, 22, 24, 1.2, lotusAccent, true, 18, 0.4, 0.1);
  cylinder(90, 1.5, 185, 18, 20, 0.8, lotusMarble, false, 18, 0.3, 0.1);

  // Inner petal dome cluster (soaring white marble petals)
  for (let p = 0; p < 9; p++) {
    const angle = (p * Math.PI * 2) / 9;
    const px = 90 + Math.cos(angle) * 5.8;
    const pz = 185 + Math.sin(angle) * 5.8;

    // Upright tall inner petal
    const innerPetal = new Mesh(new ConeGeometry(2.4, 16.0, 5), world.material(lotusMarble, 0.3, 0.05));
    innerPetal.position.set(px, 9.5, pz);
    innerPetal.rotation.y = angle;
    innerPetal.rotation.z = Math.cos(angle) * 0.18;
    innerPetal.rotation.x = -Math.sin(angle) * 0.18;
    innerPetal.castShadow = true;
    world.scene.add(innerPetal);

    // Outer unfolding petal
    const ox = 90 + Math.cos(angle) * 11.5;
    const oz = 185 + Math.sin(angle) * 11.5;
    const outerPetal = new Mesh(new ConeGeometry(2.8, 11.0, 5), world.material(lotusMarble, 0.3, 0.05));
    outerPetal.position.set(ox, 6.8, oz);
    outerPetal.rotation.y = angle;
    outerPetal.rotation.z = Math.cos(angle) * 0.45;
    outerPetal.rotation.x = -Math.sin(angle) * 0.45;
    outerPetal.castShadow = true;
    world.scene.add(outerPetal);

    // 9 Turquoise reflection ponds surrounding the lotus
    const pondX = 90 + Math.cos(angle + Math.PI / 9) * 23;
    const pondZ = 185 + Math.sin(angle + Math.PI / 9) * 23;
    cylinder(pondX, 0.15, pondZ, 5.0, 5.4, 0.3, lotusAccent, false, 10, 0.6);
    const water = cylinder(pondX, 0.22, pondZ, 4.4, 4.4, 0.16, pondWater, false, 10, 0.1, 0.3);
    (water.material as MeshStandardMaterial).roughness = 0.08;
  }

  // Central prayer hall skylight dome
  cylinder(90, 16.5, 185, 1.2, 3.2, 2.5, 0xffffff, false, 18, 0.1, 0.3);

  sign(90, 3.2, 161, 'LOTUS TEMPLE · താമര ക്ഷേത്രം', 'BAHÁ\'Í HOUSE OF WORSHIP · DELHI', 7.8);

  // =========================================================================
  // 9. RASHTRAPATI BHAVAN & CENTRAL VISTA - x: -230, z: -25
  // =========================================================================
  const copperDome = 0x3d7e70;
  const domeAccent = 0xd4af37;

  // Grand raised sandstone terrace (Raisina Hill)
  box(-230, 0.8, -25, 48, 1.6, 26, redSandstone, true, 0.85);

  // Main palace facade in Dholpur buff stone with red stone base
  box(-230, 6.2, -25, 44, 9.2, 20, paleDholpur, true, 0.7);
  box(-230, 2.4, -25, 45, 2.4, 21, redSandstone, false, 0.8);

  // Monumental classical portico colonnade (20 Tuscan columns)
  for (let c = -7; c <= 7; c += 2.2) {
    cylinder(-230 + c, 6.2, -14.2, 0.45, 0.55, 9.2, paleDholpur, true, 10, 0.6);
  }
  // Portico entablature & classical pediment
  box(-230, 11.2, -14.2, 18, 1.4, 3.2, paleDholpur, false, 0.7);

  // Colossal Neoclassical Central Copper Dome (Buddhist stupa railing design)
  // Dome drum with 16 column arcades
  cylinder(-230, 13.0, -25, 6.2, 6.6, 3.2, paleDholpur, false, 20, 0.7);
  for (let d = 0; d < 16; d++) {
    const da = (d * Math.PI) / 8;
    cylinder(-230 + Math.cos(da) * 6.8, 13.0, -25 + Math.sin(da) * 6.8, 0.22, 0.25, 3.2, paleDholpur, false, 6, 0.6);
  }
  // Great Copper Dome hemisphere
  cylinder(-230, 16.5, -25, 3.2, 6.4, 4.2, copperDome, false, 24, 0.3, 0.4);
  cylinder(-230, 19.4, -25, 0.2, 3.2, 2.2, copperDome, false, 24, 0.3, 0.4);
  // Crown finial / Stupa umbrella
  cylinder(-230, 21.0, -25, 0.1, 0.4, 1.4, domeAccent, false, 8, 0.2, 0.9);

  // JAIPUR COLUMN in the forecourt
  cylinder(-230, 7.5, -3.0, 0.55, 0.75, 14.0, yellowSandstone, true, 12, 0.7);
  // Bronze lotus & Star of India crown
  cylinder(-230, 14.8, -3.0, 0.9, 0.45, 0.8, domeAccent, false, 10, 0.2, 0.9);
  cylinder(-230, 15.6, -3.0, 0.1, 0.6, 1.2, domeAccent, false, 6, 0.2, 0.9);

  // Ceremonial iron gates and guard pillboxes
  for (const side of [-14, 14]) {
    cylinder(-230 + side, 3.0, -3.0, 1.6, 1.8, 6.0, redSandstone, true, 8, 0.8);
    cylinder(-230 + side, 6.4, -3.0, 0.2, 1.8, 1.0, copperDome, false, 8, 0.3);
  }

  sign(-230, 3.2, 4.0, 'RASHTRAPATI BHAVAN · രാഷ്ട്രപതി ഭവൻ', 'PRESIDENTIAL PALACE · CENTRAL VISTA · NEW DELHI', 8.2);

  // =========================================================================
  // 10. DILLI HAAT (Crafts Bazaar & Kerala Food Village) - x: 70, z: 30
  // =========================================================================
  const brickRed = 0xb0553b;
  const thatchStraw = 0xb89255;
  const bambooWood = 0x8a6237;

  // Traditional brick-paved courtyard
  box(70, 0.25, 30, 28, 0.5, 26, 0xc47b5c, true, 0.85);

  // Open-air craft stalls with thatched bamboo roofs
  for (let s = 0; s < 4; s++) {
    const sx = 59 + s * 7.5;
    const sz = 40;
    // Brick counter & bamboo pillars
    box(sx, 1.1, sz, 5.2, 1.2, 3.0, brickRed, true, 0.8);
    for (const cx of [-2.4, 2.4]) {
      cylinder(sx + cx, 2.6, sz - 1.2, 0.1, 0.12, 2.2, bambooWood, false, 6, 0.7);
    }
    // Thatched sloping roof canopy
    box(sx, 4.0, sz, 6.4, 0.8, 4.2, thatchStraw, false, 0.9);

    // Colorful handicraft displays
    box(sx - 1.2, 1.9, sz - 0.5, 1.0, 0.5, 0.8, [0xd94326, 0x2e8b57, 0x3f51b5, 0xff9800][s], false, 0.6);
    box(sx + 1.2, 1.9, sz - 0.5, 0.9, 0.6, 0.7, 0xd4af37, false, 0.3, 0.7);
  }

  // FAMOUS KERALA FOOD STALL (കേരള തനിമ · KERALA FOODS)
  const kx = 70, kz = 20;
  box(kx, 1.2, kz, 11.0, 1.4, 4.5, brickRed, true, 0.8);
  // Bamboo veranda posts
  for (const dx of [-5.0, -1.8, 1.8, 5.0]) {
    cylinder(kx + dx, 2.8, kz - 2.0, 0.12, 0.14, 2.4, bambooWood, false, 6, 0.7);
  }
  // Terracotta tile & thatch roof
  box(kx, 4.3, kz, 12.5, 1.0, 5.8, clayTileRed, false, 0.75);

  // Live Food Counter: Kerala Parotta Tawa, Appam chatti, tea samovar
  box(kx - 3.2, 2.0, kz - 1.0, 1.8, 0.2, 1.4, 0x222222, false, 0.4, 0.8); // Black iron tawa
  cylinder(kx, 2.3, kz - 1.0, 0.24, 0.32, 0.6, 0xd4af37, false, 8, 0.2, 0.9); // Brass tea kettle
  // Banana leaf food plates
  box(kx + 3.0, 1.95, kz - 1.0, 1.4, 0.04, 1.0, 0x3b8535, false, 0.6);

  // Dining tables with umbrellas in Dilli Haat courtyard
  for (const [tx, tz] of [[62, 28], [78, 28]]) {
    cylinder(tx, 0.8, tz, 1.3, 1.3, 0.1, 0x5a3d25, true, 10, 0.6);
    cylinder(tx, 0.4, tz, 0.15, 0.15, 0.8, 0x222222, false, 6, 0.7);
    // Colorful umbrella canopy
    const umbrella = new Mesh(new ConeGeometry(2.2, 0.8, 8), world.material(0xd93e2b, 0.6));
    umbrella.position.set(tx, 2.6, tz);
    umbrella.castShadow = true;
    world.scene.add(umbrella);
    cylinder(tx, 1.8, tz, 0.05, 0.05, 1.8, 0xdddddd, false, 6, 0.5);
  }

  sign(70, 3.2, 13.0, 'DILLI HAAT · ഡൽഹി ഹാത്ത്', 'KERALA FOODS & CRAFTS BAZAAR · INA', 7.8);

  // Directional signs across Delhi avenues
  for (const l of LANDMARKS.filter(l => l.id !== 'COMMUNITY_PARK')) {
    sign(l.x + 13, 3, l.z + 13, l.name.toUpperCase(), 'WELCOME · സുസ്വാഗതം · DELHI', 7.0);
  }
  sign(-20, 2.8, -4, '← INDIA GATE · RASHTRAPATI BHAVAN', 'RED FORT · MARKET →', 7.5);
  sign(40, 2.8, -22, 'MARKET · FORT ↑', 'COMMUNITY PARK · DILLI HAAT ↓', 6.5);
  sign(-138, 2.8, -15, 'CONNAUGHT PLACE ↑', 'INDIA GATE · CENTRAL VISTA ←', 6.5);
  sign(170, 2.8, -4, 'METRO ↓', 'COMMUNITY PARK ←', 6.0);
  sign(-50, 2.8, 70, 'QUTUB MINAR ↓', 'COMMUNITY PARK ↑', 6.5);
  sign(75, 2.8, 70, 'LOTUS TEMPLE ↓', 'DILLI HAAT ↑', 6.5);
}
