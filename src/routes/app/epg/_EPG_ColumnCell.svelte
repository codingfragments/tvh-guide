<script lang="ts">
	import { dateformat } from '$lib/format';
	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';

	export let epg: ITVHEpgEvent;
	export let height: number;
	export let top: number;
	export let selected = false;
	export let layout: 'sm' | 'lg' = 'lg';
	export let debug = false;
	let debugWindow = false;

	let showPic = false;
	$: {
		if (epg.image) {
			showPic = height > 150;
		} else {
			showPic = false;
		}
		// showPic = false;
	}
</script>

<div class="absolute w-full  px-2" style:top="{top}px" style:height="{height}px">
	<div class="relative  h-full w-full pl-2 pt-1 pr-1  lg:pt-2 lg:pr-4 shadow-md overflow-hidden ">
		<div class="relative  xl:border-theme-primary h-full bg-theme-surface">
			<div
				class="h-full w-full flex flex-col "
				on:mouseenter={() => {
					debugWindow = true;
				}}
				on:mouseleave={() => {
					debugWindow = false;
				}}
			>
				{#if layout === 'sm'}
					<div>
						{dateformat(epg.startDate, 'HH:MM')}
					</div>
				{:else}
					<div>
						{dateformat(epg.startDate, 'HH:MM')} - {dateformat(epg.stopDate, 'HH:MM')}
					</div>
				{/if}
				<div class="font-bold cursor-pointer">
					{epg.title}
				</div>
				{#if showPic}
					<img src={epg.image} alt="img" class="w-3/4 mx-auto my-4  rounded-md shadow-md" />
				{/if}
				{#if epg.description !== undefined && layout === 'lg'}
					<div class="font-normal overflow-hidden flex-1 mb-2 text-clip">{epg.description}</div>
				{:else}
					<div class="flex-1" />
				{/if}
			</div>
		</div>
		{#if debug && debugWindow}
			<div class="absolute z-front bg-base-200 bg-opacity-75 inset-0">
				<div>Debug</div>
				<div>POS {top}px - {top + height} px</div>
				<div>
					Timings {dateformat(epg.startDate, 'HH:MM')} - {dateformat(epg.stopDate, 'HH:MM')}
				</div>
			</div>
		{/if}
	</div>
</div>
