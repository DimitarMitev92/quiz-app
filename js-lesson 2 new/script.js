// selected html elements
const main = document.getElementById("main");
const header = document.getElementById("header");
const quizzesContainer = document.getElementById("quizzes-container");

const form = document.getElementById("form");
const numOfQuestionsInput = document.getElementById("num-of-questions");
const categoryInput = document.getElementById("category");
const difficultyInput = document.getElementById("difficulty");
const nameUserInput = document.getElementById("name-user");

const welcomeName = document.getElementById("welcome-name");
const welcomeCorrect = document.getElementById("welcome-correct");
const welcomeWrong = document.getElementById("welcome-wrong");

// localStorage
// localStorage - set
function localStorageSet(name, data) {
  localStorage.setItem(name, JSON.stringify(data));
}
//localStorage - get
function localStorageGet(name) {
  return JSON.parse(localStorage.getItem(name));
}

//localStorage - clear
function localStorageClear() {
  localStorage.clear();
}

//class add
function addClassName(element, className) {
  element.classList.add(className);
}
// class remove
function removeClassName(element, className) {
  element.classList.remove(className);
}

//get correct answer
function getCorrectAnswer(index) {
  return localStorageGet("correctAnswers").find((el) => el.index === +index)
    .correct_answer;
}

// header name, status of answers
function updateWelcome() {
  welcomeName.textContent = localStorageGet("userData").name;
  welcomeCorrect.textContent = localStorageGet("userData").correctAnswers;
  welcomeWrong.textContent = localStorageGet("userData").wrongAnswers;
}

function newGame() {
  const gameOver = document.getElementsByClassName("game-over")[0];
  addClassName(gameOver, "hidden");
  localStorageClear();
  const form = document.getElementById("form");
  removeClassName(form, "hidden");
}

function downloadZip() {
  console.log("download zip");
}

function gameOver() {
  console.log(localStorageGet("userData"));
  const userData = localStorageGet("userData");
  addClassName(header, "hidden");
  addClassName(quizzesContainer, "hidden");
  const html = `
    <div class="game-over">
      <h2>${userData.name} your score is: ${userData.correctAnswers} / ${userData.passedQuestions}</h2>
      <div class=game-over-buttons>
        <a href="#" onclick="newGame()">New Game</a>
        <a href="#" onclick="downloadZip()">Download info</a>
      </div>
    </div>
  `;

  main.innerHTML += html;
}

//update user answers in localStorage
function updateUserAnswers(status) {
  let userData = localStorageGet("userData");
  if (status === "correct") {
    userData.correctAnswers++;
    userData.passedQuestions++;
  } else if (status === "wrong") {
    userData.wrongAnswers++;
    userData.passedQuestions++;
  }

  if (userData.passedQuestions === userData.amount) {
    console.log("GAME OVER!!!");
    gameOver();
  }

  localStorageSet("userData", userData);
}

//checking the clicked answer is correct
function checkingAnswer(event) {
  if (event.target.tagName.toLowerCase() === "p") {
    const checkedAnswer = event.target.textContent;
    const idQuiz = event.target.parentElement.parentElement.parentElement.id;
    const checkedQuiz = document.getElementById(`${idQuiz}`);
    addClassName(checkedQuiz, "disabled");

    const indexQuiz = idQuiz.split("-")[1];
    const correctAnswer = getCorrectAnswer(indexQuiz);
    if (checkedAnswer === correctAnswer) {
      addClassName(event.target, "correct-answer");
      updateUserAnswers("correct");
      updateWelcome();
    } else {
      addClassName(event.target, "wrong-answer");
      updateUserAnswers("wrong");
      updateWelcome();
    }
  }
}

//html quiz card generator
function htmlQuizCardGenerator(dataQuiz, index, parentEl) {
  const html = `
    <div class="quiz" id="quiz-${index}">
      <h2>Category: ${dataQuiz.category}</h2>
      <div class="quiz-card">
          <h3>Difficulty: ${dataQuiz.difficulty}</h3>
          <h4>${dataQuiz.question}?</h4>
          <div class="quiz-card-answers" onclick="checkingAnswer(event)">
            ${[dataQuiz.correct_answer, ...dataQuiz.incorrect_answers]
              .sort(() => Math.random() - 0.5)
              .map((answer) => `<p>${answer}</p>`)
              .join(" ")}
          </div>
      </div>
    </div>
  `;

  parentEl.innerHTML += html;
}

//fetch quizzes data from API
function fetchQuizzesData(userData) {
  const url = `https://opentdb.com/api.php?amount=${userData.amount}${
    userData.difficulty.length === 0 ? "" : `&difficulty=${userData.difficulty}`
  }${userData.category.length === 0 ? "" : `&category=${userData.category}`}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      localStorageSet(
        "correctAnswers",
        data.results.map((currEl, index) => {
          return { index: index, correct_answer: currEl.correct_answer };
        })
      );
      data.results.map((currQuiz, index) => {
        htmlQuizCardGenerator(currQuiz, index, quizzesContainer);
      });
    })
    .catch((err) => console.log(err));
}

//get user inputs and set to localStorage
function userOptionsQuizHandler(event) {
  event.preventDefault();
  if (nameUserInput.value.length === 0) return;

  const userData = {
    name: nameUserInput.value,
    amount: +numOfQuestionsInput.value,
    difficulty: difficultyInput.value,
    category: categoryInput.value,
    correctAnswers: 0,
    wrongAnswers: 0,
    passedQuestions: 0,
  };

  localStorageSet("userData", userData);

  addClassName(form, "hidden");
  removeClassName(header, "hidden");
  removeClassName(quizzesContainer, "hidden");
  updateWelcome();
  fetchQuizzesData(localStorageGet("userData"));
}
