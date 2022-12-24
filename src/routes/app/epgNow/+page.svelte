<script lang="ts">
	import anylogger from 'anylogger';

	const LOG = anylogger('Page:/epgNow');

	import { getMediaContext } from '$lib/client/state/layoutContext';
	import EpgEventSummary, { type Action } from '$lib/components/epg/EPGEventSummary.svelte';
	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import type { PageData } from './$types';
	import { goto, invalidate } from '$app/navigation';
	import Icon from '$lib/components/Icon.svelte';
	import { dateformat } from '$lib/format';
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import { apiGetEvent } from '$lib/client/apiWrapper';
	import CalPicker from '$lib/components/calendar/CalPicker.svelte';
	import { extractTime, mergeDate } from '$lib/tools';
	import type { ServerStatus } from '$lib/types/api';

	export let data: PageData;
	let epgDateFirst: Date;
	let epgDateLast: Date;

	// Convert Date Format from server Response
	$: {
		if (typeof data.serverHealth.cache.firstDate !== 'undefined') {
			epgDateFirst = new Date(data.serverHealth.cache.firstDate);
		}
		if (typeof data.serverHealth.cache.lastDate !== 'undefined') {
			epgDateLast = new Date(data.serverHealth.cache.lastDate);
		}
	}

	let epgEvents: ITVHEpgEvent[];
	$: epgEvents = data.events;

	const media = getMediaContext();
	let bigMode = false;
	$: {
		bigMode = $media.lg == true;
		epgEvents = epgEvents;
	}

	let channelsExpanded: string[] = [];
	function toggleChannel(epg: ITVHEpgEvent) {
		// NOOP if media is lg or bigger
		if (bigMode) return true;

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
		if (bigMode) return true;
		return channelsExpanded.includes(epg.channel.uuid);
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

	let showDateDlg = false;

	function dateSelected(e: CustomEvent<Date>): void {
		const mergedDate = mergeDate(e.detail, data.searchDate);

		LOG.debug({
			msg: 'New Date Selected',
			date: e.detail,
			time: extractTime(data.searchDate),
			newDate: mergedDate
		});
		showDateDlg = false;
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

	function toggleDatePicker() {
		if (showDateDlg) {
			showDateDlg = false;
			return;
		}

		// fetch('/api/v1/health').then((resp) => {
		// 	resp.json().then((result: ServerStatus) => {
		// 		LOG.debug({ msg: 'Status', stats: result, epgDateFirst, epgDateLast });
		// 	});
		// });
		showDateDlg = true;
	}
</script>

<div class="flex flex-col h-full w-full bg-base-200">
	<div class="flex-none px-2 py-2">
		<div class="navbar bg-base-100 min-h-8 rounded-lg pr-4 shadow-lg relative">
			<span class="absolute badge badge-ghost top-[-5px] left-[-2px]" class:hidden={!data.modeNow}>
				live
			</span>
			<div class="flex-1">
				<div class="relative">
					<button
						class="lg:ml-8 pl-2 btn btn-sm btn-ghost px-0"
						on:click={() => toggleDatePicker()}
					>
						{dateformat(data.searchDate, bigMode ? data.uiCfg.dateLong : data.uiCfg.dateShort)}<Icon
							icon="expand_more"
							size="sm"
						/>
					</button>
					<div
						class="p-1 lg:p-3 rounded-md shadow-lg absolute top-full left-0 z-front bg-base-100 mt-4 lg:ml-4 flex flex-row"
						class:hidden={!showDateDlg}
					>
						<CalPicker
							date={data.searchDate}
							on:dateSelected={dateSelected}
							dateStart={epgDateFirst}
							dateEnd={epgDateLast}
							rangeMode="underlined"
						/>
					</div>
				</div>
				<button class="btn btn-sm btn-ghost px-0"
					>{dateformat(data.searchDate, bigMode ? data.uiCfg.timeLong : data.uiCfg.timeShort)}<Icon
						icon="expand_more"
						size="sm"
					/></button
				>
			</div>

			<div class="flex-none">
				<!-- Adde Channel Filter by Category-->
				<button class="btn btn-square btn-ghost btn-sm"> NOPE </button>
			</div>
		</div>
	</div>

	<div class="overflow-y-scroll flex-1 grid grid-cols-1 px-2 py-2 lg:grid-cols-2 gap-x-2 gap-y-2 ">
		{#each epgEvents as event (event.uuid)}
			<div class="rounded-lg p-4 shadow-md bg-base-100">
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
</div>
