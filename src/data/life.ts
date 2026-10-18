// Everything outside of code: music, tutoring, The Paw, academics,
// languages, volunteering. Pages render straight from this file, so
// updating the site is editing data here. Empty arrays / null values show
// a "coming soon" state. See CONTENT-TODO.md for every open slot.

import { EMAIL } from "./site";

// ---------------------------------------------------------------- music

export interface Recording {
  title: string;
  note?: string; // e.g. "Live, one take" or the style
  youtube?: string; // full YouTube URL, e.g. https://www.youtube.com/watch?v=XXXX
  audio?: string; // file in public/media/guitar/, e.g. "/media/guitar/solo.mp3"
}

export const music = {
  guitar: {
    years: "About 1.5 years",
    summary:
      "I taught myself guitar about a year and a half ago, and I play basically every style.",
    facts: [
      { label: "Started", value: "~1.5 years ago" },
      { label: "Teacher", value: "Self-taught" },
      { label: "Styles", value: "Basically all of them" },
    ],
    // Add recordings here (newest first). YouTube links or audio files both work.
    recordings: [] as Recording[],
  },
  pedal: {
    name: "Money for Nothing pedal",
    summary:
      "A digital guitar pedal I built to model the guitar tone from Dire Straits' \"Money for Nothing\". I also designed a poster for it.",
    // Images come from public/shots/pedal-poster/ and public/shots/pedal-build/ (run `npm run shots`).
  },
  electronics:
    "Beyond the pedal, I just like tinkering with audio electronics in general.",
};

// ------------------------------------------------------------- tutoring

export interface TutoringLevel {
  id: string;
  name: string;
  grades: string;
  topics: string[];
  soon?: boolean;
}

export interface Testimonial {
  quote: string;
  name: string; // e.g. "Parent of a 4th grader"
}

export const tutoring = {
  email: EMAIL,
  subject: "Tutoring",
  pitch:
    "Paid, one-on-one math tutoring from elementary school arithmetic all the way through Calculus II. I've been tutoring independently for about half a year, mostly younger kids, and I'd love to work with more students.",
  facts: [
    { label: "Experience", value: "~6 months, independent" },
    { label: "Levels", value: "Elementary → Calc II" },
    { label: "Coming soon", value: "SAT math" },
  ],
  levels: [
    { id: "elementary", name: "Elementary", grades: "K–5", topics: ["Arithmetic and number sense", "Multiplication and division", "Fractions and decimals", "Word problems", "Building confidence with math"] },
    { id: "middle", name: "Middle school", grades: "6–8", topics: ["Ratios and percents", "Negative numbers", "Pre-algebra and equations", "Intro to geometry", "Getting ready for algebra"] },
    { id: "algebra", name: "Algebra & Geometry", grades: "High school", topics: ["Algebra I and II", "Linear and quadratic functions", "Systems of equations", "Geometry and proofs", "Exponents and logarithms"] },
    { id: "precalc", name: "Precalculus", grades: "High school", topics: ["Functions and their graphs", "Trigonometry", "Polynomials and rational functions", "Sequences and series", "Limits, a first look"] },
    { id: "calc", name: "Calculus I & II", grades: "AP / college", topics: ["Limits and continuity", "Derivatives and their applications", "Integrals and techniques of integration", "Series and convergence", "AP Calculus AB / BC prep"] },
    { id: "sat", name: "SAT Math", grades: "Coming soon", topics: ["Algebra and advanced math", "Problem solving and data", "Geometry and trig", "Desmos calculator strategies", "Timing and test strategy"], soon: true },
  ] as TutoringLevel[],
  whoFor: [
    { title: "Kids who need a boost", text: "Most of my students are in elementary school. Patient, friendly help that makes math feel doable." },
    { title: "Students in a hard class", text: "Stuck in Algebra, Precalc or Calculus? We'll work through your actual homework and tests." },
    { title: "Anyone who wants to get ahead", text: "Learn the next topic before it shows up in class, or go deeper than school does." },
  ],
  steps: [
    { title: "Email me", text: "Tell me the student's grade, what they're working on and when you're free." },
    { title: "We figure out a plan", text: "We'll find what to focus on and a time that works." },
    { title: "Start learning", text: "One-on-one sessions built around the student, not a script." },
  ],
  // Add real testimonials here once you have permission to share them.
  testimonials: [] as Testimonial[],
};

// -------------------------------------------------------------- The Paw

export interface Article {
  title: string;
  url: string;
  when: string; // shown as-is, e.g. "Mar 2026" or "2024–25"
  coAuthors?: string;
}

