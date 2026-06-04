"use client";

import * as React from 'react';
import { Brain, Gauge, TrendingUp, Wand2 } from 'lucide-react';
import {
  commonFractionConversions,
  perfectCubes,
  perfectSquares,
} from '../../core/math-problems';
import { useTrainerState } from '../contexts/trainer-state';
import { useMathmogUI } from '../ui/provider';
import type { UIPrimitiveBag } from '../ui/primitive-bag';

// When true, all Accordion sections in the Content components below render
// with type="multiple" + every child item in defaultValue — i.e. all open.
// Used by the printable reference page so a student can save the entire
// guide as a PDF without opening each section manually. Defaults to false;
// the Sheet view (inside the trainer) is unaffected.
const PrintableContext = React.createContext(false);

export function PrintableStudyGuideProvider({ children }: { children: React.ReactNode }) {
  return <PrintableContext.Provider value={true}>{children}</PrintableContext.Provider>;
}

// Drop-in replacement for `<ui.Accordion>` that, in print mode, swaps
// `type="single" collapsible` for `type="multiple"` with every child item
// pre-opened. Out of print mode it's just `<ui.Accordion>` with the same
// props passed through.
type AccordionProps = React.ComponentProps<UIPrimitiveBag['Accordion']>;

function PrintableAccordion({ children, ...props }: AccordionProps) {
  const ui = useMathmogUI();
  const printable = React.useContext(PrintableContext);
  if (!printable) {
    return <ui.Accordion {...props}>{children}</ui.Accordion>;
  }
  const values: string[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const v = (child.props as { value?: string }).value;
      if (typeof v === 'string' && !values.includes(v)) values.push(v);
    }
  });
  // Switch to multi-open; type-cast through `any` because the underlying
  // Accordion primitive overloads on `type` with different prop unions.
  const printProps: any = {
    ...props,
    type: 'multiple',
    defaultValue: values,
    collapsible: undefined,
  };
  return <ui.Accordion {...printProps}>{children}</ui.Accordion>;
}

function StudySection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ui = useMathmogUI();
  return (
    <ui.Card className={className}>
      <ui.CardHeader>
        <ui.CardTitle className="text-xl text-primary">{title}</ui.CardTitle>
      </ui.CardHeader>
      <ui.CardContent>{children}</ui.CardContent>
    </ui.Card>
  );
}

