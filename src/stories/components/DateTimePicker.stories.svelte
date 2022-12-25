<script lang="ts">
	import ThemedStorybookContainer from '$stories/lib/ThemedStorybookContainer.svelte';
	import DateTimePicker from '$lib/components/calendar/DateTimePicker.svelte';
	import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
	import Icon from '$lib/components/Icon.svelte';
	import { dateformat } from '$lib/format';

	let currentDate = new Date();
	let showDlg = false;
</script>

<Meta
	component={DateTimePicker}
	title="Components/app/DateTimePicker"
	argTypes={{
		date: { control: 'date' },
		dateStart: { control: 'date' },
		dateEnd: { control: 'date' },
		rangeMode: { control: 'select', options: ['underlined', 'hide'] },
		dateSelected: { action: 'dateTimeSelected' }
	}}
/>

<Template let:args let:context>
	<ThemedStorybookContainer {...context.globals}>
		<div class="p-20 flex flex-row">
			<div class="p-3 rounded-md shadow-lg ">
				<DateTimePicker
					{...args}
					date={new Date(args.date)}
					dateStart={new Date(args.dateStart)}
					dateEnd={new Date(args.dateEnd)}
					on:dateTimeSelected={args.dateSelected}
				/>
			</div>
		</div>
	</ThemedStorybookContainer>
</Template>

<Story
	name="default"
	args={{
		date: new Date(),
		dateStart: new Date('8.12.2022'),
		dateEnd: new Date('6.5.2023'),
		rangeMode: 'hide'
	}}
/>

<Story name="Popup" let:context let:args>
	<ThemedStorybookContainer {...context.globals}>
		<div class="my-20  mx-20 max-md:mx-4 flex flex-row  ">
			<div class="relative">
				<button
					class="lg:ml-8 pl-2 btn btn-sm btn-ghost px-0 "
					on:click={() => (showDlg = !showDlg)}
					>{dateformat(currentDate, 'dddd dd.mm.yyyy HH:MM')}<Icon icon="expand_more" size="sm" />
				</button>
				<div class="p-5 rounded-md shadow-lg absolute top-full left-0" class:hidden={!showDlg}>
					<DateTimePicker bind:date={currentDate} on:dateSelected={() => (showDlg = false)} />
				</div>
			</div>
		</div>
	</ThemedStorybookContainer>
</Story>
