// @vitest-environment jsdom
/**
 * Characterization tests for `react/components/problem-display.tsx`
 * (Phase 5 of @peakprep/mathmog lift).
 *
 * NOTE: imports point at the portal source while the package is being
 * scaffolded. Once `@peakprep/mathmog/react` is published, re-point the
 * imports below to:
 *
 *   import ProblemDisplay from '@peakprep/mathmog/react';
 *   import {
 *     ProblemProvider,
 *     useProblem,
 *     SpeedChallengeProvider,
 *     useSpeedChallenge,
 *     HomeworkProvider,
 *   } from '@peakprep/mathmog/react';
 *
 * Triage: see ../../../triage/problem-display-triage.md
 *
 * Test approach: APPROACH A. We `vi.mock` the shadcn primitive modules at the
 * top of this file with plain HTML stubs. This mirrors what the lifted
 * package will do at runtime via `useMathmogUI()` + `UIPrimitiveBag`: the
 * portal's actual `Card`/`Button`/`Input`/`Dialog` Radix internals are
 * replaced with thin pass-through wrappers so we can characterize the
 * component's own observable behavior without Radix portals / pointer
 * capture / focus-trap noise. The mocked `Input` forwardRefs the same way
 * the contract (API design §2.2) requires for the package.
 */

import * as React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render as rtlRender, screen, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ---------------------------------------------------------------------------
// Mock bag — plain HTML pass-throughs, threaded via <MathmogUIProvider>.
// Post-lift the package's components read primitives via `useMathmogUI()`
// instead of importing `@/components/ui/*` directly, so the staged
// `vi.mock(...)` approach no longer applies. We wrap the rendered subject
// with a real `<MathmogUIProvider ui={mockBag}>` instead.
// ---------------------------------------------------------------------------

import { MathmogUIProvider } from '../../../src/react/ui/provider';
import type { UIPrimitiveBag } from '../../../src/react/ui/primitive-bag';

// IMPORTANT: every primitive in the bag must have STABLE COMPONENT IDENTITY
// across renders. A Proxy that returns a new function on each `get` access
// causes React to unmount + remount every primitive on every render (different
// component types), which wipes child component state — fatal for
// MultiTextInput (it loses its `answers` state on every keystroke). The
// staged subagent's intent was a passthrough bag; we materialize it eagerly.

// Note: we strip the `type` prop so the staged tests' `getByRole('textbox')`
// queries continue to work. The portal's real Input passes `type` through
// (turning numeric inputs into role="spinbutton"), but the staged tests query
// by role="textbox" for both number and text inputs. Keeping the stub
// role-stable matches the staged tests' intent.
const StubInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ type: _type, ...props }, ref) => <input ref={ref} {...props} />
);
StubInput.displayName = 'StubInput';

const StubButton = ({ children, onClick, disabled, type, variant, size, ...rest }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    type={type ?? 'button'}
    data-variant={variant}
    data-size={size}
    {...rest}
  >
    {children}
  </button>
);

const StubCard = ({ children, className }: any) => (
  <div data-testid="card" className={className}>{children}</div>
);
const StubBlock = ({ children, className, ...rest }: any) => (
  <div className={className} {...rest}>{children}</div>
);
const StubH2 = ({ children, className, ...rest }: any) => (
  <h2 className={className} {...rest}>{children}</h2>
);
const StubSpan = ({ children, className, ...rest }: any) => (
  <span className={className} {...rest}>{children}</span>
);
const StubAlert = ({ children, className, variant }: any) => (
  <div role="alert" data-variant={variant} className={className}>{children}</div>
);
const StubDialog = ({ children, open }: any) =>
  open ? <div role="dialog">{children}</div> : null;
const StubPassthrough = ({ children, ...rest }: any) => <div {...rest}>{children}</div>;

const mockBag: UIPrimitiveBag = {
  Card: StubCard,
  CardContent: StubBlock,
  CardHeader: StubBlock,
  CardTitle: StubH2,
  CardDescription: StubBlock,
  Button: StubButton,
  Input: StubInput,
  Switch: StubPassthrough,
  Label: StubBlock,
  Progress: StubPassthrough,
  Badge: StubSpan,
  Alert: StubAlert,
  AlertDescription: StubBlock,
  AlertTitle: StubBlock,
  Dialog: StubDialog,
  DialogContent: StubPassthrough,
  DialogHeader: StubPassthrough,
  DialogTitle: StubPassthrough,
  DialogDescription: StubPassthrough,
  DialogFooter: StubPassthrough,
  Select: StubPassthrough,
  SelectContent: StubPassthrough,
  SelectItem: StubPassthrough,
  SelectTrigger: StubPassthrough,
  SelectValue: StubPassthrough,
  Tabs: StubPassthrough,
  TabsContent: StubPassthrough,
  TabsList: StubPassthrough,
  TabsTrigger: StubPassthrough,
  Accordion: StubPassthrough,
  AccordionItem: StubPassthrough,
  AccordionTrigger: StubPassthrough,
  AccordionContent: StubPassthrough,
  Table: StubPassthrough,
  TableBody: StubPassthrough,
  TableHead: StubPassthrough,
  TableHeader: StubPassthrough,
  TableRow: StubPassthrough,
  TableCell: StubPassthrough,
} as UIPrimitiveBag;

