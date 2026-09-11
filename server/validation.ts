import { DISTRICTS } from '../shared/constants.js';
import type { Profile } from '../shared/types.js';

export function profileFrom(value: unknown): Profile | null {
  if (!value || typeof value !== 'object') return null;
  const p = value as Record<string, unknown>;
  if (typeof p.name !== 'string' || typeof p.hometown !== 'string') return null;
  const name = p.name.replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, '').trim();
  if (!name || name.length > 24 || (p.hometown !== '' && !DISTRICTS.some(d => d === p.hometown))) return null;
  if (typeof p.showName !== 'boolean' || typeof p.showHometown !== 'boolean' || typeof p.allowTalk !== 'boolean') return null;
  if (p.avatar !== undefined && p.avatar !== 'male' && p.avatar !== 'female') return null;
  return { name, hometown: p.hometown, avatar: p.avatar === 'female' ? 'female' : 'male', showName: p.showName, showHometown: p.showHometown, allowTalk: p.allowTalk };
}
