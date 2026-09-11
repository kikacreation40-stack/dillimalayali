import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import { Collision } from '../client/src/game/Collision.ts';
import { VehicleController } from '../client/src/game/VehicleController.ts';

test('walking collision prevents tunnelling and permits wall sliding', () => {
  const collision = new Collision(); collision.obstacles.push({ x: 0, z: 0, halfX: 2, halfZ: 2 });
  const p = new Vector3(-5, 0, 0); collision.move(p, 20, 0); assert(p.x <= -2.48);
  collision.move(p, 0, 5); assert(Math.abs(p.z - 5) < 0.001);
  const edge = new Vector3(299, 0, 80); collision.move(edge, 10, 0); assert(edge.x < 300);
});
test('vehicle acceleration, steering, braking, and larger collision radius', () => {
  const driver = { mesh: { position: new Vector3(0, 0, 0), rotation: { y: 0 } } };
  const controller = new VehicleController(), collision = new Collision();
  for (let i = 0; i < 60; i++) controller.update(1 / 60, 1, 0, driver, collision);
  assert(driver.mesh.position.z > 3); assert(controller.speed > 5 && controller.speed <= 13);
  controller.update(0.05, 1, 1, driver, collision); assert(driver.mesh.rotation.y < 0);
  const speed = controller.speed;
  for (let i = 0; i < 30; i++) controller.update(1 / 60, -1, 0, driver, collision);
  assert(controller.speed < speed);
  driver.mesh.position.set(0, 0, 0); driver.mesh.rotation.y = 0; controller.speed = 0;
  collision.obstacles.push({ x: 0, z: 5, halfX: 4, halfZ: 1 });
  for (let i = 0; i < 180; i++) controller.update(1 / 60, 1, 0, driver, collision);
  assert(driver.mesh.position.z < 2.3, 'vehicle stops before major geometry');
});

// Avatar switching changes primitive geometry visibility without rebuilding limbs.
test('male and female avatars have distinct geometry and preserve movement parts', async () => {
  const { Player } = await import('../client/src/game/Player.ts');
  const { profileFrom } = await import('../server/validation.ts');
  const avatar = new Player(0x558eb0, 'male');
  const details = avatar.mesh.getObjectByName('female-details');
  assert.equal(details.visible, false);
  const parts = avatar.mesh.children.length;
  avatar.setAvatar('female'); assert.equal(details.visible, true); assert.equal(details.children.length, 3);
  avatar.animate(0.1, true, false); avatar.setAvatar('male');
  assert.equal(details.visible, false); assert.equal(avatar.mesh.children.length, parts);
  const profile = { name: 'Anu', hometown: 'Thrissur', showName: true, showHometown: true, allowTalk: true };
  assert.equal(profileFrom({ ...profile, avatar: 'female' }).avatar, 'female');
  assert.equal(profileFrom({ ...profile, avatar: 'invalid' }), null);
  assert.equal(profileFrom(profile).avatar, 'male', 'old profiles remain compatible');
  avatar.disposeGeometry();
});
