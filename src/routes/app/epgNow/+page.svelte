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
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import EpgDescription from '$lib/components/epg/EPGDescription.svelte';

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

	function toggleChannel(epg: ITVHEpgEvent) {
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

<div
	class="bg-base-200 grid grid-cols-[1fr_minmax(0,min-content)] grid-rows-[min-content_1fr] h-full "
>
	<!--
		Top bar Nav and Filter
	    ---------------------- -->
	<div class="flex-none px-2 py-2 col-start-1 row-start-1">
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

	<div
		class="col-start-1 row-start-2 overflow-y-scroll flex-1 grid grid-cols-1 px-2 py-2 lg:grid-cols-2 gap-x-2 gap-y-2 "
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
					on:click={() => toggleChannel(event)}
					on:action={(ev) => handleAction(ev.detail, event)}
					on:epgSelected={(epgEvent) => {
						handleEPGSelected(epgEvent.detail);
					}}
				/>
			</div>
		{/each}
	</div>

	{#if bigMode && selectedEpgEvent}
		<div class="row-start-1 col-start-2 row-span-2 ">
			<Sidebar
				on:closed={() => {
					selectedEpgEvent = undefined;
				}}
				class="h-full xl:w-[500px]"
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
					<div
						class=" shadow-lg py-2 px-2 rounded-md overflow-y-scroll bg-base-100 flex-1"
						class:mt-4={!selectedEpgEvent.image}
					>
						<EpgDescription epgEvent={selectedEpgEvent} mode="description" />
					</div>
					<div class="my-4  ml-auto ">
						<button
							class="btn btn-primary"
							on:click|stopPropagation={() => {
								if (selectedEpgEvent) handleAction('details', selectedEpgEvent);
							}}>details</button
						>
					</div>
				{/key}
			</Sidebar>
		</div>
	{/if}
</div>
