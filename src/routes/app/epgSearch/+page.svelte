<script lang="ts">
	import anylogger from 'anylogger';

	const LOG = anylogger('Page:/epgSearch');

	import { getMediaContext } from '$lib/client/state/layoutContext';
	import EpgEventSummary, { type Action } from '$lib/components/epg/EPGEventSummary.svelte';
	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import type { PageData } from './$types';
	import { goto, invalidate } from '$app/navigation';

	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import { apiGetEvent } from '$lib/client/apiWrapper';
	import { extractTime } from '$lib/tools';
	import Icon from '$lib/components/Icon.svelte';

	export let data: PageData;
	let searchString = '';

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
	function toggleChannel(epg: ITVHEpgEvent) {
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
		return [{ name: 'details', label: 'details', css: 'btn-primary' }];
	}

	function handleAction(action: string, event: ITVHEpgEvent) {
		LOG.debug({ action: action, epgEvent: event });
		if (action == 'details') {
			goto(`/app/epg/event/${event.uuid}`);
		}
	}

	function doSearch(): any {
		const url = $page.url;
		url.searchParams.set('q', data.searchString);
		url.searchParams.set('range', '50');
		goto(url, { invalidateAll: true, replaceState: true });
	}

	function submitSearch(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	): any {
		LOG.debug({ msg: 'Search Submited', event });
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

<div class="h-full bg-base-200">
	<div class="flex flex-col h-full w-full px-4  xl:px-10 xl:pb-8">
		<!--
		EPG Display and scroll
	    ----------------------
	-->
		<form method="get">
			<div class="form-control mb-4 mt-2 w-full ">
				<div class="relative input-group w-full ml-auto rounded-lg ">
					<input
						type="text"
						name="q"
						placeholder="Search…"
						class="input  input-bordered w-full  "
						value={data.searchString}
						autofocus
					/>
					<button class="btn btn-square">
						<Icon icon="search" />
					</button>
				</div>
			</div>
			<input type="hidden" value="50" name="range" />
		</form>
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
		<div class="overflow-y-scroll flex-1 grid grid-cols-1 gap-x-2 gap-y-2 ">
			{#each epgEvents as event (event.uuid)}
				<div class="rounded-lg p-4 shadow-md bg-base-100">
					{event._searchScore}
					<EpgEventSummary
						epgEvent={event}
						searchDate={new Date()}
						expanded={isExpanded(event)}
						actions={getActions(event)}
						showNavigationButtons={false}
						showFullDate
						on:click={() => toggleChannel(event)}
						on:action={(ev) => handleAction(ev.detail, event)}
					/>
				</div>
			{/each}
		</div>
	</div>
</div>
