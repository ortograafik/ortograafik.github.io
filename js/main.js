let level;
let rounds;

let audioContext = new window.AudioContext();
let source = audioContext.createBufferSource();
let audioStarted;
let audioBuffer;

let currentRound = 0;
let vocabulary = [];
let answer = "";
let wrongGuesses = Array();

let progressBar = document.getElementById("progress_bar");
let audioButton = document.getElementById("audio_button");

let setupArea = document.getElementById("setup_area");
let gameArea = document.getElementById("game_area");
let resultsArea = document.getElementById("results_area");
let navigationArea = document.getElementById("navigation_area");

let selectLevel = document.getElementById("select_level");
let selectRounds = document.getElementById("select_rounds");
let selectAutoplay = document.getElementById("select_autoplay");

function setup() {
  level = selectLevel.value;
  rounds = selectRounds.value;
  setupProgressBar(rounds);
  setupVocabulary();
};

function setupProgressBar(amount) {
  while (progressBar.firstChild) {
    progressBar.removeChild(progressBar.lastChild);
  };
  for (var i = 0; i < amount; i++) {
    var icon = document.createElement("img");
    icon.src = "/icons/undecided.svg";
    icon.classList.add("progress_element");
    icon.classList.add("undecided_icon");
    progressBar.appendChild(icon);
  };
};

function setProgress(value, round) {
  progressBar.children[round].classList.remove('undecided_icon');
  if (value > 0) {
    progressBar.children[round].src = "/icons/correct.svg"
    progressBar.children[round].classList.add("correct_icon");
  };
  if (value < 0) {
    progressBar.children[round].src = "/icons/incorrect.svg"
    progressBar.children[round].classList.add("incorrect_icon");
  };
};

async function setupVocabulary() {
  var response = await fetch(pathToVocabulary);
  var data = await response.text();
  Papa.parse(data, {
    header: true,
    complete: function(results) {
      var vocabularyData = results.data;
      shuffle(vocabularyData);
      if (level != "Kõik") {
        for (var i = 0; i < vocabularyData.length; i++) {
          if (vocabularyData[i]["TASE"] == level) {
            vocabulary.push(vocabularyData[i]);
          };
        };
      } else {
        vocabulary = vocabularyData;
      };
      setupArea.hidden = true;
      progressBar.hidden = false;
      gameArea.hidden = false;
      setupRound();
    }
  });
};

// Fisher-Yates Shuffle
function shuffle(array) {
  for (var i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  };
};

async function setAudio(text) {
  audioStarted = false;
  var response = await fetch("https://api.tartunlp.ai/text-to-speech/v2", {
    method: "POST",
    body: JSON.stringify({
      text: text,
      speaker: "meelis",
      speed: 1
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  });
  var buffer = await response.arrayBuffer();
  var blob = new Blob([new Uint8Array(buffer)]);
  var reader = new FileReader();
  reader.onload = function (e) {
    audioContext.decodeAudioData(e.target.result, function(buffer) {
      audioBuffer = buffer;
    });
  };
  reader.readAsArrayBuffer(blob);
  startRound();
  if (selectAutoplay.checked == true) { setTimeout(function() { playAudio(); }, 200); };
};

function playAudio() {
  if (audioStarted == true) { stopAudio(); };
  source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start(0);
  audioStarted = true;
};

function stopAudio() {
  if (audioStarted == true) {
    source.stop();
    source.disconnect();
  };
};

function resolveGuess(guess) {
  if (guess == answer) {
    setProgress(1, currentRound);
  } else {
    wrongGuesses.push([guess, answer]);
    setProgress(-1, currentRound);
  };
  if (currentRound == rounds-1) {
    endGame();
  } else {
    currentRound += 1;
    setupRound();
  };
};

function endGame() {
  gameArea.hidden = true;
  resultsArea.hidden = false;
  navigationArea.hidden = false;
  if (wrongGuesses.length == 0) {
    var desc = document.createElement("h2");
    var text = document.createTextNode("Kõik õigesti vastatud!");
    desc.appendChild(text);
    resultsArea.prepend(desc);
  } else {
    var descriptors = ["Vale sõna", "Õige vaste"];
    for (let i = 0; i < descriptors.length; i++) {
      var column = document.createElement("div");
      column.classList.add("column");
      resultsArea.prepend(column);
    };
    for (let i = 0; i < descriptors.length; i++) {
      var desc = document.createElement("h2");
      var text = document.createTextNode(descriptors[i]);
      desc.classList.add("descriptor");
      desc.appendChild(text);
      resultsArea.children[i].appendChild(desc);
    };
    for (var i = 0; i < wrongGuesses.length; i++) {
      for (let j = 0; j < wrongGuesses[i].length; j++) {
        var elem = document.createElement("p");
        var text = document.createTextNode(wrongGuesses[i][j]);
        elem.appendChild(text);
        resultsArea.children[j].appendChild(elem);
      };
    };
  };
};