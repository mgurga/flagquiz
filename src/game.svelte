<script>
  export let settings;

  import { countryflags } from "./data.js";

  let progresscheck = "??/??";
  let currentflag = {};
  let guesses = [{name: "", isRed: false}, {name: "", isRed: false}, {name: "", isRed: false}, {name: "", isRed: false}];
  let flaglist = [];
  let flagnum = 0;
  let correct = 0;
  let missedquestions = 0;

  function populatequestion(num) {
    currentflag = flaglist[num];
    flagnum = num;
    missedquestions = 0;

    for(var i = 0; i < 4; i++) {
      guesses[i].name = randomcountryflag().name;
      guesses[i].isRed = false;
    }

    console.log(currentflag);
    guesses[rand(0, 3)].name = currentflag.name;
  }

  function chose(x) {
    console.log("clicked button #" + x);
    if(guesses[x].name == currentflag.name) {
      console.log("CORRECT");
      if(missedquestions == 0)
        correct++;
      flagnum++;
      populatequestion(flagnum);
      progresscheck = correct + "/" + settings.count;
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

  export function start(set) {
    // console.log("got settings: ", set);
    // settings = set;
    console.log("generating " + settings.count + " flags");

    while (flaglist.length < settings.count) {
      let rand = randomcountryflag();
      if (!flaglist.includes(rand)) {
        flaglist.push(rand);
      }
    }

    console.log(flaglist);
    progresscheck = "0/" + settings.count;

    populatequestion(0);
  }

  start()
</script>

<h1 class="center">What flag is this???</h1>
<p class="center">{progresscheck}</p>
<img 
  class="center"
  src={currentflag.url} alt="flag" />
<br />
<button class="{guesses[0].isRed ? "redborder" : ""}" on:click={() => chose(0)}>{guesses[0].name}</button>
<br />
<button class="{guesses[1].isRed ? "redborder" : ""}" on:click={() => chose(1)}>{guesses[1].name}</button>
<br />
<button class="{guesses[2].isRed ? "redborder" : ""}" on:click={() => chose(2)}>{guesses[2].name}</button>
<br />
<button class="{guesses[3].isRed ? "redborder" : ""}" on:click={() => chose(3)}>{guesses[3].name}</button>

<style>
  .redborder {
    border: 10px solid red;
  }

  h1 {
    margin: 0;
  }

  img {
    width: 50%;
  }

  .center {
    width: 50%;
  }
</style>