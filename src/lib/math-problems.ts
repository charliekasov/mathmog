import type { Difficulty, Problem } from '@/lib/types';

// Helper for simplifying fractions
const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
export const simplifyFraction = (num: number, den: number) => {
    const common = gcd(num, den);
    return `${num / common}/${den / common}`;
};

// Helper data for the fraction generator
const fractionBasesByDenominator: Record<number, { numerators: number[], precision: number, repeating: boolean }> = {
    3: { numerators: [1, 2], precision: 2, repeating: true },
    4: { numerators: [1, 3], precision: 2, repeating: false },
    5: { numerators: [1, 2, 3, 4], precision: 1, repeating: false },
    6: { numerators: [1, 5], precision: 3, repeating: true },
    7: { numerators: [1, 2, 3, 4, 5, 6], precision: 3, repeating: true },
    8: { numerators: [1, 3, 5, 7], precision: 3, repeating: false },
    9: { numerators: [1, 2, 4, 5, 7, 8], precision: 2, repeating: true },
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

const createUniqueProblem = (generator: () => Problem, history: string[]): Problem => {
    let problem: Problem;
    let attempt = 0;
    do {
        problem = generator();
        attempt++;
    } while (history.includes(problem.question) && attempt < 50); // Failsafe to prevent infinite loops
    return problem;
}

const getDivisibilityExplanation = (num: number, divisor: number, isDivisible: boolean): string => {
    const digits = String(num).split('').map(Number);
    switch (divisor) {
        case 3:
            const sum = digits.reduce((a, b) => a + b, 0);
            return `${num} → ${digits.join(' + ')} = ${sum}. Since ${sum} is ${sum % 3 === 0 ? '' : 'not '}divisible by 3, ${num} is ${isDivisible ? '' : 'not '}divisible by 3.`;
        case 4:
            const lastTwo = num % 100;
            return `${num} → The last two digits are ${lastTwo}. Since ${lastTwo} is ${lastTwo % 4 === 0 ? '' : 'not '}divisible by 4, ${num} is ${isDivisible ? '' : 'not '}divisible by 4.`;
        case 5:
            return `${num} → The number ends in ${num % 10}, so it is ${isDivisible ? '' : 'not '}divisible by 5.`;
        case 6:
            const isEven = num % 2 === 0;
            const sumFor6 = digits.reduce((a, b) => a + b, 0);
            const isDivBy3 = sumFor6 % 3 === 0;
            return `${num} is ${isEven ? 'even' : 'odd'} and its digits sum to ${sumFor6} (which is ${isDivBy3 ? '' : 'not '}divisible by 3). A number must be divisible by BOTH 2 and 3 to be divisible by 6. So, ${num} is ${isDivisible ? '' : 'not '}divisible by 6.`;
        case 7: // This rule is complex, so we'll keep it simple
             return `${num} ${isDivisible ? 'is' : 'is not'} divisible by 7. (This rule is tricky! It often involves doubling the last digit and subtracting it from the rest).`;
        case 8:
            const lastThree = num % 1000;
            return `${num} → The last three digits are ${lastThree}. Since ${lastThree} is ${lastThree % 8 === 0 ? '' : 'not '}divisible by 8, ${num} is ${isDivisible ? '' : 'not '}divisible by 8.`;
        case 9:
            const sumFor9 = digits.reduce((a, b) => a + b, 0);
            return `${num} → ${digits.join(' + ')} = ${sumFor9}. Since ${sumFor9} is ${sumFor9 % 9 === 0 ? '' : 'not '}divisible by 9, ${num} is ${isDivisible ? '' : 'not '}divisible by 9.`;
        case 11:
            const alternatingSum = digits.reduce((acc, digit, index) => acc + digit * Math.pow(-1, index), 0);
            const alternatingSumStr = digits.map((d, i) => (i > 0 ? (i % 2 !== 0 ? ` - ${d}`: ` + ${d}`) : `${d}`)).join('');
            return `${num} → ${alternatingSumStr} = ${alternatingSum}. Since ${alternatingSum} is ${alternatingSum % 11 === 0 ? '' : 'not '}divisible by 11, the number ${num} is ${isDivisible ? '' : 'not '}divisible by 11.`;
        case 12:
             const isDivBy3For12 = digits.reduce((a, b) => a + b, 0) % 3 === 0;
             const isDivBy4For12 = (num % 100) % 4 === 0;
             return `To be divisible by 12, a number must be divisible by both 3 and 4. For ${num}, it is ${isDivBy3For12 ? '' : 'not '}divisible by 3 and ${isDivBy4For12 ? '' : 'not '}divisible by 4. So, it is ${isDivisible ? '' : 'not '}divisible by 12.`;
        case 13: // Rule is complex
             return `${num} ${isDivisible ? 'is' : 'is not'} divisible by 13. (This is another complex rule, often checked with long division!).`;
        default:
            return `${num} ${isDivisible ? 'is' : 'is not'} divisible by ${divisor}`;
    }
}

export const generateProblem = (level: number, difficulty: Difficulty, hardModeBonus: number, history: string[]): Problem => {

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
            const denominators = Object.keys(fractionBasesByDenominator).map(Number);
            let num: number, den: number;
            
            den = denominators[Math.floor(Math.random() * denominators.length)];
            const availableNumerators = fractionBasesByDenominator[den].numerators;
            num = availableNumerators[Math.floor(Math.random() * availableNumerators.length)];
            
            const { precision } = fractionBasesByDenominator[den];
            
            const allConversionTypes = ['fracToDec', 'decToFrac', 'fracToPerc', 'percToFrac', 'decToPerc', 'percToDec'];
            const conversionType = allConversionTypes[Math.floor(Math.random() * allConversionTypes.length)];
            
            const decimalValue = num / den;
            const percentValue = decimalValue * 100;

            switch (conversionType) {
                case 'fracToDec': return { question: `Convert ${num}/${den} to a decimal (round to ${precision} places)`, answer: parseFloat(decimalValue.toFixed(precision)), type: 'Fraction to Decimal', explanation: `${num}/${den} = ${num} ÷ ${den} ≈ ${decimalValue.toFixed(precision)}`, inputType: 'number' };
                case 'decToFrac': {
                    const simplified = simplifyFraction(num, den);
                    const questionDecimal = parseFloat(decimalValue.toFixed(precision));
                    return { question: `Convert ${questionDecimal} to a fraction`, answer: simplified, type: 'Decimal to Fraction', explanation: `${questionDecimal} is the decimal for ${simplified}`, inputType: 'text' };
                }
                case 'fracToPerc': {
                    const roundedPercent = parseFloat(percentValue.toFixed(Math.max(0, precision - 2)));
                    return { question: `Convert ${num}/${den} to a percent (round to ${Math.max(0, precision - 2)} decimal places)`, answer: roundedPercent, type: 'Fraction to Percent', explanation: `${num}/${den} = ${decimalValue} ≈ ${roundedPercent}%`, inputType: 'number' };
                }
                case 'percToFrac': {
                    const simplified = simplifyFraction(num, den);
                    const places = Math.max(2, precision);
                    const questionPercent = parseFloat(percentValue.toFixed(places));
                    return { question: `Convert ${questionPercent}% to a fraction`, answer: simplified, type: 'Percent to Fraction', explanation: `${questionPercent}% ≈ ${questionPercent}/100 = ${simplified}`, inputType: 'text' };
                }
                case 'decToPerc': { 
                    const places = Math.max(2, precision);
                    const d = parseFloat(decimalValue.toFixed(places)); 
                    return { question: `Convert the decimal ${d} to a percent`, answer: parseFloat((d * 100).toFixed(places - 2)), type: 'Decimal to Percent', explanation: `${d} × 100 = ${d * 100}%`, inputType: 'number' }; 
                }
                case 'percToDec': {
                    const places = Math.max(2, precision);
                    const questionPercent = parseFloat(percentValue.toFixed(places));
                    const answer = parseFloat(decimalValue.toFixed(places + 2));
                    const question = `Convert ${questionPercent}% to a decimal (round to ${places + 2} places)`;
                    const explanation = `${questionPercent}% ÷ 100 = ${answer}`;
                    return { question, answer, type: 'Percent to Decimal', explanation, inputType: 'number' };
                }
            }
        }
        
        let divisor: number;
        let testNum: number;
        let min = 100, max = 999;
        
        const easyDivisors = [3, 4, 5, 6];
        const mediumDivisors = [3, 4, 6, 8, 9];
        const hardDivisors = [7, 8, 9, 12, 13];
        const bonusHardDivisors = [11];

        if (difficulty === 'Easy') {
            divisor = easyDivisors[Math.floor(Math.random() * easyDivisors.length)];
            min = 100;
            max = 999;
            if (divisor === 5) { min = 10; max = 99; }
        } else if (difficulty === 'Medium') {
            divisor = mediumDivisors[Math.floor(Math.random() * mediumDivisors.length)];
            min = 1000; max = 9999;
        } else { // Hard
            if (hardModeBonus > 0 && Math.random() < 0.3) { // 30% chance for a bonus question
                divisor = bonusHardDivisors[Math.floor(Math.random() * bonusHardDivisors.length)];
            } else {
                divisor = hardDivisors[Math.floor(Math.random() * hardDivisors.length)];
            }
            min = 10000 + (hardModeBonus * 1000); max = 99999 + (hardModeBonus * 10000);
        }

        const evenOnlyDivisors = [4, 6, 8, 12];
        testNum = Math.floor(Math.random() * (max - min + 1)) + min;
        if (evenOnlyDivisors.includes(divisor) && testNum % 2 !== 0) {
            testNum += 1;
        }

        const isDivisible = testNum % divisor === 0;
        const explanation = getDivisibilityExplanation(testNum, divisor, isDivisible);

        return { question: `Is ${testNum} divisible by ${divisor}?`, answer: isDivisible ? 'yes' : 'no', type: 'Divisibility Rules', explanation, inputType: 'buttons', options: ['yes', 'no'] };
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

    let generator: () => Problem;
    if (level === 1) generator = generateLevel1Problem;
    else if (level === 2) generator = generateLevel2Problem;
    else if (level === 3) generator = generateLevel3Problem;
    else generator = generateLevel1Problem; // Fallback

    return createUniqueProblem(generator, history);
};
