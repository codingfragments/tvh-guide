import type { Meta, StoryObj } from '@storybook/svelte';
import XYScrollerStory from '$stories/components/utilities/XYScrollerStory_wrapper.svelte';
// import { wrapThemedContext } from '$stories/lib/SB7StoryDecorators';

const meta = {
	title: 'Components/utilities/XYScroller',
	component: XYScrollerStory,
	tags: ['autodocs'],
	argTypes: {
		cellWidth: { type: 'number' },
		cellHeight: { type: 'number' },
		maxRows: { type: 'number' }
	},
	decorators: [
		// wrapThemedContext()
	]
} satisfies Meta<XYScrollerStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = { args: { maxRows: 100 } };
