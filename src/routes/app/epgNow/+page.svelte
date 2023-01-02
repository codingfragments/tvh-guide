<script lang="ts">
	import anylogger from 'anylogger';

	const LOG = anylogger('Page:/epgNow');

	import { getMediaContext } from '$lib/client/state/layoutContext';
	import EpgEventSummary, { type Action } from '$lib/components/epg/EPGEventSummary.svelte';
	import DateTimeControl, {
		type DateSelectedEventData
	} from '$lib/components/layout/topnav/DateTimeControl.svelte';
	import TopNavbar from '$lib/components/layout/TopNavbar.svelte';

	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import type { PageData } from './$types';
	import { goto, invalidate } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import { apiGetEvent } from '$lib/client/apiWrapper';
	import { extractTime } from '$lib/tools';
	import MainLayoutWithSidebar from '$lib/components/layout/MainLayoutWithSidebar.svelte';
	import EpgSidebar from '$lib/components/app/epg/EPGSidebar.svelte';

	export let data: PageData;

	let epgEvents: ITVHEpgEvent[];
	$: epgEvents = data.events;

	const media = getMediaContext();
	let bigMode = false;
	$: {
		bigMode = $media.lg == true;
		epgEvents = epgEvents;
	}

	let channelsExpanded: string[] = [];
	let selectedEpgEvent: ITVHEpgEvent | undefined = undefined;

	function handleEventClick(epg: ITVHEpgEvent) {
		// NOOP if media is lg or bigger
		if (bigMode) {
			selectedEpgEvent = epg;
			return true;
		}

		const index = channelsExpanded.indexOf(epg.channel.uuid, 0);
		if (index > -1) {
			channelsExpanded.splice(index, 1);
			epgEvents = epgEvents;
		} else {
			channelsExpanded.push(epg.channel.uuid);
			epgEvents = epgEvents;
		}
	}
	function isExpanded(epg: ITVHEpgEvent): boolean {
		if (bigMode) return false;
		return channelsExpanded.includes(epg.channel.uuid);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function getActions(event: ITVHEpgEvent): Action[] {
		// LOG.debug({ msg: 'Action retrival for EPGEvent', event });
		return [{ name: 'details', label: 'details', css: 'btn-primary' }];
	}

	function handleAction(action: string, event: ITVHEpgEvent) {
		LOG.debug({ action: action, epgEvent: event });
		if (action == 'details') {
			goto(`/app/epg/event/${event.uuid}`);
		}
	}

	let refresher: NodeJS.Timer;
	onMount(() => {
		refresher = setInterval(() => {
			LOG.debug({ msg: 'In Loop', data: data });
			if (data.modeNow) {
				LOG.debug({ msg: 'refresh', url: $page.url });
				invalidate('app:epgNow');

				// goto($page.url);
			}
		}, 30000);
	});
	onDestroy(() => {
		if (refresher) {
			clearInterval(refresher);
		}
	});

	function handleEPGSelected(eventUUID: string) {
		apiGetEvent(fetch, eventUUID).then((event) => {
			event.json().then((data) => {
				const epgEvent: ITVHEpgEvent = data.event;
				gotoTime(epgEvent.startDate);
			});
		});
	}

	function dateSelected(e: CustomEvent<DateSelectedEventData>): void {
		if (e.detail?.reset) {
			gotoNow();
			return;
		}
		// Normal Date Selected
		if (typeof e.detail.date == 'undefined') {
			throw new Error(
				'Data missmatch, date Selected should be either reset=True or include a date property'
			);
		}
		const mergedDate = e.detail.date;
		LOG.debug({
			msg: 'New Date Selected',
			date: e.detail,
			time: extractTime(data.searchDate),
			newDate: mergedDate
		});
		// showDateDlg = false;
		gotoTime(mergedDate);
	}

	function gotoTime(gotoDate: string | Date) {
		if (!(gotoDate instanceof Date)) {
			gotoDate = new Date(gotoDate);
		}
		const url = $page.url;
		url.searchParams.set('time', gotoDate.toISOString());
		LOG.debug({ msg: 'Select new Time', startTime: gotoDate, url: url });
		goto(url, { invalidateAll: true, replaceState: true });
	}

	function gotoNow() {
		const url = $page.url;
		LOG.debug({ msg: 'Reset to live', url: url });
		url.hash = '';
		url.search = '';
		goto(url, { invalidateAll: true, replaceState: true });
	}
</script>

<MainLayoutWithSidebar showSidebar={selectedEpgEvent !== undefined}>
	<!--
		Top bar Nav and Filter
	    ---------------------- -->
	<svelte:fragment slot="head">
		<div class="px-2 py-2 ">
			<TopNavbar>
				<div slot="nav">
					<span
						class="absolute badge badge-ghost top-[-5px] left-[-2px]"
						class:hidden={!data.modeNow}
					>
						live
					</span>
					<div class="flex-1">
						<DateTimeControl
							showReset
							dateFormat={bigMode ? data.uiCfg.dateLong : data.uiCfg.dateShort}
							timeFormat={bigMode ? data.uiCfg.timeLong : data.uiCfg.timeShort}
							dateFirst={data.epgDateRange.epgDateFirst}
							dateLast={data.epgDateRange.epgDateLast}
							searchDate={data.searchDate}
							on:dateSelected={dateSelected}
						/>
					</div>
				</div>
				<div slot="rightNav">
					<button class="btn btn-square btn-ghost btn-sm"> NOPE </button>
				</div>
			</TopNavbar>
		</div>
	</svelte:fragment>
	<svelte:fragment slot="main">
		<div
			class=" grid grid-cols-1 px-2 py-2 lg:grid-cols-2 gap-x-2 gap-y-2 pb-4 h-full  overflow-y-auto"
		>
			{#each epgEvents as event (event.uuid)}
				<div
					class="rounded-lg p-4 shadow-md bg-base-100
			  {selectedEpgEvent && bigMode && selectedEpgEvent.uuid == event.uuid
						? 'border-l-8 border-primary'
						: ''}"
				>
					<EpgEventSummary
						epgEvent={event}
						searchDate={data.searchDate}
						expanded={isExpanded(event)}
						actions={getActions(event)}
						on:click={() => handleEventClick(event)}
						on:action={(ev) => handleAction(ev.detail, event)}
						on:epgSelected={(epgEvent) => {
							handleEPGSelected(epgEvent.detail);
						}}
					/>
				</div>
			{/each}
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
</MainLayoutWithSidebar>
