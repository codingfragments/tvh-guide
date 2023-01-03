<script lang="ts">
	import { page } from '$app/stores';
	import type { APIGetChannelEventsResults } from '$lib/client/apiTypes';
	import { apiGetChannelEvents } from '$lib/client/apiWrapper';
	import type { ITVHChannel, ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import { error } from '@sveltejs/kit';
	import EPGColumnCell from './_EPG_ColumnCell.svelte';
	import anylogger from 'anylogger';
	import { getMediaContext } from '$lib/client/state/layoutContext';
	const LOG = anylogger('Page:/epg:col');

	const media = getMediaContext();

	export let searchDate: Date;
	export let searchEndDate: Date;
	export let cellHeight: number;
	export let maxHeight: number;
	export let channel: ITVHChannel;
	export let debug = false;

	export let minPerCell: number;

	async function loadEpgData(
		channel: ITVHChannel,
		searchDate: Date,
		searchEndDate: Date
	): Promise<ITVHEpgEvent[]> {
		const result = await apiGetChannelEvents(fetch, $page.url, channel, {
			filterFrom: searchDate,
			filterTo: searchEndDate,
			range: 300
		});
		if (result.status >= 300) {
			throw error(result.status, result.statusText);
		}
		const data: APIGetChannelEventsResults = await result.json();
		if (data.query.results > 0) {
			return data.events;
		} else return [];
	}

	function calcEpgSize(epg: ITVHEpgEvent, minDate: Date, maxDateDate: Date, segmentHeight: number) {
		let top = 0;
		let height = 0;
		let visible = false;

		top = Math.floor(
			((new Date(epg.startDate).getTime() - minDate.getTime()) / (1000 * 60 * minPerCell)) *
				cellHeight
		);
		height = Math.floor(
			((new Date(epg.stopDate).getTime() - new Date(epg.startDate).getTime()) /
				(1000 * 60 * minPerCell)) *
				cellHeight
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

{#await loadEpgData(channel, searchDate, searchEndDate)}
	<div>NOPE 22</div>
{:then epgs}
	<div class="relative w-full h-full overflow-clip ">
		{#each epgs as epg (epg.uuid)}
			{@const epgSize = calcEpgSize(epg, searchDate, searchEndDate, cellHeight)}
			{#if epgSize.visible}
				<EPGColumnCell
					{epg}
					top={epgSize.top}
					height={epgSize.height}
					{debug}
					layout={$media.lg ? 'lg' : 'sm'}
				/>
			{/if}
		{/each}
	</div>
{/await}
