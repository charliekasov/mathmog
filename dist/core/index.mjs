import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// src/core/math-problems.ts
var gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
var simplifyFraction = (num, den) => {
  if (den === 0) throw new RangeError("simplifyFraction: denominator must not be 0");
  const sign = num < 0 !== den < 0 ? -1 : 1;
  const absNum = Math.abs(num);
  const absDen = Math.abs(den);
  const common = gcd(absNum, absDen);
  const reducedNum = absNum / common;
  const reducedDen = absDen / common;
  return `${reducedNum === 0 ? 0 : sign * reducedNum}/${reducedDen}`;
};
var fractionBasesByDenominator = {
  3: {
    numerators: [1, 2],
    precision: 2,
    repeating: true,
    answers: {
      1: [0.3, 0.33, 0.333],
      2: [0.6, 0.66, 0.67, 0.666, 0.667]
    }
  },
  4: { numerators: [1, 3], precision: 2, repeating: false },
  5: { numerators: [1, 2, 3, 4], precision: 1, repeating: false },
  6: {
    numerators: [1, 5],
    precision: 3,
    repeating: true,
    answers: {
      1: [0.16, 0.17, 0.166, 0.167, 0.1666, 0.1667],
      5: [0.83, 0.833, 0.8333]
    }
  },
  7: {
    numerators: [1, 2, 3, 4, 5, 6],
    precision: 3,
    repeating: true,
    answers: {
      1: [0.14, 0.142, 0.143, 0.1428, 0.1429],
      2: [0.28, 0.29, 0.285, 0.286, 0.2857],
      3: [0.42, 0.43, 0.428, 0.429, 0.4285, 0.4286],
      4: [0.57, 0.571, 0.572, 0.5714],
      5: [0.71, 0.714, 0.715, 0.7142, 0.7143],
      6: [0.85, 0.86, 0.857, 0.858, 0.8571]
    }
  },
  8: { numerators: [1, 3, 5, 7], precision: 3, repeating: false },
  9: {
    numerators: [1, 2, 4, 5, 7, 8],
    precision: 2,
    repeating: true,
    answers: {
      1: [0.1, 0.11, 0.111],
      2: [0.2, 0.22, 0.222],
      4: [0.4, 0.44, 0.444],
      5: [0.5, 0.55, 0.56, 0.555, 0.556],
      7: [0.7, 0.77, 0.78, 0.777, 0.778],
      8: [0.8, 0.88, 0.89, 0.888, 0.889]
    }
  }
};
var commonFractionConversions = [
  { frac: "1/3", decimal: "0.33", percent: "33.3%" },
  { frac: "2/3", decimal: "0.66 or 0.67", percent: "66.6% or 66.7%" },
  { frac: "1/4", decimal: "0.25", percent: "25%" },
  { frac: "3/4", decimal: "0.75", percent: "75%" },
  { frac: "1/5", decimal: "0.2", percent: "20%" },
  { frac: "2/5", decimal: "0.4", percent: "40%" },
  { frac: "3/5", decimal: "0.6", percent: "60%" },
  { frac: "4/5", decimal: "0.8", percent: "80%" },
  { frac: "1/6", decimal: "0.166 or 0.167", percent: "16.6% or 16.7%" },
  { frac: "5/6", decimal: "0.833", percent: "83.3%" },
  { frac: "1/7", decimal: "0.14 or 0.142 or 0.143", percent: "14.2% or 14.3%" },
  { frac: "2/7", decimal: "0.28 or 0.285 or 0.286", percent: "28.5% or 28.6%" },
  { frac: "3/7", decimal: "0.42 or 0.428 or 0.429", percent: "42.8% or 42.9%" },
  { frac: "4/7", decimal: "0.57 or 0.571 or 0.572", percent: "57.1% or 57.2%" },
  { frac: "5/7", decimal: "0.71 or 0.714 or 0.715", percent: "71.4% or 71.5%" },
  { frac: "6/7", decimal: "0.85 or 0.857 or 0.858", percent: "85.7% or 85.8%" },
  { frac: "1/8", decimal: "0.125", percent: "12.5%" },
  { frac: "3/8", decimal: "0.375", percent: "37.5%" },
  { frac: "5/8", decimal: "0.625", percent: "62.5%" },
  { frac: "7/8", decimal: "0.875", percent: "87.5%" },
  { frac: "1/9", decimal: "0.11", percent: "11.1%" },
  { frac: "2/9", decimal: "0.22", percent: "22.2%" },
  { frac: "4/9", decimal: "0.44", percent: "44.4%" },
  { frac: "5/9", decimal: "0.55 or 0.56", percent: "55.5% or 55.6%" },
  { frac: "7/9", decimal: "0.77 or 0.78", percent: "77.7% or 77.8%" },
  { frac: "8/9", decimal: "0.88 or 0.89", percent: "88.8% or 88.9%" }
];
var perfectSquares = {
  1: 1,
  2: 4,
  3: 9,
  4: 16,
  5: 25,
  6: 36,
  7: 49,
  8: 64,
  9: 81,
  10: 100,
  11: 121,
  12: 144,
  13: 169,
  14: 196,
  15: 225,
  16: 256,
  17: 289,
  18: 324,
  19: 361,
  20: 400,
  24: 576,
  25: 625,
  27: 729,
  36: 1296,
  40: 1600,
  41: 1681,
  30: 900,
  50: 2500,
  60: 3600,
  70: 4900,
  80: 6400,
  90: 8100,
  100: 1e4
};
var perfectCubes = {
  1: 1,
  2: 8,
  3: 27,
  4: 64,
  5: 125,
  6: 216,
  7: 343,
  8: 512,
  9: 729,
  10: 1e3,
  20: 8e3,
  30: 27e3,
  40: 64e3,
  50: 125e3,
  60: 216e3,
  70: 343e3,
  80: 512e3,
  90: 729e3,
  100: 1e6
};
var perfectFourthPowers = {
  1: 1,
  2: 16,
  3: 81,
  4: 256,
  5: 625,
  6: 1296
};
var perfectFifthPowers = {
  1: 1,
  2: 32,
  3: 243,
  4: 1024,
  5: 3125
};
var superscriptMap = {
  "0": "\u2070",
  "1": "\xB9",
  "2": "\xB2",
  "3": "\xB3",
  "4": "\u2074",
  "5": "\u2075",
  "6": "\u2076",
  "7": "\u2077",
  "8": "\u2078",
  "9": "\u2079"
};
var toSuperscript = (n) => String(n).split("").map((char) => superscriptMap[char]).join("");
var generateMemorizedMultiplicationProblem = (difficulty) => {
  let num1, num2;
  let pool = [];
  if (difficulty === "Easy") {
    pool = [
      { n1: [13, 14, 16, 17, 18, 19], n2: [2, 3] },
      { n1: [15], n2: [3, 4] },
      { n1: [14, 16, 18], n2: [4, 5] },
      { n1: [24], n2: [2] },
      { n1: Array.from({ length: 31 }, (_, i) => i + 20).filter((n) => n % 10 !== 0), n2: [2] }
    ];
  } else if (difficulty === "Medium") {
    pool = [
      { n1: [13, 14, 17, 18, 19], n2: [3, 4, 5] },
      { n1: [15], n2: [5, 6, 7, 8, 9] },
      { n1: [16], n2: [2, 3, 4, 5, 6, 7, 8, 9] },
      { n1: [24], n2: [3, 4, 5] },
      { n1: [36], n2: [3, 4, 5] },
      { n1: Array.from({ length: 49 }, (_, i) => i + 51).filter((n) => n % 10 !== 0), n2: [2] }
    ];
  } else {
    pool = [
      { n1: [27, 32], n2: [3, 4, 5] }
    ];
  }
  const selectedPool = pool[Math.floor(Math.random() * pool.length)];
  num1 = selectedPool.n1[Math.floor(Math.random() * selectedPool.n1.length)];
  num2 = selectedPool.n2[Math.floor(Math.random() * selectedPool.n2.length)];
  if (num1 < num2) {
    [num1, num2] = [num2, num1];
  }
  const answer = num1 * num2;
  const explanation = `${num1} \xD7 ${num2} = ${answer}. This is a useful multiplication to have memorized.`;
  return { question: `${num1} \xD7 ${num2} = ?`, answer, type: "Memorized Multiplication", explanation, inputType: "number" };
};
var generateHigherPowersProblem = (difficulty) => {
  let problemSet;
  if (difficulty === "Medium") {
    problemSet = { "2^4": 16, "2^5": 32, "3^4": 81, "3^5": 243 };
  } else {
    problemSet = {
      "2^6": 64,
      "2^7": 128,
      "2^8": 256,
      "2^9": 512,
      "3^6": 729,
      "4^4": 256,
      "5^4": 625,
      "6^4": 1296,
      "24^2": 576,
      "25^2": 625,
      "27^2": 729,
      "36^2": 1296,
      "40^2": 1600,
      "41^2": 1681
    };
  }
  const questions = Object.keys(problemSet);
  const questionStr = questions[Math.floor(Math.random() * questions.length)];
  const answer = problemSet[questionStr];
  const [base, exponent] = questionStr.split("^").map(Number);
  const formattedExponent = toSuperscript(exponent);
  const formattedQuestion = `${base}${formattedExponent} = ?`;
  let explanation;
  if (exponent === 2) {
    explanation = `${base}\xB2 = ${base}\xD7${base} = ${answer}.`;
  } else {
    explanation = `${base}${formattedExponent} = ${answer}. This is a key power to have memorized.`;
  }
  return {
    question: formattedQuestion,
    answer,
    type: "Higher Powers & Squares",
    explanation,
    inputType: "number"
  };
};
var generateLevel1Problem = (difficulty, history) => {
  let problemTypes;
  if (difficulty === "Easy") {
    problemTypes = ["square", "cube", "fraction", "memorizedMultiplication"];
  } else if (difficulty === "Medium") {
    problemTypes = [
      "square",
      "square",
      "cube",
      "cube",
      "fraction",
      "fraction",
      "memorizedMultiplication",
      "memorizedMultiplication",
      "higherPowers"
    ];
  } else {
    problemTypes = ["square", "cube", "memorizedMultiplication", "higherPowers"];
  }
  const type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
  if (type === "higherPowers") {
    return generateHigherPowersProblem(difficulty);
  } else if (type === "memorizedMultiplication") {
    return generateMemorizedMultiplicationProblem(difficulty);
  } else if (type === "square") {
    let num;
    if (difficulty === "Easy") {
      const isUnderweighted = Math.random() < 0.1;
      num = isUnderweighted ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 9) + 4;
    } else if (difficulty === "Medium") {
      num = Math.floor(Math.random() * 10) + 11;
    } else {
      num = (Math.floor(Math.random() * 8) + 3) * 10;
    }
    const answer = perfectSquares[num] || num * num;
    let explanation = `${num}\xB2 = ${num}\xD7${num} = ${answer}`;
    if (difficulty === "Hard" && num >= 30 && num % 10 === 0) {
      const base = num / 10;
      explanation = `(${num})\xB2 = (${base}\xD710)\xB2 = ${base}\xB2\xD710\xB2 = ${base * base}\xD7100 = ${answer}`;
    }
    return { question: `${num}\xB2 = ?`, answer, type: "Perfect Squares", explanation, inputType: "number" };
  } else if (type === "cube") {
    let num;
    if (difficulty === "Easy") {
      const isUnderweighted = Math.random() < 0.1;
      num = isUnderweighted ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 3) + 3;
    } else if (difficulty === "Medium") {
      num = Math.floor(Math.random() * 7) + 4;
    } else {
      num = (Math.floor(Math.random() * 9) + 2) * 10;
    }
    const answer = perfectCubes[num] || num * num * num;
    let explanation = `${num}\xB3 = ${num}\xD7${num}\xD7${num} = ${answer}`;
    if (difficulty === "Hard" && num >= 20 && num % 10 === 0) {
      const base = num / 10;
      explanation = `(${num})\xB3 = (${base}\xD710)\xB3 = ${base}\xB3\xD710\xB3 = ${base * base * base}\xD71000 = ${answer}`;
    }
    return { question: `${num}\xB3 = ?`, answer, type: "Perfect Cubes", explanation, inputType: "number" };
  } else {
    const easyDenominators = [4, 5];
    let mediumDenominators = [3, 6, 8, 9, 7];
    if (Math.random() < 0.3) {
      mediumDenominators = [6, 8, 9, 7];
    }
    const denominators = difficulty === "Easy" ? easyDenominators : mediumDenominators;
    let num, den;
    den = denominators[Math.floor(Math.random() * denominators.length)];
    const availableNumerators = fractionBasesByDenominator[den].numerators;
    num = availableNumerators[Math.floor(Math.random() * availableNumerators.length)];
    const { precision, repeating, answers: specificAnswers } = fractionBasesByDenominator[den];
    const easyConversionTypes = ["fracToDec", "fracToPerc", "decToFrac", "percToDec"];
    const mediumConversionTypes = ["fracToDec", "fracToPerc", "decToFrac", "percToFrac"];
    let conversionTypes = difficulty === "Easy" ? easyConversionTypes : mediumConversionTypes;
    if (difficulty === "Easy" && repeating) {
      conversionTypes = ["fracToDec", "fracToPerc"];
    }
    if (difficulty === "Medium") {
      if (repeating) {
        conversionTypes = ["fracToDec", "fracToPerc", "percToFrac"];
      } else {
        conversionTypes = ["decToFrac", "percToFrac"];
      }
    }
    let conversionType = conversionTypes[Math.floor(Math.random() * conversionTypes.length)];
    const decimalValue = num / den;
    const percentValue = decimalValue * 100;
    if ((conversionType === "percToFrac" || conversionType === "decToFrac") && decimalValue % 1 === 0) {
      return generateLevel1Problem(difficulty);
    }
    switch (conversionType) {
      case "fracToDec": {
        const places = den === 7 ? 3 : precision;
        const questionText = `Convert ${num}/${den} to a decimal (${places} decimal places)`;
        const explanation = `${num}/${den} = ${num} \xF7 ${den} \u2248 ${decimalValue.toFixed(places)}`;
        const answer = specificAnswers && specificAnswers[num] ? specificAnswers[num] : parseFloat(decimalValue.toFixed(precision));
        return { question: questionText, answer, type: "Fraction to Decimal", explanation, inputType: "number" };
      }
      case "decToFrac": {
        const simplified = simplifyFraction(num, den);
        const questionDecimal = parseFloat(decimalValue.toFixed(precision));
        return { question: `Convert ${questionDecimal} to a fraction`, answer: simplified, type: "Decimal to Fraction", explanation: `${questionDecimal} is the decimal for ${simplified}`, inputType: "text" };
      }
      case "percToDec": {
        const percent = Math.floor(Math.random() * 90) + 10;
        const answer = percent / 100;
        return { question: `Convert ${percent}% to a decimal`, answer, type: "Percent to Decimal", explanation: `${percent}% is ${percent}/100, which is ${answer}.`, inputType: "number" };
      }
      case "fracToPerc": {
        const percentPrecision = den === 7 || den === 6 ? 1 : Math.max(0, precision - 2);
        const questionText = `Convert ${num}/${den} to a percent (${percentPrecision} decimal places)`;
        const explanation = `${num}/${den} = ${decimalValue} \u2248 ${percentValue.toFixed(percentPrecision)}%`;
        const answer = specificAnswers && specificAnswers[num] ? specificAnswers[num].map((d) => parseFloat((d * 100).toFixed(percentPrecision))) : parseFloat(percentValue.toFixed(percentPrecision));
        return { question: questionText, answer, type: "Fraction to Percent", explanation, inputType: "number" };
      }
      case "percToFrac": {
        const simplified = simplifyFraction(num, den);
        const places = Math.min(4, Math.max(2, precision));
        const questionPercent = parseFloat(percentValue.toFixed(places));
        return { question: `Convert ${questionPercent}% to a fraction`, answer: simplified, type: "Percent to Fraction", explanation: `${questionPercent}% \u2248 ${questionPercent}/100 = ${simplified}`, inputType: "text" };
      }
      default:
        return generateLevel1Problem(difficulty);
    }
  }
};
var getDivisibilityExplanation = (num, divisor, isDivisible) => {
  const digits = String(num).split("").map(Number);
  switch (divisor) {
    case 3:
      const sum = digits.reduce((a, b) => a + b, 0);
      return `${num} \u2192 ${digits.join(" + ")} = ${sum}. Since ${sum} is ${sum % 3 === 0 ? "" : "not "}divisible by 3, ${num} is ${isDivisible ? "" : "not "}divisible by 3.`;
    case 4:
      const lastTwo = num % 100;
      return `For ${num}, we only need to check the last two digits: ${lastTwo}. Since ${lastTwo} is ${lastTwo % 4 === 0 ? "" : "not "}divisible by 4, the number ${num} is ${isDivisible ? "" : "not "}divisible by 4.`;
    case 5:
      return `${num} \u2192 The number ends in ${num % 10}, so it is ${isDivisible ? "" : "not "}divisible by 5.`;
    case 6:
      const isEven = num % 2 === 0;
      const sumFor6 = digits.reduce((a, b) => a + b, 0);
      const isDivBy3 = sumFor6 % 3 === 0;
      return `${num} is ${isEven ? "even" : "odd"} and its digits sum to ${sumFor6} (which is ${isDivBy3 ? "" : "not "}divisible by 3). A number must be divisible by BOTH 2 and 3 to be divisible by 6. So, ${num} is ${isDivisible ? "" : "not "}divisible by 6.`;
    case 7:
      let tempNum = num;
      const steps = [];
      while (tempNum > 99) {
        const lastDigit = tempNum % 10;
        const rest = Math.floor(tempNum / 10);
        const nextNum = rest - 2 * lastDigit;
        steps.push(`${rest} - 2\xD7${lastDigit} = ${nextNum}`);
        tempNum = Math.abs(nextNum);
      }
      const finalResult = tempNum;
      return `${num} \u2192 ${steps.join(" \u2192 ")}. Since ${finalResult} is ${finalResult % 7 === 0 ? "" : "not "}divisible by 7, the original number is ${isDivisible ? "" : "not "}divisible by 7.`;
    case 8:
      const lastThree = num % 1e3;
      return `For ${num}, we only need to check the last three digits: ${lastThree}. Since ${lastThree} is ${lastThree % 8 === 0 ? "" : "not "}divisible by 8, the number ${num} is ${isDivisible ? "" : "not "}divisible by 8. (You can also check by halving the number three times; if you get a whole number, it's divisible by 8.)`;
    case 9:
      const sumFor9 = digits.reduce((a, b) => a + b, 0);
      return `${num} \u2192 ${digits.join(" + ")} = ${sumFor9}. Since ${sumFor9} is ${sumFor9 % 9 === 0 ? "" : "not "}divisible by 9, ${num} is ${isDivisible ? "" : "not "}divisible by 9.`;
    case 11:
      const alternatingSum = digits.reduce((acc, digit, index) => acc + digit * Math.pow(-1, index), 0);
      const alternatingSumStr = digits.map((d, i) => i > 0 ? i % 2 !== 0 ? ` - ${d}` : ` + ${d}` : `${d}`).join("");
      return `${num} \u2192 ${alternatingSumStr} = ${alternatingSum}. Since ${alternatingSum} is ${alternatingSum % 11 === 0 ? "" : "not "}divisible by 11, the number ${num} is ${isDivisible ? "" : "not "}divisible by 11.`;
    case 12:
      const isDivBy3For12 = digits.reduce((a, b) => a + b, 0) % 3 === 0;
      const isDivBy4For12 = num % 100 % 4 === 0;
      return `To be divisible by 12, a number must be divisible by both 3 and 4. For ${num}, it is ${isDivBy3For12 ? "" : "not "}divisible by 3 and ${isDivBy4For12 ? "" : "not "}divisible by 4. So, it is ${isDivisible ? "" : "not "}divisible by 12.`;
    default:
      return `${num} ${isDivisible ? "is" : "is not"} divisible by ${divisor}`;
  }
};
var createUniqueProblem = (generator, history) => {
  let problem;
  let attempt = 0;
  do {
    problem = generator();
    attempt++;
  } while (history.includes(problem.question.toString()) && attempt < 50);
  if (attempt >= 50 && history.includes(problem.question.toString())) {
    console.warn(
      "createUniqueProblem: returning a colliding problem after exhausting 50 retry attempts",
      { question: problem.question.toString(), historySize: history.length }
    );
  }
  return problem;
};
var generateMultiplicationProblem = (difficulty) => {
  let aMin = 11, aMax = 29, bMin = 11, bMax = 29;
  if (difficulty === "Medium") {
    aMin = 21;
    aMax = 69;
    bMin = 11;
    bMax = 39;
  }
  if (difficulty === "Hard") {
    aMin = 51;
    aMax = 149;
    bMin = 21;
    bMax = 79;
  }
  const generateNonMultipleOf10 = (min, max) => {
    let num = 0;
    let attempt = 0;
    do {
      num = Math.floor(Math.random() * (max - min + 1)) + min;
      attempt++;
    } while (num % 10 === 0 && attempt < 50);
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
Lower bound: ${roundDownA} \xD7 ${roundDownB} = ${lowerBound}. 
Upper bound: ${roundUpA} \xD7 ${roundUpB} = ${upperBound}. 
A solid estimate is ${bestEstimateA} \xD7 ${bestEstimateB} = ${bestEstimate}. 
Your answer should be between ${lowerBound} and ${upperBound}. The exact answer is ${a * b}.`;
  return { question: `Estimate: ${a} \xD7 ${b}`, answer: a * b, type: "Multiplication Estimation", explanation, inputType: "number", tolerance: 0.2 };
};
var generatePercentageProblem = (difficulty) => {
  let percent;
  let base;
  let questionText;
  let problemType = "Percentage Estimation";
  let tolerance = 0.2;
  if (difficulty === "Easy") {
    percent = [10, 15, 20, 25, 30, 40, 50, 60, 65, 75, 80, 90][Math.floor(Math.random() * 12)];
    base = (Math.floor(Math.random() * 15) + 2) * 100;
    questionText = `What is ${percent}% of ${base}?`;
  } else if (difficulty === "Medium") {
    let attempt = 0;
    do {
      percent = Math.floor(Math.random() * 89) + 11;
      attempt++;
    } while ((percent % 10 === 0 || percent % 5 === 0) && attempt < 50);
    base = (Math.floor(Math.random() * 15) + 2) * 100;
    questionText = `What is ${percent}% of ${base}?`;
  } else {
    let attempt = 0;
    do {
      percent = Math.floor(Math.random() * 89) + 11;
      attempt++;
    } while (percent % 10 === 0 && attempt < 50);
    base = Math.floor(Math.random() * 900) + 100;
    if (base % 100 === 0) base += 1;
    questionText = `Estimate: ${percent}% of ${base}`;
  }
  const answer = base * percent / 100;
  const tenPercent = base / 10;
  const onePercent = base / 100;
  const tens = Math.floor(percent / 10);
  const ones = percent % 10;
  const explanation = `To find ${percent}% of ${base}, break it down. 
10% of ${base} is ${tenPercent.toFixed(2)}. 
1% of ${base} is ${onePercent.toFixed(2)}. 
So, ${percent}% = (${tens} \xD7 10%) + (${ones} \xD7 1%) = (${tens} \xD7 ${tenPercent.toFixed(2)}) + (${ones} \xD7 ${onePercent.toFixed(2)}) = ${tens * tenPercent} + ${ones * onePercent} = ${answer}.`;
  return { question: questionText, answer, type: problemType, explanation, inputType: "number", tolerance };
};
var generateFractionEstimationProblem = (difficulty) => {
  let num, den;
  if (difficulty === "Medium") {
    const benchmarks = [1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4];
    const benchmark = benchmarks[Math.floor(Math.random() * benchmarks.length)];
    const baseDen = Math.floor(Math.random() * 30) + 20;
    const baseNum = Math.round(baseDen * benchmark);
    const denOffset = Math.floor(Math.random() * 9) - 4;
    const numOffset = Math.floor(Math.random() * 9) - 4;
    den = baseDen + denOffset;
    num = baseNum + numOffset;
  } else {
    if (Math.random() > 0.5) {
      num = Math.floor(Math.random() * 800) + 100;
      den = Math.floor(Math.random() * (num * 0.9 - 20)) + 20;
    } else {
      num = Math.floor(Math.random() * 90) + 10;
      den = Math.floor(Math.random() * 900) + 100;
    }
  }
  if (gcd(num, den) > 5 || num <= 10 || den <= 10) {
    return generateFractionEstimationProblem(difficulty);
  }
  const answer = num / den;
  const explanation = `To estimate ${num}/${den}, you can round to "friendly" numbers. For example, round ${num} to ${Math.round(num / 10) * 10} and ${den} to ${Math.round(den / 10) * 10}. Then ${Math.round(num / 10) * 10}/${Math.round(den / 10) * 10} gives you a simpler fraction to work with. The exact answer is \u2248${answer.toFixed(3)}.`;
  return {
    question: `Estimate: ${num}/${den}`,
    answer,
    type: "Fraction Estimation",
    explanation,
    inputType: "number",
    placeholder: "Enter a decimal, e.g. 0.75",
    tolerance: 0.25
  };
};
var generateLevel2Problem = (difficulty, history) => {
  try {
    let problemTypes = ["multiplication", "rootEstimation", "percentage", "fractionEstimation"];
    if (difficulty === "Easy") {
      problemTypes = ["multiplication", "rootEstimation", "percentage"];
    }
    let type = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    if (type === "rootEstimation") {
      const isCubeRoot = difficulty === "Hard" && Math.random() < 0.5;
      const table = isCubeRoot ? perfectCubes : perfectSquares;
      const bases = Object.keys(table).map(Number).sort((a, b) => a - b);
      let base;
      let nextBase;
      let questionWord = "consecutive integers";
      if (isCubeRoot) {
        const validBases = bases.filter((b) => b <= 10 && b > 0);
        const baseIndex = Math.floor(Math.random() * (validBases.length - 1));
        base = validBases[baseIndex];
        nextBase = validBases[baseIndex + 1];
      } else {
        if (difficulty === "Easy") {
          const validBases = bases.filter((b) => b > 0 && b < 10);
          const baseIndex = Math.floor(Math.random() * (validBases.length - 1));
          base = validBases[baseIndex];
          nextBase = validBases[baseIndex + 1];
        } else if (difficulty === "Medium") {
          const validBases = bases.filter((b) => b > 0 && b < 20);
          const baseIndex = Math.floor(Math.random() * (validBases.length - 1));
          base = validBases[baseIndex];
          nextBase = validBases[baseIndex + 1];
        } else {
          const validBases = bases.filter((b) => b >= 20 && b % 10 === 0 && b < 100);
          const baseIndex = Math.floor(Math.random() * (validBases.length - 1));
          base = validBases[baseIndex];
          nextBase = validBases[baseIndex + 1];
          questionWord = "multiples of ten";
        }
      }
      const lowerBound = table[base];
      const upperBound = table[nextBase];
      if (lowerBound === void 0 || upperBound === void 0) {
        return generateMultiplicationProblem(difficulty);
      }
      const num = Math.floor(Math.random() * (upperBound - lowerBound - 2)) + lowerBound + 1;
      const midPoint = (lowerBound + upperBound) / 2;
      const closerInt = num < midPoint ? base : nextBase;
      const questionTextParts = [`${isCubeRoot ? "\u221B" : "\u221A"}${num} is between the ${questionWord}`, `and`, `, and is closer to`];
      const answerText = `${base},${nextBase},${closerInt}`;
      const explanation = isCubeRoot ? `\u221B${num} \u2248 ${Math.cbrt(num).toFixed(2)}. It's between ${base} (${base}\xB3=${lowerBound}) and ${nextBase} (${nextBase}\xB3=${upperBound}). The midpoint is ${midPoint.toFixed(1)}, and ${num} is closer to ${closerInt}.` : `\u221A${num} \u2248 ${Math.sqrt(num).toFixed(2)}. It's between ${base} (${base}\xB2=${lowerBound}) and ${nextBase} (${nextBase}\xB2=${upperBound}). The midpoint is ${midPoint.toFixed(1)}, and ${num} is closer to ${closerInt}.`;
      return { question: questionTextParts, answer: answerText, type: `Root Estimation`, explanation, inputType: "multi-text", placeholder: "a,b,c" };
    } else if (type === "percentage") {
      return generatePercentageProblem(difficulty);
    } else if (type === "fractionEstimation") {
      return generateFractionEstimationProblem(difficulty);
    }
    return generateMultiplicationProblem(difficulty);
  } catch (error) {
    console.error("Error generating Level 2 problem, falling back to multiplication", error);
    return generateMultiplicationProblem(difficulty);
  }
};
var generateLevel3CaseByType = (type, difficulty) => {
  switch (type) {
    case "mul_4": {
      const [min, max] = difficulty === "Easy" ? [11, 30] : [30, 99];
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      const answer = num * 4;
      const explanation = `${num} \xD7 4 = ${num}\xD72\xD72 = ${num * 2}\xD72 = ${answer}`;
      return { question: `${num} \xD7 4 = ?`, answer, type: "Strategic Multiplication", explanation, inputType: "number" };
    }
    case "div_4": {
      let num;
      let answer;
      if (difficulty === "Easy") {
        const factor = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
        num = factor * 4;
        answer = factor;
      } else {
        const halves = Math.floor(Math.random() * (100 - 25 + 1)) + 25;
        num = halves * 2;
        answer = num / 4;
      }
      const explanation = `${num} \xF7 4 = ${num}\xF72\xF72 = ${num / 2}\xF72 = ${answer}`;
      return { question: `${num} \xF7 4 = ?`, answer, type: "Strategic Division", explanation, inputType: "number" };
    }
    case "mul_5": {
      const [min, max] = difficulty === "Easy" ? [11, 40] : [40, 99];
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      const answer = num * 5;
      const explanation = `${num} \xD7 5 = ${num} \xD7 10 \xF7 2 = ${num * 10} \xF7 2 = ${answer}`;
      return { question: `${num} \xD7 5 = ?`, answer, type: "Strategic Multiplication", explanation, inputType: "number" };
    }
    case "div_5": {
      let num;
      let answer;
      let explanation;
      if (difficulty === "Easy") {
        const factor = Math.floor(Math.random() * (60 - 10 + 1)) + 10;
        num = factor * 5;
        answer = factor;
        explanation = `${num} \xF7 5 = (${num} \xF7 10) \xD7 2 = ${num / 10} \xD7 2 = ${answer}`;
      } else {
        let attempt = 0;
        do {
          num = Math.floor(Math.random() * (199 - 50 + 1)) + 50;
          attempt++;
        } while (num % 5 === 0 && attempt < 50);
        answer = num / 5;
        explanation = `${num} \xF7 5 = (${num} \xD7 2) \xF7 10 = ${num * 2} \xF7 10 = ${answer}`;
      }
      return { question: `${num} \xF7 5 = ?`, answer, type: "Strategic Division", explanation, inputType: "number" };
    }
    case "mul_9": {
      const [min, max] = difficulty === "Easy" ? [11, 30] : [30, 99];
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      const answer = num * 9;
      const explanation = `${num} \xD7 9 = ${num} \xD7 (10 - 1) = ${num * 10} - ${num} = ${answer}`;
      return { question: `${num} \xD7 9 = ?`, answer, type: "Strategic Multiplication", explanation, inputType: "number" };
    }
    case "mul_8": {
      const num = Math.floor(Math.random() * (50 - 13 + 1)) + 13;
      const answer = num * 8;
      const explanation = `${num} \xD7 8 = ${num}\xD72\xD72\xD72 = ${num * 2}\xD72\xD72 = ${num * 4}\xD72 = ${answer}`;
      return { question: `${num} \xD7 8 = ?`, answer, type: "Strategic Multiplication", explanation, inputType: "number" };
    }
    case "div_8": {
      const factor = Math.floor(Math.random() * (50 - 10 + 1)) + 10;
      const num = factor * 8;
      const answer = factor;
      const explanation = `${num} \xF7 8 = ${num}\xF72\xF72\xF72 = ${num / 2}\xF72\xF72 = ${num / 4}\xF72 = ${answer}`;
      return { question: `${num} \xF7 8 = ?`, answer, type: "Strategic Division", explanation, inputType: "number" };
    }
    case "div_8_rem": {
      let num;
      let attempt = 0;
      do {
        num = Math.floor(Math.random() * (999 - 100 + 1)) + 100;
        attempt++;
      } while (num % 8 === 0 && attempt < 50);
      const answer = num / 8;
      const explanation = `${num} \xF7 8 = ${num} \xF7 2 \xF7 2 \xF7 2 = ${num / 2} \xF7 2 \xF7 2 = ${num / 4} \xF7 2 = ${answer}`;
      return { question: `${num} \xF7 8 = ?`, answer, type: "Strategic Division", explanation, inputType: "number" };
    }
    case "mul_11": {
      const num = Math.floor(Math.random() * (99 - 12 + 1)) + 12;
      const answer = num * 11;
      const A = Math.floor(num / 10);
      const B = num % 10;
      const sum = A + B;
      const explanation = sum <= 9 ? `${num} \xD7 11: place the digits as ${A}, (${A}+${B}=${sum}), ${B} \u2192 ${answer}` : `${num} \xD7 11: place ${A}, (${A}+${B}=${sum}), ${B}. Since ${sum} > 9, carry the 1 \u2192 ${answer}`;
      return { question: `${num} \xD7 11 = ?`, answer, type: "Strategic Multiplication", explanation, inputType: "number" };
    }
    case "mul_12_15": {
      const multiplier = [12, 15][Math.floor(Math.random() * 2)];
      const num = Math.floor(Math.random() * (50 - 12 + 1)) + 12;
      const answer = num * multiplier;
      let explanation = `${num} \xD7 ${multiplier} = ${answer}`;
      if (multiplier === 12) explanation = `${num} \xD7 12 = ${num} \xD7 (10 + 2) = ${num * 10} + ${num * 2} = ${answer}`;
      if (multiplier === 15) explanation = `${num} \xD7 15 = ${num} \xD7 (10 + 5) = ${num * 10} + (${num * 10} / 2) = ${answer}`;
      return { question: `${num} \xD7 ${multiplier} = ?`, answer, type: "Strategic Multiplication", explanation, inputType: "number" };
    }
    case "div_12": {
      const factor = Math.floor(Math.random() * (83 - 10 + 1)) + 10;
      const num = factor * 12;
      const answer = factor;
      const explanation = `${num} \xF7 12 = ${num} \xF7 3 \xF7 4 = ${num / 3} \xF7 4 = ${answer}`;
      return { question: `${num} \xF7 12 = ?`, answer, type: "Strategic Division", explanation, inputType: "number" };
    }
    case "mul_19": {
      const num = Math.floor(Math.random() * (50 - 11 + 1)) + 11;
      const answer = num * 19;
      const explanation = `${num} \xD7 19 = ${num} \xD7 (20 - 1) = ${num * 20} - ${num} = ${answer}`;
      return { question: `${num} \xD7 19 = ?`, answer, type: "Strategic Multiplication", explanation, inputType: "number" };
    }
    case "mul_99": {
      const num = Math.floor(Math.random() * (50 - 11 + 1)) + 11;
      const answer = num * 99;
      const explanation = `${num} \xD7 99 = ${num} \xD7 (100 - 1) = ${num * 100} - ${num} = ${answer}`;
      return { question: `${num} \xD7 99 = ?`, answer, type: "Strategic Multiplication", explanation, inputType: "number" };
    }
    case "mul_25": {
      const num = (Math.floor(Math.random() * (40 - 12 + 1)) + 12) * 4;
      const answer = num * 25;
      const explanation = `${num} \xD7 25 = ${num} \xD7 100 \xF7 4 = ${num * 100} \xF7 4 = ${answer}`;
      return { question: `${num} \xD7 25 = ?`, answer, type: "Strategic Multiplication", explanation, inputType: "number" };
    }
    case "square_ending_5": {
      const tens = Math.floor(Math.random() * 8) + 2;
      const num = tens * 10 + 5;
      const answer = num * num;
      const explanation = `${num}\xB2: Take the tens digit (${tens}), multiply by the next one (${tens + 1}), which is ${tens * (tens + 1)}. Then append 25. Result: ${answer}`;
      return { question: `${num}\xB2 = ?`, answer, type: "Strategic Squaring", explanation, inputType: "number" };
    }
    case "comp_mul": {
      const midpoint = (Math.floor(Math.random() * 8) + 2) * 10 + 5;
      const diff = Math.floor(Math.random() * 4) + 1;
      const num1 = midpoint - diff;
      const num2 = midpoint + diff;
      const answer = num1 * num2;
      const explanation = `${num1} \xD7 ${num2} is a complementary multiplication problem. It's (${midpoint} - ${diff}) \xD7 (${midpoint} + ${diff}), which simplifies to ${midpoint}\xB2 - ${diff}\xB2. That is ${midpoint * midpoint} - ${diff * diff} = ${answer}.`;
      return { question: `${num1} \xD7 ${num2} = ?`, answer, type: "Strategic Multiplication", explanation, inputType: "number" };
    }
    case "divisibility": {
      const easyDivisors = [3, 5, 6, 9];
      const mediumDivisors = [3, 4, 6, 8, 9];
      const divisors = difficulty === "Easy" ? easyDivisors : mediumDivisors;
      const divisor = divisors[Math.floor(Math.random() * divisors.length)];
      const [min, max] = difficulty === "Easy" ? [100, 999] : [1e3, 9999];
      const evenOnlyDivisors = [4, 6, 8, 12];
      let testNum = Math.floor(Math.random() * (max - min + 1)) + min;
      if (evenOnlyDivisors.includes(divisor) && testNum % 2 !== 0) {
        testNum += 1;
      }
      const isDivisible = testNum % divisor === 0;
      const explanation = getDivisibilityExplanation(testNum, divisor, isDivisible);
      return { question: `Is ${testNum} divisible by ${divisor}?`, answer: isDivisible ? "yes" : "no", type: "Basic Divisibility", explanation, inputType: "buttons", options: ["yes", "no"] };
    }
    case "adv_div": {
      const divisors = [7, 11];
      const divisor = divisors[Math.floor(Math.random() * divisors.length)];
      const testNum = Math.floor(Math.random() * (9999 - 1e3 + 1)) + 1e3;
      const isDivisible = testNum % divisor === 0;
      const explanation = getDivisibilityExplanation(testNum, divisor, isDivisible);
      return { question: `Is ${testNum} divisible by ${divisor}?`, answer: isDivisible ? "yes" : "no", type: "Advanced Divisibility", explanation, inputType: "buttons", options: ["yes", "no"] };
    }
    default:
      return { question: "0 + 0 = ?", answer: 0, type: "Fallback", explanation: "Fallback problem", inputType: "number" };
  }
};
var generateLevel3Problem = (difficulty, _history) => {
  const easyOps = ["mul_4", "div_4", "mul_5", "div_5", "mul_9", "divisibility"];
  const mediumOps = ["mul_4", "div_4", "mul_5", "div_5", "mul_8", "div_8", "mul_9", "mul_11", "mul_12_15", "divisibility"];
  const hardOps = ["adv_div", "mul_19", "mul_99", "div_8_rem", "div_12", "mul_25", "square_ending_5", "comp_mul"];
  let pool;
  if (difficulty === "Easy") pool = easyOps;
  else if (difficulty === "Medium") pool = mediumOps;
  else pool = hardOps;
  const type = pool[Math.floor(Math.random() * pool.length)];
  return generateLevel3CaseByType(type, difficulty);
};
var generateRootEstimationProblem = (difficulty) => {
  let rootType;
  if (difficulty === "Hard") {
    const types = ["square", "cube", "fourth", "fifth"];
    rootType = types[Math.floor(Math.random() * types.length)];
  } else {
    rootType = "square";
  }
  let table;
  let symbol;
  let powerLabel;
  let questionWord = "consecutive integers";
  switch (rootType) {
    case "cube":
      table = perfectCubes;
      symbol = "\u221B";
      powerLabel = "\xB3";
      break;
    case "fourth":
      table = perfectFourthPowers;
      symbol = "\u2074\u221A";
      powerLabel = "\u2074";
      break;
    case "fifth":
      table = perfectFifthPowers;
      symbol = "\u2075\u221A";
      powerLabel = "\u2075";
      break;
    default:
      table = perfectSquares;
      symbol = "\u221A";
      powerLabel = "\xB2";
  }
  const bases = Object.keys(table).map(Number).sort((a, b) => a - b);
  let base;
  let nextBase;
  if (rootType === "cube") {
    const validBases = bases.filter((b) => b <= 10 && b > 0);
    const baseIndex = Math.floor(Math.random() * (validBases.length - 1));
    base = validBases[baseIndex];
    nextBase = validBases[baseIndex + 1];
  } else if (rootType === "fourth") {
    const validBases = bases.filter((b) => b > 1 && b <= 6);
    const baseIndex = Math.floor(Math.random() * (validBases.length - 1));
    base = validBases[baseIndex];
    nextBase = validBases[baseIndex + 1];
  } else if (rootType === "fifth") {
    const validBases = bases.filter((b) => b > 1 && b <= 5);
    const baseIndex = Math.floor(Math.random() * (validBases.length - 1));
    base = validBases[baseIndex];
    nextBase = validBases[baseIndex + 1];
  } else {
    if (difficulty === "Easy") {
      const validBases = bases.filter((b) => b > 0 && b < 10);
      const baseIndex = Math.floor(Math.random() * (validBases.length - 1));
      base = validBases[baseIndex];
      nextBase = validBases[baseIndex + 1];
    } else if (difficulty === "Medium") {
      const validBases = bases.filter((b) => b > 0 && b < 20);
      const baseIndex = Math.floor(Math.random() * (validBases.length - 1));
      base = validBases[baseIndex];
      nextBase = validBases[baseIndex + 1];
    } else {
      const validBases = bases.filter((b) => b >= 20 && b % 10 === 0 && b < 100);
      const baseIndex = Math.floor(Math.random() * (validBases.length - 1));
      base = validBases[baseIndex];
      nextBase = validBases[baseIndex + 1];
      questionWord = "multiples of ten";
    }
  }
  const lowerBound = table[base];
  const upperBound = table[nextBase];
  if (lowerBound === void 0 || upperBound === void 0) {
    return generateMultiplicationProblem(difficulty);
  }
  const num = Math.floor(Math.random() * (upperBound - lowerBound - 2)) + lowerBound + 1;
  const midPoint = (lowerBound + upperBound) / 2;
  const closerInt = num < midPoint ? base : nextBase;
  const questionTextParts = [`${symbol}${num} is between the ${questionWord}`, `and`, `, and is closer to`];
  const answerText = `${base},${nextBase},${closerInt}`;
  let actualRoot;
  switch (rootType) {
    case "cube":
      actualRoot = Math.cbrt(num);
      break;
    case "fourth":
      actualRoot = Math.pow(num, 0.25);
      break;
    case "fifth":
      actualRoot = Math.pow(num, 0.2);
      break;
    default:
      actualRoot = Math.sqrt(num);
  }
  const explanation = `${symbol}${num} \u2248 ${actualRoot.toFixed(2)}. It's between ${base} (${base}${powerLabel}=${lowerBound}) and ${nextBase} (${nextBase}${powerLabel}=${upperBound}). The midpoint is ${midPoint.toFixed(1)}, and ${num} is closer to ${closerInt}.`;
  return { question: questionTextParts, answer: answerText, type: "Root Estimation", explanation, inputType: "multi-text", placeholder: "a,b,c" };
};
var generatePerfectSquareProblem_targeted = () => {
  const num = Math.floor(Math.random() * 20) + 1;
  const answer = num * num;
  const explanation = `${num}\xB2 = ${num}\xD7${num} = ${answer}`;
  return { question: `${num}\xB2 = ?`, answer, type: "Perfect Squares", explanation, inputType: "number" };
};
var generatePerfectCubeProblem_targeted = () => {
  const num = Math.floor(Math.random() * 10) + 1;
  const answer = num * num * num;
  const explanation = `${num}\xB3 = ${num}\xD7${num}\xD7${num} = ${answer}`;
  return { question: `${num}\xB3 = ?`, answer, type: "Perfect Cubes", explanation, inputType: "number" };
};
var generateFractionProblem_allDenominators = () => {
  const allDenominators = [3, 4, 5, 6, 7, 8, 9];
  const den = allDenominators[Math.floor(Math.random() * allDenominators.length)];
  const availableNumerators = fractionBasesByDenominator[den].numerators;
  const num = availableNumerators[Math.floor(Math.random() * availableNumerators.length)];
  const { precision, repeating, answers: specificAnswers } = fractionBasesByDenominator[den];
  let conversionTypes = ["fracToDec", "fracToPerc", "decToFrac", "percToFrac"];
  if (repeating) {
    conversionTypes = ["fracToDec", "fracToPerc", "percToFrac"];
  }
  const conversionType = conversionTypes[Math.floor(Math.random() * conversionTypes.length)];
  const decimalValue = num / den;
  const percentValue = decimalValue * 100;
  if ((conversionType === "percToFrac" || conversionType === "decToFrac") && decimalValue % 1 === 0) {
    return generateFractionProblem_allDenominators();
  }
  switch (conversionType) {
    case "fracToDec": {
      const places = den === 7 ? 3 : precision;
      const questionText = `Convert ${num}/${den} to a decimal (${places} decimal places)`;
      const explanation = `${num}/${den} = ${num} \xF7 ${den} \u2248 ${decimalValue.toFixed(places)}`;
      const answer = specificAnswers && specificAnswers[num] ? specificAnswers[num] : parseFloat(decimalValue.toFixed(precision));
      return { question: questionText, answer, type: "Fraction to Decimal", explanation, inputType: "number" };
    }
    case "decToFrac": {
      const simplified = simplifyFraction(num, den);
      const questionDecimal = parseFloat(decimalValue.toFixed(precision));
      return { question: `Convert ${questionDecimal} to a fraction`, answer: simplified, type: "Decimal to Fraction", explanation: `${questionDecimal} is the decimal for ${simplified}`, inputType: "text" };
    }
    case "fracToPerc": {
      const percentPrecision = den === 7 || den === 6 ? 1 : Math.max(0, precision - 2);
      const questionText = `Convert ${num}/${den} to a percent (${percentPrecision} decimal places)`;
      const explanation = `${num}/${den} = ${decimalValue} \u2248 ${percentValue.toFixed(percentPrecision)}%`;
      const answer = specificAnswers && specificAnswers[num] ? specificAnswers[num].map((d) => parseFloat((d * 100).toFixed(percentPrecision))) : parseFloat(percentValue.toFixed(percentPrecision));
      return { question: questionText, answer, type: "Fraction to Percent", explanation, inputType: "number" };
    }
    case "percToFrac": {
      const simplified = simplifyFraction(num, den);
      const places = Math.min(4, Math.max(2, precision));
      const questionPercent = parseFloat(percentValue.toFixed(places));
      return { question: `Convert ${questionPercent}% to a fraction`, answer: simplified, type: "Percent to Fraction", explanation: `${questionPercent}% \u2248 ${questionPercent}/100 = ${simplified}`, inputType: "text" };
    }
    default:
      return generateFractionProblem_allDenominators();
  }
};
var generateAdvancedSquareProblem_targeted = () => {
  const bases = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const num = bases[Math.floor(Math.random() * bases.length)];
  const answer = num * num;
  const base = num / 10;
  const explanation = `(${num})\xB2 = (${base}\xD710)\xB2 = ${base}\xB2\xD7100 = ${base * base}\xD7100 = ${answer}`;
  return { question: `${num}\xB2 = ?`, answer, type: "Perfect Squares", explanation, inputType: "number" };
};
var generateAdvancedCubeProblem_targeted = () => {
  const bases = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const num = bases[Math.floor(Math.random() * bases.length)];
  const answer = num * num * num;
  const base = num / 10;
  const explanation = `(${num})\xB3 = (${base}\xD710)\xB3 = ${base}\xB3\xD71000 = ${base * base * base}\xD71000 = ${answer}`;
  return { question: `${num}\xB3 = ?`, answer, type: "Perfect Cubes", explanation, inputType: "number" };
};
var generateHigherPowersProblem_all = () => {
  const allProblems = {
    "2^4": 16,
    "2^5": 32,
    "2^6": 64,
    "2^7": 128,
    "2^8": 256,
    "2^9": 512,
    "3^4": 81,
    "3^5": 243,
    "3^6": 729,
    "4^4": 256,
    "5^4": 625,
    "6^4": 1296
  };
  const questions = Object.keys(allProblems);
  const questionStr = questions[Math.floor(Math.random() * questions.length)];
  const answer = allProblems[questionStr];
  const [base, exponent] = questionStr.split("^").map(Number);
  const formattedExponent = toSuperscript(exponent);
  const formattedQuestion = `${base}${formattedExponent} = ?`;
  const explanation = `${base}${formattedExponent} = ${answer}. This is a key power to have memorized.`;
  return { question: formattedQuestion, answer, type: "Higher Powers & Squares", explanation, inputType: "number" };
};
var generateCommonMultiplesProblem_all = () => {
  const allPools = [
    { n1: [13, 14, 16, 17, 18, 19], n2: [2, 3] },
    { n1: [15], n2: [3, 4, 5, 6, 7, 8, 9] },
    { n1: [14, 16, 18], n2: [4, 5] },
    { n1: [24], n2: [2, 3, 4, 5] },
    { n1: [13, 14, 17, 18, 19], n2: [3, 4, 5] },
    { n1: [16], n2: [2, 3, 4, 5, 6, 7, 8, 9] },
    { n1: [36], n2: [3, 4, 5] },
    { n1: [27, 32], n2: [3, 4, 5] }
  ];
  const selectedPool = allPools[Math.floor(Math.random() * allPools.length)];
  let num1 = selectedPool.n1[Math.floor(Math.random() * selectedPool.n1.length)];
  let num2 = selectedPool.n2[Math.floor(Math.random() * selectedPool.n2.length)];
  if (num1 < num2) [num1, num2] = [num2, num1];
  const answer = num1 * num2;
  const explanation = `${num1} \xD7 ${num2} = ${answer}. This is a useful multiplication to have memorized.`;
  return { question: `${num1} \xD7 ${num2} = ?`, answer, type: "Memorized Multiplication", explanation, inputType: "number" };
};
var generateStrategicMulDivProblem = (difficulty) => {
  let ops;
  if (difficulty === "Easy") {
    ops = ["mul_4", "div_4", "mul_5", "div_5", "mul_9"];
  } else if (difficulty === "Medium") {
    ops = ["mul_4", "div_4", "mul_5", "div_5", "mul_8", "div_8", "mul_9", "mul_11", "mul_12_15"];
  } else {
    ops = ["mul_19", "mul_99", "div_8_rem", "div_12", "mul_25", "square_ending_5", "comp_mul"];
  }
  const type = ops[Math.floor(Math.random() * ops.length)];
  return generateLevel3CaseByType(type, difficulty);
};
var generateDivisibilityProblem_grouped = (divisors, difficulty) => {
  const divisor = divisors[Math.floor(Math.random() * divisors.length)];
  let min, max;
  if (difficulty === "Easy") {
    min = 100;
    max = 999;
  } else if (difficulty === "Medium") {
    min = 1e3;
    max = 9999;
  } else {
    min = 1e4;
    max = 99999;
  }
  const evenOnlyDivisors = [4, 6, 8, 12];
  let testNum = Math.floor(Math.random() * (max - min + 1)) + min;
  if (evenOnlyDivisors.includes(divisor) && testNum % 2 !== 0) {
    testNum += 1;
  }
  const isDivisible = testNum % divisor === 0;
  const explanation = getDivisibilityExplanation(testNum, divisor, isDivisible);
  return { question: `Is ${testNum} divisible by ${divisor}?`, answer: isDivisible ? "yes" : "no", type: "Divisibility", explanation, inputType: "buttons", options: ["yes", "no"] };
};
var generateTopicProblem = (topic, difficulty) => {
  switch (topic) {
    // Level 1 topics (ignore difficulty)
    case "perfect_squares":
      return generatePerfectSquareProblem_targeted();
    case "perfect_cubes":
      return generatePerfectCubeProblem_targeted();
    case "fraction_conversions":
      return generateFractionProblem_allDenominators();
    case "advanced_squares":
      return generateAdvancedSquareProblem_targeted();
    case "advanced_cubes":
      return generateAdvancedCubeProblem_targeted();
    case "higher_powers":
      return generateHigherPowersProblem_all();
    case "common_multiples":
      return generateCommonMultiplesProblem_all();
    // Level 2 topics (use difficulty)
    case "multiplication_estimation":
      return generateMultiplicationProblem(difficulty);
    case "root_estimation":
      return generateRootEstimationProblem(difficulty);
    case "fraction_estimation":
      return generateFractionEstimationProblem(difficulty);
    case "percentage_calculations":
      return generatePercentageProblem(difficulty);
    // Level 3 topics (use difficulty)
    case "strategic_mul_div":
      return generateStrategicMulDivProblem(difficulty);
    case "divisibility_3_6_9":
      return generateDivisibilityProblem_grouped([3, 6, 9], difficulty);
    case "divisibility_4_8":
      return generateDivisibilityProblem_grouped([4, 8], difficulty);
    case "divisibility_7":
      return generateDivisibilityProblem_grouped([7, 11], difficulty);
    default:
      throw new Error(`Unknown drill topic: ${topic}`);
  }
};
var generateProblem = (level, difficulty, history, topic) => {
  if (topic) {
    const generator2 = () => generateTopicProblem(topic, difficulty);
    return createUniqueProblem(generator2, history);
  }
  let generatorFunction;
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
  const generator = () => generatorFunction(difficulty, history);
  return createUniqueProblem(generator, history);
};

