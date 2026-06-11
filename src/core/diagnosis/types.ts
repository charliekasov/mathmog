// @peakprep/mathmog/core/diagnosis — generic vocabulary (Phase 2D.2).
//
// A diagnosis is the product speaking the error story its curated wrong
// answers already encode (REVIEW-mathmog-feedback-intelligence.md, proposal
// b): the Learn distractor pools are a wrong-answer→error-story map, and
// `diagnoseMiss` is the reverse lookup. This module is product-agnostic;
// the Math Mog diagnosers (mechanical for times tables / squares / cubes,
// hand-annotated for fractions, plus the two curation-free detectors) live
// in `./diagnose.ts` and `./fraction-identities.ts`.
//
// Design rails (reviewer-designed, Charlie-ratified):
// - Copy states a FACT ABOUT THE NUMBER, never the student's intent —
//   "0.8 is what 4/5 comes to", never "you confused 4/5 with 5/6". True
//   regardless of why they typed it.
// - An unmatched wrong answer gets NO diagnosis (null): the generic
//   re-teach is the right failure mode. Never guess.
// - Deterministic everywhere. No AI, no randomness, no feedback strings
//   inside the Learn state machine (2A.3 contract) — diagnosis attaches at
//   the UI layer at verdict time.

/** One diagnosed miss: a stable pattern id plus the student-facing line. */
export interface MissDiagnosis {
  /**
   * Stable error-pattern id (e.g. "tt-adjacent-product",
   * "frac-under-precision") for telemetry and tests. Never shown to
   * students.
   */
  code: string;
  /**
   * One short student-facing line. States a fact about the number, never
   * the student's intent; ends with the true value so the re-teach rides
   * along.
   */
  message: string;
}
