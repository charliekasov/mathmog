import { UIProvider } from '@/context/ui-context';
import { UserProvider } from '@/context/user-context';
import { ProblemProvider } from '@/context/problem-context';
import { SpeedChallengeProvider } from '@/context/speed-challenge-context';
import MentalMathTrainer from '@/components/mental-math-trainer';

export default function Home() {
  return (
    <UIProvider>
      <UserProvider>
        <ProblemProvider>
          <SpeedChallengeProvider>
            <MentalMathTrainer />
          </SpeedChallengeProvider>
        </ProblemProvider>
      </UserProvider>
    </UIProvider>
  );
}