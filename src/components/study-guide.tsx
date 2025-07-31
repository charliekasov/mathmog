
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { perfectSquares, perfectCubes, commonFractionConversions } from "@/lib/math-problems";
import { useMathTrainer } from '@/context/math-trainer-context';

const StudySection = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle className="text-xl text-primary">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

const MemorizeContent = () => (
    <div className="space-y-6">
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
                 {commonFractionConversions.map(({ frac, decimal, percent }) => (
                    <div key={frac}><span className="font-semibold">{frac}</span> ≈ {decimal} ≈ {percent}</div>
                ))}
            </div>
        </StudySection>
        <StudySection title="🔢 Basic Divisibility Rules">
            <ul className="space-y-3 list-disc list-inside text-sm">
             <li><strong>Divisibility by 3:</strong> If the sum of the digits is divisible by 3, the number is too. <span className="font-mono text-xs text-muted-foreground">(e.g., 462 → 4+6+2=12)</span></li>
             <li><strong>Divisibility by 4:</strong> If the last two digits are divisible by 4, the number is too. <span className="font-mono text-xs text-muted-foreground">(e.g., 1,236 → 36 is divisible by 4)</span></li>
             <li><strong>Divisibility by 5:</strong> If the number ends in a 0 or 5.</li>
             <li><strong>Divisibility by 6:</strong> If the number is divisible by both 2 (is even) and 3.</li>
             <li><strong>Divisibility by 8:</strong> If the last three digits are divisible by 8. This is tough, so often it's easier to halve the number three times.</li>
             <li><strong>Divisibility by 9:</strong> If the sum of the digits is divisible by 9. <span className="font-mono text-xs text-muted-foreground">(e.g., 1,782 → 1+7+8+2=18)</span></li>
           </ul>
        </StudySection>
    </div>
);

const EstimateContent = () => (
    <StudySection title="📊 Smart Estimation Strategies">
        <h4 className="font-bold text-lg mb-2">Multiplication Estimation</h4>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md text-sm mb-6">
            <p className="font-semibold">Round to friendly numbers, check your bounds:</p>
            <p className="mb-2"><strong>Example:</strong> 82 x 37</p>
            <ul className="list-disc list-inside space-y-1">
                <li>Round down: 80 x 30 = 2,400</li>
                <li>Round up: 90 x 40 = 3,600</li>
                <li>Answer should be between 2,400 and 3,600</li>
                <li>Best estimate: 80 x 40 = 3,200 (actual: 3,034)</li>
            </ul>
            <p className="text-xs text-amber-800 dark:text-amber-400 mt-3">Strategy: Use "friendly" numbers (multiples of 10) to create upper and lower bounds, then pick the best estimate</p>
        </div>

        <h4 className="font-bold text-lg mb-2">Square Root Estimation</h4>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md text-sm">
            <p className="font-semibold">Use perfect squares as anchors:</p>
            <p className="mb-2"><strong>Example:</strong> √151</p>
            <ul className="list-disc list-inside space-y-1">
                <li>Know that 12² = 144 and 13² = 169</li>
                <li>Since 151 is between 144 and 169, √151 is between 12 and 13</li>
                <li>151 is closer to 144, so √151 ≈ 12.2</li>
            </ul>
             <p className="text-xs text-amber-800 dark:text-amber-400 mt-3">Pro Tip: 13² - 12² = 25, so each 0.1 from 12 ≈ 2.5 units</p>
        </div>
    </StudySection>
);

