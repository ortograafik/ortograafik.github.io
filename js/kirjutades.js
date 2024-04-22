let pathToVocabulary = "/data/sõnavara_määratlustega.csv"
let inputField = document.getElementById("input_field");
let guessButton = document.getElementById("guess_button");

function setupRound() {
  answer = vocabulary[currentRound]["SÕNA"];
  setAudio(vocabulary[currentRound]["SÕNA"]+". "+vocabulary[currentRound]["MÄÄRATLUS"]+".");
};

function startRound() {
  audioButton.disabled = false;
  guessButton.disabled = false;
};

function checkEnter(event) {
  if (event.code == "Enter") {
    makeGuess();
  };
};

function makeGuess() {
  if (inputField.value.replace(/\s/g, "").length == 0) { return; };
  stopAudio();
  audioButton.disabled = true;
  guessButton.disabled = true;
  var guess = inputField.value.toLowerCase();
  inputField.value = "";
  resolveGuess(guess);
};