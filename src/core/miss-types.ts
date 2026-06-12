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
  // 2D.3: error-identity line, looked up via `diagnoseMiss` at CAPTURE time —
  // the record lacks the fact id to re-derive later. Rendered in the
  // misses-review screen between "You said:" and the retry box. Optional for
  // backwards-compat with pre-2D.3 records (they render exactly as before).
  diagnosisMessage?: string;
  // 2D.3: the diagnosis's stable pattern id (e.g. "frac-under-precision").
  // Never rendered; the anchor point for the deferred tutor-facing
  // error-pattern telemetry idea.
  diagnosisCode?: string;
}
