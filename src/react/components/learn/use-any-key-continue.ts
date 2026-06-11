// Shared "tap or any key to continue" keyboard affordance for the Learn
// beats that pause for the student (See card, post-answer feedback). Ignores
// modifier and navigation keys so a stray Shift or Tab doesn't swallow the
// beat the student was meant to read.

import { useEffect, useRef } from 'react';

const IGNORED_KEYS = new Set([
  'Shift',
  'Control',
  'Alt',
  'Meta',
  'Tab',
  'CapsLock',
  'Escape',
]);

/**
 * Deadzone after the beat appears before keys are accepted, so a reflexive
 * second Enter after "Check Answer" can't dismiss the feedback — diagnosis
 * line and reveal — unread (2A.4 math-ed reviewer recommendation; `e.repeat`
 * alone doesn't catch a re-pressed key).
 */
export const ANY_KEY_ARMING_DELAY_MS = 300;

export function useAnyKeyContinue(active: boolean, onContinue: () => void): void {
  const callbackRef = useRef(onContinue);
  callbackRef.current = onContinue;

  useEffect(() => {
    if (!active) return;
    let armed = false;
    const armTimer = setTimeout(() => {
      armed = true;
    }, ANY_KEY_ARMING_DELAY_MS);
    const handle = (e: KeyboardEvent) => {
      if (!armed) return;
      // A held key auto-repeats; without this guard holding Enter would
      // blast through consecutive beats unread.
      if (e.repeat) return;
      // Don't swallow browser/OS shortcuts (Cmd+R, Ctrl+L, …).
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (IGNORED_KEYS.has(e.key)) return;
      e.preventDefault();
      callbackRef.current();
    };
    window.addEventListener('keydown', handle);
    return () => {
      clearTimeout(armTimer);
      window.removeEventListener('keydown', handle);
    };
  }, [active]);
}
