<script lang="ts">
	// TODO Cleanup source, structure and order
	import anylogger from 'anylogger';
	const LOG = anylogger('Page:/epg');

	import { getMediaContext } from '$lib/client/state/layoutContext';
	import EPGColumn from './_EPGColumn.svelte';
	import DateTimeControl, { type DateSelectedEventData } from '$lib/components/layout/topnav/DateTimeControl.svelte';

	import TopNavbar from '$lib/components/layout/TopNavbar.svelte';
	import { moduloMinutesDate } from '$lib/tools';
	import type { PageData } from './$types';
	import XyScroller, {
		type EventScrollXY,
		type GridData,
		type GridPos,
		type GridRect
	} from '$lib/components/utilities/XYScroller.svelte';
	import type { ITVHChannel, ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import ChannelLogo from '$lib/components/epg/ChannelLogo.svelte';
	import { dateformat } from '$lib/format';
	import MainLayoutWithBottombar from '$lib/components/layout/MainLayoutWithBottombar.svelte';
	import EpgBottombar from '$lib/components/app/epg/EPGBottombar.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import { hours, minutes } from '$lib/timeGlobals';
	import NavigationSpinner from '$lib/components/utilities/NavigationSpinner.svelte';

	import { gotoWithCallbacks } from '$lib/client/navigation';

	const media = getMediaContext();

	export let searchDate = moduloMinutesDate(new Date(), 15);
	export let selectedDate = moduloMinutesDate(new Date(), 15);

	export let searchEndDate = moduloMinutesDate(new Date(), 15);
	export let maxCells = 24 * 4;

	export let data: PageData;
	export let gridDebug = false;
	export let showLoading = false;
	export let cellWidth = 100;
	export let cellHeight = 50;
	$: {
		if ($media.lg) {
			cellWidth = 300;
			cellHeight = 75;
		} else {
			cellWidth = 180;
			cellHeight = 50;
		}
	}

	export let gridData: GridData<ITVHChannel>[] = [];
	let epgGrid: Map<string, ITVHEpgEvent[]>;

	// Time Slices for left Sidebar.
	// Will start with full hours only, reagrdless of the starting time in searchDate
	let timeSlices: Date[] = [];

	$: {
		// fill depend Data
		gridData = data.channels.map((channel) => {
			return { uuid: channel.uuid, data: channel, loading: false };
		});

		selectedDate = data.selectedDate;
		searchDate = data.searchDate;
		searchEndDate = data.searchEndDate;
		epgGrid = data.epgGrid;
		showLoading = false;
	}

	// $: LOG.debug({ msg: 'Current Grid', gridDimensions });

	$: if (searchDate) {
		timeSlices = Array.from(Array(24).keys()).map((idx) => {
			const slice = new Date(searchDate);
			slice.setMinutes(idx * 60);
			return slice;
		});

		maxCells = timeSlices.length * 4;

		// Adjust for handling, make sure to remove the first Element
		// unless searchdate is on a full hour.
		// Make sure to render a placeholder later
		if (searchDate.getMinutes() != 0) {
			timeSlices = timeSlices.splice(1);
			maxCells -= Math.floor(searchDate.getMinutes() / 15);
		}
	}

	let cmpScroller: XyScroller;
	let gridPos: GridPos = { x: 0, y: 0 };
	let gridDimensions: GridRect = { w: 0, h: 0 };

	let lastScrollToDate = new Date('1.1.1990');
	$: if (data.scroll.scrollTo) {
		LOG.debug({ msg: 'Scroll to Date after Tick', data: data.scroll.scrollToDate, cmpScroller });
		tick().then(() => {
			// debugger;
			if (cmpScroller) {
				cmpScroller.scrollToGridY(Math.max(0, timeToGridY(data.scroll.scrollToDate, 'floor')), false);
				lastScrollToDate = data.scroll.scrollToDate;
			}
		});
	}

	$: LOG.debug({ msg: 'init Values', searchDate, searchEndDate, maxCells });

	function gotoTime(gotoDate: string | Date) {
		if (!(gotoDate instanceof Date)) {
			gotoDate = new Date(gotoDate);
		}
		const url = $page.url;
		url.searchParams.set('time', gotoDate.toISOString());
		LOG.debug({ msg: 'Select new Time', startTime: gotoDate, url: url });
		return goto(url, { invalidateAll: true, replaceState: true });
	}
	function gotoNow() {
		const url = $page.url;
		url.search = '';

		goto(url, { invalidateAll: true, replaceState: true });
	}

	function timeToGridY(time: Date, mode: 'exact' | 'nearest' | 'floor' = 'exact') {
		const pos = (time.getTime() - searchDate.getTime()) / minutes(15);
		switch (mode) {
			case 'exact':
				return pos;
			case 'floor':
				return Math.floor(pos);
			case 'nearest':
				return Math.floor(pos + 0.5);
		}
	}

	function gridToTime(gridYPos: number) {
		return new Date(searchDate.getTime() + minutes(gridYPos * 15));
	}

	function dateSelected(e: CustomEvent<DateSelectedEventData>): void {
		if (e.detail.reset) {
			gotoNow();
			return;
		}
		if (e.detail.date) {
			gotoTime(e.detail.date);
			return;
		}
	}

	export let selectedEpgEvent: ITVHEpgEvent | undefined;

	function handleXYScroll(e: CustomEvent<EventScrollXY>): void {
		const scrollEndDate = gridToTime(e.detail.bottomGrid);
		const scrollTopDate = gridToTime(e.detail.topGrid);
		LOG.debug({
			msg: 'Scroll ended',
			scrollEndDate,
			scrollTopDate,
			searchDate,
			searchEndDate,
			health: data.serverHealth
		});
		// TODO Really need to put this and the grid height in minutes into a constant definition
		// TODO change serverhealth to dates , really get rid of this conversion steps
		if (
			scrollEndDate >= new Date(searchEndDate.getTime() - hours(4)) &&
			data.serverHealth.cache.lastDate &&
			searchEndDate < new Date(data.serverHealth.cache.lastDate)
		) {
			// if (data.serverHealth.cache.lastDate && )
			LOG.debug({ msg: 'date window moved to the future', scrollTopDate });
			showLoading = true;
			gotoTime(scrollTopDate);
		}
		if (
			scrollTopDate <= new Date(searchDate.getTime() + hours(4)) &&
			data.serverHealth.cache.firstDate &&
			searchDate > new Date(data.serverHealth.cache.firstDate)
		) {
			// if (data.serverHealth.cache.lastDate && )
			LOG.debug({ msg: 'date window moved to the past', scrollTopDate });
			showLoading = true;

			gotoTime(scrollTopDate);
		}
	}
</script>

<MainLayoutWithBottombar showBottom={selectedEpgEvent !== undefined}>
	<svelte:fragment slot="head">
		<div class="px-2 py-2  ">
			<TopNavbar>
				<div slot="nav">
					<div class="flex-1">
						<DateTimeControl
							showReset
							dateFormat={$media.lg ? data.uiCfg.dateLong : data.uiCfg.dateShort}
							timeFormat={$media.lg ? data.uiCfg.timeLong : data.uiCfg.timeShort}
							dateFirst={data.epgDateRange.epgDateFirst}
							dateLast={data.epgDateRange.epgDateLast}
							searchDate={selectedDate}
							on:dateSelected={dateSelected}
						/>
					</div>
					<!-- {#if showLoading}
						<Icon icon="autorenew" size="lg" class="animate-spin absolute " />
					{/if} -->
				</div>
				<div slot="rightNav">
					<button class="btn btn-square btn-ghost btn-sm"> NOPE </button>
				</div>
			</TopNavbar>
		</div>
	</svelte:fragment>
	<svelte:fragment slot="main">
		<div class="h-full px-2 ">
			<div class="h-full bg-base-100 shadow-lg rounded-md px-2">
				<NavigationSpinner
					showAutomatic={false}
					show={showLoading}
					delayMs={200}
					translucent={false}
					class="absolute  right-4 lg:right-8 left-4 lg:left-24 top-14 lg:top-20  h-32 rounded-xl bg-opacity-80"
				/>

				<XyScroller
					{gridData}
					{cellWidth}
					{cellHeight}
					bind:gridDebug
					bind:this={cmpScroller}
					on:scrolledXY={handleXYScroll}
					bind:gridPos
					bind:gridDimensions
				>
					<!-- SLOT: HEADER -->
					<div slot="header" let:headerData class="border-b relative">
						{@const channel = headerData.data}
						{#if $media.lg}
							<div class:border={gridDebug} class="mb-2">
								<ChannelLogo
									icon={channel.icon}
									piconBaseUrl={data.uiCfg.piconsBaseUrl}
									piconPrefix="default"
									class=" w-20 mx-auto "
								/>
							</div>
						{:else}
							<div class="flex flex-row items-center  " class:border={gridDebug}>
								<div class="self-center  text-xl">{channel.number}</div>
								<ChannelLogo
									piconBaseUrl={data.uiCfg.piconsBaseUrl}
									icon={channel.icon}
									piconPrefix="small"
									class=" w-16  mx-auto"
								/>
							</div>
						{/if}
					</div>
					<!-- END SLOT: Header-->
					<!-- SLOT: Side -->
					<div slot="sidebar">
						{#if $media.lg}
							{#if searchDate.getMinutes() !== 0}
								<div
									class="border-b border-r px-1 lg:px-2 text-center
								{searchDate.getHours() % 2 == 1 ? 'bg-base-200 ' : ''} "
									style="height:{cellHeight * (4 - Math.floor(searchDate.getMinutes() / 15))}px"
									class:text-lg={$media.lg}
								>
									&nbsp;
								</div>
							{/if}
							{#each timeSlices as time, idx (time.getTime())}
								<div
									class="border-b border-r px-1 lg:px-2 text-center
								{time.getHours() % 2 == 1 ? 'bg-base-200 ' : ''}
								flex flex-col"
									style="height:{cellHeight * 4}px"
									class:text-lg={$media.lg}
								>
									{#if $media.lg}
										{#if time.getHours() === 0}
											<div>{dateformat(time, 'ddd dd')}</div>
										{/if}
										<div>{dateformat(time, 'HH:MM')}</div>
									{:else}
										<div class="border-b">{dateformat(time, 'HH')}</div>
										<div>{dateformat(time, 'MM')}</div>
									{/if}
								</div>
							{/each}
						{/if}
					</div>
					<!-- END SLOT: Side -->
					<!-- SLOT: CONTENT -->
					<div slot="column" style:height="{cellHeight * maxCells}px" let:columnData>
						{@const channel = columnData.data}

						<EPGColumn
							{searchDate}
							{searchEndDate}
							{cellHeight}
							epgData={epgGrid.get(channel.uuid) ?? []}
							minPerCell={15}
							maxHeight={cellHeight * maxCells}
							{selectedEpgEvent}
							on:epgSelected={(e) => {
								if (selectedEpgEvent && selectedEpgEvent.uuid === e.detail.uuid) {
									selectedEpgEvent = undefined;
									return;
								}
								selectedEpgEvent = e.detail;
							}}
						/>
					</div>
					<!-- END SLOT: CONTENT -->
				</XyScroller>
			</div>
		</div>
	</svelte:fragment>

	<svelte:fragment slot="footer">
		{#if selectedEpgEvent}
			<EpgBottombar
				epgEvent={selectedEpgEvent}
				on:closed={() => {
					selectedEpgEvent = undefined;
				}}
				on:showDetails={() => {
					// Push new state, which allows a propper back navigation
					// FUTURE Not sure if this is the best Way to solve this
					//        The code below will make sure a state is pushed BUT will
					//        retrigger a full backend cycle.

					gotoTime(gridToTime(gridPos.y).toISOString()).then(() => {
						gotoWithCallbacks(`/app/epg/event/${selectedEpgEvent?.uuid}`, true);
					});
				}}
			/>
		{/if}
	</svelte:fragment>
</MainLayoutWithBottombar>
