import {
  BlobWriter,
  HttpReader,
  TextReader,
  ZipWriter,
} from "https://unpkg.com/@zip.js/zip.js/index.js";

// Selected html elements
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

const gameOverDiv = document.getElementById("game-over");

// Set item to localStorage
function localStorageSet(name, data) {
  localStorage.setItem(name, JSON.stringify(data));
}
// Get item from localStorage
function localStorageGet(name) {
  return JSON.parse(localStorage.getItem(name));
}

// Clear localStorage
function localStorageClear() {
  localStorage.clear();
}

// Add class to the HTML element
function addClassName(element, className) {
  element.classList.add(className);
}
// Remove class from HTML element
function removeClassName(element, className) {
  element.classList.remove(className);
}

// Generator for HTML element (set textContent, id, class, append to parent, href, addEventListener)
function generateHTML(
  tag,
  textContent,
  id,
  className,
  parentEl,
  href,
  event,
  eventHandler,
  imgUrl
) {
  let currentEl = document.createElement(tag);

  if (textContent !== "") {
    currentEl.innerHTML = textContent;
  }

  if (id !== "") {
    currentEl.id = id;
  }

  if (className !== "") {
    currentEl.className = className;
  }

  if (href !== "") {
    currentEl.href = href;
  }

  if (event !== "") {
    currentEl.addEventListener(event, eventHandler);
  }

  if (imgUrl !== "") {
    currentEl.src = imgUrl;
  }

  if (parentEl !== "") {
    parentEl.appendChild(currentEl);
  }

  return currentEl;
}

// Return correct answer
function getCorrectAnswer(index) {
  return localStorageGet("correctAnswers").find((el) => el.index === +index)
    .correct_answer;
}

// Update badge of name, correct answers and wrong answers
function updateWelcome() {
  welcomeName.textContent = localStorageGet("userData").name;
  welcomeCorrect.textContent = localStorageGet("userData").correctAnswers;
  welcomeWrong.textContent = localStorageGet("userData").wrongAnswers;
}

// Reset all quiz settings and clear localStorage and return to form
function newGame() {
  quizzesContainer.innerHTML = "";
  const gameOver = document.getElementById("game-over");
  nameUserInput.value = "";
  addClassName(gameOver, "hidden");
  localStorageClear();

  const form = document.getElementById("form");
  removeClassName(form, "hidden");
}

// Create a zip file, where zip file contains user data and create link, where you can download it
function createZip() {
  // //create worker
  // const worker = new Worker("worker.js");

  // // send data to worker.js
  // worker.postMessage(localStorageGet("userData"));

  // //receive data from worker.js
  // worker.onmessage = (e) => {
  //   console.table(e.data);
  // };

  getZipFileBlob().then(downloadFile);

  function getZipFileBlob() {
    const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
    zipWriter.add(
      "result.txt",
      new TextReader(JSON.stringify(localStorageGet("userData")))
    );
    return zipWriter.close();
  }

  function downloadFile(blob) {
    let divButtons = document
      .getElementsByClassName("game-over-buttons")[0]
      .appendChild(
        Object.assign(generateHTML("a", "", "", "", "", "", "", "", ""), {
          download: "result.zip",
          href: URL.createObjectURL(blob),
          textContent: "Download results",
        })
      );
  }
}

//Show message of last correct and wrong answers and buttons for new game and download result
function gameOver() {
  const userData = localStorageGet("userData");
  addClassName(header, "hidden");
  addClassName(quizzesContainer, "hidden");
  removeClassName(gameOverDiv, "hidden");

  gameOverDiv.innerHTML = "";

  let h2 = generateHTML(
    "h2",
    `${userData.name} your score is: ${userData.correctAnswers} / ${userData.passedQuestions}`,
    "",
    "",
    gameOverDiv,
    "",
    "",
    "",
    ""
  );

  let divGameOverButtons = generateHTML(
    "div",
    "",
    "",
    "game-over-buttons",
    gameOverDiv,
    "",
    "",
    "",
    ""
  );

  let newGameBtn = generateHTML(
    "a",
    "New Game",
    "",
    "",
    divGameOverButtons,
    "#",
    "click",
    newGame,
    ""
  );

  createZip();
}

