var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/quiz_app");
var scoreSchema = new mongoose.Schema({
    name: String,
    score : Number
});
var {userName,recentScore} = require("./end.js");
var Score = mongoose.model("Score",scoreSchema);
var scoredb = new Score({
    name:userName,
    score:recentScore
});
scoredb.save();
console.log(scoredb);