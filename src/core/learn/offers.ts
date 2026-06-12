// @peakprep/mathmog/core/learn — completion offer engine (Phase 2A.5).
//
// THE F1 OFFER-ENGINE SUBSTRATE (user-stories doc F1; master plan 2A.5).
// The offer space distinguishes fact sets the student has ACQUIRED (Drill /
// Speed Challenge moves apply) from fact sets they have NOT (Learn moves
// apply). This module ships the substrate at its first moment — Learn-module
// completion (design doc §6.6: Drill-the-set + Learn-next-module) — with the
// vocabulary Phase 3's Drill-side loop inherits: the same `MathmogOffer`
// union and the same acquired-bit seam, extended there with widen/narrow
// drill moments rather than re-cut.
//
// Boundaries, deliberate:
// - PURE. No Firebase, no navigation, no React. The acquired bit arrives as
//   a predicate (slice 2B.2 backs it with Firestore); offers go out as data
//   and the call site owns what tapping one does (and its telemetry —
//   offer-shown / offer-tapped land portal-side, Phase 3.4 pattern).
// - CALM. Offers carry content identity, not copy. No score commentary, no
//   praise, no completion history (Learn doc Q1). Rendering lives in
//   `react/components/learn/completion-offers.tsx`.
// - The adjacency it reads is the Learn-side `nextModuleId` rail stored on
//   the module defs (curriculum §3.6: stored, never computed).

import { isLearnEligibleModule } from './helpers';
import type { LearnModuleDef } from './types';
import { parseMathmogLearnModuleId } from './mathmog-binding';
import { MATHMOG_LEARN_MODULES } from './modules';
import { registryScopeLabel } from './modules/scope-label';

/**
 * The 2B.2 seam: has this student ACQUIRED the fact set this module covers?
 * One bit per (student, module) — exactly what F1 needs to route between
 * Learn-side and Drill-side moves. Callers without persistence (Free Play
 * before 2B.2 lands, tests) can pass `() => false`.
 *
 * CONTRACT (2A.5 reviewer REQUIRED, pinned by test): "acquired" means every
 * fact in the module is covered by the student's completed modules, NOT
 * literal completion of this module id. Modules overlap (the TT singles
 * are subsets of tt_6_9; squares_1_5 is a subset of squares_1_10), and a
 * module-id-equality implementation re-creates the exact F1 anti-pattern
 * this engine exists to kill: a student who climbed just_6 … just_9 would
 * be offered "Learn 6× through 9×" — an all-review module for facts the
 * system has on record. 2B.2 owns the subsumption-aware implementation;
 * note that the same TT fact carries different item ids across modules
 * ("7x12" in tt_just_7, "12x7" in multi-row modules), so fact-coverage
 * computation needs factKey-style normalization, not item-id equality.
 */
export type AcquiredModulePredicate = (moduleId: string) => boolean;

/**
 * Resolves the acquisition next step after completing `completed`: follows
 * the Learn-side `nextModuleId` rail to the first module that is structurally
 * Learn-eligible and NOT yet acquired. Walking past acquired modules (rather
 * than stopping at the first hop) is the F1-awareness: a student who already
 * Learned the stored neighbor elsewhere should be offered the next genuinely
 * new set on the ladder, not silence. A visited set guards the mutual-pair
 * cycles the curated rails deliberately contain; when every reachable module
 * is acquired or the rail ends, there is no acquisition offer — and the
 * absence is the message (curriculum §3.7: no "you're at the top!" copy).
 */
export function resolveLearnNextModule<TPrompt, TAnswer>(
  completed: LearnModuleDef<TPrompt, TAnswer>,
  modules: LearnModuleDef<TPrompt, TAnswer>[],
  isAcquired: AcquiredModulePredicate
): LearnModuleDef<TPrompt, TAnswer> | null {
  const visited = new Set<string>([completed.id]);
  let nextId = completed.nextModuleId;
  while (nextId !== undefined && !visited.has(nextId)) {
    visited.add(nextId);
    const next = modules.find(m => m.id === nextId);
    if (next === undefined) return null;
    if (isLearnEligibleModule(next) && !isAcquired(next.id)) return next;
    nextId = next.nextModuleId;
  }
  return null;
}

