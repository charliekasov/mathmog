

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
    11: 121, 12: 144, 13: 169, 14: 196, 15: 225, 16: 256, 17: 289, 18: 324, 19: 361, 20: 400,
    30: 900, 40: 1600, 50: 2500, 60: 3600, 70: 4900, 80: 6400, 90: 8100, 100: 10000
};

export const perfectCubes: Record<number, number> = {
    1: 1, 2: 8, 3: 27, 4: 64, 5: 125, 6: 216, 7: 343, 8: 512, 9: 729, 10: 1000,
    20: 8000, 30: 27000, 40: 64000, 50: 125000, 60: 216000, 70: 343000, 80: 512000, 90: 729000, 100: 1000000
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
    } while (history.includes(problem.question.toString()) && attempt < 50); // Failsafe to prevent infinite loops
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
        case 7:
            let tempNum = num;
            const steps = [];
            while (tempNum > 99) {
                const lastDigit = tempNum % 10;
                const rest = Math.floor(tempNum / 10);
                const nextNum = rest - 2 * lastDigit;
                steps.push(`${rest} - 2×${lastDigit} = ${nextNum}`);
                tempNum = Math.abs(nextNum);
            }
            const finalResult = tempNum;
            return `${num} → ${steps.join(' → ')}. Since ${finalResult} is ${finalResult % 7 === 0 ? '' : 'not '}divisible by 7, the original number is ${isDivisible ? '' : 'not '}divisible by 7.`;
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
        default:
            return `${num} ${isDivisible ? 'is' : 'is not'} divisible by ${divisor}`;
    }
}

