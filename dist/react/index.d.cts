import * as React from 'react';
import { ComponentType, ReactNode, MouseEvent, ForwardRefExoticComponent, InputHTMLAttributes, RefAttributes, Dispatch, SetStateAction } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { D as Difficulty, w as Problem, t as MissDiagnosis, a as AdaptiveData, u as MissedMathmogProblem, S as SpeedChallengeState, h as LearnModuleDef, l as LearnSessionConfig, o as LearnSessionState, m as LearnSessionEvent, e as LearnItem, s as MemorizeLearnTopic, r as MathmogOffer } from '../offers-BxZYU1VI.cjs';

/**
 * Generic data-attribute passthrough. Allows package components to anchor
 * tour libraries (`data-tour="..."`) or analytics hooks (`data-testid="..."`)
 * onto any primitive. Real shadcn primitives spread `...props` to the
 * underlying DOM element anyway — this just admits that into the type system.
 */
type DataAttrs = Record<`data-${string}`, string | undefined>;
/**
 * The full set of shadcn-style UI primitives the package components consume.
 *
 * Consumers (portal + website) supply their own primitive implementations
 * — the package only cares that the prop shape matches. Variants only list
 * values the package actually uses; widening the union in consumer types is
 * fine and forward-compatible.
 *
 * IMPORTANT: `Input` MUST forwardRef to the underlying <input>. The package's
 * `ProblemDisplay` uses `inputRef.current.focus()` on mobile to trigger the
 * soft keyboard. A consumer Input that doesn't forwardRef will silently
 * break focus-on-mount.
 */
interface UIPrimitiveBag {
    Card: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    CardContent: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    CardHeader: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    CardTitle: ComponentType<{
        className?: string;
        children?: ReactNode;
    } & DataAttrs>;
    CardDescription: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    Button: ComponentType<{
        className?: string;
        variant?: 'default' | 'secondary' | 'ghost' | 'outline' | 'destructive';
        size?: 'sm' | 'default' | 'lg' | 'icon';
        disabled?: boolean;
        onClick?: (e: MouseEvent) => void;
        type?: 'button' | 'submit' | 'reset';
        children?: ReactNode;
    } & DataAttrs>;
    Input: ForwardRefExoticComponent<InputHTMLAttributes<HTMLInputElement> & RefAttributes<HTMLInputElement>>;
    Switch: ComponentType<{
        id?: string;
        checked?: boolean;
        onCheckedChange?: (checked: boolean) => void;
    } & DataAttrs>;
    Label: ComponentType<{
        htmlFor?: string;
        className?: string;
        children?: ReactNode;
    }>;
    Progress: ComponentType<{
        value: number;
        className?: string;
    }>;
    Badge: ComponentType<{
        variant?: 'default' | 'secondary' | 'outline' | 'destructive';
        className?: string;
        children?: ReactNode;
    } & DataAttrs>;
    Alert: ComponentType<{
        variant?: 'default' | 'destructive';
        className?: string;
        children?: ReactNode;
    }>;
    AlertDescription: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    AlertTitle: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    Dialog: ComponentType<{
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
        children?: ReactNode;
    }>;
    DialogContent: ComponentType<{
        className?: string;
        children?: ReactNode;
    } & DataAttrs>;
    DialogHeader: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    DialogTitle: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    DialogDescription: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    DialogFooter: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    Select: ComponentType<{
        value?: string;
        onValueChange?: (v: string) => void;
        disabled?: boolean;
        children?: ReactNode;
    }>;
    SelectContent: ComponentType<{
        children?: ReactNode;
    }>;
    SelectItem: ComponentType<{
        value: string;
        children?: ReactNode;
    }>;
    SelectTrigger: ComponentType<{
        id?: string;
        className?: string;
        children?: ReactNode;
    } & DataAttrs>;
    SelectValue: ComponentType<{
        placeholder?: string;
    }>;
    Tabs: ComponentType<{
        value?: string;
        onValueChange?: (v: string) => void;
        defaultValue?: string;
        className?: string;
        children?: ReactNode;
    } & DataAttrs>;
    TabsContent: ComponentType<{
        value: string;
        className?: string;
        children?: ReactNode;
    }>;
    TabsList: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    TabsTrigger: ComponentType<{
        value: string;
        className?: string;
        children?: ReactNode;
    } & DataAttrs>;
    Accordion: ComponentType<{
        type: 'single' | 'multiple';
        collapsible?: boolean;
        defaultValue?: string | string[];
        value?: string | string[];
        className?: string;
        children?: ReactNode;
    }>;
    AccordionItem: ComponentType<{
        value: string;
        className?: string;
        children?: ReactNode;
    }>;
    AccordionTrigger: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    AccordionContent: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    Table: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    TableBody: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    TableHead: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    TableHeader: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    TableRow: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
    TableCell: ComponentType<{
        className?: string;
        children?: ReactNode;
    }>;
}

