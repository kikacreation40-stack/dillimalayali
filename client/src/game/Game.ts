import { ACESFilmicToneMapping, CircleGeometry, Mesh, MeshBasicMaterial, PCFSoftShadowMap, PerspectiveCamera, WebGLRenderer } from 'three';
import { CameraController } from './CameraController';
import { CharacterController } from './CharacterController';
import { Player } from './Player';
import { World } from './World';
import { NetworkManager } from '../network/NetworkManager';
import { RemotePlayer } from './RemotePlayer';
import { TeleportUI } from '../ui/TeleportUI';
import { CommunityUI } from '../ui/CommunityUI';
import { MobileControls } from '../ui/MobileControls';
import { Vehicle } from './Vehicle';
import { VehicleController } from './VehicleController';
import { ChatUI } from '../ui/ChatUI';
import { LoginUI } from '../ui/LoginUI';
import { NameTags } from '../ui/NameTags';
import type { PlayerState } from '../../../shared/types';
import { TICK_RATE } from '../../../shared/constants';

export class Game {
  private readonly world = new World();
  private readonly player = new Player();
  private readonly camera = new PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 230);
  private readonly renderer: WebGLRenderer;
  private readonly cameraController: CameraController;
  private readonly controller = new CharacterController(this.player, this.world.collision);
  private readonly mobile = new MobileControls();
  private readonly login = new LoginUI();
  private readonly tags = new NameTags();
  private players: PlayerState[] = [];
  private readonly network = new NetworkManager();
  private readonly chat = new ChatUI(this.network, message => this.notify(message));
  private readonly community = new CommunityUI(this.network, message => this.notify(message));
  private readonly teleport = new TeleportUI(this.network, message => this.notify(message));
  private noticeTimer = 0;
  private uiTime = 0;
  private audio: AudioContext | null = null;
  private readonly vehicles = new Map<string, Vehicle>();
  private readonly vehicleController = new VehicleController();
  private vehicleId: string | null = null;
  private nearbyVehicle = '';
  private readonly remotes = new Map<string, RemotePlayer>();
  private networkTime = 0;
  private spawned = false;
  private started = false;
  private paused = false;
  private lastTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.controller.mobile = this.mobile.axes;
    this.renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;
    this.cameraController = new CameraController(this.camera, canvas, this.world.collision);
    this.world.scene.add(this.player.mesh);
    const shadow = new Mesh(new CircleGeometry(0.65, 16), new MeshBasicMaterial({ color: 0x34493c, opacity: 0.18, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.1;
    this.player.mesh.add(shadow);
    this.camera.position.set(43, 38, 55);
    this.camera.lookAt(-5, 0, 0);
    this.network.onStatus = status => {
      document.querySelector('#connection-status')!.textContent = status;
      this.notify(status === 'Connected' ? 'Welcome to Delhi Malayali World. Explore Delhi. Meet Malayalis. Say hello.' : status);
      if (!this.network.ready) this.spawned = false;
    };
    this.network.onCorrection = p => { this.player.mesh.position.set(p.x, 0.06, p.z); this.player.mesh.rotation.y = p.rotation; this.vehicleController.speed = 0; };
    this.network.onSnapshot = state => {
      this.players = state.players;
      for (const v of state.vehicles) {
        let vehicle = this.vehicles.get(v.id);
        if (!vehicle) { vehicle = new Vehicle(v); this.vehicles.set(v.id, vehicle); this.world.scene.add(vehicle.mesh); }
        vehicle.state = v;
      }
      const self = state.players.find(p => p.id === this.network.id);
      if ((self?.vehicleId || null) !== this.vehicleId) { this.vehicleId = self?.vehicleId || null; this.vehicleController.speed = 0; if (self?.vehicleId) this.cameraController.yaw = self.rotation + Math.PI; }
      this.player.mesh.visible = !this.vehicleId;
      if (self) this.player.setAvatar(self.avatar);
      if (self && !this.spawned) { this.player.mesh.position.set(self.x, 0.06, self.z); this.player.setColor(self.color); this.spawned = true; }
      const ids = new Set(state.players.map(p => p.id));
      for (const [id, remote] of this.remotes) if (!ids.has(id) || id === this.network.id) { remote.dispose(); this.remotes.delete(id); }
      for (const p of state.players) if (p.id !== this.network.id) {
        let remote = this.remotes.get(p.id);
        if (!remote) { remote = new RemotePlayer(p); this.remotes.set(p.id, remote); this.world.scene.add(remote.mesh); }
        remote.receive(p);
      }
    };
    this.player.setAvatar(this.login.profile.avatar);
    document.querySelector('#avatar')!.addEventListener('change', () => this.player.setAvatar(document.querySelector<HTMLSelectElement>('#avatar')!.value === 'female' ? 'female' : 'male'));
    this.network.socket.on('player:teleported', (pose: { x: number; z: number; rotation: number }) => {
      this.controller.clear(); this.mobile.clear(); this.vehicleController.speed = 0; this.vehicleId = null;
      this.player.mesh.position.set(pose.x, 0.06, pose.z); this.player.mesh.rotation.y = pose.rotation;
      this.cameraController.yaw = pose.rotation + Math.PI; this.cameraController.snapTo(this.player.mesh.position);
    });
    document.querySelector('#login-form')!.addEventListener('submit', e => { e.preventDefault(); this.start(); });
    document.querySelector('#save-settings')!.addEventListener('click', () => {
      const profile = { ...this.login.profile, avatar: document.querySelector<HTMLSelectElement>('#settings-avatar')!.value === 'female' ? 'female' as const : 'male' as const };
      for (const key of ['showName', 'showHometown', 'allowTalk'] as const) profile[key] = document.querySelector<HTMLInputElement>(`#${key}`)!.checked;
      this.network.socket.timeout(5000).emit('player:profile', profile, (err: Error | null, reply: { ok: boolean; error?: string }) => {
        document.querySelector('#settings-status')!.textContent = !err && reply?.ok ? 'Settings saved.' : reply?.error || 'Could not save. Check your connection.';
        if (!err && reply?.ok) { this.login.profile = profile; this.login.save(); this.network.setProfile(profile); }
      });
    });
    document.querySelector('#reconnect')!.addEventListener('click', () => { this.network.socket.disconnect(); this.network.join(this.login.profile); this.pause(false); });
    document.querySelector('#sound')!.addEventListener('change', () => { if (document.querySelector<HTMLInputElement>('#sound')!.checked) { this.audio ??= new AudioContext(); void this.audio.resume(); } });
    this.network.socket.on('chat:message', message => {
      if (message.from === this.network.id || !document.querySelector<HTMLInputElement>('#sound')!.checked || !this.audio) return;
      const oscillator = this.audio.createOscillator(), gain = this.audio.createGain(); oscillator.frequency.value = 620; gain.gain.setValueAtTime(0.04, this.audio.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.audio.currentTime + 0.12); oscillator.connect(gain); gain.connect(this.audio.destination); oscillator.start(); oscillator.stop(this.audio.currentTime + 0.12); oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
    document.querySelector('#mobile-chat')!.addEventListener('click', () => this.chat.focus());
    document.querySelector('#drive')!.addEventListener('click', () => this.drive());
    document.querySelector('#menu')!.addEventListener('click', () => this.pause(true));
    document.querySelector('#resume')!.addEventListener('click', () => this.pause(false));
    window.addEventListener('keydown', e => {
      if (this.started && !this.paused && !this.typing()) { if (e.code === 'KeyF' && !e.repeat) this.drive(); if (e.code === 'KeyE') this.chat.request(); if (e.code === 'Enter') { e.preventDefault(); this.chat.focus(); } }
    });
    window.addEventListener('keydown', e => { if (e.code === 'Escape' && this.started) this.pause(!this.paused); });
    window.addEventListener('blur', () => { if (this.started) this.pause(true); });
    window.addEventListener('resize', () => {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
    });
    this.renderer.setAnimationLoop(time => this.frame(time));
  }

  private drive(): void {
    if (!this.network.ready || this.paused) return;
    const ack = (err: Error | null, reply: { ok: boolean; error?: string }) => { if (err || !reply?.ok) this.notify(reply?.error || 'Vehicle request failed.'); };
    if (this.vehicleId) {
      const p = this.player.mesh.position;
      for (const [dx, dz] of [[2.7, 0], [-2.7, 0], [0, 2.7], [0, -2.7]]) if (!this.world.collision.blocked(p.x + dx, p.z + dz)) {
        this.network.socket.timeout(5000).emit('vehicle:exit', { x: p.x + dx, z: p.z + dz }, ack); return;
      }
      this.notify('Find a little more space to exit.');
    } else if (this.nearbyVehicle) this.network.socket.timeout(5000).emit('vehicle:enter', this.nearbyVehicle, ack);
  }
  private typing(): boolean { return /INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName || '') || !document.querySelector('#report-panel')!.classList.contains('hidden'); }
  private notify(message: string): void {
    const hint = document.querySelector('#hint')!; hint.textContent = message; hint.classList.remove('fade');
    window.clearTimeout(this.noticeTimer); this.noticeTimer = window.setTimeout(() => hint.classList.add('fade'), 5000);
  }
  private start(): void {
    this.started = true;
    this.network.join(this.login.read());
    document.querySelector('#welcome')!.classList.add('hidden');
    document.querySelector('#hud')!.classList.remove('hidden');
    this.pause(false);
    (document.activeElement as HTMLElement)?.blur();
    setTimeout(() => document.querySelector('#hint')!.classList.add('fade'), 6500);
  }

  private pause(value: boolean): void {
    this.paused = value;
    this.controller.enabled = !value;
    this.controller.clear(); this.mobile.clear(); this.vehicleController.speed = 0;
    this.cameraController.enabled = !value;
    document.querySelector('#pause')!.classList.toggle('hidden', !value);
    if (value) document.querySelector<HTMLButtonElement>('#resume')!.focus();
    else (document.activeElement as HTMLElement)?.blur();
  }

  private frame(time: number): void {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    if (this.started) {
      this.controller.enabled = !this.paused && this.network.ready && !this.teleport.busy && !this.typing();
      if (this.vehicleId) {
        const axes = this.controller.axes();
        const rotation = this.player.mesh.rotation.y;
        if (this.controller.enabled) this.vehicleController.update(dt, -axes.z, axes.x, this.player, this.world.collision); else this.vehicleController.speed = 0;
        this.cameraController.yaw += this.player.mesh.rotation.y - rotation;
      } else this.controller.update(dt, this.cameraController.yaw);
      this.cameraController.update(this.player.mesh.position, dt);
    }
    for (const remote of this.remotes.values()) remote.update(dt);
    this.networkTime += dt;
    if (this.networkTime >= 1 / TICK_RATE && this.spawned) {
      this.networkTime = 0;
      this.network.update({ x: this.player.mesh.position.x, z: this.player.mesh.position.z, rotation: this.player.mesh.rotation.y }, !!this.vehicleId);
    }
    const pos = this.player.mesh.position;
    let nearest = 4; this.nearbyVehicle = '';
    for (const [id, vehicle] of this.vehicles) {
      if (id === this.vehicleId) { vehicle.mesh.position.copy(pos); vehicle.mesh.rotation.y = this.player.mesh.rotation.y; }
      else vehicle.update(dt);
      const distance = Math.hypot(vehicle.mesh.position.x - pos.x, vehicle.mesh.position.z - pos.z);
      if (distance < nearest) { nearest = distance; this.nearbyVehicle = id; }
    }
    const drive = document.querySelector<HTMLButtonElement>('#drive')!;
    drive.hidden = !this.network.ready || (!this.vehicleId && !this.nearbyVehicle);
    drive.disabled = !this.vehicleId && !!this.vehicles.get(this.nearbyVehicle)?.state.driverId;
    drive.textContent = this.vehicleId ? 'F · EXIT VEHICLE' : drive.disabled ? 'Occupied' : 'F · DRIVE';
    this.uiTime += dt;
    if (this.uiTime > 0.1 && this.started) {
      this.uiTime = 0;
      if (import.meta.env.DEV) { this.renderer.domElement.dataset.drawCalls = String(this.renderer.info.render.calls); this.renderer.domElement.dataset.triangles = String(this.renderer.info.render.triangles); }
      this.chat.update(this.players, pos.x, pos.z, new Set([...this.community.blocked, ...this.community.muted]));
      this.community.update(this.players, pos.x, pos.z, this.player.mesh.rotation.y);
    }
    this.tags.update(this.players, this.camera, this.player.mesh.position.x, this.player.mesh.position.z);
    this.renderer.render(this.world.scene, this.camera);
  }
}
