"use client";

import { useState, useEffect, useRef } from 'react';
import { Timer } from 'lucide-react';

/**
 * Homework-mode elapsed timer. Inverted from the portal's `useHomework()`
 * read: the consumer passes `showTimer` in directly. When false (default
 * for non-homework contexts) the component renders null.
 *
 * NOTE: `useRef(Date.now())` produces non-deterministic initial state — if
 * a consumer SSRs this component, hydration mismatch is possible. Render
 * inside a `'use client'` boundary.
 */
export function ElapsedTimer({ showTimer }: { showTimer: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!showTimer) return null;

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Timer className="h-4 w-4" />
      <span data-tour="mathmog-elapsed" className="tabular-nums font-medium">
        {m}:{s.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
