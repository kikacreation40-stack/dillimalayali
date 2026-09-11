export class MobileControls {
  readonly axes = { x: 0, z: 0, running: false };
  private pointer: number | null = null;
  private readonly stick = document.querySelector<HTMLElement>('#joystick')!;
  private readonly knob = document.querySelector<HTMLElement>('#joystick-knob')!;
  constructor() {
    const enabled = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    const toggle = document.querySelector<HTMLInputElement>('#touch-controls')!;
    toggle.checked = enabled; document.body.classList.toggle('touch', enabled);
    toggle.addEventListener('change', () => { document.body.classList.toggle('touch', toggle.checked); this.clear(); });
    const move = (e: PointerEvent) => {
      if (e.pointerId !== this.pointer) return;
      const r = this.stick.getBoundingClientRect();
      const dx = e.clientX - r.left - r.width / 2, dz = e.clientY - r.top - r.height / 2;
      const length = Math.hypot(dx, dz), scale = Math.max(42, length);
      this.axes.x = dx / scale; this.axes.z = dz / scale; this.axes.running = length > 55;
      this.knob.style.transform = `translate(${this.axes.x * 36}px, ${this.axes.z * 36}px)`;
    };
    this.stick.addEventListener('pointerdown', e => {
      if (this.pointer !== null) return;
      e.preventDefault(); this.pointer = e.pointerId; this.stick.setPointerCapture(e.pointerId); move(e);
    });
    this.stick.addEventListener('pointermove', move);
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) this.stick.addEventListener(event, () => this.clear());
    window.addEventListener('blur', () => this.clear());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.clear(); });
  }
  clear(): void { this.pointer = null; this.axes.x = 0; this.axes.z = 0; this.axes.running = false; this.knob.style.transform = ''; }
}
