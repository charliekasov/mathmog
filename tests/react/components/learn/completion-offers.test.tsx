// @vitest-environment jsdom
//
// Phase 2A.5 — the completion-offer surface: calm §6.6 next-step buttons
// rendered as `completionSlot` content. Copy names content, never the
// student's result.

import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';
import { MathmogUIProvider } from '../../../../src/react/ui/provider';
import type { UIPrimitiveBag } from '../../../../src/react/ui/primitive-bag';
import { LearnCompletionOffers } from '../../../../src/react/components/learn/completion-offers';
import { mathmogLearnCompletionOffers } from '../../../../src/core/learn/offers';

const StubButton = ({ children, onClick, disabled, type, variant, size, ...rest }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    type={type ?? 'button'}
    data-variant={variant}
    {...rest}
  >
    {children}
  </button>
);

const mockBag = { Button: StubButton } as unknown as UIPrimitiveBag;

const renderOffers = (props: React.ComponentProps<typeof LearnCompletionOffers>) =>
  rtlRender(
    <MathmogUIProvider ui={mockBag}>
      <LearnCompletionOffers {...props} />
    </MathmogUIProvider>
  );

const ttJust7Offers = mathmogLearnCompletionOffers({
  completedModuleId: 'times_tables/tt_just_7',
  isAcquired: () => false,
});

describe('LearnCompletionOffers', () => {
  it('renders the drill offer first, then the content-named Learn-next offer', () => {
    renderOffers({ offers: ttJust7Offers, onSelectOffer: () => {} });
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('Drill this set to keep it sharp');
    // Controlled two-line break (ui-glow-up REQUIRED): action line + label line.
    expect(buttons[1]).toHaveTextContent('Learn the next set');
    expect(buttons[1]).toHaveTextContent('Just the 8× table');
  });

  it('reports the tapped offer verbatim through onSelectOffer', () => {
    const onSelectOffer = vi.fn();
    renderOffers({ offers: ttJust7Offers, onSelectOffer });

    fireEvent.click(screen.getByText('Drill this set to keep it sharp'));
    expect(onSelectOffer).toHaveBeenCalledWith(ttJust7Offers[0]);

    fireEvent.click(screen.getByText(/Learn the next set/));
    expect(onSelectOffer).toHaveBeenLastCalledWith(ttJust7Offers[1]);
    expect(onSelectOffer).toHaveBeenCalledTimes(2);
  });

  it('renders only the drill button when no Learn-next resolves', () => {
    const offers = mathmogLearnCompletionOffers({
      completedModuleId: 'fraction_conversions/fractions_sevenths',
      isAcquired: () => false,
    });
    renderOffers({ offers, onSelectOffer: () => {} });
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.queryByText(/Learn the next set/)).toBeNull();
  });

  it('renders nothing at all for an empty offer list (absence never narrated)', () => {
    const { container } = renderOffers({ offers: [], onSelectOffer: () => {} });
    expect(container.querySelector('[data-learn-offers]')).toBeNull();
    expect(container.textContent).toBe('');
  });

  it('keeps the gamification line: no praise, scores, percentages, or exclamation points', () => {
    const { container } = renderOffers({
      offers: ttJust7Offers,
      onSelectOffer: () => {},
    });
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/!/);
    expect(text).not.toMatch(/%/);
    expect(text).not.toMatch(/mastered|great|genius|amazing/i);
  });

  it('marks each offer with its kind for tours and telemetry hooks', () => {
    const { container } = renderOffers({
      offers: ttJust7Offers,
      onSelectOffer: () => {},
    });
    expect(
      container.querySelector('[data-learn-offer="drill-scope"]')
    ).not.toBeNull();
    expect(
      container.querySelector('[data-learn-offer="learn-module"]')
    ).not.toBeNull();
  });

  it('keeps 44px-class mobile hit targets and label wrapping on both offers (ui-glow-up REQUIRED pin)', () => {
    const { container } = renderOffers({
      offers: ttJust7Offers,
      onSelectOffer: () => {},
    });
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(b => {
      // min-h keeps the 44px target while h-auto + whitespace-normal lets
      // long registry labels wrap instead of clipping under the consumer
      // Button's whitespace-nowrap base class.
      expect(b.className).toContain('min-h-14');
      expect(b.className).toContain('whitespace-normal');
      expect(b.className).toContain('h-auto');
    });
  });
});