export const MemorizeContent = () => {
  const ui = useMathmogUI();
  const higherPowers: Record<string, Record<string, number>> = {
    '2': { '4': 16, '5': 32, '6': 64, '7': 128, '8': 256, '9': 512 },
    '3': { '4': 81, '5': 243, '6': 729 },
    '4': { '4': 256 },
    '5': { '4': 625 },
    '6': { '4': 1296 },
  };
  const importantSquares: Record<number, number> = {
    24: 576,
    25: 625,
    27: 729,
    36: 1296,
    40: 1600,
    41: 1681,
  };

  const memorizedMultiplicationExamples = [
    { q: '13 × 3', a: 39 }, { q: '13 × 4', a: 52 }, { q: '13 × 5', a: 65 },
    { q: '14 × 3', a: 42 }, { q: '14 × 4', a: 56 }, { q: '14 × 5', a: 70 },
    { q: '15 × 3', a: 45 }, { q: '15 × 4', a: 60 }, { q: '15 × 5', a: 75 }, { q: '15 × 6', a: 90 }, { q: '15 × 7', a: 105 }, { q: '15 × 8', a: 120 }, { q: '15 × 9', a: 135 },
    { q: '16 × 2', a: 32 }, { q: '16 × 3', a: 48 }, { q: '16 × 4', a: 64 }, { q: '16 × 5', a: 80 }, { q: '16 × 6', a: 96 }, { q: '16 × 7', a: 112 }, { q: '16 × 8', a: 128 }, { q: '16 × 9', a: 144 },
    { q: '17 × 3', a: 51 }, { q: '17 × 4', a: 68 }, { q: '17 × 5', a: 85 },
    { q: '18 × 3', a: 54 }, { q: '18 × 4', a: 72 }, { q: '18 × 5', a: 90 },
    { q: '19 × 3', a: 57 }, { q: '19 × 4', a: 76 }, { q: '19 × 5', a: 95 },
    { q: '24 × 3', a: 72 }, { q: '24 × 4', a: 96 }, { q: '24 × 5', a: 120 },
    { q: '27 × 3', a: 81 }, { q: '27 × 4', a: 108 }, { q: '27 × 5', a: 135 },
    { q: '32 × 3', a: 96 }, { q: '32 × 4', a: 128 }, { q: '32 × 5', a: 160 },
    { q: '36 × 3', a: 108 }, { q: '36 × 4', a: 144 }, { q: '36 × 5', a: 180 },
  ];
  const groupedMultiples = memorizedMultiplicationExamples.reduce((acc, { q, a }) => {
    const base = q.split(' ')[0];
    if (!acc[base]) {
      acc[base] = [];
    }
    acc[base].push({ q, a });
    return acc;
  }, {} as Record<string, { q: string; a: number }[]>);

  const superscriptMap: { [key: string]: string } = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵',
    '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  };
  const toSuperscript = (n: number | string) =>
    String(n).split('').map((char) => superscriptMap[char]).join('');

  // Times Tables grid: factors 1-12 across both axes. Two-tone highlight:
  // rows 6-9 carry a subtle tint (the curriculum's `tt_6_9` and `tt_just_N`
  // scopes target these), and the 6-9 × 6-9 intersection block carries a
  // stronger tint (the canonical "actually-hard" cluster Maya and Daniel
  // both report stalling on per curriculum §1.1, §1.2). 1× is included for
  // completeness with a quieter text color; Reference is the complete fact
  // set, the generator decides what gets drilled.
  const timesTablesFactors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const isHardRow = (n: number) => n >= 6 && n <= 9;
  const isHardCell = (row: number, col: number) =>
    isHardRow(row) && isHardRow(col);

  return (
    <div className="space-y-6">
      <StudySection title="Memorization Facts">
        <PrintableAccordion type="single" collapsible className="w-full">
          <ui.AccordionItem value="times-tables">
            <ui.AccordionTrigger>Times Tables (1× through 12×)</ui.AccordionTrigger>
            <ui.AccordionContent>
              <p className="text-sm text-muted-foreground mb-3">
                Every single-digit multiplication fact in one grid. The shaded rows (6 through 9) are the ones students forget most often. If you can read a fact off the grid without thinking, that&apos;s one you&apos;ve got.
              </p>
              <div className="overflow-x-auto">
                <ui.Table>
                  <ui.TableBody>
                    <ui.TableRow className="font-mono text-xs sm:text-sm">
                      <ui.TableCell className="font-semibold text-muted-foreground px-2 py-1">×</ui.TableCell>
                      {timesTablesFactors.map((col) => (
                        <ui.TableCell
                          key={col}
                          className={`font-semibold px-2 py-1 text-center ${
                            col === 1 ? 'text-muted-foreground/70' : 'text-muted-foreground'
                          }`}
                        >
                          {col}
                        </ui.TableCell>
                      ))}
                    </ui.TableRow>
                    {timesTablesFactors.map((row) => (
                      <ui.TableRow
                        key={row}
                        className={`font-mono text-xs sm:text-sm ${
                          isHardRow(row) ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                        } ${row === 1 ? 'text-foreground/70' : ''}`}
                      >
                        <ui.TableCell className="font-semibold px-2 py-1">{row}</ui.TableCell>
                        {timesTablesFactors.map((col) => (
                          <ui.TableCell
                            key={col}
                            className={`px-2 py-1 text-center ${
                              isHardCell(row, col)
                                ? 'bg-amber-100 dark:bg-amber-900/40 font-semibold'
                                : ''
                            } ${col === 1 && row !== 1 ? 'text-foreground/70' : ''}`}
                          >
                            {row * col}
                          </ui.TableCell>
                        ))}
                      </ui.TableRow>
                    ))}
                  </ui.TableBody>
                </ui.Table>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                <span className="font-semibold text-foreground">Often-mixed-up facts:</span>{' '}
                7 × 8 = 56 (not 54). 6 × 9 = 54 (not 56). 8 × 8 = 64. 7 × 7 = 49.
              </p>
            </ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="item-1">
            <ui.AccordionTrigger>Perfect Squares (1-20)</ui.AccordionTrigger>
            <ui.AccordionContent>
              <p className="text-sm text-muted-foreground mb-3">
                The shaded row (16² through 20²) is where most students hesitate. The rest tend to come back fast once you&apos;ve seen them a few times.
              </p>
              <ui.Table>
                <ui.TableBody>
                  {[
                    [1, 2, 3, 4, 5],
                    [6, 7, 8, 9, 10],
                    [11, 12, 13, 14, 15],
                    [16, 17, 18, 19, 20],
                  ].map((row, rowIndex) => (
                    <ui.TableRow
                      key={rowIndex}
                      className={`font-mono text-sm ${
                        rowIndex === 3 ? 'bg-amber-50 dark:bg-amber-900/20' : 'even:bg-muted/50'
                      }`}
                    >
                      {row.map((base) => (
                        <ui.TableCell key={base}>
                          <span className="font-semibold">{base}²</span> = {perfectSquares[base]}
                        </ui.TableCell>
                      ))}
                    </ui.TableRow>
                  ))}
                </ui.TableBody>
              </ui.Table>
            </ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="item-2">
            <ui.AccordionTrigger>Perfect Cubes (1-10)</ui.AccordionTrigger>
            <ui.AccordionContent>
              <p className="text-sm text-muted-foreground mb-3">
                The shaded row (6³ through 10³) is the harder half. 6³ = 216 is where most students stall.
              </p>
              <ui.Table>
                <ui.TableBody>
                  {[
                    [1, 2, 3, 4, 5],
                    [6, 7, 8, 9, 10],
                  ].map((row, rowIndex) => (
                    <ui.TableRow
                      key={rowIndex}
                      className={`font-mono text-sm ${
                        rowIndex === 1 ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                      }`}
                    >
                      {row.map((base) => (
                        <ui.TableCell key={base}>
                          <span className="font-semibold">{base}³</span> = {perfectCubes[base]}
                        </ui.TableCell>
                      ))}
                    </ui.TableRow>
                  ))}
                </ui.TableBody>
              </ui.Table>
            </ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="item-3">
            <ui.AccordionTrigger>Common Fraction Conversions</ui.AccordionTrigger>
            <ui.AccordionContent>
              <p className="text-sm text-muted-foreground mb-4">
                Note: For repeating decimals, rounded or truncated answers are often accepted in practice mode.
              </p>
              <ui.Table>
                <ui.TableBody>
                  {commonFractionConversions
                    .reduce((acc, _, index, array) => {
                      if (index % 2 === 0) {
                        acc.push(array.slice(index, index + 2));
                      }
                      return acc;
                    }, [] as (typeof commonFractionConversions)[])
                    .map((row, rowIndex) => (
                      <ui.TableRow key={rowIndex} className="font-mono text-sm even:bg-muted/50">
                        {row.map(({ frac, decimal, percent }) => (
                          <ui.TableCell key={frac}>
                            <span className="font-semibold">{frac}</span> = {decimal} = {percent}
                          </ui.TableCell>
                        ))}
                      </ui.TableRow>
                    ))}
                </ui.TableBody>
              </ui.Table>
            </ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="item-4">
            <ui.AccordionTrigger>Advanced Memorization</ui.AccordionTrigger>
            <ui.AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Higher Powers</h4>
                  <ui.Table>
                    <ui.TableBody>
                      <ui.TableRow className="font-mono text-sm even:bg-muted/50">
                        <ui.TableCell className="font-semibold">Base 2</ui.TableCell>
                        {Object.entries(higherPowers['2']).map(([exponent, result]) => (
                          <ui.TableCell key={exponent}>
                            <span className="font-semibold">2{toSuperscript(exponent)}</span> = {result}
                          </ui.TableCell>
                        ))}
                      </ui.TableRow>
                      <ui.TableRow className="font-mono text-sm even:bg-muted/50">
                        <ui.TableCell className="font-semibold">Base 3</ui.TableCell>
                        {Object.entries(higherPowers['3']).map(([exponent, result]) => (
                          <ui.TableCell key={exponent}>
                            <span className="font-semibold">3{toSuperscript(exponent)}</span> = {result}
                          </ui.TableCell>
                        ))}
                      </ui.TableRow>
                      <ui.TableRow className="font-mono text-sm even:bg-muted/50">
                        <ui.TableCell className="font-semibold">Other Bases</ui.TableCell>
                        {Object.entries(higherPowers['4']).map(([exponent, result]) => (
                          <ui.TableCell key={exponent}>
                            <span className="font-semibold">4{toSuperscript(exponent)}</span> = {result}
                          </ui.TableCell>
                        ))}
                        {Object.entries(higherPowers['5']).map(([exponent, result]) => (
                          <ui.TableCell key={exponent}>
                            <span className="font-semibold">5{toSuperscript(exponent)}</span> = {result}
                          </ui.TableCell>
                        ))}
                        {Object.entries(higherPowers['6']).map(([exponent, result]) => (
                          <ui.TableCell key={exponent}>
                            <span className="font-semibold">6{toSuperscript(exponent)}</span> = {result}
                          </ui.TableCell>
                        ))}
                      </ui.TableRow>
                    </ui.TableBody>
                  </ui.Table>
                </div>
                <div className="pt-4">
                  <h4 className="font-semibold mb-2">Important Squares</h4>
                  <ui.Table>
                    <ui.TableBody className="font-mono text-sm">
                      <ui.TableRow className="even:bg-muted/50">
                        <ui.TableCell>
                          <span className="font-semibold">24²</span> = {importantSquares[24]}
                        </ui.TableCell>
                        <ui.TableCell>
                          <span className="font-semibold">25²</span> = {importantSquares[25]}
                        </ui.TableCell>
                        <ui.TableCell className="text-xs text-muted-foreground italic">
                          from the 7-24-25 Pythagorean triple
                        </ui.TableCell>
                      </ui.TableRow>
                      <ui.TableRow className="even:bg-muted/50">
                        <ui.TableCell>
                          <span className="font-semibold">27²</span> = {importantSquares[27]}
                        </ui.TableCell>
                        <ui.TableCell className="text-xs text-muted-foreground italic">
                          (same as 3⁶ and 9³)
                        </ui.TableCell>
                        <ui.TableCell>
                          <span className="font-semibold">36²</span> = {importantSquares[36]}{' '}
                          <span className="text-xs text-muted-foreground italic">(same as 6⁴)</span>
                        </ui.TableCell>
                      </ui.TableRow>
                      <ui.TableRow className="even:bg-muted/50">
                        <ui.TableCell>
                          <span className="font-semibold">40²</span> = {importantSquares[40]}
                        </ui.TableCell>
                        <ui.TableCell>
                          <span className="font-semibold">41²</span> = {importantSquares[41]}
                        </ui.TableCell>
                        <ui.TableCell className="text-xs text-muted-foreground italic">
                          from the 9-40-41 Pythagorean triple
                        </ui.TableCell>
                      </ui.TableRow>
                    </ui.TableBody>
                  </ui.Table>
                </div>
                <div className="pt-4">
                  <h4 className="font-semibold mb-2">Common Multiples</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    It&apos;s useful to memorize certain multiplication facts that appear often.
                  </p>
                  <ui.Table>
                    <ui.TableBody>
                      {Object.entries(groupedMultiples).map(([base, multiples]) => (
                        <ui.TableRow key={base} className="font-mono text-sm even:bg-muted/50">
                          <ui.TableCell className="font-semibold">{base}</ui.TableCell>
                          <ui.TableCell className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                            {multiples.map(({ q, a }) => (
                              <div key={q}>
                                {q.replace('×', '× ')} = {a}
                              </div>
                            ))}
                          </ui.TableCell>
                        </ui.TableRow>
                      ))}
                    </ui.TableBody>
                  </ui.Table>
                </div>
              </div>
            </ui.AccordionContent>
          </ui.AccordionItem>
        </PrintableAccordion>
      </StudySection>
    </div>
  );
};