/**
 * Registry-level integrity check for the Learn-side adjacency rails — the
 * cross-module half that `validateLearnModuleDef` (single-def) can't see.
 * Returns human-readable problems; empty array = sound. A test pins this
 * against `MATHMOG_LEARN_MODULES` so a curation slip (dangling or
 * self-referential rail) fails CI loudly.
 */
export function validateLearnAdjacency(
  modules: LearnModuleDef<unknown, unknown>[]
): string[] {
  const problems: string[] = [];
  const ids = new Set(modules.map(m => m.id));
  for (const m of modules) {
    if (m.nextModuleId === undefined) continue;
    if (m.nextModuleId === m.id) {
      problems.push(`module "${m.id}" lists itself as nextModuleId`);
    } else if (!ids.has(m.nextModuleId)) {
      problems.push(
        `module "${m.id}" lists unknown nextModuleId "${m.nextModuleId}"`
      );
    }
  }
  return problems;
}

/**
 * One offer on a completion surface. The union is the Phase 3 inheritance
 * point: the Drill loop's widen/narrow offers reuse these two kinds (a
 * Drill offer at a different scope, a Learn offer for unacquired content)
 * rather than minting a third vocabulary.
 * - `drill-scope`: run Drill mode over a (topic, scope) — the retention
 *   move, only honest for acquired content.
 * - `learn-module`: start a Learn module — the acquisition move, only
 *   offered for unacquired content.
 * Both carry (topic, scopeId) because for Math Mog a module IS a scope
 * viewed as a Learn target; the call site builds its trainer URL from
 * either kind the same way.
 */
export type MathmogOffer =
  | {
      kind: 'drill-scope';
      topic: string;
      scopeId: string;
      /** Registry scope label — what the Drill dropdown shows. */
      scopeLabel: string;
    }
  | {
      kind: 'learn-module';
      moduleId: string;
      /** Module label (same string as the registry scope label). */
      moduleLabel: string;
      topic: string;
      scopeId: string;
    };

/**
 * The §6.6 Learn-completion offer set, in order:
 * 1. Drill the just-completed set (retention — always present; completing
 *    the module is precisely what makes this set Drill-honest), then
 * 2. Learn the next set (acquisition — present only when the rail resolves
 *    to an unacquired, eligible module).
 * Throws loudly on a module id that doesn't parse or isn't in the registry
 * (same posture as `LearnSessionHost`'s session/module mismatch): a typo'd
 * id is a build bug, not a student-facing fallback case.
 */
export function mathmogLearnCompletionOffers(args: {
  completedModuleId: string;
  isAcquired: AcquiredModulePredicate;
  /** Defaults to the full curated registry; injectable for tests. */
  modules?: LearnModuleDef<string, number>[];
}): MathmogOffer[] {
  const { completedModuleId, isAcquired } = args;
  const modules = args.modules ?? MATHMOG_LEARN_MODULES;

  const parsed = parseMathmogLearnModuleId(completedModuleId);
  if (parsed === null) {
    throw new Error(
      `mathmogLearnCompletionOffers: malformed module id "${completedModuleId}"`
    );
  }
  const completed = modules.find(m => m.id === completedModuleId);
  if (completed === undefined) {
    throw new Error(
      `mathmogLearnCompletionOffers: unknown module "${completedModuleId}"`
    );
  }

  const offers: MathmogOffer[] = [
    {
      kind: 'drill-scope',
      topic: parsed.topic,
      scopeId: parsed.scopeId,
      scopeLabel: registryScopeLabel(parsed.topic, parsed.scopeId),
    },
  ];

  const next = resolveLearnNextModule(completed, modules, isAcquired);
  if (next !== null) {
    const nextParsed = parseMathmogLearnModuleId(next.id);
    if (nextParsed === null) {
      throw new Error(
        `mathmogLearnCompletionOffers: malformed nextModuleId "${next.id}"`
      );
    }
    offers.push({
      kind: 'learn-module',
      moduleId: next.id,
      moduleLabel: next.label,
      topic: nextParsed.topic,
      scopeId: nextParsed.scopeId,
    });
  }

  return offers;
}
