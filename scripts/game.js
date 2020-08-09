var question = document.getElementById("question");
var answer = Array.from(document.getElementsByClassName("choice-text"));
var questionNumberVal = document.getElementById("questionNumber");
var scoreVal = document.getElementById("score");
var progressComplete = document.getElementById("progress-complete");
var game = document.getElementById("game");
var loading = document.getElementById("loading");
var nextQuestion = document.getElementById("nextQuestion");
var basetimer = document.getElementById("base-timer-label");
var baseTimerPath = document.getElementById("base-timer-path-remaining");
var element = document.body;

var currentQuestion = {};
var allowAnswering = false;
var score = 0;
var questionNumber = 0;
var availableQuestions = [];
var questions = [];
const TIME_LIMIT = 25;
var timePassed = 0;
var timeLeft = TIME_LIMIT;
var timerInterval;

var sound = new Howl({
    src: ['../public/sound/tick.mp3']
});

const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
    info: {
        color: "green"
    },
    warning: {
        color: "orange",
        threshold: WARNING_THRESHOLD
    },
    alert: {
        color: "red",
        threshold: ALERT_THRESHOLD
    }
};

var icon = document.getElementById("sunny");
function toggleTheme() {
    if (localStorage.getItem('theme') === 'light-mode') {
        icon.innerHTML = "brightness_2";
        localStorage.setItem('theme', 'dark-mode');
        document.body.classList.add('dark-mode');
    }
    else {
        icon.innerHTML = "wb_sunny";
        localStorage.setItem('theme', 'light-mode');
        document.body.classList.remove('dark-mode');
    }
}
(function () {
    if (localStorage.getItem('theme') === 'dark-mode') {
        icon.innerHTML = "brightness_2";
        document.body.classList.add('dark-mode');
    }
    else {
        document.body.classList.remove('dark-mode');
    }
})();

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}
var amount = getUrlVars()["trivia_amount"];
var category = getUrlVars()["trivia_category"];
var difficulty = getUrlVars()["trivia_difficulty"];

var url = "https://opentdb.com/api.php?amount=" + amount;

if (category != "any")
    url += "&category=" + category;

if (difficulty != "any")
    url += "&difficulty=" + difficulty;

url += "&type=multiple&encode=url3986";

fetch(url)
    .then(function (res) {
        return res.json();
    })
    .then(function (loadQuestion) {
        questions = loadQuestion.results.map(function (loadedquestion) {
            var questionFormat = {
                question: loadedquestion.question
            };
            var res = unescape(questionFormat.question);
            questionFormat.question = res;
            var anschoices = [...loadedquestion.incorrect_answers];
            questionFormat.answer = Math.floor(Math.random() * 3) + 1;
            anschoices.splice(questionFormat.answer - 1, 0, loadedquestion.correct_answer);

            anschoices.forEach(function (choice, index) {
                var ch = unescape(choice);
                questionFormat["choice" + (index + 1)] = ch;
            });
            return questionFormat;
        });
        startGame();
    })
    .catch(function (err) {
        console.error(err);
    });




const CORRECT_POINT = 10;
const TOTAL_QUESTION = amount;

function startGame() {
    questionNumber = 0;
    score = 0;
    availableQuestions = [...questions];
    getQuestion();
    game.classList.remove("hidden");
    element.classList.remove("loader");
    loading.classList.add("hidden");
}

function getQuestion() {
    if (availableQuestions.length === 0 || questionNumber >= TOTAL_QUESTION) {
        localStorage.setItem("mostRecentScore", Math.round(score / TOTAL_QUESTION));
        return window.location.assign("../views/end.html");
    }
    startTimer();
    questionNumber++;
    questionNumberVal.innerText = questionNumber + "/" + TOTAL_QUESTION;
    progressComplete.style.width = (questionNumber / TOTAL_QUESTION) * 100 + "%";
    var questionNo = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionNo];
    question.innerText = currentQuestion.question;
    answer.forEach(fillValues);
    availableQuestions.splice(questionNo, 1);
    allowAnswering = true;
    answer.forEach(chooseOption);
}


function chooseOption(choice) {
    choice.addEventListener("click", function () {
        if (!allowAnswering)
            return;
        clearInterval(timerInterval);
        allowAnswering = false;
        var selectedChoice = choice;
        var selectedOption = choice.dataset["number"];
        var isOptionCorrect = "incorrect";
        var i;
        if (selectedOption == currentQuestion.answer) {
            isOptionCorrect = "correct";
            score = score + Math.min(20, parseInt(timeLeft));
            scoreVal.innerText = score;
        }

        else {
            for (i = 0; i < answer.length; i++) {
                if (answer[i].dataset["number"] == currentQuestion.answer) {
                    answer[i].parentElement.classList.add("anscorrect");
                    break;
                }
            }
        }
        selectedChoice.parentElement.classList.add(isOptionCorrect);
        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(isOptionCorrect);
            if (isOptionCorrect === "incorrect") {
                answer[i].parentElement.classList.remove("anscorrect");
            }
            if (parseInt(timeLeft) <= WARNING_THRESHOLD) {
                if (parseInt(timeLeft) <= ALERT_THRESHOLD)
                    baseTimerPath.classList.remove(COLOR_CODES.alert.color);
                else
                    baseTimerPath.classList.remove(COLOR_CODES.warning.color);
                baseTimerPath.classList.add(COLOR_CODES.info.color);
            }
            getQuestion();
        }, 2000);
    });

}

function fillValues(choice) {
    var number = choice.dataset["number"];
    choice.innerText = currentQuestion["choice" + number];
}




function timeIsUp() {
    for (var i = 0; i < answer.length; i++) {
        if (answer[i].dataset["number"] == currentQuestion.answer) {
            answer[i].parentElement.classList.add("anscorrect");
            break;
        }
    }

    setTimeout(() => {
        answer[i].parentElement.classList.remove("anscorrect");
        baseTimerPath.classList.remove(COLOR_CODES.alert.color);
        baseTimerPath.classList.add(COLOR_CODES.info.color);
        timeLeft = TIME_LIMIT;
        getQuestion();
    }, 2000);
}

function startTimer() {
    timeLeft = TIME_LIMIT;
    basetimer.innerHTML = timeLeft;
    setCircleDasharray();
    timerInterval = setInterval(() => {
        sound.rate(1, sound.play());
        timeLeft--;
        if (timeLeft < 10)
            timeLeft = '0' + timeLeft;
        basetimer.innerHTML = timeLeft;
        setCircleDasharray();
        setRemainingPathColor(timeLeft);
        if (timeLeft == "00") {
            sound.stop();
            clearInterval(timerInterval);
            timeIsUp();
        }
    }, 1000)

}

baseTimerPath.classList.add(COLOR_CODES.info.color);

function setRemainingPathColor(timeLeft) {
    const { alert, warning, info } = COLOR_CODES;
    if (timeLeft <= alert.threshold) {
        sound.stop();
        sound.rate(3, sound.play());
        baseTimerPath.classList.remove(warning.color);
        baseTimerPath.classList.add(alert.color);

    } else if (timeLeft <= warning.threshold) {
        sound.stop();
        sound.rate(1.5, sound.play());
        baseTimerPath.classList.remove(info.color);
        baseTimerPath.classList.add(warning.color);
    }
}

function calculateTimeFraction() {
    const rawTimeFraction = timeLeft / TIME_LIMIT;
    return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
    const circleDasharray = `${(
        calculateTimeFraction() * 283
    ).toFixed(0)} 283`;
    baseTimerPath.setAttribute("stroke-dasharray", circleDasharray);
}
