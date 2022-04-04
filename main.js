import html from "https://cdn.skypack.dev/pin/solid-js@v1.3.13-G1A7k22W8nCUBdAahFoq/mode=imports,min/optimized/solid-js/html.js";
import { uri } from "https://cdn.skypack.dev/pin/mouri@v2.0.0-w0BkwzwMyU7YopOIYXsH/mode=imports,min/optimized/mouri.js";

const cls = (names) => names.filter((n) => n).join(" ");

export async function opentdb(options) {
  const url = uri`https://opentdb.com/api.php?${options}`;
  const { results } = await fetch(url).then((res) => res.json());
  return results;
}

// not random but it's good enough
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
      <label
        for=${id}
        class=${cls([correct && `correct`])}
        innerHTML=${answer}
      />
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
      onkeydown=${(e) =>
        (e.key === " " || e.key === "Enter") && e.target.click()}
    >
      Submit
    </label>
    <output class="score">Score: </output>
  </form>
`;

$form.onsubmit = async (e) => {
  e.preventDefault();

  const formdata = new FormData($form);
  const params = Object.fromEntries(formdata.entries());
  const questions = await opentdb({ ...params, amount: 5 });

  $form.replaceWith(
    Quiz({
      name: "Questions",
      desc: "Do your best to answer the questions correctly.",
      questions,
    })
  );
};
