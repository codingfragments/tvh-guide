<script lang="ts" context="module">
	export type Action = { name: string; label: string; css?: string };
</script>

<script lang="ts">
	// import anylogger from 'anylogger';
	// const LOG = anylogger('Comp_EPGSummary');

	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	import dateformat from 'dateformat';
	import ChannelLogo from './ChannelLogo.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { createEventDispatcher } from 'svelte';
	import EpgDescription from './EPGDescription.svelte';

	const piconUrl = 'https://codingfragments.github.io/tv-epg-picon.github.io/picons/';

	export let actions: Action[] = [];
	export let epgEvent: ITVHEpgEvent;

	export let showChannelNumber = false;
	export let showFullDate = false;
	export let showNavigationButtons = true;
	export let expanded = false;
	let percentage = 0;
	export let scrollableSummary = true;

	export let searchDate: Date = new Date();
	$: {
		if (typeof searchDate !== 'undefined') {
			const total = new Date(epgEvent.stopDate).getTime() - new Date(epgEvent.startDate).getTime();
			const dist = searchDate.getTime() - new Date(epgEvent.startDate).getTime();
			percentage = Math.round((dist * 100) / total); //total
		}
	}

	const dispatch = createEventDispatcher();

	let showActionPanel = false;
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
			{#if expanded && showNavigationButtons}
				<div class="grid grid-cols-2 mt-1 ">
					{#if epgEvent.prevEventUuid}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div
							class="btn btn-outline btn-xs col-start-1 mx-0.5"
							on:click|stopPropagation={() => dispatch('epgSelected', epgEvent.prevEventUuid)}
						>
							<Icon icon="navigate_before" size="sm" />
						</div>
					{/if}
					{#if epgEvent.nextEventUuid}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div
							class="btn btn-outline btn-xs col-start-2 mx-0.5"
							on:click|stopPropagation={() => dispatch('epgSelected', epgEvent.nextEventUuid)}
						>
							<Icon icon="navigate_next" size="sm" />
						</div>
					{/if}
				</div>
			{/if}
		</div>
		{#if expanded}
			<div class="row-start-4 col-start-1 col-span-2 self-end flex flex-col gap-y-1 mt-2">
				<!-- IDEA, run some (2) main action as direct buttons. If more then 2 add overlay on Details Column, higher Z layer and blurred -->
				<!-- <slot /> -->
				{#if actions.length > 3}
					<div>
						<button
							class="btn btn-sm w-full btn-outline overflow-clip"
							on:click|stopPropagation={() => {
								showActionPanel = true;
							}}><Icon icon="more_horiz" size="sm" /></button
						>
					</div>

					{#each actions.slice(-2) as action (action.name)}
						<div>
							<button
								class="btn btn-sm w-full {action.css ?? ''}"
								on:click|stopPropagation={() => {
									dispatch('action', action.name);
								}}>{action.label}</button
							>
						</div>
					{/each}
				{:else}
					{#each actions as action (action.name)}
						<div>
							<button
								class="btn btn-sm w-full {action.css ?? ''}"
								on:click|stopPropagation={() => {
									dispatch('action', action.name);
								}}>{action.label}</button
							>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
	<div
		class="relative grid ml-2 mt-1 col-start-2
                grid-cols-1
                grid-rows-[minmax(0,_auto)_minmax(0,_auto)_minmax(0,_min-content)_32px]  "
	>
		<div class="relative font-bold h-6 overflow-hidden row-start-1">
			{epgEvent.title}
		</div>
		<div class="h-6 text-sm  overflow-hidden row-start-2">
			<EpgDescription {epgEvent} mode={expanded ? 'expandedLabel' : 'normal'} />
		</div>
		{#if expanded}
			<div
				class="relative h-[8rem]   row-start-3 mr-2 overflow-hidden h-full"
				class:overflow-y-scroll={scrollableSummary}
			>
				<EpgDescription {epgEvent} mode="description" />
			</div>
		{/if}
		<div class=" row-start-4 mt-2 overflow-x-auto overflow-y-hidden">
			{#if epgEvent.genre && epgEvent.genre.length > 0}
				{#each epgEvent.genre as genre}
					<span class="badge badge-outline mr-2">{genre}</span>
				{/each}
			{/if}
		</div>
	</div>
	<div
		class="bg-base-200 bg-opacity-90 absolute inset-0 z-front "
		class:hidden={!showActionPanel}
		on:click|stopPropagation={() => {
			showActionPanel = false;
		}}
	>
		<div class="grid grid-cols-2 pl-[8rem] pr-4 py-4 gap-2">
			{#each actions as action (action.name)}
				<div>
					<button
						class="btn btn-sm w-full {action.css ?? ''} bg-opacity-100"
						on:click|stopPropagation={() => {
							showActionPanel = false;
							dispatch('action', action.name);
						}}>{action.label}</button
					>
				</div>
			{/each}
		</div>
	</div>
</div>
