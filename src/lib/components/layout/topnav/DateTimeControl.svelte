<script lang="ts" context="module">
	export interface DateSelectedEventData {
		reset: boolean;
		date?: Date;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatcher = createEventDispatcher();

	import Icon from '$lib/components/Icon.svelte';
	import { dateformat } from '$lib/format';
	import DateTimePicker from '$lib/components/calendar/DateTimePicker.svelte';

	export let dateFirst: Date;
	export let dateLast: Date;
	export let searchDate: Date = new Date();
	export let dateFormat: string;
	export let timeFormat: string;
	export let showReset = true;

	let showDateDlg = false;

	function toggleDatePicker() {
		if (showDateDlg) {
			showDateDlg = false;
			return;
		}

		showDateDlg = true;
	}
</script>

<div class="relative">
	<button class="lg:ml-8 pl-2 btn btn-sm btn-ghost px-0" on:click={() => toggleDatePicker()}>
		{dateformat(searchDate, dateFormat)}
		{dateformat(searchDate, timeFormat)}
		<Icon icon="expand_more" size="sm" />
	</button>
	<div
		class="p-1 lg:p-3 rounded-md shadow-lg absolute top-full left-0 z-front bg-base-100 mt-4 lg:ml-4 flex flex-col"
		class:hidden={!showDateDlg}
	>
		<DateTimePicker
			date={searchDate}
			on:dateTimeSelected={(ev) => dispatcher('dateSelected', { reset: false, date: ev.detail })}
			dateStart={dateFirst}
			dateEnd={dateLast}
			rangeMode="underlined"
		/>
		<div class="flex flex-row ">
			<div class="flex-grow" />
			{#if showReset}
				<button
					class="btn btn-primary"
					on:click={() => {
						showDateDlg = false;
						dispatcher('dateSelected', { reset: true });
					}}
				>
					reset
				</button>
			{/if}
			<button
				class="btn btn-primary ml-4"
				on:click={() => {
					showDateDlg = false;
				}}>close</button
			>
		</div>
	</div>
</div>
