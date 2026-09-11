import type { PlayerState, VehicleState } from '../shared/types.js';

export class VehicleManager {
  readonly vehicles = new Map<string, VehicleState>([
    { id: 'auto-park', kind: 'auto' as const, x: 3, z: 12, rotation: 0, driverId: null },
    { id: 'car-park', kind: 'car' as const, x: 16, z: 2, rotation: 0, driverId: null },
    { id: 'auto-gate', kind: 'auto' as const, x: -218, z: 55, rotation: 0, driverId: null },
    { id: 'car-market', kind: 'car' as const, x: 30, z: -176, rotation: 0, driverId: null },
  ].map(v => [v.id, v]));
  enter(player: PlayerState, id: unknown): string | null {
    const v = typeof id === 'string' ? this.vehicles.get(id) : undefined;
    if (!v || player.vehicleId || Math.hypot(v.x - player.x, v.z - player.z) > 4) return 'Move closer to a vehicle.';
    if (v.driverId) return 'Occupied';
    v.driverId = player.id; player.vehicleId = v.id; player.x = v.x; player.z = v.z; player.rotation = v.rotation;
    return null;
  }
  release(player: PlayerState): void {
    const v = player.vehicleId ? this.vehicles.get(player.vehicleId) : undefined;
    if (v?.driverId === player.id) v.driverId = null;
    player.vehicleId = null;
  }
}
