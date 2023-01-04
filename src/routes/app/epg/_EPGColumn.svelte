<script lang="ts">
	// import anylogger from 'anylogger';
	// const LOG = anylogger('Page:/epg:Column');

	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import EPGColumnCell from './_EPG_ColumnCell.svelte';
	import { getMediaContext } from '$lib/client/state/layoutContext';
	import { minutes } from '$lib/timeGlobals';

	const media = getMediaContext();

	export let searchDate: Date;
	export let searchEndDate: Date;
	export let cellHeight: number;
	export let maxHeight: number;
	// export let channel: ITVHChannel;
	export let epgData: ITVHEpgEvent[];
	export let debug = false;
	export let selectedEpgEvent: ITVHEpgEvent | undefined;
	export let minPerCell: number;

	// eslint-disable-next-line  @typescript-eslint/no-unused-vars
	function calcEpgSize(epg: ITVHEpgEvent, minDate: Date, maxDateDate: Date, segmentHeight: number) {
		let top = 0;
		let height = 0;
		let visible = false;

		top = Math.floor(((new Date(epg.startDate).getTime() - minDate.getTime()) / minutes(minPerCell)) * cellHeight);
		height = Math.floor(
			((new Date(epg.stopDate).getTime() - new Date(epg.startDate).getTime()) / minutes(minPerCell)) * cellHeight
		);

		if (top < 0) {
			height += top;
			top = 0;
		}

		if (height + top > maxHeight) {
			height -= height + top - maxHeight;
		}
		visible = height > cellHeight / 2;
		return { top, height, visible };
	}
</script>

<div class="relative w-full h-full overflow-clip ">
	{#each epgData as epg (epg.uuid)}
		{@const epgSize = calcEpgSize(epg, searchDate, searchEndDate, cellHeight)}
		{#if epgSize.visible}
			<EPGColumnCell
				{epg}
				top={epgSize.top}
				height={epgSize.height}
				{debug}
				layout={$media.lg ? 'lg' : 'sm'}
				selected={selectedEpgEvent && epg.uuid === selectedEpgEvent.uuid}
				on:epgSelected
			/>
		{/if}
	{/each}
</div>
