// Images that `npm run shots` placed in public/shots/<slot>/, as public URLs,
// sorted by filename. Read at build time.
import fs from "node:fs";
import path from "node:path";

export function listShots(slot: string): string[] {
  const dir = path.join(process.cwd(), "public", "shots", slot);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f))
    .sort()
    .map((f) => `/shots/${slot}/${f}`);
}
