// Selected html elements
const main: HTMLElement | null = document.getElementById("main");
const header: HTMLElement | null = document.getElementById("header");
const quizzesContainer: HTMLElement | null =
  document.getElementById("quizzes-container");
const loginBtn: HTMLElement | null = document.getElementById(
  "login"
) as HTMLButtonElement;
const createBtn: HTMLElement | null = document.getElementById(
  "create"
) as HTMLButtonElement;

const formLogin: HTMLElement | null = document.getElementById(
  "form-login"
) as HTMLFormElement;

const numOfQuestionsInput: HTMLElement | null = document.getElementById(
  "num-of-questions"
) as HTMLFormElement;
const categoryInput: HTMLElement | null = document.getElementById(
  "category"
) as HTMLInputElement;
const difficultyInput: HTMLElement | null = document.getElementById(
  "difficulty"
) as HTMLInputElement;
const nameUserInput: HTMLElement | null = document.getElementById(
  "name-user"
) as HTMLInputElement;

const formCreate: HTMLElement | null = document.getElementById(
  "form-create"
) as HTMLFormElement;

const questionInput: HTMLElement | null = document.getElementById(
  "question-form"
) as HTMLInputElement;
const correctAnswerInput: HTMLElement | null = document.getElementById(
  "correct-answer-form"
) as HTMLInputElement;
const incorrectFirstAnswerInput: HTMLElement | null = document.getElementById(
  "incorrect-answer1-form"
) as HTMLInputElement;

const incorrectSecondAnswerInput: HTMLElement | null = document.getElementById(
  "incorrect-answer2-form"
) as HTMLInputElement;

const incorrectThirdAnswerInput: HTMLElement | null = document.getElementById(
  "incorrect-answer3-form"
) as HTMLInputElement;

const dogsContainer: HTMLElement | null =
  document.getElementById("dogs-wrapper");
const dogsImgContainer: HTMLElement | null =
  document.getElementById("dogs-img-container");

const formDog: HTMLElement | null = document.getElementById(
  "dogs-form"
) as HTMLFormElement;
const breedInput: HTMLElement | null = document.getElementById(
  "dogs-select"
) as HTMLInputElement;
const dogBtn: HTMLElement | null = document.getElementById(
  "dogBtn"
) as HTMLButtonElement;

const welcomeName: HTMLElement | null = document.getElementById("welcome-name");
const welcomeCorrect: HTMLElement | null =
  document.getElementById("welcome-correct");
const welcomeWrong: HTMLElement | null =
  document.getElementById("welcome-wrong");

const gameOverDiv: HTMLElement | null = document.getElementById("game-over");

//////////////////////////
// INTERFACES

interface IUserData {
  name: string;
  amount: number;
  difficulty: string;
  category: string;
  correctAnswers: number;
  wrongAnswers: number;
  passedQuestions: number;
  createdQuestions: number;
}

interface IAttributes {
  textContent?: string;
  id?: string;
  className?: string;
  href?: string;
  event?: string;
  eventHandler?: EventListenerOrEventListenerObject;
  imgUrl?: string;
  download?: string;
}

interface ICorrectAnswer {
  index: number;
  correct_answer: string | undefined;
}

interface IUserQuestion {
  question: string;
  correct_answer: string;
  difficulty: string;
  category: string;
  incorrect_answers: string[];
  url: string;
}

interface IQuizData {
  type?: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  url: string;
}

// Set item to localStorage
function localStorageSet(
  name: string,
  data: IUserData | IUserQuestion[] | ICorrectAnswer[]
) {
  const encryptedMessage = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    "secret key"
  ).toString();
  localStorage.setItem(name, encryptedMessage);
}
// Get item from localStorage
function localStorageGet(name: string) {
  const encryptedData = localStorage.getItem(name);

  if (encryptedData === null) {
    return null;
  }

  let bytes = CryptoJS.AES.decrypt(encryptedData, "secret key");
  let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
}

// Remove item from localStorage
function localStorageRemove(name: string): void {
  localStorage.removeItem(name);
}

// Clear localStorage
function localStorageClear(): void {
  localStorage.clear();
}