export const EstimateContent = () => {
  const ui = useMathmogUI();
  return (
    <div className="space-y-6">
      <StudySection title="Smart Estimation Strategies">
        <PrintableAccordion type="single" collapsible className="w-full">
          <ui.AccordionItem value="item-1">
            <ui.AccordionTrigger>Multiplication Estimation</ui.AccordionTrigger>
            <ui.AccordionContent>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md text-sm">
                <p className="font-semibold">Round to friendly numbers, check your bounds:</p>
                <p className="mb-2">
                  <strong>Example:</strong> 82 x 37
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Round down: 80 x 30 = 2,400</li>
                  <li>Round up: 90 x 40 = 3,600</li>
                  <li>Answer should be between 2,400 and 3,600</li>
                  <li>Best estimate: 80 x 40 = 3,200 (actual: 3,034)</li>
                </ul>
                <p className="text-xs text-amber-800 dark:text-amber-400 mt-3">
                  Strategy: Use &quot;friendly&quot; numbers (multiples of 10) to create upper and
                  lower bounds, then pick the best estimate
                </p>
              </div>
            </ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="item-2">
            <ui.AccordionTrigger>Square Root Estimation</ui.AccordionTrigger>
            <ui.AccordionContent>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md text-sm">
                <p className="font-semibold">Use perfect squares as anchors:</p>
                <p className="mb-2">
                  <strong>Example:</strong> √151
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Know that 12² = 144 and 13² = 169</li>
                  <li>Since 151 is between 144 and 169, √151 is between 12 and 13</li>
                  <li>151 is closer to 144, so √151 ≈ 12.2</li>
                </ul>
                <p className="text-xs text-amber-800 dark:text-amber-400 mt-3">
                  Pro Tip: 13² - 12² = 25, so each 0.1 from 12 ≈ 2.5 units
                </p>
              </div>
            </ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="item-3">
            <ui.AccordionTrigger>Fraction Estimation</ui.AccordionTrigger>
            <ui.AccordionContent>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md text-sm">
                <p className="font-semibold">Round to a nearby &quot;benchmark&quot; fraction:</p>
                <p className="mb-2">
                  <strong>Example:</strong> 26/74
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Recognize that 26/74 is very close to 25/75.</li>
                  <li>Simplify the benchmark: 25/75 = 1/3.</li>
                  <li>So, 26/74 is approximately 0.33. (Actual: 0.35)</li>
                </ul>
                <p className="text-xs text-amber-800 dark:text-amber-400 mt-3">
                  Common benchmarks: 1/4, 1/3, 1/2, 2/3, 3/4
                </p>
              </div>
            </ui.AccordionContent>
          </ui.AccordionItem>
        </PrintableAccordion>
      </StudySection>
      <StudySection title="Lightning-Fast Percentage Calculations">
        <PrintableAccordion type="single" collapsible className="w-full">
          <ui.AccordionItem value="item-1">
            <ui.AccordionTrigger>The 10% + 1% Method</ui.AccordionTrigger>
            <ui.AccordionContent>
              <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-md">
                <p className="font-semibold">Example: 23% of 400</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Find 10%: 400 → 40</li>
                  <li>Find 1%: 400 → 4</li>
                  <li>Calculate: (2 x 40) + (3 x 4) = 80 + 12 = 92</li>
                </ol>
              </div>
            </ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="item-2">
            <ui.AccordionTrigger>Other Quick Percentages</ui.AccordionTrigger>
            <ui.AccordionContent>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>15%:</strong> 10% + 5% (half of 10%)
                </li>
                <li>
                  <strong>25%:</strong> Divide by 4
                </li>
                <li>
                  <strong>45%:</strong> 50% - 5%
                </li>
                <li>
                  <strong>50%:</strong> Divide by 2
                </li>
                <li>
                  <strong>75%:</strong> 25% x 3 (or 50% + 25%)
                </li>
              </ul>
            </ui.AccordionContent>
          </ui.AccordionItem>
        </PrintableAccordion>
      </StudySection>
    </div>
  );
};

