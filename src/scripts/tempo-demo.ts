// The two interactive demos on /tempo. Both run Tempo's real code (copied into
// ./tempo/): the quick-add parser turns a line into fields, and the scorer ranks
// a sample task list. Tasks added in the quick-add box join that list.
import { parseTaskInput, type ParsedTask } from "./tempo/parse/index";
import { scoreTask, WEIGHTS, type ScoreBreakdown } from "./tempo/score";
import { addDays, atLocalTime, DAY, daysUntil, formatBlock, formatDue, formatDuration, localDate } from "./tempo/time";
import type { Project, Task } from "./tempo/types";

const PROJECTS: Project[] = [
  { id: "school", name: "School" },
  { id: "engineering", name: "Engineering" },
  { id: "newspaper", name: "Newspaper" },
  { id: "guitar", name: "Guitar" },
];
const IMPORTANCE = ["", "Lowest", "Low", "Normal", "High", "Top"];

interface DemoTask {
  id: string;
  title: string;
  importance: number;
  /** Days from today, or null for no deadline. */
  dueOffset: number | null;
  dueTime: string | null;
  schedStart: string | null;
  schedEnd?: string;
  estimateMin: number | null;
  /** How long ago it was created (matters for undated tasks). */
  ageDays: number;
  added?: boolean;
}

const SAMPLE: DemoTask[] = [
  { id: "calc", title: "Calculus problem set", importance: 4, dueOffset: 1, dueTime: null, schedStart: null, estimateMin: 60, ageDays: 4 },
  { id: "paw", title: "Edit the newspaper article", importance: 3, dueOffset: 0, dueTime: null, schedStart: null, estimateMin: 30, ageDays: 2 },
  { id: "chem", title: "Chem lab report", importance: 5, dueOffset: 7, dueTime: null, schedStart: null, estimateMin: 180, ageDays: 1 },
  { id: "email", title: "Reply to the robotics club email", importance: 2, dueOffset: -2, dueTime: null, schedStart: null, estimateMin: 15, ageDays: 5 },
  { id: "solo", title: "Practice the guitar solo", importance: 3, dueOffset: null, dueTime: null, schedStart: null, estimateMin: 30, ageDays: 20 },
  { id: "desk", title: "Clean up desk", importance: 1, dueOffset: null, dueTime: null, schedStart: null, estimateMin: null, ageDays: 3 },
];

const DUE_OPTIONS: [number | null, string][] = [
  [-3, "3 days ago"], [-1, "Yesterday"], [0, "Today"], [1, "Tomorrow"], [3, "In 3 days"], [7, "In a week"], [14, "In 2 weeks"], [null, "No date"],
];
const ESTIMATE_OPTIONS = [null, 15, 30, 60, 90, 120, 180, 240];

