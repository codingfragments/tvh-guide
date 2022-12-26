<script lang="ts">
	import anylogger from 'anylogger';

	const LOG = anylogger('Page:/epgSearch');

	import { getMediaContext } from '$lib/client/state/layoutContext';
	import EpgEventSummary, { type Action } from '$lib/components/epg/EPGEventSummary.svelte';
	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';

	import { fade } from 'svelte/transition';

	import { page } from '$app/stores';

	import Icon from '$lib/components/Icon.svelte';
	import EpgDescription from '$lib/components/epg/EPGDescription.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';

	export let data: PageData;
	let selectedEpgEvent: ITVHEpgEvent | undefined = undefined;

	// Establish media Query, following
	const media = getMediaContext();
	let isLarge = false;
	$: isLarge = $media.lg == true;

	let epgEvents: ITVHEpgEvent[] = [];
	$: {
		if (typeof data.events !== 'undefined') {
			epgEvents = data.events;
			showLoading = false;
		}
	}
	let showLoading = false;
	let maxPage = 0;
	let curPage = 0;
	let pages: string[] = [];
	$: {
		if (data.queryStats) {
			maxPage = data.queryStats.maxPage;
			curPage = data.queryStats.page;

			LOG.debug({ msg: 'calc Pages', maxPage, curPage, stats: data.queryStats });
			let minOverflow = false;
			let maxOverflow = false;
			pages = [];
			for (let i = 0; i <= maxPage; i++) {
				if (Math.abs(i - curPage) > 2) {
					if (!minOverflow && i < curPage) {
						pages.push('<<');
						minOverflow = true;
					}
					if (!maxOverflow && i > curPage) {
						pages.push('...');
						maxOverflow = true;
					}
				} else {
					pages.push('' + (i + 1));
				}
			}
		}
	}
	let eventsExpended: string[] = [];
	function onClick_EPGEvent(epg: ITVHEpgEvent) {
		if (isLarge) {
			selectedEpgEvent = epg;
			return;
		}
		const index = eventsExpended.indexOf(epg.uuid, 0);
		if (index > -1) {
			eventsExpended.splice(index, 1);
			epgEvents = epgEvents;
		} else {
			eventsExpended.push(epg.uuid);
			epgEvents = epgEvents;
		}
	}
	function isExpanded(epg: ITVHEpgEvent): boolean {
		return eventsExpended.includes(epg.uuid);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars

	function getActions(event: ITVHEpgEvent): Action[] {
		if (event) {
			return [{ name: 'details', label: 'details', css: 'btn-primary' }];
		}
		return [];
	}

	function handleAction(action: string, event?: ITVHEpgEvent) {
		if (!event) return;
		LOG.debug({ action: action, epgEvent: event });
		if (action == 'details') {
			goto(`/app/epg/event/${event.uuid}`);
		}
	}

	function switchPage(p: string) {
		showLoading = true;

		if (p === '...') return;

		const url = $page.url;
		if (p === '<<') {
			url.searchParams.set('page', '0');
		} else {
			url.searchParams.set('page', '' + (Number(p) - 1));
		}
		goto(url, { invalidateAll: true, replaceState: true });
	}
</script>

<div class="h-full bg-base-200 flex flex-row">
	<div class="flex flex-col h-full w-full px-4  xl:px-10 xl:pb-8 flex-1">
		<!--
		EPG Display and scroll
	    ----------------------
	    -->
		<div class="flex flex-row w-full pt-2 pb-4">
			<form
				method="get"
				on:submit={() => {
					invalidateAll();
					showLoading = true;
				}}
				class="flex-grow"
			>
				<div class="form-control   ">
					<div class="relative input-group  ml-auto rounded-lg  ">
						<input
							type="text"
							name="q"
							placeholder="Search…"
							class="input  input-bordered w-full  "
							value={data.searchString}
						/>
						<button class="btn btn-square">
							<Icon icon="search" />
						</button>
					</div>
				</div>
				<input type="hidden" value="50" name="range" />
			</form>

			<!-- TODO change/implement Filter behaviour. (Channel Channelgroups Daterange) -->

			<button class="btn my-auto ml-2 mr-2 flex-grow-0 "><Icon icon="filter_alt" class="" /></button
			>
		</div>
		<div class="flex flex-row">
			<div class="flex-1" />
			<div class="btn-group mb-2">
				{#each pages as p}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div
						class="btn btn-sm"
						class:btn-active={'' + (curPage + 1) === p}
						on:click={() => {
							switchPage(p);
						}}
					>
						{p}
					</div>
				{/each}
			</div>
		</div>
		<div class="overflow-y-scroll flex-1 flex flex-col relative shadow-lg ">
			{#each epgEvents as event (event.uuid)}
				<div class="rounded-lg p-4 shadow-md bg-base-100 flex-grow-0 mt-2">
					<EpgEventSummary
						epgEvent={event}
						searchDate={new Date()}
						expanded={isExpanded(event)}
						actions={getActions(event)}
						showNavigationButtons={false}
						showFullDate
						on:click={() => onClick_EPGEvent(event)}
						on:action={(ev) => handleAction(ev.detail, event)}
					/>
				</div>
			{/each}
			{#if showLoading}
				<div class="bg-base-200 bg-opacity-75 absolute inset-0 " transition:fade>
					<div class="flex flex-col">
						<div class="mx-auto pt-32 text-2xl">Loading</div>
						<progress class="progress w-56 mx-auto" />
					</div>
				</div>
			{/if}
		</div>
	</div>

	{#if isLarge && selectedEpgEvent}
		<Sidebar
			on:closed={() => {
				selectedEpgEvent = undefined;
			}}
		>
			{#key selectedEpgEvent}
				<div class="shadow-lg px-2 pb-2 rounded-md mt-8 bg-base-100">
					<EpgEventSummary epgEvent={selectedEpgEvent} showFullDate />
				</div>
				{#if selectedEpgEvent.image}
					<div class="p-4">
						<img
							src={selectedEpgEvent.image}
							alt="Programm Images"
							width="100%"
							class="rounded-lg object-scale-down shadow-md  "
						/>
					</div>
				{/if}
				<div class=" shadow-lg py-2 px-2 rounded-md overflow-y-scroll bg-base-100 flex-1">
					<EpgDescription epgEvent={selectedEpgEvent} mode="description" />
				</div>
				<div class="my-4  ml-auto ">
					<button
						class="btn btn-primary"
						on:click={() => {
							handleAction('details', selectedEpgEvent);
						}}>details</button
					>
				</div>
			{/key}
		</Sidebar>
	{/if}
</div>
