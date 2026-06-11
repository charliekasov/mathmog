'use strict';

var React = require('react');
var jsxRuntime = require('react/jsx-runtime');
var lucideReact = require('lucide-react');
var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespace(React);

// src/react/ui/provider.tsx
var MathmogUIContext = React.createContext(null);
function MathmogUIProvider({
  ui,
  children
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(MathmogUIContext.Provider, { value: ui, children });
}
function useMathmogUI() {
  const ui = React.useContext(MathmogUIContext);
  if (!ui) {
    throw new Error(
      "useMathmogUI: no <MathmogUIProvider ui={...}> found in the React tree. Wrap your trainer with <MathmogUIProvider ui={portalUIBag}> at module scope."
    );
  }
  return ui;
}
var TrainerStateContext = React.createContext(void 0);
var TrainerStateProvider = ({ children }) => {
  const [studyTab, setStudyTab] = React.useState("memorize");
  const [darkMode, setDarkMode] = React.useState(false);
  const value = {
    studyTab,
    setStudyTab,
    darkMode,
    setDarkMode
  };
  return /* @__PURE__ */ jsxRuntime.jsx(TrainerStateContext.Provider, { value, children });
};
var useTrainerState = () => {
  const context = React.useContext(TrainerStateContext);
  if (context === void 0) {
    throw new Error("useTrainerState must be used within a TrainerStateProvider");
  }
  return context;
};

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
  2: { numerators: [1], precision: 1, repeating: false },
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
  { frac: "1/2", decimal: "0.5", percent: "50%" },
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
      return [2, 4, 5];
    case "fractions_halves_fourths":
      return [2, 4];
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
      return [2, 3, 4, 5, 6, 7, 8, 9];
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
  { id: "fraction_conversions", label: "Fractions \u2194 Decimals \u2194 Percents", level: 1, hasDifficulty: false, description: "All denominators (2-9), all conversion types", scopes: SCOPES_FRACTION_CONVERSIONS },
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
function defaultScopeForTopic(topicId) {
  if (!topicId) return void 0;
  const info = getTopicInfo(topicId);
  if (!info?.scopes || info.scopes.length === 0) return void 0;
  const fullScope = info.scopes.find((s) => s.id.endsWith("_full"));
  return fullScope?.id ?? info.scopes[0].id;
}
function formatProblemPrompt(question) {
  return Array.isArray(question) ? question.join(" ___ ") : String(question);
}
function formatProblemAnswer(answer) {
  if (Array.isArray(answer)) return answer.map((a) => String(a)).join(" or ");
  return String(answer);
}
var ProblemContext = React.createContext(void 0);
var HISTORY_LIMIT = 50;
function ProblemProvider({ children }) {
  const [currentLevel, setCurrentLevel] = React.useState(1);
  const [currentDifficulty, setCurrentDifficulty] = React.useState("Easy");
  const [currentTopic, setCurrentTopic] = React.useState(void 0);
  const [currentScope, setCurrentScope] = React.useState(void 0);
  const [currentProblem, setCurrentProblem] = React.useState(null);
  const [userAnswer, setUserAnswer] = React.useState("");
  const [feedback, setFeedback] = React.useState("");
  const [estimationTier, setEstimationTier] = React.useState(null);
  const [estimationDeviation, setEstimationDeviation] = React.useState(null);
  const [score, setScore] = React.useState({ correct: 0, total: 0 });
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [problemHistory, setProblemHistory] = React.useState([]);
  const [missedProblems, setMissedProblems] = React.useState([]);
  const [adaptiveData, setAdaptiveData] = React.useState({
    consecutiveCorrect: 0,
    currentAdaptiveLevel: null,
    pendingLevelUp: null,
    streakPure: true
  });
  const problemHistoryRef = React.useRef([]);
  const currentTopicRef = React.useRef(void 0);
  const currentScopeRef = React.useRef(void 0);
  problemHistoryRef.current = problemHistory;
  currentTopicRef.current = currentTopic;
  currentScopeRef.current = currentScope;
  const handleNewProblem = React.useCallback((level, difficulty, topic, scope) => {
    const targetLevel = level ?? currentLevel;
    const targetDifficulty = difficulty ?? currentDifficulty;
    const targetTopic = topic !== void 0 ? topic : currentTopicRef.current;
    const targetScope = scope !== void 0 ? scope : currentScopeRef.current;
    try {
      const newProblem = generateProblem(targetLevel, targetDifficulty, problemHistoryRef.current, targetTopic, targetScope);
      setCurrentProblem(newProblem);
      setUserAnswer("");
      setFeedback("");
      setEstimationTier(null);
      setEstimationDeviation(null);
      setShowAnswer(false);
      setProblemHistory((prev) => {
        const newHistory = [...prev, newProblem.question.toString()];
        if (newHistory.length > HISTORY_LIMIT) {
          return newHistory.slice(newHistory.length - HISTORY_LIMIT);
        }
        return newHistory;
      });
    } catch (error) {
      console.error("ProblemProvider.handleNewProblem: generator threw, keeping previous problem", { error, targetLevel, targetDifficulty, targetTopic, targetScope });
      setUserAnswer("");
      setFeedback("");
      setEstimationTier(null);
      setEstimationDeviation(null);
      setShowAnswer(false);
    }
  }, [currentLevel, currentDifficulty]);
  const handleCheckAnswer = React.useCallback((answerToCheck) => {
    if (!currentProblem) return;
    const userAnswerTrimmed = answerToCheck.trim().toLowerCase();
    let isCorrect = false;
    let deviationPercent;
    let validationKind = "default";
    let correctAnswerNumeric;
    if (currentProblem.type === "Root Estimation") {
      validationKind = "root-estimation";
      const answerParts = userAnswerTrimmed.split(",").map((s) => s.trim());
      const correctParts = String(currentProblem.answer).split(",").map((s) => s.trim().toLowerCase());
      if (answerParts.length === correctParts.length && answerParts.length >= 3) {
        const userBetween = [answerParts[0], answerParts[1]].sort();
        const correctBetween = [correctParts[0], correctParts[1]].sort();
        const betweenMatch = userBetween[0] === correctBetween[0] && userBetween[1] === correctBetween[1];
        isCorrect = betweenMatch && answerParts[2] === correctParts[2];
      }
    } else if (currentProblem.inputType === "text" && typeof currentProblem.answer === "string" && currentProblem.answer.includes("/")) {
      validationKind = "fraction";
      try {
        const parts = userAnswerTrimmed.split("/");
        if (parts.length === 2) {
          const num = parseInt(parts[0].trim(), 10);
          const den = parseInt(parts[1].trim(), 10);
          if (!isNaN(num) && !isNaN(den) && den !== 0) {
            const simplifiedUserAnswer = simplifyFraction(num, den);
            isCorrect = simplifiedUserAnswer === currentProblem.answer;
          }
        }
      } catch (e) {
        isCorrect = false;
      }
    } else if (currentProblem.type.includes("Estimation")) {
      validationKind = "estimation";
      const userNum = parseFloat(userAnswerTrimmed);
      if (!isNaN(userNum)) {
        const exactAnswer = currentProblem.answer;
        correctAnswerNumeric = exactAnswer;
        const deviation = exactAnswer === 0 ? Math.abs(userNum) : Math.abs((userNum - exactAnswer) / exactAnswer);
        deviationPercent = Math.round(deviation * 1e3) / 10;
        setEstimationDeviation(deviationPercent);
        if (deviation < 1e-3) {
          setEstimationTier("exact");
        } else if (deviation <= 0.02) {
          setEstimationTier("within2");
        } else if (deviation <= 0.05) {
          setEstimationTier("within5");
        } else if (deviation <= 0.1) {
          setEstimationTier("within10");
        } else {
          setEstimationTier("outside");
        }
        isCorrect = deviation <= (currentProblem.tolerance ?? 0.1);
      }
    } else if (currentProblem.inputType === "multi-text") {
      validationKind = "multi-text";
      const possibleAnswers = Array.isArray(currentProblem.answer) ? currentProblem.answer.map((a) => String(a).toLowerCase()) : [String(currentProblem.answer).toLowerCase()];
      isCorrect = possibleAnswers.includes(userAnswerTrimmed);
    } else if (currentProblem.inputType === "number") {
      validationKind = "number";
      if (!Array.isArray(currentProblem.answer)) {
        const candidate = typeof currentProblem.answer === "number" ? currentProblem.answer : parseFloat(String(currentProblem.answer));
        if (!isNaN(candidate)) correctAnswerNumeric = candidate;
      }
      const userNum = parseFloat(userAnswerTrimmed);
      if (!isNaN(userNum)) {
        if (Array.isArray(currentProblem.answer)) {
          isCorrect = currentProblem.answer.some((acceptableAnswer) => {
            const correctNum = typeof acceptableAnswer === "number" ? acceptableAnswer : parseFloat(String(acceptableAnswer));
            return !isNaN(correctNum) && Math.abs(userNum - correctNum) < 1e-4;
          });
        } else {
          const correctNum = typeof currentProblem.answer === "number" ? currentProblem.answer : parseFloat(String(currentProblem.answer));
          if (!isNaN(correctNum)) {
            isCorrect = Math.abs(userNum - correctNum) < 1e-4;
          }
        }
      } else {
        isCorrect = userAnswerTrimmed === String(currentProblem.answer).toLowerCase();
      }
    } else {
      validationKind = "default";
      isCorrect = userAnswerTrimmed === String(currentProblem.answer).toLowerCase();
    }
    setScore((prev) => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
    setFeedback(isCorrect ? "correct" : "incorrect");
    setShowAnswer(true);
    if (!isCorrect) {
      setMissedProblems((prev) => [
        ...prev,
        {
          prompt: formatProblemPrompt(currentProblem.question),
          correctAnswer: formatProblemAnswer(currentProblem.answer),
          studentAnswer: answerToCheck.trim(),
          validationKind,
          ...deviationPercent !== void 0 ? { deviationPercent } : {},
          ...correctAnswerNumeric !== void 0 ? { correctAnswerNumeric } : {},
          ...currentProblem.explanation ? { explanation: currentProblem.explanation } : {}
        }
      ]);
    }
    if (isCorrect) {
      setAdaptiveData((prev) => {
        const newConsecutiveCorrect = prev.consecutiveCorrect + 1;
        if (newConsecutiveCorrect >= 7 && !prev.pendingLevelUp) {
          let levelUpData = null;
          if (currentDifficulty === "Easy") {
            levelUpData = {
              action: "changeDifficulty",
              from: "Easy",
              to: "Medium",
              emojis: "\u{1F60B}\u{1FA8F}\u{1F373}\u{1F95E}",
              title: "We're all out of easy problems because",
              allCapsTitle: "YOU JUST ATE THEM FOR BREAKFAST",
              subtitle: "Ready for medium?",
              options: { yes: "sounds delicious", no: "nah I'm good" }
            };
          } else if (currentDifficulty === "Medium") {
            levelUpData = {
              action: "changeDifficulty",
              from: "Medium",
              to: "Hard",
              emojis: "\u{1F4AA}\u{1F483}\u{1F30B}",
              title: "This medium world cannot contain you",
              subtitle: "Ready for hard?",
              options: { yes: "Let's ride", no: "This is my safe space" }
            };
          } else if (currentDifficulty === "Hard") {
            levelUpData = {
              action: "trySpeedChallenge",
              emojis: "\u{1F9E0}\u{1F9B5}\u{1F9B5}\u{1F971}",
              title: "Do your legs hurt from carrying that GIANT BRAIN all day???",
              subtitle: "Try a speed challenge?",
              options: { yes: "Feed my speed need", no: "Lemme practice more (I'm so scared)" }
            };
          }
          return {
            ...prev,
            consecutiveCorrect: 0,
            pendingLevelUp: levelUpData
          };
        }
        return { ...prev, consecutiveCorrect: newConsecutiveCorrect };
      });
    } else {
      setAdaptiveData((prev) => ({ ...prev, consecutiveCorrect: 0, streakPure: true }));
    }
  }, [currentProblem, currentDifficulty]);
  const handleLevelDifficultyChange = React.useCallback((level, difficulty, topic, scope) => {
    setCurrentLevel(level);
    setCurrentDifficulty(difficulty);
    setCurrentTopic(topic);
    const resolvedScope = scope !== void 0 ? scope : defaultScopeForTopic(topic);
    setCurrentScope(resolvedScope);
    currentScopeRef.current = resolvedScope;
    setProblemHistory([]);
    setAdaptiveData({
      consecutiveCorrect: 0,
      currentAdaptiveLevel: null,
      pendingLevelUp: null,
      streakPure: true
    });
    setScore({ correct: 0, total: 0 });
    setMissedProblems([]);
    handleNewProblem(level, difficulty, topic, resolvedScope);
  }, [handleNewProblem]);
  const handleReset = React.useCallback(() => {
    setScore({ correct: 0, total: 0 });
    setFeedback("");
    setEstimationTier(null);
    setEstimationDeviation(null);
    setShowAnswer(false);
    setAdaptiveData({
      consecutiveCorrect: 0,
      currentAdaptiveLevel: null,
      pendingLevelUp: null,
      streakPure: true
    });
    setMissedProblems([]);
    handleNewProblem();
  }, [handleNewProblem]);
  const handleLevelUp = React.useCallback((accept) => {
    if (!adaptiveData.pendingLevelUp) return;
    if (accept) {
      if (adaptiveData.pendingLevelUp.action === "changeDifficulty" && adaptiveData.pendingLevelUp.to) {
        handleLevelDifficultyChange(currentLevel, adaptiveData.pendingLevelUp.to, currentTopic, currentScope);
      }
    }
    setAdaptiveData((prev) => ({ ...prev, pendingLevelUp: null, consecutiveCorrect: 0, streakPure: true }));
  }, [adaptiveData.pendingLevelUp, currentLevel, currentTopic, currentScope, handleLevelDifficultyChange]);
  const taintStreak = React.useCallback(() => {
    setAdaptiveData((prev) => prev.streakPure ? { ...prev, streakPure: false } : prev);
  }, []);
  const value = {
    currentLevel,
    currentDifficulty,
    currentTopic,
    currentScope,
    currentProblem,
    userAnswer,
    setUserAnswer,
    feedback,
    estimationTier,
    estimationDeviation,
    score,
    showAnswer,
    adaptiveData,
    problemHistory,
    missedProblems,
    handleCheckAnswer,
    handleNewProblem,
    handleLevelDifficultyChange,
    handleReset,
    handleLevelUp,
    taintStreak
  };
  return /* @__PURE__ */ jsxRuntime.jsx(ProblemContext.Provider, { value, children });
}
function useProblem() {
  const context = React.useContext(ProblemContext);
  if (context === void 0) {
    throw new Error("useProblem must be used within a ProblemProvider");
  }
  return context;
}
var SpeedChallengeContext = React.createContext(void 0);
var SpeedChallengeProvider = ({ children }) => {
  const [speedChallenge, setSpeedChallenge] = React.useState({
    enabled: false,
    duration: 2,
    timeLeft: 0,
    isActive: false,
    results: null
  });
  const timerRef = React.useRef(null);
  const handleStartSpeedChallenge = React.useCallback(() => {
    setSpeedChallenge((prev) => ({
      ...prev,
      isActive: true,
      timeLeft: prev.duration * 60,
      results: null
    }));
  }, []);
  const clearSpeedChallengeResults = React.useCallback(() => {
    setSpeedChallenge((prev) => ({ ...prev, results: null }));
  }, []);
  React.useEffect(() => {
    if (speedChallenge.isActive && speedChallenge.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setSpeedChallenge((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1e3);
    } else if (speedChallenge.timeLeft <= 0 && speedChallenge.isActive) {
      setSpeedChallenge((prev) => ({
        ...prev,
        isActive: false,
        results: { ended: true }
      }));
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [speedChallenge.isActive, speedChallenge.timeLeft]);
  const value = {
    speedChallenge,
    setSpeedChallenge,
    handleStartSpeedChallenge,
    clearSpeedChallengeResults
  };
  return /* @__PURE__ */ jsxRuntime.jsx(SpeedChallengeContext.Provider, { value, children });
};
var useSpeedChallenge = () => {
  const context = React.useContext(SpeedChallengeContext);
  if (context === void 0) {
    throw new Error("useSpeedChallenge must be used within a SpeedChallengeProvider");
  }
  return context;
};
var TrainerModeContext = React__namespace.createContext(null);
function useTrainerMode() {
  const context = React__namespace.useContext(TrainerModeContext);
  if (!context) throw new Error("useTrainerMode must be used within TrainerModeProvider");
  return context;
}
function useTrainerModeOptional() {
  return React__namespace.useContext(TrainerModeContext);
}
function TrainerModeProvider({
  children,
  onSaveSession
}) {
  const [trainerMode, setTrainerMode] = React__namespace.useState("drill");
  const [drillStarted, setDrillStarted] = React__namespace.useState(false);
  const [targetProblemCount, setTargetProblemCount] = React__namespace.useState(10);
  const { handleReset } = useProblem();
  const startDrill = React__namespace.useCallback(() => {
    handleReset();
    setDrillStarted(true);
  }, [handleReset]);
  const endDrill = React__namespace.useCallback(() => {
    setDrillStarted(false);
  }, []);
  return /* @__PURE__ */ jsxRuntime.jsx(
    TrainerModeContext.Provider,
    {
      value: {
        trainerMode,
        setTrainerMode,
        drillStarted,
        targetProblemCount,
        setTargetProblemCount,
        startDrill,
        endDrill,
        onSaveSession
      },
      children
    }
  );
}
function MathmogTrainerProviders({
  children,
  onSaveSession
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(TrainerStateProvider, { children: /* @__PURE__ */ jsxRuntime.jsx(SpeedChallengeProvider, { children: /* @__PURE__ */ jsxRuntime.jsx(ProblemProvider, { children: /* @__PURE__ */ jsxRuntime.jsx(TrainerModeProvider, { onSaveSession, children }) }) }) });
}
function ScoreDisplay() {
  const ui = useMathmogUI();
  const { score } = useProblem();
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-6 flex justify-center items-center", children: /* @__PURE__ */ jsxRuntime.jsxs(
    ui.Badge,
    {
      variant: "outline",
      className: "px-4 py-2 text-base border-amber-200 bg-amber-50/50",
      "data-tour": "mathmog-score",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Target, { className: "w-5 h-5 mr-2 text-amber-600" }),
        "Score: ",
        score.correct,
        "/",
        score.total
      ]
    }
  ) });
}
function ElapsedTimer({ showTimer }) {
  const [elapsed, setElapsed] = React.useState(0);
  const startRef = React.useRef(Date.now());
  React.useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1e3));
    }, 1e3);
    return () => clearInterval(interval);
  }, []);
  if (!showTimer) return null;
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Timer, { className: "h-4 w-4" }),
    /* @__PURE__ */ jsxRuntime.jsxs("span", { "data-tour": "mathmog-elapsed", className: "tabular-nums font-medium", children: [
      m,
      ":",
      s.toString().padStart(2, "0")
    ] })
  ] });
}
function SpeedChallengeControls({
  isHomeworkMode = false
}) {
  const ui = useMathmogUI();
  const { speedChallenge, setSpeedChallenge } = useSpeedChallenge();
  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
  if (speedChallenge.isActive) {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        "data-tour": "mathmog-speed-active",
        className: "mb-6 flex items-center justify-center gap-3 px-4 py-2 rounded-lg bg-secondary w-full sm:w-auto",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Timer, { className: "w-5 h-5 text-primary" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono font-semibold text-lg", children: formatTime(speedChallenge.timeLeft) }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Progress,
            {
              value: speedChallenge.timeLeft / (speedChallenge.duration * 60) * 100,
              className: "w-24 h-2"
            }
          )
        ]
      }
    );
  }
  if (isHomeworkMode) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-4 flex items-center space-x-3", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      ui.Switch,
      {
        id: "speedChallenge-toggle",
        checked: speedChallenge.enabled,
        onCheckedChange: (checked) => setSpeedChallenge((prev) => ({ ...prev, enabled: !!checked, results: null })),
        "data-tour": "mathmog-speed-toggle"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(
      ui.Label,
      {
        htmlFor: "speedChallenge-toggle",
        className: "text-lg font-medium flex items-center gap-2 cursor-pointer",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Zap, { className: "w-5 h-5 text-amber-500" }),
          " Speed Challenge"
        ]
      }
    )
  ] });
}
function cn(...inputs) {
  return tailwindMerge.twMerge(clsx.clsx(inputs));
}
var levels = [
  { level: 1, name: "Memorize", Icon: lucideReact.Brain },
  { level: 2, name: "Estimate", Icon: lucideReact.Gauge },
  { level: 3, name: "Get Crafty", Icon: lucideReact.Wand2 }
];
var difficulties = ["Easy", "Medium", "Hard"];
function TrainerConfigSelector() {
  const ui = useMathmogUI();
  const {
    currentLevel,
    currentDifficulty,
    currentTopic,
    currentScope,
    handleLevelDifficultyChange
  } = useProblem();
  const { speedChallenge } = useSpeedChallenge();
  const availableTopics = getTopicsForLevel(currentLevel);
  const showDifficulty = !currentTopic || topicHasDifficulty(currentTopic);
  const topicValue = currentTopic ?? "all";
  const topicInfo = currentTopic ? getTopicInfo(currentTopic) : void 0;
  const topicScopes = topicInfo?.scopes ?? [];
  const showScope = topicScopes.length > 0;
  const visibleCount = 2 + (showScope ? 1 : 0) + (showDifficulty ? 1 : 0);
  const gridColsClass = visibleCount === 4 ? "sm:grid-cols-4" : visibleCount === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mb-6 space-y-4", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("grid grid-cols-1 gap-4", gridColsClass), children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "level-select", className: "mb-2 block", children: "Skill" }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        ui.Select,
        {
          value: String(currentLevel),
          onValueChange: (value) => handleLevelDifficultyChange(parseInt(value), currentDifficulty, void 0),
          disabled: speedChallenge.isActive,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.SelectTrigger, { id: "level-select", "data-tour": "mathmog-mode-select", children: /* @__PURE__ */ jsxRuntime.jsx(ui.SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.SelectContent, { children: levels.map(({ level, name, Icon }) => /* @__PURE__ */ jsxRuntime.jsx(ui.SelectItem, { value: String(level), children: /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx(Icon, { className: "w-4 h-4 text-muted-foreground" }),
              name
            ] }) }, level)) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "topic-select", className: "mb-2 block", children: "Topic" }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        ui.Select,
        {
          value: topicValue,
          onValueChange: (value) => handleLevelDifficultyChange(
            currentLevel,
            currentDifficulty,
            value === "all" ? void 0 : value
          ),
          disabled: speedChallenge.isActive,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.SelectTrigger, { id: "topic-select", "data-tour": "mathmog-topic-select", children: /* @__PURE__ */ jsxRuntime.jsx(ui.SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.SelectContent, { children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.SelectItem, { value: "all", children: "All topics" }),
              availableTopics.map((topic) => /* @__PURE__ */ jsxRuntime.jsx(ui.SelectItem, { value: topic.id, children: topic.label }, topic.id))
            ] })
          ]
        }
      )
    ] }),
    showScope && /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "scope-select", className: "mb-2 block", children: "Scope" }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        ui.Select,
        {
          value: currentScope ?? topicScopes[0]?.id ?? "",
          onValueChange: (value) => handleLevelDifficultyChange(
            currentLevel,
            currentDifficulty,
            currentTopic,
            value
          ),
          disabled: speedChallenge.isActive,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.SelectTrigger, { id: "scope-select", "data-tour": "mathmog-scope-select", children: /* @__PURE__ */ jsxRuntime.jsx(ui.SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.SelectContent, { children: topicScopes.map((scope) => /* @__PURE__ */ jsxRuntime.jsx(ui.SelectItem, { value: scope.id, children: scope.label }, scope.id)) })
          ]
        }
      )
    ] }),
    showDifficulty && /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { htmlFor: "difficulty-select", className: "mb-2 block", children: "Difficulty" }),
      /* @__PURE__ */ jsxRuntime.jsxs(
        ui.Select,
        {
          value: currentDifficulty,
          onValueChange: (value) => handleLevelDifficultyChange(currentLevel, value, currentTopic, currentScope),
          disabled: speedChallenge.isActive,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.SelectTrigger, { id: "difficulty-select", "data-tour": "mathmog-difficulty-select", children: /* @__PURE__ */ jsxRuntime.jsx(ui.SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.SelectContent, { children: difficulties.map((difficulty) => /* @__PURE__ */ jsxRuntime.jsx(ui.SelectItem, { value: difficulty, children: difficulty }, difficulty)) })
          ]
        }
      )
    ] })
  ] }) });
}
var LEVEL_NAMES = {
  1: "Memorize",
  2: "Estimate",
  3: "Get Crafty"
};
function SpeedChallengeReadyScreen({
  isHomeworkMode = false,
  homeworkLevelLabel,
  homeworkDifficulty,
  lockedDuration
}) {
  const ui = useMathmogUI();
  const { speedChallenge, setSpeedChallenge, handleStartSpeedChallenge } = useSpeedChallenge();
  const { currentLevel, currentDifficulty, handleNewProblem } = useProblem();
  const onStartChallenge = () => {
    handleStartSpeedChallenge();
    handleNewProblem();
  };
  const durationOptions = [
    { duration: 1, bolts: 1, label: "1 min" },
    { duration: 2, bolts: 2, label: "2 min" },
    { duration: 3, bolts: 3, label: "3 min" }
  ];
  const lockedLevelLabel = homeworkLevelLabel ?? LEVEL_NAMES[currentLevel] ?? `Level ${currentLevel}`;
  const lockedDifficultyLabel = homeworkDifficulty ?? currentDifficulty;
  const displayedDuration = lockedDuration ?? speedChallenge.duration;
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Card, { className: "border-primary/20 bg-secondary/50", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(ui.CardHeader, { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.CardTitle, { className: "text-2xl font-bold", children: isHomeworkMode ? "Homework: Speed Challenge!" : "Speed Challenge!" }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.CardDescription, { children: isHomeworkMode ? "Complete this assigned speed challenge." : "Test your speed and accuracy against the clock." })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.CardContent, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "max-w-md mx-auto space-y-6", children: [
      isHomeworkMode ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center space-y-2", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { variant: "secondary", className: "text-sm", children: lockedLevelLabel }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { variant: "secondary", className: "text-sm", children: lockedDifficultyLabel })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-lg font-semibold text-primary", children: [
          displayedDuration,
          " minute",
          displayedDuration !== 1 ? "s" : ""
        ] })
      ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(TrainerConfigSelector, {}),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { className: "mb-3 block text-center font-medium", children: "Select Duration" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2", children: durationOptions.map(({ duration, bolts, label }) => /* @__PURE__ */ jsxRuntime.jsxs(
            ui.Button,
            {
              onClick: () => setSpeedChallenge((prev) => ({ ...prev, duration })),
              variant: speedChallenge.duration === duration ? "default" : "outline",
              size: "lg",
              "data-tour": `mathmog-speed-duration-${duration}`,
              className: cn(
                "font-bold shadow-sm transition-all text-base",
                "hover:shadow-md",
                speedChallenge.duration === duration ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-inner" : "bg-background"
              ),
              children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex items-center gap-0.5 mr-1.5", children: Array.from({ length: bolts }).map((_, i) => /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Zap, { className: "w-4 h-4 text-amber-500" }, i)) }),
                label
              ]
            },
            duration
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-2 pt-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Button,
          {
            onClick: onStartChallenge,
            size: "lg",
            "data-tour": "mathmog-speed-start",
            className: "h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Timer, { className: "mr-2 h-5 w-5" }),
              " Start Challenge"
            ]
          }
        ),
        !isHomeworkMode && /* @__PURE__ */ jsxRuntime.jsx(
          ui.Button,
          {
            onClick: () => setSpeedChallenge((prev) => ({ ...prev, enabled: false })),
            variant: "ghost",
            children: "Back to Practice"
          }
        )
      ] })
    ] }) })
  ] });
}
function checkRetry(miss, retry) {
  const trimmed = retry.trim().toLowerCase();
  if (trimmed === "") return { isCorrect: false };
  const kind = miss.validationKind ?? "default";
  if (kind === "estimation" && typeof miss.correctAnswerNumeric === "number") {
    const userNum = parseFloat(trimmed);
    if (isNaN(userNum)) return { isCorrect: false };
    const exact = miss.correctAnswerNumeric;
    const deviation = exact === 0 ? Math.abs(userNum) : Math.abs((userNum - exact) / exact);
    const deviationPercent = Math.round(deviation * 1e3) / 10;
    return { isCorrect: deviation <= 0.1, deviationPercent };
  }
  if (kind === "fraction") {
    const parts = trimmed.split("/");
    if (parts.length !== 2) return { isCorrect: false };
    const num = parseInt(parts[0].trim(), 10);
    const den = parseInt(parts[1].trim(), 10);
    if (isNaN(num) || isNaN(den) || den === 0) return { isCorrect: false };
    return { isCorrect: simplifyFraction(num, den) === miss.correctAnswer };
  }
  if (kind === "number" && typeof miss.correctAnswerNumeric === "number") {
    const userNum = parseFloat(trimmed);
    if (isNaN(userNum)) {
      return { isCorrect: trimmed === miss.correctAnswer.toLowerCase() };
    }
    return { isCorrect: Math.abs(userNum - miss.correctAnswerNumeric) < 1e-4 };
  }
  if (kind === "multi-text") {
    const alternatives = miss.correctAnswer.split(" or ").map((s) => s.trim().toLowerCase()).filter((s) => s !== "");
    return { isCorrect: alternatives.includes(trimmed) };
  }
  if (kind === "root-estimation") {
    const userParts = trimmed.split(",").map((s) => s.trim());
    const correctParts = miss.correctAnswer.split(",").map((s) => s.trim().toLowerCase());
    if (userParts.length !== correctParts.length || userParts.length < 3) {
      return { isCorrect: false };
    }
    const userBetween = [userParts[0], userParts[1]].sort();
    const correctBetween = [correctParts[0], correctParts[1]].sort();
    const betweenMatch = userBetween[0] === correctBetween[0] && userBetween[1] === correctBetween[1];
    return { isCorrect: betweenMatch && userParts[2] === correctParts[2] };
  }
  return { isCorrect: trimmed === miss.correctAnswer.toLowerCase() };
}
function PerMiss({ miss, onAdvance }) {
  const ui = useMathmogUI();
  const [retry, setRetry] = React__namespace.useState("");
  const [revealed, setRevealed] = React__namespace.useState(false);
  const [retryAttempted, setRetryAttempted] = React__namespace.useState(false);
  const [retryFeedback, setRetryFeedback] = React__namespace.useState(null);
  const handleTryAgain = () => {
    const result = checkRetry(miss, retry);
    setRetryFeedback(result);
    setRetryAttempted(true);
    if (!result.isCorrect) {
      setRevealed(true);
    }
  };
  const handleShowAnswer = () => {
    setRevealed(true);
  };
  const studentAnswerLabel = miss.studentAnswer && miss.studentAnswer.trim() !== "" ? `You said: ${miss.studentAnswer}` : "You left this blank.";
  return /* @__PURE__ */ jsxRuntime.jsx(ui.Card, { className: "border-t-2 border-t-amber-300 shadow-sm", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.CardContent, { className: "pt-6 space-y-4", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-xs uppercase tracking-wide text-muted-foreground mb-2", children: "From your drill" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xl md:text-2xl font-bold", children: miss.prompt })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-muted-foreground text-center", children: studentAnswerLabel }),
    !revealed && !retryFeedback?.isCorrect ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "max-w-md mx-auto space-y-3", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Input,
        {
          value: retry,
          onChange: (e) => setRetry(e.target.value),
          onKeyPress: (e) => {
            if (e.key === "Enter" && retry.trim() !== "" && !retryAttempted) {
              handleTryAgain();
            }
          },
          placeholder: "Try the answer again...",
          className: "p-4 text-lg text-center h-14 focus-visible:ring-amber-500",
          disabled: retryAttempted,
          autoFocus: true
        }
      ),
      !retryAttempted && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col sm:flex-row gap-2 justify-center", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Button,
          {
            onClick: handleTryAgain,
            disabled: retry.trim() === "",
            className: "flex-1 sm:flex-initial sm:min-w-[140px]",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "w-4 h-4 mr-2" }),
              " Try again"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { onClick: handleShowAnswer, variant: "outline", children: "Show answer" })
      ] })
    ] }) : null,
    retryFeedback && !retryFeedback.isCorrect && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-sm text-amber-700 dark:text-amber-500 text-center", children: "Not quite. Here's the answer." }),
    revealed && /* @__PURE__ */ jsxRuntime.jsxs(ui.Alert, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.AlertTitle, { children: "Answer" }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.AlertDescription, { className: "font-medium", children: miss.correctAnswer })
    ] }),
    retryFeedback?.isCorrect && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center text-lg font-semibold text-green-600", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-2xl", children: "\u2705" }),
      " Correct \u2014 nice recovery!",
      retryFeedback.deviationPercent !== void 0 && retryFeedback.deviationPercent > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-sm text-muted-foreground font-normal mt-1", children: [
        retryFeedback.deviationPercent,
        "% off \u2014 within 10% counts as correct."
      ] })
    ] }),
    (revealed || retryFeedback?.isCorrect) && miss.explanation && /* @__PURE__ */ jsxRuntime.jsx(
      "p",
      {
        "data-noah": "mathmog-miss-explanation",
        className: "text-sm text-muted-foreground mt-2",
        children: miss.explanation
      }
    ),
    miss.deviationPercent !== void 0 && revealed && !retryFeedback?.isCorrect && /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-xs text-muted-foreground text-center", children: [
      "On your first try you were ",
      miss.deviationPercent,
      "% off. Within 10% counts as correct."
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-center pt-2", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Button, { onClick: onAdvance, variant: revealed || retryFeedback?.isCorrect ? "default" : "ghost", children: [
      "Next ",
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowRight, { className: "w-4 h-4 ml-2" })
    ] }) })
  ] }) });
}
function MissesReviewScreen({ misses, onDone }) {
  const ui = useMathmogUI();
  const [index, setIndex] = React__namespace.useState(0);
  const [keyEpoch, setKeyEpoch] = React__namespace.useState(0);
  const handleAdvance = React__namespace.useCallback(() => {
    if (index + 1 >= misses.length) {
      onDone();
      return;
    }
    setIndex((i) => i + 1);
    setKeyEpoch((k) => k + 1);
  }, [index, misses.length, onDone]);
  if (misses.length === 0) {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        "data-noah": "mathmog-misses-review",
        "data-tour": "mathmog-misses-review",
        className: "text-center space-y-4 py-8 max-w-md mx-auto",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-xl font-semibold", children: "Nothing to review" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-muted-foreground", children: "No misses from this drill. Nice work." }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { onClick: onDone, children: "Done" })
        ]
      }
    );
  }
  const currentMiss = misses[index];
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      "data-noah": "mathmog-misses-review",
      "data-tour": "mathmog-misses-review",
      className: "space-y-4",
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center text-sm text-muted-foreground", children: [
          "Reviewing miss ",
          index + 1,
          " of ",
          misses.length
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(PerMiss, { miss: currentMiss, onAdvance: handleAdvance }, keyEpoch)
      ]
    }
  );
}
function LevelUpDialog({
  suppressInHomework = false
} = {}) {
  const ui = useMathmogUI();
  const { adaptiveData, handleLevelUp } = useProblem();
  const { speedChallenge } = useSpeedChallenge();
  const { pendingLevelUp } = adaptiveData;
  if (!pendingLevelUp || speedChallenge.isActive || suppressInHomework) return null;
  return /* @__PURE__ */ jsxRuntime.jsx(ui.Dialog, { open: !!pendingLevelUp, onOpenChange: (open) => !open && handleLevelUp(false), children: /* @__PURE__ */ jsxRuntime.jsxs(ui.DialogContent, { className: "max-w-xl", "data-tour": "mathmog-levelup", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(ui.DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntime.jsxs(ui.DialogTitle, { className: "text-center text-2xl", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-4xl mb-4", children: pendingLevelUp.emojis }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-extrabold text-lg block", children: pendingLevelUp.title }),
        pendingLevelUp.allCapsTitle && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-extrabold text-lg block", children: pendingLevelUp.allCapsTitle })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.DialogDescription, { className: "text-center pt-2 text-primary font-semibold text-lg", children: pendingLevelUp.subtitle })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(ui.DialogFooter, { className: "flex-col sm:flex-row sm:justify-center gap-2 mt-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          type: "button",
          onClick: () => handleLevelUp(false),
          variant: "secondary",
          className: "w-full sm:w-auto",
          children: pendingLevelUp.options.no
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          type: "button",
          onClick: () => handleLevelUp(true),
          className: "w-full sm:w-auto bg-green-600 hover:bg-green-700",
          children: pendingLevelUp.options.yes
        }
      )
    ] })
  ] }) });
}
function MultiTextInput({ questionParts, onComplete, onCheck, disabled }) {
  const ui = useMathmogUI();
  const [answers, setAnswers] = React.useState(["", "", ""]);
  const inputRefs = React.useRef([]);
  React.useEffect(() => {
    setAnswers(["", "", ""]);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [questionParts]);
  const handleChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    onComplete(newAnswers.join(","));
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      if (index < 2) {
        inputRefs.current[index + 1]?.focus();
      } else {
        onCheck();
      }
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-2xl md:text-3xl font-bold text-center space-y-2", children: [
    questionParts[0],
    /* @__PURE__ */ jsxRuntime.jsx(
      ui.Input,
      {
        ref: (el) => {
          inputRefs.current[0] = el;
        },
        type: "text",
        value: answers[0],
        onChange: (e) => handleChange(0, e.target.value),
        onKeyDown: (e) => handleKeyDown(e, 0),
        className: "w-20 h-14 text-xl text-center mx-2 inline-block",
        disabled,
        autoFocus: true
      }
    ),
    questionParts[1],
    /* @__PURE__ */ jsxRuntime.jsx(
      ui.Input,
      {
        ref: (el) => {
          inputRefs.current[1] = el;
        },
        type: "text",
        value: answers[1],
        onChange: (e) => handleChange(1, e.target.value),
        onKeyDown: (e) => handleKeyDown(e, 1),
        className: "w-20 h-14 text-xl text-center mx-2 inline-block",
        disabled
      }
    ),
    questionParts[2],
    /* @__PURE__ */ jsxRuntime.jsx(
      ui.Input,
      {
        ref: (el) => {
          inputRefs.current[2] = el;
        },
        type: "text",
        value: answers[2],
        onChange: (e) => handleChange(2, e.target.value),
        onKeyDown: (e) => handleKeyDown(e, 2),
        className: "w-20 h-14 text-xl text-center mx-2 inline-block",
        disabled
      }
    ),
    questionParts[3]
  ] }) });
}
function formatProblemAnswer2(answer) {
  if (Array.isArray(answer)) return answer.map((a) => String(a)).join(" or ");
  return String(answer);
}
function ProblemDisplay({
  isHomeworkMode = false,
  hideLevelUpDialog = false
} = {}) {
  const ui = useMathmogUI();
  const {
    currentProblem,
    userAnswer,
    setUserAnswer,
    feedback,
    estimationTier,
    estimationDeviation,
    showAnswer,
    handleCheckAnswer,
    handleNewProblem,
    taintStreak
  } = useProblem();
  const { speedChallenge } = useSpeedChallenge();
  const inputRef = React.useRef(null);
  const [revealedAnswer, setRevealedAnswer] = React.useState(false);
  const showRevealControls = !isHomeworkMode && !speedChallenge.isActive;
  React.useEffect(() => {
    setRevealedAnswer(false);
  }, [currentProblem]);
  const onCheckAnswer = () => {
    handleCheckAnswer(userAnswer);
  };
  const onShowMe = () => {
    setRevealedAnswer(true);
    taintStreak();
  };
  const onSkip = () => {
    taintStreak();
    handleNewProblem();
  };
  React.useEffect(() => {
    if (feedback) return;
    if (currentProblem && (currentProblem.inputType === "text" || currentProblem.inputType === "number" || currentProblem.inputType === "multi-text")) {
      const firstInput = inputRef.current;
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }, [currentProblem, feedback]);
  React.useEffect(() => {
    if (speedChallenge.isActive && feedback) {
      const timer = setTimeout(() => {
        handleNewProblem();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [speedChallenge.isActive, feedback, handleNewProblem]);
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement?.tagName.toLowerCase() === "input") {
        return;
      }
      if ((feedback || revealedAnswer) && e.key === "Enter") {
        handleNewProblem();
        return;
      }
      if (currentProblem?.inputType === "buttons" && !feedback && !revealedAnswer) {
        if (e.key.toLowerCase() === "y") {
          handleCheckAnswer("yes");
        } else if (e.key.toLowerCase() === "n") {
          handleCheckAnswer("no");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentProblem, feedback, revealedAnswer, handleCheckAnswer, handleNewProblem]);
  if (!currentProblem) {
    return hideLevelUpDialog ? null : /* @__PURE__ */ jsxRuntime.jsx(LevelUpDialog, { suppressInHomework: isHomeworkMode });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    ui.Card,
    {
      className: `border-t-2 border-t-amber-300 shadow-md ${speedChallenge.isActive ? "" : "transition-all duration-500"} ${feedback && !estimationTier ? feedback === "correct" ? "animate-mog-correctFlash" : "animate-mog-incorrectFlash" : ""}`,
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(ui.CardHeader, { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mx-auto", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { className: "bg-amber-50 text-amber-700 border-amber-200 border", children: currentProblem.type }) }),
          currentProblem.inputType !== "multi-text" && /* @__PURE__ */ jsxRuntime.jsx(
            ui.CardTitle,
            {
              "data-tour": "mathmog-question",
              className: "text-2xl md:text-3xl font-bold pt-2",
              children: currentProblem.question
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs(ui.CardContent, { children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "max-w-md mx-auto px-4", children: [
            currentProblem.inputType === "buttons" ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex gap-3 justify-center", children: currentProblem.options?.map((option) => /* @__PURE__ */ jsxRuntime.jsx(
              ui.Button,
              {
                size: "lg",
                onClick: () => handleCheckAnswer(option),
                disabled: feedback !== "" || revealedAnswer,
                variant: userAnswer === option ? "default" : "secondary",
                className: "text-xl min-w-[120px]",
                children: option.charAt(0).toUpperCase() + option.slice(1)
              },
              option
            )) }) : currentProblem.inputType === "multi-text" && Array.isArray(currentProblem.question) ? /* @__PURE__ */ jsxRuntime.jsx(
              MultiTextInput,
              {
                questionParts: currentProblem.question,
                onComplete: setUserAnswer,
                onCheck: onCheckAnswer,
                disabled: feedback !== "" || revealedAnswer
              }
            ) : /* @__PURE__ */ jsxRuntime.jsx(
              ui.Input,
              {
                ref: inputRef,
                type: currentProblem.inputType,
                value: userAnswer,
                onChange: (e) => setUserAnswer(e.target.value),
                onKeyPress: (e) => {
                  if (e.key === "Enter") {
                    if (feedback || revealedAnswer) {
                      handleNewProblem();
                    } else {
                      onCheckAnswer();
                    }
                  }
                },
                placeholder: currentProblem.placeholder || "Your answer...",
                "data-tour": "mathmog-answer-input",
                className: "p-4 text-xl text-center h-14 focus-visible:ring-amber-500",
                disabled: feedback !== "" || revealedAnswer
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col sm:flex-row gap-3 mt-4", children: !feedback && !revealedAnswer ? /* @__PURE__ */ jsxRuntime.jsxs(
              ui.Button,
              {
                onClick: onCheckAnswer,
                disabled: userAnswer.trim() === "" || currentProblem.inputType === "buttons",
                "data-tour": "mathmog-check",
                className: "flex-1 text-lg h-14 sm:h-11 px-8",
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "w-5 h-5 mr-2" }),
                  " Check Answer"
                ]
              }
            ) : (feedback || revealedAnswer) && !speedChallenge.isActive ? /* @__PURE__ */ jsxRuntime.jsxs(
              ui.Button,
              {
                onClick: () => handleNewProblem(),
                "data-tour": "mathmog-next",
                className: "flex-1 text-lg bg-green-600 hover:bg-green-700 h-14 sm:h-11 px-8",
                children: [
                  "Next Problem ",
                  /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowRight, { className: "w-5 h-5 ml-2" })
                ]
              }
            ) : null }),
            showRevealControls && !feedback && !revealedAnswer && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-row gap-2 justify-center mt-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                ui.Button,
                {
                  onClick: onShowMe,
                  variant: "ghost",
                  size: "sm",
                  "data-tour": "mathmog-show-me",
                  children: "Show me"
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                ui.Button,
                {
                  onClick: onSkip,
                  variant: "ghost",
                  size: "sm",
                  "data-tour": "mathmog-skip",
                  children: "Skip"
                }
              )
            ] })
          ] }),
          revealedAnswer && !feedback && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-6 space-y-3 text-center", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Alert, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.AlertTitle, { children: "Answer" }),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.AlertDescription, { className: "text-left", children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "font-medium", children: formatProblemAnswer2(currentProblem.answer) }),
              currentProblem.explanation && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-2", children: currentProblem.explanation })
            ] })
          ] }) }),
          feedback && !speedChallenge.isActive && /* @__PURE__ */ jsxRuntime.jsxs("div", { "data-tour": "mathmog-feedback", className: "mt-6 space-y-3 text-center", children: [
            estimationTier && estimationTier !== "outside" ? (
              // Tiered estimation feedback — all within 10% count as correct
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-lg font-semibold text-green-600", children: [
                estimationTier === "exact" && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-2xl", children: "\u{1F3AF}\u{1F92F}" }),
                  " You are, in fact, psychic",
                  /* @__PURE__ */ jsxRuntime.jsx("br", {}),
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-base font-medium", children: "Exactly correct" })
                ] }),
                estimationTier === "within2" && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-2xl", children: "\u{1F52E}\u{1F441}\uFE0F" }),
                  " Are you psychic?",
                  /* @__PURE__ */ jsxRuntime.jsx("br", {}),
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-base font-medium", children: "Within 2% of the exact answer" })
                ] }),
                estimationTier === "within5" && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-2xl", children: "\u{1F440}" }),
                  " You are SO close",
                  /* @__PURE__ */ jsxRuntime.jsx("br", {}),
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-base font-medium", children: "Within 5% of the exact answer" })
                ] }),
                estimationTier === "within10" && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-2xl", children: "\u{1F62E}" }),
                  " Not bad!",
                  /* @__PURE__ */ jsxRuntime.jsx("br", {}),
                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-base font-medium", children: "Within 10% of the exact answer" })
                ] })
              ] })
            ) : estimationTier === "outside" && feedback === "correct" ? (
              // Outside the 10% display band but still within the problem's
              // wider tolerance (e.g. 20% for multiplication estimation,
              // 25% for fraction estimation). Acknowledge correctness while
              // nudging toward tighter estimates.
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-lg font-semibold text-green-600", children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-2xl", children: "\u2705" }),
                " Correct!",
                /* @__PURE__ */ jsxRuntime.jsx("br", {}),
                /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-base font-medium", children: [
                  "Your estimate was",
                  " ",
                  estimationDeviation !== null ? `${estimationDeviation.toFixed(1)}%` : "more than 10%",
                  " ",
                  "off \u2014 keep pushing to land inside 10%"
                ] })
              ] })
            ) : estimationTier === "outside" ? (
              // Estimation answer outside 10% AND outside the problem's
              // tolerance — warm/constructive.
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-lg font-semibold text-amber-600 dark:text-amber-500", children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-2xl", children: "\u{1F4AA}" }),
                " Keep at it!",
                /* @__PURE__ */ jsxRuntime.jsx("br", {}),
                /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-base font-medium", children: [
                  "Your estimate was",
                  " ",
                  estimationDeviation !== null ? `${estimationDeviation.toFixed(1)}%` : "more than 10%",
                  " ",
                  "off \u2014 try to get within 10%"
                ] })
              ] })
            ) : (
              // Non-estimation feedback (standard correct/incorrect)
              /* @__PURE__ */ jsxRuntime.jsx(
                "div",
                {
                  className: `text-lg font-semibold ${feedback === "correct" ? "text-green-600" : "text-amber-600 dark:text-amber-500"}`,
                  children: feedback === "correct" ? "\u2705 Correct!" : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-2xl", children: "\u{1F4AA}" }),
                    " Not quite!"
                  ] })
                }
              )
            ),
            showAnswer && /* @__PURE__ */ jsxRuntime.jsxs(
              ui.Alert,
              {
                variant: estimationTier === "outside" ? "default" : feedback === "correct" ? "default" : "destructive",
                className: "text-left",
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.AlertTitle, { children: "Explanation" }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.AlertDescription, { children: currentProblem.explanation })
                ]
              }
            )
          ] }),
          !hideLevelUpDialog && /* @__PURE__ */ jsxRuntime.jsx(LevelUpDialog, { suppressInHomework: isHomeworkMode })
        ] })
      ]
    }
  );
}
var PrintableContext = React__namespace.createContext(false);
function PrintableStudyGuideProvider({ children }) {
  return /* @__PURE__ */ jsxRuntime.jsx(PrintableContext.Provider, { value: true, children });
}
function PrintableAccordion({ children, ...props }) {
  const ui = useMathmogUI();
  const printable = React__namespace.useContext(PrintableContext);
  if (!printable) {
    return /* @__PURE__ */ jsxRuntime.jsx(ui.Accordion, { ...props, children });
  }
  const values = [];
  React__namespace.Children.forEach(children, (child) => {
    if (React__namespace.isValidElement(child)) {
      const v = child.props.value;
      if (typeof v === "string" && !values.includes(v)) values.push(v);
    }
  });
  const printProps = {
    ...props,
    type: "multiple",
    defaultValue: values,
    collapsible: void 0
  };
  return /* @__PURE__ */ jsxRuntime.jsx(ui.Accordion, { ...printProps, children });
}
function StudySection({
  title,
  children,
  className
}) {
  const ui = useMathmogUI();
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Card, { className, children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.CardHeader, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.CardTitle, { className: "text-xl text-primary", children: title }) }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.CardContent, { children })
  ] });
}
var MemorizeContent = () => {
  const ui = useMathmogUI();
  const higherPowers = {
    "2": { "4": 16, "5": 32, "6": 64, "7": 128, "8": 256, "9": 512 },
    "3": { "4": 81, "5": 243, "6": 729 },
    "4": { "4": 256 },
    "5": { "4": 625 },
    "6": { "4": 1296 }
  };
  const importantSquares = {
    24: 576,
    25: 625,
    27: 729,
    36: 1296,
    40: 1600,
    41: 1681
  };
  const memorizedMultiplicationExamples = [
    { q: "13 \xD7 3", a: 39 },
    { q: "13 \xD7 4", a: 52 },
    { q: "13 \xD7 5", a: 65 },
    { q: "14 \xD7 3", a: 42 },
    { q: "14 \xD7 4", a: 56 },
    { q: "14 \xD7 5", a: 70 },
    { q: "15 \xD7 3", a: 45 },
    { q: "15 \xD7 4", a: 60 },
    { q: "15 \xD7 5", a: 75 },
    { q: "15 \xD7 6", a: 90 },
    { q: "15 \xD7 7", a: 105 },
    { q: "15 \xD7 8", a: 120 },
    { q: "15 \xD7 9", a: 135 },
    { q: "16 \xD7 2", a: 32 },
    { q: "16 \xD7 3", a: 48 },
    { q: "16 \xD7 4", a: 64 },
    { q: "16 \xD7 5", a: 80 },
    { q: "16 \xD7 6", a: 96 },
    { q: "16 \xD7 7", a: 112 },
    { q: "16 \xD7 8", a: 128 },
    { q: "16 \xD7 9", a: 144 },
    { q: "17 \xD7 3", a: 51 },
    { q: "17 \xD7 4", a: 68 },
    { q: "17 \xD7 5", a: 85 },
    { q: "18 \xD7 3", a: 54 },
    { q: "18 \xD7 4", a: 72 },
    { q: "18 \xD7 5", a: 90 },
    { q: "19 \xD7 3", a: 57 },
    { q: "19 \xD7 4", a: 76 },
    { q: "19 \xD7 5", a: 95 },
    { q: "24 \xD7 3", a: 72 },
    { q: "24 \xD7 4", a: 96 },
    { q: "24 \xD7 5", a: 120 },
    { q: "27 \xD7 3", a: 81 },
    { q: "27 \xD7 4", a: 108 },
    { q: "27 \xD7 5", a: 135 },
    { q: "32 \xD7 3", a: 96 },
    { q: "32 \xD7 4", a: 128 },
    { q: "32 \xD7 5", a: 160 },
    { q: "36 \xD7 3", a: 108 },
    { q: "36 \xD7 4", a: 144 },
    { q: "36 \xD7 5", a: 180 }
  ];
  const groupedMultiples = memorizedMultiplicationExamples.reduce((acc, { q, a }) => {
    const base = q.split(" ")[0];
    if (!acc[base]) {
      acc[base] = [];
    }
    acc[base].push({ q, a });
    return acc;
  }, {});
  const superscriptMap2 = {
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
  const toSuperscript2 = (n) => String(n).split("").map((char) => superscriptMap2[char]).join("");
  const timesTablesFactors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const isHardRow = (n) => n >= 6 && n <= 9;
  const isHardCell = (row, col) => isHardRow(row) && isHardRow(col);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntime.jsx(StudySection, { title: "Memorization Facts", children: /* @__PURE__ */ jsxRuntime.jsxs(PrintableAccordion, { type: "single", collapsible: true, className: "w-full", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "times-tables", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Times Tables (1\xD7 through 12\xD7)" }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionContent, { children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "Every single-digit multiplication fact in one grid. The shaded rows (6 through 9) are the ones students forget most often. If you can read a fact off the grid without thinking, that's one you've got." }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Table, { children: /* @__PURE__ */ jsxRuntime.jsxs(ui.TableBody, { children: [
          /* @__PURE__ */ jsxRuntime.jsxs(ui.TableRow, { className: "font-mono text-xs sm:text-sm", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.TableCell, { className: "font-semibold text-muted-foreground px-2 py-1", children: "\xD7" }),
            timesTablesFactors.map((col) => /* @__PURE__ */ jsxRuntime.jsx(
              ui.TableCell,
              {
                className: `font-semibold px-2 py-1 text-center ${col === 1 ? "text-muted-foreground/70" : "text-muted-foreground"}`,
                children: col
              },
              col
            ))
          ] }),
          timesTablesFactors.map((row) => /* @__PURE__ */ jsxRuntime.jsxs(
            ui.TableRow,
            {
              className: `font-mono text-xs sm:text-sm ${isHardRow(row) ? "bg-amber-50 dark:bg-amber-900/20" : ""} ${row === 1 ? "text-foreground/70" : ""}`,
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.TableCell, { className: "font-semibold px-2 py-1", children: row }),
                timesTablesFactors.map((col) => /* @__PURE__ */ jsxRuntime.jsx(
                  ui.TableCell,
                  {
                    className: `px-2 py-1 text-center ${isHardCell(row, col) ? "bg-amber-100 dark:bg-amber-900/40 font-semibold" : ""} ${col === 1 && row !== 1 ? "text-foreground/70" : ""}`,
                    children: row * col
                  },
                  col
                ))
              ]
            },
            row
          ))
        ] }) }) }),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-sm text-muted-foreground mt-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold text-foreground", children: "Often-mixed-up facts:" }),
          " ",
          "7 \xD7 8 = 56 (not 54). 6 \xD7 9 = 54 (not 56). 8 \xD7 8 = 64. 7 \xD7 7 = 49."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Perfect Squares (1-20)" }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionContent, { children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "The shaded row (16\xB2 through 20\xB2) is where most students hesitate. The rest tend to come back fast once you've seen them a few times." }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Table, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.TableBody, { children: [
          [1, 2, 3, 4, 5],
          [6, 7, 8, 9, 10],
          [11, 12, 13, 14, 15],
          [16, 17, 18, 19, 20]
        ].map((row, rowIndex) => /* @__PURE__ */ jsxRuntime.jsx(
          ui.TableRow,
          {
            className: `font-mono text-sm ${rowIndex === 3 ? "bg-amber-50 dark:bg-amber-900/20" : "even:bg-muted/50"}`,
            children: row.map((base) => /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
              /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-semibold", children: [
                base,
                "\xB2"
              ] }),
              " = ",
              perfectSquares[base]
            ] }, base))
          },
          rowIndex
        )) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Perfect Cubes (1-10)" }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionContent, { children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "The shaded row (6\xB3 through 10\xB3) is the harder half. 6\xB3 = 216 is where most students stall." }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Table, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.TableBody, { children: [
          [1, 2, 3, 4, 5],
          [6, 7, 8, 9, 10]
        ].map((row, rowIndex) => /* @__PURE__ */ jsxRuntime.jsx(
          ui.TableRow,
          {
            className: `font-mono text-sm ${rowIndex === 1 ? "bg-amber-50 dark:bg-amber-900/20" : ""}`,
            children: row.map((base) => /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
              /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-semibold", children: [
                base,
                "\xB3"
              ] }),
              " = ",
              perfectCubes[base]
            ] }, base))
          },
          rowIndex
        )) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-3", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Common Fraction Conversions" }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionContent, { children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Note: For repeating decimals, rounded or truncated answers are often accepted in practice mode." }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Table, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.TableBody, { children: commonFractionConversions.reduce((acc, _, index, array) => {
          if (index % 2 === 0) {
            acc.push(array.slice(index, index + 2));
          }
          return acc;
        }, []).map((row, rowIndex) => /* @__PURE__ */ jsxRuntime.jsx(ui.TableRow, { className: "font-mono text-sm even:bg-muted/50", children: row.map(({ frac, decimal, percent }) => /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold", children: frac }),
          " = ",
          decimal,
          " = ",
          percent
        ] }, frac)) }, rowIndex)) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Advanced Memorization" }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionContent, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "font-semibold mb-2", children: "Higher Powers" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table, { children: /* @__PURE__ */ jsxRuntime.jsxs(ui.TableBody, { children: [
            /* @__PURE__ */ jsxRuntime.jsxs(ui.TableRow, { className: "font-mono text-sm even:bg-muted/50", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.TableCell, { className: "font-semibold", children: "Base 2" }),
              Object.entries(higherPowers["2"]).map(([exponent, result]) => /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
                /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-semibold", children: [
                  "2",
                  toSuperscript2(exponent)
                ] }),
                " = ",
                result
              ] }, exponent))
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.TableRow, { className: "font-mono text-sm even:bg-muted/50", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.TableCell, { className: "font-semibold", children: "Base 3" }),
              Object.entries(higherPowers["3"]).map(([exponent, result]) => /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
                /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-semibold", children: [
                  "3",
                  toSuperscript2(exponent)
                ] }),
                " = ",
                result
              ] }, exponent))
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.TableRow, { className: "font-mono text-sm even:bg-muted/50", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.TableCell, { className: "font-semibold", children: "Other Bases" }),
              Object.entries(higherPowers["4"]).map(([exponent, result]) => /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
                /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-semibold", children: [
                  "4",
                  toSuperscript2(exponent)
                ] }),
                " = ",
                result
              ] }, exponent)),
              Object.entries(higherPowers["5"]).map(([exponent, result]) => /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
                /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-semibold", children: [
                  "5",
                  toSuperscript2(exponent)
                ] }),
                " = ",
                result
              ] }, exponent)),
              Object.entries(higherPowers["6"]).map(([exponent, result]) => /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
                /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-semibold", children: [
                  "6",
                  toSuperscript2(exponent)
                ] }),
                " = ",
                result
              ] }, exponent))
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "pt-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "font-semibold mb-2", children: "Important Squares" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table, { children: /* @__PURE__ */ jsxRuntime.jsxs(ui.TableBody, { className: "font-mono text-sm", children: [
            /* @__PURE__ */ jsxRuntime.jsxs(ui.TableRow, { className: "even:bg-muted/50", children: [
              /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold", children: "24\xB2" }),
                " = ",
                importantSquares[24]
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold", children: "25\xB2" }),
                " = ",
                importantSquares[25]
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.TableCell, { className: "text-xs text-muted-foreground italic", children: "from the 7-24-25 Pythagorean triple" })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.TableRow, { className: "even:bg-muted/50", children: [
              /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold", children: "27\xB2" }),
                " = ",
                importantSquares[27]
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.TableCell, { className: "text-xs text-muted-foreground italic", children: "(same as 3\u2076 and 9\xB3)" }),
              /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold", children: "36\xB2" }),
                " = ",
                importantSquares[36],
                " ",
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs text-muted-foreground italic", children: "(same as 6\u2074)" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.TableRow, { className: "even:bg-muted/50", children: [
              /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold", children: "40\xB2" }),
                " = ",
                importantSquares[40]
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold", children: "41\xB2" }),
                " = ",
                importantSquares[41]
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.TableCell, { className: "text-xs text-muted-foreground italic", children: "from the 9-40-41 Pythagorean triple" })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "pt-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "font-semibold mb-2", children: "Common Multiples" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "It's useful to memorize certain multiplication facts that appear often." }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Table, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.TableBody, { children: Object.entries(groupedMultiples).map(([base, multiples]) => /* @__PURE__ */ jsxRuntime.jsxs(ui.TableRow, { className: "font-mono text-sm even:bg-muted/50", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.TableCell, { className: "font-semibold", children: base }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.TableCell, { className: "grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1", children: multiples.map(({ q, a }) => /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              q.replace("\xD7", "\xD7 "),
              " = ",
              a
            ] }, q)) })
          ] }, base)) }) })
        ] })
      ] }) })
    ] })
  ] }) }) });
};
var EstimateContent = () => {
  const ui = useMathmogUI();
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntime.jsx(StudySection, { title: "Smart Estimation Strategies", children: /* @__PURE__ */ jsxRuntime.jsxs(PrintableAccordion, { type: "single", collapsible: true, className: "w-full", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Multiplication Estimation" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionContent, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md text-sm", children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "font-semibold", children: "Round to friendly numbers, check your bounds:" }),
          /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "mb-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("strong", { children: "Example:" }),
            " 82 x 37"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("ul", { className: "list-disc list-inside space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Round down: 80 x 30 = 2,400" }),
            /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Round up: 90 x 40 = 3,600" }),
            /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Answer should be between 2,400 and 3,600" }),
            /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Best estimate: 80 x 40 = 3,200 (actual: 3,034)" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-amber-800 dark:text-amber-400 mt-3", children: 'Strategy: Use "friendly" numbers (multiples of 10) to create upper and lower bounds, then pick the best estimate' })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Square Root Estimation" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionContent, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md text-sm", children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "font-semibold", children: "Use perfect squares as anchors:" }),
          /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "mb-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("strong", { children: "Example:" }),
            " \u221A151"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("ul", { className: "list-disc list-inside space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Know that 12\xB2 = 144 and 13\xB2 = 169" }),
            /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Since 151 is between 144 and 169, \u221A151 is between 12 and 13" }),
            /* @__PURE__ */ jsxRuntime.jsx("li", { children: "151 is closer to 144, so \u221A151 \u2248 12.2" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-amber-800 dark:text-amber-400 mt-3", children: "Pro Tip: 13\xB2 - 12\xB2 = 25, so each 0.1 from 12 \u2248 2.5 units" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-3", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Fraction Estimation" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionContent, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md text-sm", children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "font-semibold", children: 'Round to a nearby "benchmark" fraction:' }),
          /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "mb-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("strong", { children: "Example:" }),
            " 26/74"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("ul", { className: "list-disc list-inside space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Recognize that 26/74 is very close to 25/75." }),
            /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Simplify the benchmark: 25/75 = 1/3." }),
            /* @__PURE__ */ jsxRuntime.jsx("li", { children: "So, 26/74 is approximately 0.33. (Actual: 0.35)" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs text-amber-800 dark:text-amber-400 mt-3", children: "Common benchmarks: 1/4, 1/3, 1/2, 2/3, 3/4" })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsx(StudySection, { title: "Lightning-Fast Percentage Calculations", children: /* @__PURE__ */ jsxRuntime.jsxs(PrintableAccordion, { type: "single", collapsible: true, className: "w-full", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "The 10% + 1% Method" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionContent, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-sky-50 dark:bg-sky-900/20 p-4 rounded-md", children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "font-semibold", children: "Example: 23% of 400" }),
          /* @__PURE__ */ jsxRuntime.jsxs("ol", { className: "list-decimal list-inside space-y-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Find 10%: 400 \u2192 40" }),
            /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Find 1%: 400 \u2192 4" }),
            /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Calculate: (2 x 40) + (3 x 4) = 80 + 12 = 92" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Other Quick Percentages" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionContent, { children: /* @__PURE__ */ jsxRuntime.jsxs("ul", { className: "list-disc list-inside space-y-2", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntime.jsx("strong", { children: "15%:" }),
            " 10% + 5% (half of 10%)"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntime.jsx("strong", { children: "25%:" }),
            " Divide by 4"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntime.jsx("strong", { children: "45%:" }),
            " 50% - 5%"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntime.jsx("strong", { children: "50%:" }),
            " Divide by 2"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntime.jsx("strong", { children: "75%:" }),
            " 25% x 3 (or 50% + 25%)"
          ] })
        ] }) })
      ] })
    ] }) })
  ] });
};
var CraftyContent = () => {
  const ui = useMathmogUI();
  const strategies = [
    { title: "Multiplying by 4", example: "Double the number twice.", calculation: "e.g., 35 \xD7 4 \u2192 35\xD72=70 \u2192 70\xD72=140" },
    { title: "Dividing by 4", example: "Halve the number twice.", calculation: "e.g., 180 \xF7 4 \u2192 180\xF72=90 \u2192 90\xF72=45" },
    { title: "Multiplying by 5", example: "Multiply by 10, then divide by 2.", calculation: "e.g., 84 \xD7 5 \u2192 84\xD710 \xF7 2 = 840 \xF7 2 = 420" },
    { title: "Dividing by 5", example: "Divide by 10, then multiply by 2.", calculation: "e.g., 420 \xF7 5 \u2192 420\xF710 \xD7 2 = 42 \xD7 2 = 84" },
    { title: "Multiplying by 8", example: "Double the number three times.", calculation: "e.g., 15 \xD7 8 \u2192 15\xD72=30 \u2192 30\xD72=60 \u2192 60\xD72=120" },
    { title: "Dividing by 8", example: "Halve the number three times.", calculation: "e.g., 240 \xF7 8 \u2192 240\xF72=120 \u2192 120\xF72=60 \u2192 60\xF72=30" },
    { title: "Multiplying by 9", example: "Multiply by 10, then subtract the original number.", calculation: "e.g., 23 \xD7 9 \u2192 23\xD710 - 23 = 230 - 23 = 207" },
    { title: "Multiplying by 11", example: "For a 2-digit number (AB), the answer is A(A+B)B. If A+B > 9, carry the one.", calculation: "e.g., 43 \xD7 11 \u2192 4 (4+3) 3 \u2192 473\ne.g., 85 \xD7 11 \u2192 8 (8+5) 5 \u2192 8 (13) 5 \u2192 935" },
    { title: "Multiplying by 12", example: "Multiply by 10, then add double the original number.", calculation: "e.g., 35 \xD7 12 \u2192 35\xD710 + 35\xD72 = 350 + 70 = 420" },
    { title: "Dividing by 12", example: "If a number is divisible by both 3 and 4, you can divide by 12. Halve it, then divide by 6, or divide by 2, then 2, then 3.", calculation: "e.g., 552 \xF7 12 \u2192 552\xF76 = 92 \u2192 92\xF72 = 46" },
    { title: "Multiplying by 15", example: "Multiply by 10, then add half of that result.", calculation: "e.g., 42 \xD7 15 \u2192 42\xD710 + (420/2) = 420 + 210 = 630" },
    { title: "Multiplying by 25", example: "Multiply by 100, then divide by 4.", calculation: "e.g., 36 \xD7 25 \u2192 36\xD7100 \xF7 4 = 3600 \xF7 4 = 900" },
    { title: "Multiplying by 19 / 99", example: "Multiply by the next round number (20 / 100), then subtract the original number.", calculation: "e.g., 16 \xD7 19 \u2192 16\xD720 - 16 = 320 - 16 = 304\ne.g., 18 \xD7 99 \u2192 18\xD7100 - 18 = 1782" },
    { title: "Squaring numbers ending in 5", example: 'Take the tens digit (T), calculate T \xD7 (T+1), then append "25".', calculation: "e.g., 35\xB2 \u2192 3\xD7(3+1) & 25 \u2192 12 & 25 \u2192 1225\ne.g., 85\xB2 \u2192 8\xD7(8+1) & 25 \u2192 72 & 25 \u2192 7225" },
    { title: "Complementary Multiplication (Difference of Squares)", example: "For two numbers that are equally distant from a round number (like a multiple of 10 or 5), you can use the formula (x-d)(x+d) = x\xB2 - d\xB2.", calculation: "e.g., 23 \xD7 27 \u2192 (25-2)\xD7(25+2) = 25\xB2 - 2\xB2 = 625 - 4 = 621\ne.g., 72 \xD7 78 \u2192 (75-3)\xD7(75+3) = 75\xB2 - 3\xB2 = 5625 - 9 = 5616" }
  ];
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntime.jsx(StudySection, { title: "\u{1F4A1} Pro Tips & Strategies", children: /* @__PURE__ */ jsxRuntime.jsx(PrintableAccordion, { type: "single", collapsible: true, className: "w-full", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Strategic Multiplication & Division" }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionContent, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Table, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.TableBody, { children: strategies.map(({ title, example, calculation }, index) => /* @__PURE__ */ jsxRuntime.jsxs(ui.TableRow, { className: "even:bg-muted/50", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(ui.TableCell, { children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "font-semibold", children: title }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-muted-foreground", children: example })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.TableCell, { className: "font-mono text-sm text-foreground/80 whitespace-pre-line", children: calculation })
      ] }, index)) }) }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntime.jsx(StudySection, { title: "\u{1F522} Basic Divisibility Rules", children: /* @__PURE__ */ jsxRuntime.jsxs(PrintableAccordion, { type: "single", collapsible: true, className: "w-full", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Divisibility by 3" }),
        /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionContent, { children: [
          "If the sum of the digits is divisible by 3, the number is too.",
          " ",
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: "(e.g., 462 \u2192 4+6+2=12)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Divisibility by 4" }),
        /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionContent, { children: [
          "Since 20 is divisible by 4, every multiple of 20 is too. Because 100 is a multiple of 20, we only need to check the last two digits.",
          /* @__PURE__ */ jsxRuntime.jsx("br", {}),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: "e.g., 1,236 \u2192 1200 + 36. Both 1200 and 36 are divisible by 4, so 1,236 is too." }),
          /* @__PURE__ */ jsxRuntime.jsx("br", {}),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: "e.g., 1,262 \u2192 1200 + 62. 1200 is divisible by 4, but 62 is not. So 1,262 is not." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-3", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Divisibility by 5" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionContent, { children: "If the number ends in a 0 or 5." })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-4", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Divisibility by 6" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionContent, { children: "If the number is divisible by both 2 (is even) and 3." })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-5", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Divisibility by 8" }),
        /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionContent, { children: [
          "Since 40 is divisible by 8, every multiple of 40 is too. Because 200 is a multiple of 40, we only need to check the last three digits.",
          /* @__PURE__ */ jsxRuntime.jsx("br", {}),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: "e.g., 136 \u2192 120 + 16. Since 120 (3x40) and 16 are divisible by 8, 136 is too." }),
          /* @__PURE__ */ jsxRuntime.jsx("br", {}),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: "e.g., 12,336 \u2192 We check the last three digits: 336. Since 336 = 200 + 136, and both 200 and 136 are divisible by 8, then 336 is divisible by 8, so 12,336 is too." }),
          /* @__PURE__ */ jsxRuntime.jsx("br", {}),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: "Alternatively, it's often easier to just halve the number three times. If you get a whole number, it's divisible." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-6", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Divisibility by 9" }),
        /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionContent, { children: [
          "If the sum of the digits is divisible by 9.",
          " ",
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: "(e.g., 1,782 \u2192 1+7+8+2=18)" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsx(StudySection, { title: "\u{1F522} Advanced Divisibility Rules", children: /* @__PURE__ */ jsxRuntime.jsxs(PrintableAccordion, { type: "single", collapsible: true, className: "w-full", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Divisibility by 7" }),
        /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionContent, { children: [
          "Multiply the last digit by 5 and add it to the remaining number. Repeat until you get a small number. If it's divisible by 7, the original is too.",
          /* @__PURE__ */ jsxRuntime.jsx("br", {}),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: "e.g., 532 \u2192 53 + (2\xD75) = 63. Since 63 is divisible by 7, so is 532." }),
          /* @__PURE__ */ jsxRuntime.jsx("br", {}),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-xs text-muted-foreground", children: "e.g., 987 \u2192 98 + (7\xD75) = 133 \u2192 13 + (3\xD75) = 28. Since 28 is divisible by 7, so is 987." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Divisibility by 11" }),
        /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionContent, { children: [
          "Alternately add and subtract the digits from left to right. If the result is 0 or divisible by 11, the original number is too.",
          /* @__PURE__ */ jsxRuntime.jsx("br", {}),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm ml-4 font-mono text-foreground/80", children: "e.g., 8679 \u2192 8 - 6 + 7 - 9 = 0. Divisible." }),
          /* @__PURE__ */ jsxRuntime.jsx("br", {}),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm ml-4 font-mono text-foreground/80", children: "e.g., 9581 \u2192 9 - 5 + 8 - 1 = 11. Divisible." }),
          /* @__PURE__ */ jsxRuntime.jsx("br", {}),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm ml-4 font-mono text-foreground/80", children: "e.g., 2907 \u2192 2 - 9 + 0 - 7 = -14. Not divisible." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionItem, { value: "item-3", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.AccordionTrigger, { children: "Divisibility by 12" }),
        /* @__PURE__ */ jsxRuntime.jsxs(ui.AccordionContent, { children: [
          "If the number is divisible by both 3 and 4, it is divisible by 12.",
          /* @__PURE__ */ jsxRuntime.jsx("br", {}),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm ml-4 font-mono text-foreground/80", children: "e.g., 552 \u2192 Divisible by 3 (5+5+2=12) and 4 (last two digits, 52). So, divisible by 12." })
        ] })
      ] })
    ] }) })
  ] });
};
var scalingData = {
  memorize: {
    title: "Memorize",
    difficulties: {
      Easy: [
        "Perfect Squares (1-12)",
        "Perfect Cubes (1-5)",
        "Fraction/Decimal/Percent Conversions (denominators: 4, 5)",
        "Memorized Multiplication (e.g., 17x3, 24x2, 15x3, 15x4)"
      ],
      Medium: [
        "Perfect Squares (11-20)",
        "Perfect Cubes (4-10)",
        "Fraction/Decimal/Percent Conversions (denominators: 3, 6, 8, 9, 7)",
        "Memorized Multiplication (e.g., 19x5, 24x4, 36x3)",
        "Higher Powers (2\u2074, 2\u2075, 3\u2074, 3\u2075)"
      ],
      Hard: [
        "Perfect Squares (30-100, tens)",
        "Perfect Cubes (20-100, tens)",
        "Memorized Multiplication (e.g., 27x4, 32x5)",
        "Higher Powers & Squares (e.g., 2\u2076, 3\u2076, 4\u2074, 24\xB2)"
      ]
    }
  },
  estimate: {
    title: "Estimate",
    difficulties: {
      Easy: [
        "Multiplication Estimation (11-29 \xD7 11-29)",
        "Square Root Estimation (bases 1-9)",
        "Percentage Estimation (simple % of round numbers)"
      ],
      Medium: [
        "Multiplication Estimation (21-69 \xD7 11-39)",
        "Square Root Estimation (bases 1-19)",
        "Percentage Estimation (complex % of round numbers)",
        "Fraction Estimation (2-digit num/den)"
      ],
      Hard: [
        "Multiplication Estimation (51+ \xD7 21-79)",
        "Square Root Estimation (bases 20-90, tens)",
        "Cube Root Estimation (bases 1-10)",
        "Percentage Estimation (complex % of any 3-digit number)",
        "Fraction Estimation (2-digit/3-digit or improper)"
      ]
    }
  },
  crafty: {
    title: "Get Crafty",
    difficulties: {
      Easy: [
        "Multiply by 4 (small numbers)",
        "Divide by 4 (no remainder)",
        "Multiply by 5 (small numbers)",
        "Divide by 5 (no remainder)",
        "Multiply by 9 (small numbers)",
        "Divisibility Rules (3, 5, 6, 9)"
      ],
      Medium: [
        "Multiply by 4, 5, or 9 (larger numbers)",
        "Divide by 4 (whole or X.5 answer)",
        "Divide by 5 (with remainder)",
        "Multiply by 8",
        "Divide by 8 (no remainder)",
        "Multiply by 11",
        "Multiply by 12 or 15",
        "Divisibility Rules (3, 4, 6, 8, 9; 4-digit numbers)"
      ],
      Hard: [
        "Divide by 8 (with remainder)",
        "Divide by 12 (no remainder)",
        "Multiply by 19",
        "Multiply by 25",
        "Multiply by 99",
        "Square numbers ending in 5",
        "Complementary Multiplication",
        "Advanced Divisibility (7, 11)"
      ]
    }
  }
};
var DifficultyScalingContent = () => {
  const ui = useMathmogUI();
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-6", children: Object.values(scalingData).map((level) => /* @__PURE__ */ jsxRuntime.jsxs(ui.Card, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.CardHeader, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.CardTitle, { className: "text-xl text-primary", children: level.title }) }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.CardContent, { children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Table, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.TableHeader, { children: /* @__PURE__ */ jsxRuntime.jsxs(ui.TableRow, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.TableHead, { className: "w-[100px]", children: "Difficulty" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.TableHead, { children: "Problem Types" })
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.TableBody, { children: Object.entries(level.difficulties).map(([difficulty, types]) => /* @__PURE__ */ jsxRuntime.jsxs(ui.TableRow, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.TableCell, { className: "font-medium align-top", children: difficulty }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.TableCell, { className: "align-top", children: /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "list-disc list-inside", children: types.map((type) => /* @__PURE__ */ jsxRuntime.jsx("li", { children: type }, type)) }) })
      ] }, difficulty)) })
    ] }) })
  ] }, level.title)) });
};
function StudyGuide({ onOpen } = {}) {
  const ui = useMathmogUI();
  const { studyTab, setStudyTab } = useTrainerState();
  React__namespace.useEffect(() => {
    onOpen?.();
  }, []);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-2xl font-bold mb-2", children: "Study Guide" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-muted-foreground", children: "Essential facts and strategies for mental math mastery" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      ui.Tabs,
      {
        value: studyTab,
        onValueChange: (value) => setStudyTab(value),
        "data-tour": "mathmog-reference",
        className: "w-full",
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs(ui.TabsList, { className: "grid w-full grid-cols-2 md:grid-cols-4", children: [
            /* @__PURE__ */ jsxRuntime.jsxs(ui.TabsTrigger, { value: "memorize", "data-tour": "mathmog-reference-tab-memorize", children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Brain, { className: "w-4 h-4 mr-1.5" }),
              "Memorize"
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.TabsTrigger, { value: "estimate", "data-tour": "mathmog-reference-tab-estimate", children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Gauge, { className: "w-4 h-4 mr-1.5" }),
              "Estimate"
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.TabsTrigger, { value: "crafty", "data-tour": "mathmog-reference-tab-crafty", children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Wand2, { className: "w-4 h-4 mr-1.5" }),
              "Get Crafty"
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.TabsTrigger, { value: "scaling", "data-tour": "mathmog-reference-tab-scaling", children: [
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.TrendingUp, { className: "w-4 h-4 mr-1.5" }),
              "Scaling"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.TabsContent, { value: "memorize", className: "mt-6", children: /* @__PURE__ */ jsxRuntime.jsx(MemorizeContent, {}) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.TabsContent, { value: "estimate", className: "mt-6", children: /* @__PURE__ */ jsxRuntime.jsx(EstimateContent, {}) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.TabsContent, { value: "crafty", className: "mt-6", children: /* @__PURE__ */ jsxRuntime.jsx(CraftyContent, {}) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.TabsContent, { value: "scaling", className: "mt-6", children: /* @__PURE__ */ jsxRuntime.jsx(DifficultyScalingContent, {}) })
        ]
      }
    )
  ] });
}

exports.CraftyContent = CraftyContent;
exports.DifficultyScalingContent = DifficultyScalingContent;
exports.ElapsedTimer = ElapsedTimer;
exports.EstimateContent = EstimateContent;
exports.LevelUpDialog = LevelUpDialog;
exports.MathmogTrainerProviders = MathmogTrainerProviders;
exports.MathmogUIProvider = MathmogUIProvider;
exports.MemorizeContent = MemorizeContent;
exports.MissesReviewScreen = MissesReviewScreen;
exports.PrintableStudyGuideProvider = PrintableStudyGuideProvider;
exports.ProblemDisplay = ProblemDisplay;
exports.ProblemProvider = ProblemProvider;
exports.ScoreDisplay = ScoreDisplay;
exports.SpeedChallengeControls = SpeedChallengeControls;
exports.SpeedChallengeProvider = SpeedChallengeProvider;
exports.SpeedChallengeReadyScreen = SpeedChallengeReadyScreen;
exports.StudyGuide = StudyGuide;
exports.TrainerConfigSelector = TrainerConfigSelector;
exports.TrainerModeProvider = TrainerModeProvider;
exports.TrainerStateProvider = TrainerStateProvider;
exports.useMathmogUI = useMathmogUI;
exports.useProblem = useProblem;
exports.useSpeedChallenge = useSpeedChallenge;
exports.useTrainerMode = useTrainerMode;
exports.useTrainerModeOptional = useTrainerModeOptional;
exports.useTrainerState = useTrainerState;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map