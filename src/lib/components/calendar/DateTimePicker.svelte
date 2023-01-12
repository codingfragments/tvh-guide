<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import CalPicker from './CalPicker.svelte';
	import TimePicker from './TimePicker.svelte';

	export let date = new Date();
	export let dateStart: Date | undefined = undefined;
	export let dateEnd: Date | undefined = undefined;
	export let rangeMode: 'underlined' | 'hide' = 'underlined';

	let innerHeight = 100;

	import { createEventDispatcher } from 'svelte';
	import { mergeDate } from '$lib/tools';
	const dispatch = createEventDispatcher();
</script>

<div class="flex flex-row p-4  ">
	<div bind:clientHeight={innerHeight}>
		<CalPicker
			{date}
			{dateStart}
			{dateEnd}
			{rangeMode}
			on:dateSelected={(ev) => {
				const d = mergeDate(ev.detail, date);
				dispatch('dateTimeSelected', d);
				date = d;
			}}
		/>
	</div>
	<div class="ml-3 flex flex-col " style="height:{innerHeight}px">
		<div class="m-auto text-primary-focus"><Icon icon="schedule" size="xl" /></div>
		<div>&nbsp;</div>
		<TimePicker
			{date}
			on:timeSelected={(ev) => {
				const d = mergeDate(date, ev.detail);
				dispatch('dateTimeSelected', d);
				date = d;
			}}
		/>
	</div>
</div>
