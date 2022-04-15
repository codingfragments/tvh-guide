<script lang="ts">
    import {media} from "$lib/client/state/global"
</script>

<script context="module">
    export async function load() {
        return {
            status: 302,
            redirect: "/app/now"
        };
    }
</script>

<h1 class=" text-xl font-bold underline bg-theme-background">Welcome to SvelteKit!</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
