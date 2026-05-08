export class ParticleField {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.state = 'idle'; // idle | listening | speaking | thinking
    this.tick = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.init();
    this.loop();
  }

  resize() {
    this.W = this.canvas.width = window.innerWidth;
    this.H = this.canvas.height = window.innerHeight;
    this.init();
  }

  init() {
    this.particles = [];
    const count = Math.min(Math.floor((this.W * this.H) / 5500), 200);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        baseR: Math.random() * 1.6 + 0.4,
        r: 1,
        alpha: Math.random() * 0.45 + 0.08,
        hue: Math.random() * 60 + 200,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  setState(state) {
    this.state = state;
  }

  loop() {
    requestAnimationFrame(() => this.loop());
    const { ctx, W, H, particles, state } = this;
    ctx.clearRect(0, 0, W, H);
    this.tick++;

    const speed   = state === 'listening' ? 3.8
                  : state === 'speaking'  ? 2.8
                  : state === 'thinking'  ? 2.0 : 1.0;
    const maxDist = state === 'listening' ? 130
                  : state === 'speaking'  ? 115
                  : state === 'thinking'  ? 100 : 75;
    const hueShift = state === 'listening' ? 55
                   : state === 'speaking'  ? 25 : 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.phase += 0.018;
      p.x += p.vx * speed + Math.sin(p.phase * 0.65) * 0.12;
      p.y += p.vy * speed + Math.cos(p.phase * 0.5)  * 0.12;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      p.r = state === 'speaking'
        ? p.baseR + Math.sin(this.tick * 0.14 + p.phase) * 1.6
        : state === 'listening'
        ? p.baseR + Math.abs(Math.sin(this.tick * 0.18 + p.phase)) * 2.0
        : p.baseR;

      const hue   = p.hue + hueShift * Math.sin(this.tick * 0.04 + p.phase);
      const alpha = p.alpha + (state !== 'idle' ? 0.18 : 0);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue},78%,65%,${alpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `hsla(${hue},70%,65%,${(1 - d / maxDist) * 0.16})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }
}