const generateLevel1Problem = (difficulty: Difficulty, hardModeBonus: number, history: string[]): Problem => {
    const problemTypes = ['square', 'cube', 'fraction', 'divisibility'];
    let type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    
    // Prevent fraction questions on hard mode
    if (difficulty === 'Hard' && type === 'fraction') {
        const alternateTypes = ['square', 'cube', 'divisibility'];
        type = alternateTypes[Math.floor(Math.random() * alternateTypes.length)];
    }

    // Make divisibility questions less common and non-recursive on Hard difficulty
    if (difficulty === 'Hard' && type === 'divisibility' && Math.random() < 0.5) {
        const alternateTypes = ['square', 'cube']; // Re-roll to something else
        type = alternateTypes[Math.floor(Math.random() * alternateTypes.length)];
    }


    if (type === 'square') {
        let num: number;
        if (difficulty === 'Easy') {
            const isUnderweighted = Math.random() < 0.1;
            num = isUnderweighted
                ? Math.floor(Math.random() * 3) + 1  // 1, 2, 3
                : Math.floor(Math.random() * 9) + 4; // 4-12
        } else if (difficulty === 'Medium') {
            num = Math.floor(Math.random() * 10) + 11; // 11-20
        } else { // Hard
            num = (Math.floor(Math.random() * 9) + 2) * 10; // 20, 30... 100
        }
        const answer = perfectSquares[num] || num * num;
        let explanation = `${num}² = ${num}×${num} = ${answer}`;
        if (difficulty === 'Hard' && num >= 20 && num % 10 === 0) {
            const base = num / 10;
            explanation = `(${num})² = (${base}×10)² = ${base}²×10² = ${base*base}×100 = ${answer}`;
        }
        return { question: `${num}² = ?`, answer, type: 'Perfect Squares', explanation, inputType: 'number' };
    } else if (type === 'cube') {
        let num: number;
        if (difficulty === 'Easy') {
            const isUnderweighted = Math.random() < 0.1;
             num = isUnderweighted
                ? Math.floor(Math.random() * 2) + 1 // 1, 2
                : Math.floor(Math.random() * 3) + 3; // 3, 4, 5
        } else if (difficulty === 'Medium') {
            num = Math.floor(Math.random() * 7) + 4; // 4-10
        } else { // Hard
            num = (Math.floor(Math.random() * 9) + 2) * 10; // 20, 30... 100
        }
        const answer = perfectCubes[num] || num * num * num;
        let explanation = `${num}³ = ${num}×${num}×${num} = ${answer}`;
        if (difficulty === 'Hard' && num >= 20 && num % 10 === 0) {
            const base = num / 10;
            explanation = `(${num})³ = (${base}×10)³ = ${base}³×10³ = ${base*base*base}×1000 = ${answer}`;
        }
        return { question: `${num}³ = ?`, answer, type: 'Perfect Cubes', explanation, inputType: 'number' };
    } else if (type === 'fraction') {
        const easyDenominators = [4, 5];
        const mediumDenominators = [3, 6, 8, 9];
        
        let denominators: number[];
        if (difficulty === 'Easy') {
            denominators = easyDenominators;
        } else { // Medium and Hard
            denominators = mediumDenominators;
        }
        
        let num: number, den: number;
        
        den = denominators[Math.floor(Math.random() * denominators.length)];
        const availableNumerators = fractionBasesByDenominator[den].numerators;
        num = availableNumerators[Math.floor(Math.random() * availableNumerators.length)];
        
        const { precision, repeating } = fractionBasesByDenominator[den];
        
        const allConversionTypes = ['fracToDec', 'decToFrac', 'fracToPerc', 'percToFrac', 'decToPerc', 'percToDec'];
        let conversionType: string;
        
        do {
            conversionType = allConversionTypes[Math.floor(Math.random() * allConversionTypes.length)];
         // Exclude DecToFrac/PercToFrac for repeating decimals, as it's ambiguous
        } while ( (conversionType === 'percToFrac' || conversionType === 'decToFrac') && repeating );

        const decimalValue = num / den;
        const percentValue = decimalValue * 100;

        if ((conversionType === 'percToFrac' || conversionType === 'decToFrac') && decimalValue % 1 === 0) {
          return generateLevel1Problem(difficulty, hardModeBonus, history);
        }

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
                const places = Math.min(4, Math.max(2, precision));
                const questionPercent = parseFloat(percentValue.toFixed(places));
                return { question: `Convert ${questionPercent}% to a fraction`, answer: simplified, type: 'Percent to Fraction', explanation: `${questionPercent}% ≈ ${questionPercent}/100 = ${simplified}`, inputType: 'text' };
            }
            case 'decToPerc': { 
                const d = parseFloat(decimalValue.toFixed(2));
                return { question: `Convert the decimal ${d} to a percent`, answer: parseFloat((d * 100).toFixed(0)), type: 'Decimal to Percent', explanation: `${d} × 100 = ${d * 100}%`, inputType: 'number' }; 
            }
            case 'percToDec': {
                const places = Math.max(2, Math.min(4, precision));
                const questionPercent = parseFloat(percentValue.toFixed(places));
                const question = `Convert ${questionPercent}% to a decimal (round to ${places} places)`;
                const answer = parseFloat(decimalValue.toFixed(places));
                const explanation = `${questionPercent}% ÷ 100 = ${answer}`;
                return { question, answer, type: 'Percent to Decimal', explanation, inputType: 'number' };
            }
            default:
                // Fallback in case of an unexpected conversionType
                return generateLevel1Problem(difficulty, hardModeBonus, history);
        }
    } else { // divisibility
        let divisor: number;
        let testNum: number;
        let min = 100, max = 999;
        
        const easyDivisors = [3, 4, 5, 6, 9];
        const mediumDivisors = [3, 4, 6, 8, 9];
        const hardDivisors = [8, 9]; // NOTE: Removed 7, 11, 12 from here.

        if (difficulty === 'Easy') {
            divisor = easyDivisors[Math.floor(Math.random() * easyDivisors.length)];
            min = 100;
            max = 999;
            if (divisor === 5) { min = 10; max = 99; }
        } else if (difficulty === 'Medium') {
            divisor = mediumDivisors[Math.floor(Math.random() * mediumDivisors.length)];
            min = 1000; max = 9999;
        } else { // Hard
            divisor = hardDivisors[Math.floor(Math.random() * hardDivisors.length)];
            min = 10000 + (hardModeBonus * 1000); max = 99999 + (hardModeBonus * 10000);
        }

        const evenOnlyDivisors = [4, 6, 8, 12];
        testNum = Math.floor(Math.random() * (max - min + 1)) + min;
        if (evenOnlyDivisors.includes(divisor) && testNum % 2 !== 0) {
            testNum += 1;
        }
        
        if (divisor === 5 && testNum % 5 === 0) {
            testNum += (Math.random() < 0.5 ? 1 : -1);
        }

        const isDivisible = testNum % divisor === 0;
        const explanation = getDivisibilityExplanation(testNum, divisor, isDivisible);

        return { question: `Is ${testNum} divisible by ${divisor}?`, answer: isDivisible ? 'yes' : 'no', type: 'Divisibility Rules', explanation, inputType: 'buttons', options: ['yes', 'no'] };
    }
};

