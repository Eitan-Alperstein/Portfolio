// The project list = GitHub snapshot (src/data/github-projects.json, written by
// `npm run sync-projects`) + hand-written overrides (projects.overrides.json).
// See README.md → "How to add a project" for the topics and fields.
import github from "../data/github-projects.json";
import overrides from "../data/projects.overrides.json";

export type Group = "students" | "mine" | "sims";

export interface Project {
  key: string; // repo name, or the `id` of a private entry
  title: string;
  blurb: string;
  stack: string[];
  url: string | null; // "Visit": a live site, or a page on this site like "/daily-tracker"
  repo: string | null; // "Code": only ever set for public repos
  group: Group;
  ai: boolean;
  hero?: number; // featured card position (1 = first)
  slug?: string; // featured artwork, see Featured.astro
  long?: string; // featured card text
}

type Override = Partial<Omit<Project, "key" | "repo">>;
interface Repo { name: string; description: string; homepage: string | null; url: string; topics: string[]; language: string | null; created: string }

// Topics that control the site rather than describe the stack.
const GROUP_TOPICS: Record<string, Group> = { "for-students": "students", tools: "mine", simulation: "sims" };
const CONTROL = new Set(["portfolio", "portfolio-featured", "ai", ...Object.keys(GROUP_TOPICS)]);

// Display names for stack topics, in the order tags are shown (frameworks and
// platforms first, then languages, then libraries). Unknown topics are
// title-cased and shown after these.
const STACK: [string, string][] = [
  ["vite", "Vite"], ["tauri", "Tauri"], ["nextjs", "Next.js"], ["astro", "Astro"], ["react", "React"], ["arduino", "Arduino"],
  ["javascript", "JavaScript"], ["typescript", "TypeScript"], ["python", "Python"], ["rust", "Rust"], ["swift", "Swift"], ["cpp", "C++"],
  ["canvas", "Canvas"], ["tailwind", "Tailwind"], ["supabase", "Supabase"], ["firebase", "Firebase"], ["html-css-js", "HTML/CSS/JS"],
];
const STACK_LABEL = new Map(STACK);
const STACK_RANK = new Map(STACK.map(([t], i) => [t, i]));

const titleCase = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function fromRepo(r: Repo): Project {
  const stackTopics = r.topics.filter((t) => !CONTROL.has(t))
    .sort((a, b) => (STACK_RANK.get(a) ?? 999) - (STACK_RANK.get(b) ?? 999));
  const stack = stackTopics.map((t) => STACK_LABEL.get(t) ?? titleCase(t));
  // No stack topics: fall back to GitHub's primary language.
  if (!stack.length && r.language) stack.push(r.language);
  const group = r.topics.map((t) => GROUP_TOPICS[t]).find(Boolean) ?? "mine";
  return {
    key: r.name,
    title: titleCase(r.name),
    blurb: r.description,
    stack,
    url: r.homepage,
    repo: r.url,
    group,
    ai: r.topics.includes("ai"),
    hero: r.topics.includes("portfolio-featured") ? 100 : undefined,
  };
}

const repoOverrides = overrides.repos as Record<string, Override>;
const publicProjects = (github as Repo[]).map((r) => {
  const p: Project = { ...fromRepo(r), ...repoOverrides[r.name] };
  // The portfolio-featured topic decides *whether* a repo is featured; the
  // override's `hero` only sets its position.
  if (!r.topics.includes("portfolio-featured")) delete p.hero;
  return p;
});
const privateProjects = (overrides.private as (Override & { id: string })[]).map(({ id, ...p }) => ({ key: id, repo: null, ...p }) as Project);

const order = overrides.order as string[];
const created = new Map((github as Repo[]).map((r) => [r.name, r.created]));
const rank = (p: Project) => { const i = order.indexOf(p.key); return i === -1 ? Infinity : i; };

/** Every project, in display order: the overrides' `order` list first, then any
 *  newly tagged repos (newest first). */
export const projects: Project[] = [...publicProjects, ...privateProjects].sort((a, b) =>
  rank(a) - rank(b) || (created.get(b.key) ?? "").localeCompare(created.get(a.key) ?? ""));

/** Featured cards, in `hero` order. */
export const featured = projects.filter((p) => p.hero !== undefined).sort((a, b) => a.hero! - b.hero! || rank(a) - rank(b));

export const project = (key: string) => {
  const p = projects.find((x) => x.key === key);
  if (!p) throw new Error(`No project "${key}". Is the repo still tagged "portfolio"?`);
  return p;
};
