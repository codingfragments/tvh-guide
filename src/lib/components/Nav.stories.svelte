<script lang="ts">
    import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
    import Nav from "./Nav.svelte";
    import { media } from "$lib/client/state/global";
    import { NavRoute } from "./NavRoute";

    const routes = [
      new NavRoute("/app/epg", "epg", "EPG", "dvr"),
      new NavRoute("/app/now", "now", "Now", "today"),
      new NavRoute("/app/now2", "now2", "Now", "today"),
      new NavRoute("/app/recordings", "recordings", "Rec", "voicemail"),
      new NavRoute("/app/settings", "settings", "Settings", "settings"),
    ];
    let vert = false
    $: vert=$media.lg == true

</script>


<Meta  title="Layout/Navigation" component={Nav}
  argTypes={{
      segment:{control:"text"},
      vertical:{controll:"boolean"},
      collapsed:{controll:"boolean"},
      routes:{controll:"object"},
      onNavigate: { action: "onNavigate" },

  }}
/>


<Template let:args >
    {#if args.vertical}
    <div class="flex flex-row absolute top-0 bottom-0 left-0 right-0">
        <div class=" bg-theme-primary text-theme-onPrimary elevation-5 z-tools flex-grow-0">
            <Nav
            {...args}
            on:navigate={args.onNavigate}
          />
        </div>
        <div class="flex-grow bg-theme-background"></div>

    </div>

    {:else}
    <div class="flex flex-col absolute top-0 bottom-0 left-0 right-0">
        <div class="flex-grow bg-theme-background"></div>
        <div class=" bg-theme-primary text-theme-onPrimary elevation-5 z-tools flex-grow-0">
            <Nav
            {...args}
            on:navigate={args.onNavigate}

          />
        </div>

    </div>

    {/if}
</Template>



<Story
  name="Vertical"
  args={{
      routes:routes,
      vertical:true,
      segment:"",
      collapsed:false
  }}
/>

<Story
  name="Horizontal"
  args={{
      routes:routes,
      vertical:false,
      segment:"",
      collapsed:false
  }}
/>