export const CraftyContent = () => {
  const ui = useMathmogUI();
  const strategies = [
    { title: 'Multiplying by 4', example: 'Double the number twice.', calculation: 'e.g., 35 × 4 → 35×2=70 → 70×2=140' },
    { title: 'Dividing by 4', example: 'Halve the number twice.', calculation: 'e.g., 180 ÷ 4 → 180÷2=90 → 90÷2=45' },
    { title: 'Multiplying by 5', example: 'Multiply by 10, then divide by 2.', calculation: 'e.g., 84 × 5 → 84×10 ÷ 2 = 840 ÷ 2 = 420' },
    { title: 'Dividing by 5', example: 'Divide by 10, then multiply by 2.', calculation: 'e.g., 420 ÷ 5 → 420÷10 × 2 = 42 × 2 = 84' },
    { title: 'Multiplying by 8', example: 'Double the number three times.', calculation: 'e.g., 15 × 8 → 15×2=30 → 30×2=60 → 60×2=120' },
    { title: 'Dividing by 8', example: 'Halve the number three times.', calculation: 'e.g., 240 ÷ 8 → 240÷2=120 → 120÷2=60 → 60÷2=30' },
    { title: 'Multiplying by 9', example: 'Multiply by 10, then subtract the original number.', calculation: 'e.g., 23 × 9 → 23×10 - 23 = 230 - 23 = 207' },
    { title: 'Multiplying by 11', example: 'For a 2-digit number (AB), the answer is A(A+B)B. If A+B > 9, carry the one.', calculation: 'e.g., 43 × 11 → 4 (4+3) 3 → 473\ne.g., 85 × 11 → 8 (8+5) 5 → 8 (13) 5 → 935' },
    { title: 'Multiplying by 12', example: 'Multiply by 10, then add double the original number.', calculation: 'e.g., 35 × 12 → 35×10 + 35×2 = 350 + 70 = 420' },
    { title: 'Dividing by 12', example: 'If a number is divisible by both 3 and 4, you can divide by 12. Halve it, then divide by 6, or divide by 2, then 2, then 3.', calculation: 'e.g., 552 ÷ 12 → 552÷6 = 92 → 92÷2 = 46' },
    { title: 'Multiplying by 15', example: 'Multiply by 10, then add half of that result.', calculation: 'e.g., 42 × 15 → 42×10 + (420/2) = 420 + 210 = 630' },
    { title: 'Multiplying by 25', example: 'Multiply by 100, then divide by 4.', calculation: 'e.g., 36 × 25 → 36×100 ÷ 4 = 3600 ÷ 4 = 900' },
    { title: 'Multiplying by 19 / 99', example: 'Multiply by the next round number (20 / 100), then subtract the original number.', calculation: 'e.g., 16 × 19 → 16×20 - 16 = 320 - 16 = 304\ne.g., 18 × 99 → 18×100 - 18 = 1782' },
    { title: 'Squaring numbers ending in 5', example: 'Take the tens digit (T), calculate T × (T+1), then append "25".', calculation: 'e.g., 35² → 3×(3+1) & 25 → 12 & 25 → 1225\ne.g., 85² → 8×(8+1) & 25 → 72 & 25 → 7225' },
    { title: 'Complementary Multiplication (Difference of Squares)', example: 'For two numbers that are equally distant from a round number (like a multiple of 10 or 5), you can use the formula (x-d)(x+d) = x² - d².', calculation: 'e.g., 23 × 27 → (25-2)×(25+2) = 25² - 2² = 625 - 4 = 621\ne.g., 72 × 78 → (75-3)×(75+3) = 75² - 3² = 5625 - 9 = 5616' },
  ];
  return (
    <div className="space-y-6">
      <StudySection title="💡 Pro Tips & Strategies">
        <PrintableAccordion type="single" collapsible className="w-full">
          <ui.AccordionItem value="item-1">
            <ui.AccordionTrigger>Strategic Multiplication & Division</ui.AccordionTrigger>
            <ui.AccordionContent>
              <ui.Table>
                <ui.TableBody>
                  {strategies.map(({ title, example, calculation }, index) => (
                    <ui.TableRow key={index} className="even:bg-muted/50">
                      <ui.TableCell>
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm text-muted-foreground">{example}</p>
                      </ui.TableCell>
                      <ui.TableCell className="font-mono text-sm text-foreground/80 whitespace-pre-line">
                        {calculation}
                      </ui.TableCell>
                    </ui.TableRow>
                  ))}
                </ui.TableBody>
              </ui.Table>
            </ui.AccordionContent>
          </ui.AccordionItem>
        </PrintableAccordion>
      </StudySection>
      <StudySection title="🔢 Basic Divisibility Rules">
        <PrintableAccordion type="single" collapsible className="w-full">
          <ui.AccordionItem value="item-1">
            <ui.AccordionTrigger>Divisibility by 3</ui.AccordionTrigger>
            <ui.AccordionContent>
              If the sum of the digits is divisible by 3, the number is too.{' '}
              <span className="font-mono text-xs text-muted-foreground">(e.g., 462 → 4+6+2=12)</span>
            </ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="item-2">
            <ui.AccordionTrigger>Divisibility by 4</ui.AccordionTrigger>
            <ui.AccordionContent>
              Since 20 is divisible by 4, every multiple of 20 is too. Because 100 is a multiple of
              20, we only need to check the last two digits.
              <br />
              <span className="font-mono text-xs text-muted-foreground">
                e.g., 1,236 → 1200 + 36. Both 1200 and 36 are divisible by 4, so 1,236 is too.
              </span>
              <br />
              <span className="font-mono text-xs text-muted-foreground">
                e.g., 1,262 → 1200 + 62. 1200 is divisible by 4, but 62 is not. So 1,262 is not.
              </span>
            </ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="item-3">
            <ui.AccordionTrigger>Divisibility by 5</ui.AccordionTrigger>
            <ui.AccordionContent>If the number ends in a 0 or 5.</ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="item-4">
            <ui.AccordionTrigger>Divisibility by 6</ui.AccordionTrigger>
            <ui.AccordionContent>If the number is divisible by both 2 (is even) and 3.</ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="item-5">
            <ui.AccordionTrigger>Divisibility by 8</ui.AccordionTrigger>
            <ui.AccordionContent>
              Since 40 is divisible by 8, every multiple of 40 is too. Because 200 is a multiple of
              40, we only need to check the last three digits.
              <br />
              <span className="font-mono text-xs text-muted-foreground">
                e.g., 136 → 120 + 16. Since 120 (3x40) and 16 are divisible by 8, 136 is too.
              </span>
              <br />
              <span className="font-mono text-xs text-muted-foreground">
                e.g., 12,336 → We check the last three digits: 336. Since 336 = 200 + 136, and both
                200 and 136 are divisible by 8, then 336 is divisible by 8, so 12,336 is too.
              </span>
              <br />
              <span className="font-mono text-xs text-muted-foreground">
                Alternatively, it&apos;s often easier to just halve the number three times. If you
                get a whole number, it&apos;s divisible.
              </span>
            </ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="item-6">
            <ui.AccordionTrigger>Divisibility by 9</ui.AccordionTrigger>
            <ui.AccordionContent>
              If the sum of the digits is divisible by 9.{' '}
              <span className="font-mono text-xs text-muted-foreground">
                (e.g., 1,782 → 1+7+8+2=18)
              </span>
            </ui.AccordionContent>
          </ui.AccordionItem>
        </PrintableAccordion>
      </StudySection>
      <StudySection title="🔢 Advanced Divisibility Rules">
        <PrintableAccordion type="single" collapsible className="w-full">
          <ui.AccordionItem value="item-1">
            <ui.AccordionTrigger>Divisibility by 7</ui.AccordionTrigger>
            <ui.AccordionContent>
              Multiply the last digit by 5 and add it to the remaining number. Repeat until you
              get a small number. If it&apos;s divisible by 7, the original is too.
              <br />
              <span className="font-mono text-xs text-muted-foreground">
                e.g., 532 → 53 + (2×5) = 63. Since 63 is divisible by 7, so is 532.
              </span>
              <br />
              <span className="font-mono text-xs text-muted-foreground">
                e.g., 987 → 98 + (7×5) = 133 → 13 + (3×5) = 28. Since 28 is divisible by 7, so is
                987.
              </span>
            </ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="item-2">
            <ui.AccordionTrigger>Divisibility by 11</ui.AccordionTrigger>
            <ui.AccordionContent>
              Alternately add and subtract the digits from left to right. If the result is 0 or
              divisible by 11, the original number is too.
              <br />
              <span className="text-sm ml-4 font-mono text-foreground/80">
                e.g., 8679 → 8 - 6 + 7 - 9 = 0. Divisible.
              </span>
              <br />
              <span className="text-sm ml-4 font-mono text-foreground/80">
                e.g., 9581 → 9 - 5 + 8 - 1 = 11. Divisible.
              </span>
              <br />
              <span className="text-sm ml-4 font-mono text-foreground/80">
                e.g., 2907 → 2 - 9 + 0 - 7 = -14. Not divisible.
              </span>
            </ui.AccordionContent>
          </ui.AccordionItem>
          <ui.AccordionItem value="item-3">
            <ui.AccordionTrigger>Divisibility by 12</ui.AccordionTrigger>
            <ui.AccordionContent>
              If the number is divisible by both 3 and 4, it is divisible by 12.
              <br />
              <span className="text-sm ml-4 font-mono text-foreground/80">
                e.g., 552 → Divisible by 3 (5+5+2=12) and 4 (last two digits, 52). So, divisible by
                12.
              </span>
            </ui.AccordionContent>
          </ui.AccordionItem>
        </PrintableAccordion>
      </StudySection>
    </div>
  );
};

