<script lang="ts">
	import EpgEventSummary from '$lib/components/epg/EPGEventSummary.svelte';
	import ThemedStorybookContainer from '$stories/lib/ThemedStorybookContainer.svelte';
	import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
	import { epgEvent_Single, epgEvent_Single_post, epgEvent_Single_pre } from './Events';
</script>

<Meta
	component={EpgEventSummary}
	title="Components/EPGSummary"
	argTypes={{
		expaned: { control: 'boolean' },
		showFullDate: { control: 'boolean' },
		showChannelNumber: { control: 'boolean' },
		interactive: { control: 'boolean' },
		searchDate: { control: 'date' },

		epgEvent: { control: 'object' },
		epgNext: { control: 'object' },
		epgPrev: { control: 'object' },
		onTimeSelected: { action: 'onTimeSelected' }
	}}
/>

<Template let:args let:context>
	<ThemedStorybookContainer {...context.globals}>
		<div class="p-10 lg:w-1/2">
			<div class="p-2 border rounded">
				<EpgEventSummary
					{...args}
					searchDate={new Date(args.searchDate)}
					on:timeSelected={args.onTimeSelected}
				/>
			</div>
		</div>
	</ThemedStorybookContainer>
</Template>

<Story
	name="Simple - all Options"
	args={{
		expanded: false,
		interactive: false,
		showChannelNumber: false,
		showFullDate: false,
		searchDate: new Date('2022-12-11T20:00'),
		epgEvent: epgEvent_Single,
		epgNext: undefined,
		epgPrev: undefined
	}}
/>

<Story
	name="Pre/Next"
	args={{
		epgEvent: epgEvent_Single,
		epgNext: epgEvent_Single_post,
		epgPrev: epgEvent_Single_pre,
		expanded: true
	}}
/>
<Story
	name="Next"
	args={{
		epgEvent: epgEvent_Single,
		epgNext: epgEvent_Single_post,
		expanded: true,
		interactive: false
	}}
/>

<Story
	name="Current"
	args={{
		epgEvent: epgEvent_Single,
		searchDate: new Date('2022-12-18T21:00'),
		interactive: false
	}}
/>

<Story
	name="Interactive"
	args={{
		epgEvent: epgEvent_Single,
		searchDate: new Date('2022-12-18T21:00'),
		interactive: true
	}}
/>
