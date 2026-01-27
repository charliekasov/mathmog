"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { UIProvider } from '@/context/ui-context';
import { UserProvider } from '@/context/user-context';
import { ProblemProvider } from '@/context/problem-context';
import { SpeedChallengeProvider } from '@/context/speed-challenge-context';
import { PracticeContent } from './practice-content';

function PracticePageInner() {
  const searchParams = useSearchParams();
  const level = parseInt(searchParams.get('level') || '1', 10);
  const difficulty = (searchParams.get('difficulty') || 'Easy') as 'Easy' | 'Medium' | 'Hard';
  const topic = searchParams.get('topic') || undefined;
  const problemCount = parseInt(searchParams.get('count') || '20', 10);
  const mode = searchParams.get('mode') || 'practice';
  const isSpeedChallenge = mode === 'speed';
  const duration = parseInt(searchParams.get('duration') || '2', 10);

  return (
    <UIProvider>
      <UserProvider>
        <ProblemProvider>
          <SpeedChallengeProvider>
            <PracticeContent
              level={level}
              difficulty={difficulty}
              topic={topic}
              problemCount={problemCount}
              isSpeedChallenge={isSpeedChallenge}
              duration={duration}
            />
          </SpeedChallengeProvider>
        </ProblemProvider>
      </UserProvider>
    </UIProvider>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PracticePageInner />
    </Suspense>
  );
}
