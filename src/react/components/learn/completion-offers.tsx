"use client";

import * as React from 'react';
import type { MathmogOffer } from '../../../core/learn/offers';
import { useMathmogUI } from '../../ui/provider';

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
export function LearnCompletionOffers({
  offers,
  onSelectOffer,
}: LearnCompletionOffersProps) {
  const ui = useMathmogUI();

  if (offers.length === 0) return null;

  // Consumer shadcn Buttons ship `whitespace-nowrap` in their base classes
  // (the primitive bag can't see it); long module labels would overflow the
  // card at 320px without the explicit whitespace-normal + h-auto override.
  // min-h keeps the 44px mobile hit target when the label wraps.
  const offerButtonClasses =
    'w-full h-auto min-h-14 sm:min-h-11 whitespace-normal py-3 sm:py-2 text-base';

  return (
    <div className="space-y-3 max-w-md mx-auto" data-learn-offers>
      {offers.map(offer =>
        offer.kind === 'drill-scope' ? (
          <ui.Button
            key={`drill-${offer.topic}/${offer.scopeId}`}
            data-learn-offer="drill-scope"
            className={offerButtonClasses}
            onClick={() => onSelectOffer(offer)}
          >
            Drill this set to keep it sharp
          </ui.Button>
        ) : (
          <ui.Button
            key={`learn-${offer.moduleId}`}
            data-learn-offer="learn-module"
            variant="outline"
            className={offerButtonClasses}
            onClick={() => onSelectOffer(offer)}
          >
            {/* Controlled two-line break: the action line never wraps; the
                content label wraps gracefully under it for the longest
                registry labels. */}
            <span className="flex flex-col items-center gap-0.5">
              <span>Learn the next set</span>
              <span className="text-sm font-normal text-muted-foreground">
                {offer.moduleLabel}
              </span>
            </span>
          </ui.Button>
        )
      )}
    </div>
  );
}

export type { LearnCompletionOffersProps };
