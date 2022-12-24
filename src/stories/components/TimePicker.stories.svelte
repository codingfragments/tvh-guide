<script lang="ts">
	import ThemedStorybookContainer from '$stories/lib/ThemedStorybookContainer.svelte';
	import TimePicker from '$lib/components/calendar/TimePicker.svelte';
	import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
	import Icon from '$lib/components/Icon.svelte';
	import { dateformat } from '$lib/format';

	let currentDate = new Date();
	let showDlg = false;
</script>

<Meta
	component={TimePicker}
	title="Components/TimePicker"
	argTypes={{
		date: { control: 'date' },

		timeSelected: { action: 'onTimeSelected' }
	}}
/>

<Template let:args let:context>
	<ThemedStorybookContainer {...context.globals}>
		<div class="p-20 h-[300px] flex flex-row">
			<div class="bg-base-200 pr-4 ">placeholder</div>
			<div class="">
				<TimePicker {...args} date={new Date(args.date)} on:timeSelected={args.timeSelected} />
			</div>
		</div>
	</ThemedStorybookContainer>
</Template>

<Story
	name="default"
	args={{
		date: new Date()
	}}
/>

<!-- <Story name="Popup" let:context let:args>
	<ThemedStorybookContainer {...context.globals}>
		<div class="my-20  mx-20 max-md:mx-4 flex flex-row shadow-lg ">
			<div class="relative">
				<button
					class="lg:ml-8 pl-2 btn btn-sm btn-ghost px-0 "
					on:click={() => (showDlg = !showDlg)}
					>{dateformat(currentDate, 'dddd dd.mm.yyyy')}<Icon icon="expand_more" size="sm" />
				</button>
				<div class="p-3 rounded-md shadow-lg absolute top-full left-0" class:hidden={!showDlg}>
					<CalPicker bind:date={currentDate} on:dateSelected={() => (showDlg = false)} />
				</div>
			</div>
		</div>
	</ThemedStorybookContainer>
</Story> -->
