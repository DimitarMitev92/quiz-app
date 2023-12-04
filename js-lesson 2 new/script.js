var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// Selected html elements
var main = document.getElementById("main");
var header = document.getElementById("header");
var quizzesContainer = document.getElementById("quizzes-container");
var loginBtn = document.getElementById("login");
var createBtn = document.getElementById("create");
var formLogin = document.getElementById("form-login");
var numOfQuestionsInput = document.getElementById("num-of-questions");
var categoryInput = document.getElementById("category");
var difficultyInput = document.getElementById("difficulty");
var nameUserInput = document.getElementById("name-user");
var formCreate = document.getElementById("form-create");
var questionInput = document.getElementById("question-form");
var correctAnswerInput = document.getElementById("correct-answer-form");
var incorrectFirstAnswerInput = document.getElementById("incorrect-answer1-form");
var incorrectSecondAnswerInput = document.getElementById("incorrect-answer2-form");
var incorrectThirdAnswerInput = document.getElementById("incorrect-answer3-form");
var dogsContainer = document.getElementById("dogs-wrapper");
var dogsImgContainer = document.getElementById("dogs-img-container");
var formDog = document.getElementById("dogs-form");
var breedInput = document.getElementById("dogs-select");
var dogBtn = document.getElementById("dogBtn");
var welcomeName = document.getElementById("welcome-name");
var welcomeCorrect = document.getElementById("welcome-correct");
var welcomeWrong = document.getElementById("welcome-wrong");
var gameOverDiv = document.getElementById("game-over");
// Set item to localStorage
function localStorageSet(name, data) {
    var encryptedMessage = CryptoJS.AES.encrypt(JSON.stringify(data), "secret key").toString();
    localStorage.setItem(name, encryptedMessage);
}
// Get item from localStorage
function localStorageGet(name) {
    var encryptedData = localStorage.getItem(name);
    if (encryptedData === null) {
        return null;
    }
    var bytes = CryptoJS.AES.decrypt(encryptedData, "secret key");
    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
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
function generateHTML(tag, parentEl, attributes) {
    var element = document.createElement(tag);
    if (attributes) {
        for (var key in attributes) {
            if (key === "textContent") {
                element.innerHTML = attributes[key] || "";
            }
            else if (key === "id") {
                element.setAttribute("id", attributes[key] || "");
            }
            else if (key === "className") {
                element.setAttribute("class", attributes[key] || "");
            }
            else if (key === "href") {
                element.setAttribute("href", attributes[key] || "");
            }
            else if (key === "event") {
                element.addEventListener(attributes[key] || "", attributes.eventHandler);
            }
            else if (key === "imgUrl") {
                element.setAttribute("src", attributes[key] || "");
            }
            else if (key === "download") {
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
function getCorrectAnswer(index) {
    return localStorageGet("correctAnswers").find(function (el) { return el.index === +index; }).correct_answer;
}
// Update badge of name, correct answers and wrong answers
function updateWelcome() {
    if (welcomeName && welcomeCorrect && welcomeWrong) {
        welcomeName.textContent = localStorageGet("userData").name;
        welcomeCorrect.textContent = localStorageGet("userData").correctAnswers;
        welcomeWrong.textContent = localStorageGet("userData").wrongAnswers;
    }
}
// Reset all quiz settings and clear localStorage and return to form
function newGame() {
    if (quizzesContainer)
        quizzesContainer.innerHTML = "";
    var gameOver = document.getElementById("game-over");
    if (nameUserInput)
        nameUserInput.value = "";
    if (gameOver)
        addClassName(gameOver, "hidden");
    // localStorageClear();
    localStorageRemove("userData");
    localStorageRemove("correctAnswers");
    localStorageRemove("userQuestions");
    localStorageSet("userQuestions", []);
    var formLogin = document.getElementById("form-login");
    if (formLogin)
        removeClassName(formLogin, "hidden");
    if (formCreate)
        removeClassName(formCreate, "hidden");
    if (dogsContainer)
        removeClassName(dogsContainer, "hidden");
}
// Create a zip file, where zip file contains user data and create link, where you can download it
function createZip() {
    // worker
    ////////////////////////////////////////
    var zipHandler = function () {
        var userData = JSON.stringify(localStorageGet("userData"));
        var worker = new Worker("worker.js", { type: "module" });
        worker.onmessage = function (e) {
            // const clickBtn = document.body.appendChild(
            //   Object.assign(generateHTML("a", null, null), {
            //     download: "results.zip",
            //     href: URL.createObjectURL(e.data),
            //     textContent: "download",
            //   })
            // );
            var downloadBtnZip = generateHTML("a", null, null);
            var anchorEl = {
                download: "results.zip",
                href: URL.createObjectURL(e.data),
                textContent: "download",
            };
            var combinedEl = generateHTML("a", null, __assign(__assign({}, downloadBtnZip.attributes), anchorEl));
            var clickBtn = document.body.appendChild(combinedEl);
            clickBtn.click();
            document.body.removeChild(clickBtn);
        };
        worker.postMessage({ userData: userData });
    };
    var downloadBtn = generateHTML("a", null, {
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
function gameOver() {
    var userData = localStorageGet("userData");
    if (header)
        addClassName(header, "hidden");
    if (quizzesContainer)
        addClassName(quizzesContainer, "hidden");
    if (gameOverDiv)
        removeClassName(gameOverDiv, "hidden");
    if (gameOverDiv)
        gameOverDiv.innerHTML = "";
    var h2 = generateHTML("h2", gameOverDiv, {
        textContent: "".concat(userData.name, " your score is: ").concat(userData.correctAnswers, " / ").concat(userData.passedQuestions),
    });
    var divGameOverButtons = generateHTML("div", gameOverDiv, {
        className: "game-over-buttons",
    });
    var newGameBtn = generateHTML("a", divGameOverButtons, {
        textContent: "New Game",
        href: "#",
        event: "click",
        eventHandler: newGame,
    });
    createZip();
}
// Updates the user's correct and incorrect answers
function updateUserAnswers(status) {
    var userData = localStorageGet("userData");
    if (status === "correct") {
        userData.correctAnswers = userData.correctAnswers + 1;
        userData.passedQuestions = userData.passedQuestions + 1;
    }
    else if (status === "wrong") {
        userData.wrongAnswers = userData.wrongAnswers + 1;
        userData.passedQuestions = userData.passedQuestions + 1;
    }
    localStorageSet("userData", userData);
    if (userData.passedQuestions ===
        userData.amount + userData.createdQuestions) {
        console.log("GAME OVER!!!");
        gameOver();
    }
}
// Checks whether the answer pressed is correct
function checkingAnswer(event) {
    var target = event.target;
    if (target.tagName.toLowerCase() === "p") {
        var checkedAnswer = target.textContent;
        if (target.parentElement &&
            target.parentElement.parentElement &&
            target.parentElement.parentElement.parentElement) {
            var idQuiz = target.parentElement.parentElement.parentElement.id;
            var checkedQuiz = document.getElementById("".concat(idQuiz));
            if (checkedQuiz)
                addClassName(checkedQuiz, "disabled");
            var indexQuiz = idQuiz.split("-")[1];
            var correctAnswer = getCorrectAnswer(indexQuiz);
            if (checkedAnswer === correctAnswer) {
                addClassName(target, "correct-answer");
                updateUserAnswers("correct");
                updateWelcome();
            }
            else {
                addClassName(target, "wrong-answer");
                updateUserAnswers("wrong");
                updateWelcome();
            }
        }
    }
}
// Generator of HTML for quiz card
function htmlQuizCardGenerator(dataQuiz, index, parentEl) {
    var quizDiv = generateHTML("div", null, {
        id: "quiz-".concat(index),
        className: "quiz",
    });
    var img = generateHTML("img", quizDiv, {
        className: "quiz-image",
        imgUrl: dataQuiz.url,
    });
    var h2 = generateHTML("h2", quizDiv, {
        textContent: "Category: ".concat(dataQuiz.category),
    });
    var quizCardDiv = generateHTML("div", quizDiv, {
        className: "quiz-card",
    });
    var h3 = generateHTML("h3", quizCardDiv, {
        textContent: "Difficulty: ".concat(dataQuiz.difficulty),
    });
    var h4 = generateHTML("h4", quizCardDiv, {
        textContent: "".concat(dataQuiz.question),
    });
    var quizCardAnswersContainer = generateHTML("div", quizCardDiv, {
        className: "quiz-card-answers",
        event: "click",
        eventHandler: checkingAnswer,
    });
    var answers = __spreadArray([dataQuiz.correct_answer], (dataQuiz.incorrect_answers || []), true).sort(function () { return Math.random() - 0.5; })
        .forEach(function (txt) {
        var el = generateHTML("p", quizCardAnswersContainer, {
            textContent: txt,
        });
    });
    parentEl.appendChild(quizDiv);
}
// Fetch quizzes from TRIVIA API
function fetchQuizzesData(userData) {
    if (main)
        addClassName(main, "loader");
    var url = "https://opentdb.com/api.php?amount=".concat(userData.amount).concat(userData.difficulty.length === 0 ? "" : "&difficulty=".concat(userData.difficulty)).concat(userData.category.length === 0 ? "" : "&category=".concat(userData.category));
    var urlCat = "https://api.thecatapi.com/v1/images/search?limit=".concat(userData.amount);
    //clear quizzes container
    if (quizzesContainer)
        quizzesContainer.innerHTML = "";
    var mergeArr = [];
    Promise.all([
        fetch(urlCat, {
            headers: {
                "x-api-key": "live_lfNhUCsjzIAORgFJAEbR0D8CMdmrQ9X7FN0SfjIUsUFTsrxCskTLlaCCvdxLs4HI",
            },
        }),
        fetch(url),
    ])
        .then(function (res) {
        res.map(function (res) {
            return res.json().then(function (data) {
                var isDone = false;
                if (typeof data === "object" &&
                    !Array.isArray(data) &&
                    data !== null) {
                    mergeArr = data.results;
                }
                else {
                    mergeArr = mergeArr.map(function (el, index) {
                        return __assign(__assign({}, el), { url: data[index].url });
                    });
                    localStorageGet("userQuestions").forEach(function (el, index) {
                        mergeArr.push(el);
                    });
                    // Flag for set localStorage correctAnswers and html quiz card generator
                    isDone = true;
                }
                if (isDone) {
                    localStorageSet("correctAnswers", mergeArr.map(function (currEl, index) {
                        return { index: index, correct_answer: currEl.correct_answer };
                    }));
                    mergeArr.map(function (currQuiz, index) {
                        if (quizzesContainer)
                            htmlQuizCardGenerator(currQuiz, index, quizzesContainer);
                    });
                }
                if (main)
                    removeClassName(main, "loader");
            });
        });
    })
        .catch(function (err) { return alert("Server Error. Please refresh the page"); });
}
// Gets user inputs from form and set it to the localStorage
function userOptionsQuizHandler(event) {
    event.preventDefault();
    if (nameUserInput)
        if (nameUserInput.value.length === 0)
            return;
    if (nameUserInput &&
        numOfQuestionsInput &&
        difficultyInput &&
        categoryInput) {
        var userData = {
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
        if (formLogin)
            addClassName(formLogin, "hidden");
        if (formCreate)
            addClassName(formCreate, "hidden");
        if (dogsContainer)
            addClassName(dogsContainer, "hidden");
        if (header)
            removeClassName(header, "hidden");
        if (quizzesContainer)
            removeClassName(quizzesContainer, "hidden");
        updateWelcome();
        fetchQuizzesData(localStorageGet("userData"));
    }
}
function createQuestionHandler(event) {
    event.preventDefault();
    var questionArrLocalStorage = localStorageGet("userQuestions");
    fetch("https://api.thecatapi.com/v1/images/search")
        .then(function (res) { return res.json(); })
        .then(function (data) {
        if (questionInput &&
            correctAnswerInput &&
            incorrectFirstAnswerInput &&
            incorrectSecondAnswerInput &&
            incorrectThirdAnswerInput) {
            var questionObj = {
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
        }
    });
    alert("You successfully create an question. :)");
}
function generateDogHandler(event) {
    event.preventDefault();
    // Use localserver
    // const ws = new WebSocket("ws://localhost:8080");
    //  Use docker for back-end
    var ws = new WebSocket("ws://0.0.0.0:8080");
    ws.addEventListener("open", function () {
        console.log("We are connected!");
        if (breedInput)
            ws.send(breedInput.value);
    });
    ws.addEventListener("message", function (e) {
        fetch(e.data)
            .then(function (res) { return res.json(); })
            .then(function (dogObj) {
            if (dogsImgContainer)
                dogsImgContainer.innerHTML = "";
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
    if (loginBtn)
        loginBtn.addEventListener("click", userOptionsQuizHandler);
    if (createBtn)
        createBtn.addEventListener("click", createQuestionHandler);
    if (dogBtn)
        dogBtn.addEventListener("click", generateDogHandler);
}
init();
