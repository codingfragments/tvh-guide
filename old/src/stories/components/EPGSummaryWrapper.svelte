<script lang="ts">
	import EpgEventSummary, { type Action } from '$lib/components/epg/EPGEventSummary.svelte';
	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import ThemedStorybookContainer from '$stories/lib/ThemedStorybookContainer.svelte';

	export let actions: Action[] = [];
	export let epgEvent: ITVHEpgEvent;
	export let showChannelNumber = false;
	export let showFullDate = false;
	export let showNavigationButtons = true;
	export let expanded = false;
	export let scrollableSummary = true;

	export let searchDate: Date = new Date();
</script>

<ThemedStorybookContainer>
	<div class="md:px-4 lg:w-2/3 xl:w-1/2 ">
		<div class="flex shadow-lg p-2">
			<EpgEventSummary
				{actions}
				{epgEvent}
				{showChannelNumber}
				{showFullDate}
				{showNavigationButtons}
				{expanded}
				{searchDate}
				{scrollableSummary}
				on:action
				on:click
				on:epgSelected
			/>
		</div>
	</div>
</ThemedStorybookContainer>
