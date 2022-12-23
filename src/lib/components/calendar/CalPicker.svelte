<script lang="ts">
	import anylogger from 'anylogger';
	const LOG = anylogger('Comp_CalPicker');
	import { dateformat } from '$lib/format';
	import Icon from '../Icon.svelte';
	import { createEventDispatcher } from 'svelte';

	export let date: Date;
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
		LOG.debug({ msg: 'reset Cal View', date, displayDate: displayMonth });
		let offset = (displayMonth.getDay() + 6) % 7;
		LOG.debug({ msg: 'Delta calc', dayOfset: offset });
		displayStart = new Date(displayMonth.getTime() - 1000 * 60 * 60 * 24 * offset);
		LOG.debug({ msg: 'DateStart', ds: dateformat(displayStart, 'dddd dd.mm.yyyy') });
	}

	function dateList(start: Date, days: number): Date[] {
		const results = Array<Date>(days)
			.fill(start)
			.map((_, i) => new Date(start.getTime() + 1000 * 60 * 60 * 24 * i));
		return results;
	}

	function moveDisplay(delta: number) {
		displayMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + delta, 1);
	}

	function dateSelected(day: Date) {
		date = day;
		dispatch('dateSelected', day);
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
		{#each dateList(displayStart, 7) as day (day.getTime())}
			<div>{dateformat(day, 'ddd')}</div>{/each}
	</div>
	<div
		class="bg-base-100 grid grid-cols-[repeat(7,35px)] grid-rows-[repeat(6,30px)] pt-2 justify-items-center"
	>
		{#each dateList(displayStart, 7 * 6) as day (day.getTime())}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<button
				class="  {day.getTime() === displayDay.getTime()
					? 'p-1    bg-primary text-primary-content m-auto rounded-lg'
					: 'p-1'}"
				class:font-thin={day.getMonth() !== displayMonth.getMonth()}
				class:italic={day.getMonth() !== displayMonth.getMonth()}
				class:font-extrabold={day.getMonth() === displayMonth.getMonth()}
				on:click={() => dateSelected(day)}
			>
				{dateformat(day, 'dd')}
			</button>
		{/each}
	</div>
</div>
