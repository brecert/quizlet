import { uri } from "https://cdn.skypack.dev/mouri";

const mapEntries = (record, transformer) => {
  const ret = {};
  Object.keys(record).forEach((key, i) => {
    const [mappedKey, mappedVal] = transformer(key, record[key], i, record);
    ret[mappedKey] = mappedVal;
  });
  return ret;
};

const randomInt = (lower, upper) =>
  lower + Math.floor(Math.random() * (upper - lower + 1));

async function opentdb(options) {
  const url = uri`https://opentdb.com/api.php?${options}`;
  const { results } = await fetch(url).then((res) => res.json());
  return results;
}

function decodeQuestion(question) {
  const decoded = mapEntries(question, (key, val) => {
    return Array.isArray(val)
      ? [key, val.map((v) => decodeURIComponent(v))]
      : [key, decodeURIComponent(val)];
  });

  // const randPos = randomInt(0, decoded.incorrect_answers.length);
  // const answers = decoded.incorrect_answers.map(answer => ({ answer }));
  // answers.splice(randPos, 0, ({ answer: decoded.correct_answer, correct: true }));

  let answers = decoded.incorrect_answers.map(answer => ({ answer }))
  answers.push({ answer: decoded.correct_answer, correct: true })
  // not random but it's good enough lol
  answers = answers.sort((a, b) => b.answer.charCodeAt(0) - a.answer.charCodeAt(0))

  return {
    ...decoded,
    answers
  };
}

/**
 * @typedef  Question
 * @property {string} type
 * @property {string} question
 * @property {string} category
 * @property {string} difficulty
 * @property {string} correct_answer
 * @property {string[]} incorrect_answers
 * @property {string[]} answers
 */

/**
 * Fetches a list of questions
 * @returns {Question[]} 
 */
export async function fetchQuestions(amount = 1, params = {}) {
  const questions = await opentdb({ ...params, amount, encode: "url3986" });
  return questions.map(decodeQuestion);
}
