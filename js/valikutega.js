let pathToVocabulary = "/data/sõnavara_näidetega.csv"
let multipleChoice = document.getElementById("multiple_choice");

function setupRound() {
  answer = vocabulary[currentRound]["SÕNA"];
  var choices = vocabulary[currentRound]["SARNASED"].split(", ");
  choices.push(answer);
  shuffle(choices);
  for (var i = 0; i < choices.length; i++) {
    var choice = document.createElement("button");
    choice.disabled = true;
    var label = document.createTextNode(choices[i]);
    choice.appendChild(label);
    choice.classList.add("choice");
    choice.setAttribute("onclick", "choose(event, this)");
    if (i < choices.length/2) {
      multipleChoice.children[0].appendChild(choice);
    } else {
      multipleChoice.children[1].appendChild(choice);
    };
  };
  setAudio(vocabulary[currentRound]["NÄIDE"]+".");
};

function startRound() {
  audioButton.disabled = false;
  for (var columns of multipleChoice.children) {
    for (var button of columns.children) {
      button.disabled = false;
    };
  };
};

function choose(e, t) {
  stopAudio();
  for (let i = 0; i < multipleChoice.children.length; i++) {
    while (multipleChoice.children[i].firstChild) {
      multipleChoice.children[i].removeChild(multipleChoice.children[i].lastChild);
    };
  };
  audioButton.disabled = true;
  var guess = t.textContent;
  resolveGuess(guess);
};