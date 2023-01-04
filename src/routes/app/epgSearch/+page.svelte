<script lang="ts">
	import anylogger from 'anylogger';

	const LOG = anylogger('Page:/epgSearch');

	import { getMediaContext } from '$lib/client/state/layoutContext';
	import EpgEventSummary, { type Action } from '$lib/components/epg/EPGEventSummary.svelte';
	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';
	import Icon from '$lib/components/Icon.svelte';
	import NavigationSpinner from '$lib/components/utilities/NavigationSpinner.svelte';
	import MainLayoutWithSidebar from '$lib/components/layout/MainLayoutWithSidebar.svelte';
	import EpgSidebar from '$lib/components/app/epg/EPGSidebar.svelte';
	import { gotoWithCallbacks } from '$lib/client/navigation';

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
		}
	}
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
			gotoWithCallbacks(`/app/epg/event/${event.uuid}`, true);
		}
	}

	function switchPage(p: string) {
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

<MainLayoutWithSidebar showSidebar={selectedEpgEvent !== undefined}>
	<svelte:fragment slot="head">
		<div class="flex flex-col  px-4  xl:px-10 xl:pb-8 ">
			<!--
		EPG Display and scroll
	    ----------------------
	    -->
			<div class="flex flex-row w-full pt-2 pb-4">
				<form method="get" class="flex-grow">
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
				<!-- FUTURE add multiple Layout and allow to switch with small buttongroup -->

				<button class="btn my-auto ml-2 flex-grow-0 "><Icon icon="filter_alt" class="" /></button>
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
		</div>
	</svelte:fragment>
	<svelte:fragment slot="main">
		<div class="flex flex-col relative shadow-lg mr-2 ml-4 mt-4 pb-4 overflow-y-auto h-full">
			{#each epgEvents as event (event.uuid)}
				<div
					class="rounded-lg p-4 shadow-md bg-base-100 flex-grow-0 mb-2 mr-2 cursor-pointer
			 {selectedEpgEvent && isLarge && selectedEpgEvent.uuid == event.uuid ? 'border-l-8 border-primary' : ''}"
				>
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
			<!-- Replace result table with Nav Spinner while waiting for server response-->
			<NavigationSpinner />
		</div>
	</svelte:fragment>
	<svelte:fragment slot="side">
		{#if selectedEpgEvent}
			<EpgSidebar
				epgEvent={selectedEpgEvent}
				on:closed={() => {
					selectedEpgEvent = undefined;
				}}
				on:showDetails={(ev) => {
					handleAction('details', ev.detail);
				}}
			/>
		{/if}
	</svelte:fragment>
	<!-- <div class="col-start-1 col-span-2 row-start-3">FOOTER</div> -->
</MainLayoutWithSidebar>
