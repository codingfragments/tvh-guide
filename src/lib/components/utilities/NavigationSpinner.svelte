<script lang="ts">
	import { navigating } from '$app/stores';
	import { delay } from '$lib/client/utils/sleep';
	import { fade } from 'svelte/transition';
	import Icon from '../Icon.svelte';
	export let delayMs = 100;
	export let show = false;
	export let vCenter = false;
	export let showAutomatic = true;
	export let translucent = true;
	/**
	 * Allow to controll basic positioning. Please make sure to not control
	 * Design or colors including Background.
	 * --> use slot/inner-component instead
	 */
	let clazz = 'absolute inset-0';
	export { clazz as class };
</script>

{#if ($navigating && showAutomatic) || show}
	{#await delay(delayMs) then d}
		<slot>
			<div class="{clazz} bg-base-200  flex flex-col z-modal " class:bg-opacity-75={translucent} transition:fade>
				<div class="flex flex-col" class:h-full={vCenter}>
					<div class="flex-1">&nbsp;</div>
					<div class="mx-auto flex flex-row">
						<div class="text-3xl ml-4">L</div>
						<div class="mt-4"><Icon icon="autorenew" size="xl" class="animate-spin " /></div>
						<div class="text-3xl ml-0">ading</div>
					</div>

					<div class="flex-1">&nbsp;</div>
				</div>
			</div>
		</slot>
	{/await}
{/if}
