import { MathTrainerProvider } from '@/context/math-trainer-context';
import MentalMathTrainer from '@/components/mental-math-trainer';

export default function Home() {
  return (
    <MathTrainerProvider>
      <MentalMathTrainer />
    </MathTrainerProvider>
  );
}