function toTask(d: DemoTask, now: Date): Task {
  return {
    id: d.id,
    title: d.title,
    importance: d.importance,
    dueDate: d.dueOffset === null ? null : localDate(addDays(now, d.dueOffset)),
    dueTime: d.dueTime,
    schedStart: d.schedStart,
    estimateMin: d.estimateMin,
    createdAt: new Date(+now - d.ageDays * DAY).toISOString(),
  };
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function option(value: string, label: string, selected: boolean) {
  const o = new Option(label, value);
  o.selected = selected;
  return o;
}

/* ---------- Recommended order ---------- */

function startRanking(root: HTMLElement) {
  const list = root.querySelector<HTMLOListElement>("[data-list]")!;
  const free = root.querySelector<HTMLInputElement>("[data-free]")!;
  const freeLabel = root.querySelector<HTMLElement>("[data-free-label]")!;
  const tasks = SAMPLE.map((t) => ({ ...t }));
  const rows = new Map<string, HTMLLIElement>();
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function buildRow(d: DemoTask) {
    const li = el("li", "t-row");
    li.dataset.id = d.id;
    li.innerHTML = `
      <span class="t-rank"></span>
      <div class="t-main">
        <div class="t-head"><span class="t-title"></span></div>
        <div class="t-reasons"></div>
        <div class="t-bar" aria-hidden="true"><i class="c-imp"></i><i class="c-urg"></i><i class="c-over"></i><i class="c-fit"></i></div>
        <div class="t-controls">
          <span class="t-ctl"><span>Importance</span><span class="t-dots" role="radiogroup" aria-label="Importance"></span></span>
          <label class="t-ctl"><span>Due</span><select data-due></select></label>
          <label class="t-ctl"><span>Takes</span><select data-est></select></label>
        </div>
      </div>
      <span class="t-score"></span>`;
    li.querySelector(".t-title")!.textContent = d.title;
    if (d.added) {
      const rm = el("button", "t-remove", "Remove");
      rm.type = "button";
      rm.addEventListener("click", () => {
        tasks.splice(tasks.indexOf(d), 1);
        rows.delete(d.id);
        li.remove();
        render();
      });
      li.querySelector(".t-head")!.append(rm);
    }

    const dots = li.querySelector<HTMLElement>(".t-dots")!;
    for (let i = 1; i <= 5; i++) {
      const b = el("button");
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-label", `${i}, ${IMPORTANCE[i]}`);
      b.title = `${i} · ${IMPORTANCE[i]}`;
      b.addEventListener("click", () => { d.importance = i; render(); });
      dots.append(b);
    }

    const due = li.querySelector<HTMLSelectElement>("[data-due]")!;
    const opts = [...DUE_OPTIONS];
    if (!opts.some(([v]) => v === d.dueOffset)) {
      opts.push([d.dueOffset, d.dueOffset! < 0 ? `${-d.dueOffset!} days ago` : `In ${d.dueOffset} days`]);
      opts.sort((a, b) => (a[0] ?? 1e9) - (b[0] ?? 1e9));
    }
    for (const [v, label] of opts) due.append(option(String(v), label, v === d.dueOffset));
    due.addEventListener("change", () => { d.dueOffset = due.value === "null" ? null : Number(due.value); render(); });

    const est = li.querySelector<HTMLSelectElement>("[data-est]")!;
    const ests = ESTIMATE_OPTIONS.includes(d.estimateMin) ? ESTIMATE_OPTIONS : [...ESTIMATE_OPTIONS, d.estimateMin].sort((a, b) => (a ?? -1) - (b ?? -1));
    for (const v of ests) est.append(option(String(v), v === null ? "Unknown" : formatDuration(v), v === d.estimateMin));
    est.addEventListener("change", () => { d.estimateMin = est.value === "null" ? null : Number(est.value); render(); });

    rows.set(d.id, li);
    return li;
  }

  function updateRow(li: HTMLLIElement, d: DemoTask, s: ScoreBreakdown, rank: number, now: Date) {
    li.querySelector(".t-rank")!.textContent = String(rank);
    li.querySelector(".t-score")!.textContent = String(Math.round(s.score * 100));
    li.querySelector(".t-score")!.setAttribute("title", `Priority score ${Math.round(s.score * 100)}/100`);

    const t = toTask(d, now);
    const extra = [
      t.dueTime ? `due ${formatDue(t, now)}` : "",
      d.schedStart && d.schedEnd ? `block ${formatBlock(new Date(d.schedStart), new Date(d.schedEnd), now)}` : "",
    ].filter(Boolean).join(" · ");
    li.querySelector(".t-reasons")!.textContent = [s.reasons.join(" · ") || "No strong reason yet", extra].filter(Boolean).join("  ·  ");

    const parts: [string, number, number, string][] = [
      ["c-imp", s.importance, WEIGHTS.importance, "Importance"],
      ["c-urg", s.urgency, WEIGHTS.urgency, "Urgency"],
      ["c-over", s.overdue, WEIGHTS.overdue, "Overdue"],
      ["c-fit", s.fit, WEIGHTS.fit, "Fit"],
    ];
    for (const [cls, value, weight, name] of parts) {
      const seg = li.querySelector<HTMLElement>(`.${cls}`)!;
      seg.style.width = `${value * weight * 100}%`;
      seg.title = `${name}: ${value.toFixed(2)} × ${weight * 100} = ${(value * weight * 100).toFixed(1)}`;
    }

    li.querySelectorAll<HTMLButtonElement>(".t-dots button").forEach((b, i) => {
      b.classList.toggle("on", i < d.importance);
      b.setAttribute("aria-checked", String(i + 1 === d.importance));
    });
  }

  function render() {
    const now = new Date();
    const freeMinutes = Number(free.value);
    freeLabel.textContent = freeMinutes === 0 ? "None" : formatDuration(freeMinutes);

    const scored = tasks.map((d) => ({ d, s: scoreTask(toTask(d, now), { now, freeMinutes }) }))
      .sort((a, b) => b.s.score - a.s.score || a.d.title.localeCompare(b.d.title));

    // FLIP: remember where rows were, reorder, then animate from there.
    const before = new Map([...rows].map(([id, li]) => [id, li.getBoundingClientRect().top]));
    scored.forEach(({ d, s }, i) => {
      const li = rows.get(d.id) ?? buildRow(d);
      updateRow(li, d, s, i + 1, now);
      list.append(li);
    });
    if (reduceMotion) return;
    for (const [id, li] of rows) {
      const top = before.get(id);
      if (top === undefined) {
        li.animate([{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], { duration: 400, easing: "ease-out" });
        continue;
      }
      const dy = top - li.getBoundingClientRect().top;
      if (dy) li.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 420, easing: "cubic-bezier(.2,.7,.2,1)" });
    }
  }

  free.addEventListener("input", render);
  render();

  return {
    add(p: ParsedTask, now: Date) {
      const d: DemoTask = {
        id: `added-${Date.now()}`,
        title: p.title,
        importance: p.importance ?? 3,
        dueOffset: p.dueDate ? daysUntil(p.dueDate, now) : null,
        dueTime: p.dueTime ?? null,
        schedStart: p.schedDate && p.schedStartTime ? atLocalTime(p.schedDate, p.schedStartTime).toISOString() : null,
        schedEnd: p.schedDate && p.schedEndTime ? atLocalTime(p.schedDate, p.schedEndTime).toISOString() : undefined,
        estimateMin: p.estimateMin ?? null,
        ageDays: 0,
        added: true,
      };
      tasks.push(d);
      render();
      const rank = [...list.children].indexOf(rows.get(d.id)!) + 1;
      rows.get(d.id)!.classList.add("fresh");
      setTimeout(() => rows.get(d.id)?.classList.remove("fresh"), 1600);
      return rank;
    },
  };
}

