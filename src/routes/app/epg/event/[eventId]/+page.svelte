<script lang="ts">
	import { goto } from '$app/navigation';
	import EpgEventSummary from '$lib/components/epg/EPGEventSummary.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import type { PageData } from './$types';

	export let data: PageData;
	let epgEvent: ITVHEpgEvent;

	$: epgEvent = data.event;
</script>

<div class="px-4 py-2  flex flex-col">
	<!-- HEADER and NAV-->
	<div
		class=" card card-compact shadow-md p-4 px-2 flex-row flex-grow-0 sticky top-4 bg-base-100 z-front"
	>
		<span class="my-auto w-10">
			{#if epgEvent.prevEventUuid}
				<button
					on:click={() => {
						goto('./' + epgEvent.prevEventUuid);
					}}
				>
					<Icon size="xl" icon="navigate_before" />
				</button>
			{/if}
		</span>
		<div class="flex-grow">
			<EpgEventSummary {epgEvent} searchDate={new Date()} showFullDate />
		</div>
		<span class="my-auto">
			{#if epgEvent.nextEventUuid}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<button
					on:click={() => {
						goto('./' + epgEvent.nextEventUuid);
					}}
				>
					<Icon size="xl" icon="navigate_next" />
				</button>
			{/if}
		</span>
	</div>
	<!-- <div class="grid grid-cols-2 grid-rows-2  gap-3 flex-grow mt-2">
		<div class=" lg:row-span-2 lg:col-span-1 col-span-2">
			<img src={epgEvent.image} alt="Programm Images" width="100%" height="100%" class="m-auto" />
		</div>
		<div class="shadow-md lg:row-span-2 lg:col-span-1 col-span-2">2</div>
	</div> -->

	<div class="card max-md:card-compact lg:card-side shadow-xl p-2 mt-4  ">
		<figure class="w-2/3 lg:1/2 lg:p-5 mx-auto">
			<img src={epgEvent.image} alt="Programm Images" class="rounded-lg shadow-lg " />
		</figure>
		<div class="card-body lg:w-2/3  overflow-y-scroll">
			<p>{epgEvent.description}</p>
			<!-- TODO add action buttons based on config (record, edit, cancel, switch ...)-->
			<div class="card-actions justify-center" />
		</div>
	</div>
</div>