declare function MathmogUIProvider({ ui, children, }: {
    ui: UIPrimitiveBag;
    children: ReactNode;
}): react_jsx_runtime.JSX.Element;
/**
 * Hook for package components. Throws if no `<MathmogUIProvider>` is mounted
 * above — that's a wiring bug consumers must fix at integration time, not
 * something to silently fall back from.
 */
declare function useMathmogUI(): UIPrimitiveBag;

interface TrainerStateContextValue {
    studyTab: string;
    setStudyTab: Dispatch<SetStateAction<string>>;
    darkMode: boolean;
    setDarkMode: Dispatch<SetStateAction<boolean>>;
}
declare const TrainerStateProvider: ({ children }: {
    children: ReactNode;
}) => react_jsx_runtime.JSX.Element;
declare const useTrainerState: () => TrainerStateContextValue;

type EstimationTier = 'exact' | 'within2' | 'within5' | 'within10' | 'outside' | null;
interface ProblemContextValue {
    currentLevel: number;
    currentDifficulty: Difficulty;
    currentTopic: string | undefined;
    currentScope: string | undefined;
    currentProblem: Problem | null;
    userAnswer: string;
    setUserAnswer: Dispatch<SetStateAction<string>>;
    feedback: string;
    estimationTier: EstimationTier;
    estimationDeviation: number | null;
    missDiagnosis: MissDiagnosis | null;
    correctEnrichment: string | null;
    score: {
        correct: number;
        total: number;
    };
    showAnswer: boolean;
    adaptiveData: AdaptiveData;
    problemHistory: string[];
    missedProblems: MissedMathmogProblem[];
    handleCheckAnswer: (answerToCheck: string) => void;
    handleNewProblem: (level?: number, difficulty?: Difficulty, topic?: string, scope?: string) => void;
    handleLevelDifficultyChange: (level: number, difficulty: Difficulty, topic?: string, scope?: string) => void;
    handleReset: () => void;
    handleLevelUp: (accept: boolean) => void;
    taintStreak: () => void;
}
declare function ProblemProvider({ children }: {
    children: ReactNode;
}): react_jsx_runtime.JSX.Element;
declare function useProblem(): ProblemContextValue;

interface SpeedChallengeContextValue {
    speedChallenge: SpeedChallengeState;
    setSpeedChallenge: Dispatch<SetStateAction<SpeedChallengeState>>;
    handleStartSpeedChallenge: () => void;
    clearSpeedChallengeResults: () => void;
}
declare const SpeedChallengeProvider: ({ children }: {
    children: ReactNode;
}) => react_jsx_runtime.JSX.Element;
declare const useSpeedChallenge: () => SpeedChallengeContextValue;

type TrainerMode = 'drill' | 'free-play';
interface SavePracticeSessionPayload {
    correct: number;
    total: number;
    level: 1 | 2 | 3;
    difficulty: Difficulty;
    topic?: string;
    timeSpentSeconds: number;
    isSpeedChallenge: boolean;
    duration?: number;
}
type OnSaveSession = (data: SavePracticeSessionPayload) => void | Promise<void>;
interface TrainerModeContextValue {
    trainerMode: TrainerMode;
    setTrainerMode: (mode: TrainerMode) => void;
    drillStarted: boolean;
    targetProblemCount: number;
    setTargetProblemCount: (count: number) => void;
    startDrill: () => void;
    endDrill: () => void;
    onSaveSession?: OnSaveSession;
}
declare function useTrainerMode(): TrainerModeContextValue;
declare function useTrainerModeOptional(): TrainerModeContextValue | null;
declare function TrainerModeProvider({ children, onSaveSession, }: {
    children: React.ReactNode;
    onSaveSession?: OnSaveSession;
}): react_jsx_runtime.JSX.Element;

