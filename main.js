import html from "https://cdn.skypack.dev/solid-js/html";
import { fetchQuestions } from "./question.js";

const cls = (names) => names.filter((n) => n).join(" ");

const Answer = ({ answer, correct = false }, { que, ans }) => {
  const id = `question-${que}-answer-${ans}`;
  return html`
    <div>
      <input id=${id} type="radio" name=${`question-${que}`} required />
      <label for=${id} class=${cls([correct && `correct`])}>${answer}</label>
    </div>
  `;
};

const Question = ({ question, answers }, que) => html`
  <fieldset>
    <legend>${question}</legend>
    ${answers.map((a, ans) => Answer(a, { que, ans }))}
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
  const questions = await fetchQuestions(5, params);

  $form.replaceWith(
    Quiz({
      name: "Questions",
      desc: "Do your best to answer the questions correctly.",
      questions,
    })
  );
};
