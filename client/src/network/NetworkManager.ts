import { io, type Socket } from 'socket.io-client';
import type { Pose, Profile, Reply, Snapshot } from '../../../shared/types';

export class NetworkManager {
  readonly socket: Socket;
  id = '';
  ready = false;
  onSnapshot: (state: Snapshot) => void = () => {};
  onStatus: (status: string) => void = () => {};
  onCorrection: (pose: Pose) => void = () => {};
  private profile: Profile | null = null;

  constructor() {
    const env = import.meta.env.VITE_SERVER_URL as string | undefined;
    const defaultUrl = window.location.port === '5173'
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : window.location.origin;
    this.socket = io(env || defaultUrl, { autoConnect: false, reconnectionDelay: 1000, reconnectionDelayMax: 5000 });
    this.socket.on('connect', () => {
      this.socket.timeout(5000).emit('player:join', this.profile, (err: Error | null, reply: Reply) => {
        if (err || !reply?.ok) { this.socket.disconnect(); this.onStatus(reply?.error || 'Could not join. Use Reconnect in the menu to try again.'); return; }
        this.id = reply.id!; this.ready = true; this.onStatus('Connected');
      });
    });
    this.socket.on('world:snapshot', (state: Snapshot) => { if (this.ready) this.onSnapshot(state); });
    this.socket.on('player:correction', (pose: Pose) => this.onCorrection(pose));
    this.socket.on('disconnect', (reason: string) => { this.ready = false; this.onSnapshot({ players: [], vehicles: [] }); this.onStatus(reason === 'io client disconnect' ? 'Disconnected' : 'Disconnected — reconnecting…'); });
    this.socket.on('connect_error', () => this.onStatus('Server unavailable — reconnecting…'));
  }
  setProfile(profile: Profile): void { this.profile = profile; }
  join(profile: Profile): void { this.profile = profile; this.socket.connect(); }
  update(pose: Pose, driving = false): void { if (this.ready) this.socket.volatile.emit(driving ? 'vehicle:update' : 'player:update', pose); }
}