/**
 * Composite provider that nests the four trainer contexts in the correct
 * order:
 *
 *   TrainerStateProvider
 *     └─ SpeedChallengeProvider
 *          └─ ProblemProvider
 *               └─ TrainerModeProvider   (reads useProblem internally)
 *
 * Consumers can still wrap with their own additional providers OUTSIDE this
 * composite (the portal nests HomeworkProvider/DrillProvider/ReferenceConsultedProvider
 * around it). If you need a different nesting order, import the individual
 * providers directly from `@peakprep/mathmog/react`.
 */
declare function MathmogTrainerProviders({ children, onSaveSession, }: {
    children: ReactNode;
    onSaveSession?: OnSaveSession;
}): react_jsx_runtime.JSX.Element;

declare function ScoreDisplay(): react_jsx_runtime.JSX.Element;

/**
 * Homework-mode elapsed timer. Inverted from the portal's `useHomework()`
 * read: the consumer passes `showTimer` in directly. When false (default
 * for non-homework contexts) the component renders null.
 *
 * NOTE: `useRef(Date.now())` produces non-deterministic initial state — if
 * a consumer SSRs this component, hydration mismatch is possible. Render
 * inside a `'use client'` boundary.
 */
declare function ElapsedTimer({ showTimer }: {
    showTimer: boolean;
}): react_jsx_runtime.JSX.Element | null;

/**
 * Renders the speed-challenge toggle, or — while a challenge is running —
 * an active-timer pill. In homework mode the toggle is hidden entirely
 * (config is locked upstream); the active-timer pill still renders if a
 * challenge is in progress.
 */
declare function SpeedChallengeControls({ isHomeworkMode, }: {
    isHomeworkMode?: boolean;
}): react_jsx_runtime.JSX.Element | null;

declare function TrainerConfigSelector(): react_jsx_runtime.JSX.Element;

interface Props {
    isHomeworkMode?: boolean;
    /** Optional override for the locked level label badge. Falls back to `currentLevel`. */
    homeworkLevelLabel?: string;
    /** Optional override for the locked difficulty badge. Falls back to `currentDifficulty`. */
    homeworkDifficulty?: Difficulty;
    /** Locked duration in minutes. Falls back to `speedChallenge.duration`. */
    lockedDuration?: number;
}
declare function SpeedChallengeReadyScreen({ isHomeworkMode, homeworkLevelLabel, homeworkDifficulty, lockedDuration, }: Props): react_jsx_runtime.JSX.Element;

interface MissesReviewScreenProps {
    misses: MissedMathmogProblem[];
    onDone: () => void;
}
/**
 * Inline review surface that walks the student through each miss with
 * an optional retry attempt + reveal.
 *
 * Reused by both the free-practice Drill flow (inserted between the
 * end of the drill and the quiet completion screen) and the homework
 * flow (entered via a button on the celebratory completion screen).
 */
declare function MissesReviewScreen({ misses, onDone }: MissesReviewScreenProps): react_jsx_runtime.JSX.Element;

/**
 * The adaptive-leveling celebration modal. Pops at 7 consecutive correct
 * (managed by ProblemProvider), offers a difficulty upgrade.
 *
 * Self-suppresses during an active speed challenge. Accepts an optional
 * `suppressInHomework` prop to disable the dialog in homework mode — the
 * orchestrator threads its homework flag through ProblemDisplay's
 * `isHomeworkMode` prop, which forwards to this dialog. Mount this
 * component standalone (no props) for consumers that don't have a
 * homework concept; it'll show whenever a `pendingLevelUp` is queued.
 */
declare function LevelUpDialog({ suppressInHomework, }?: {
    suppressInHomework?: boolean;
}): react_jsx_runtime.JSX.Element | null;

