'use strict';

var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');

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
    console.error("generateLevel2Problem: generator threw, falling back to multiplication_estimation", { error, difficulty });
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
var TIMES_TABLES_ALL_FACTORS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
var timesTablesPoolForScope = (scope) => {
  switch (scope) {
    case "tt_easy":
      return { aPool: [2, 5, 10], bPool: TIMES_TABLES_ALL_FACTORS, preserveOrder: false };
    case "tt_2_5":
      return { aPool: [2, 3, 4, 5], bPool: TIMES_TABLES_ALL_FACTORS, preserveOrder: false };
    case "tt_6_9":
      return { aPool: [6, 7, 8, 9], bPool: TIMES_TABLES_ALL_FACTORS, preserveOrder: false };
    case "tt_10_12":
      return { aPool: [10, 11, 12], bPool: TIMES_TABLES_ALL_FACTORS, preserveOrder: false };
    case "tt_just_6":
      return { aPool: [6], bPool: TIMES_TABLES_ALL_FACTORS, preserveOrder: true };
    case "tt_just_7":
      return { aPool: [7], bPool: TIMES_TABLES_ALL_FACTORS, preserveOrder: true };
    case "tt_just_8":
      return { aPool: [8], bPool: TIMES_TABLES_ALL_FACTORS, preserveOrder: true };
    case "tt_just_9":
      return { aPool: [9], bPool: TIMES_TABLES_ALL_FACTORS, preserveOrder: true };
    case "tt_full":
    default:
      return { aPool: TIMES_TABLES_ALL_FACTORS, bPool: TIMES_TABLES_ALL_FACTORS, preserveOrder: false };
  }
};
var squaresRangeForScope = (scope) => {
  switch (scope) {
    case "squares_1_5":
      return [1, 5];
    case "squares_1_10":
      return [1, 10];
    case "squares_11_15":
      return [11, 15];
    case "squares_11_20":
      return [11, 20];
    case "squares_16_20":
      return [16, 20];
    case "squares_full":
    default:
      return [1, 20];
  }
};
var cubesRangeForScope = (scope) => {
  switch (scope) {
    case "cubes_1_3":
      return [1, 3];
    case "cubes_1_5":
      return [1, 5];
    case "cubes_6_10":
      return [6, 10];
    case "cubes_full":
    default:
      return [1, 10];
  }
};
var fractionDenominatorsForScope = (scope) => {
  switch (scope) {
    case "fractions_friendly":
      return [4, 5];
    case "fractions_halves_fourths":
      return [4];
    case "fractions_fifths":
      return [5];
    case "fractions_eighths":
      return [8];
    case "fractions_thirds":
      return [3];
    case "fractions_sixths":
      return [6];
    case "fractions_sevenths":
      return [7];
    case "fractions_ninths":
      return [9];
    case "fractions_full":
    default:
      return [3, 4, 5, 6, 7, 8, 9];
  }
};
var generateTimesTablesProblem_targeted = (scope) => {
  const { aPool, bPool, preserveOrder } = timesTablesPoolForScope(scope);
  let a = aPool[Math.floor(Math.random() * aPool.length)];
  let b = bPool[Math.floor(Math.random() * bPool.length)];
  if (!preserveOrder && a < b) {
    [a, b] = [b, a];
  }
  const answer = a * b;
  const explanation = `${a} \xD7 ${b} = ${answer}.`;
  return { question: `${a} \xD7 ${b} = ?`, answer, type: "Times Tables", explanation, inputType: "number" };
};
var generatePerfectSquareProblem_targeted = (scope) => {
  const [lo, hi] = squaresRangeForScope(scope);
  const num = Math.floor(Math.random() * (hi - lo + 1)) + lo;
  const answer = num * num;
  const explanation = `${num}\xB2 = ${num}\xD7${num} = ${answer}`;
  return { question: `${num}\xB2 = ?`, answer, type: "Perfect Squares", explanation, inputType: "number" };
};
var generatePerfectCubeProblem_targeted = (scope) => {
  const [lo, hi] = cubesRangeForScope(scope);
  const num = Math.floor(Math.random() * (hi - lo + 1)) + lo;
  const answer = num * num * num;
  const explanation = `${num}\xB3 = ${num}\xD7${num}\xD7${num} = ${answer}`;
  return { question: `${num}\xB3 = ?`, answer, type: "Perfect Cubes", explanation, inputType: "number" };
};
var generateFractionProblem_allDenominators = (scope) => {
  const allDenominators = fractionDenominatorsForScope(scope);
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
    return generateFractionProblem_allDenominators(scope);
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
      return generateFractionProblem_allDenominators(scope);
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
var generateTopicProblem = (topic, difficulty, scope) => {
  switch (topic) {
    // Level 1 topics (ignore difficulty)
    case "times_tables":
      return generateTimesTablesProblem_targeted(scope);
    case "perfect_squares":
      return generatePerfectSquareProblem_targeted(scope);
    case "perfect_cubes":
      return generatePerfectCubeProblem_targeted(scope);
    case "fraction_conversions":
      return generateFractionProblem_allDenominators(scope);
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
var generateProblem = (level, difficulty, history, topic, scope) => {
  if (topic) {
    const generator2 = () => generateTopicProblem(topic, difficulty, scope);
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
var SCOPES_TIMES_TABLES = [
  { id: "tt_full", label: "Full (2\xD7 through 12\xD7)", narrowerThan: ["tt_6_9"] },
  { id: "tt_easy", label: "The easy ones (2\xD7, 5\xD7, 10\xD7)", widerThan: ["tt_2_5"] },
  { id: "tt_2_5", label: "2\xD7 through 5\xD7", widerThan: ["tt_full"], narrowerThan: ["tt_easy"] },
  { id: "tt_6_9", label: "6\xD7 through 9\xD7", widerThan: ["tt_full"], narrowerThan: ["tt_just_7"] },
  { id: "tt_10_12", label: "10\xD7 through 12\xD7", widerThan: ["tt_full"] },
  { id: "tt_just_6", label: "Just the 6\xD7 table", widerThan: ["tt_6_9"] },
  { id: "tt_just_7", label: "Just the 7\xD7 table", widerThan: ["tt_6_9"] },
  { id: "tt_just_8", label: "Just the 8\xD7 table", widerThan: ["tt_6_9"] },
  { id: "tt_just_9", label: "Just the 9\xD7 table", widerThan: ["tt_6_9"] }
];
var SCOPES_PERFECT_SQUARES = [
  { id: "squares_full", label: "Full (1\xB2 through 20\xB2)", narrowerThan: ["squares_1_10"] },
  { id: "squares_1_5", label: "1\xB2 through 5\xB2", widerThan: ["squares_1_10"] },
  { id: "squares_1_10", label: "1\xB2 through 10\xB2", widerThan: ["squares_full"], narrowerThan: ["squares_1_5"] },
  { id: "squares_11_15", label: "11\xB2 through 15\xB2", widerThan: ["squares_11_20"] },
  { id: "squares_11_20", label: "11\xB2 through 20\xB2", widerThan: ["squares_full"], narrowerThan: ["squares_11_15"] },
  { id: "squares_16_20", label: "16\xB2 through 20\xB2", widerThan: ["squares_11_20"] }
];
var SCOPES_PERFECT_CUBES = [
  { id: "cubes_full", label: "Full (1\xB3 through 10\xB3)", narrowerThan: ["cubes_1_5"] },
  { id: "cubes_1_3", label: "1\xB3 through 3\xB3", widerThan: ["cubes_1_5"] },
  { id: "cubes_1_5", label: "1\xB3 through 5\xB3", widerThan: ["cubes_full"], narrowerThan: ["cubes_1_3"] },
  { id: "cubes_6_10", label: "6\xB3 through 10\xB3", widerThan: ["cubes_full"] }
];
var SCOPES_FRACTION_CONVERSIONS = [
  { id: "fractions_full", label: "Full (all denominators)", narrowerThan: ["fractions_friendly"] },
  { id: "fractions_friendly", label: "The friendly ones (halves, fourths, fifths)", widerThan: ["fractions_full"], narrowerThan: ["fractions_halves_fourths"] },
  { id: "fractions_halves_fourths", label: "Halves and fourths (1/2, 1/4, 3/4)", widerThan: ["fractions_friendly"] },
  { id: "fractions_fifths", label: "Fifths (1/5, 2/5, 3/5, 4/5)", widerThan: ["fractions_friendly"] },
  { id: "fractions_eighths", label: "Eighths (1/8, 3/8, 5/8, 7/8)", widerThan: ["fractions_full"] },
  { id: "fractions_thirds", label: "Thirds (1/3, 2/3)", widerThan: ["fractions_full"] },
  { id: "fractions_sixths", label: "Sixths (1/6, 5/6)", widerThan: ["fractions_full"] },
  { id: "fractions_sevenths", label: "Sevenths (1/7 \u2026 6/7)", widerThan: ["fractions_full"] },
  { id: "fractions_ninths", label: "Ninths (1/9 \u2026 8/9)", widerThan: ["fractions_full"] }
];
var DRILL_TOPIC_REGISTRY = [
  // Level 1: Memorize
  { id: "times_tables", label: "Times Tables", level: 1, hasDifficulty: false, description: "Single-digit multiplication facts (2\xD7 through 12\xD7)", scopes: SCOPES_TIMES_TABLES },
  { id: "perfect_squares", label: "Perfect Squares (1-20)", level: 1, hasDifficulty: false, description: "Squares of numbers 1 through 20", scopes: SCOPES_PERFECT_SQUARES },
  { id: "perfect_cubes", label: "Perfect Cubes (1-10)", level: 1, hasDifficulty: false, description: "Cubes of numbers 1 through 10", scopes: SCOPES_PERFECT_CUBES },
  { id: "fraction_conversions", label: "Fractions \u2194 Decimals \u2194 Percents", level: 1, hasDifficulty: false, description: "All denominators (3-9), all conversion types", scopes: SCOPES_FRACTION_CONVERSIONS },
  { id: "advanced_squares", label: "Advanced Squares", level: 1, hasDifficulty: false, description: "Squares of 10, 20, 30...100" },
  { id: "advanced_cubes", label: "Advanced Cubes", level: 1, hasDifficulty: false, description: "Cubes of 10, 20, 30...100" },
  { id: "higher_powers", label: "Higher Powers", level: 1, hasDifficulty: false, description: "2^4-2^9, 3^4-3^6, 4^4, 5^4, 6^4" },
  { id: "common_multiples", label: "Common Multiples", level: 1, hasDifficulty: false, description: "13-36 times various multipliers" },
  // Level 2: Estimate
  { id: "multiplication_estimation", label: "Multiplication Estimation", level: 2, hasDifficulty: true, description: "Estimate products of multi-digit numbers" },
  { id: "root_estimation", label: "Root Estimation", level: 2, hasDifficulty: true, description: "Square roots, cube roots, and higher roots at Hard" },
  { id: "fraction_estimation", label: "Fraction Estimation", level: 2, hasDifficulty: true, description: "Estimate fraction values with 2-digit or 3-digit denominators" },
  { id: "percentage_calculations", label: "Percentage Estimation", level: 2, hasDifficulty: true, description: "Quick percentage estimates: tips, taxes, percent change" },
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

// src/core/learn/types.ts
var LEARN_TIER_LADDER = ["see", "recognize", "recall"];
var RECOGNIZE_OPTION_COUNT = 4;
var INITIAL_LEARN_TIER = "recognize";

// src/core/learn/helpers.ts
function isQuizzedTier(tier) {
  return tier !== "see";
}
function escalateTier(tier) {
  const i = LEARN_TIER_LADDER.indexOf(tier);
  return LEARN_TIER_LADDER[Math.min(i + 1, LEARN_TIER_LADDER.length - 1)];
}
function dropTier(tier) {
  const i = LEARN_TIER_LADDER.indexOf(tier);
  return LEARN_TIER_LADDER[Math.max(i - 1, 0)];
}
function createInitialItemState(itemId) {
  return {
    itemId,
    tier: INITIAL_LEARN_TIER,
    correctRecalls: 0,
    attempts: 0,
    misses: 0
  };
}
function createInitialItemStates(def) {
  return def.items.map((item) => createInitialItemState(item.id));
}
function applySeen(state) {
  if (state.tier !== "see") return state;
  return { ...state, tier: escalateTier(state.tier) };
}
function applyCorrectAnswer(state) {
  if (state.tier === "see") return state;
  return {
    ...state,
    tier: escalateTier(state.tier),
    attempts: state.attempts + 1,
    correctRecalls: state.tier === "recall" ? state.correctRecalls + 1 : state.correctRecalls
  };
}
function applyMiss(state) {
  if (state.tier === "see") return state;
  return {
    ...state,
    tier: dropTier(state.tier),
    attempts: state.attempts + 1,
    misses: state.misses + 1
  };
}
function isItemSolid(state, config) {
  return state.correctRecalls >= config.recallsToSolid;
}
function deriveItemStatus(state, config) {
  if (isItemSolid(state, config)) return "solid";
  return state.attempts === 0 ? "new" : "learning";
}
function solidProgress(states, config) {
  return {
    solid: states.filter((s) => isItemSolid(s, config)).length,
    total: states.length
  };
}
function isModuleComplete(states, config) {
  return states.length > 0 && states.every((s) => isItemSolid(s, config));
}
function assembleRecognizeOptions(item, set, rng = Math.random) {
  const pool = [...set.distractors];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const chosen = pool.slice(0, RECOGNIZE_OPTION_COUNT - 1);
  const correctIndex = Math.floor(rng() * (chosen.length + 1));
  const options = [
    ...chosen.slice(0, correctIndex),
    item.answer,
    ...chosen.slice(correctIndex)
  ];
  return { options, correctIndex };
}
function validateLearnModuleDef(def) {
  const problems = [];
  if (def.items.length === 0) {
    problems.push(`module "${def.id}" has no items`);
  }
  const itemIds = /* @__PURE__ */ new Set();
  for (const item of def.items) {
    if (item.id === "") {
      problems.push(`module "${def.id}" has an item with an empty id`);
      continue;
    }
    if (itemIds.has(item.id)) {
      problems.push(`module "${def.id}" has duplicate item id "${item.id}"`);
    }
    itemIds.add(item.id);
  }
  const coveredIds = /* @__PURE__ */ new Set();
  for (const set of def.distractorSets) {
    if (!itemIds.has(set.itemId)) {
      problems.push(
        `module "${def.id}" has a distractor set for unknown item "${set.itemId}"`
      );
      continue;
    }
    if (coveredIds.has(set.itemId)) {
      problems.push(
        `module "${def.id}" has duplicate distractor sets for item "${set.itemId}"`
      );
    }
    coveredIds.add(set.itemId);
    if (set.distractors.length < RECOGNIZE_OPTION_COUNT - 1) {
      problems.push(
        `item "${set.itemId}" has ${set.distractors.length} distractors; needs at least ${RECOGNIZE_OPTION_COUNT - 1}`
      );
    }
    if (new Set(set.distractors).size !== set.distractors.length) {
      problems.push(`item "${set.itemId}" has duplicate distractors`);
    }
    const item = def.items.find((i) => i.id === set.itemId);
    if (item && set.distractors.some((d) => d === item.answer)) {
      problems.push(
        `item "${set.itemId}" has a distractor equal to its correct answer`
      );
    }
  }
  for (const id of itemIds) {
    if (!coveredIds.has(id)) {
      problems.push(`item "${id}" has no distractor set`);
    }
  }
  return problems;
}
function isLearnEligibleModule(def) {
  return validateLearnModuleDef(def).length === 0;
}
function isLearnEligible(modules, moduleId) {
  const def = modules.find((m) => m.id === moduleId);
  return def !== void 0 && isLearnEligibleModule(def);
}

// src/core/learn/mathmog-binding.ts
var MEMORIZE_LEARN_TOPICS = [
  "times_tables",
  "perfect_squares",
  "perfect_cubes",
  "fraction_conversions",
  "advanced_squares",
  "advanced_cubes",
  "higher_powers",
  "common_multiples"
];
var MATHMOG_LEARN_CONFIG = {
  recallsToSolid: 2
};
function mathmogLearnModuleId(topic, scopeId) {
  return `${topic}/${scopeId}`;
}
function parseMathmogLearnModuleId(moduleId) {
  const parts = moduleId.split("/");
  if (parts.length !== 2 || parts[0] === "" || parts[1] === "") return null;
  return { topic: parts[0], scopeId: parts[1] };
}

// src/core/learn/modules/times-tables.ts
var TT_FACTORS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
var TT_FACT_DISTRACTORS = {
  // 2× row
  "2x2": [6, 8, 2, 5],
  "2x3": [4, 8, 9, 5],
  "2x4": [6, 10, 12, 9],
  "2x5": [8, 12, 15, 20],
  "2x6": [10, 14, 18, 13],
  "2x7": [12, 16, 21, 13],
  "2x8": [14, 18, 24, 15],
  "2x9": [16, 20, 27, 17],
  "2x10": [18, 22, 30, 21],
  "2x11": [20, 24, 33, 21],
  "2x12": [22, 26, 36, 28],
  // 3× row
  "3x3": [6, 12, 8, 27, 15],
  "3x4": [9, 15, 16, 8],
  "3x5": [12, 18, 25, 35],
  "3x6": [15, 21, 24, 12],
  "3x7": [24, 28, 27, 15],
  "3x8": [21, 27, 32, 16],
  "3x9": [24, 36, 21, 33],
  "3x10": [27, 33, 40, 20],
  "3x11": [44, 30, 27, 39],
  "3x12": [33, 39, 48, 24],
  // 4× row
  "4x4": [12, 20, 18, 8],
  "4x5": [16, 24, 25, 15],
  "4x6": [20, 28, 30, 18],
  "4x7": [24, 32, 35, 21],
  "4x8": [28, 36, 40, 24],
  "4x9": [32, 40, 45, 27],
  "4x10": [36, 44, 50, 30],
  "4x11": [40, 48, 55, 33],
  "4x12": [44, 52, 60, 36],
  // 5× row
  "5x5": [20, 30, 35, 24, 15],
  "5x6": [25, 35, 36, 24],
  "5x7": [30, 40, 45, 25],
  "5x8": [35, 45, 48, 32],
  "5x9": [40, 54, 35, 55],
  "5x10": [45, 55, 60, 40],
  "5x11": [50, 60, 45, 65],
  "5x12": [55, 65, 72, 48],
  // 6× row
  "6x6": [30, 42, 35, 48],
  "6x7": [36, 48, 49, 35],
  "6x8": [42, 54, 56, 40],
  "6x9": [48, 60, 63, 45, 56],
  "6x10": [54, 66, 70, 50],
  "6x11": [60, 72, 77, 55],
  "6x12": [66, 78, 84, 60],
  // 7× row
  "7x7": [42, 56, 48, 63, 35],
  "7x8": [54, 63, 48, 64, 65],
  "7x9": [56, 54, 72, 49, 81],
  "7x10": [63, 77, 80, 60],
  "7x11": [70, 84, 63, 91],
  "7x12": [77, 91, 96, 72],
  // 8× row
  "8x8": [56, 72, 63, 48],
  "8x9": [64, 80, 81, 63],
  "8x10": [72, 88, 90, 70],
  "8x11": [80, 96, 99, 77],
  "8x12": [88, 104, 108, 84],
  // 9× row
  "9x9": [72, 90, 63, 99],
  "9x10": [81, 99, 100, 80],
  "9x11": [90, 108, 81, 121],
  "9x12": [99, 117, 120, 96],
  // 10× row
  "10x10": [90, 110, 99, 120],
  "10x11": [100, 120, 121, 99],
  "10x12": [110, 130, 132, 108],
  // 11× row
  "11x11": [110, 132, 111, 99],
  "11x12": [121, 144, 120, 122],
  // 12× row
  "12x12": [132, 121, 156, 124]
};
var factKey = (a, b) => a <= b ? `${a}x${b}` : `${b}x${a}`;
var ttItem = (a, b) => ({
  id: `${a}x${b}`,
  prompt: `${a} \xD7 ${b}`,
  answer: a * b
});
var ttDistractorSet = (item) => {
  const [a, b] = item.id.split("x").map(Number);
  return { itemId: item.id, distractors: TT_FACT_DISTRACTORS[factKey(a, b)] };
};
var rowItems = (row) => TT_FACTORS.map((b) => ttItem(row, b));
var multiRowItems = (rows) => {
  const seen = /* @__PURE__ */ new Set();
  const items = [];
  for (const a of [...rows].sort((x, y) => x - y)) {
    for (const b of TT_FACTORS) {
      const key = factKey(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(a >= b ? ttItem(a, b) : ttItem(b, a));
    }
  }
  return items;
};
var ttScopeLabel = (scopeId) => {
  const topic = DRILL_TOPIC_REGISTRY.find((t) => t.id === "times_tables");
  const scope = topic?.scopes?.find((s) => s.id === scopeId);
  if (!scope) throw new Error(`Unknown times_tables scope: ${scopeId}`);
  return scope.label;
};
var ttModule = (scopeId, items) => ({
  id: mathmogLearnModuleId("times_tables", scopeId),
  label: ttScopeLabel(scopeId),
  items,
  distractorSets: items.map(ttDistractorSet)
});
var TIMES_TABLES_LEARN_MODULES = [
  ttModule("tt_full", multiRowItems([...TT_FACTORS])),
  ttModule("tt_easy", multiRowItems([2, 5, 10])),
  ttModule("tt_2_5", multiRowItems([2, 3, 4, 5])),
  ttModule("tt_6_9", multiRowItems([6, 7, 8, 9])),
  ttModule("tt_10_12", multiRowItems([10, 11, 12])),
  ttModule("tt_just_6", rowItems(6)),
  ttModule("tt_just_7", rowItems(7)),
  ttModule("tt_just_8", rowItems(8)),
  ttModule("tt_just_9", rowItems(9))
];

// src/core/learn/modules/scope-label.ts
var registryScopeLabel = (topicId, scopeId) => {
  const topic = DRILL_TOPIC_REGISTRY.find((t) => t.id === topicId);
  const scope = topic?.scopes?.find((s) => s.id === scopeId);
  if (!scope) throw new Error(`Unknown ${topicId} scope: ${scopeId}`);
  return scope.label;
};

// src/core/learn/modules/perfect-squares.ts
var SQUARE_DISTRACTORS = {
  1: [2, 4, 9, 11],
  2: [6, 8, 9, 2],
  3: [6, 12, 16, 27, 15],
  4: [12, 20, 9, 25],
  5: [20, 30, 16, 35, 15],
  6: [30, 42, 25, 49],
  7: [36, 64, 42, 63, 35],
  8: [56, 72, 49, 81],
  9: [72, 90, 64, 63, 99],
  10: [90, 110, 81, 121],
  11: [110, 132, 144, 111, 99],
  12: [132, 121, 156, 169],
  13: [156, 196, 144, 121, 225],
  14: [182, 210, 169, 225],
  15: [210, 240, 196, 125, 289],
  16: [240, 272, 225, 289, 265],
  17: [272, 324, 256, 225, 361],
  18: [306, 342, 289, 361],
  19: [342, 380, 324, 289, 441],
  20: [380, 420, 361, 441]
};
var squareItem = (n) => ({
  id: `${n}^2`,
  prompt: `${n}\xB2`,
  answer: n * n
});
var rangeItems = (lo, hi) => {
  const items = [];
  for (let n = lo; n <= hi; n++) items.push(squareItem(n));
  return items;
};
var squaresModule = (scopeId, lo, hi) => {
  const items = rangeItems(lo, hi);
  return {
    id: mathmogLearnModuleId("perfect_squares", scopeId),
    label: registryScopeLabel("perfect_squares", scopeId),
    items,
    distractorSets: items.map((item) => ({
      itemId: item.id,
      distractors: SQUARE_DISTRACTORS[Number(item.id.split("^")[0])]
    }))
  };
};
var PERFECT_SQUARES_LEARN_MODULES = [
  squaresModule("squares_full", 1, 20),
  squaresModule("squares_1_5", 1, 5),
  squaresModule("squares_1_10", 1, 10),
  squaresModule("squares_11_15", 11, 15),
  squaresModule("squares_11_20", 11, 20),
  squaresModule("squares_16_20", 16, 20)
];

// src/core/learn/modules/perfect-cubes.ts
var CUBE_DISTRACTORS = {
  1: [3, 13, 8, 27],
  2: [4, 6, 27, 16],
  3: [9, 64, 81, 18],
  4: [16, 27, 125, 32],
  5: [25, 75, 64, 625],
  6: [36, 125, 343, 126],
  7: [49, 216, 512, 147],
  8: [64, 343, 729, 256],
  9: [81, 512, 1e3, 243],
  10: [100, 1e4, 729, 300]
};
var cubeItem = (n) => ({
  id: `${n}^3`,
  prompt: `${n}\xB3`,
  answer: n * n * n
});
var rangeItems2 = (lo, hi) => {
  const items = [];
  for (let n = lo; n <= hi; n++) items.push(cubeItem(n));
  return items;
};
var cubesModule = (scopeId, lo, hi) => {
  const items = rangeItems2(lo, hi);
  return {
    id: mathmogLearnModuleId("perfect_cubes", scopeId),
    label: registryScopeLabel("perfect_cubes", scopeId),
    items,
    distractorSets: items.map((item) => ({
      itemId: item.id,
      distractors: CUBE_DISTRACTORS[Number(item.id.split("^")[0])]
    }))
  };
};
var PERFECT_CUBES_LEARN_MODULES = [
  cubesModule("cubes_full", 1, 10),
  cubesModule("cubes_1_3", 1, 3),
  cubesModule("cubes_1_5", 1, 5),
  cubesModule("cubes_6_10", 6, 10)
];

// src/core/learn/modules/index.ts
var MATHMOG_LEARN_MODULES = [
  ...TIMES_TABLES_LEARN_MODULES,
  ...PERFECT_SQUARES_LEARN_MODULES,
  ...PERFECT_CUBES_LEARN_MODULES
];
function cn(...inputs) {
  return tailwindMerge.twMerge(clsx.clsx(inputs));
}

exports.DRILL_TOPIC_REGISTRY = DRILL_TOPIC_REGISTRY;
exports.INITIAL_LEARN_TIER = INITIAL_LEARN_TIER;
exports.LEARN_TIER_LADDER = LEARN_TIER_LADDER;
exports.MATHMOG_LEARN_CONFIG = MATHMOG_LEARN_CONFIG;
exports.MATHMOG_LEARN_MODULES = MATHMOG_LEARN_MODULES;
exports.MEMORIZE_LEARN_TOPICS = MEMORIZE_LEARN_TOPICS;
exports.PERFECT_CUBES_LEARN_MODULES = PERFECT_CUBES_LEARN_MODULES;
exports.PERFECT_SQUARES_LEARN_MODULES = PERFECT_SQUARES_LEARN_MODULES;
exports.RECOGNIZE_OPTION_COUNT = RECOGNIZE_OPTION_COUNT;
exports.TIMES_TABLES_LEARN_MODULES = TIMES_TABLES_LEARN_MODULES;
exports.applyCorrectAnswer = applyCorrectAnswer;
exports.applyMiss = applyMiss;
exports.applySeen = applySeen;
exports.assembleRecognizeOptions = assembleRecognizeOptions;
exports.cn = cn;
exports.commonFractionConversions = commonFractionConversions;
exports.createInitialItemState = createInitialItemState;
exports.createInitialItemStates = createInitialItemStates;
exports.deriveItemStatus = deriveItemStatus;
exports.dropTier = dropTier;
exports.escalateTier = escalateTier;
exports.generateProblem = generateProblem;
exports.getTopicInfo = getTopicInfo;
exports.getTopicsForLevel = getTopicsForLevel;
exports.isItemSolid = isItemSolid;
exports.isLearnEligible = isLearnEligible;
exports.isLearnEligibleModule = isLearnEligibleModule;
exports.isModuleComplete = isModuleComplete;
exports.isQuizzedTier = isQuizzedTier;
exports.mathmogLearnModuleId = mathmogLearnModuleId;
exports.parseMathmogLearnModuleId = parseMathmogLearnModuleId;
exports.perfectCubes = perfectCubes;
exports.perfectFifthPowers = perfectFifthPowers;
exports.perfectFourthPowers = perfectFourthPowers;
exports.perfectSquares = perfectSquares;
exports.simplifyFraction = simplifyFraction;
exports.solidProgress = solidProgress;
exports.topicHasDifficulty = topicHasDifficulty;
exports.validateLearnModuleDef = validateLearnModuleDef;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map