<script lang="ts">
	import anylogger from 'anylogger';

	const LOG = anylogger('Comp_TimePicker');

	import { dateformat } from '$lib/format';
	import { floorDate } from '$lib/tools';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let date: Date = new Date();
	export let segmentsPerHour = 4;

	type TimeItem = { time: Date; dom?: HTMLElement; current: boolean };

	let dateList: TimeItem[] = createDateList();
	function createDateList(): TimeItem[] {
		const startDate = floorDate(date);
		let dateList = [];

		for (let idx = 0; idx < 24 * segmentsPerHour; idx++) {
			dateList.push({
				time: new Date(startDate.getTime() + idx * (60 / segmentsPerHour) * 60 * 1000),
				current: false
			});
		}
		return dateList;
	}

	let listContainerElement: HTMLElement;

	$: {
		// find Element that represents the local time best
		dateList.forEach((te) => {
			te.current = false;
		});
		const minDiffMs = (60 / segmentsPerHour / 2) * 60 * 1000;
		let found = false;
		const dateMs = date.getTime() - floorDate(date).getTime();
		dateList.forEach((te) => {
			if (!found) {
				const itemMs = te.time.getTime() - floorDate(te.time).getTime();

				if (Math.abs(itemMs - dateMs) < minDiffMs) {
					te.current = true;
					found = true;
					if (typeof te.dom !== 'undefined') {
						const rect = te.dom.getBoundingClientRect();
						const rectC = listContainerElement.getBoundingClientRect();
						const scrollTop = rect.top - rectC.top - rectC.height / 2 + rect.height / 2;
						listContainerElement.scrollTo({
							top: scrollTop + listContainerElement.scrollTop,
							behavior: 'auto'
						});
					}
				}
			}
		});
		dateList = dateList;
	}

	function formatTimeBlock(d: TimeItem) {
		try {
			return dateformat(d.time, 'HH:MM');
		} catch (e) {
			LOG.error({ msg: 'Error in dateformat', t: d.time }, e);
			return 'NOPE';
		}
	}
</script>

<div class="overflow-y-auto h-full px-2 pr-4  " bind:this={listContainerElement}>
	{#each dateList as d}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			bind:this={d.dom}
			class:bg-primary={d.current}
			class="cursor-pointer mt-2 font-bold"
			on:click|stopPropagation={() => {
				date = d.time;
				dispatch('timeSelected', d.time);
			}}
		>
			{formatTimeBlock(d)}
		</div>
	{/each}
</div>
