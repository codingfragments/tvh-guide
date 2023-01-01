<script lang="ts">
	import { navigating } from '$app/stores';
	import { delay } from '$lib/client/utils/sleep';
	import { fade } from 'svelte/transition';
	export let delayMs = 100;
	export let show = false;
	export let vCenter = false;
</script>

{#if $navigating || show}
	{#await delay(delayMs) then d}
		<slot>
			<div class="bg-base-200 bg-opacity-75 absolute inset-0 " transition:fade>
				<div class="flex flex-col" class:h-full={vCenter}>
					<div class="flex-1">&nbsp;</div>
					<div class="mx-auto my-auto text-2xl">Loading</div>
					<progress class="progress w-56 mx-auto" />
					<div class="flex-1">&nbsp;</div>
				</div>
			</div>
		</slot>
	{/await}
{/if}