const scalingData = {
  memorize: {
    title: 'Memorize',
    difficulties: {
      Easy: [
        'Perfect Squares (1-12)',
        'Perfect Cubes (1-5)',
        'Fraction/Decimal/Percent Conversions (denominators: 4, 5)',
        'Memorized Multiplication (e.g., 17x3, 24x2, 15x3, 15x4)',
      ],
      Medium: [
        'Perfect Squares (11-20)',
        'Perfect Cubes (4-10)',
        'Fraction/Decimal/Percent Conversions (denominators: 3, 6, 8, 9, 7)',
        'Memorized Multiplication (e.g., 19x5, 24x4, 36x3)',
        'Higher Powers (2⁴, 2⁵, 3⁴, 3⁵)',
      ],
      Hard: [
        'Perfect Squares (30-100, tens)',
        'Perfect Cubes (20-100, tens)',
        'Memorized Multiplication (e.g., 27x4, 32x5)',
        'Higher Powers & Squares (e.g., 2⁶, 3⁶, 4⁴, 24²)',
      ],
    },
  },
  estimate: {
    title: 'Estimate',
    difficulties: {
      Easy: [
        'Multiplication Estimation (11-29 × 11-29)',
        'Square Root Estimation (bases 1-9)',
        'Percentage Estimation (simple % of round numbers)',
      ],
      Medium: [
        'Multiplication Estimation (21-69 × 11-39)',
        'Square Root Estimation (bases 1-19)',
        'Percentage Estimation (complex % of round numbers)',
        'Fraction Estimation (2-digit num/den)',
      ],
      Hard: [
        'Multiplication Estimation (51+ × 21-79)',
        'Square Root Estimation (bases 20-90, tens)',
        'Cube Root Estimation (bases 1-10)',
        'Percentage Estimation (complex % of any 3-digit number)',
        'Fraction Estimation (2-digit/3-digit or improper)',
      ],
    },
  },
  crafty: {
    title: 'Get Crafty',
    difficulties: {
      Easy: [
        'Multiply by 4 (small numbers)',
        'Divide by 4 (no remainder)',
        'Multiply by 5 (small numbers)',
        'Divide by 5 (no remainder)',
        'Multiply by 9 (small numbers)',
        'Divisibility Rules (3, 5, 6, 9)',
      ],
      Medium: [
        'Multiply by 4, 5, or 9 (larger numbers)',
        'Divide by 4 (whole or X.5 answer)',
        'Divide by 5 (with remainder)',
        'Multiply by 8',
        'Divide by 8 (no remainder)',
        'Multiply by 11',
        'Multiply by 12 or 15',
        'Divisibility Rules (3, 4, 6, 8, 9; 4-digit numbers)',
      ],
      Hard: [
        'Divide by 8 (with remainder)',
        'Divide by 12 (no remainder)',
        'Multiply by 19',
        'Multiply by 25',
        'Multiply by 99',
        'Square numbers ending in 5',
        'Complementary Multiplication',
        'Advanced Divisibility (7, 11)',
      ],
    },
  },
};

