import type { Difficulty, Problem } from '@/lib/types';

// Helper for simplifying fractions
const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
export const simplifyFraction = (num: number, den: number) => {
    const common = gcd(num, den);
    return `${num / common}/${den / common}`;
};

// Helper data for the fraction generator
const fractionBasesByDenominator: Record<number, { numerators: number[], precision: number }> = {
    3: { numerators: [1, 2], precision: 2 },
    4: { numerators: [1, 3], precision: 2 },
    5: { numerators: [1, 2, 3, 4], precision: 1 },
    6: { numerators: [1, 5], precision: 3 },
    7: { numerators: [1, 2, 3, 4, 5, 6], precision: 3 },
    8: { numerators: [1, 3, 5, 7], precision: 3 },
    9: { numerators: [1, 2, 4, 5, 7, 8], precision: 2 },
};

// Reference data
export const perfectSquares: Record<number, number> = {
    1: 1, 2: 4, 3: 9, 4: 16, 5: 25, 6: 36, 7: 49, 8: 64, 9: 81, 10: 100,
    11: 121, 12: 144, 13: 169, 14: 196, 15: 225, 16: 256, 17: 289, 18: 324, 19: 361, 20: 400
};

export const perfectCubes: Record<number, number> = {
    1: 1, 2: 8, 3: 27, 4: 64, 5: 125, 6: 216, 7: 343, 8: 512, 9: 729, 10: 1000
};

export const commonFractionConversions = Object.entries(fractionBasesByDenominator).flatMap(([den, { numerators, precision }]) => 
    numerators.map(num => ({ 
        frac: `${num}/${den}`, 
        decimal: (num/parseInt(den)).toFixed(precision) 
    }))
);

