<script>
  export let enddata;

  let percent = ((enddata.correct + 1) / enddata.settings.count) * 100;
</script>

<div class="root">
  <h1 class="center">FINISHED</h1>
  <br />
  {#if percent == 100}
    <!-- perfect score -->
    <h1 class="rainbow">EPIC</h1>
  {:else if percent < 100 && percent >= 50 }
    <!-- between 100% and 50% -->
    <h2 class="result">ok i guess</h2>
  {:else}
    <!-- less than 50% -->
    <h2 class="result">bad</h2>
  {/if}
  <br />
  <h3 class="center">YOUR SCORE: {enddata.correct + 1}/{enddata.settings.count}</h3>
</div>

<style>
  .root {
    width: 50%;
    margin: 0 auto;
  }
  @media (max-width: 1000px) { .root { width: 40%; } }
  @media (max-width: 800px) { .root { width: 90%; } }

  .result, .rainbow, .center {
    margin: 0 auto;
    font-size: 30pt;
    width: fit-content;
  }

  .result {
    animation: monochrome 2.5s linear;
    animation-iteration-count: infinite;
  }

  .rainbow {
		animation: rainbow 2.5s linear;
		animation-iteration-count: infinite;
    font-size: 40pt;
  }

  @keyframes rainbow {
		100%,0% { color: rgb(255,0,0); }
		8% { color: rgb(255,127,0); }
		16% { color: rgb(255,255,0); }
		25% { color: rgb(127,255,0); }
		33% { color: rgb(0,255,0); }
		41% { color: rgb(0,255,127); }
		50% { color: rgb(0,255,255); }
		58% { color: rgb(0,127,255); }
		66% { color: rgb(0,0,255); }
		75% { color: rgb(127,0,255); }
		83% { color: rgb(255,0,255); }
		91% { color: rgb(255,0,127); }
	}

  @keyframes monochrome {
    0%,100% { color: white; }
    50% { color: black; }
  }
</style>