function BagWrapper({ children }: { children: React.ReactNode }) {
  return <MathmogUIProvider ui={mockBag}>{children}</MathmogUIProvider>;
}

function render(ui: React.ReactElement, options?: RenderOptions) {
  return rtlRender(ui, { ...options, wrapper: BagWrapper });
}

// lucide-react is pure ESM and Vitest handles it natively, but to keep the
// DOM clean we stub icons to empty spans.
vi.mock('lucide-react', () => ({
  Check: () => <span data-testid="icon-check" />,
  ArrowRight: () => <span data-testid="icon-arrow-right" />,
}));

// Mock the problem generator so we can drive the provider deterministically.
vi.mock('../../../src/core/math-problems', async () => {
  const actual = await vi.importActual<any>(
    '../../../src/core/math-problems',
  );
  return {
    ...actual,
    generateProblem: vi.fn(),
  };
});

// ---------------------------------------------------------------------------
// Source imports (after mocks).
// ---------------------------------------------------------------------------

import { ProblemDisplay } from '../../../src/react/components/problem-display';
import {
  ProblemProvider,
  useProblem,
} from '../../../src/react/contexts/problem';
import {
  SpeedChallengeProvider,
  useSpeedChallenge,
} from '../../../src/react/contexts/speed-challenge';
import { generateProblem } from '../../../src/core/math-problems';
import type { Problem } from '../../../src/core/types';

const mockedGenerateProblem = generateProblem as unknown as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Problem fixtures + test harness.
// ---------------------------------------------------------------------------

function queueProblems(problems: Problem[]) {
  mockedGenerateProblem.mockReset();
  let i = 0;
  mockedGenerateProblem.mockImplementation(() => {
    const p = problems[i] ?? problems[problems.length - 1];
    i += 1;
    return p;
  });
}

const numberProblem = (overrides: Partial<Problem> = {}): Problem => ({
  question: 'What is 2 + 2?',
  answer: 4,
  type: 'Default',
  explanation: 'Two plus two is four.',
  inputType: 'number',
  ...overrides,
});

const textProblem = (overrides: Partial<Problem> = {}): Problem => ({
  question: 'Write the fraction.',
  answer: '1/2',
  type: 'Fraction',
  explanation: 'One half.',
  inputType: 'text',
  ...overrides,
});

const fractionProblem = (overrides: Partial<Problem> = {}): Problem => ({
  question: 'Simplify 2/4.',
  answer: '1/2',
  type: 'Fraction',
  explanation: '2/4 simplifies to 1/2.',
  inputType: 'text',
  ...overrides,
});

const buttonsProblem = (overrides: Partial<Problem> = {}): Problem => ({
  question: 'Is 7 prime?',
  answer: 'yes',
  type: 'YesNo',
  explanation: '7 is prime.',
  inputType: 'buttons',
  options: ['yes', 'no'],
  ...overrides,
});

const multiTextProblem = (overrides: Partial<Problem> = {}): Problem => ({
  question: ['', ' + ', ' + ', ' = 10'],
  answer: ['3,3,4', '4,3,3', '3,4,3'],
  type: 'PartitionSum',
  explanation: '3 + 3 + 4 = 10.',
  inputType: 'multi-text',
  ...overrides,
});

const rootEstimationProblem = (overrides: Partial<Problem> = {}): Problem => ({
  question: '√50 is between which two perfect squares, and closer to which?',
  answer: '7,8,7',
  type: 'Root Estimation',
  explanation: 'Between 7 and 8, closer to 7.',
  inputType: 'text',
  ...overrides,
});

const estimationProblem = (overrides: Partial<Problem> = {}): Problem => ({
  question: 'Estimate 197 × 4.',
  answer: 788,
  type: 'Multiplication Estimation',
  explanation: '197 × 4 = 788.',
  inputType: 'number',
  ...overrides,
});

// Provider handle exporter — lets a test drive context state directly when
// asserting on observable wiring (e.g. activating a speed challenge or
// triggering handleNewProblem after first render).

type Handle = {
  problem: ReturnType<typeof useProblem>;
  speedChallenge: ReturnType<typeof useSpeedChallenge>;
};
let handle: Handle | null = null;

function HandleExporter() {
  const problem = useProblem();
  const speedChallenge = useSpeedChallenge();
  handle = { problem, speedChallenge };
  return null;
}

// Post-lift, ProblemDisplay no longer reads `useHomework()` — homework mode
// is a prop. `withHomework` now threads through `<ProblemDisplay isHomeworkMode />`
// rather than wrapping with HomeworkProvider (which is portal-only and
// intentionally NOT part of @peakprep/mathmog/react). Tests that pass their
// own `children` are unaffected.
function Providers({
  withHomework = false,
  children,
}: {
  withHomework?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <SpeedChallengeProvider>
      <ProblemProvider>
        <HandleExporter />
        {children ?? <ProblemDisplay isHomeworkMode={withHomework} />}
      </ProblemProvider>
    </SpeedChallengeProvider>
  );
}

