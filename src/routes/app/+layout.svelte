<script lang="ts">

    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    let segment:string;

    import Nav from "$lib/components/Nav.svelte";

    import { onMount } from "svelte";
    import anylogger from "anylogger";
    import { media } from "$lib/client/state/global";
    import { NavRoute } from '$lib/components/NavRoute';
    const LOG = anylogger("App-Layout");
    onMount(() => LOG("Inner Mount"));

    const routes = [
      new NavRoute("/app/epg", "epg", "EPG", "dvr"),
      new NavRoute("/app/now", "now", "Now", "today"),
      new NavRoute("/app/now2", "now2", "Now", "today"),
      new NavRoute("/app/recordings", "recordings", "Rec", "voicemail"),
      new NavRoute("/app/settings", "settings", "Settings", "settings"),
    ];

    // calc segment based on full URL and current path
    const pathPrefix="/app/"
    $: {
        if ($page.url.pathname.startsWith(pathPrefix)) {
            segment=$page.url.pathname.substring(pathPrefix.length).split("/")[0]
        }
    }
  </script>
  <div class=" h-full" class:grid-container={!$media.lg} class:grid-containerXL={$media.lg} data-theme='bumblebee'>

    <div class="grdNav   bg-base-300 text-base-content elevation-5 z-tools">
      <Nav {segment} {routes} vertical={$media.lg == true} on:navigate={(ev)=>{goto(ev.detail.path)}}/>
    </div>
    <main class="grdMain bg-base-100 overflow-y-scroll">
      <slot />
    </main>
  </div>

  <style lang="postcss">
    .grid-container {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: minmax(0, 1fr) 75px;
      gap: 0px 0px;
      grid-template-areas:
        "grdMain"
        "grdNav";
    }

    .grid-containerXL {
      display: grid;
      grid-template-columns: minmax(0, auto) minmax(0, 1fr);
      grid-template-rows: minmax(0, 1fr);
      gap: 0px 0px;
      grid-template-areas: "grdNav grdMain";
    }

    .grdNav {
      grid-area: grdNav;
    }

    .grdMain {
      grid-area: grdMain;
    }
  </style>
