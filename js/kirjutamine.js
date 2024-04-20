let vocabulary;

let audioContext = new window.AudioContext();
let source = audioContext.createBufferSource();
let audioStarted;
let audioBuffer;

let rounds = 5;
let currentRound = 0;
let answer = "";
let wrongGuesses = Array();

let progressBar = document.querySelector(".progress");
let audioButton = document.querySelector(".audio_button");
let inputField = document.querySelector(".input_field");
let guessButton = document.querySelector(".guess_button");

setupProgressBar(rounds);
setupVocabulary();

function setupProgressBar(amount) {
  for (var i = 0; i < amount; i++) {
    var icon = document.createElement("img");
    icon.src = "/icons/undecided.svg";
    progressBar.appendChild(icon);
  };
};

function setProgressBar(value, round) {
  if (value > 0) { progressBar.children[round].src = "/icons/correct.svg" };
  if (value < 0) { progressBar.children[round].src = "/icons/incorrect.svg" };
};

async function setupVocabulary() {
  var response = await fetch("/data/sõnavara_määratlustega.csv");
  var data = await response.text();
  Papa.parse(data, {
    header: true,
    complete: function(results) {
      vocabulary = results.data;
      shuffle(vocabulary);
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

function setupRound() {
  answer = vocabulary[currentRound]["SÕNA"];
  setAudio(vocabulary[currentRound]["SÕNA"]+". "+vocabulary[currentRound]["MÄÄRATLUS"]+".");
};

function endGame() {
  var results = document.querySelector(".results");
  if (wrongGuesses.length === 0) {
    var info = document.createElement("p");
    var text = document.createTextNode("Kõik õigesti vastatud!");
    info.appendChild(text);
    results.appendChild(info);
  } else {
    var info = document.createElement("p");
    var text = document.createTextNode("Valesti vastatud sõnad");
    info.appendChild(text);
    results.appendChild(info);
    for (var i = 0; i < wrongGuesses.length; i++) {
      var string = document.createElement("p");
      var text = document.createTextNode(wrongGuesses[i][0]+" | "+wrongGuesses[i][1]);
      string.appendChild(text);
      results.appendChild(string);
    };
  };
};

function makeGuess() {
  stopAudio();
  document.querySelector(".audio_button").disabled = true;
  document.querySelector(".guess_button").disabled = true;
  var guess = inputField.value.toLowerCase();
  inputField.value = "";
  if (guess == answer) {
    setProgressBar(1, currentRound);
  } else {
    wrongGuesses.push([answer, guess]);
    setProgressBar(-1, currentRound);
  };
  if (currentRound == rounds-1) {
    endGame();
  } else {
    currentRound += 1;
    setupRound();
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
  document.querySelector(".audio_button").disabled = false;
  document.querySelector(".guess_button").disabled = false;
};

function playAudio() {
  if (audioStarted == true) {
    stopAudio();
  };
  source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start(0);
  audioStarted = true;
};

function stopAudio() {
  source.stop();
  source.disconnect();
};