beforeEach(() => {
  handle = null;
});

afterEach(() => {
  vi.useRealTimers();
});

// ===========================================================================
// 1. No-problem render path.
// ===========================================================================

describe('ProblemDisplay — no current problem', () => {
  it('renders only the LevelUpDialog and no Card when currentProblem is null', () => {
    queueProblems([numberProblem()]);
    const { container } = render(<Providers />);
    // No problem requested yet — provider's currentProblem is null and the
    // pendingLevelUp is null too, so the dialog also renders nothing.
    expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });
});

// ===========================================================================
// 2. Number / text input rendering.
// ===========================================================================

describe('ProblemDisplay — number / text inputs', () => {
  it('renders the question text and a single text-type Input for number problems', () => {
    queueProblems([numberProblem({ question: 'What is 6 × 7?' })]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    expect(screen.getByText('What is 6 × 7?')).toBeInTheDocument();
    // The visible question CardTitle is rendered for non-multi-text inputs.
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });

  it('typing into the input updates userAnswer via setUserAnswer', async () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '42' } });
    expect(handle!.problem.userAnswer).toBe('42');
  });

  it('Enter on the input calls onCheckAnswer (no feedback yet)', () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '4' } });
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });
    expect(handle!.problem.feedback).toBe('correct');
  });

  it('Enter on the input advances to next problem when feedback is already set', () => {
    queueProblems([
      numberProblem({ question: 'First' }),
      numberProblem({ question: 'Second' }),
    ]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('4'));
    expect(handle!.problem.feedback).toBe('correct');

    const input = screen.getByRole('textbox');
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 });
    expect(handle!.problem.feedback).toBe('');
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('displays placeholder when set on the problem', () => {
    queueProblems([numberProblem({ placeholder: 'e.g. 42' })]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    expect(screen.getByPlaceholderText('e.g. 42')).toBeInTheDocument();
  });

  it('defaults placeholder to "Your answer..." when none provided', () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    expect(screen.getByPlaceholderText('Your answer...')).toBeInTheDocument();
  });

  it('disables the input after feedback fires', () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('4'));
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders question text for fraction problems (still text input)', () => {
    queueProblems([fractionProblem({ question: 'Simplify 3/9.' })]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    expect(screen.getByText('Simplify 3/9.')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });

  it('renders question text for root-estimation problems (single text input)', () => {
    queueProblems([rootEstimationProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    // Root-estimation problems use inputType:'text' with answer "x,y,z" — only
    // one Input is rendered (NOT a multi-text triple). This is per contract.
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(
      screen.getByText(/which two perfect squares/i),
    ).toBeInTheDocument();
  });

  it('renders question text for estimation problems', () => {
    queueProblems([estimationProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    expect(screen.getByText('Estimate 197 × 4.')).toBeInTheDocument();
  });
});

// ===========================================================================
// 3. Yes/no (buttons) inputType.
// ===========================================================================

describe('ProblemDisplay — buttons inputType', () => {
  it('renders one button per option', () => {
    queueProblems([buttonsProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });

  it('clicking an option submits via handleCheckAnswer', async () => {
    queueProblems([buttonsProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    await userEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(handle!.problem.feedback).toBe('correct');
  });

  it('does NOT render the main text Input for buttons inputType', () => {
    queueProblems([buttonsProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    // No textbox — only buttons.
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('y / n window keydown shortcuts submit yes / no', () => {
    queueProblems([buttonsProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    fireEvent.keyDown(window, { key: 'y' });
    expect(handle!.problem.feedback).toBe('correct');
  });

  it('option buttons become disabled after feedback', () => {
    queueProblems([buttonsProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('yes'));

    expect(screen.getByRole('button', { name: 'Yes' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'No' })).toBeDisabled();
  });
});

// ===========================================================================
// 4. Multi-text input. A.5 #1+#2 (mount-write `",,"` and the paired Check
// Answer trim() guard) shipped in commit 8c73b1f. Tests below pin the
// fixed behavior: userAnswer stays empty until the user types, and the
// button is disabled until then.
// ===========================================================================

describe('ProblemDisplay — multi-text input', () => {
  it('renders exactly three Input elements regardless of questionParts length', () => {
    queueProblems([multiTextProblem({ question: ['A', 'B', 'C', 'D'] })]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    // Three text inputs from MultiTextInput (CardTitle is suppressed for
    // multi-text per the source).
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
  });

  it('hides the CardTitle for multi-text inputs (question parts render inline)', () => {
    queueProblems([multiTextProblem({ question: ['ALPHA', ' + ', ' = ', '10'] })]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    // No <h2> CardTitle for multi-text — the question parts render inline
    // around the three inputs.
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    // Inline parts are still in the document text.
    expect(screen.getByText(/ALPHA/)).toBeInTheDocument();
  });

  it('keeps userAnswer empty on mount until the user types', () => {
    queueProblems([multiTextProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    expect(handle!.problem.userAnswer).toBe('');
  });

  it('Check Answer button is disabled before the user has typed anything', () => {
    queueProblems([multiTextProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    const btn = screen.getByRole('button', { name: /check answer/i });
    expect(btn).toBeDisabled();
  });

  it('Check Answer becomes enabled and reports correct feedback after the user types a valid answer', async () => {
    queueProblems([multiTextProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: '3' } });
    fireEvent.change(inputs[1], { target: { value: '3' } });
    fireEvent.change(inputs[2], { target: { value: '4' } });

    const btn = screen.getByRole('button', { name: /check answer/i });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(handle!.problem.feedback).toBe('correct');
  });

  it('Enter on the third input calls onCheck (submit)', () => {
    queueProblems([multiTextProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: '3' } });
    fireEvent.change(inputs[1], { target: { value: '3' } });
    fireEvent.change(inputs[2], { target: { value: '4' } });
    // Enter on the last input submits via onCheck → handleCheckAnswer.
    fireEvent.keyDown(inputs[2], { key: 'Enter' });
    expect(handle!.problem.feedback).toBe('correct');
  });

  it('Enter on the first or second input does NOT submit (focus advances instead)', () => {
    queueProblems([multiTextProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: '3' } });
    fireEvent.keyDown(inputs[0], { key: 'Enter' });
    // Feedback unchanged — submission only happens via Enter on input #3.
    expect(handle!.problem.feedback).toBe('');
  });
});

// ===========================================================================
// 5. Check Answer button — guard behavior + trim() rule.
// ===========================================================================

describe('ProblemDisplay — Check Answer button', () => {
  it('is disabled while userAnswer is empty', () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    expect(
      screen.getByRole('button', { name: /check answer/i }),
    ).toBeDisabled();
  });

  it('is disabled while userAnswer is only whitespace (trim() === "")', () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.setUserAnswer('   '));

    expect(
      screen.getByRole('button', { name: /check answer/i }),
    ).toBeDisabled();
  });

  it('is enabled when userAnswer has non-whitespace content', () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.setUserAnswer('4'));

    expect(
      screen.getByRole('button', { name: /check answer/i }),
    ).not.toBeDisabled();
  });

  it('is permanently disabled for buttons inputType (action happens on option click)', () => {
    queueProblems([buttonsProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    expect(
      screen.getByRole('button', { name: /check answer/i }),
    ).toBeDisabled();
  });

  it('clicking Check Answer submits userAnswer via handleCheckAnswer', async () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.setUserAnswer('4'));

    await userEvent.click(screen.getByRole('button', { name: /check answer/i }));
    expect(handle!.problem.feedback).toBe('correct');
  });

  it('hides the Check Answer button once feedback is present', () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('4'));

    expect(
      screen.queryByRole('button', { name: /check answer/i }),
    ).not.toBeInTheDocument();
  });
});

// ===========================================================================
// 6. Speed-challenge auto-advance (100 ms).
// ===========================================================================

describe('ProblemDisplay — speed-challenge auto-advance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('advances to next problem 100 ms after feedback while speedChallenge.isActive', () => {
    queueProblems([
      numberProblem({ question: 'First' }),
      numberProblem({ question: 'Second' }),
    ]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() =>
      handle!.speedChallenge.setSpeedChallenge({
        enabled: true,
        duration: 2,
        timeLeft: 120,
        isActive: true,
        results: null,
      }),
    );
    act(() => handle!.problem.handleCheckAnswer('4'));
    expect(handle!.problem.feedback).toBe('correct');
    expect(screen.getByText('First')).toBeInTheDocument();

    // Just before 100 ms: not yet advanced.
    act(() => {
      vi.advanceTimersByTime(99);
    });
    expect(screen.getByText('First')).toBeInTheDocument();

    // At 100 ms total: advance fires → handleNewProblem → feedback resets.
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(handle!.problem.feedback).toBe('');
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('does NOT auto-advance when speedChallenge is inactive (even with feedback)', () => {
    queueProblems([
      numberProblem({ question: 'First' }),
      numberProblem({ question: 'Second' }),
    ]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('4'));
    expect(handle!.problem.feedback).toBe('correct');

    act(() => {
      vi.advanceTimersByTime(500);
    });
    // Still showing First — no auto-advance.
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(handle!.problem.feedback).toBe('correct');
  });

  it('suppresses the Next Problem button during active speed challenge', () => {
    queueProblems([numberProblem(), numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() =>
      handle!.speedChallenge.setSpeedChallenge({
        enabled: true,
        duration: 2,
        timeLeft: 120,
        isActive: true,
        results: null,
      }),
    );
    act(() => handle!.problem.handleCheckAnswer('4'));
    expect(
      screen.queryByRole('button', { name: /next problem/i }),
    ).not.toBeInTheDocument();
  });

  it('suppresses the standard feedback block during active speed challenge', () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() =>
      handle!.speedChallenge.setSpeedChallenge({
        enabled: true,
        duration: 2,
        timeLeft: 120,
        isActive: true,
        results: null,
      }),
    );
    act(() => handle!.problem.handleCheckAnswer('4'));
    // No "Correct!" copy because the entire feedback block is suppressed.
    expect(screen.queryByText('✅ Correct!')).not.toBeInTheDocument();
  });
});

// ===========================================================================
// 7. Show me / Skip — reveal & taint behavior.
// ===========================================================================

describe('ProblemDisplay — Show me / Skip controls', () => {
  it('renders Show me and Skip in free practice (not homework, not speed challenge)', () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    expect(screen.getByRole('button', { name: /show me/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^skip$/i })).toBeInTheDocument();
  });

  it('hides Show me / Skip in homework mode', () => {
    queueProblems([numberProblem()]);
    render(<Providers withHomework />);
    act(() => handle!.problem.handleNewProblem());

    expect(screen.queryByRole('button', { name: /show me/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^skip$/i })).not.toBeInTheDocument();
  });

  it('hides Show me / Skip during active speed challenge', () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() =>
      handle!.speedChallenge.setSpeedChallenge({
        enabled: true,
        duration: 2,
        timeLeft: 120,
        isActive: true,
        results: null,
      }),
    );

    expect(screen.queryByRole('button', { name: /show me/i })).not.toBeInTheDocument();
  });

  it('Show me reveals the formatted answer and the explanation', async () => {
    queueProblems([numberProblem({ answer: 4, explanation: 'Because addition.' })]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    await userEvent.click(screen.getByRole('button', { name: /show me/i }));

    expect(screen.getByText('Answer')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Because addition.')).toBeInTheDocument();
  });

  it('Show me joins array answers with " or "', async () => {
    queueProblems([numberProblem({ answer: [0.3, 0.33, 0.333] })]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    await userEvent.click(screen.getByRole('button', { name: /show me/i }));
    expect(screen.getByText('0.3 or 0.33 or 0.333')).toBeInTheDocument();
  });

  it('Show me does NOT change score or missedProblems but DOES taint streak', async () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    const beforeScore = handle!.problem.score;
    const beforeMissed = handle!.problem.missedProblems;

    await userEvent.click(screen.getByRole('button', { name: /show me/i }));

    expect(handle!.problem.score).toEqual(beforeScore);
    expect(handle!.problem.missedProblems).toEqual(beforeMissed);
    expect(handle!.problem.adaptiveData.streakPure).toBe(false);
  });

  it('Skip advances to next problem without changing score or missedProblems', async () => {
    queueProblems([
      numberProblem({ question: 'First' }),
      numberProblem({ question: 'Second' }),
    ]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    const beforeScore = handle!.problem.score;
    const beforeMissed = handle!.problem.missedProblems;

    await userEvent.click(screen.getByRole('button', { name: /^skip$/i }));

    expect(handle!.problem.score).toEqual(beforeScore);
    expect(handle!.problem.missedProblems).toEqual(beforeMissed);
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(handle!.problem.adaptiveData.streakPure).toBe(false);
  });

  it('Skip does NOT reveal the answer', async () => {
    queueProblems([numberProblem(), numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    await userEvent.click(screen.getByRole('button', { name: /^skip$/i }));
    expect(screen.queryByText('Answer')).not.toBeInTheDocument();
  });
});

// ===========================================================================
// 8. Feedback block — estimation tiers + standard correct/incorrect.
// ===========================================================================

describe('ProblemDisplay — feedback block', () => {
  it('renders ✅ Correct! for non-estimation correct feedback', () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('4'));

    expect(screen.getByText('✅ Correct!')).toBeInTheDocument();
  });

  it('renders Not quite! for non-estimation incorrect feedback', () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('99'));

    expect(screen.getByText(/Not quite!/i)).toBeInTheDocument();
  });

  it('renders the explanation block when showAnswer is true', () => {
    queueProblems([numberProblem({ explanation: 'Why two plus two is four.' })]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('4'));

    expect(screen.getByText('Why two plus two is four.')).toBeInTheDocument();
  });

  it('renders "Exactly correct" tier copy when estimation hits within 0.1% (exact)', () => {
    queueProblems([estimationProblem({ answer: 100 })]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('100'));

    expect(screen.getByText(/Exactly correct/i)).toBeInTheDocument();
  });

  it('renders "Within 2%" tier copy when estimation is within 2%', () => {
    queueProblems([estimationProblem({ answer: 100 })]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('101'));

    expect(screen.getByText(/Within 2% of the exact answer/i)).toBeInTheDocument();
  });

  it('renders "Keep at it!" tier copy with deviation when estimation outside 10%', () => {
    queueProblems([estimationProblem({ answer: 100 })]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('200'));

    expect(screen.getByText(/Keep at it!/i)).toBeInTheDocument();
    // estimationDeviation rendered as <number>.toFixed(1) + "%".
    expect(screen.getByText(/100\.0%/)).toBeInTheDocument();
  });
});

// ===========================================================================
// 9. LevelUpDialog suppression rules.
// ===========================================================================

describe('ProblemDisplay — LevelUpDialog', () => {
  function pushSevenCorrect() {
    act(() => handle!.problem.handleNewProblem());
    for (let i = 0; i < 7; i += 1) {
      act(() => handle!.problem.handleCheckAnswer('4'));
      act(() => handle!.problem.handleNewProblem());
    }
  }

  it('renders when pendingLevelUp is set in free practice', () => {
    queueProblems(Array.from({ length: 10 }, () => numberProblem()));
    render(<Providers />);
    pushSevenCorrect();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText(/we're all out of easy problems/i),
    ).toBeInTheDocument();
  });

  it('is suppressed in homework mode (pendingLevelUp still set in state)', () => {
    queueProblems(Array.from({ length: 10 }, () => numberProblem()));
    render(<Providers withHomework />);
    pushSevenCorrect();

    expect(handle!.problem.adaptiveData.pendingLevelUp).not.toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is suppressed during active speed challenge', () => {
    queueProblems(Array.from({ length: 10 }, () => numberProblem()));
    render(<Providers />);
    act(() =>
      handle!.speedChallenge.setSpeedChallenge({
        enabled: true,
        duration: 2,
        timeLeft: 120,
        isActive: true,
        results: null,
      }),
    );
    pushSevenCorrect();

    expect(handle!.problem.adaptiveData.pendingLevelUp).not.toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('clicking the "no" option calls handleLevelUp(false) and clears pendingLevelUp', async () => {
    queueProblems(Array.from({ length: 10 }, () => numberProblem()));
    render(<Providers />);
    pushSevenCorrect();

    // "No" option copy for Easy→Medium.
    await userEvent.click(screen.getByRole('button', { name: /nah I'm good/i }));
    expect(handle!.problem.adaptiveData.pendingLevelUp).toBeNull();
  });

  it('clicking the "yes" option calls handleLevelUp(true) and clears pendingLevelUp', async () => {
    queueProblems(Array.from({ length: 10 }, () => numberProblem()));
    render(<Providers />);
    pushSevenCorrect();

    await userEvent.click(screen.getByRole('button', { name: /sounds delicious/i }));
    expect(handle!.problem.adaptiveData.pendingLevelUp).toBeNull();
  });
});

// ===========================================================================
// 10. Keyboard listener — ignores keys while focus is in an input.
// ===========================================================================

describe('ProblemDisplay — window keydown listener', () => {
  it('Enter advances when feedback is set and focus is NOT on an input', () => {
    queueProblems([
      numberProblem({ question: 'First' }),
      numberProblem({ question: 'Second' }),
    ]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('4'));
    expect(handle!.problem.feedback).toBe('correct');

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(handle!.problem.feedback).toBe('');
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('ignores y / n when focus is in an input (buttons inputType)', () => {
    queueProblems([buttonsProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());

    // Even though there's no text input in DOM for buttons inputType, the
    // listener only fires y/n when activeElement is not an <input>. Sanity
    // check: explicitly create + focus an input and confirm shortcut is
    // suppressed.
    const fake = document.createElement('input');
    document.body.appendChild(fake);
    fake.focus();
    fireEvent.keyDown(window, { key: 'y' });
    expect(handle!.problem.feedback).toBe('');
    fake.remove();
  });
});

// ===========================================================================
// 10. Phase 2D.3 — feedback intelligence (identity line, enrichment
//     postscript, over-precision unification, capture-time storage).
// ===========================================================================

import { diagnoseMiss, fractionEnrichmentPostscript } from '../../../src/core/diagnosis';

const frac56Problem = (): Problem => ({
  question: 'Convert 5/6 to a decimal (3 decimal places)',
  answer: [0.83, 0.833, 0.8333],
  type: 'Fraction to Decimal',
  explanation: '5/6 = 5 ÷ 6 = 0.8333… — to 3 decimal places, 0.833',
  inputType: 'number',
  fact: { topic: 'fraction_conversions', itemId: '5/6' },
});

const frac13Problem = (): Problem => ({
  question: 'Convert 1/3 to a decimal (2 decimal places)',
  answer: [0.33, 0.333],
  type: 'Fraction to Decimal',
  explanation: '1/3 = 1 ÷ 3 = 0.3333… — to 2 decimal places, 0.33',
  inputType: 'number',
  fact: { topic: 'fraction_conversions', itemId: '1/3' },
});

const frac23Problem = (): Problem => ({
  question: 'Convert 2/3 to a decimal (2 decimal places)',
  answer: [0.66, 0.67, 0.666, 0.667],
  type: 'Fraction to Decimal',
  explanation: '2/3 = 2 ÷ 3 = 0.6666… — to 2 decimal places, 0.66 or 0.67',
  inputType: 'number',
  fact: { topic: 'fraction_conversions', itemId: '2/3' },
});

const frac17Problem = (): Problem => ({
  question: 'Convert 1/7 to a decimal (3 decimal places)',
  answer: [0.14, 0.142, 0.143, 0.1428, 0.1429],
  type: 'Fraction to Decimal',
  explanation: '1/7 = 1 ÷ 7 = 0.142857… — to 3 decimal places, 0.142 or 0.143',
  inputType: 'number',
  fact: { topic: 'fraction_conversions', itemId: '1/7' },
});

const frac38Problem = (): Problem => ({
  question: 'Convert 3/8 to a decimal (3 decimal places)',
  answer: 0.375,
  type: 'Fraction to Decimal',
  explanation: '3/8 = 3 ÷ 8 = 0.375',
  inputType: 'number',
  fact: { topic: 'fraction_conversions', itemId: '3/8' },
});

const frac56PercentProblem = (): Problem => ({
  question: 'Convert 5/6 to a percent (1 decimal places)',
  answer: [83, 83.3],
  type: 'Fraction to Percent',
  explanation: '5/6 = 0.8333… = 83.3333…% — to 1 decimal place, 83.3% or 83.3%',
  inputType: 'number',
  fact: { topic: 'fraction_conversions', itemId: '5/6', percentShift: true },
});

const ttProblem = (): Problem => ({
  question: '6 × 8 = ?',
  answer: 48,
  type: 'Times Tables',
  explanation: '6 × 8 = 48.',
  inputType: 'number',
  fact: { topic: 'times_tables', itemId: '6x8' },
});

const activateSpeed = () =>
  act(() =>
    handle!.speedChallenge.setSpeedChallenge({
      enabled: true,
      duration: 2,
      timeLeft: 120,
      isActive: true,
      results: null,
    }),
  );

describe('ProblemDisplay — 2D.3 untimed miss identity line', () => {
  it('renders the diagnoseMiss line VERBATIM under the verdict on an untimed miss', () => {
    queueProblems([frac56Problem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('0.84'));

    expect(handle!.problem.feedback).toBe('incorrect');
    const expected = diagnoseMiss('fraction_conversions', '5/6', 0.84)!.message;
    // Pin the actual copy too, not just the indirection.
    expect(expected).toBe(
      "So close. 0.84 is one digit off in the last place. 5/6 = 0.8333… At 2 decimal places, that's 0.83.",
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
    expect(screen.getByText(/Not quite!/)).toBeInTheDocument();
  });

  it('renders the mechanical times-tables identity line on a free-recall wrong answer', () => {
    queueProblems([ttProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('54'));

    expect(
      screen.getByText('54 is 6 × 9. 6 × 8 is one 6 less: 48.'),
    ).toBeInTheDocument();
  });

  it('null diagnosis: verdict + explanation only, exactly as before (no extra line)', () => {
    queueProblems([ttProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    // 50 matches no mechanical identity (no adjacent product, no addition
    // slip, no digit swap) — diagnoseMiss returns null.
    act(() => handle!.problem.handleCheckAnswer('50'));

    expect(handle!.problem.feedback).toBe('incorrect');
    expect(handle!.problem.missDiagnosis).toBeNull();
    expect(screen.getByText(/Not quite!/)).toBeInTheDocument();
    expect(screen.getByText('Explanation')).toBeInTheDocument();
    expect(screen.queryByText(/is 6 ×/)).not.toBeInTheDocument();
  });

  it('problems without a stamped fact never diagnose (estimation, legacy shapes)', () => {
    queueProblems([numberProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('5'));

    expect(handle!.problem.feedback).toBe('incorrect');
    expect(handle!.problem.missDiagnosis).toBeNull();
    expect(handle!.problem.missedProblems[0].diagnosisMessage).toBeUndefined();
  });

  it('two-line budget: verdict + ONE identity line, never a postscript on a miss', () => {
    queueProblems([frac56Problem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('0.84'));

    const expected = diagnoseMiss('fraction_conversions', '5/6', 0.84)!.message;
    expect(screen.getAllByText(expected)).toHaveLength(1);
    expect(handle!.problem.correctEnrichment).toBeNull();
    expect(screen.queryByText(/Full story|rounded form/)).not.toBeInTheDocument();
  });

  it('clears the identity line when the next problem arrives', () => {
    queueProblems([frac56Problem(), numberProblem({ question: 'Second' })]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('0.84'));
    expect(handle!.problem.missDiagnosis).not.toBeNull();

    act(() => handle!.problem.handleNewProblem());
    expect(handle!.problem.missDiagnosis).toBeNull();
    expect(
      screen.queryByText(/one digit off in the last place/),
    ).not.toBeInTheDocument();
  });
});

describe('ProblemDisplay — 2D.3 SPEED: nothing new mid-drill (pinned)', () => {
  it('identity line does NOT render during an active speed challenge — but the capture-time lookup still stores it for misses-review', () => {
    queueProblems([frac56Problem(), frac56Problem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    activateSpeed();
    act(() => handle!.problem.handleCheckAnswer('0.84'));

    const message = diagnoseMiss('fraction_conversions', '5/6', 0.84)!.message;
    expect(screen.queryByText(message)).not.toBeInTheDocument();
    expect(screen.queryByText(/Not quite!/)).not.toBeInTheDocument();

    // Diagnosis defers to misses-review: stored on the captured record.
    expect(handle!.problem.missedProblems).toHaveLength(1);
    expect(handle!.problem.missedProblems[0].diagnosisMessage).toBe(message);
    expect(handle!.problem.missedProblems[0].diagnosisCode).toBe('frac-last-digit');
  });

  it('enrichment postscript does NOT render during an active speed challenge', () => {
    queueProblems([frac23Problem(), frac23Problem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    activateSpeed();
    act(() => handle!.problem.handleCheckAnswer('0.67'));

    expect(handle!.problem.feedback).toBe('correct');
    expect(screen.queryByText(/rounded form|Full story/)).not.toBeInTheDocument();
  });
});

describe('ProblemDisplay — 2D.3 Drill over-precision unification (Charlie-ratified)', () => {
  it('accepts 0.3333 for 1/3 (beyond the displayed family, faithful at the typed precision)', () => {
    queueProblems([frac13Problem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('0.3333'));
    expect(handle!.problem.feedback).toBe('correct');
    expect(handle!.problem.score).toEqual({ correct: 1, total: 1 });
  });

  it('accepts 0.142857 for 1/7 (the full displayed repetend)', () => {
    queueProblems([frac17Problem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('0.142857'));
    expect(handle!.problem.feedback).toBe('correct');
  });

  it('rejects 0.3334 and under-floor 0.3 for 1/3 (unfaithful / de-endorsed)', () => {
    queueProblems([frac13Problem(), frac13Problem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('0.3334'));
    expect(handle!.problem.feedback).toBe('incorrect');

    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('0.3'));
    expect(handle!.problem.feedback).toBe('incorrect');
  });

  it('accepts faithful percent-space transcriptions on fracToPerc (83.33 for 5/6)', () => {
    queueProblems([frac56PercentProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('83.33'));
    expect(handle!.problem.feedback).toBe('correct');
  });

  it('percent-direction misses carry NO diagnosis (punted to generic re-teach)', () => {
    queueProblems([frac56PercentProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('84'));

    expect(handle!.problem.feedback).toBe('incorrect');
    expect(handle!.problem.missDiagnosis).toBeNull();
    expect(handle!.problem.missedProblems[0].diagnosisMessage).toBeUndefined();
    expect(handle!.problem.missedProblems[0].diagnosisCode).toBeUndefined();
  });
});

describe('ProblemDisplay — 2D.3 correct-but-enriched postscript', () => {
  it('fires for a rounded (non-canonical) accepted member, muted under the verdict', () => {
    queueProblems([frac23Problem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('0.67'));

    expect(handle!.problem.feedback).toBe('correct');
    const expected = fractionEnrichmentPostscript('2/3', '0.67')!;
    expect(expected).toBe(
      '0.67 is the rounded form. The exact value is 0.6666…, so 0.66 or 0.67 both count.',
    );
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('fires for a short truncation (0.83 for 5/6) with the full-story line', () => {
    queueProblems([frac56Problem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('0.83'));

    expect(
      screen.getByText(
        'Full story: 5/6 = 0.8333… The digits repeat forever, so 0.83, 0.833, and so on all count.',
      ),
    ).toBeInTheDocument();
  });

  it('does NOT fire for the canonical truncation (the taught answer)', () => {
    queueProblems([frac23Problem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('0.66'));

    expect(handle!.problem.feedback).toBe('correct');
    expect(handle!.problem.correctEnrichment).toBeNull();
    expect(screen.queryByText(/rounded form|Full story/)).not.toBeInTheDocument();
  });

  it('NEVER fires for terminating fractions (wallpaper risk)', () => {
    queueProblems([frac38Problem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('0.375'));

    expect(handle!.problem.feedback).toBe('correct');
    expect(handle!.problem.correctEnrichment).toBeNull();
    expect(screen.queryByText(/rounded form|Full story/)).not.toBeInTheDocument();
  });

  it('does NOT fire on percent-direction problems (decimal-space surface only)', () => {
    queueProblems([frac56PercentProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('83.3'));

    expect(handle!.problem.feedback).toBe('correct');
    expect(handle!.problem.correctEnrichment).toBeNull();
  });
});

describe('ProblemDisplay — 2D.3 capture-time identity storage', () => {
  it('a diagnosed miss stores diagnosisMessage + diagnosisCode on the record', () => {
    queueProblems([frac56Problem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('0.84'));

    const record = handle!.problem.missedProblems[0];
    expect(record.diagnosisMessage).toBe(
      diagnoseMiss('fraction_conversions', '5/6', 0.84)!.message,
    );
    expect(record.diagnosisCode).toBe('frac-last-digit');
    // The pre-2D.3 fields are unchanged alongside.
    expect(record.studentAnswer).toBe('0.84');
    expect(record.validationKind).toBe('number');
  });

  it('an undiagnosed miss stores neither field (record shape as before)', () => {
    queueProblems([ttProblem()]);
    render(<Providers />);
    act(() => handle!.problem.handleNewProblem());
    act(() => handle!.problem.handleCheckAnswer('50'));

    const record = handle!.problem.missedProblems[0];
    expect(record.diagnosisMessage).toBeUndefined();
    expect(record.diagnosisCode).toBeUndefined();
  });
});
