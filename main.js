import htm from "https://esm.sh/v104/htm@3.1.1/es2022/mini/index.module.js";
import { uri } from "https://esm.sh/v104/mouri@2.0.0/es2022/publish/uri.js";

import { h } from './html.js'

const html = htm.bind(h);

const cls = (names) => names.filter((n) => n).join(" ");

export async function opentdb(options) {
  const url = uri`https://opentdb.com/api.php?${options}`;
  const { results } = await fetch(url).then((res) => res.json());
  return results;
}

// not random but it masks the correct answer
const getAnswers = (question) =>
  [{ answer: question.correct_answer, correct: true }]
    .concat(question.incorrect_answers.map((answer) => ({ answer })))
    .sort((a, b) => b.answer.charCodeAt(0) - a.answer.charCodeAt(0));

// innerHTML is safe because the response is HTMLEncoded
const Answer = ({ answer, correct = false }, { que, ans }) => {
  const id = `question-${que}-answer-${ans}`;
  return html`
    <div>
      <input id=${id} type="radio" name=${`question-${que}`} required />
      <label for=${id} class=${cls([correct && `correct`])} innerHTML=${answer} />
    </div>
  `;
};

const Question = (question, que) => html`
  <fieldset>
    <legend innerHTML=${question.question} />
    ${getAnswers(question).map((a, ans) => Answer(a, { que, ans }))}
  </fieldset>
`;

const Quiz = ({ name, desc, questions }) => html`
  <form>
    <input
      id=${`${name}-reveal-answers`}
      type="checkbox"
      class="reveal-answers sr-only"
      tabindex="-1"
    />
    <header>
      <h1 contenteditable tabindex="-1">${name}</h1>
      <h3 contenteditable tabindex="-1">${desc}</h3>
    </header>
    ${questions.map(Question)}
    <label
      class="submit button"
      role="button"
      for=${`${name}-reveal-answers`}
      tabindex="0"
      onkeydown=${(e) => { (e.key === " " || e.key === "Enter") && e.target.click() }}>
      Check Answers
    </label>
    <output class="score">Score: </output>
  </form>
`;

const $form = document.querySelector('#form')

$form.onsubmit = async (e) => {
  e.preventDefault();

  // use a timeout so it feels nicer with a good connection but still shows up on slower connections to indicate it's doing something.
  const handle = setTimeout(() => document.body.classList.add("loading"), 236);

  const formdata = new FormData($form);
  const params = Object.fromEntries(formdata.entries());
  const questions = await opentdb({ ...params, amount: 5 });

  document.body.classList.remove("loading");
  clearTimeout(handle);

  $form.replaceWith(
    Quiz({
      name: "Questions",
      desc: "Do your best to answer the questions correctly.",
      questions,
    })
  );
};
