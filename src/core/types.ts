// Mathmog types for mental math trainer

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

/**
 * 2D.3: the (topic, itemId) identity of the underlying Memorize fact,
 * stamped at generation by the branches that know their operands (times
 * tables, perfect squares, perfect cubes, fraction conversions). Consumed
 * by the feedback surfaces: the `diagnoseMiss` lookup at miss time (live
 * identity line + capture-time storage on `MissedMathmogProblem`), the
 * correct-but-enriched postscript, and the validator's
 * faithful-transcription check. Absent on estimation problems, Level-2/3
 * types, text-input conversion directions (decToFrac / percToFrac),
 * advanced topics without a diagnoser, and pre-existing records —
 * consumers silently skip diagnosis when missing.
 */
export interface ProblemFact {
  /** The four topics with 2D.2 diagnosers (subset of `MemorizeLearnTopic`). */
  topic: 'times_tables' | 'perfect_squares' | 'perfect_cubes' | 'fraction_conversions';
  /** Learn item id, doubling as fact id: "6x8", "7^2", "7^3", "5/6". */
  itemId: string;
  /**
   * Present on fracToPerc problems: the typed answer lives in the percent
   * shift of the fact's value (83.33 for 5/6). Decimal-space consumers
   * (`diagnoseMiss`, the enrichment postscript) skip these; the validator's
   * faithful-transcription check runs in percent space instead.
   */
  percentShift?: true;
}

export interface Problem {
  question: string | string[];
  answer: any;
  type: string;
  explanation: string;
  inputType: 'number' | 'text' | 'buttons' | 'multi-text';
  options?: string[];
  /** See `ProblemFact` — absent on problems with no diagnosable fact. */
  fact?: ProblemFact;
  /**
   * Maximum acceptable relative deviation for estimation problems (e.g. 0.20
   * = 20% off still counts as correct). Read by the estimation branch of the
   * answer validator in `react/contexts/problem.tsx`. Falls back to 0.10
   * (10%) when omitted. Has no effect on non-estimation problems.
   */
  tolerance?: number;
  placeholder?: string;
}

export interface SpeedChallengeState {
  enabled: boolean;
  duration: number; // in minutes
  timeLeft: number; // in seconds
  isActive: boolean;
  /**
   * Tagged "challenge-ended" signal. Truthy iff the round timer ran out;
   * cleared back to null when the next round starts or the user resets.
   * Does NOT carry the score — read the live score from the problem
   * context (`useProblem().score`).
   */
  results: { ended: true } | null;
}

export interface PendingLevelUp {
  action: 'changeDifficulty' | 'trySpeedChallenge';
  from?: Difficulty;
  to?: Difficulty;
  emojis: string;
  title: string;
  allCapsTitle?: string;
  subtitle: string;
  options: {
    yes: string;
    no: string;
  };
}

export interface AdaptiveData {
  consecutiveCorrect: number;
  currentAdaptiveLevel: Difficulty | null;
  pendingLevelUp: PendingLevelUp | null;
  // True when the current streak has been earned with no scaffolding
  // (no Skip / Show me / Reference open during the run). Used by the
  // trainer to decide whether to surface the level-up dialog in
  // Free Play — tainted streaks silently decline so progression isn't
  // driven by scaffolded answers. Resets to `true` at every site where
  // `consecutiveCorrect` resets to 0; flipped to `false` (one-way within
  // a streak) by the trainer's taintStreak callback.
  streakPure: boolean;
}