const generateMultiplicationProblem = (difficulty: Difficulty, hardModeBonus: number): Problem => {
    let aMin = 11, aMax = 29, bMin = 11, bMax = 29;
    if (difficulty === 'Medium') { aMin=21; aMax=69; bMin=11; bMax=39; }
    if (difficulty === 'Hard') { aMin=51 + (hardModeBonus*10); aMax=149 + (hardModeBonus*10); bMin=21; bMax=79; }
    
    const generateNonMultipleOf10 = (min: number, max: number) => {
        let num;
        do {
            num = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (num % 10 === 0);
        return num;
    };

    const a = generateNonMultipleOf10(aMin, aMax);
    const b = generateNonMultipleOf10(bMin, bMax);

    const roundDownA = Math.floor(a / 10) * 10;
    const roundDownB = Math.floor(b / 10) * 10;
    const roundUpA = Math.ceil(a / 10) * 10;
    const roundUpB = Math.ceil(b / 10) * 10;
    const bestEstimateA = Math.round(a / 10) * 10;
    const bestEstimateB = Math.round(b / 10) * 10;
    const lowerBound = roundDownA * roundDownB;
    const upperBound = roundUpA * roundUpB;
    const bestEstimate = bestEstimateA * bestEstimateB;

    const explanation = `A good way to estimate is to find the bounds. 
Lower bound: ${roundDownA} × ${roundDownB} = ${lowerBound}. 
Upper bound: ${roundUpA} × ${roundUpB} = ${upperBound}. 
A solid estimate is ${bestEstimateA} × ${bestEstimateB} = ${bestEstimate}. 
Your answer should be between ${lowerBound} and ${upperBound}. The exact answer is ${a*b}.`;
    
    return { question: `Estimate: ${a} × ${b}`, answer: a * b, type: 'Multiplication Estimation', explanation, inputType: 'number', tolerance: 0.20 };
}


const generateLevel2Problem = (difficulty: Difficulty, hardModeBonus: number, history: string[]): Problem => {
    try {
        const problemTypes = (difficulty === 'Easy') ? ['multiplication'] : ['multiplication', 'rootEstimation'];
        let type = problemTypes[Math.floor(Math.random() * problemTypes.length)];

        if (type === 'rootEstimation') {
            const isCubeRoot = difficulty === 'Hard' && Math.random() < 0.5;
            const table = isCubeRoot ? perfectCubes : perfectSquares;
            const bases = Object.keys(table).map(Number).sort((a,b) => a - b);
            
            let base: number;
            let nextBase: number;
            let questionWord = 'consecutive integers';
            
            if (isCubeRoot) { // Cube roots (Hard)
                 const validBases = bases.filter(b => b <= 10 && b > 0);
                 const baseIndex = Math.floor(Math.random() * (validBases.length - 1));
                 base = validBases[baseIndex];
                 nextBase = validBases[baseIndex + 1];
            } else { // Square roots
                if (difficulty === 'Easy') {
                    const validBases = bases.filter(b => b > 0 && b < 10);
                    const baseIndex = Math.floor(Math.random() * (validBases.length - 1));
                    base = validBases[baseIndex];
                    nextBase = validBases[baseIndex + 1];
                } else if (difficulty === 'Medium') {
                    const validBases = bases.filter(b => b > 0 && b < 20);
                    const baseIndex = Math.floor(Math.random() * (validBases.length - 1));
                    base = validBases[baseIndex];
                    nextBase = validBases[baseIndex + 1];
                } else { // Hard
                    const validBases = bases.filter(b => b >= 20 && b % 10 === 0 && b < 100);
                    const baseIndex = Math.floor(Math.random() * (validBases.length - 1));
                    base = validBases[baseIndex];
                    nextBase = validBases[baseIndex + 1]; // This will be base + 10
                    questionWord = 'multiples of ten';
                }
            }

            const lowerBound = table[base];
            const upperBound = table[nextBase];
            if (lowerBound === undefined || upperBound === undefined) {
                 // This case should not happen with the corrected logic, but as a failsafe:
                 return generateMultiplicationProblem(difficulty, hardModeBonus);
            }

            const num = Math.floor(Math.random() * (upperBound - lowerBound - 2)) + lowerBound + 1;
            
            const midPoint = (lowerBound + upperBound) / 2;
            const closerInt = num < midPoint ? base : nextBase;
            
            const questionTextParts = [`${isCubeRoot ? '∛' : '√'}${num} is between the ${questionWord}`, `and`, `, and is closer to`];
            const answerText = `${base},${nextBase},${closerInt}`;
            const explanation = isCubeRoot 
                ? `∛${num} ≈ ${Math.cbrt(num).toFixed(2)}. It's between ${base} (${base}³=${lowerBound}) and ${nextBase} (${nextBase}³=${upperBound}). The midpoint is ${midPoint.toFixed(1)}, and ${num} is closer to ${closerInt}.`
                : `√${num} ≈ ${Math.sqrt(num).toFixed(2)}. It's between ${base} (${base}²=${lowerBound}) and ${nextBase} (${nextBase}²=${upperBound}). The midpoint is ${midPoint.toFixed(1)}, and ${num} is closer to ${closerInt}.`;
            
            return { question: questionTextParts, answer: answerText, type: `Root Estimation`, explanation, inputType: 'multi-text', placeholder: "a,b,c" };
        }
        
        // Fallback to Multiplication if root estimation fails or is not chosen
        return generateMultiplicationProblem(difficulty, hardModeBonus);
    } catch (error) {
        console.error("Error generating Level 2 problem, falling back to multiplication", error);
        // Failsafe: if anything goes wrong, generate a simple multiplication problem
        return generateMultiplicationProblem(difficulty, hardModeBonus);
    }
};

const generateLevel3Problem = (difficulty: Difficulty, hardModeBonus: number, history: string[]): Problem => {
    let type: string;

    const easyOps = ['mul_4', 'div_4', 'mul_5', 'div_5', 'mul_9'];
    const mediumOps = ['mul_8', 'mul_12_15', 'adv_div'];
    const hardOps = ['mul_9_11_19_99', 'adv_div'];

    if (difficulty === 'Easy') {
        type = easyOps[Math.floor(Math.random() * easyOps.length)];
    } else if (difficulty === 'Medium') {
        type = mediumOps[Math.floor(Math.random() * mediumOps.length)];
    } else {
        type = hardOps[Math.floor(Math.random() * hardOps.length)];
    }

    switch (type) {
        case 'adv_div': {
            const divisors = (difficulty === 'Medium') ? [7, 11, 12] : [7, 11, 12];
            const divisor = divisors[Math.floor(Math.random() * divisors.length)];
            let min, max;
            if (difficulty === 'Medium') {
                min = 100; max = 2000;
            } else { // Hard
                min = 2000 + (hardModeBonus * 1000); max = 15000 + (hardModeBonus * 5000);
            }
            const testNum = Math.floor(Math.random() * (max - min + 1)) + min;
            const isDivisible = testNum % divisor === 0;
            const explanation = getDivisibilityExplanation(testNum, divisor, isDivisible);
            return { question: `Is ${testNum} divisible by ${divisor}?`, answer: isDivisible ? 'yes' : 'no', type: 'Advanced Divisibility', explanation, inputType: 'buttons', options: ['yes', 'no'] };
        }
        case 'mul_4': {
            const num = Math.floor(Math.random() * (99 - 10 + 1)) + 10;
            const answer = num * 4;
            const explanation = `${num} × 4 = ${num}×2×2 = ${num*2}×2 = ${answer}`;
            return { question: `${num} × 4 = ?`, answer, type: 'Strategic Multiplication', explanation, inputType: 'number' };
        }
        case 'div_4': {
            const num = (Math.floor(Math.random() * (50 - 10 + 1)) + 10) * 4; // Ensure it's divisible
            const answer = num / 4;
            const explanation = `${num} / 4 = ${num}/2/2 = ${num/2}/2 = ${answer}`;
            return { question: `${num} / 4 = ?`, answer, type: 'Strategic Division', explanation, inputType: 'number' };
        }
        case 'mul_5': {
            const num = (Math.floor(Math.random() * (100 - 20 + 1)) + 20) * 2; // Ensure num is even for simpler division
            const answer = num * 5;
            const explanation = `${num} × 5 = ${num} × 10 / 2 = ${num * 10} / 2 = ${answer}`;
            return { question: `${num} × 5 = ?`, answer, type: 'Strategic Multiplication', explanation, inputType: 'number' };
        }
        case 'div_5': {
            const num = (Math.floor(Math.random() * (50 - 10 + 1)) + 10) * 10; // Ensure it ends in 0
            const answer = num / 5;
            const explanation = `${num} / 5 = (${num} / 10) × 2 = ${num / 10} × 2 = ${answer}`;
            return { question: `${num} / 5 = ?`, answer, type: 'Strategic Division', explanation, inputType: 'number' };
        }
        case 'mul_9': {
            const num = Math.floor(Math.random() * (99 - 10 + 1)) + 10; // Two-digit number for Easy
            const answer = num * 9;
            const explanation = `${num} × 9 = ${num} × (10 - 1) = ${num*10} - ${num} = ${answer}`;
            return { question: `${num} × 9 = ?`, answer, type: 'Strategic Multiplication', explanation, inputType: 'number' };
        }
        case 'mul_8': {
            const numDigits = 2; // Medium only
            const min = Math.pow(10, numDigits - 1);
            const max = Math.pow(10, numDigits) - 1;
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            const answer = num * 8;
            const explanation = `${num} × 8 = ${num}×2×2×2 = ${num*2}×2×2 = ${num*4}×2 = ${answer}`;
            return { question: `${num} × 8 = ?`, answer, type: 'Strategic Multiplication', explanation, inputType: 'number' };
        }
        case 'mul_12_15': {
            const multiplier = [12, 15][Math.floor(Math.random() * 2)];
            const num = Math.floor(Math.random() * (70 - 30 + 1)) + 30;
            const answer = num * multiplier;
            let explanation = `${num} × ${multiplier} = ${answer}`;
            if (multiplier === 12) explanation = `${num} × 12 = ${num} × (10 + 2) = ${num*10} + ${num*2} = ${answer}`;
            if (multiplier === 15) explanation = `${num} × 15 = ${num} × (10 + 5) = ${num*10} + (${num*10} / 2) = ${answer}`;
            return { question: `${num} × ${multiplier} = ?`, answer, type: 'Strategic Multiplication', explanation, inputType: 'number' };
        }
        case 'mul_9_11_19_99': {
            const multiplier = [9, 11, 19, 99][Math.floor(Math.random() * 4)];
            const numMin = 50 + (hardModeBonus * 5);
            const numMax = 100 + (hardModeBonus * 5);
            const num = Math.floor(Math.random() * (numMax - numMin + 1)) + numMin;
            const answer = num * multiplier;
            let explanation = `${num} × ${multiplier} = ${answer}`;
            if (multiplier === 9) explanation = `${num} × 9 = ${num} × (10 - 1) = ${num*10} - ${num} = ${answer}`;
            if (multiplier === 11) explanation = `${num} × 11 = ${num*10} + ${num} = ${answer}`;
            if (multiplier === 19) explanation = `${num} × 19 = ${num} × (20 - 1) = ${num*20} - ${num} = ${answer}`;
            if (multiplier === 99) explanation = `${num} × 99 = ${num} × (100 - 1) = ${num*100} - ${num} = ${answer}`;
            return { question: `${num} × ${multiplier} = ?`, answer, type: 'Strategic Multiplication', explanation, inputType: 'number' };
        }
        default:
             // Fallback to a known good state
            return generateLevel3Problem(difficulty, hardModeBonus, history);
    }
};

export const generateProblem = (level: number, difficulty: Difficulty, hardModeBonus: number, history: string[]): Problem => {
    console.log(`Generating problem for Level: ${level}, Difficulty: ${difficulty}`);
    let generatorFunction: (difficulty: Difficulty, hardModeBonus: number, history: string[]) => Problem;

    switch (level) {
        case 1:
            generatorFunction = generateLevel1Problem;
            break;
        case 2:
            generatorFunction = generateLevel2Problem;
            break;
        case 3:
            generatorFunction = generateLevel3Problem;
            break;
        default:
            throw new Error(`Invalid level requested: ${level}. Cannot generate problem.`);
    }

    const generator = () => generatorFunction(difficulty, hardModeBonus, history);
    return createUniqueProblem(generator, history);
};


    