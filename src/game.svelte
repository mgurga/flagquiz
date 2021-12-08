<script>
  export let settings;

  import { countryflags } from "./data.js";

  let progresscheck = "??/??";
  let currentflag = {};
  let guesses = [
    { name: "", isRed: false },
    { name: "", isRed: false },
    { name: "", isRed: false },
    { name: "", isRed: false },
  ];
  let flaglist = [];
  let flagnum = 0;
  let correct = 0;
  let missedquestions = 0;
  let scorecount = "??/??";

  function populatequestion(num) {
    currentflag = flaglist[num];
    flagnum = num;
    missedquestions = 0;

    for (var i = 0; i < 4; i++) {
      guesses[i].name = randomcountryflag().name;
      guesses[i].isRed = false;
    }

    console.log(currentflag);
    guesses[rand(0, 3)].name = currentflag.name;
  }

  function chose(x) {
    console.log("clicked button #" + x);
    if (guesses[x].name == currentflag.name) {
      console.log("CORRECT");
      if (missedquestions == 0) correct++;
      flagnum++;
      populatequestion(flagnum);
      progresscheck = flagnum + 1 + "/" + settings.count;
      scorecount = "Score: " + correct
    } else {
      console.log("WRONG");
      guesses[x].isRed = true;
      missedquestions++;
    }
  }

  function randomcountryflag() {
    return countryflags[Math.floor(Math.random() * countryflags.length)];
  }

  function rand(min, max) {
    return Math.floor(Math.random() * max) + min;
  }

  export function start() {
    console.log("generating " + settings.count + " flags");

    while (flaglist.length < settings.count) {
      let rand = randomcountryflag();
      if (!flaglist.includes(rand)) {
        flaglist.push(rand);
      }
    }

    console.log(flaglist);
    progresscheck = "1/" + settings.count;
    scorecount = "Score: 0";

    populatequestion(0);
  }

  start();
</script>

<div class="root">
  <h1 class="center">What flag is this???</h1>
  <p class="progress">{progresscheck}</p>
  <p>{scorecount}</p>
  <div class="imgcontainer">
    <img src={currentflag.url} alt="flag" />
  </div>
  <div class="guesses">
    <button
      class="guess {guesses[0].isRed ? 'redborder' : ''}"
      on:click={() => chose(0)}>{guesses[0].name}</button
    >
    <br />
    <button
      class="guess {guesses[1].isRed ? 'redborder' : ''}"
      on:click={() => chose(1)}>{guesses[1].name}</button
    >
    <br />
    <button
      class="guess {guesses[2].isRed ? 'redborder' : ''}"
      on:click={() => chose(2)}>{guesses[2].name}</button
    >
    <br />
    <button
      class="guess {guesses[3].isRed ? 'redborder' : ''}"
      on:click={() => chose(3)}>{guesses[3].name}</button
    >
  </div>
</div>

<style>
  .redborder {
    border: 10px solid red !important; 
  }

  p {
    width: fit-content;
    margin: 0px;
    font-size: 20pt;
  }

  h1 {
    margin: 0;
  }

  .root {
    width: 50%;
    margin: 0 auto;
  }

  .progress {
    float: right;
  }

  .center {
    margin: 0 auto;
    width: fit-content;
  }

  .guess {
    width: 100%;
    border: 1px solid black;
    text-align: center;
    background-color: rgb(77, 77, 255);
    color: white;
    padding: 10px;
    margin-top: 2px;
    margin-bottom: 2px;
    margin-left: auto;
    margin-right: auto;
  }

  .guess:hover {
    background-color: royalblue;
  }

  .guesses {
    width: 75%;
    margin: 0 auto;
  }

  img {
    width: 100%;
    height: fit-content;
    margin: auto;
    display: block;
  }

  .imgcontainer {
    max-width: 100%;
    max-height:30vh;
    width: 100%;
    height: 30vh;
    object-fit: cover;
    overflow-y: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
  }
</style>
