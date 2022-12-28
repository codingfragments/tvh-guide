import type { Meta, StoryObj } from '@storybook/svelte';
import Icon from '$lib/components/Icon.svelte';
import { wrapThemedContext } from './lib/SB7StoryDecorators';

const meta = {
	title: 'Example/Icon',
	component: Icon,
	tags: ['autodocs'],
	argTypes: {
		icon: { control: 'text' },
		size: {
			control: { type: 'select' },
			options: ['sm', 'md', 'lg', 'xl']
		}
	},
	decorators: [wrapThemedContext()]
} satisfies Meta<Icon>;
export default meta;

type Story = StoryObj<typeof meta>;
export const Primary: Story = {
	args: {
		icon: 'search'
	}
};
