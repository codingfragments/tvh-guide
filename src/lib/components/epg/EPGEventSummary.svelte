<script lang="ts">
	import anylogger from 'anylogger';
	const LOG = anylogger('Comp_EPGSummary');

	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import dateformat from 'dateformat';
	import ChannelLogo from './ChannelLogo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { createEventDispatcher } from 'svelte';

	const piconUrl = 'https://codingfragments.github.io/tv-epg-picon.github.io/picons/';

	export let epgEvent: ITVHEpgEvent;

	export let showChannelNumber = false;
	export let showFullDate = false;
	export let expanded = false;
	let percentage = 0;
	export let scrollableSummary = true;

	export let searchDate: Date | undefined;
	$: {
		if (typeof searchDate !== 'undefined') {
			const total = new Date(epgEvent.stopDate).getTime() - new Date(epgEvent.startDate).getTime();
			const dist = searchDate.getTime() - new Date(epgEvent.startDate).getTime();
			percentage = Math.round((dist * 100) / total); //total
		}
	}

	const dispatch = createEventDispatcher();

	function subtitleForDisplayExceptDescription(expanded = false): string {
		if (!expanded) {
			if (epgEvent.summary) return epgEvent.summary;
			if (epgEvent.subtitle) return epgEvent.subtitle;
		}
		let additionalInfo = '';
		if (
			typeof epgEvent.episodeNumber !== 'undefined' &&
			typeof epgEvent.seasonNumber !== 'undefined' &&
			epgEvent.seasonNumber > 0 &&
			epgEvent.episodeNumber > 0
		) {
			additionalInfo += `S${epgEvent.seasonNumber}/E${epgEvent.episodeNumber}`;
		}
		if (typeof epgEvent.copyright_year !== 'undefined') {
			additionalInfo += ` (${epgEvent.copyright_year})`;
		}
		return additionalInfo;
	}
	function descriptionHtml(): string {
		let desc = epgEvent.description;
		desc = desc.replace('\n', '<br/>');
		return desc;
	}

	// overflow management - might need a better solution if slows down on epg-now display
	let cheight = 0;
	let theight = 0;
	let overflow = false;
	$: overflow = cheight > 0 && theight > 0 && expanded && theight > cheight;
</script>

<!-- EPG Container-->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="grid grid-rows-1 grid-cols-[6rem_minmax(6rem,_1fr)]" on:click>
	<!-- Left hand Channel Container-->
	<div
		class="grid col-start-1
                grid-cols-[minmax(0,_auto)_1fr]
                grid-rows-[minmax(0,_3rem)_minmax(0,_auto)_minmax(0,_auto)_minmax(0,_1fr)]"
	>
		{#if showChannelNumber}
			<div class="row-start-1 col-start-1 self-center text-xl">{epgEvent.channel.number}</div>
		{/if}
		<div class="row-start-1 col-start-2 justify-self-center my-auto ">
			<ChannelLogo piconBaseUrl={piconUrl} icon={epgEvent.channel.icon} piconPrefix="big" />
		</div>

		<!-- Times-->
		<div class="row-start-2 col-start-1 col-span-2 mt-2">
			{#if showFullDate}
				<div class="text-sm text-center">
					{dateformat(epgEvent.startDate, 'dd mmm')}
				</div>
			{/if}

			<div class="text-sm text-center">
				{dateformat(epgEvent.startDate, 'HH:MM')} - {dateformat(epgEvent.stopDate, 'HH:MM')}
			</div>
			{#if percentage > 0 && percentage < 100}
				<progress class="progress progress-primary" value={percentage} max="100" />
			{/if}

			<!-- Lineup next and previous -->
			{#if expanded}
				<div class="grid grid-cols-2 mt-1 ">
					{#if epgEvent.prevEventUuid}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div
							class="btn btn-outline btn-sm col-start-1 mx-0.5"
							on:click|stopPropagation={() => dispatch('epgSelected', epgEvent.prevEventUuid)}
						>
							<Icon icon="navigate_before" size="sm" />
						</div>
					{/if}
					{#if epgEvent.nextEventUuid}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div
							class="btn btn-outline btn-sm col-start-2 mx-0.5"
							on:click|stopPropagation={() => dispatch('epgSelected', epgEvent.nextEventUuid)}
						>
							<Icon icon="navigate_next" size="sm" />
						</div>
					{/if}
				</div>
			{/if}
		</div>
		<!-- TODO Add some actions to control 'record' and custom details -->
		{#if expanded}
			<div class="row-start-4 col-start-1 col-span-2 self-end">
				<!-- IDEA, run some (2) main action as direct buttons. If more then 2 add overlay on Details Column, higher Z layer and blurred -->
				<!-- <slot /> -->
			</div>
		{/if}
	</div>
	<div
		class="grid ml-2 mt-1 col-start-2
                grid-cols-1
                grid-rows-[minmax(0,_auto)_minmax(0,_auto)_minmax(0,_1fr)_32px]  "
	>
		<div class="relative font-bold h-6 overflow-hidden row-start-1">
			{epgEvent.title}
		</div>
		<div class="h-6 text-sm  overflow-hidden row-start-2">
			{subtitleForDisplayExceptDescription(expanded)}
		</div>
		{#if expanded}
			<div
				class="relative h-[8rem]  row-start-3 mr-2 overflow-hidden "
				class:overflow-y-scroll={scrollableSummary}
				bind:clientHeight={cheight}
			>
				{#if epgEvent.description == undefined}
					{subtitleForDisplayExceptDescription()}
				{:else}
					<div bind:clientHeight={theight}>{@html descriptionHtml()}</div>
				{/if}
			</div>
			<button
				class="badge badge-primary absolute bottom-10 z-overlay right-6  p-1"
				class:hidden={!overflow}
			>
				<Icon icon="more_horiz" />
			</button>
		{/if}
		<div class=" row-start-4 mt-2 overflow-x-auto overflow-y-hidden">
			{#if epgEvent.genre && epgEvent.genre.length > 0}
				{#each epgEvent.genre as genre}
					<span class="badge badge-outline mr-2">{genre}</span>
				{/each}
			{/if}
		</div>
	</div>
</div>