/* ---------- Quick add ---------- */

function startQuickAdd(root: HTMLElement, onAdd: (p: ParsedTask, now: Date) => number) {
  const input = root.querySelector<HTMLInputElement>("[data-input]")!;
  const title = root.querySelector<HTMLElement>("[data-title]")!;
  const fields = root.querySelector<HTMLElement>("[data-fields]")!;
  const notes = root.querySelector<HTMLElement>("[data-notes]")!;
  const addBtn = root.querySelector<HTMLButtonElement>("[data-add]")!;
  const status = root.querySelector<HTMLElement>("[data-status]")!;
  let parsed: ParsedTask | null = null;

  function field(label: string, value: string) {
    const li = el("li");
    li.append(el("span", "f-label", label), el("span", "f-value", value));
    fields.append(li);
  }

  function render() {
    const now = new Date();
    fields.replaceChildren();
    notes.replaceChildren();
    const text = input.value.trim();
    parsed = text ? parseTaskInput(input.value, { now, projects: PROJECTS }) : null;
    addBtn.disabled = !parsed;
    if (!parsed) {
      title.textContent = "Type a task above";
      title.classList.add("empty");
      return;
    }
    title.textContent = parsed.title;
    title.classList.remove("empty");

    const p = parsed;
    if (p.estimateMin) field("Takes", formatDuration(p.estimateMin));
    if (p.dueDate) field("Due", formatDue({ dueDate: p.dueDate, dueTime: p.dueTime ?? null }, now));
    if (p.schedDate && p.schedStartTime && p.schedEndTime) {
      field("Time block", formatBlock(atLocalTime(p.schedDate, p.schedStartTime), atLocalTime(p.schedDate, p.schedEndTime), now));
    }
    if (p.importance) field("Importance", `${p.importance} · ${IMPORTANCE[p.importance]}`);
    if (p.projectId) field("Project", PROJECTS.find((x) => x.id === p.projectId)!.name);
    if (!fields.children.length) field("Fields", "None found. It's all title.");

    for (const a of p.ambiguities) {
      const msg =
        a.kind === "time-role" ? `“${a.text}” is read as a deadline. Tempo's preview lets you switch it to a time block instead.`
        : a.kind === "maybe-date" ? `“${a.text}” could be a date, so it stays in the title. Write “on ${a.text}” to make it one.`
        : `There's no project called “#${a.text}”, so it stays in the title. Tempo offers to create it.`;
      notes.append(el("li", undefined, msg));
    }
  }

  input.addEventListener("input", () => { status.textContent = ""; render(); });
  root.querySelectorAll<HTMLButtonElement>("[data-example]").forEach((b) =>
    b.addEventListener("click", () => { input.value = b.dataset.example!; status.textContent = ""; render(); input.focus(); }));
  root.querySelector("form")!.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!parsed) return;
    const rank = onAdd(parsed, new Date());
    status.textContent = `Added. It ranks #${rank} in the list below.`;
  });
  render();
}

export function startTempoDemos() {
  const ranking = document.querySelector<HTMLElement>("[data-ranking]");
  const quick = document.querySelector<HTMLElement>("[data-quickadd]");
  if (!ranking || !quick) return;
  const r = startRanking(ranking);
  startQuickAdd(quick, r.add);
}
