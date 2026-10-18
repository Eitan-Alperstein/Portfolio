// A 16x2 character LCD simulation of Arduino Parkour, ported from
// parkour_game.ino: same timings, difficulty ramp, wraparound and the rule
// that a wall line is only checked as it scrolls off the bottom.
// Plays itself (unless reduced motion is on) until someone presses an arrow key or the on-screen buttons.

const COLS = 16;
const WALL_START = 1600, WALL_MIN = 500, WALL_STEP = 20;
const JUMP_START = 3, JUMP_MAX = 6, WIDTH_START = 5, WIDTH_MIN = 1;

// HD44780-style 5x7 glyphs for the game-over screen.
const FONT: Record<string, string> = {
  "0": "01110100011001110101110011000101110", "1": "00100011000010000100001000010001110",
  "2": "01110100010000100010001000100011111", "3": "11111000100010000010000011000101110",
  "4": "00010001100101010010111110001000010", "5": "11111100001111000001000011000101110",
  "6": "00110010001000011110100011000101110", "7": "11111000010001000100010000100001000",
  "8": "01110100011000101110100011000101110", "9": "01110100011000101111000010001001100",
  G: "01110100011000010111100011000101111", O: "01110100011000110001100011000101110",
  S: "01111100001000001110000010000111110", H: "10001100011000111111100011000110001",
  a: "00000000000111000001011111000101111", m: "00000000001101010101101011000110001",
  e: "00000000000111010001111111000001110", v: "00000000001000110001100010101000100",
  r: "00000000001011011001100001000010000", i: "00100000000110000100001000010001110",
  g: "00000011111000110001011110000101110", h: "10000100001011011001100011000110001",
  "!": "00100001000010000100000000000000100", ":": "00000011000110000000011000110000000",
};

