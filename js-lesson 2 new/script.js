// Selected html elements
const main = document.getElementById("main");
const header = document.getElementById("header");
const quizzesContainer = document.getElementById("quizzes-container");
const loginBtn = document.getElementById("login");
const createBtn = document.getElementById("create");

const formLogin = document.getElementById("form-login");

const numOfQuestionsInput = document.getElementById("num-of-questions");
const categoryInput = document.getElementById("category");
const difficultyInput = document.getElementById("difficulty");
const nameUserInput = document.getElementById("name-user");

const formCreate = document.getElementById("form-create");

const questionInput = document.getElementById("question-form");
const correctAnswerInput = document.getElementById("correct-answer-form");
const incorrectFirstAnswerInput = document.getElementById(
  "incorrect-answer1-form"
);

const incorrectSecondAnswerInput = document.getElementById(
  "incorrect-answer2-form"
);

const incorrectThirdAnswerInput = document.getElementById(
  "incorrect-answer3-form"
);

const dogsContainer = document.getElementById("dogs-wrapper");
const dogsImgContainer = document.getElementById("dogs-img-container");

const formDog = document.getElementById("dogs-form");
const breedInput = document.getElementById("dogs-select");
const dogBtn = document.getElementById("dogBtn");

const welcomeName = document.getElementById("welcome-name");
const welcomeCorrect = document.getElementById("welcome-correct");
const welcomeWrong = document.getElementById("welcome-wrong");

const gameOverDiv = document.getElementById("game-over");

// Set item to localStorage
function localStorageSet(name, data) {
  const encryptedMessage = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    "secret key"
  ).toString();
  console.log("data");
  console.log(data);
  console.log("encryptedMessage");
  console.log(encryptedMessage);
  localStorage.setItem(name, encryptedMessage);
}
// Get item from localStorage
function localStorageGet(name) {
  console.log("name");
  console.log(name);
  console.log(localStorage.getItem(name));
  let bytes = CryptoJS.AES.decrypt(localStorage.getItem(name), "secret key");
  console.log("bytes");
  console.log(bytes);
  let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  console.log(decryptedData);
  console.log("decryotedData");
  console.log(decryptedData);
  return decryptedData;
}

// Remove item from localStorage
function localStorageRemove(name) {
  localStorage.removeItem(name);
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
  // localStorageClear();
  localStorageRemove("userData");
  localStorageRemove("correctAnswers");
  localStorageRemove("userQuestions");
  localStorageSet("userQuestions", []);

  const formLogin = document.getElementById("form-login");
  removeClassName(formLogin, "hidden");
  removeClassName(formCreate, "hidden");
  removeClassName(dogsContainer, "hidden");
}

// Create a zip file, where zip file contains user data and create link, where you can download it
function createZip() {
  // worker
  ////////////////////////////////////////
  let zipHandler = () => {
    let userData = JSON.stringify(localStorageGet("userData"));
    const worker = new Worker("worker.js", { type: "module" });
    worker.onmessage = (e) => {
      const clickBtn = document.body.appendChild(
        Object.assign(generateHTML("a", "", "", "", "", "", "", "", ""), {
          download: "results.zip",
          href: URL.createObjectURL(e.data),
          textContent: "download",
        })
      );
      clickBtn.click();
      document.body.removeChild(clickBtn);
    };
    worker.postMessage({ userData });
  };

  const downloadBtn = generateHTML(
    "a",
    "Download results",
    "download",
    "",
    "",
    "",
    "click",
    zipHandler,
    ""
  );

  document
    .getElementsByClassName("game-over-buttons")[0]
    .appendChild(downloadBtn);

  //////////////////////////////////////////
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
  if (
    userData.passedQuestions ===
    userData.amount + userData.createdQuestions
  ) {
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

  Promise.all([
    fetch(urlCat, {
      headers: {
        "x-api-key":
          "live_lfNhUCsjzIAORgFJAEbR0D8CMdmrQ9X7FN0SfjIUsUFTsrxCskTLlaCCvdxLs4HI",
      },
    }),
    fetch(url),
  ])
    .then((res) => {
      res.map((res) => {
        return res.json().then((data) => {
          let isDone = false;
          if (
            typeof data === "object" &&
            !Array.isArray(data) &&
            data !== null
          ) {
            mergeArr = data.results;
          } else {
            mergeArr = mergeArr.map((el, index) => {
              return { ...el, url: data[index].url };
            });

            localStorageGet("userQuestions").forEach((el, index) => {
              mergeArr.push(el);
            });

            // Flag for set localStorage correctAnswers and html quiz card generator
            isDone = true;
          }

          if (isDone) {
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

  console.log(
    +numOfQuestionsInput.value + localStorageGet("userQuestions").length
  );
  const userData = {
    name: nameUserInput.value,
    amount: +numOfQuestionsInput.value,
    difficulty: difficultyInput.value,
    category: categoryInput.value,
    correctAnswers: 0,
    wrongAnswers: 0,
    passedQuestions: 0,
    createdQuestions: localStorageGet("userQuestions").length,
  };

  localStorageSet("userData", userData);

  addClassName(formLogin, "hidden");
  addClassName(formCreate, "hidden");
  addClassName(dogsContainer, "hidden");

  removeClassName(header, "hidden");
  removeClassName(quizzesContainer, "hidden");
  updateWelcome();
  fetchQuizzesData(localStorageGet("userData"));
}

function createQuestionHandler(event) {
  event.preventDefault();
  let questionArrLocalStorage = localStorageGet("userQuestions");
  fetch(`https://api.thecatapi.com/v1/images/search`)
    .then((res) => res.json())
    .then((data) => {
      let questionObj = {
        index: questionArrLocalStorage.length,
        question: questionInput.value,
        correct_answer: correctAnswerInput.value,
        difficulty: "Any",
        category: "Any",
        incorrect_answers: [
          incorrectFirstAnswerInput.value,
          incorrectSecondAnswerInput.value,
          incorrectThirdAnswerInput.value,
        ],
        url: data[0].url,
      };

      questionArrLocalStorage.push(questionObj);
      localStorageSet("userQuestions", questionArrLocalStorage);
    });
  alert("You successfully create an question. :)");
}

function generateDogHandler(event) {
  event.preventDefault();

  // Use localserver
  // const ws = new WebSocket("ws://localhost:8080");

  //  Use docker for back-end
  const ws = new WebSocket("ws://0.0.0.0:8080");

  ws.addEventListener("open", () => {
    console.log("We are connected!");

    ws.send(breedInput.value);
  });

  ws.addEventListener("message", (e) => {
    fetch(e.data)
      .then((res) => res.json())
      .then((dogObj) => {
        dogsImgContainer.innerHTML = "";
        generateHTML(
          "img",
          "",
          "img-dog",
          "",
          dogsImgContainer,
          "",
          "",
          "",
          dogObj.message
        );
      });
  });
}

// Set event handler for Login button
function init() {
  localStorageSet("userQuestions", []);
  loginBtn.addEventListener("click", userOptionsQuizHandler);
  createBtn.addEventListener("click", createQuestionHandler);
  dogBtn.addEventListener("click", generateDogHandler);
}

init();
