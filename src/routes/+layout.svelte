<script context="module" lang="ts">
</script>

<script lang="ts">
  import "../app.css";
  import '$lib/globals'

  import anylogger from "anylogger";

  import { onMount } from "svelte";
  const LOG = anylogger("Main App");
  export let segment: string;

  // Check for Media Changes Management
  // ----------------------------------
  import { media } from  "$lib/client/state/global";
  onMount(() => {
    LOG.info("Mounted main Layout");
  });
  $: LOG.info("Viewport Changes :" + $media.classNames);
  LOG.debug(" Root Navigation ::"+segment)

  // CONFIG Management
  // TODO Implement basic Config Holder !!!
  // -----------------
  // import { appConfig, updateCfg } from "../state/Settings";
  // onMount(async () => {
  //   updateCfg();
  // });
  // $: {
  //   LOG.info(`Config Changed on Segment ${segment}`, $appConfig);
  // }

</script>

<slot />
