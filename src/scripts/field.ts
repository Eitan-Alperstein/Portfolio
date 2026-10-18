// Hero background: a slowly drifting Voronoi field. Points ease away from the
// cursor and the cell under it lights up. Pauses offscreen / in hidden tabs,
// and renders a single still frame for prefers-reduced-motion.
import { Delaunay } from "d3-delaunay";

type P = { x: number; y: number; vx: number; vy: number; ox: number; oy: number };

export function startField(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#9fb1ff";
  let w = 0, h = 0, dpr = 1, pts: P[] = [];
  let mouse = { x: -9999, y: -9999, active: false };
  let running = false, visible = true, raf = 0;

  function seed() {
    const n = Math.round(Math.min(90, Math.max(28, (w * h) / 16000)));
    pts = Array.from({ length: n }, () => {
      const x = Math.random() * w, y = Math.random() * h;
      const a = Math.random() * Math.PI * 2, s = 0.06 + Math.random() * 0.12;
      return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, ox: 0, oy: 0 };
    });
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(2, devicePixelRatio || 1);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed(); draw();
  }

  function step() {
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      // Displacement from the cursor eases in and out, so points never jump.
      let tx = 0, ty = 0;
      if (mouse.active) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        const R = 170;
        if (d < R && d > 0.001) { const f = (1 - d / R) ** 2 * 46; tx = (dx / d) * f; ty = (dy / d) * f; }
      }
      p.ox += (tx - p.ox) * 0.08; p.oy += (ty - p.oy) * 0.08;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const coords = pts.map((p) => [p.x + p.ox, p.y + p.oy] as [number, number]);
    const del = Delaunay.from(coords);
    const vor = del.voronoi([-2, -2, w + 2, h + 2]);

    if (mouse.active) {
      const i = del.find(mouse.x, mouse.y);
      ctx.beginPath(); vor.renderCell(i, ctx);
      ctx.fillStyle = accent; ctx.globalAlpha = 0.07; ctx.fill();
      ctx.globalAlpha = 0.5; ctx.strokeStyle = accent; ctx.lineWidth = 1; ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.beginPath(); vor.render(ctx);
    ctx.strokeStyle = "rgba(220, 226, 255, 0.1)"; ctx.lineWidth = 1; ctx.stroke();

    ctx.fillStyle = "rgba(220, 226, 255, 0.35)";
    for (const [x, y] of coords) { ctx.beginPath(); ctx.arc(x, y, 1.3, 0, Math.PI * 2); ctx.fill(); }
  }

  function loop() {
    if (!running) return;
    step(); draw();
    raf = requestAnimationFrame(loop);
  }
  function setRunning(on: boolean) {
    if (reduce) return;
    if (on && !running) { running = true; raf = requestAnimationFrame(loop); }
    if (!on && running) { running = false; cancelAnimationFrame(raf); }
  }

  const host = canvas.parentElement!;
  host.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top, active: e.pointerType === "mouse" };
    if (reduce) draw();
  });
  host.addEventListener("pointerleave", () => { mouse.active = false; if (reduce) draw(); });

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; setRunning(visible && !document.hidden); }).observe(canvas);
  document.addEventListener("visibilitychange", () => setRunning(visible && !document.hidden));
  resize();
  setRunning(true);
}
