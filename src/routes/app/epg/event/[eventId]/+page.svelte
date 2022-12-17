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

<div class="grid grid-rows-[max-content_1fr] overflow-hidden h-full px-4">
	<!-- HEADER and NAV-->
	<div class="shadow-md py-2   flex flex-row  bg-base-100 z-front rounded-xl">
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
		<div class="flex-grow px-2">
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

	<div class="shadow-xl p-2 mt-8 mb-4 overflow-hidden flex max-md:flex-col rounded-xl">
		<img
			src={epgEvent.image}
			alt="Programm Images"
			class="rounded-lg max-md:w-1/2 mx-auto object-contain lg:w-1/3 lg:mb-auto lg:mt-2"
		/>
		<div class=" lg:w-2/3 max-md:mt-2 overflow-hidden flex flex-col">
			<div class="overflow-y-scroll flex-grow px-4 max-md:my-4 lg:mb-4">{epgEvent.description}</div>
			<!-- TODO add action buttons based on config (record, edit, cancel, switch ...)-->
			<div class="card-actions justify-center ">
				<!-- <button class="btn btn-sm">NOPE</button> -->
			</div>
		</div>
	</div>
</div>