// Add class to the HTML element
function addClassName(element: HTMLElement, className: string): void {
  element.classList.add(className);
}
// Remove class from HTML element
function removeClassName(element: HTMLElement, className: string): void {
  element.classList.remove(className);
}

// Generator for HTML element (set textContent, id, class, append to parent, href, addEventListener)
function generateHTML(
  tag: string,
  parentEl: HTMLElement | null,
  attributes: IAttributes | null
): HTMLElement {
  let element = document.createElement(tag);

  if (attributes) {
    for (const key in attributes) {
      if (key === "textContent") {
        element.innerHTML = attributes[key] || "";
      } else if (key === "id") {
        element.setAttribute("id", attributes[key] || "");
      } else if (key === "className") {
        element.setAttribute("class", attributes[key] || "");
      } else if (key === "href") {
        element.setAttribute("href", attributes[key] || "");
      } else if (key === "event") {
        element.addEventListener(
          attributes[key] || "",
          attributes.eventHandler as EventListenerOrEventListenerObject
        );
      } else if (key === "imgUrl") {
        element.setAttribute("src", attributes[key] || "");
      } else if (key === "download") {
        element.setAttribute("download", attributes[key] || "");
      }
    }
  }

  if (parentEl) {
    parentEl.appendChild(element);
  }

  return element;
}

// Return correct answer
function getCorrectAnswer(index: string) {
  return localStorageGet("correctAnswers").find(
    (el: ICorrectAnswer) => el.index === +index
  ).correct_answer;
}

// Update badge of name, correct answers and wrong answers
function updateWelcome(): void {
  if (welcomeName && welcomeCorrect && welcomeWrong) {
    welcomeName.textContent = localStorageGet("userData").name;
    welcomeCorrect.textContent = localStorageGet("userData").correctAnswers;
    welcomeWrong.textContent = localStorageGet("userData").wrongAnswers;
  }
}

// Reset all quiz settings and clear localStorage and return to form
function newGame(): void {
  if (quizzesContainer) quizzesContainer.innerHTML = "";

  const gameOver: HTMLElement | null = document.getElementById("game-over");
  if (nameUserInput) (nameUserInput as HTMLInputElement).value = "";

  if (gameOver) addClassName(gameOver, "hidden");

  // localStorageClear();
  localStorageRemove("userData");
  localStorageRemove("correctAnswers");
  localStorageRemove("userQuestions");
  localStorageSet("userQuestions", []);

  const formLogin = document.getElementById("form-login");
  if (formLogin) removeClassName(formLogin, "hidden");
  if (formCreate) removeClassName(formCreate, "hidden");
  if (dogsContainer) removeClassName(dogsContainer, "hidden");
}

// Create a zip file, where zip file contains user data and create link, where you can download it
function createZip(): void {
  // worker
  ////////////////////////////////////////
  let zipHandler = () => {
    let userData = JSON.stringify(localStorageGet("userData"));
    const worker = new Worker("worker.js", { type: "module" });
    worker.onmessage = (e) => {
      // const clickBtn = document.body.appendChild(
      //   Object.assign(generateHTML("a", null, null), {
      //     download: "results.zip",
      //     href: URL.createObjectURL(e.data),
      //     textContent: "download",
      //   })
      // );

      let downloadBtnZip = generateHTML("a", null, null);
      const anchorEl = {
        download: "results.zip",
        href: URL.createObjectURL(e.data),
        textContent: "download",
      };

      const combinedEl = generateHTML("a", null, {
        ...downloadBtnZip.attributes,
        ...anchorEl,
      });

      let clickBtn = document.body.appendChild(combinedEl);
      clickBtn.click();
      document.body.removeChild(clickBtn);
    };
    worker.postMessage({ userData });
  };

  const downloadBtn = generateHTML("a", null, {
    textContent: "Download results",
    id: "download",
    event: "click",
    eventHandler: zipHandler,
  });

  document
    .getElementsByClassName("game-over-buttons")[0]
    .appendChild(downloadBtn);

  //////////////////////////////////////////
}

