var username = document.getElementById("username");
var submitScore = document.getElementById("submit-score");
var finalScore = document.getElementById("finalScore");
var recentScore = localStorage.getItem("mostRecentScore");
finalScore.innerText = recentScore;
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
        console.log(icon.innerHTML);
        icon.innerHTML = "brightness_2";
        document.body.classList.add('dark-mode');
    }
    else {
        document.body.classList.remove('dark-mode');
    }
})();

var highScore = JSON.parse(localStorage.getItem("highScore")) || [];

var LEADERBOARD_SIZE = 5;

username.addEventListener("keyup", function () {
    submitScore.disabled = !username.value;
});

function saveHighScore(event) {
    event.preventDefault();
    var score = {
        score: recentScore,
        name: username.value
    }
    highScore.push(score);
    highScore.sort(function (a, b) {
        return b.score - a.score;
    });
    highScore.splice(LEADERBOARD_SIZE);
    localStorage.setItem("highScore", JSON.stringify(highScore));
    window.location.assign("/views/leaderboard.html");
}