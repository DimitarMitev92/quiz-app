import {
  BlobWriter,
  HttpReader,
  TextReader,
  ZipWriter,
} from "https://unpkg.com/@zip.js/zip.js/index.js";

// selected html elements
const main = document.getElementById("main");
const header = document.getElementById("header");
const quizzesContainer = document.getElementById("quizzes-container");
const loginBtn = document.getElementById("login");

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
  console.log("clicked");
  const gameOver = document.getElementsByClassName("game-over")[0];
  console.log(gameOver);
  nameUserInput.value = "";
  addClassName(gameOver, "hidden");
  localStorageClear();

  const form = document.getElementById("form");
  removeClassName(form, "hidden");
}

function downloadZip(event) {
  console.log(event.target); // a tag
  console.log("download zip");

  // //create worker
  // const worker = new Worker("worker.js");

  // // send data to worker.js
  // worker.postMessage(localStorageGet("userData"));

  // //receive data from worker.js
  // worker.onmessage = (e) => {
  //   console.table(e.data);
  // };

  function getZipFileBlob() {
    const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
    console.log(localStorageGet("userData"));
    zipWriter.add("result.txt", new TextReader(localStorageGet("userData")));
    return zipWriter.close();
  }

  function downloadFile(blob) {
    event.target.download = "result.zip";
    event.target.href = URL.createObjectURL(blob);
  }

  getZipFileBlob().then(downloadFile);

  let downloadBtn = document.getElementById("download");
  // let clickEvent = new Event("click");
  // downloadBtn.dispatchEvent(clickEvent);
}

//Game Over
function gameOver() {
  const userData = localStorageGet("userData");
  console.log(userData);
  addClassName(header, "hidden");
  addClassName(quizzesContainer, "hidden");

  let divGameOver = document.createElement("div");
  divGameOver.className = "game-over";

  let h2 = document.createElement("h2");
  h2.textContent = `${userData.name} your score is: ${userData.correctAnswers} / ${userData.passedQuestions}`;

  divGameOver.appendChild(h2);

  let divGameOverButtons = document.createElement("div");
  divGameOverButtons.className = "game-over-buttons";

  divGameOver.appendChild(divGameOverButtons);

  let newGameBtn = document.createElement("a");
  newGameBtn.textContent = `New Game`;
  newGameBtn.href = "#";
  newGameBtn.addEventListener("click", newGame);

  divGameOverButtons.appendChild(newGameBtn);

  let downloadZipBtn = document.createElement("a");
  downloadZipBtn.textContent = `Download results`;
  downloadZipBtn.href = "#";
  downloadZipBtn.id = "download";
  downloadZipBtn.addEventListener("click", downloadZip);

  divGameOverButtons.appendChild(downloadZipBtn);

  main.appendChild(divGameOver);
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
  let quizDiv = document.createElement("div");
  quizDiv.id = `quiz-${index}`;
  quizDiv.className = "quiz";

  let h2 = document.createElement("h2");
  h2.textContent = `Category: ${dataQuiz.category}`;

  quizDiv.appendChild(h2);

  let quizCardDiv = document.createElement("div");
  quizCardDiv.className = "quiz-card";

  quizDiv.appendChild(quizCardDiv);

  let h3 = document.createElement("h3");
  h3.textContent = `Difficulty: ${dataQuiz.difficulty}`;

  quizCardDiv.appendChild(h3);

  let h4 = document.createElement("h4");
  h4.innerHTML = `${dataQuiz.question}`;

  quizCardDiv.appendChild(h4);

  let quizCardAnswersContainer = document.createElement("div");
  quizCardAnswersContainer.className = "quiz-card-answers";
  quizCardAnswersContainer.addEventListener("click", checkingAnswer);

  quizCardDiv.appendChild(quizCardAnswersContainer);

  let answers = [dataQuiz.correct_answer, ...dataQuiz.incorrect_answers]
    .sort(() => Math.random() - 0.5)
    .forEach((txt) => {
      let el = document.createElement("p");
      el.innerHTML = txt;
      quizCardAnswersContainer.appendChild(el);
    });

  parentEl.appendChild(quizDiv);
}

//fetch quizzes data from API
function fetchQuizzesData(userData) {
  const url = `https://opentdb.com/api.php?amount=${userData.amount}${
    userData.difficulty.length === 0 ? "" : `&difficulty=${userData.difficulty}`
  }${userData.category.length === 0 ? "" : `&category=${userData.category}`}`;

  //clear quizzes container
  quizzesContainer.innerHTML = "";

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

function init() {
  loginBtn.addEventListener("click", userOptionsQuizHandler);
}

init();
