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

var highScoreList = document.getElementById("highScoreList");
var highScore = JSON.parse(localStorage.getItem("highScore")) || [];

highScoreList.innerHTML = highScore.map(function (score) {
    return `<div class="highScore"><div id="award">
            <i class="fas fa-award" ></i></div>
            <div id="name">${score.name}</div>
            <div id="score">${score.score}</div></div>`;
}).join("");