export const DifficultyScalingContent = () => {
  const ui = useMathmogUI();
  return (
    <div className="space-y-6">
      {Object.values(scalingData).map((level) => (
        <ui.Card key={level.title}>
          <ui.CardHeader>
            <ui.CardTitle className="text-xl text-primary">{level.title}</ui.CardTitle>
          </ui.CardHeader>
          <ui.CardContent>
            <ui.Table>
              <ui.TableHeader>
                <ui.TableRow>
                  <ui.TableHead className="w-[100px]">Difficulty</ui.TableHead>
                  <ui.TableHead>Problem Types</ui.TableHead>
                </ui.TableRow>
              </ui.TableHeader>
              <ui.TableBody>
                {Object.entries(level.difficulties).map(([difficulty, types]) => (
                  <ui.TableRow key={difficulty}>
                    <ui.TableCell className="font-medium align-top">{difficulty}</ui.TableCell>
                    <ui.TableCell className="align-top">
                      <ul className="list-disc list-inside">
                        {types.map((type) => (
                          <li key={type}>{type}</li>
                        ))}
                      </ul>
                    </ui.TableCell>
                  </ui.TableRow>
                ))}
              </ui.TableBody>
            </ui.Table>
          </ui.CardContent>
        </ui.Card>
      ))}
    </div>
  );
};

