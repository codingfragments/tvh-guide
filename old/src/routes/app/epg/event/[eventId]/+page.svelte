<script lang="ts">
	import anylogger from 'anylogger';
	const LOG = anylogger('Page:/epgEvent');

	import { afterNavigate, goto } from '$app/navigation';
	import EpgEventSummary from '$lib/components/epg/EPGEventSummary.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import type { PageData } from './$types';
	import EpgDescription from '$lib/components/epg/EPGDescription.svelte';
	import { navigateBack } from '$lib/client/navigation';

	export let data: PageData;
	let epgEvent: ITVHEpgEvent;

	$: epgEvent = data.event;

	// allow a back navigation to be visible IF navigation within the app. If external link was used, it will default to false
	let showBackButton = false;
	afterNavigate(({ from }) => {
		LOG.debug({ msg: ' Navigate hit', from });
		if (from) {
			showBackButton = true;
		}
	});

	let showFullPic = false;
</script>

<div class="relative grid grid-rows-[max-content_1fr] overflow-hidden h-full px-4 xl:w-2/3 2xl:w-1/2 mx-auto ">
	<!-- HEADER and NAV-->
	<div class="shadow-md py-2   flex flex-row  bg-base-100 z-front rounded-xl">
		<span class="my-auto w-10">
			{#if epgEvent.prevEventUuid}
				<button
					on:click={() => {
						goto('./' + epgEvent.prevEventUuid, { invalidateAll: true, replaceState: true });
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
						goto('./' + epgEvent.nextEventUuid, { invalidateAll: true, replaceState: true });
					}}
				>
					<Icon size="xl" icon="navigate_next" />
				</button>
			{/if}
		</span>
	</div>

	<div class="shadow-xl p-2 mt-8 mb-4 overflow-hidden flex max-md:flex-col rounded-xl">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		{#if epgEvent.image}
			<img
				src={epgEvent.image}
				alt="Programm Images"
				class="rounded-lg max-md:w-1/2 mx-auto object-contain lg:w-1/3 lg:mb-auto lg:mt-2"
				on:click={() => {
					showFullPic = !showFullPic;
				}}
			/>
		{/if}
		<div class=" lg:w-2/3 max-md:mt-2 overflow-hidden flex flex-col">
			<div class="overflow-y-auto flex-grow px-4 max-md:my-4 lg:mb-4">
				<EpgDescription {epgEvent} mode="description" />
			</div>
			<div class="card-actions justify-center " />
		</div>
	</div>

	<!-- TODO Turn this into a component, with specific button as groundcomponent -->
	<div class="absolute bottom-0 right-0 z-overlay mr-1 mb-1  ">
		<button
			class="btn btn-circle btn-primary"
			class:hidden={!showBackButton}
			on:click={() => {
				navigateBack(true);
			}}
		>
			<Icon icon="undo" />
		</button>
	</div>
</div>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="absolute inset-0 z-modal bg-base-200 bg-opacity-80 flex flex-col"
	class:hidden={!showFullPic}
	on:click|stopPropagation={() => {
		showFullPic = !showFullPic;
	}}
>
	<div class="flex-1" />
	<img src={epgEvent.image} alt="Programm Images" class="rounded-lg p-4 object-contain  max-w-full max-h-full" />
	<div class="flex-1" />
</div>
