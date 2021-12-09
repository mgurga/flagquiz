<script>
  export let settings;

  import { countryflags } from "./data.js";
  import { createEventDispatcher } from "svelte";

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
  const dispatch = createEventDispatcher();

  function populatequestion(num) {
    currentflag = flaglist[num];
    flagnum = num;
    missedquestions = 0;
    let guessing = currentflag;

    for (var i = 0; i < guesses.length; i++) {
      let rand = randomcountryflag(guessing.region);

      while (rand == guessing) rand = randomcountryflag();

      guesses[i].name = rand.name;
      guesses[i].isRed = false;
    }

    console.log(currentflag);
    guesses[rand(0, guesses.length - 1)].name = guessing.name;
  }

  function chose(x) {
    console.log("clicked button #" + x);
    if (guesses[x].name == currentflag.name) {
      console.log("CORRECT");
      if (missedquestions == 0) correct++;
      flagnum++;
      if ((flagnum + 1) == settings.count) {
        dispatch("win", {
            "settings": settings,
            "correct": correct,
        });
      }
      populatequestion(flagnum);
      progresscheck = flagnum + 1 + "/" + settings.count;
      scorecount = "Score: " + correct;
    } else {
      console.log("WRONG");
      guesses[x].isRed = true;
      missedquestions++;
    }
  }

  function randomcountryflag(region) {
    let rand = countryflags[Math.floor(Math.random() * countryflags.length)];
    if(region == undefined)
      return rand;
    else
      return (rand.region == region ? rand : randomcountryflag(region))
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

  function handleKeydown(event) {
    if(event.key == "1") chose(0);
    if(event.key == "2") chose(1);
    if(event.key == "3") chose(2);
    if(event.key == "4") chose(3);
  }

  start();
</script>

<svelte:window on:keydown={handleKeydown} />
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

  .progress {
    float: right;
  }

  .center {
    margin: 0 auto;
    width: fit-content;
  }

  .guess {
    font-size: 20pt;
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
    max-height: 50vh;
    width: 100%;
    height: 50vh;
    object-fit: cover;
    overflow-y: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
  }
</style>