// src/core/drill-topics.ts
var DRILL_TOPIC_REGISTRY = [
  // Level 1: Memorize
  { id: "perfect_squares", label: "Perfect Squares (1-20)", level: 1, hasDifficulty: false, description: "Squares of numbers 1 through 20" },
  { id: "perfect_cubes", label: "Perfect Cubes (1-10)", level: 1, hasDifficulty: false, description: "Cubes of numbers 1 through 10" },
  { id: "fraction_conversions", label: "Fraction Conversions", level: 1, hasDifficulty: false, description: "All denominators (3-9), all conversion types" },
  { id: "advanced_squares", label: "Advanced Squares", level: 1, hasDifficulty: false, description: "Squares of 10, 20, 30...100" },
  { id: "advanced_cubes", label: "Advanced Cubes", level: 1, hasDifficulty: false, description: "Cubes of 10, 20, 30...100" },
  { id: "higher_powers", label: "Higher Powers", level: 1, hasDifficulty: false, description: "2^4-2^9, 3^4-3^6, 4^4, 5^4, 6^4" },
  { id: "common_multiples", label: "Common Multiples", level: 1, hasDifficulty: false, description: "13-36 times various multipliers" },
  // Level 2: Estimate
  { id: "multiplication_estimation", label: "Multiplication Estimation", level: 2, hasDifficulty: true, description: "Estimate products of multi-digit numbers" },
  { id: "root_estimation", label: "Root Estimation", level: 2, hasDifficulty: true, description: "Square roots, cube roots, and higher roots at Hard" },
  { id: "fraction_estimation", label: "Fraction Estimation", level: 2, hasDifficulty: true, description: "Estimate fraction values with 2-digit or 3-digit denominators" },
  { id: "percentage_calculations", label: "Percentage Calculations", level: 2, hasDifficulty: true, description: "Round, complex, or arbitrary number percentages" },
  // Level 3: Get Crafty
  { id: "strategic_mul_div", label: "Strategic Mult & Division", level: 3, hasDifficulty: true, description: "Multiply/divide by 4, 5, 8, 9, 11, 12, 15, 25, 19, 99; squaring X5; complementary" },
  { id: "divisibility_3_6_9", label: "Divisibility by 3, 6, 9", level: 3, hasDifficulty: true, description: "Digit-sum divisibility rules" },
  { id: "divisibility_4_8", label: "Divisibility by 4, 8", level: 3, hasDifficulty: true, description: "Last-digits and halving rules" },
  { id: "divisibility_7", label: "Advanced Divisibility (7, 11)", level: 3, hasDifficulty: true, description: "Multiply-last-digit method (7); alternating digit sum (11)" }
];
function getTopicsForLevel(level) {
  return DRILL_TOPIC_REGISTRY.filter((t) => t.level === level).map((t) => ({ ...t }));
}
function getTopicInfo(topicId) {
  const found = DRILL_TOPIC_REGISTRY.find((t) => t.id === topicId);
  return found ? { ...found } : void 0;
}
function topicHasDifficulty(topicId) {
  const topic = DRILL_TOPIC_REGISTRY.find((t) => t.id === topicId);
  return topic ? topic.hasDifficulty : false;
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export { DRILL_TOPIC_REGISTRY, cn, commonFractionConversions, generateProblem, getTopicInfo, getTopicsForLevel, perfectCubes, perfectFifthPowers, perfectFourthPowers, perfectSquares, simplifyFraction, topicHasDifficulty };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map