const CraftyContent = () => (
    <div className="space-y-6">
        <StudySection title="😈 Lightning-Fast Percentage Calculations">
            <h4 className="font-bold text-lg mb-2">The 23% Method (and variations):</h4>
            <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-md mb-6">
                <p className="font-semibold">For 23% of 400:</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Find 10%: 400 → 40</li>
                    <li>Find 1%: 400 → 4</li>
                    <li>Calculate: (2 x 40) + (3 x 4) = 80 + 12 = 92</li>
                </ol>
            </div>
             <h4 className="font-bold text-lg mb-2">Other Quick Percentages:</h4>
             <ul className="list-disc list-inside space-y-2">
                <li><strong>15%:</strong> 10% + 5% (half of 10%)</li>
                <li><strong>25%:</strong> Divide by 4</li>
                <li><strong>30%:</strong> 10% x 3</li>
                <li><strong>45%:</strong> 50% - 5%</li>
             </ul>
        </StudySection>
        <StudySection title="💡 Pro Tips & Strategies">
          <h4 className="font-bold text-lg mb-2">Strategic Multiplication & Division</h4>
          <ul className="space-y-4 list-disc list-inside">
            <li><strong>Multiplying by 4:</strong> Double the number twice.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 35 × 4 → 35×2=70 → 70×2=140</span></li>
            <li><strong>Dividing by 4:</strong> Halve the number twice.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 180 ÷ 4 → 180÷2=90 → 90÷2=45</span></li>
            <li><strong>Multiplying by 5:</strong> Multiply by 10, then divide by 2.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 84 × 5 → 84×10 ÷ 2 = 840 ÷ 2 = 420</span></li>
            <li><strong>Dividing by 5:</strong> Divide by 10, then multiply by 2.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 420 ÷ 5 → 420÷10 × 2 = 42 × 2 = 84</span></li>
            <li><strong>Multiplying by 8:</strong> Double the number three times.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 15 × 8 → 15×2=30 → 30×2=60 → 60×2=120</span></li>
            <li><strong>Dividing by 8:</strong> Halve the number three times.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 240 ÷ 8 → 240÷2=120 → 120÷2=60 → 60÷2=30</span></li>
            <li><strong>Multiplying by 9:</strong> Multiply by 10, then subtract the original number.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 23 × 9 → 23×10 - 23 = 230 - 23 = 207</span></li>
            <li><strong>Multiplying by 11:</strong> For a 2-digit number (AB), the answer is A (A+B) B. If A+B > 9, carry the one.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 43 × 11 → 4 (4+3) 3 → 473</span><br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 85 × 11 → 8 (8+5) 5 → 8 (13) 5 → 935</span></li>
            <li><strong>Multiplying by 12:</strong> Multiply by 10, then add double the original number.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 35 × 12 → 35×10 + 35×2 = 350 + 70 = 420</span></li>
            <li><strong>Dividing by 12:</strong> If a number is divisible by both 3 and 4, you can divide by 12. Halve it, then divide by 6, or divide by 2, then 2, then 3.<br/><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 552 ÷ 12 → 552÷6 = 92 → 92÷2 = 46</span></li>
             <li><strong>Multiplying by 15:</strong> Multiply by 10, then add half of that result.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 42 × 15 → 42×10 + (420/2) = 420 + 210 = 630</span></li>
            <li><strong>Multiplying by 25:</strong> Multiply by 100, then divide by 4.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 36 × 25 → 36×100 ÷ 4 = 3600 ÷ 4 = 900</span></li>
             <li><strong>Multiplying by 19 / 99:</strong> Multiply by the next round number (20 / 100), then subtract the original number.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 16 × 19 → 16×20 - 16 = 320 - 16 = 304</span><br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 18 × 99 → 18×100 - 18 = 1782</span></li>
             <li><strong>Squaring numbers ending in 5:</strong> Take the tens digit (T), calculate T × (T+1), then append "25".<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 35² → 3×(3+1) & 25 → 12 & 25 → 1225</span><br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 85² → 8×(8+1) & 25 → 72 & 25 → 7225</span></li>
            <li><strong>Complementary Multiplication (Difference of Squares):</strong> For two numbers that are equally distant from a round number (like a multiple of 10 or 5), you can use the formula (x-d)(x+d) = x² - d².<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 23 × 27 → (25-2)×(25+2) = 25² - 2² = 625 - 4 = 621</span><br/><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 72 × 78 → (75-3)×(75+3) = 75² - 3² = 5625 - 9 = 5616</span></li>
          </ul>
        </StudySection>
         <StudySection title="🔢 Advanced Divisibility Rules">
           <ul className="space-y-4 list-disc list-inside">
             <li><strong>Divisibility by 7:</strong> Double the last digit and subtract it from the rest of the number. If the result is 0 or divisible by 7, the original number is too. Repeat if necessary.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 343 → 34 - (3×2) = 28. Since 28 is divisible by 7, so is 343.</span><br/><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 672 → 67 - (2×2) = 63. Since 63 is divisible by 7, so is 672.</span></li>
             <li><strong>Divisibility by 11:</strong> Alternately add and subtract the digits from left to right. If the result is 0 or divisible by 11, the original number is too.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 8679 → 8 - 6 + 7 - 9 = 0. Divisible.</span><br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 9581 → 9 - 5 + 8 - 1 = 11. Divisible.</span><br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 2907 → 2 - 9 + 0 - 7 = -14. Not divisible.</span></li>
             <li><strong>Divisibility by 12:</strong> If the number is divisible by both 3 and 4, it is divisible by 12.<br /><span className="text-sm ml-4 font-mono text-foreground/80">e.g., 552 → Divisible by 3 (5+5+2=12) and 4 (last two digits, 52). So, divisible by 12.</span></li>
           </ul>
        </StudySection>
    </div>
);


export default function StudyGuide() {
  const { studyTab, setStudyTab } = useMathTrainer();
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Study Guide</h2>
        <p className="text-muted-foreground">Essential facts and strategies for mental math mastery</p>
      </div>
      
      <Tabs value={studyTab} onValueChange={(value) => setStudyTab(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="memorize">🧠 Memorize</TabsTrigger>
          <TabsTrigger value="estimate">📊 Estimate</TabsTrigger>
          <TabsTrigger value="crafty">😈 Get Crafty</TabsTrigger>
        </TabsList>
        <TabsContent value="memorize" className="mt-6">
            <MemorizeContent />
        </TabsContent>
        <TabsContent value="estimate" className="mt-6">
            <EstimateContent />
        </TabsContent>
        <TabsContent value="crafty" className="mt-6">
            <CraftyContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
