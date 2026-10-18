// The parts of Tempo's src/lib/types.ts that score.ts and parse/ use.
export interface Project {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  estimateMin: number | null;
  /** Local calendar date, "YYYY-MM-DD". */
  dueDate: string | null;
  /** Local wall-clock time, "HH:MM". */
  dueTime: string | null;
  /** UTC ISO instant. */
  schedStart: string | null;
  importance: number;
  createdAt: string;
}
