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

### The Paw ad revenue (`/the-paw` → third stat card)

Set `paw.adRevenue` in `src/data/life.ts`:

```ts
adRevenue: { amount: "$X,XXX", period: "2026–27" },
```

It's shown exactly as written. Leave it `null` to keep the "coming soon" card.

### The Paw articles (`/the-paw` → "Articles")

`paw.articles` in `src/data/life.ts` currently lists the 7 articles credited to Eitan in The Paw's archive. Add any missing ones (he's written 10+):

```ts
{ title: "Article title", url: "https://www.thepawnews.com/<slug>", when: "Nov 2026", coAuthors: "with Someone" },
```

`when` is free text (e.g. "Nov 2026" or "2024–25"). `coAuthors` is optional. Keep the list newest first. If the article count changes, update `paw.articlesWritten` too.

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

`academics.years` in `src/data/life.ts`. When AP scores come out, add `score: 5` (or whatever it is) to the course. Remove `current: true` from a year once it's over, and add the new year at the top. The summary line is `academics.apSummary`, which you update by hand. The big "N/N" counter is computed from the scores.

### "Right now" list (Home → About)

`NOW` in `src/data/site.ts`.
