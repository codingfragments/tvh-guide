import type { Meta, StoryObj } from '@storybook/svelte';
import SwitchTheme from './SwitchTheme.svelte';
import { wrapThemedContext } from '$stories/lib/SB7StoryDecorators';

const meta = {
	title: 'app/sandbox/themes',
	component: SwitchTheme,
	tags: ['autodocs'],
	argTypes: {},
	decorators: [wrapThemedContext()]
} satisfies Meta<SwitchTheme>;

type Story = StoryObj<typeof meta>;
export const Primary: Story = {
	args: {}
};
export default meta;
