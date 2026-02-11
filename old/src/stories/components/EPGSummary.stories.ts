// import EpgEventSummary from './EPGSummaryWrapper.svelte';
// See above for pre-wrapped components, this will allow the event handler to be applied
import EpgEventSummary from '$lib/components/epg/EPGEventSummary.svelte';
import CardHalfWidth from '$stories/lib/Card_halfWidth.svelte';
import type { Meta, StoryObj } from '@storybook/svelte';
import { wrapContext } from '$stories/lib/SB7StoryDecorators';
import { epgEvent_Single } from './Events';
import ThemedStorybookContainer from '$stories/lib/ThemedStorybookContainer.svelte';

const meta = {
	title: 'Components/EPGSummary',
	component: EpgEventSummary,
	tags: ['autodocs'],
	// parameters: { actions: { argTypesRegex: '^event_.*' } },
	argTypes: {
		expanded: { control: 'boolean' },
		showFullDate: { control: 'boolean' },
		showChannelNumber: { control: 'boolean' },
		scrollableSummary: { control: 'boolean', defaultValue: true },
		searchDate: { control: 'date' },
		actions: {
			control: 'object',
			defaultValue: [{ name: 'details', label: 'details', css: 'btn-primary' }]
		},
		epgEvent: { control: 'object' }
	},
	decorators: [
		wrapContext,
		// enable the generic wrappers in case the action hack isn't needed
		// this will allow direct addon of Components but as of today (SB7 Beta-15)
		// the actions wrapper is applied to the decorator which will hide all events
		() => CardHalfWidth,
		() => ThemedStorybookContainer
		// wrapThemedContext()
	]
	// play: wrapContext
} satisfies Meta<EpgEventSummary>;
export default meta;

type Story = StoryObj<typeof meta>;
export const Primary: Story = {
	args: {
		expanded: false,
		showChannelNumber: false,
		showFullDate: false,
		searchDate: new Date('2022-12-11T20:00'),
		epgEvent: epgEvent_Single
	}
};

export const Single = {
	args: {
		epgEvent: epgEvent_Single,

		expanded: true,
		actions: [
			{ name: 'similar', label: 'Similar Events', css: 'btn-outline' },
			{ name: 'record', label: 'record', css: 'btn-error' },
			{ name: 'details', label: 'details' }
		]
	}
};

export const ActionsLong = {
	args: {
		epgEvent: epgEvent_Single,

		expanded: true,
		actions: [
			{ name: 'similar-1', label: 'Similar Events', css: 'btn-outline' },
			{ name: 'similar-2', label: 'Similar Events', css: 'btn-outline' },
			{ name: 'similar-3', label: 'Similar Events', css: 'btn-outline' },
			{ name: 'record', label: 'record', css: 'btn-error' },
			{ name: 'details', label: 'details' }
		]
	}
};

export const PreNext = {
	args: {
		epgEvent: epgEvent_Single,

		expanded: true
	}
};

export const Current = {
	args: {
		epgEvent: epgEvent_Single,
		searchDate: new Date('2022-12-18T21:00')
	}
};
