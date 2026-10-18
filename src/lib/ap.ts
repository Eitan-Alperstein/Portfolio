// AP numbers used on the homepage and /academics, computed from life.ts.
import { academics } from "../data/life";

const listed = academics.years.flatMap((y) => y.courses).filter((c) => c.score);
const fiveCourses = listed.filter((c) => c.score === 5);
// Oldest year first, in listed order within a year ("CS A, Euro, APUSH, ...").
const ordered = [...academics.years].reverse().flatMap((y) => y.courses).filter((c) => c.score === 5);

const join = (xs: string[]) => xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`;

export const ap = {
  fives: fiveCourses.length,
  taken: Math.max(academics.apExamsTaken, listed.length),
  fiveCourses: ordered,
  shortList: join(ordered.map((c) => c.short ?? c.name.replace(/^AP /, ""))),
  longList: join(ordered.map((c) => c.name.replace(/^AP /, ""))),
};
