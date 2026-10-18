// npm run shots
// Copies screenshots from ~/dev/screenshots/<project>/ into public/shots/<project>/,
// resized to at most 1800px and re-encoded as JPEG (macOS `sips`), so the
// showcase galleries pick them up on the next build. Files are shown in
// filename order, so prefix them (01-, 02-...) to control the order.
// Override the source folder with SHOTS_SRC=/some/path npm run shots.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SRC = process.env.SHOTS_SRC || path.join(os.homedir(), "dev", "screenshots");
const DEST = path.join(process.cwd(), "public", "shots");
const PROJECTS = ["daily-tracker", "arduino-parkour"];
const IMAGE = /\.(png|jpe?g|webp|heic|tiff?|gif)$/i;

for (const project of PROJECTS) {
  const from = path.join(SRC, project), to = path.join(DEST, project);
  fs.mkdirSync(to, { recursive: true });
  const sources = fs.existsSync(from) ? fs.readdirSync(from).filter((f) => IMAGE.test(f)).sort() : [];

  const written = new Set();
  for (const file of sources) {
    const base = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const isGif = /\.gif$/i.test(file);
    const out = path.join(to, `${base}.${isGif ? "gif" : "jpg"}`);
    if (isGif) fs.copyFileSync(path.join(from, file), out);
    else execFileSync("sips", ["-Z", "1800", "-s", "format", "jpeg", "-s", "formatOptions", "85", path.join(from, file), "--out", out], { stdio: "ignore" });
    written.add(path.basename(out));
  }

  // Keep the folder in sync: drop images whose source was deleted.
  for (const f of fs.readdirSync(to)) {
    if (f !== ".gitkeep" && !written.has(f)) fs.rmSync(path.join(to, f));
  }
  console.log(`${project}: ${written.size} image(s)${sources.length ? "" : ` (none found in ${from})`}`);
}
