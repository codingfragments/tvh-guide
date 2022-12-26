<script lang="ts">
	import ThemedStorybookContainer from '$stories/lib/ThemedStorybookContainer.svelte';
	import TimePicker from '$lib/components/calendar/TimePicker.svelte';
	import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
</script>

<Meta
	component={TimePicker}
	title="Components/app/TimePicker"
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
