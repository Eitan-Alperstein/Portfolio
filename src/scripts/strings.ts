// Pluckable guitar strings in standard tuning. Each pluck is synthesized with
// the Karplus-Strong algorithm (a noise burst fed through a short, damped
// delay line), and the waveform is drawn as it plays.

const NOTES = [
  { name: "E", freq: 82.41 }, { name: "A", freq: 110.0 }, { name: "D", freq: 146.83 },
  { name: "G", freq: 196.0 }, { name: "B", freq: 246.94 }, { name: "e", freq: 329.63 },
];

export function startStrings(root: HTMLElement) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scope = root.querySelector<HTMLCanvasElement>("canvas")!;
  const sctx = scope.getContext("2d")!;
  const lines: SVGPathElement[] = [];
  root.querySelectorAll<SVGPathElement>("[data-string]").forEach((el) => { lines[Number(el.dataset.string)] = el; });
  const label = root.querySelector<HTMLElement>("[data-note]")!;
  let ac: AudioContext | null = null, analyser: AnalyserNode | null = null;
  const energy = new Array(6).fill(0), phase = new Array(6).fill(0);
  let raf = 0;

  function audio() {
    if (!ac) {
      ac = new AudioContext();
      analyser = ac.createAnalyser(); analyser.fftSize = 2048;
      const gain = ac.createGain(); gain.gain.value = 0.55;
      gain.connect(analyser); analyser.connect(ac.destination);
      (ac as any)._out = gain;
    }
    return ac;
  }

  function synth(ctx: AudioContext, freq: number) {
    const sr = ctx.sampleRate, len = Math.floor(sr * 2.6), period = Math.round(sr / freq);
    const buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
    const ring = new Float32Array(period);
    for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
    let p = 0, prev = 0;
    for (let i = 0; i < len; i++) {
      const cur = ring[p];
      const next = 0.4985 * (cur + prev) + 0.0025 * cur; // averaging = string damping
      prev = cur; ring[p] = next; d[i] = cur;
      p = (p + 1) % period;
    }
    for (let i = 0; i < 64; i++) d[i] *= i / 64; // soften the attack click
    return buf;
  }

  function pluck(i: number) {
    const ctx = audio();
    if (ctx.state === "suspended") ctx.resume();
    const src = ctx.createBufferSource();
    src.buffer = synth(ctx, NOTES[i].freq);
    src.connect((ctx as any)._out); src.start();
    energy[i] = 1; label.textContent = `${NOTES[i].name} · ${NOTES[i].freq.toFixed(1)} Hz`;
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function drawScope() {
    const w = scope.width = scope.clientWidth * devicePixelRatio, h = scope.height = scope.clientHeight * devicePixelRatio;
    sctx.clearRect(0, 0, w, h);
    sctx.strokeStyle = "rgba(220,226,255,0.08)"; sctx.lineWidth = 1;
    sctx.beginPath(); sctx.moveTo(0, h / 2); sctx.lineTo(w, h / 2); sctx.stroke();
    if (!analyser) return;
    const data = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(data);
    sctx.strokeStyle = "#9fb1ff"; sctx.lineWidth = 2 * devicePixelRatio; sctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * w, y = h / 2 - data[i] * h * 0.9;
      i ? sctx.lineTo(x, y) : sctx.moveTo(x, y);
    }
    sctx.stroke();
  }

  function frame() {
    let alive = false;
    lines.forEach((el, i) => {
      if (energy[i] > 0.002) {
        alive = true;
        energy[i] *= 0.955; phase[i] += 1.1 + i * 0.25;
        const a = reduce ? 0 : Math.sin(phase[i]) * 7 * energy[i];
        el.setAttribute("d", `M 0 0 Q 300 ${a.toFixed(2)} 600 0`);
        el.classList.add("live");
      } else { el.setAttribute("d", "M 0 0 Q 300 0 600 0"); el.classList.remove("live"); }
    });
    drawScope();
    raf = alive ? requestAnimationFrame(frame) : 0;
    if (!alive) setTimeout(drawScope, 0);
  }

  root.querySelectorAll<HTMLButtonElement>("[data-pluck]").forEach((b) =>
    b.addEventListener("click", () => pluck(Number(b.dataset.pluck))));
  root.querySelector<HTMLButtonElement>("[data-strum]")?.addEventListener("click", () =>
    [0, 1, 2, 3, 4, 5].forEach((i) => setTimeout(() => pluck(i), i * 45)));
  drawScope();
}
