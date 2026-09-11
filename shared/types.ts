export interface Privacy { showName: boolean; showHometown: boolean; allowTalk: boolean }
export type AvatarStyle = 'male' | 'female';
export interface Profile extends Privacy { name: string; hometown: string; avatar: AvatarStyle }
export interface Pose { x: number; z: number; rotation: number }
export interface PlayerState extends Pose, Profile { id: string; color: number; zone: string; vehicleId: string | null }
export interface VehicleState extends Pose { id: string; kind: 'auto' | 'car'; driverId: string | null }
export interface Snapshot { players: PlayerState[]; vehicles: VehicleState[] }
export interface Reply { ok: boolean; error?: string; id?: string }
export interface ChatMessage { from: string; to: string; text: string; time: number }
export function playerLabel(p: Pick<PlayerState, 'name' | 'hometown'>): string {
  return [p.name || 'Neighbor', p.hometown].filter(Boolean).join(' · ');
}