/**
 * Reference content rendered inside the trainer's sidecar (and on the print
 * page). The portal manages the sidecar's Sheet wrapper and tracks open
 * count via `Sheet.onOpenChange`; consumers without a sheet of their own
 * can opt in via the `onOpen` callback below.
 *
 * NOTE on `onOpen`: fires once per *mount* (via `useEffect([])`). It does
 * NOT fire on every "Sheet open" if the consumer keeps `<StudyGuide />`
 * mounted across opens — for that, drive the count from the consumer's
 * own open/close handler. Mount/unmount-per-open consumers (e.g. a modal
 * pattern) can use `onOpen` directly.
 */
export function StudyGuide({ onOpen }: { onOpen?: () => void } = {}) {
  const ui = useMathmogUI();
  const { studyTab, setStudyTab } = useTrainerState();

  React.useEffect(() => {
    onOpen?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Study Guide</h2>
        <p className="text-muted-foreground">
          Essential facts and strategies for mental math mastery
        </p>
      </div>

      <ui.Tabs
        value={studyTab}
        onValueChange={(value) => setStudyTab(value)}
        data-tour="mathmog-reference"
        className="w-full"
      >
        <ui.TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <ui.TabsTrigger value="memorize" data-tour="mathmog-reference-tab-memorize">
            <Brain className="w-4 h-4 mr-1.5" />
            Memorize
          </ui.TabsTrigger>
          <ui.TabsTrigger value="estimate" data-tour="mathmog-reference-tab-estimate">
            <Gauge className="w-4 h-4 mr-1.5" />
            Estimate
          </ui.TabsTrigger>
          <ui.TabsTrigger value="crafty" data-tour="mathmog-reference-tab-crafty">
            <Wand2 className="w-4 h-4 mr-1.5" />
            Get Crafty
          </ui.TabsTrigger>
          <ui.TabsTrigger value="scaling" data-tour="mathmog-reference-tab-scaling">
            <TrendingUp className="w-4 h-4 mr-1.5" />
            Scaling
          </ui.TabsTrigger>
        </ui.TabsList>
        <ui.TabsContent value="memorize" className="mt-6">
          <MemorizeContent />
        </ui.TabsContent>
        <ui.TabsContent value="estimate" className="mt-6">
          <EstimateContent />
        </ui.TabsContent>
        <ui.TabsContent value="crafty" className="mt-6">
          <CraftyContent />
        </ui.TabsContent>
        <ui.TabsContent value="scaling" className="mt-6">
          <DifficultyScalingContent />
        </ui.TabsContent>
      </ui.Tabs>
    </div>
  );
}
