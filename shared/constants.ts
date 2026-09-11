export const BOUNDARY = 300;
export const WALK_SPEED = 2.6;
export const RUN_SPEED = 5.5;
export const DRIVE_SPEED = 13;
export const TALK_RADIUS = 5;
export const CHAT_RADIUS = 8;
export const TICK_RATE = 12;
export const DISTRICTS = ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'] as const;
export const LANDMARKS = [
  { id: 'COMMUNITY_PARK', name: 'Community Park', short: 'Park', x: -3, z: 14, radius: 35 },
  { id: 'INDIA_GATE', name: 'India Gate', short: 'Gate', x: -230, z: 70, radius: 38 },
  { id: 'CONNAUGHT_PLACE', name: 'Connaught Place', short: 'CP', x: -130, z: -80, radius: 40 },
  { id: 'CHANDNI_CHOWK', name: 'Chandni Chowk', short: 'Market', x: 65, z: -180, radius: 38 },
  { id: 'RED_FORT', name: 'Red Fort', short: 'Fort', x: 220, z: -190, radius: 42 },
  { id: 'METRO', name: 'Delhi Metro', short: 'Metro', x: 180, z: 70, radius: 36 },
  { id: 'QUTUB_MINAR', name: 'Qutub Minar', short: 'Qutub', x: -70, z: 175, radius: 40 },
  { id: 'LOTUS_TEMPLE', name: 'Lotus Temple', short: 'Lotus', x: 90, z: 185, radius: 40 },
  { id: 'RASHTRAPATI_BHAVAN', name: 'Rashtrapati Bhavan', short: 'Palace', x: -230, z: -25, radius: 42 },
  { id: 'DILLI_HAAT', name: 'Dilli Haat', short: 'Haat', x: 70, z: 30, radius: 36 },
];
export function zoneAt(x: number, z: number): string {
  return LANDMARKS.find(l => Math.hypot(x - l.x, z - l.z) < l.radius)?.id ?? 'CENTRAL_AVENUE';
}
// Walkable arrival points in front of each landmark, facing its main view.
export const TELEPORT_SPAWNS: Record<string, { x: number; z: number; rotation: number }> = {
  COMMUNITY_PARK: { x: 0, z: 11, rotation: Math.PI },
  INDIA_GATE: { x: -230, z: 84, rotation: Math.PI },
  CONNAUGHT_PLACE: { x: -130, z: -68, rotation: Math.PI },
  CHANDNI_CHOWK: { x: 65, z: -180, rotation: Math.PI },
  RED_FORT: { x: 220, z: -177, rotation: Math.PI },
  METRO: { x: 180, z: 62, rotation: 0 },
  QUTUB_MINAR: { x: -70, z: 156, rotation: 0 },
  LOTUS_TEMPLE: { x: 90, z: 165, rotation: 0 },
  RASHTRAPATI_BHAVAN: { x: -230, z: -2, rotation: Math.PI },
  DILLI_HAAT: { x: 70, z: 16, rotation: 0 },
};
