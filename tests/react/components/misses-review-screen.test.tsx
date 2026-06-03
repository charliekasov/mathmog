// @vitest-environment jsdom
//
// Characterization tests for `react/components/misses-review-screen.tsx`
// (Phase 5 of the @peakprep/mathmog lift).
//
// Source under test (pre-lift, in the portal):
//   src/components/mathmog/misses-review-screen.tsx
//
// Post-lift: re-point the source import to `@peakprep/mathmog/react`, and
// drop the four `vi.mock(...)` shadcn stubs in favor of the package's
// `MathmogUIProvider` test harness.
//
// Test approach: APPROACH A (mocked shadcn primitives via `vi.mock`).
// Rationale: the contract assertions are all on observable text, data-noah
// selectors, button labels, and the `disabled` attribute — none require the
// real shadcn behavior. Stubbing keeps the test file dependency-light and
// resilient to shadcn upstream churn.
//
// Triage: see ../../../triage/misses-review-screen-triage.md

import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render as rtlRender, screen, within, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MissedMathmogProblem } from '../../../src/core/miss-types';

// ---------------------------------------------------------------------------
// Mock bag — plain HTML pass-throughs, threaded via <MathmogUIProvider>.
// (Post-lift the package's components read primitives via `useMathmogUI()`
// instead of importing `@/components/ui/*` directly, so the staged
// `vi.mock(...)` approach no longer applies. We wrap the rendered subject
// with a real `<MathmogUIProvider ui={mockBag}>` instead.)
// ---------------------------------------------------------------------------

import { MathmogUIProvider } from '../../../src/react/ui/provider';
import type { UIPrimitiveBag } from '../../../src/react/ui/primitive-bag';

// IMPORTANT: every primitive in the bag must have STABLE COMPONENT IDENTITY
// across renders. A Proxy that returns a new function on each `get` access
// causes React to unmount + remount every primitive on every render
// (different component types), which wipes any child component state. We
// materialize the bag eagerly with stable references.

const StubInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ value, onChange, onKeyPress, disabled, placeholder, autoFocus, ...rest }, ref) => (
    <input
      ref={ref}
      type="text"
      value={value as string | number | readonly string[] | undefined}
      onChange={onChange}
      onKeyPress={onKeyPress}
      disabled={disabled}
      placeholder={placeholder}
      autoFocus={autoFocus}
      {...rest}
    />
  )
);
StubInput.displayName = 'StubInput';

const StubButton = ({ children, onClick, disabled, variant, type, ...rest }: any) => (
  <button onClick={onClick} disabled={disabled} data-variant={variant} type={type ?? 'button'} {...rest}>
    {children}
  </button>
);
const StubCard = ({ children, ...rest }: any) => (
  <div data-testid="card" {...rest}>{children}</div>
);
const StubCardContent = ({ children, ...rest }: any) => (
  <div data-testid="card-content" {...rest}>{children}</div>
);
const StubAlert = ({ children, ...rest }: any) => (
  <div role="alert" data-testid="alert" {...rest}>{children}</div>
);
const StubAlertDescription = ({ children, ...rest }: any) => (
  <div data-testid="alert-description" {...rest}>{children}</div>
);
const StubAlertTitle = ({ children, ...rest }: any) => (
  <div data-testid="alert-title" {...rest}>{children}</div>
);
const StubPassthrough = ({ children, ...rest }: any) => <div {...rest}>{children}</div>;

