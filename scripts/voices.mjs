// npm run voices
// Generates the "my name in every language" clips on /languages with macOS
// text-to-speech (`say`), then converts them to AAC .m4a with `afconvert`.
// For each language it uses the best installed voice from the list in
// src/data/names.json, preferring "(Premium)", then "(Enhanced)", then the
// default version. Output: public/audio/name-<id>.m4a.
// Your own recordings in public/audio/own/name-<id>.m4a are never touched,
// and the site plays them instead of the generated ones.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const names = JSON.parse(fs.readFileSync("src/data/names.json", "utf8"));
const OUT = path.join("public", "audio");
fs.mkdirSync(OUT, { recursive: true });

// "Carmit (Enhanced)    he_IL    # ..." -> { name, locale }
const installed = execFileSync("say", ["-v", "?"], { encoding: "utf8" })
  .split("\n")
  .map((l) => l.match(/^(.+?)\s{2,}([a-z]{2,3}_[A-Z0-9]{2,3})\s+#/))
  .filter(Boolean)
  .map((m) => ({ name: m[1].trim(), locale: m[2] }));

const lang = (locale) => locale.split("_")[0];

// Best quality tier first; within a tier, the exact locale (e.g. fr_FR)
// beats the same language elsewhere (fr_CA); then the order in names.json.
function pickVoice(entry) {
  const exact = installed.filter((v) => v.locale === entry.locale);
  const sameLang = installed.filter((v) => lang(v.locale) === lang(entry.locale));
  for (const tier of ["(Premium)", "(Enhanced)", ""]) {
    for (const pool of [exact, sameLang]) {
      for (const want of entry.voices) {
        const hit = pool.find((v) => tier ? v.name === `${want} ${tier}` : v.name === want);
        if (hit) return hit.name;
      }
    }
  }
  return null;
}

const used = [];
for (const entry of names) {
  const voice = pickVoice(entry);
  if (!voice) {
    console.warn(`${entry.label}: none of [${entry.voices.join(", ")}] is installed, skipping`);
    continue;
  }
  const tmp = path.join(os.tmpdir(), `name-${entry.id}.aiff`);
  const out = path.join(OUT, `name-${entry.id}.m4a`);
  execFileSync("say", ["-v", voice, "-r", "150", "-o", tmp, entry.text]);
  execFileSync("afconvert", [tmp, out, "-f", "m4af", "-d", "aac"]);
  fs.rmSync(tmp);
  const quality = voice.includes("(Premium)") ? "premium" : voice.includes("(Enhanced)") ? "enhanced" : "default (compact) voice";
  used.push(`${entry.label}: ${voice} (${quality})`);
}
console.log(used.join("\n"));
if (used.some((u) => u.endsWith("compact) voice)"))) {
  console.log("\nTip: download Enhanced/Premium voices in System Settings → Accessibility → Spoken Content → System Voice → Manage Voices, then run `npm run voices` again.");
}