interface ProblemDisplayProps {
    /**
     * Drives all homework-mode gates inside this component:
     *  - hides "Show me" + "Skip" buttons
     *  - threads through to <LevelUpDialog suppressInHomework>
     * Default `false` (Free Play / standalone).
     */
    isHomeworkMode?: boolean;
    /**
     * When true, the embedded `<LevelUpDialog />` is omitted entirely. Useful
     * for consumers (e.g. the website demo) that don't want a level-up flow.
     * Default `false`.
     */
    hideLevelUpDialog?: boolean;
}
declare function ProblemDisplay({ isHomeworkMode, hideLevelUpDialog, }?: ProblemDisplayProps): react_jsx_runtime.JSX.Element | null;

declare function PrintableStudyGuideProvider({ children }: {
    children: React.ReactNode;
}): react_jsx_runtime.JSX.Element;
declare const MemorizeContent: () => react_jsx_runtime.JSX.Element;
declare const EstimateContent: () => react_jsx_runtime.JSX.Element;
declare const CraftyContent: () => react_jsx_runtime.JSX.Element;
declare const DifficultyScalingContent: () => react_jsx_runtime.JSX.Element;
/**
 * Reference content rendered inside the trainer's sidecar (and on the print
 * page). The portal manages the sidecar's Sheet wrapper and tracks open
 * count via `Sheet.onOpenChange`; consumers without a sheet of their own
 * can opt in via the `onOpen` callback below.
 *
 * NOTE on `onOpen`: fires once per *mount* (via `useEffect([])`). It does
 * NOT fire on every "Sheet open" if the consumer keeps `<StudyGuide />`
 * mounted across opens — for that, drive the count from the consumer's
 * own open/close handler. Mount/unmount-per-open consumers (e.g. a modal
 * pattern) can use `onOpen` directly.
 */
declare function StudyGuide({ onOpen }?: {
    onOpen?: () => void;
}): react_jsx_runtime.JSX.Element;

interface LearnSessionHostProps {
    /** The curated module to run (the caller resolves it from the registry). */
    module: LearnModuleDef<string, number>;
    /** Defaults to `MATHMOG_LEARN_CONFIG`. */
    config?: LearnSessionConfig;
    /**
     * Resume seam (2B.1): a previously-emitted `LearnSessionState`, persisted
     * verbatim and handed back verbatim (it JSON round-trips by machine
     * contract). Omit to start fresh. Must belong to `module` — a mismatched
     * id throws loudly.
     */
    initialSession?: LearnSessionState;
    /**
     * Fires after every machine action that changed the session, with the new
     * aggregate and the action's events. This is BOTH the 2B.1 persistence
     * seam (store `session` verbatim) and the 2B.6 telemetry seam (map
     * `events` to `mathmog_events` — the host itself emits nothing). Note the
     * machine's contract: a non-crossing recall correct is deliberately
     * eventless, so per-answer telemetry needs the call sites inside the tier
     * components' `onAnswer`, not these events.
     */
    onSessionChange?: (session: LearnSessionState, events: LearnSessionEvent[]) => void;
    /** Rendered inside the completion screen — the 2A.5 composition point. */
    completionSlot?: React.ReactNode;
    /** Injectable for deterministic tests (option draws + review-round shuffles). */
    rng?: () => number;
}
/**
 * The Learn session driver — the component slice 2B.2 mounts in the portal
 * trainer. Consumes the 2A.3 machine without re-deriving any of it: the UI
 * routes off the returned session + `learnSessionPhase` (never off events),
 * presents `currentLearnItemId` at `getLearnItemState(...).tier`, and maps
 * each surface to its machine action:
 *
 *   see        → LearnSeeCard        → applyLearnSeen
 *   recognize  → LearnRecognizeCard  → applyLearnAnswer(verdict)
 *   recall     → LearnRecallCard     → applyLearnAnswer(verdict)
 *   round-complete → LearnRoundSummaryScreen → startNextLearnRound
 *   module-complete → LearnCompletionScreen (final summary merged)
 *
 * Grading lives in the tier components (`gradeLearnRecall` accepts any
 * accepted-family member); the machine only ever sees the verdict.
 * Tier components are keyed by a presentation counter so every presentation
 * mounts fresh (a re-queued recognize item draws a new option layout).
 *
 * Within-module progress is the "Facts solid: N of M" count text only — no
 * bar, no percentage (Learn doc Q4; gamification line).
 */
