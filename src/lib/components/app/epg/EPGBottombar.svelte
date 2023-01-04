<script lang="ts">
	import EpgDescription from '$lib/components/epg/EPGDescription.svelte';
	import EpgEventSummary from '$lib/components/epg/EPGEventSummary.svelte';
	import Bottombar from '$lib/components/layout/Bottombar.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import { createEventDispatcher } from 'svelte';

	export let epgEvent: ITVHEpgEvent;

	const dispatch = createEventDispatcher();
</script>

<Bottombar class="h-full w-full" on:closed>
	<div class="layout w-full h-full p-2">
		{#key epgEvent}
			<div class="shadow-lg px-2 pb-2 rounded-md  bg-base-100 summary">
				<EpgEventSummary {epgEvent} showFullDate />
			</div>
			{#if epgEvent.image}
				<div class="picture min-h-0 object-scale-down">
					<img src={epgEvent.image} alt="Programm Images" class="rounded-lg mx-auto h-full " />
				</div>
			{/if}
			<div class="content flex flex-col">
				<div
					class=" shadow-lg py-2 px-2 rounded-md overflow-y-auto bg-base-100 flex-1"
					class:mt-4={!epgEvent.image}
				>
					<EpgDescription {epgEvent} mode="description" />
				</div>
			</div>
			<div class="actions flex flex-col">
				<div class="flex-1" />
				<button
					class="btn btn-primary w-full"
					on:click|stopPropagation={() => {
						if (epgEvent) dispatch('showDetails', epgEvent);
					}}>details</button
				>
			</div>
		{/key}
	</div>
</Bottombar>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(30%, 30%) 1fr min-content;
		grid-template-rows: 1fr minmax(min-content, min-content);
		grid-auto-columns: 1fr;
		gap: 1em 1em;
		grid-auto-flow: row;
		grid-template-areas:
			'picture content actions'
			'summary content actions';
	}

	.summary {
		grid-area: summary;
	}

	.picture {
		grid-area: picture;
	}

	.content {
		grid-area: content;
	}

	.actions {
		grid-area: actions;
	}
</style>
