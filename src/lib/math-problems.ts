

import type { Difficulty, Problem } from '@/lib/types';

// Helper for simplifying fractions
const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
export const simplifyFraction = (num: number, den: number) => {
    const common = gcd(num, den);
    return `${num / common}/${den / common}`;
};

// Helper data for the fraction generator
const fractionBasesByDenominator: Record<number, { numerators: number[], precision: number, repeating: boolean, answers?: Record<number, number[]> }> = {
    3: { 
        numerators: [1, 2], 
        precision: 2, 
        repeating: true,
        answers: {
            1: [0.33],
            2: [0.66, 0.67]
        }
    },
    4: { numerators: [1, 3], precision: 2, repeating: false },
    5: { numerators: [1, 2, 3, 4], precision: 1, repeating: false },
    6: { 
        numerators: [1, 5], 
        precision: 3, 
        repeating: true,
        answers: {
            1: [0.166, 0.167],
            5: [0.833]
        }
    },
    7: { 
        numerators: [1, 2, 3, 4, 5, 6], 
        precision: 3, 
        repeating: true,
        answers: {
            1: [0.14, 0.142, 0.143],
            2: [0.28, 0.285, 0.286],
            3: [0.42, 0.428, 0.429],
            4: [0.57, 0.571, 0.572],
            5: [0.71, 0.714, 0.715],
            6: [0.85, 0.857, 0.858],
        }
    },
    8: { numerators: [1, 3, 5, 7], precision: 3, repeating: false },
    9: { numerators: [1, 2, 4, 5, 7, 8], precision: 2, repeating: true,
        answers: {
            1: [0.11],
            2: [0.22],
            4: [0.44],
            5: [0.55, 0.56],
            7: [0.77, 0.78],
            8: [0.88, 0.89],
        }
     },
};

// Reference data
export const commonFractionConversions = [
    { frac: '1/3', decimal: '0.33', percent: '33.3%' },
    { frac: '2/3', decimal: '0.66 or 0.67', percent: '66.6% or 66.7%' },
    { frac: '1/4', decimal: '0.25', percent: '25%' },
    { frac: '3/4', decimal: '0.75', percent: '75%' },
    { frac: '1/5', decimal: '0.2', percent: '20%' },
    { frac: '2/5', decimal: '0.4', percent: '40%' },
    { frac: '3/5', decimal: '0.6', percent: '60%' },
    { frac: '4/5', decimal: '0.8', percent: '80%' },
    { frac: '1/6', decimal: '0.166 or 0.167', percent: '16.6% or 16.7%' },
    { frac: '5/6', decimal: '0.833', percent: '83.3%' },
    { frac: '1/7', decimal: '0.14 or 0.142 or 0.143', percent: '14.2% or 14.3%' },
    { frac: '2/7', decimal: '0.28 or 0.285 or 0.286', percent: '28.5% or 28.6%' },
    { frac: '3/7', decimal: '0.42 or 0.428 or 0.429', percent: '42.8% or 42.9%' },
    { frac: '4/7', decimal: '0.57 or 0.571 or 0.572', percent: '57.1% or 57.2%' },
    { frac: '5/7', decimal: '0.71 or 0.714 or 0.715', percent: '71.4% or 71.5%' },
    { frac: '6/7', decimal: '0.85 or 0.857 or 0.858', percent: '85.7% or 85.8%' },
    { frac: '1/8', decimal: '0.125', percent: '12.5%' },
    { frac: '3/8', decimal: '0.375', percent: '37.5%' },
    { frac: '5/8', decimal: '0.625', percent: '62.5%' },
    { frac: '7/8', decimal: '0.875', percent: '87.5%' },
    { frac: '1/9', decimal: '0.11', percent: '11.1%' },
    { frac: '2/9', decimal: '0.22', percent: '22.2%' },
    { frac: '4/9', decimal: '0.44', percent: '44.4%' },
    { frac: '5/9', decimal: '0.55 or 0.56', percent: '55.5% or 55.6%' },
    { frac: '7/9', decimal: '0.77 or 0.78', percent: '77.7% or 77.8%' },
    { frac: '8/9', decimal: '0.88 or 0.89', percent: '88.8% or 88.9%' }
];

export const perfectSquares: Record<number, number> = {
    1: 1, 2: 4, 3: 9, 4: 16, 5: 25, 6: 36, 7: 49, 8: 64, 9: 81, 10: 100,
    11: 121, 12: 144, 13: 169, 14: 196, 15: 225, 16: 256, 17: 289, 18: 324, 19: 361, 20: 400,
    30: 900, 40: 1600, 50: 2500, 60: 3600, 70: 4900, 80: 6400, 90: 8100, 100: 10000
};

