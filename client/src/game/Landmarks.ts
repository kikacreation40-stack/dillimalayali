import { CircleGeometry, Mesh, MeshStandardMaterial, TorusGeometry } from 'three';
import type { World } from './World';
import { LANDMARKS } from '../../../shared/constants';

export function buildLandmarks(world: World): void {
  const box = world.box.bind(world);
  const sign = world.sign.bind(world);
  const cylinder = world.cylinder.bind(world);

  // Connecting paved avenues with sidewalks and curbs
  for (const [x, z, w, d] of [
    [-230, 30, 13.4, 98],
    [-130, -50, 13.4, 80],
    [28, -98, 13.4, 172],
    [125, -180, 206, 13.4],
    [180, 31, 13.4, 98]
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
    // Pylon base mouldings
    box(x, 2.5, 70, 6.4, 2.2, 8.4, redSandstone, true, 0.8);
    // Main pylon shaft in warm yellow sandstone
    box(x, 8.5, 70, 5.6, 10.0, 7.6, yellowSandstone, true, 0.75);
    // Decorative side niche alcoves
    box(x + (x < -230 ? -2.7 : 2.7), 8.5, 70, 0.3, 5.5, 3.2, redSandstone, false, 0.8);
    // Upper capital mouldings
    box(x, 14.0, 70, 6.2, 1.2, 8.2, paleDholpur, false, 0.7);
  }

  // Grand triumphal archway barrel vault
  const arch = new Mesh(new TorusGeometry(5.2, 1.6, 6, 20, Math.PI), world.material(yellowSandstone, 0.75));
  arch.position.set(-230, 10.8, 70);
  arch.castShadow = true;
  world.scene.add(arch);

  // Arch spandrels & lintel
  box(-230, 12.8, 70, 8.6, 2.4, 7.6, yellowSandstone, false, 0.75);
  // Main entablature & moulded frieze band
  box(-230, 14.8, 70, 21.0, 1.4, 8.8, redSandstone, false, 0.8);
  // Stepped attic story
  box(-230, 16.2, 70, 19.4, 1.6, 8.0, yellowSandstone, false, 0.75);
  box(-230, 17.5, 70, 17.0, 1.0, 7.2, paleDholpur, false, 0.7);
  // Shallow dome crown / urn on top
  cylinder(-230, 18.3, 70, 3.0, 3.4, 0.8, redSandstone, false, 16, 0.8);

  // AMAR JAWAN JYOTI (Under the central arch)
  // Black polished marble cenotaph
  box(-230, 2.0, 70, 2.6, 0.9, 2.6, 0x181a1c, false, 0.2, 0.3);
  // Inverted soldier's rifle & helmet
  cylinder(-230, 2.9, 70, 0.05, 0.05, 0.9, 0x222222, false, 6, 0.3, 0.8);
  box(-230, 3.4, 70, 0.36, 0.2, 0.36, 0x3a4034, false, 0.4);
  // Four brass eternal flame urns with glowing fire
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
    // Water basin coping
    box(-230, 0.12, z, 36, 0.24, 6.5, paleDholpur, false, 0.7);
    // Reflecting blue water surface
    const water = box(-230, 0.18, z, 34, 0.14, 5.2, 0x2b6b80, false, 0.1, 0.4);
    (water.material as MeshStandardMaterial).roughness = 0.1;
  }

  // Heritage lampposts along Kartavya Path promenade
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

  // Massive Red Sandstone ramparts & battlements
  for (const x of [198, 242]) {
    box(x, 6.0, -199, 22, 12.0, 5.5, fortRed, true, 0.85);
    // Stepped crenellations / merlons on battlements
    for (let c = -9; c <= 9; c += 2.8) {
      box(x + c, 12.6, -199, 1.4, 1.4, 5.6, fortAccent, false, 0.8);
    }
  }

  // Lahori Gate: central portal with cusped Mughal archway
  box(220, 7.5, -199, 16, 15.0, 5.5, fortRed, true, 0.85);
  // Main entrance opening arch
  box(220, 4.0, -199, 6.5, 8.0, 6.0, 0x24120e, false, 0.9);
  // Ornate arched balcony above gateway
  box(220, 9.8, -196.0, 7.0, 0.4, 1.6, marbleWhite, false, 0.5);
  box(220, 11.2, -196.0, 6.6, 2.4, 0.4, marbleWhite, false, 0.5);

  // Two majestic octagonal flank towers
  for (const x of [186, 208, 232, 254]) {
    // Octagonal sandstone tower body
    cylinder(x, 7.5, -199, 3.8, 4.2, 15.0, fortRed, true, 8, 0.85);
    // Overhanging stone bracket eave (chhajja)
    cylinder(x, 15.2, -199, 4.5, 3.8, 0.5, fortAccent, false, 8, 0.8);

    // Iconic Chhatris on the main towers (x: 208 and 232)
    if (x === 208 || x === 232) {
      // 8 slender sandstone pillars
      for (let p = 0; p < 8; p++) {
        const px = x + Math.cos((p * Math.PI) / 4) * 2.8;
        const pz = -199 + Math.sin((p * Math.PI) / 4) * 2.8;
        cylinder(px, 17.0, pz, 0.18, 0.22, 3.2, fortRed, false, 6, 0.8);
      }
      // Octagonal ribbed dome with white marble kalash finial
      cylinder(x, 19.2, -199, 0.6, 3.4, 2.2, marbleWhite, false, 12, 0.4);
      cylinder(x, 20.8, -199, 0.1, 0.2, 1.0, 0xd4af37, false, 6, 0.2, 0.9);
    }
  }

  // Row of 7 miniature white marble cupolas (guldastas) above Lahori Gate
  for (let g = -3; g <= 3; g++) {
    cylinder(220 + g * 1.8, 15.8, -199, 0.2, 0.5, 1.2, marbleWhite, false, 8, 0.5);
  }

  // Central National Flagpole & Indian Tricolor on Red Fort ramparts
  cylinder(220, 19.5, -198.8, 0.1, 0.14, 8.0, 0xdddddd, false, 8, 0.2, 0.8);
  // Tricolor flag (Saffron, White with blue chakra, Green)
  box(220 + 1.8, 22.8, -198.8, 3.4, 0.7, 0.06, 0xff7722, false, 0.7); // Saffron
  box(220 + 1.8, 22.1, -198.8, 3.4, 0.7, 0.06, 0xffffff, false, 0.7); // White
  box(220 + 1.8, 21.4, -198.8, 3.4, 0.7, 0.06, 0x138808, false, 0.7); // Green
  // Ashoka Chakra center disc
  cylinder(220 + 1.8, 22.1, -198.75, 0.22, 0.22, 0.08, 0x000080, false, 12, 0.5);

  sign(220, 7.8, -195.8, 'RED FORT · ലാൽ കില', 'LAHORI GATE · DELHI', 7.5);

  // =========================================================================
  // 3. CONNAUGHT PLACE (CP - Inner Circle Colonnade) - x: -130, z: -80
  // =========================================================================
  const cpWhite = 0xf5efe4;
  const cpStone = 0xe8dfd0;
  const cpPillar = 0xf8f4ec;

  // Semicircular Georgian classical colonnade (Inner Circle)
  for (let i = 0; i < 16; i++) {
    if (i % 4 === 0) continue; // Keep wide monumental street openings at cardinal directions
    const a = (i * Math.PI) / 8;
    const xOuter = -130 + Math.cos(a) * 31;
    const zOuter = -80 + Math.sin(a) * 31;
    const xInner = -130 + Math.cos(a) * 23;
    const zInner = -80 + Math.sin(a) * 23;
    const xMid = -130 + Math.cos(a) * 27;
    const zMid = -80 + Math.sin(a) * 27;

    // Building arcade block
    box(xOuter, 5.5, zOuter, 9.5, 11.0, 9.5, cpWhite, true, 0.65);
    // Classical roof entablature with balustrade
    box(xOuter, 11.4, zOuter, 10.8, 1.2, 10.8, cpStone, false, 0.7);

    // Covered pedestrian veranda walkway (paved stone floor)
    box(xMid, 0.12, zMid, 7.5, 0.18, 7.5, 0xd2c4b0, false, 0.6);
    // Veranda roof ceiling
    box(xMid, 9.2, zMid, 9.5, 0.6, 9.5, cpWhite, false, 0.7);

    // Classical Tuscan fluted columns along the covered walkway
    cylinder(xInner, 4.6, zInner, 0.55, 0.65, 8.8, cpPillar, false, 12, 0.6);
    cylinder(xMid, 4.6, zMid, 0.5, 0.6, 8.8, cpPillar, false, 12, 0.6);

    // Shopfronts in the arcade with display windows & heritage signs
    box(xOuter, 3.2, zOuter - 3.8, 5.5, 4.2, 0.4, 0x273b40, false, 0.2, 0.5); // Glass storefront
  }

  // CP Central Park with landscaped circle and monumental 100ft National Flag
  const cpParkLawn = new Mesh(new CircleGeometry(15, 36), world.material(0x568252, 0.85));
  cpParkLawn.rotation.x = -Math.PI / 2;
  cpParkLawn.position.set(-130, 0.14, -80);
  world.scene.add(cpParkLawn);

  // Radial gravel pathways and park benches in CP
  box(-130, 0.16, -80, 2.4, 0.08, 30, 0xded4c2, false, 0.7);
  box(-130, 0.16, -80, 30, 0.08, 2.4, 0xded4c2, false, 0.7);

  // Monumental Central National Flagpole
  cylinder(-130, 11.0, -80, 0.14, 0.32, 22.0, 0xffffff, true, 10, 0.3, 0.6);
  // Large billowing Tricolor flag
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

      // Two-story traditional Haveli facade
      box(x, 4.8, z, 9.2, 9.6, 9.0, haveliWall[i % haveliWall.length], true, 0.8);
      // Haveli decorative parapet with arched jali patterns
      box(x, 9.8, z, 9.6, 1.0, 9.4, 0xecd9c2, false, 0.75);

      // Wooden Jharokha (traditional overhanging balcony) on the second floor
      box(x, 6.8, z - side * 4.8, 4.2, 2.8, 1.6, 0x7a4929, false, 0.6);
      cylinder(x, 8.4, z - side * 4.8, 0.4, 2.2, 0.8, 0x9e5f35, false, 8, 0.6); // Jharokha canopy

      // Colorful striped canvas shop awning on the ground floor
      box(x, 3.4, z - side * 5.4, 8.8, 0.25, 3.4, awningColors[i % awningColors.length], false, 0.6);

      // Authentic Street Food & Spice Stalls in Chandni Chowk
      if (side === 1 && i === 1) {
        // Traditional Chai Stall (Samovar, kettle, bench)
        box(x, 0.85, z - 7.5, 2.2, 0.9, 1.2, 0x5a3d28, true, 0.6); // Wooden cart
        cylinder(x, 1.6, z - 7.5, 0.28, 0.35, 0.65, 0xd4af37, false, 10, 0.2, 0.9); // Brass tea samovar
        // Clay kulhad cups on shelf
        for (let k = -0.6; k <= 0.6; k += 0.4) {
          cylinder(x + k, 1.4, z - 7.2, 0.08, 0.05, 0.16, 0xb86d48, false, 6, 0.8);
        }
      } else if (side === -1 && i === 2) {
        // Kerala Spices & Dry Fruits stall (gunny sacks of cardamom, cloves, turmeric)
        box(x, 0.75, z + 7.5, 2.6, 0.8, 1.2, 0x6e4e37, true, 0.6);
        // Spice sacks (golden turmeric, green cardamom, red chili)
        cylinder(x - 0.7, 1.35, z + 7.5, 0.3, 0.25, 0.5, 0xe6b027, false, 8, 0.8);
        cylinder(x, 1.35, z + 7.5, 0.3, 0.25, 0.5, 0x48824a, false, 8, 0.8);
        cylinder(x + 0.7, 1.35, z + 7.5, 0.3, 0.25, 0.5, 0xb83227, false, 8, 0.8);
      }

      sign(x, 2.2, z + side * 4.9, ['ചായക്കട · CHAI', 'കേരള സ്പൈസസ്', 'പുസ്തകങ്ങൾ', 'വസ്ത്രങ്ങൾ'][i % 4], 'CHANDNI CHOWK', 3.4);
    }
  }

  // Decorative festive buntings / festoons hanging across the street
  for (let b = 42; b <= 86; b += 9) {
    box(b, 5.2, -180, 0.1, 0.15, 26, 0x222222, false, 0.5); // Cable
    for (let f = -10; f <= 10; f += 2.5) {
      box(b, 4.9, -180 + f, 0.4, 0.5, 0.04, [0xff7722, 0xffd700, 0x2e8b57][Math.abs(f) % 3], false, 0.6);
    }
  }

  sign(65, 3.2, -162, 'CHANDNI CHOWK · ചാന്ദ്‌നി ചൗക്ക്', 'OLD DELHI SPICE BAZAAR', 7.5);

  // =========================================================================
  // 5. DELHI METRO ELEVATED VIADUCT & TRAIN - x: 180, z: 70
  // =========================================================================
  const concreteGrey = 0xbab8ad;
  const metroSilver = 0xe4e4de;
  const metroRed = 0xb82824;
  const metroGlass = 0x273b43;

  // Heavy concrete viaduct deck
  box(180, 6.2, 78, 56, 1.2, 10, concreteGrey, false, 0.85);

  // Concrete hammerhead piers
  for (const x of [160, 180, 200]) {
    cylinder(x, 3.0, 78, 1.2, 1.5, 6.0, concreteGrey, true, 8, 0.85);
    // Hammerhead flared crossbeam cap
    box(x, 5.4, 78, 3.8, 1.0, 9.6, concreteGrey, false, 0.85);
  }

  // Viaduct parapet walls / acoustic sound barriers
  box(180, 7.3, 83.2, 56, 1.0, 0.4, concreteGrey, false, 0.8);
  box(180, 7.3, 72.8, 56, 1.0, 0.4, concreteGrey, false, 0.8);

  // Modern Delhi Metro aerodynamic train
  box(180, 8.8, 78, 36, 3.2, 4.2, metroSilver, false, 0.3, 0.4);
  // Red Line iconic horizontal stripe
  box(180, 8.2, 80.15, 36, 0.6, 0.12, metroRed, false, 0.4, 0.2);
  box(180, 8.2, 75.85, 36, 0.6, 0.12, metroRed, false, 0.4, 0.2);
  // Streamlined aerodynamic cab nose
  box(160.8, 8.6, 78, 2.8, 2.6, 4.0, metroSilver, false, 0.3, 0.4);
  box(160.2, 8.8, 78, 0.8, 1.4, 3.6, metroGlass, false, 0.1, 0.8); // Cab windshield
  // LED Headlamps on metro front
  cylinder(159.8, 7.8, 79.2, 0.16, 0.16, 0.1, 0xffffff, false, 8, 0.2);
  cylinder(159.8, 7.8, 76.8, 0.16, 0.16, 0.1, 0xffffff, false, 8, 0.2);

  // Passenger windows & automated sliding doors
  for (let x = 166; x <= 196; x += 4.5) {
    box(x, 9.1, 80.15, 2.6, 1.4, 0.1, metroGlass, false, 0.1, 0.8);
    box(x, 9.1, 75.85, 2.6, 1.4, 0.1, metroGlass, false, 0.1, 0.8);
  }

  // Overhead pantograph on the train roof
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

  // Raised traditional stone plinth (Thara)
  box(-3, 0.4, 30, 16, 0.8, 11, 0x5a554d, true, 0.85);

  // Main pavilion structure with cream walls
  box(-3, 2.6, 30, 14, 3.6, 9.2, creamPlaster, true, 0.75);

  // Traditional Kerala veranda (Charupadi) wooden railing and teak pillars
  for (const dx of [-6.8, -4.2, -1.6, 1.6, 4.2, 6.8]) {
    cylinder(-3 + dx, 2.5, 25.4, 0.18, 0.24, 3.4, teakWood, true, 8, 0.6);
  }
  // Wooden bench rail
  box(-3, 1.4, 25.4, 14.2, 0.5, 0.3, charupadi, false, 0.6);

  // Traditional Kerala sloping Mangalore terracotta tile roof
  box(-3, 5.0, 30, 18, 0.6, 13.2, clayTileRed, false, 0.7);
  box(-3, 5.8, 30, 14.5, 1.1, 10.5, clayTileRed, false, 0.7);
  box(-3, 6.6, 30, 10.5, 0.9, 7.5, clayTileRed, false, 0.7);

  // Decorative carved wooden gable (Mukhappu) facing front
  box(-3, 5.9, 24.8, 5.6, 2.0, 0.4, teakWood, false, 0.6);
  cylinder(-3, 7.4, 24.8, 0.1, 0.25, 1.0, 0xd4af37, false, 8, 0.2, 0.9); // Brass kalash finial

  // TRADITIONAL KERALA PADIPPURA (Entrance Gatehouse with tiled roof)
  box(-3, 1.8, 19.5, 0.8, 3.6, 0.8, teakWood, true, 0.6);
  box(2.6, 1.8, 19.5, 0.8, 3.6, 0.8, teakWood, true, 0.6);
  box(-0.2, 3.8, 19.5, 5.6, 0.4, 1.4, teakWood, false, 0.6);
  box(-0.2, 4.4, 19.5, 6.4, 0.7, 2.4, clayTileRed, false, 0.7); // Sloping tile canopy

  // TRADITIONAL BRASS NILAVILAKKU (Large standing Kerala oil lamp)
  // Stepped brass base, fluted stem, and multi-tier oil wick bowls with flame
  cylinder(-0.2, 0.3, 22.0, 0.65, 0.75, 0.4, 0xd4af37, false, 12, 0.2, 0.9);
  cylinder(-0.2, 1.2, 22.0, 0.12, 0.18, 1.4, 0xd4af37, false, 10, 0.2, 0.9);
  cylinder(-0.2, 1.9, 22.0, 0.75, 0.35, 0.3, 0xd4af37, false, 12, 0.2, 0.9); // Main lamp plate
  cylinder(-0.2, 2.4, 22.0, 0.1, 0.15, 0.7, 0xd4af37, false, 8, 0.2, 0.9);
  cylinder(-0.2, 2.9, 22.0, 0.55, 0.25, 0.25, 0xd4af37, false, 12, 0.2, 0.9); // Upper lamp plate
  cylinder(-0.2, 3.3, 22.0, 0.08, 0.2, 0.6, 0xd4af37, false, 8, 0.2, 0.9); // Crown finial

  // Warm glowing flame on Nilavilakku
  const lampFlame = cylinder(-0.2, 3.05, 22.0, 0.12, 0.04, 0.3, 0xff7722, false, 6, 0.2);
  (lampFlame.material as MeshStandardMaterial).emissive.setHex(0xffaa22);
  (lampFlame.material as MeshStandardMaterial).emissiveIntensity = 1.0;
  world.addPointLight(-0.2, 3.2, 22.0, 0xffa533, 2.0, 14);

  sign(-3, 3.6, 24.2, 'കേരള ഭവൻ · KERALA HOUSE', 'DELHI MALAYALI COMMUNITY HUB', 7.5);

  // Directional signs across Delhi avenues
  for (const l of LANDMARKS.filter(l => l.id !== 'COMMUNITY_PARK')) {
    sign(l.x + 13, 3, l.z + 13, l.name.toUpperCase(), 'WELCOME · സുസ്വാഗതം · DELHI', 7.0);
  }
  sign(-20, 2.8, -4, '← INDIA GATE · CP', 'RED FORT · MARKET →', 7.0);
  sign(40, 2.8, -22, 'MARKET · FORT ↑', 'COMMUNITY PARK ↓', 6.0);
  sign(-138, 2.8, -15, 'CONNAUGHT PLACE ↑', 'INDIA GATE ←', 6.0);
  sign(170, 2.8, -4, 'METRO ↓', 'COMMUNITY PARK ←', 6.0);
}