const mockBag: UIPrimitiveBag = {
  Card: StubCard,
  CardContent: StubCardContent,
  CardHeader: StubPassthrough,
  CardTitle: StubPassthrough,
  CardDescription: StubPassthrough,
  Button: StubButton,
  Input: StubInput,
  Switch: StubPassthrough,
  Label: StubPassthrough,
  Progress: StubPassthrough,
  Badge: StubPassthrough,
  Alert: StubAlert,
  AlertDescription: StubAlertDescription,
  AlertTitle: StubAlertTitle,
  Dialog: StubPassthrough,
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

// lucide-react icons: render trivial placeholders so the surrounding button
// text stays the actual assertion target.
vi.mock('lucide-react', () => ({
  Check: () => <span data-testid="icon-check" />,
  ArrowRight: () => <span data-testid="icon-arrow-right" />,
}));

// ---------------------------------------------------------------------------
// Source under test
// ---------------------------------------------------------------------------

import { MissesReviewScreen } from '../../../src/react/components/misses-review-screen';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeMiss(overrides: Partial<MissedMathmogProblem> = {}): MissedMathmogProblem {
  return {
    prompt: '2 + 2',
    correctAnswer: '4',
    studentAnswer: '5',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// All validation kinds are reviewable
// ---------------------------------------------------------------------------

describe('MissesReviewScreen — every validation kind is reviewable', () => {
  it("includes 'multi-text' and 'root-estimation' kinds in the review queue", () => {
    const misses: MissedMathmogProblem[] = [
      makeMiss({ prompt: 'multi-text prompt', validationKind: 'multi-text', correctAnswer: 'a' }),
      makeMiss({ prompt: 'root-est prompt', validationKind: 'root-estimation', correctAnswer: '5,6,5' }),
      makeMiss({ prompt: 'reviewable prompt', validationKind: 'number', correctAnswer: '4', correctAnswerNumeric: 4 }),
    ];
    render(<MissesReviewScreen misses={misses} onDone={vi.fn()} />);

    // First miss (multi-text) is shown immediately.
    expect(screen.getByText('multi-text prompt')).toBeInTheDocument();
    expect(screen.getByText(/Reviewing miss 1 of 3/)).toBeInTheDocument();
  });

  it('never renders a skipped-count notice', () => {
    const misses: MissedMathmogProblem[] = [
      makeMiss({ validationKind: 'multi-text', correctAnswer: 'a' }),
      makeMiss({ validationKind: 'root-estimation', correctAnswer: '5,6,5' }),
      makeMiss({ validationKind: 'number', correctAnswer: '4', correctAnswerNumeric: 4 }),
    ];
    render(<MissesReviewScreen misses={misses} onDone={vi.fn()} />);
    expect(screen.queryByText(/skipped/)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Empty state (defensive — callers normally gate this behind length > 0)
// ---------------------------------------------------------------------------

describe('MissesReviewScreen — empty state', () => {
  it('renders the "Nothing to review" empty state when misses=[]', () => {
    const onDone = vi.fn();
    render(<MissesReviewScreen misses={[]} onDone={onDone} />);
    expect(screen.getByText('Nothing to review')).toBeInTheDocument();
    expect(
      screen.getByText(/No misses from this drill/)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('calls onDone when the empty-state "Done" button is clicked', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    render(<MissesReviewScreen misses={[]} onDone={onDone} />);
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('exposes data-noah="mathmog-misses-review" on the empty-state wrapper', () => {
    const { container } = render(<MissesReviewScreen misses={[]} onDone={vi.fn()} />);
    expect(container.querySelector('[data-noah="mathmog-misses-review"]')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Active-state top-level rendering
// ---------------------------------------------------------------------------

describe('MissesReviewScreen — active-state top-level rendering', () => {
  it('renders "Reviewing miss X of Y" with index starting at 1', () => {
    const misses = [
      makeMiss({ prompt: 'first' }),
      makeMiss({ prompt: 'second' }),
    ];
    render(<MissesReviewScreen misses={misses} onDone={vi.fn()} />);
    expect(screen.getByText(/Reviewing miss 1 of 2/)).toBeInTheDocument();
  });

  it('exposes data-noah="mathmog-misses-review" on the active-state wrapper', () => {
    const { container } = render(
      <MissesReviewScreen misses={[makeMiss()]} onDone={vi.fn()} />
    );
    expect(container.querySelector('[data-noah="mathmog-misses-review"]')).not.toBeNull();
  });

  it('renders the "From your drill" header above the prompt', () => {
    render(<MissesReviewScreen misses={[makeMiss({ prompt: '7 x 8' })]} onDone={vi.fn()} />);
    expect(screen.getByText('From your drill')).toBeInTheDocument();
    expect(screen.getByText('7 x 8')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// "You said:" / "You left this blank." rendering
// ---------------------------------------------------------------------------

describe('MissesReviewScreen — studentAnswer echo', () => {
  it('echoes the student answer as "You said: {answer}"', () => {
    render(
      <MissesReviewScreen
        misses={[makeMiss({ studentAnswer: '42' })]}
        onDone={vi.fn()}
      />
    );
    expect(screen.getByText('You said: 42')).toBeInTheDocument();
  });

  it('renders "You left this blank." when studentAnswer is an empty string', () => {
    render(
      <MissesReviewScreen
        misses={[makeMiss({ studentAnswer: '' })]}
        onDone={vi.fn()}
      />
    );
    expect(screen.getByText('You left this blank.')).toBeInTheDocument();
  });

  it('renders "You left this blank." when studentAnswer is whitespace only', () => {
    render(
      <MissesReviewScreen
        misses={[makeMiss({ studentAnswer: '   ' })]}
        onDone={vi.fn()}
      />
    );
    expect(screen.getByText('You left this blank.')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Single-retry-then-reveal flow (PINNED minimum coverage)
// ---------------------------------------------------------------------------

describe('MissesReviewScreen — single-retry-then-reveal flow', () => {
  it('shows the retry input and both action buttons initially', () => {
    render(
      <MissesReviewScreen
        misses={[makeMiss({ correctAnswer: '4', validationKind: 'number', correctAnswerNumeric: 4 })]}
        onDone={vi.fn()}
      />
    );
    expect(screen.getByPlaceholderText('Try the answer again...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show answer' })).toBeInTheDocument();
    // No Alert until revealed.
    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
  });

  it('disables the "Try again" button while the retry input is empty', () => {
    render(<MissesReviewScreen misses={[makeMiss()]} onDone={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Try again/ })).toBeDisabled();
  });

  it('enables the "Try again" button once the user types', async () => {
    const user = userEvent.setup();
    render(<MissesReviewScreen misses={[makeMiss()]} onDone={vi.fn()} />);
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '4');
    expect(screen.getByRole('button', { name: /Try again/ })).not.toBeDisabled();
  });

  it('on a correct retry: shows "Correct — nice recovery!", does NOT auto-reveal the Answer alert, hides the input', async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[makeMiss({ correctAnswer: '4', validationKind: 'number', correctAnswerNumeric: 4 })]}
        onDone={vi.fn()}
      />
    );
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '4');
    await user.click(screen.getByRole('button', { name: /Try again/ }));

    expect(screen.getByText(/Correct — nice recovery!/)).toBeInTheDocument();
    // Per source: retryFeedback.isCorrect hides the input block (it's gated on
    // `!revealed && !retryFeedback?.isCorrect`), but does NOT set `revealed`,
    // so the Answer Alert is not shown on a correct retry.
    expect(screen.queryByPlaceholderText('Try the answer again...')).not.toBeInTheDocument();
    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
    // The amber "Not quite" lead-in only shows on a wrong retry; it must
    // stay hidden on the correct-retry path.
    expect(screen.queryByText(/Not quite\. Here's the answer\./)).not.toBeInTheDocument();
  });

  it('on a wrong retry: reveals the correct-answer Alert, disables the input, hides both action buttons', async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[makeMiss({ correctAnswer: '4', validationKind: 'number', correctAnswerNumeric: 4 })]}
        onDone={vi.fn()}
      />
    );
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '9');
    await user.click(screen.getByRole('button', { name: /Try again/ }));

    // Answer alert is shown.
    const alert = screen.getByTestId('alert');
    expect(within(alert).getByText('Answer')).toBeInTheDocument();
    expect(within(alert).getByText('4')).toBeInTheDocument();

    // The amber "Not quite. Here's the answer." soft-fail line acts as a
    // lead-in to the revealed Answer alert. Pre-A.5#3 it lived inside the
    // `!revealed && !retryFeedback?.isCorrect` block and never rendered
    // because setRevealed(true) fires in the same handler. Now hoisted to
    // a sibling gated on `retryFeedback && !retryFeedback.isCorrect`.
    expect(screen.getByText(/Not quite\. Here's the answer\./)).toBeInTheDocument();

    // Both action buttons are gone (retryAttempted hides their container).
    expect(screen.queryByRole('button', { name: /Try again/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show answer' })).not.toBeInTheDocument();

    // Input still in DOM but block is hidden because revealed=true; expect no
    // input visible.
    expect(screen.queryByPlaceholderText('Try the answer again...')).not.toBeInTheDocument();
  });

  it('"Show answer" reveals the Answer alert without consuming the retry attempt', async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[makeMiss({ correctAnswer: '4', validationKind: 'number', correctAnswerNumeric: 4 })]}
        onDone={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Show answer' }));

    const alert = screen.getByTestId('alert');
    expect(within(alert).getByText('Answer')).toBeInTheDocument();
    expect(within(alert).getByText('4')).toBeInTheDocument();

    // No "Not quite" line — that only appears after a wrong retry.
    expect(screen.queryByText(/Not quite\. Here's the answer\./)).not.toBeInTheDocument();
  });

  it('"Show answer" then "Next" advances to the next miss', async () => {
    const user = userEvent.setup();
    const misses = [
      makeMiss({ prompt: 'first', correctAnswer: '4' }),
      makeMiss({ prompt: 'second', correctAnswer: '6' }),
    ];
    render(<MissesReviewScreen misses={misses} onDone={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Show answer' }));
    await user.click(screen.getByRole('button', { name: /Next/ }));

    expect(screen.getByText('second')).toBeInTheDocument();
    expect(screen.getByText(/Reviewing miss 2 of 2/)).toBeInTheDocument();
    // PerMiss is remounted (keyEpoch) → state resets, retry input is back.
    expect(screen.getByPlaceholderText('Try the answer again...')).toBeInTheDocument();
  });

  it('pressing Enter in the retry input submits when value is non-empty and retry not yet attempted', async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[makeMiss({ correctAnswer: '4', validationKind: 'number', correctAnswerNumeric: 4 })]}
        onDone={vi.fn()}
      />
    );
    const input = screen.getByPlaceholderText('Try the answer again...');
    await user.type(input, '4{Enter}');
    expect(screen.getByText(/Correct — nice recovery!/)).toBeInTheDocument();
  });

  it('pressing Enter in the retry input does NOTHING when the input is empty', async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[makeMiss({ correctAnswer: '4', validationKind: 'number', correctAnswerNumeric: 4 })]}
        onDone={vi.fn()}
      />
    );
    const input = screen.getByPlaceholderText('Try the answer again...');
    input.focus();
    await user.keyboard('{Enter}');
    // No feedback, no alert.
    expect(screen.queryByText(/Correct — nice recovery!/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
  });

  it('"Next" button variant is "ghost" pre-attempt and "default" after a wrong retry', async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[makeMiss({ correctAnswer: '4', validationKind: 'number', correctAnswerNumeric: 4 })]}
        onDone={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /Next/ })).toHaveAttribute('data-variant', 'ghost');

    await user.type(screen.getByPlaceholderText('Try the answer again...'), '9');
    await user.click(screen.getByRole('button', { name: /Try again/ }));

    expect(screen.getByRole('button', { name: /Next/ })).toHaveAttribute('data-variant', 'default');
  });
});

// ---------------------------------------------------------------------------
// onDone callback
// ---------------------------------------------------------------------------

describe('MissesReviewScreen — onDone callback', () => {
  it('fires onDone after advancing past the last reviewable miss', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    render(
      <MissesReviewScreen misses={[makeMiss({ prompt: 'only' })]} onDone={onDone} />
    );
    await user.click(screen.getByRole('button', { name: 'Show answer' }));
    await user.click(screen.getByRole('button', { name: /Next/ }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire onDone when there are still reviewable misses remaining', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    render(
      <MissesReviewScreen
        misses={[makeMiss({ prompt: 'first' }), makeMiss({ prompt: 'second' })]}
        onDone={onDone}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Show answer' }));
    await user.click(screen.getByRole('button', { name: /Next/ }));
    expect(onDone).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Validation-kind dispatch (observable via "Correct — nice recovery!" path)
// ---------------------------------------------------------------------------

describe('MissesReviewScreen — validationKind dispatch (observable behavior)', () => {
  it("'estimation' branch: accepts a numeric within 10% and shows deviationPercent", async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: '100',
            correctAnswerNumeric: 100,
            validationKind: 'estimation',
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    // 105 → 5% off → within tolerance → correct, deviationPercent=5.
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '105');
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(screen.getByText(/Correct — nice recovery!/)).toBeInTheDocument();
    expect(
      screen.getByText(/5% off — within 10% counts as correct\./)
    ).toBeInTheDocument();
  });

  it("'estimation' branch: rejects a numeric beyond 10% and reveals the answer", async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: '100',
            correctAnswerNumeric: 100,
            validationKind: 'estimation',
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '200');
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(screen.queryByText(/Correct — nice recovery!/)).not.toBeInTheDocument();
    expect(screen.getByTestId('alert')).toBeInTheDocument();
  });

  it("'fraction' branch: simplifies user input before comparing", async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: '1/2',
            validationKind: 'fraction',
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '2/4');
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(screen.getByText(/Correct — nice recovery!/)).toBeInTheDocument();
  });

  it("'fraction' branch: rejects malformed input (no slash)", async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: '1/2',
            validationKind: 'fraction',
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '0.5');
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(screen.queryByText(/Correct — nice recovery!/)).not.toBeInTheDocument();
  });

  it("'number' branch: accepts a numeric within 0.0001 tolerance", async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: '4',
            correctAnswerNumeric: 4,
            validationKind: 'number',
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '4.00001');
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(screen.getByText(/Correct — nice recovery!/)).toBeInTheDocument();
  });

  it("'number' branch: NaN parse falls back to case-insensitive string match", async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: 'four',
            correctAnswerNumeric: 4,
            validationKind: 'number',
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    await user.type(screen.getByPlaceholderText('Try the answer again...'), 'FOUR');
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(screen.getByText(/Correct — nice recovery!/)).toBeInTheDocument();
  });

  it('default branch (no validationKind): does case-insensitive trim match', async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[makeMiss({ correctAnswer: 'cat' })]}
        onDone={vi.fn()}
      />
    );
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '  CAT  ');
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(screen.getByText(/Correct — nice recovery!/)).toBeInTheDocument();
  });

  it("'multi-text' branch: accepts a case-insensitive match against any 'a or b or c' alternative", async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: '1 or 2 or 3',
            validationKind: 'multi-text',
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '2');
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(screen.getByText(/Correct — nice recovery!/)).toBeInTheDocument();
  });

  it("'multi-text' branch: rejects input that matches no alternative", async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: '1 or 2 or 3',
            validationKind: 'multi-text',
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '99');
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(screen.queryByText(/Correct — nice recovery!/)).not.toBeInTheDocument();
  });

  it("'root-estimation' branch: accepts the between-pair in either order with matching 'closer to'", async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: '5,6,5',
            validationKind: 'root-estimation',
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    // 6,5,5 — between pair reversed, closer-to still 5.
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '6,5,5');
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(screen.getByText(/Correct — nice recovery!/)).toBeInTheDocument();
  });

  it("'root-estimation' branch: rejects when 'closer to' is wrong", async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: '5,6,5',
            validationKind: 'root-estimation',
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    // Between pair correct but closer-to=6 (correct was 5).
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '5,6,6');
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(screen.queryByText(/Correct — nice recovery!/)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Slice 3 explanation rendering
// ---------------------------------------------------------------------------

describe('MissesReviewScreen — Slice 3 explanation', () => {
  it('renders miss.explanation when revealed and explanation present', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: '4',
            explanation: 'Because 2 + 2 = 4 by addition.',
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Show answer' }));
    const el = container.querySelector('[data-noah="mathmog-miss-explanation"]');
    expect(el).not.toBeNull();
    expect(el!.textContent).toBe('Because 2 + 2 = 4 by addition.');
  });

  it('renders miss.explanation when retry is correct and explanation present', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: '4',
            correctAnswerNumeric: 4,
            validationKind: 'number',
            explanation: 'Two plus two.',
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '4');
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    const el = container.querySelector('[data-noah="mathmog-miss-explanation"]');
    expect(el).not.toBeNull();
    expect(el!.textContent).toBe('Two plus two.');
  });

  it('does NOT render the explanation before revealed and before a correct retry', () => {
    const { container } = render(
      <MissesReviewScreen
        misses={[makeMiss({ correctAnswer: '4', explanation: 'because.' })]}
        onDone={vi.fn()}
      />
    );
    expect(
      container.querySelector('[data-noah="mathmog-miss-explanation"]')
    ).toBeNull();
  });

  it('does NOT render the explanation block when miss.explanation is missing', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MissesReviewScreen
        misses={[makeMiss({ correctAnswer: '4' })]}
        onDone={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Show answer' }));
    expect(
      container.querySelector('[data-noah="mathmog-miss-explanation"]')
    ).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// First-try deviation hint
// ---------------------------------------------------------------------------

describe('MissesReviewScreen — first-try deviation hint', () => {
  it('renders the first-try deviationPercent hint when revealed and retry was not correct', async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: '100',
            correctAnswerNumeric: 100,
            validationKind: 'estimation',
            deviationPercent: 26.7,
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Show answer' }));
    expect(
      screen.getByText(/On your first try you were 26.7% off\. Within 10% counts as correct\./)
    ).toBeInTheDocument();
  });

  it('does NOT render the first-try deviation hint when retry was correct', async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: '100',
            correctAnswerNumeric: 100,
            validationKind: 'estimation',
            deviationPercent: 26.7,
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '105');
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(
      screen.queryByText(/On your first try you were/)
    ).not.toBeInTheDocument();
  });

  it('does NOT render the first-try hint when deviationPercent is undefined', async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[makeMiss({ correctAnswer: '4' })]}
        onDone={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Show answer' }));
    expect(
      screen.queryByText(/On your first try you were/)
    ).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Estimation deviationPercent suppression at exact 0%
// ---------------------------------------------------------------------------

describe('MissesReviewScreen — exact-match estimation', () => {
  it('hides the "{pct}% off" sub-line when deviationPercent === 0', async () => {
    const user = userEvent.setup();
    render(
      <MissesReviewScreen
        misses={[
          makeMiss({
            correctAnswer: '100',
            correctAnswerNumeric: 100,
            validationKind: 'estimation',
          }),
        ]}
        onDone={vi.fn()}
      />
    );
    await user.type(screen.getByPlaceholderText('Try the answer again...'), '100');
    await user.click(screen.getByRole('button', { name: /Try again/ }));
    expect(screen.getByText(/Correct — nice recovery!/)).toBeInTheDocument();
    // The "{pct}% off" line is gated on `deviationPercent > 0`.
    expect(screen.queryByText(/% off — within 10% counts as correct\./)).not.toBeInTheDocument();
  });
});
