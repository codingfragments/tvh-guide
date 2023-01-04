<script lang="ts">
	import anylogger from 'anylogger';
	const LOG = anylogger('Page:/epg');

	import { getMediaContext } from '$lib/client/state/layoutContext';
	import MainLayoutWithSidebar from '$lib/components/layout/MainLayoutWithSidebar.svelte';
	import EPGColumn from './_EPGColumn.svelte';
	import DateTimeControl, {
		type DateSelectedEventData
	} from '$lib/components/layout/topnav/DateTimeControl.svelte';

	import TopNavbar from '$lib/components/layout/TopNavbar.svelte';
	import { moduloMinutesDate } from '$lib/tools';
	import type { PageData } from './$types';
	import XyScroller, { type GridData } from '$lib/components/utilities/XYScroller.svelte';
	import type { ITVHChannel, ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import ChannelLogo from '$lib/components/epg/ChannelLogo.svelte';
	import { dateformat } from '$lib/format';
	import MainLayoutWithBottombar from '$lib/components/layout/MainLayoutWithBottombar.svelte';
	import EpgBottombar from '$lib/components/app/epg/EPGBottombar.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';

	const media = getMediaContext();

	export let searchDate = moduloMinutesDate(new Date(), 15);
	export let searchEndDate = moduloMinutesDate(new Date(), 15);
	export let maxCells = 24 * 4;

	export let data: PageData;
	export let gridDebug = false;

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

		searchDate = data.searchDate;
		searchEndDate = data.searchEndDate;
		epgGrid = data.epgGrid;
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

	$: if (data.scroll.scrollTo) {
		LOG.debug({ msg: 'Scroll to Date after Tick', data: data.scroll.scrollToDate, cmpScroller });
		tick().then(() => {
			// debugger;
			if (cmpScroller) {
				const pos = Math.floor(
					(data.scroll.scrollToDate.getTime() - searchDate.getTime()) / (1000 * 60 * 15)
				);

				cmpScroller.scrollToGridY(Math.max(0, pos), false);
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
		goto(url, { invalidateAll: true, replaceState: true });
	}
	function gotoNow() {
		const url = $page.url;
		url.search = '';

		goto(url, { invalidateAll: true, replaceState: true });
	}

	function dateSelected(e: CustomEvent<DateSelectedEventData>): void {
		if (e.detail.reset) {
			// searchDate = moduloMinutesDate(new Date(), 15);
			gotoNow();
			return;
		}
		if (e.detail.date) {
			// searchDate = moduloMinutesDate(e.detail.date, 15);
			gotoTime(e.detail.date);
			return;
		}
	}

	export let selectedEpgEvent: ITVHEpgEvent | undefined;
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
							{searchDate}
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
		<div class="h-full p-2 ">
			<div class="h-full bg-base-100 shadow-lg rounded-md p-2">
				<XyScroller {gridData} {cellWidth} {cellHeight} bind:gridDebug bind:this={cmpScroller}>
					<!-- SLOT: HEADER -->
					<div slot="header" let:headerData class="border-b">
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
				on:showDetails={(ev) => {
					goto(`/app/epg/event/${selectedEpgEvent?.uuid}`);
				}}
			/>
		{/if}
	</svelte:fragment>
</MainLayoutWithBottombar>
