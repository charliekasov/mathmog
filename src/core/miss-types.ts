// Which validation branch ran for the live miss. Lets the misses-review
// screen apply the right retry-comparison logic (Slice 2a Step 5).
// Optional for backwards-compat with submissions written before Slice 2a.
export type MissedMathmogProblemKind =
  | 'root-estimation'
  | 'fraction'
  | 'estimation'
  | 'multi-text'
  | 'number'
  | 'default';

// One incorrectly answered problem from a mathmog drill
export interface MissedMathmogProblem {
  prompt: string;          // Problem text shown to the student
  correctAnswer: string;   // Expected answer
  studentAnswer: string;   // What the student typed
  deviationPercent?: number; // Estimation problems: how far off (e.g. 26.7)
  validationKind?: MissedMathmogProblemKind; // Which validation branch ran
  correctAnswerNumeric?: number; // Numeric form for 'estimation' and 'number' kinds
  explanation?: string;    // Slice 3: explanation rendered in the misses-review screen. Optional for backwards-compat with pre-Slice-3 records.
}