export const generateProblem = (level: number, difficulty: Difficulty, hardModeBonus: number): Problem => {

    const generateLevel1Problem = (): Problem => {
        const problemTypes = ['square', 'cube', 'fraction', 'divisibility'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        if (type === 'square') {
          let min = 2, max = 5; if (difficulty === 'Medium') { min = 4; max = 12; } if (difficulty === 'Hard') { min = 8 + hardModeBonus; max = 15 + hardModeBonus; }
          let num = Math.floor(Math.random() * (max - min + 1)) + min; const answer = perfectSquares[num] || num * num; return { question: `${num}² = ?`, answer, type: 'Perfect Squares', explanation: `${num}² = ${num}×${num} = ${answer}`, inputType: 'number' };
        } 
        if (type === 'cube') {
          let min = 2, max = 4; if (difficulty === 'Medium') { min = 3; max = 6; } if (difficulty === 'Hard') { min = 5 + hardModeBonus; max = 8 + hardModeBonus; }
          let num = Math.floor(Math.random() * (max - min + 1)) + min; const answer = perfectCubes[num] || num * num * num; return { question: `${num}³ = ?`, answer, type: 'Perfect Cubes', explanation: `${num}³ = ${num}×${num}×${num} = ${answer}`, inputType: 'number' };
        } 
        if (type === 'fraction') {
            const easyDenominators = [3, 4, 5, 6, 8, 9]; const mediumAndHardDenominators = [3, 4, 5, 6, 7, 8, 9]; let num, den;
            if (difficulty === 'Easy') { den = easyDenominators[Math.floor(Math.random() * easyDenominators.length)]; num = Math.floor(Math.random() * (den - 1)) + 1; } 
            else if (difficulty === 'Medium') { den = mediumAndHardDenominators[Math.floor(Math.random() * mediumAndHardDenominators.length)]; num = Math.floor(Math.random() * 99) + 1; } 
            else { den = mediumAndHardDenominators[Math.floor(Math.random() * mediumAndHardDenominators.length)]; const maxNumerator = 999 + (hardModeBonus * 100); num = Math.floor(Math.random() * maxNumerator) + 1; }
            const { precision } = fractionBasesByDenominator[den];
            const conversionTypes = ['fracToDec', 'decToFrac', 'fracToPerc', 'percToFrac', 'decToPerc', 'percToDec']; const conversionType = conversionTypes[Math.floor(Math.random() * conversionTypes.length)];
            const decimalValue = num / den; const percentValue = decimalValue * 100;
            switch (conversionType) {
                case 'fracToDec': return { question: `Convert ${num}/${den} to a decimal (round to ${precision} places)`, answer: parseFloat(decimalValue.toFixed(precision)), type: 'Fraction to Decimal', explanation: `${num}/${den} = ${num} ÷ ${den} ≈ ${decimalValue.toFixed(precision)}`, inputType: 'number' };
                case 'decToFrac': { const s = simplifyFraction(num, den); const [sN, sD] = s.split('/').map(Number); const qD = parseFloat((sN/sD).toFixed(precision)); return { question: `Convert ${qD} to a fraction`, answer: s, type: 'Decimal to Fraction', explanation: `${qD} is the decimal for ${s}`, inputType: 'text' }; }
                case 'fracToPerc': return { question: `Convert ${num}/${den} to a percent (round to ${precision - 2 > 0 ? precision - 2 : 0} decimal places)`, answer: parseFloat(percentValue.toFixed(precision - 2 > 0 ? precision - 2 : 0)), type: 'Fraction to Percent', explanation: `${num}/${den} = ${decimalValue} = ${percentValue.toFixed(2)}%`, inputType: 'number' };
                case 'percToFrac': { const s = simplifyFraction(num, den); const [sN, sD] = s.split('/').map(Number); const qP = parseFloat(((sN / sD) * 100).toFixed(2)); return { question: `Convert ${qP}% to a fraction`, answer: s, type: 'Percent to Fraction', explanation: `${qP}% = ${qP}/100 = ${s}`, inputType: 'text' }; }
                case 'decToPerc': { const d = parseFloat(decimalValue.toFixed(precision)); return { question: `Convert the decimal ${d} to a percent`, answer: parseFloat((d * 100).toFixed(precision - 2 > 0 ? precision - 2 : 0)), type: 'Decimal to Percent', explanation: `${d} × 100 = ${d * 100}%`, inputType: 'number' }; }
                case 'percToDec': { const p = parseFloat(percentValue.toFixed(2)); return { question: `Convert ${p}% to a decimal`, answer: parseFloat((p / 100).toFixed(precision)), type: 'Percent to Decimal', explanation: `${p}% ÷ 100 = ${p / 100}`, inputType: 'number' }; }
                default: return { question: `Convert ${num}/${den} to a decimal`, answer: parseFloat(decimalValue.toFixed(precision)), type: 'Fraction Conversions', explanation: `${num}/${den} = ${num} ÷ ${den} ≈ ${decimalValue.toFixed(precision)}`, inputType: 'number' };
            }
        }
        const divisors = [3, 4, 5, 9, 6, 7, 8, 11].slice(0, difficulty === 'Easy' ? 4 : (difficulty === 'Medium' ? 6 : 8)); const divisor = divisors[Math.floor(Math.random() * divisors.length)];
        let min = 100, max = 999; if (difficulty === 'Hard') { max += (hardModeBonus * 1000); }
        const testNum = Math.floor(Math.random() * (max - min + 1)) + min; const isDivisible = testNum % divisor === 0;
        return { question: `Is ${testNum} divisible by ${divisor}?`, answer: isDivisible ? 'yes' : 'no', type: 'Divisibility Rules', explanation: `${testNum} ${isDivisible ? 'is' : 'is not'} divisible by ${divisor}`, inputType: 'buttons', options: ['yes', 'no'] };
    };

    const generateLevel2Problem = (): Problem => {
        const problemTypes = ['multiplication', 'rootEstimation'];
        const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
        
        if (type === 'rootEstimation' && difficulty !== 'Easy') {
            const isCubeRoot = difficulty === 'Hard' && Math.random() < 0.5;
            const table = isCubeRoot ? perfectCubes : perfectSquares;
            const bases = Object.keys(table).map(Number);

            if (difficulty === 'Medium' || (difficulty === 'Hard' && isCubeRoot)) {
                const base = bases[Math.floor(Math.random() * (bases.length - 2)) + 1];
                const lowerBound = table[base];
                const upperBound = table[base + 1];
                const num = Math.floor(Math.random() * (upperBound - lowerBound - 1)) + lowerBound + 1;
                
                const midPoint = (lowerBound + upperBound) / 2;
                const closerInt = num < midPoint ? base : base + 1;
                
                const questionText = `The ${isCubeRoot ? 'cube' : 'square'} root of ${num} is between the consecutive integers ___ and ___, and is closer to ___.`;
                const answerText = `${base},${base + 1},${closerInt}`;
                const explanation = isCubeRoot 
                    ? `∛${num} ≈ ${Math.cbrt(num).toFixed(2)}. It's between ${base} (${base}³=${lowerBound}) and ${base+1} (${(base+1)}³=${upperBound}). The midpoint is ${midPoint}, and ${num} is closer to ${closerInt}.`
                    : `√${num} ≈ ${Math.sqrt(num).toFixed(2)}. It's between ${base} (${base}²=${lowerBound}) and ${base+1} (${(base+1)}²=${upperBound}). The midpoint is ${midPoint}, and ${num} is closer to ${closerInt}.`;
                
                return { question: questionText, answer: answerText, type: `Root Estimation`, explanation, inputType: 'text', placeholder: "a,b,c" };
            } else if (difficulty === 'Hard' && !isCubeRoot) {
                const base = (Math.floor(Math.random() * 8) + 2) * 10;
                const lowerBound = base * base;
                const upperBound = (base + 10) * (base + 10);
                const num = Math.floor(Math.random() * (upperBound - lowerBound - 1)) + lowerBound + 1;

                const midPoint = (lowerBound + upperBound) / 2;
                const closerMultiple = num < midPoint ? base : base + 10;

                const questionText = `The square root of ${num} is between the multiples of ten ___ and ___, and is closer to ___.`;
                const answerText = `${base},${base + 10},${closerMultiple}`;
                const explanation = `√${num} ≈ ${Math.sqrt(num).toFixed(2)}. It's between ${base} and ${base+10}. The midpoint is ${midPoint}, and ${num} is closer to ${closerMultiple}.`;
                return { question: questionText, answer: answerText, type: `Root Estimation`, explanation, inputType: 'text', placeholder: "a,b,c" };
            }
        }
        
        let aMin = 10, aMax = 30, bMin = 5, bMax = 15, tolerance = 0.25; // Easy
        if (difficulty === 'Medium') { aMin=20; aMax=70; bMin=10; bMax=40; tolerance = 0.20; }
        if (difficulty === 'Hard') { aMin=50 + (hardModeBonus*10); aMax=150 + (hardModeBonus*10); bMin=20; bMax=80; tolerance = 0.15; }
        const a = Math.floor(Math.random() * (aMax-aMin+1)) + aMin;
        const b = Math.floor(Math.random() * (bMax-bMin+1)) + bMin;
        return { question: `Estimate: ${a} × ${b}`, answer: a * b, type: 'Multiplication Estimation', explanation: `${a} × ${b} = ${a * b}`, inputType: 'number', tolerance: (a * b) * tolerance };
    };

    const generateLevel3Problem = (): Problem => {
        let numMin = 10, numMax = 30, multiplier = 8;
        if (difficulty === 'Medium') { numMin = 20; numMax = 50; multiplier = [8, 12, 15][Math.floor(Math.random()*3)]; }
        if (difficulty === 'Hard') { numMin = 50 + (hardModeBonus*5); numMax = 100 + (hardModeBonus*5); multiplier = [9, 11, 19, 99][Math.floor(Math.random()*4)]; }
        const num = Math.floor(Math.random() * (numMax-numMin+1)) + numMin;
        return { question: `${num} × ${multiplier} = ?`, answer: num * multiplier, type: 'Strategic Multiplication', explanation: `${num} × ${multiplier} = ${num * multiplier}`, inputType: 'number' };
    };

    if (level === 1) return generateLevel1Problem();
    if (level === 2) return generateLevel2Problem();
    if (level === 3) return generateLevel3Problem();
    
    // Fallback
    return generateLevel1Problem();
};
