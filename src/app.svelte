<script>
  import Menu from "./menu.svelte";
  import Game from "./game.svelte";
  import Finish from "./finish.svelte";

  let menu = 0; // 0 = Home, 1 = Game, 2 = Win
  let gsettings;
  let enddata;

  function startgame(s) {
    menu = 1;
    gsettings = s.detail;
    console.log("got settings: ", s.detail);
  }

  function winner(w) {
    menu = 2;
    enddata = w.detail;
  }
</script>

<div class="root">
  <h1>FLAG QUIZ</h1>
</div>

<svelte:head>
  <style>
    .root {
      width: 30%;
      margin: 0 auto;
    }
    @media (max-width: 1100px) {
      .root {
        width: 60%;
      }
    }
    @media (max-width: 700px) {
      .root {
        width: 90%;
      }
    }
  </style>
</svelte:head>

{#if menu === 0}
  <Menu on:startgame={startgame} />
{:else if menu === 1}
  <Game bind:settings={gsettings} on:win={winner} />
{:else if menu === 2}
  <Finish bind:enddata />
{:else}
  <p>invalid menu</p>
{/if}

<style>
  h1 {
    margin: 0 auto;
    width: fit-content;
  }

  :global(body) {
    background-color: rgb(209, 223, 228);
  }

  :global(button) {
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
</style>