export const perfectCubes: Record<number, number> = {
    1: 1, 2: 8, 3: 27, 4: 64, 5: 125, 6: 216, 7: 343, 8: 512, 9: 729, 10: 1000,
    20: 8000, 30: 27000, 40: 64000, 50: 125000, 60: 216000, 70: 343000, 80: 512000, 90: 729000, 100: 1000000
};


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
            return `For ${num}, we only need to check the last two digits: ${lastTwo}. Since ${lastTwo} is ${lastTwo % 4 === 0 ? '' : 'not '}divisible by 4, the number ${num} is ${isDivisible ? '' : 'not '}divisible by 4.`;
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
            return `For ${num}, we only need to check the last three digits: ${lastThree}. Since ${lastThree} is ${lastThree % 8 === 0 ? '' : 'not '}divisible by 8, the number ${num} is ${isDivisible ? '' : 'not '}divisible by 8. (You can also check by halving the number three times; if you get a whole number, it's divisible by 8.)`;
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

const generateMemorizedMultiplicationProblem = (difficulty: Difficulty, hardModeBonus: number): Problem => {
    let num1: number, num2: number;
    let pool: {n1: number[], n2: number[]}[] = [];

    if (difficulty === 'Easy') {
        pool = [
            { n1: [13, 14, 15, 16, 17, 18, 19], n2: [2, 3] },
            { n1: [14, 16, 18], n2: [4, 5] }
        ];
    } else if (difficulty === 'Medium') {
        pool = [
            { n1: [13, 15, 17, 19], n2: [4, 5] },
            { n1: [15, 24, 36], n2: [2, 3, 4, 5] },
            { n1: Array.from({length: 31}, (_, i) => i + 20).filter(n => n % 10 !== 0), n2: [2] } // 20-50, not ending in 0
        ];
    } else { // Hard
        pool = [
            { n1: [27, 32], n2: [2, 3, 4, 5] },
            { n1: Array.from({length: 49}, (_, i) => i + 51).filter(n => n % 10 !== 0), n2: [2] } // 51-99, not ending in 0
        ];
    }

    const selectedPool = pool[Math.floor(Math.random() * pool.length)];
    num1 = selectedPool.n1[Math.floor(Math.random() * selectedPool.n1.length)];
    num2 = selectedPool.n2[Math.floor(Math.random() * selectedPool.n2.length)];
    
    // Ensure num1 is the larger number for consistency in question format
    if (num1 < num2) {
      [num1, num2] = [num2, num1];
    }

    const answer = num1 * num2;
    const explanation = `${num1} × ${num2} = ${answer}. This is a useful multiplication to have memorized.`;
    return { question: `${num1} × ${num2} = ?`, answer, type: 'Memorized Multiplication', explanation, inputType: 'number' };
};