export function startLcd(root: HTMLElement) {
  const canvas = root.querySelector("canvas")!;
  const ctx = canvas.getContext("2d")!;
  const scoreEl = root.querySelector<HTMLElement>("[data-score]")!;
  const modeEl = root.querySelector<HTMLElement>("[data-mode]")!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Geometry: each character is 5x8 dots.
  const DOT = 6, DGAP = 1, CGAP = 5, RGAP = 8, PAD = 18;
  const CW = 5 * DOT + 4 * DGAP, CH = 8 * DOT + 7 * DGAP;
  canvas.width = PAD * 2 + COLS * CW + (COLS - 1) * CGAP;
  canvas.height = PAD * 2 + 2 * CH + RGAP;

  let gapStart = [0, 0, 0, 0], gapWidth = [0, 0, 0, 0];
  let player = 8, score = 0, high = 0, over = false;
  let wallInterval = WALL_START, gapJump = JUMP_START, widthCur = WIDTH_START, sub = 0;
  let demo = !reduce, started = !reduce, left = false, right = false, last = 0, overAt = 0, visible = true;

  const rand = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
  const inGap = (c: number, i: number) => c >= gapStart[i] && c < gapStart[i] + gapWidth[i];

  function reset() {
    player = COLS / 2; widthCur = WIDTH_START;
    const s = Math.max(0, Math.min(player - Math.floor(widthCur / 2), COLS - widthCur));
    gapStart = [s, s, s, s]; gapWidth = [widthCur, widthCur, widthCur, widthCur];
    over = false; score = 0; wallInterval = WALL_START; gapJump = JUMP_START; sub = 0;
  }

  function shift(): boolean {
    const exS = gapStart[3], exW = gapWidth[3];
    for (let i = 3; i > 0; i--) { gapStart[i] = gapStart[i - 1]; gapWidth[i] = gapWidth[i - 1]; }
    let lo = Math.max(0, gapStart[1] - gapJump), hi = Math.min(COLS - widthCur, gapStart[1] + gapJump);
    if (lo > hi) lo = hi = Math.max(0, Math.min(gapStart[1], COLS - widthCur));
    gapStart[0] = rand(lo, hi); gapWidth[0] = widthCur;
    score++;
    if (wallInterval > WALL_MIN) wallInterval -= Math.min(WALL_STEP, wallInterval - WALL_MIN);
    const prog = (WALL_START - wallInterval) / (WALL_START - WALL_MIN);
    gapJump = JUMP_START + Math.floor((JUMP_MAX - JUMP_START) * prog);
    widthCur = WIDTH_START - Math.floor((WIDTH_START - WIDTH_MIN) * prog);
    return player >= exS && player < exS + exW;
  }

  // Demo player: get into the gap that's checked next, then drift toward the one after it.
  function autoMove(): number {
    const toward = (i: number) => {
      if (inGap(player, i)) return 0;
      const mid = gapStart[i] + (gapWidth[i] - 1) / 2;
      return mid < player ? -1 : 1;
    };
    const first = toward(3);
    if (first !== 0) return first;
    const next = toward(2);
    return next !== 0 && inGap((player + next + COLS) % COLS, 3) ? next : 0;
  }

  function tick() {
    const dir = demo ? autoMove() : (left && !right ? -1 : right && !left ? 1 : 0);
    player = (player + dir + COLS) % COLS;
    if (++sub >= 5) {
      sub = 0;
      if (!shift()) { over = true; high = Math.max(high, score); overAt = performance.now(); }
    }
  }

  function dotsFor(r: number, c: number): string {
    if (over) {
      const lines = ["Game Over!", `S:${score} High:${high}`];
      const g = FONT[lines[r][c] ?? " "];
      return g ? g + "00000" : "0".repeat(40);
    }
    const w1 = !inGap(c, r * 2), w2 = !inGap(c, r * 2 + 1), p = r === 1 && c === player;
    return "00000" + (w1 ? "11111" : "00000") + "000000000000000" + (w2 ? "11111" : "00000") + "00000" + (p ? "00100" : "00000");
  }

  function draw() {
    ctx.fillStyle = "#1c2f8f"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < 2; r++) for (let c = 0; c < COLS; c++) {
      const bits = dotsFor(r, c), x0 = PAD + c * (CW + CGAP), y0 = PAD + r * (CH + RGAP);
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = bits[i] === "1" ? "#e8eeff" : "rgba(120, 145, 255, 0.16)";
        ctx.fillRect(x0 + (i % 5) * (DOT + DGAP), y0 + Math.floor(i / 5) * (DOT + DGAP), DOT, DOT);
      }
    }
    scoreEl.textContent = String(score);
    modeEl.textContent = !started ? "Press ← or → to play" : demo ? "Demo mode: playing itself" : "You're playing";
  }

  function frame(now: number) {
    if (!visible) return;
    if (over) {
      if (demo && now - overAt > 2600) { reset(); last = now; }
    } else if (started) {
      const playerInterval = wallInterval / 5;
      if (now - last > 2000) last = now;
      while (now - last >= playerInterval && !over) { last += playerInterval; tick(); }
    }
    draw();
    requestAnimationFrame(frame);
  }

  const takeOver = () => { if (!started) { started = true; reset(); last = performance.now(); } else if (demo) { demo = false; reset(); last = performance.now(); } else if (over) { reset(); last = performance.now(); } };
  const hold = (dir: "l" | "r", on: boolean) => { if (on) takeOver(); if (dir === "l") left = on; else right = on; };
  root.querySelectorAll<HTMLButtonElement>("[data-dir]").forEach((b) => {
    const d = b.dataset.dir as "l" | "r";
    b.addEventListener("pointerdown", (e) => { e.preventDefault(); hold(d, true); });
    for (const ev of ["pointerup", "pointerleave", "pointercancel"]) b.addEventListener(ev, () => hold(d, false));
  });
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); hold(e.key === "ArrowLeft" ? "l" : "r", true); }
    if (e.key === " " && over) { e.preventDefault(); takeOver(); }
  });
  root.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") left = false;
    if (e.key === "ArrowRight") right = false;
  });

  reset();
  new IntersectionObserver(([e]) => {
    const was = visible; visible = e.isIntersecting;
    if (visible && !was) { last = performance.now(); requestAnimationFrame(frame); }
  }).observe(canvas);
  last = performance.now();
  requestAnimationFrame(frame);
}
