"use client";

import { useProblem } from '../contexts/problem';
import { useSpeedChallenge } from '../contexts/speed-challenge';
import { useTrainerModeOptional } from '../contexts/trainer-mode';
import { useMathmogUI } from '../ui/provider';

/**
 * The adaptive-leveling celebration modal. Pops at 7 consecutive correct
 * (managed by ProblemProvider), offers either a difficulty upgrade
 * (`changeDifficulty`) or, at the top of the ladder / on no-difficulty
 * memorize topics, a speed challenge (`trySpeedChallenge`).
 *
 * Self-suppresses during an active speed challenge. Accepts an optional
 * `suppressInHomework` prop to disable the dialog in homework mode — the
 * orchestrator threads its homework flag through ProblemDisplay's
 * `isHomeworkMode` prop, which forwards to this dialog. Mount this
 * component standalone (no props) for consumers that don't have a
 * homework concept; it'll show whenever a `pendingLevelUp` is queued.
 */
export function LevelUpDialog({
  suppressInHomework = false,
}: {
  suppressInHomework?: boolean;
} = {}) {
  const ui = useMathmogUI();
  const { adaptiveData, handleLevelUp } = useProblem();
  const { speedChallenge, setSpeedChallenge } = useSpeedChallenge();
  // Optional: present in the full trainer, absent in bare/test mounts.
  const trainerMode = useTrainerModeOptional();
  const { pendingLevelUp } = adaptiveData;

  // Accepting a speed-challenge offer enables the challenge so the consumer
  // routes to its duration-pick ready screen. Free Play short-circuits before
  // that screen (it's a Drill-mode concept), so leave Free Play first. The
  // changeDifficulty path is handled entirely by handleLevelUp.
  const accept = () => {
    if (pendingLevelUp?.action === 'trySpeedChallenge') {
      trainerMode?.setTrainerMode('drill');
      setSpeedChallenge((prev) => ({ ...prev, enabled: true }));
    }
    handleLevelUp(true);
  };

  // Don't show level-up dialog during active speed challenge or in homework mode.
  // In Free Play the trainer's suppression effect silently declines tainted
  // streaks (no dialog), so when this dialog does render in Free Play the
  // streak was pure — use the same brand-voice copy as Drill.
  if (!pendingLevelUp || speedChallenge.isActive || suppressInHomework) return null;

  return (
    <ui.Dialog open={!!pendingLevelUp} onOpenChange={(open) => !open && handleLevelUp(false)}>
      <ui.DialogContent className="max-w-xl" data-tour="mathmog-levelup">
        <ui.DialogHeader>
          <ui.DialogTitle className="text-center text-2xl">
            <div className="text-4xl mb-4">{pendingLevelUp.emojis}</div>
            <span className="font-extrabold text-lg block">{pendingLevelUp.title}</span>
            {pendingLevelUp.allCapsTitle && (
              <span className="font-extrabold text-lg block">{pendingLevelUp.allCapsTitle}</span>
            )}
          </ui.DialogTitle>
          <ui.DialogDescription className="text-center pt-2 text-primary font-semibold text-lg">
            {pendingLevelUp.subtitle}
          </ui.DialogDescription>
        </ui.DialogHeader>
        <ui.DialogFooter className="flex-col sm:flex-row sm:justify-center gap-2 mt-4">
          <ui.Button
            type="button"
            onClick={() => handleLevelUp(false)}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            {pendingLevelUp.options.no}
          </ui.Button>
          <ui.Button
            type="button"
            onClick={accept}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            {pendingLevelUp.options.yes}
          </ui.Button>
        </ui.DialogFooter>
      </ui.DialogContent>
    </ui.Dialog>
  );
}
