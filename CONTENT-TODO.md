# Content to fill in

Every slot below currently shows a "coming soon" placeholder on the site. Fill one in and that placeholder turns into the real thing on the next deploy. Nothing else needs to change.

Two ways content gets in:

- **Images** go through the screenshots pipeline. Drop files into a folder under `~/dev/screenshots/`, then run `npm run shots` from the repo root. It resizes them (max 1800 px), converts them to JPEG, and copies them into `public/shots/<slot>/`. Files show up in filename order, so name them `01-…`, `02-…` to control the order. Deleting a file from the source folder and re-running removes it from the site too.
- **Text and numbers** live in two data files: `src/data/life.ts` (music, tutoring, The Paw, academics, languages, volunteering) and `src/data/site.ts` (links and the "Right now" list). Edit the value and you're done.

After either, run `npm run build` to check it, then commit and push (see README.md for the deploy flow).

## Image slots

| Slot | Where it shows | Put files in | Notes |
|---|---|---|---|
| Profile photo | Home → About (replaces the "EA" tile) | `~/dev/screenshots/profile/` | Only the first image (by filename) is used. Portrait orientation (about 4:5) looks best; it is cropped to fill. Alternatively set `PHOTO` in `src/data/site.ts` to a path in `public/`. |
| Pedal poster | `/music` → "The Money for Nothing pedal" | `~/dev/screenshots/pedal-poster/` | Only the first image is used. |
| Pedal build photos | `/music` → "Build photos" | `~/dev/screenshots/pedal-build/` | Any number. |
| Daily Tracker screenshots | `/daily-tracker` → "What it looks like" | `~/dev/screenshots/daily-tracker/` | Any number. |
| Arduino Parkour photos | `/arduino-parkour` → "The real thing" | `~/dev/screenshots/arduino-parkour/` | Any number. |

Accepted formats: PNG, JPEG, WebP, HEIC, TIFF, GIF. GIFs are copied as-is (not resized), so keep them small. The script uses macOS's built-in `sips`, so run it on a Mac.

```sh
npm run shots      # copy + optimize every slot
npm run build      # check the pages
```

## Text and data slots

### Guitar recordings / videos (`/music` → "Hear me play")

Add entries to `music.guitar.recordings` in `src/data/life.ts`, newest first:

```ts
recordings: [
  { title: "Song title", note: "Optional short note", youtube: "https://www.youtube.com/watch?v=XXXXXXXXXXX" },
  { title: "Another song", audio: "/media/guitar/blues-jam.mp3" },
],
```

- `youtube`: any normal YouTube link (watch, youtu.be, or shorts). It's embedded with youtube-nocookie.
- `audio`: put the file (MP3 or M4A) in `public/media/guitar/` and reference it as `/media/guitar/<file>`. Keep files under ~10 MB.
- `note` is optional.

### "My name in every language" clips (`/languages`)

Each row plays a short audio clip of "Eitan" in that language. Two ways to fill them:

1. **Your own voice (most authentic).** Record yourself saying your name in each language and save the files as `public/audio/own/name-<id>.m4a` (or `.mp3`), where `<id>` is `en`, `he`, `es`, `ru`, `fr` or `ar`. Any file there automatically replaces the generated clip for that language on the next build; the others keep using the generated voice. Keep clips short (about 1 second) and trimmed.
2. **Better computer voices.** The generated clips (`public/audio/name-<id>.m4a`) currently use macOS's basic "compact" voices, which sound robotic. To upgrade: System Settings → Accessibility → Spoken Content → System Voice → Manage Voices, and download the Enhanced or Premium version of: **Ava** or **Zoe** (English, US), **Carmit** (Hebrew), **Mónica** (Spanish, Spain) or **Paulina** (Spanish, Mexico), **Milena** (Russian), **Thomas** or **Amélie** (French), **Majed** (Arabic). Then run:

```sh
npm run voices     # regenerates public/audio/name-*.m4a with the best installed voice
```

It prints which voice it used for each language. The texts and voice preferences are in `src/data/names.json`. If you change the AI caption ("The voices are computer-generated") after switching to your own recordings, it's in `src/pages/languages.astro`.

### The Paw stats (`/the-paw` → stat cards at the top)

`paw.stats` in `src/data/life.ts` is a list of `{ value, label }` cards, shown in order. Add, remove or reorder freely; the row adapts to 1–3 cards per line.

```ts
stats: [
  { value: "10+", label: "articles published since I took over business & advertising" },
  { value: "$X,XXX", label: "ad revenue in 2026–27" },
],
```

`value` is shown exactly as written. A card with `value: null` shows "coming soon" (that's how the yearly ad revenue slot works right now).

### The Paw articles (`/the-paw` → "Articles")

`paw.articles` in `src/data/life.ts` currently lists the 7 articles credited to Eitan in The Paw's archive (his own bylines). Add any that are missing:

```ts
{ title: "Article title", url: "https://www.thepawnews.com/<slug>", when: "Nov 2026", coAuthors: "with Someone" },
```

`when` is free text (e.g. "Nov 2026" or "2024–25"). `coAuthors` is optional. Keep the list newest first.

### Tutoring testimonials (`/tutoring` → "What families say")

Add to `tutoring.testimonials` in `src/data/life.ts`. Only use real quotes you have permission to share:

```ts
testimonials: [
  { quote: "…", name: "Parent of a 3rd grader" },
],
```

### SAT math tutoring launch (`/tutoring`)

When SAT math tutoring is available, in `src/data/life.ts`:
- remove `soon: true` from the `sat` level and change its `grades` from `"Coming soon"` to something like `"High school"`;
- remove the `{ label: "Coming soon", value: "SAT math" }` entry from `tutoring.facts`, or replace it.

### School farmette volunteering (`/volunteering` → "Starting soon")

Once it starts, move the entry from `volunteering.upcoming` to `volunteering.items` (give it a `where`), and update `volunteering.hours` if the total changes.

### Academics updates (`/academics`)

`academics.years` in `src/data/life.ts`. When AP scores come out, add the `score` to the course (and a `short` name like `"Calc BC"` for the homepage summary), and raise `academics.apExamsTaken` by the number of new exams. Remove `current: true` from a year once it's over, and add the new year at the top. Everything else is computed: the big "N/M" counter is (listed 5s) / `apExamsTaken`, and the "5s on AP …" lines list every course with a 5.

### "Right now" list (Home → About)

`NOW` in `src/data/site.ts`.
