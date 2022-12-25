<script lang="ts">
	import anylogger from 'anylogger';
	const LOG = anylogger('Comp_CalPicker');
	import { dateformat } from '$lib/format';
	import Icon from '../Icon.svelte';
	import { createEventDispatcher } from 'svelte';
	import { floorDate } from '$lib/tools';

	export let date: Date;
	export let dateStart: Date | undefined = undefined;
	export let dateEnd: Date | undefined = undefined;
	export let rangeMode: 'underlined' | 'hide' = 'underlined';

	let displayMonth: Date;
	let displayDay: Date;

	let displayStart: Date;
	const dispatch = createEventDispatcher();

	// Calc Start and Offsets
	$: {
		if (typeof date !== 'undefined') {
			displayMonth = new Date(date.getFullYear(), date.getMonth(), 1);
			displayDay = new Date(date.toDateString());
		}
	}

	$: {
		let offset = (displayMonth.getDay() + 6) % 7;
		displayStart = new Date(displayMonth.getTime() - 1000 * 60 * 60 * 24 * offset);
		LOG.debug({ msg: 'DateStart', date, ds: dateformat(displayStart, 'dddd dd.mm.yyyy') });
	}

	function dateList(start: Date, days: number): Date[] {
		const results = Array<Date>(days)
			.fill(start)
			.map((_, i) => new Date(start.getTime() + 1000 * 60 * 60 * (12 + 24 * i)));
		return results;
	}

	function moveDisplay(delta: number) {
		displayMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + delta, 1);
	}

	function dateSelected(day: Date) {
		if (hasDateRange()) {
			if (!checkVisibillity(day)) {
				return;
			}
		}
		date = floorDate(day);
		dispatch('dateSelected', day);
	}

	function hasDateRange() {
		return typeof dateStart !== 'undefined' || typeof dateEnd !== 'undefined';
	}
	function checkVisibillity(day: Date) {
		return dateStart && day > dateStart && dateEnd && day < dateEnd;
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="flex flex-col items-stretch justify-items-stretch font-normal "
	on:click|stopPropagation
>
	<div class="flex flex-row bg-primary-focus text-primary-content py-2">
		<button
			on:click={() => {
				moveDisplay(-1);
			}}
		>
			<Icon icon="navigate_before" class="my-auto flex-grow-0" />
		</button>
		<div class=" mx-auto text-lg flex-grow text-center">
			{dateformat(displayMonth, 'mmmm yyyy')}
		</div>
		<button
			on:click={() => {
				moveDisplay(1);
			}}
		>
			<Icon icon="navigate_next" class="my-auto flex-grow-0" />
		</button>
	</div>
	<div
		class=" bg-primary text-primary-content grid grid-cols-[repeat(7,35px)] justify-items-center"
	>
		{#each dateList(displayStart, 7) as day}
			<div>{dateformat(day, 'ddd')}</div>{/each}
	</div>
	<div
		class="bg-base-100 grid grid-cols-[repeat(7,35px)] grid-rows-[repeat(6,30px)] pt-2 justify-items-center"
	>
		{#each dateList(displayStart, 7 * 6) as day (day.getTime())}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<button
				class=" underline-offset-2  {floorDate(day).getTime() === floorDate(displayDay).getTime()
					? 'p-1    bg-primary text-primary-content m-auto rounded-lg'
					: 'p-1'}"
				class:font-thin={day.getMonth() !== displayMonth.getMonth()}
				class:italic={day.getMonth() !== displayMonth.getMonth()}
				class:font-extrabold={day.getMonth() === displayMonth.getMonth()}
				class:underline={checkVisibillity(day) && rangeMode === 'underlined'}
				on:click={() => dateSelected(day)}
			>
				{#if !hasDateRange() || rangeMode !== 'hide' || checkVisibillity(day)}
					{dateformat(day, 'dd')}
				{:else}
					&nbsp;
				{/if}
			</button>
		{/each}
	</div>
</div>