export const paw = {
  name: "The Paw",
  site: "https://www.thepawnews.com",
  archive: "https://sites.google.com/view/thepawarchives",
  summary:
    "The student newspaper at Denver Jewish Day School. I joined as a reporter my freshman year, now I run the business side, and I created our new website.",
  // Timeline, oldest first. "role" entries are staff positions; "milestone"
  // entries are things done along the way.
  timeline: [
    { kind: "role", title: "Reporter", when: "Since freshman year", text: "Writing news, features and opinion pieces. 10+ articles so far." },
    { kind: "role", title: "Business & Advertising Manager", when: "Since summer 2026", text: "Running ad sales and the business side of the paper." },
    { kind: "milestone", title: "Created our new website", when: "Oct 2026", text: "A fast static site for readers, and a CMS so editors can publish without touching code." },
  ] as { kind: "role" | "milestone"; title: string; when: string; text: string }[],
  articlesWritten: "10+",
  // Yearly ad revenue, as you want it displayed, e.g. "$2,400". Leave null until you have it.
  adRevenue: null as null | { amount: string; period: string },
  // Articles credited to Eitan in The Paw's archive, newest first.
  articles: [
    { title: "Is AI Anti-Semitic, Just Unfinished, Or Both?", url: "https://www.thepawnews.com/is-ai-anti-semitic-just-unfinished-or-both", when: "Mar 2026" },
    { title: "Why Are More Students Opting for Freedom Learning?", url: "https://www.thepawnews.com/why-are-more-students-opting-for-freedom-learning", when: "Jan 2026", coAuthors: "with Cooper Coughlan" },
    { title: "Subway Closure Marks End of an Era for DJDS Students", url: "https://www.thepawnews.com/subway-closure-marks-end-of-an-era-for-djds-students", when: "2024–25" },
    { title: "Script from \"DJDS Weekend Update\"", url: "https://www.thepawnews.com/script-from-djds-weekend-update", when: "2024–25", coAuthors: "with Maya Karlitz and Naomi Kimel" },
    { title: "Chat GPT or a Friendly Paw Reporter?", url: "https://www.thepawnews.com/chat-gpt-or-a-friendly-paw-reporter", when: "Dec 2024" },
    { title: "New Gates and Intercoms Improve School Security", url: "https://www.thepawnews.com/new-gates-and-intercoms-improve-school-security", when: "Dec 2024" },
    { title: "Differences of Daily Life in Israel Since October 7th", url: "https://www.thepawnews.com/differences-of-daily-life-in-israel-since-october-7th", when: "Oct 2024" },
  ] as Article[],
};

// ------------------------------------------------------------ academics

export interface Course {
  name: string;
  short?: string; // short name used in summaries, e.g. "APUSH"
  score?: number; // AP exam score
}

export const academics = {
  school: "Denver Jewish Day School",
  classOf: 2028,
  // Total AP exams taken so far, including any not listed as a course below.
  apExamsTaken: 7,
  years: [
    {
      label: "2026–27", grade: "Junior", current: true,
      courses: [
        { name: "AP Calculus BC" }, { name: "Honors Calculus III" }, { name: "AP Physics 1" },
        { name: "AP Cybersecurity" }, { name: "Honors Spanish III" }, { name: "Spanish I/II Teaching Assistant" },
      ],
    },
    {
      label: "2025–26", grade: "Sophomore",
      courses: [
        { name: "AP US History", short: "APUSH", score: 5 }, { name: "AP Calculus AB", short: "Calc AB", score: 5 }, { name: "Honors Chemistry" },
        { name: "Honors Spanish II" }, { name: "AP Language and Composition", short: "Lang", score: 5 }, { name: "AP Macroeconomics", short: "Macro", score: 5 },
      ],
    },
    {
      label: "2024–25", grade: "Freshman",
      courses: [
        { name: "AP Computer Science A", short: "CS A", score: 5 }, { name: "AP European History", short: "Euro", score: 5 }, { name: "Spanish I" },
      ],
    },
  ] as { label: string; grade: string; current?: boolean; courses: Course[] }[],
};

// ------------------------------------------------------------ languages

export const languages = {
  intro:
    "Languages are a hobby of mine. Some I'm fluent in, one I'm pretty solid in, and a few I've only just started.",
  list: [
    { name: "English", native: "English", level: "Native", pct: 100, hello: "Hello", note: "The default." },
    { name: "Hebrew", native: "עברית", level: "Fluent", pct: 92, hello: "שלום", dir: "rtl", note: "" },
    { name: "Spanish", native: "Español", level: "B1", pct: 55, hello: "Hola", note: "B1, and I'm a teaching assistant for Spanish I and II." },
    { name: "Russian", native: "Русский", level: "Just started", pct: 10, hello: "Привет", note: "Just getting started, new alphabet and all." },
    { name: "French", native: "Français", level: "Just started", pct: 10, hello: "Bonjour", note: "Just getting started." },
    { name: "Arabic", native: "العربية", level: "Just started", pct: 8, hello: "مرحبا", dir: "rtl", note: "Just getting started. Right to left, like Hebrew." },
  ] as { name: string; native: string; level: string; pct: number; hello: string; dir?: "rtl"; note: string }[],
};

// --------------------------------------------------------- volunteering

export const volunteering = {
  intro:
    "Most of my volunteering has been with Chabad: starting something new, helping with a big move, and the everyday setup that gets the synagogue ready for prayer. I've pitched in at school too, and a new project there is about to start.",
  chabad: {
    name: "Chabad",
    hours: 40,
    // Grouped by the kind of help, in the order they read best.
    work: [
      { kind: "Starting something", title: "Founded CTeen at Chabad of Central Park", text: "Started the CTeen program, Chabad's teen network, at Chabad of Central Park in Denver." },
      { kind: "A big move", title: "Moving the synagogue", text: "Helped move the synagogue to its new location." },
      { kind: "The everyday", title: "Getting ready for prayer", text: "Miscellaneous chores getting the synagogue ready for prayer: setting up and whatever else needs doing." },
    ],
  },
  school: {
    name: "School",
    hours: 2,
    work: [
      { title: "Helping out at school", text: "Miscellaneous school volunteering." },
    ],
    upcoming: [
      { title: "The school farmette", text: "A new volunteering project with my school's farmette. Starting soon." },
    ],
  },
};
