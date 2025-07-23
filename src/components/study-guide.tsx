"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { perfectSquares, perfectCubes, commonFractionConversions } from "@/lib/math-problems";

const StudySection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-xl text-primary">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

export default function StudyGuide() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Study Guide</h2>
        <p className="text-muted-foreground">Essential facts and strategies for mental math mastery</p>
      </div>
      
      <StudySection title="🧠 Memorization Facts">
        <h4 className="font-bold text-lg mb-2">Perfect Squares (1-20)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-2 mb-6 font-mono text-sm">
          {Object.entries(perfectSquares).map(([base, square]) => (
            <div key={base}><span className="font-semibold">{base}²</span> = {square}</div>
          ))}
        </div>
        
        <h4 className="font-bold text-lg mb-2">Perfect Cubes (1-10)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-2 mb-6 font-mono text-sm">
          {Object.entries(perfectCubes).map(([base, cube]) => (
            <div key={base}><span className="font-semibold">{base}³</span> = {cube}</div>
          ))}
        </div>
        
        <h4 className="font-bold text-lg mb-2">Common Fraction Conversions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 font-mono text-sm">
          {commonFractionConversions.map(({ frac, decimal }) => (
            <div key={frac}><span className="font-semibold">{frac}</span> ≈ {decimal}</div>
          ))}
        </div>
      </StudySection>

      <StudySection title="💡 Pro Tips & Strategies">
        <h4 className="font-bold text-lg mb-2">Strategic Multiplication</h4>
        <ul className="space-y-4 list-disc list-inside text-sm">
          <li><strong>Multiplying by 8:</strong> Double the number three times.<br /><span className="text-xs ml-4 font-mono text-muted-foreground">e.g., 15 × 8 → 15×2=30 → 30×2=60 → 60×2=120</span></li>
          <li><strong>Multiplying by 9:</strong> Multiply by 10, then subtract the original number.<br /><span className="text-xs ml-4 font-mono text-muted-foreground">e.g., 23 × 9 → 23×10 - 23 = 230 - 23 = 207</span></li>
          <li><strong>Multiplying by 11:</strong> For a 2-digit number (AB), the answer is A (A+B) B. If A+B > 9, carry the one.<br /><span className="text-xs ml-4 font-mono text-muted-foreground">e.g., 43 × 11 → 4 (4+3) 3 → 473</span><br /><span className="text-xs ml-4 font-mono text-muted-foreground">e.g., 85 × 11 → 8 (8+5) 5 → 8 (13) 5 → 935</span></li>
          <li><strong>Multiplying by 12:</strong> Multiply by 10, then add double the original number.<br /><span className="text-xs ml-4 font-mono text-muted-foreground">e.g., 35 × 12 → 35×10 + 35×2 = 350 + 70 = 420</span></li>
           <li><strong>Multiplying by 15:</strong> Multiply by 10, then add half of that result.<br /><span className="text-xs ml-4 font-mono text-muted-foreground">e.g., 42 × 15 → 42×10 + (420/2) = 420 + 210 = 630</span></li>
           <li><strong>Multiplying by 19 / 99:</strong> Multiply by the next round number (20 / 100), then subtract the original number.<br /><span className="text-xs ml-4 font-mono text-muted-foreground">e.g., 16 × 19 → 16×20 - 16 = 320 - 16 = 304</span><br /><span className="text-xs ml-4 font-mono text-muted-foreground">e.g., 18 × 99 → 18×100 - 18 = 1782</span></li>
        </ul>
        <h4 className="font-bold text-lg mt-6 mb-2">Divisibility Rules</h4>
         <ul className="space-y-3 list-disc list-inside text-sm">
           <li><strong>Divisibility by 3:</strong> If the sum of the digits is divisible by 3, the number is too. <span className="font-mono text-xs text-muted-foreground">(462 → 4+6+2=12)</span></li>
           <li><strong>Divisibility by 4:</strong> If the last two digits are divisible by 4, the number is too. <span className="font-mono text-xs text-muted-foreground">(1,236 → 36 is divisible by 4)</span></li>
           <li><strong>Divisibility by 6:</strong> If the number is divisible by both 2 (is even) and 3.</li>
           <li><strong>Divisibility by 11:</strong> Alternately add and subtract the digits. If the result is 0 or divisible by 11, the number is too.<br /><span className="text-xs ml-4 font-mono text-muted-foreground">e.g., 2907 → 2 - 9 + 0 - 7 = -14 (not div by 11)</span><br /><span className="text-xs ml-4 font-mono text-muted-foreground">e.g., 8679 → 8 - 6 + 7 - 9 = 0 (is div by 11)</span></li>
         </ul>
      </StudySection>
    </div>
  );
}
