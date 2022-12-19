<script lang="ts">
	import { getMediaContext } from '$lib/client/state/layoutContext';
	import EpgEventSummary from '$lib/components/epg/EPGEventSummary.svelte';
	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import type { PageData } from './$types';

	export let data: PageData;
	let epgEvents: ITVHEpgEvent[];
	$: epgEvents = data.events;

	const media = getMediaContext();
	let bigMode = false;
	$: {
		bigMode = $media.xl == true;
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
</script>

<div
	class="overflow-y-scroll h-full grid grid-cols-1 px-2 py-2 lg:grid-cols-2 gap-x-2 gap-y-2 bg-base-200"
>
	{#each epgEvents as event (event.uuid)}
		<div class="rounded-lg p-4 shadow-md bg-base-100">
			<EpgEventSummary
				epgEvent={event}
				searchDate={data.searchDate}
				expanded={isExpanded(event)}
				on:click={() => toggleChannel(event)}
			/>
		</div>
	{/each}
</div>
