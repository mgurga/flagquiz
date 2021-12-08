<script>
  import Menu from './menu.svelte';
  import Game from './game.svelte';

  let inmenu = true;
  let gsettings;

  function startgame(s) {
    inmenu = false;
    gsettings = s.detail;
    console.log("got settings: ", s.detail);
  }
</script>

<h1>FLAG QUIZ</h1>

<style>
  h1 {
    margin: 0;
  }

  :global(body){
    background-color: rgb(209, 223, 228);
  }
</style>

{#if inmenu}
  <Menu on:startgame={startgame} />
{:else}
  <Game bind:settings={gsettings}/>
{/if}