declare function LearnSessionHost({ module, config, initialSession, onSessionChange, completionSlot, rng, }: LearnSessionHostProps): react_jsx_runtime.JSX.Element;

/**
 * The topic segment of a Learn module id, narrowed to the diagnosable
 * union — the shape `diagnoseMiss` takes. Null when the id doesn't parse or
 * the topic isn't a Memorize topic (no diagnosis; the See re-teach is the
 * designed fallback).
 */
declare function learnModuleTopic(moduleId: string): MemorizeLearnTopic | null;
/**
 * Every value the Recall grader accepts for an item: the live Drill family
 * for fraction items (any `FRACTION_ACCEPTED_DECIMALS` member — the 2A.2 /
 * 2D.1 contract), the exact answer for everything else.
 */
declare function acceptedLearnAnswers(item: LearnItem<string, number>): number[];
interface LearnRecallVerdict {
    correct: boolean;
    /** The parsed numeric answer (for `diagnoseMiss`); null if unparseable. */
    value: number | null;
}
/** Grades a Recall-tier typed answer. Blank or non-numeric input is a miss. */
declare function gradeLearnRecall(item: LearnItem<string, number>, typed: string): LearnRecallVerdict;
/**
 * How an item's answer renders on teach and reveal surfaces. A multi-member
 * accepted family marks a repeating decimal (terminating fractions and
 * non-fraction topics are single-member by construction), rendered as the
 * full repeating form with trailing ellipsis ("0.8333…").
 */
declare function learnAnswerDisplay(item: LearnItem<string, number>): string;
/**
 * The miss/decline reveal variant: for repeating decimals, the repeating
 * form plus the canonical anchor — "0.6666… (0.66 or 0.67 at 2 decimal
 * places)" — so the reveal and the Recognize option (the bare canonical)
 * never read as two different right answers on one screen, and the Recall
 * student knows what a sufficient typed answer looks like (2A.4 math-ed
 * reviewer recommendation; truncation-first order per 2D.1). Everything
 * else renders as `learnAnswerDisplay`.
 */
declare function learnAnswerRevealDisplay(item: LearnItem<string, number>): string;

interface LearnCompletionOffersProps {
    /** From `mathmogLearnCompletionOffers` — rendered in the order given. */
    offers: MathmogOffer[];
    /**
     * The call site owns what an offer does (trainer navigation) and its
     * telemetry (offer-tapped lands portal-side, with 2B.6 / Phase 3.4).
     */
    onSelectOffer: (offer: MathmogOffer) => void;
}
/**
 * The §6.6 next-step offers, mounted into `LearnSessionHost`'s
 * `completionSlot` by the portal (2B.2). Calm by the same rules as the
 * completion screen it lives in: the buttons name content, never the
 * student's result — no praise, no exclamation, no score commentary
 * (curriculum §3.7 copy notes). Renders nothing when there are no offers;
 * the absence is the message, never narrated.
 */
declare function LearnCompletionOffers({ offers, onSelectOffer, }: LearnCompletionOffersProps): react_jsx_runtime.JSX.Element | null;

export { CraftyContent, DifficultyScalingContent, ElapsedTimer, EstimateContent, type EstimationTier, LearnCompletionOffers, type LearnCompletionOffersProps, type LearnRecallVerdict, LearnSessionHost, type LearnSessionHostProps, LevelUpDialog, MathmogTrainerProviders, MathmogUIProvider, MemorizeContent, MissesReviewScreen, type OnSaveSession, PrintableStudyGuideProvider, type ProblemContextValue, ProblemDisplay, ProblemProvider, type SavePracticeSessionPayload, ScoreDisplay, type SpeedChallengeContextValue, SpeedChallengeControls, SpeedChallengeProvider, SpeedChallengeReadyScreen, StudyGuide, TrainerConfigSelector, type TrainerMode, type TrainerModeContextValue, TrainerModeProvider, type TrainerStateContextValue, TrainerStateProvider, type UIPrimitiveBag, acceptedLearnAnswers, gradeLearnRecall, learnAnswerDisplay, learnAnswerRevealDisplay, learnModuleTopic, useMathmogUI, useProblem, useSpeedChallenge, useTrainerMode, useTrainerModeOptional, useTrainerState };
