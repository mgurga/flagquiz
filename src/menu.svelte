<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    let flagcount;
    let timerenabled = true;

    function startgame() {
        dispatch("startgame", {
            count: flagcount,
            timerenabled: timerenabled,
        });
    }
</script>

<br />
<div class="root">
  <label>
      Flag count:
      <select bind:value={flagcount}>
          <option value="10">10 flags</option>
          <option selected="selected" value="25">25 flags</option>
          <option value="197">197 flags</option>
      </select>
  </label>
  <br />
  <label>
      Timed:
      <input type="checkbox" name="scales" bind:checked={timerenabled} />
  </label>
  <br />
  <br />
  <button on:click={startgame}>Start</button>
</div>