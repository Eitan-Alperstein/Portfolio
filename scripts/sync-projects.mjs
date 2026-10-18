// npm run sync-projects
// Snapshots Eitan's public GitHub repos tagged with the `portfolio` topic into
// src/data/github-projects.json. The site builds from that snapshot plus
// src/data/projects.overrides.json, so builds never call GitHub.
//
// Uses GITHUB_TOKEN if set (the GitHub Action does this), else `gh auth token`
// if the GitHub CLI is logged in, else no token (fine: 60 requests/hour).
// Only public, non-archived, non-fork repos are included.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const USER = "Eitan-Alperstein";
const OUT = "src/data/github-projects.json";

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try { return execFileSync("gh", ["auth", "token"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { return ""; }
}

async function fetchAll() {
  const auth = token();
  const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "eitanalperstein.com-sync" };
  if (auth) headers.Authorization = `Bearer ${auth}`;
  const repos = [];
  // The public repo list (not topic search): topics show up here immediately,
  // while search can lag behind, and private repos are never returned.
  for (let page = 1; ; page++) {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?type=owner&per_page=100&page=${page}`, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

const repos = await fetchAll();
const projects = repos
  .filter((r) => !r.private && !r.archived && !r.fork && (r.topics ?? []).includes("portfolio"))
  .map((r) => ({
    name: r.name,
    description: r.description ?? "",
    homepage: r.homepage || null,
    url: r.html_url,
    topics: [...(r.topics ?? [])].sort(),
    language: r.language ?? null,
    // Creation date, not pushed_at: it never changes, so ordinary code pushes
    // don't touch the snapshot (and don't trigger a commit + deploy).
    created: (r.created_at ?? "").slice(0, 10),
  }))
  .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

const next = JSON.stringify(projects, null, 2) + "\n";
const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
fs.writeFileSync(OUT, next);
console.log(`${projects.length} portfolio repo(s): ${projects.map((p) => p.name).join(", ")}`);
console.log(prev === next ? "No changes." : `Updated ${OUT}.`);