//Show message of last correct and wrong answers and buttons for new game and download result
function gameOver(): void {
  const userData = localStorageGet("userData");
  if (header) addClassName(header, "hidden");
  if (quizzesContainer) addClassName(quizzesContainer, "hidden");
  if (gameOverDiv) removeClassName(gameOverDiv, "hidden");
  if (gameOverDiv) gameOverDiv.innerHTML = "";

  let h2 = generateHTML("h2", gameOverDiv, {
    textContent: `${userData.name} your score is: ${userData.correctAnswers} / ${userData.passedQuestions}`,
  });

  let divGameOverButtons = generateHTML("div", gameOverDiv, {
    className: "game-over-buttons",
  });

  let newGameBtn = generateHTML("a", divGameOverButtons, {
    textContent: "New Game",
    href: "#",
    event: "click",
    eventHandler: newGame,
  });

  createZip();
}

// Updates the user's correct and incorrect answers
function updateUserAnswers(status: string): void {
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
function checkingAnswer(event: Event) {
  const target = event.target as HTMLElement;
  if (target.tagName.toLowerCase() === "p") {
    const checkedAnswer = target.textContent;
    if (
      target.parentElement &&
      target.parentElement.parentElement &&
      target.parentElement.parentElement.parentElement
    ) {
      const idQuiz = target.parentElement.parentElement.parentElement.id;
      const checkedQuiz = document.getElementById(`${idQuiz}`);
      if (checkedQuiz) addClassName(checkedQuiz, "disabled");

      const indexQuiz = idQuiz.split("-")[1];
      const correctAnswer = getCorrectAnswer(indexQuiz);
      if (checkedAnswer === correctAnswer) {
        addClassName(target, "correct-answer");
        updateUserAnswers("correct");
        updateWelcome();
      } else {
        addClassName(target, "wrong-answer");
        updateUserAnswers("wrong");
        updateWelcome();
      }
    }
  }
}

// Generator of HTML for quiz card
function htmlQuizCardGenerator(
  dataQuiz: IQuizData,
  index: number,
  parentEl: HTMLElement
) {
  let quizDiv = generateHTML("div", null, {
    id: `quiz-${index}`,
    className: "quiz",
  });

  let img = generateHTML("img", quizDiv, {
    className: "quiz-image",
    imgUrl: dataQuiz.url,
  });

  let h2 = generateHTML("h2", quizDiv, {
    textContent: `Category: ${dataQuiz.category}`,
  });

  let quizCardDiv = generateHTML("div", quizDiv, {
    className: "quiz-card",
  });

  let h3 = generateHTML("h3", quizCardDiv, {
    textContent: `Difficulty: ${dataQuiz.difficulty}`,
  });

  let h4 = generateHTML("h4", quizCardDiv, {
    textContent: `${dataQuiz.question}`,
  });

  let quizCardAnswersContainer = generateHTML("div", quizCardDiv, {
    className: "quiz-card-answers",
    event: "click",
    eventHandler: checkingAnswer,
  });

  let answers = [dataQuiz.correct_answer, ...(dataQuiz.incorrect_answers || [])]
    .sort(() => Math.random() - 0.5)
    .forEach((txt) => {
      let el = generateHTML("p", quizCardAnswersContainer, {
        textContent: txt,
      });
    });

  parentEl.appendChild(quizDiv);
}

// Fetch quizzes from TRIVIA API
function fetchQuizzesData(userData: IUserData) {
  if (main) addClassName(main, "loader");
  const url = `https://opentdb.com/api.php?amount=${userData.amount}${
    userData.difficulty.length === 0 ? "" : `&difficulty=${userData.difficulty}`
  }${userData.category.length === 0 ? "" : `&category=${userData.category}`}`;

  const urlCat = `https://api.thecatapi.com/v1/images/search?limit=${userData.amount}`;

  //clear quizzes container
  if (quizzesContainer) quizzesContainer.innerHTML = "";

  let mergeArr: IQuizData[] = [];

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

            localStorageGet("userQuestions").forEach(
              (el: IUserQuestion, index: number) => {
                mergeArr.push(el);
              }
            );

            // Flag for set localStorage correctAnswers and html quiz card generator
            isDone = true;
          }

          if (isDone) {
            localStorageSet(
              "correctAnswers",
              mergeArr.map((currEl: IQuizData, index: number) => {
                return { index: index, correct_answer: currEl.correct_answer };
              })
            );
            mergeArr.map((currQuiz, index) => {
              if (quizzesContainer)
                htmlQuizCardGenerator(currQuiz, index, quizzesContainer);
            });
          }

          if (main) removeClassName(main, "loader");
        });
      });
    })
    .catch((err) => alert("Server Error. Please refresh the page"));
}

