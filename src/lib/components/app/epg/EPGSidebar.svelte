<script lang="ts">
	import EpgDescription from '$lib/components/epg/EPGDescription.svelte';
	import EpgEventSummary from '$lib/components/epg/EPGEventSummary.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import { createEventDispatcher } from 'svelte';

	export let epgEvent: ITVHEpgEvent;

	const dispatch = createEventDispatcher();
</script>

<Sidebar class="h-full w-full" on:closed>
	{#key epgEvent}
		<div class="shadow-lg px-2 pb-2 rounded-md mt-8 bg-base-100">
			<EpgEventSummary {epgEvent} showFullDate />
		</div>
		{#if epgEvent.image}
			<div class="p-4">
				<img src={epgEvent.image} alt="Programm Images" width="100%" class="rounded-lg object-scale-down shadow-md  " />
			</div>
		{/if}
		<div class=" shadow-lg py-2 px-2 rounded-md overflow-y-auto bg-base-100 flex-1" class:mt-4={!epgEvent.image}>
			<EpgDescription {epgEvent} mode="description" />
		</div>
		<div class="my-4  ml-auto ">
			<button
				class="btn btn-primary"
				on:click|stopPropagation={() => {
					if (epgEvent) dispatch('showDetails', epgEvent);
				}}>details</button
			>
		</div>
	{/key}
</Sidebar>
