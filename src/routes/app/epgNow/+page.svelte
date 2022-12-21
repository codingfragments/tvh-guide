<script lang="ts">
	import anylogger from 'anylogger';

	const LOG = anylogger('Page:/epgNow');

	import { getMediaContext } from '$lib/client/state/layoutContext';
	import EpgEventSummary, { type Action } from '$lib/components/epg/EPGEventSummary.svelte';
	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

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

	function getActions(event: ITVHEpgEvent): Action[] {
		return [{ name: 'details', label: 'details', css: 'btn-primary' }];
	}

	function handleAction(action: string, event: ITVHEpgEvent) {
		LOG.debug({ action: action, epgEvent: event });
		if (action == 'details') {
			goto(`/app/epg/event/${event.uuid}`);
		}
	}
</script>

<div class="flex flex-col h-full w-full bg-base-200">
	<div class="flex-none px-2 py-2">
		<div class="navbar bg-base-100 min-h-8 rounded-lg pr-4 shadow-lg">
			<div class="flex-1">
				<button class="btn btn-ghost btn-sm normal-case">daisyUI</button>
			</div>
			<div class="flex-none">
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
				/>
			</div>
		{/each}
	</div>
</div>