// Gets user inputs from form and set it to the localStorage
function userOptionsQuizHandler(event: Event) {
  event.preventDefault();
  if (nameUserInput)
    if ((nameUserInput as HTMLInputElement).value.length === 0) return;

  if (
    nameUserInput &&
    numOfQuestionsInput &&
    difficultyInput &&
    categoryInput
  ) {
    const userData = {
      name: (nameUserInput as HTMLInputElement).value,
      amount: +(numOfQuestionsInput as HTMLInputElement).value,
      difficulty: (difficultyInput as HTMLInputElement).value,
      category: (categoryInput as HTMLInputElement).value,
      correctAnswers: 0,
      wrongAnswers: 0,
      passedQuestions: 0,
      createdQuestions: localStorageGet("userQuestions").length,
    };

    localStorageSet("userData", userData);
    if (formLogin) addClassName(formLogin, "hidden");
    if (formCreate) addClassName(formCreate, "hidden");
    if (dogsContainer) addClassName(dogsContainer, "hidden");
    if (header) removeClassName(header, "hidden");
    if (quizzesContainer) removeClassName(quizzesContainer, "hidden");
    updateWelcome();
    fetchQuizzesData(localStorageGet("userData"));
  }
}

function createQuestionHandler(event: Event) {
  event.preventDefault();
  let questionArrLocalStorage = localStorageGet("userQuestions");
  fetch(`https://api.thecatapi.com/v1/images/search`)
    .then((res) => res.json())
    .then((data) => {
      if (
        questionInput &&
        correctAnswerInput &&
        incorrectFirstAnswerInput &&
        incorrectSecondAnswerInput &&
        incorrectThirdAnswerInput
      ) {
        let questionObj = {
          index: questionArrLocalStorage.length,
          question: (questionInput as HTMLInputElement).value,
          correct_answer: (correctAnswerInput as HTMLInputElement).value,
          difficulty: "Any",
          category: "Any",
          incorrect_answers: [
            (incorrectFirstAnswerInput as HTMLInputElement).value,
            (incorrectSecondAnswerInput as HTMLInputElement).value,
            (incorrectThirdAnswerInput as HTMLInputElement).value,
          ],
          url: data[0].url,
        };

        questionArrLocalStorage.push(questionObj);
        localStorageSet("userQuestions", questionArrLocalStorage);
      }
    });
  alert("You successfully create an question. :)");
}

function generateDogHandler(event: Event) {
  event.preventDefault();

  // Use localserver
  // const ws = new WebSocket("ws://localhost:8080");

  //  Use docker for back-end
  const ws = new WebSocket("ws://0.0.0.0:8080");

  ws.addEventListener("open", () => {
    console.log("We are connected!");
    if (breedInput) ws.send((breedInput as HTMLInputElement).value);
  });

  ws.addEventListener("message", (e) => {
    fetch(e.data)
      .then((res) => res.json())
      .then((dogObj) => {
        if (dogsImgContainer) dogsImgContainer.innerHTML = "";

        generateHTML("img", dogsImgContainer, {
          id: "img-dog",
          imgUrl: dogObj.message,
        });
      });
  });
}

// Set event handler for Login button
function init() {
  localStorageSet("userQuestions", []);
  if (loginBtn) loginBtn.addEventListener("click", userOptionsQuizHandler);
  if (createBtn) createBtn.addEventListener("click", createQuestionHandler);
  if (dogBtn) dogBtn.addEventListener("click", generateDogHandler);
}

init();