// Updates the user's correct and incorrect answers
function updateUserAnswers(status) {
  let userData = localStorageGet("userData");
  if (status === "correct") {
    userData.correctAnswers = userData.correctAnswers + 1;
    userData.passedQuestions = userData.passedQuestions + 1;
  } else if (status === "wrong") {
    userData.wrongAnswers = userData.wrongAnswers + 1;
    userData.passedQuestions = userData.passedQuestions + 1;
  }
  localStorageSet("userData", userData);
  if (userData.passedQuestions === userData.amount) {
    console.log("GAME OVER!!!");
    gameOver();
  }
}

// Checks whether the answer pressed is correct
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

// Generator of HTML for quiz card
function htmlQuizCardGenerator(dataQuiz, index, parentEl) {
  let quizDiv = generateHTML(
    "div",
    "",
    `quiz-${index}`,
    "quiz",
    "",
    "",
    "",
    "",
    ""
  );
  console.log(dataQuiz);
  let img = generateHTML(
    "img",
    "",
    "",
    "quiz-image",
    quizDiv,
    "",
    "",
    "",
    dataQuiz.url
  );

  let h2 = generateHTML(
    "h2",
    `Category: ${dataQuiz.category}`,
    "",
    "",
    quizDiv,
    "",
    "",
    "",
    ""
  );

  let quizCardDiv = generateHTML(
    "div",
    "",
    "",
    "quiz-card",
    quizDiv,
    "",
    "",
    "",
    ""
  );

  let h3 = generateHTML(
    "h3",
    `Difficulty: ${dataQuiz.difficulty}`,
    "",
    "",
    quizCardDiv,
    "",
    "",
    "",
    ""
  );

  let h4 = generateHTML(
    "h4",
    `${dataQuiz.question}`,
    "",
    "",
    quizCardDiv,
    "",
    "",
    "",
    ""
  );

  let quizCardAnswersContainer = generateHTML(
    "div",
    "",
    "",
    "quiz-card-answers",
    quizCardDiv,
    "",
    "click",
    checkingAnswer,
    ""
  );

  let answers = [dataQuiz.correct_answer, ...dataQuiz.incorrect_answers]
    .sort(() => Math.random() - 0.5)
    .forEach((txt) => {
      let el = generateHTML(
        "p",
        txt,
        "",
        "",
        quizCardAnswersContainer,
        "",
        "",
        "",
        ""
      );
    });

  parentEl.appendChild(quizDiv);
}

// Fetch quizzes from TRIVIA API
function fetchQuizzesData(userData) {
  addClassName(main, "loader");
  const url = `https://opentdb.com/api.php?amount=${userData.amount}${
    userData.difficulty.length === 0 ? "" : `&difficulty=${userData.difficulty}`
  }${userData.category.length === 0 ? "" : `&category=${userData.category}`}`;

  const urlCat = `https://api.thecatapi.com/v1/images/search?limit=${userData.amount}`;

  //clear quizzes container
  quizzesContainer.innerHTML = "";

  let mergeArr = [];

  Promise.all([fetch(urlCat), fetch(url)])
    .then((res) => {
      res.map((res) => {
        return res.json().then((data) => {
          if (Array.isArray(data)) {
            data.forEach((el, index) => mergeArr.push({ url: el.url }));
          } else {
            mergeArr = mergeArr.map((el, index) => {
              return { ...el, ...data.results[index] };
            });

            localStorageSet(
              "correctAnswers",
              mergeArr.map((currEl, index) => {
                return { index: index, correct_answer: currEl.correct_answer };
              })
            );

            mergeArr.map((currQuiz, index) => {
              htmlQuizCardGenerator(currQuiz, index, quizzesContainer);
            });
          }
          removeClassName(main, "loader");
        });
      });
    })
    .catch((err) => alert("Server Error. Please refresh the page"));
}

// Gets user inputs from form and set it to the localStorage
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

// Set event handler for Login button
function init() {
  loginBtn.addEventListener("click", userOptionsQuizHandler);
}

init();
