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
		expanded: { control: 'boolean' },
		showFullDate: { control: 'boolean' },
		showChannelNumber: { control: 'boolean' },
		searchDate: { control: 'date' },

		epgEvent: { control: 'object' },
		onEpgSelected: { action: 'onEpgSelected' },
		onClick: { action: 'onClick' }
	}}
/>

<Template let:args let:context>
	<ThemedStorybookContainer {...context.globals}>
		<div class="px-10 lg:w-1/2">
			<div class="mt-2 card card-compact	 bg-base-100 shadow-md">
				<div class="card-body">
					<EpgEventSummary
						{...args}
						searchDate={new Date(args.searchDate)}
						on:epgSelected={args.onEpgSelected}
						on:click={args.onClick}
					/>
				</div>
			</div>
			<!-- <div class="mt-2 rounded shadow-md p-1 ">
				<EpgEventSummary
					{...args}
					searchDate={new Date(args.searchDate)}
					on:timeSelected={args.onTimeSelected}
				/>
			</div> -->
		</div>
	</ThemedStorybookContainer>
</Template>

<Story
	name="Simple - all Options"
	args={{
		expanded: false,
		showChannelNumber: false,
		showFullDate: false,
		searchDate: new Date('2022-12-11T20:00'),
		epgEvent: epgEvent_Single
	}}
/>

<Story
	name="Pre/Next"
	args={{
		epgEvent: epgEvent_Single,

		expanded: true
	}}
/>
<Story
	name="Next"
	args={{
		epgEvent: epgEvent_Single,

		expanded: true
	}}
/>

<Story
	name="Current"
	args={{
		epgEvent: epgEvent_Single,
		searchDate: new Date('2022-12-18T21:00')
	}}
/>

<Story
	name="Interactive"
	args={{
		epgEvent: epgEvent_Single,
		searchDate: new Date('2022-12-18T21:00')
	}}
/>