const generateLevel1Problem = (difficulty: Difficulty, hardModeBonus: number, history: string[]): Problem => {
    let problemTypes: string[];
    let type: string;

    if (difficulty === 'Easy') {
        problemTypes = ['square', 'cube', 'fraction', 'memorizedMultiplication'];
    } else if (difficulty === 'Medium') {
        problemTypes = ['fraction', 'square', 'cube', 'memorizedMultiplication'];
    } else { // Hard
        problemTypes = ['square', 'cube', 'memorizedMultiplication'];
    }
    
    // In Medium, make fractions appear ~50% of the time, and multiplication 20%
    if (difficulty === 'Medium' && Math.random() < 0.5) {
        type = 'fraction';
    } else if (difficulty === 'Medium' && Math.random() < 0.7) {
        type = 'memorizedMultiplication';
    }
    else {
        type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    }

    if (type === 'memorizedMultiplication') {
        return generateMemorizedMultiplicationProblem(difficulty, hardModeBonus);
    } else if (type === 'square') {
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
    } else { // fraction
        const easyDenominators = [4, 5];
        let mediumDenominators = [3, 6, 8, 9, 7];

        // Underweight thirds in medium mode
        if (Math.random() < 0.3) {
            mediumDenominators = [6, 8, 9, 7];
        }
        
        const denominators = difficulty === 'Easy' ? easyDenominators : mediumDenominators;
        
        let num: number, den: number;
        
        den = denominators[Math.floor(Math.random() * denominators.length)];
        const availableNumerators = fractionBasesByDenominator[den].numerators;
        num = availableNumerators[Math.floor(Math.random() * availableNumerators.length)];
        
        const { precision, repeating, answers: specificAnswers } = fractionBasesByDenominator[den];
        
        const easyConversionTypes = ['fracToDec', 'fracToPerc', 'decToFrac', 'percToDec'];
        const mediumConversionTypes = ['fracToDec', 'fracToPerc', 'decToFrac', 'percToFrac'];
        
        // In Easy, don't ask for fraction from a repeating decimal
        let conversionTypes = difficulty === 'Easy' ? easyConversionTypes : mediumConversionTypes;
        if (difficulty === 'Easy' && repeating) {
            conversionTypes = ['fracToDec', 'fracToPerc'];
        }
        if(difficulty === 'Medium') {
            if (repeating) {
                conversionTypes = ['fracToDec', 'fracToPerc', 'percToFrac'];
            } else {
                conversionTypes = ['decToFrac', 'percToFrac'];
            }
        }
        
        let conversionType = conversionTypes[Math.floor(Math.random() * conversionTypes.length)];

        const decimalValue = num / den;
        const percentValue = decimalValue * 100;
        
        if ((conversionType === 'percToFrac' || conversionType === 'decToFrac') && decimalValue % 1 === 0) {
          // Reroll if we get a whole number for a "to fraction" question
          return generateLevel1Problem(difficulty, hardModeBonus, history);
        }

        switch (conversionType) {
            case 'fracToDec': {
                const places = den === 7 ? 3 : precision;
                const questionText = `Convert ${num}/${den} to a decimal (${places} decimal places)`;
                const explanation = `${num}/${den} = ${num} ÷ ${den} ≈ ${decimalValue.toFixed(places)}`;
                let answer: number | number[];

                if (specificAnswers && specificAnswers[num]) {
                    answer = specificAnswers[num];
                } else if (repeating) {
                    const rounded = parseFloat(decimalValue.toFixed(precision));
                    const truncated = parseFloat(decimalValue.toString().substring(0, 2 + precision));
                    answer = [rounded, truncated].filter((v, i, a) => a.indexOf(v) === i); // Unique values
                } else {
                    answer = parseFloat(decimalValue.toFixed(precision));
                }
                return { question: questionText, answer, type: 'Fraction to Decimal', explanation, inputType: 'number' };
            }
            case 'decToFrac': {
                const simplified = simplifyFraction(num, den);
                const questionDecimal = parseFloat(decimalValue.toFixed(precision));
                return { question: `Convert ${questionDecimal} to a fraction`, answer: simplified, type: 'Decimal to Fraction', explanation: `${questionDecimal} is the decimal for ${simplified}`, inputType: 'text' };
            }
            case 'percToDec': {
                const percent = Math.floor(Math.random() * 90) + 10;
                const answer = percent / 100;
                return { question: `Convert ${percent}% to a decimal`, answer, type: 'Percent to Decimal', explanation: `${percent}% is ${percent}/100, which is ${answer}.`, inputType: 'number' };
            }
            case 'fracToPerc': {
                const percentPrecision = den === 7 || den === 6 ? 1 : Math.max(0, precision - 2);
                const questionText = `Convert ${num}/${den} to a percent (${percentPrecision} decimal places)`;
                const explanation = `${num}/${den} = ${decimalValue} ≈ ${(percentValue).toFixed(percentPrecision)}%`;
                let answer: number | number[];
                
                if (specificAnswers && specificAnswers[num]) {
                    answer = specificAnswers[num].map(d => parseFloat((d * 100).toFixed(percentPrecision)));
                } else if (repeating) {
                    const rounded = parseFloat(percentValue.toFixed(percentPrecision));
                    const truncatedNum = parseFloat(percentValue.toString().slice(0, (percentPrecision > 0 ? 3 : 2) + percentPrecision));
                    answer = [rounded, truncatedNum].filter((v, i, a) => a.indexOf(v) === i);
                } else {
                    answer = parseFloat(percentValue.toFixed(percentPrecision));
                }
                return { question: questionText, answer, type: 'Fraction to Percent', explanation, inputType: 'number' };
            }
            case 'percToFrac': {
                const simplified = simplifyFraction(num, den);
                const places = Math.min(4, Math.max(2, precision));
                const questionPercent = parseFloat(percentValue.toFixed(places));
                return { question: `Convert ${questionPercent}% to a fraction`, answer: simplified, type: 'Percent to Fraction', explanation: `${questionPercent}% ≈ ${questionPercent}/100 = ${simplified}`, inputType: 'text' };
            }
            default:
                // Fallback in case of an unexpected conversionType
                return generateLevel1Problem(difficulty, hardModeBonus, history);
        }
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

const generatePercentageProblem = (difficulty: Difficulty, hardModeBonus: number): Problem => {
    let percent: number;
    let base: number;
    let questionText: string;

    if (difficulty === 'Easy') {
        percent = [10, 15, 20, 25, 30, 40, 50, 60, 65, 75, 80, 90][Math.floor(Math.random() * 12)];
        base = (Math.floor(Math.random() * 15) + 2) * 100; // 200, 300... 1600
        questionText = `What is ${percent}% of ${base}?`;
    } else if (difficulty === 'Medium') {
        do {
            percent = Math.floor(Math.random() * 89) + 11; // 11-99
        } while (percent % 10 === 0 || percent % 5 === 0);
        base = (Math.floor(Math.random() * 15) + 2) * 100; // 200, 300... 1600
        questionText = `What is ${percent}% of ${base}?`;
    } else { // Hard
         do {
            percent = Math.floor(Math.random() * 89) + 11; // 11-99
        } while (percent % 10 === 0);
        base = Math.floor(Math.random() * 900) + 100; // 100-999
        if (base % 100 === 0) base += 1;
        questionText = `Estimate: ${percent}% of ${base}`;
    }

    const answer = (base * percent) / 100;
    const tenPercent = base / 10;
    const onePercent = base / 100;
    const tens = Math.floor(percent / 10);
    const ones = percent % 10;
    
    const explanation = `To find ${percent}% of ${base}, break it down. 
10% of ${base} is ${tenPercent.toFixed(2)}. 
1% of ${base} is ${onePercent.toFixed(2)}. 
So, ${percent}% = (${tens} × 10%) + (${ones} × 1%) = (${tens} × ${tenPercent.toFixed(2)}) + (${ones} × ${onePercent.toFixed(2)}) = ${tens*tenPercent} + ${ones*onePercent} = ${answer}.`;
    
    const problemType = 'Percentage Estimation';

    return { question: questionText, answer, type: problemType, explanation, inputType: 'number', tolerance: 0.20 };
};

const generateFractionEstimationProblem = (difficulty: Difficulty, hardModeBonus: number): Problem => {
    let num: number, den: number;

    if (difficulty === 'Medium') {
        const benchmarks = [1/4, 1/3, 1/2, 2/3, 3/4];
        const benchmark = benchmarks[Math.floor(Math.random() * benchmarks.length)];
        
        const baseDen = Math.floor(Math.random() * 30) + 20; // 20-49
        const baseNum = Math.round(baseDen * benchmark);
        
        const denOffset = Math.floor(Math.random() * 9) - 4; // -4 to 4
        const numOffset = Math.floor(Math.random() * 9) - 4; // -4 to 4

        den = baseDen + denOffset;
        num = baseNum + numOffset;
    } else { // Hard or Hard + Bonus
        if (hardModeBonus > 0 && Math.random() > 0.5) { // Improper Fraction
            num = Math.floor(Math.random() * 800) + 100; // 100-899
            den = Math.floor(Math.random() * (num * 0.9 - 20)) + 20; // Ensure den < num
        } else { // Proper Fraction
             num = Math.floor(Math.random() * 90) + 10; // 10-99
             den = Math.floor(Math.random() * 900) + 100; // 100-999
        }
    }
    
    // Ensure we don't get a simple fraction or an impossible one
    if (gcd(num, den) > 5 || num <= 10 || den <= 10) {
        return generateFractionEstimationProblem(difficulty, hardModeBonus);
    }
    
    const answer = num / den;
    const explanation = `To estimate ${num}/${den}, you can round to "friendly" numbers. For example, round ${num} to ${Math.round(num/10)*10} and ${den} to ${Math.round(den/10)*10}. Then ${Math.round(num/10)*10}/${Math.round(den/10)*10} gives you a simpler fraction to work with. The exact answer is ≈${answer.toFixed(3)}.`;

    return {
        question: `Estimate: ${num}/${den}`,
        answer: answer,
        type: 'Fraction Estimation',
        explanation: explanation,
        inputType: 'number',
        placeholder: 'e.g., 0.25',
        tolerance: 0.25,
    };
};


const generateLevel2Problem = (difficulty: Difficulty, hardModeBonus: number, history: string[]): Problem => {
    try {
        let problemTypes = ['multiplication', 'rootEstimation', 'percentage', 'fractionEstimation'];
        if (difficulty === 'Easy') {
            problemTypes = ['multiplication', 'rootEstimation', 'percentage'];
        }

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
        } else if (type === 'percentage') {
            return generatePercentageProblem(difficulty, hardModeBonus);
        } else if (type === 'fractionEstimation') {
            return generateFractionEstimationProblem(difficulty, hardModeBonus);
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

    const easyOps = ['mul_4', 'div_4', 'mul_5', 'div_5', 'mul_9', 'divisibility'];
    const mediumOps = ['mul_8', 'div_8', 'mul_12_15', 'div_4_rem', 'div_5_rem', 'divisibility'];
    
    let hardOps: string[];
    if (hardModeBonus > 0) {
      hardOps = ['adv_div', 'mul_9_11_19_99', 'div_8_rem', 'div_12', 'mul_25', 'square_ending_5', 'comp_mul'];
    } else {
      hardOps = ['div_8_rem', 'div_12', 'mul_25', 'square_ending_5', 'comp_mul'];
    }

    if (difficulty === 'Easy') {
        type = easyOps[Math.floor(Math.random() * easyOps.length)];
    } else if (difficulty === 'Medium') {
        type = mediumOps[Math.floor(Math.random() * mediumOps.length)];
    } else {
        type = hardOps[Math.floor(Math.random() * hardOps.length)];
    }

    switch (type) {
        case 'divisibility': {
            let divisor: number;
            let testNum: number;
            let min = 100, max = 999;
            
            const easyDivisors = [3, 4, 5, 6, 9];
            const mediumDivisors = [3, 4, 6, 8, 9];
            
            if (difficulty === 'Easy') {
                divisor = easyDivisors[Math.floor(Math.random() * easyDivisors.length)];
                min = 100;
                max = 999;
                if (divisor === 5) { min = 10; max = 99; }
            } else { // Medium
                divisor = mediumDivisors[Math.floor(Math.random() * mediumDivisors.length)];
                min = 1000; max = 9999;
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
            const problemType = 'Basic Divisibility';

            return { question: `Is ${testNum} divisible by ${divisor}?`, answer: isDivisible ? 'yes' : 'no', type: problemType, explanation, inputType: 'buttons', options: ['yes', 'no'] };
        }
        case 'adv_div': {
            const divisors = [7, 11];
            const divisor = divisors[Math.floor(Math.random() * divisors.length)];
            let min, max;
            min = 2000 + (hardModeBonus * 1000); max = 15000 + (hardModeBonus * 5000);
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
            const explanation = `${num} ÷ 4 = ${num}÷2÷2 = ${num/2}÷2 = ${answer}`;
            return { question: `${num} ÷ 4 = ?`, answer, type: 'Strategic Division', explanation, inputType: 'number' };
        }
        case 'div_4_rem': { // Medium
            let num;
            do {
                num = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
            } while (num % 4 === 0);
            const answer = num / 4;
            const explanation = `${num} ÷ 4 = ${num}÷2÷2 = ${num/2}÷2 = ${answer}`;
            return { question: `${num} ÷ 4 = ?`, answer, type: 'Strategic Division', explanation, inputType: 'number' };
        }
        case 'mul_5': {
            const num = (Math.floor(Math.random() * (100 - 20 + 1)) + 20) * 2; // Ensure num is even for simpler division
            const answer = num * 5;
            const explanation = `${num} × 5 = ${num} × 10 ÷ 2 = ${num * 10} ÷ 2 = ${answer}`;
            return { question: `${num} × 5 = ?`, answer, type: 'Strategic Multiplication', explanation, inputType: 'number' };
        }
        case 'div_5': {
            const num = (Math.floor(Math.random() * (50 - 10 + 1)) + 10) * 10; // Ensure it ends in 0
            const answer = num / 5;
            const explanation = `${num} ÷ 5 = (${num} ÷ 10) × 2 = ${num / 10} × 2 = ${answer}`;
            return { question: `${num} ÷ 5 = ?`, answer, type: 'Strategic Division', explanation, inputType: 'number' };
        }
        case 'div_5_rem': { // Medium
            let num;
            do {
                num = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
            } while (num % 5 === 0);
            const answer = num / 5;
            const explanation = `${num} ÷ 5 = (${num} * 2) ÷ 10 = ${num*2} ÷ 10 = ${answer}`;
            return { question: `${num} ÷ 5 = ?`, answer, type: 'Strategic Division', explanation, inputType: 'number' };
        }
        case 'mul_9': {
            const num = Math.floor(Math.random() * (99 - 10 + 1)) + 10; // Two-digit number for Easy
            const answer = num * 9;
            const explanation = `${num} × 9 = ${num} × (10 - 1) = ${num*10} - ${num} = ${answer}`;
            return { question: `${num} × 9 = ?`, answer, type: 'Strategic Multiplication', explanation, inputType: 'number' };
        }
        case 'mul_8': { // Medium
            const num = Math.floor(Math.random() * (99 - 13 + 1)) + 13;
            const answer = num * 8;
            const explanation = `${num} × 8 = ${num}×2×2×2 = ${num*2}×2×2 = ${num*4}×2 = ${answer}`;
            return { question: `${num} × 8 = ?`, answer, type: 'Strategic Multiplication', explanation, inputType: 'number' };
        }
        case 'div_8': { // Medium
            const factor = Math.floor(Math.random() * (999 / 8 - 100 / 8 + 1)) + 100 / 8;
            const num = Math.floor(factor * 8);
            const answer = num / 8;
            const explanation = `${num} ÷ 8 = ${num}÷2÷2÷2 = ${num/2}÷2÷2 = ${num/4}÷2 = ${answer}`;
            return { question: `${num} ÷ 8 = ?`, answer, type: 'Strategic Division', explanation, inputType: 'number' };
        }
         case 'div_8_rem': { // Hard
             let num;
            do {
                num = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
            } while (num % 8 === 0);
            const answer = num / 8;
            const explanation = `${num} ÷ 8 = ${num} ÷ 2 ÷ 2 ÷ 2 = ${num/2} ÷ 2 ÷ 2 = ${num/4} ÷ 2 = ${answer}`;
            return { question: `${num} ÷ 8 = ?`, answer, type: 'Strategic Division', explanation, inputType: 'number' };
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
        case 'div_12': { // Hard
            const factor = Math.floor(Math.random() * (999 / 12 - 100 / 12 + 1)) + 100 / 12;
            const num = Math.floor(factor * 12);
            const answer = num / 12;
            const explanation = `${num} ÷ 12 = ${num} ÷ 3 ÷ 4 = ${num/3} ÷ 4 = ${answer}`;
            return { question: `${num} ÷ 12 = ?`, answer, type: 'Strategic Division', explanation, inputType: 'number' };
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
        case 'mul_25': { // Hard
            const num = (Math.floor(Math.random() * (40 - 12 + 1)) + 12) * 4; // Ensure it's a multiple of 4
            const answer = num * 25;
            const explanation = `${num} × 25 = ${num} × 100 ÷ 4 = ${num * 100} ÷ 4 = ${answer}`;
            return { question: `${num} × 25 = ?`, answer, type: 'Strategic Multiplication', explanation, inputType: 'number' };
        }
        case 'square_ending_5': { // Hard
            const tens = Math.floor(Math.random() * 8) + 2; // 2 to 9
            const num = tens * 10 + 5; // 25, 35, ..., 95
            const answer = num * num;
            const explanation = `${num}²: Take the tens digit (${tens}), multiply by the next one (${tens+1}), which is ${tens * (tens + 1)}. Then append 25. Result: ${answer}`;
            return { question: `${num}² = ?`, answer, type: 'Strategic Squaring', explanation, inputType: 'number' };
        }
        case 'comp_mul': { // Hard
            const midpoint = (Math.floor(Math.random() * 8) + 2) * 10 + 5; // 25, 35, ... 95
            const diff = Math.floor(Math.random() * 4) + 1; // 1 to 4
            const num1 = midpoint - diff;
            const num2 = midpoint + diff;
            const answer = num1 * num2;
            const explanation = `${num1} × ${num2} is a complementary multiplication problem. It's (${midpoint} - ${diff}) × (${midpoint} + ${diff}), which simplifies to ${midpoint}² - ${diff}². That is ${midpoint*midpoint} - ${diff * diff} = ${answer}.`;
             return { question: `${num1} × ${num2} = ?`, answer, type: 'Strategic Multiplication', explanation, inputType: 'number' };
        }
        default:
             // Fallback to a known good state
            return generateLevel3Problem(difficulty, hardModeBonus, history);
    }
};

export const generateProblem = (level: number, difficulty: Difficulty, hardModeBonus: number, history: string[]): Problem => {
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
