import type { Meta, StoryObj } from '@storybook/svelte';
import ChannelLogo from '$lib/components/epg/ChannelLogo.svelte';
import { wrapThemedContext } from '$stories/lib/SB7StoryDecorators';

const defaultIcon = 'picon://1_0_1_283D_3FB_1_C00000_0_0_0.png';
const piconUrl = 'https://codingfragments.github.io/tv-epg-picon.github.io/picons/';
const sizes = ['w-10', 'w-20', 'w-36'];

const meta = {
	title: 'Components/app/ChannelLogo',
	component: ChannelLogo,
	tags: ['autodocs'],
	argTypes: {
		piconPrefix: {
			control: 'select',
			options: ['default', 'big', 'small', 'xs']
		}
	},
	decorators: [wrapThemedContext()]
} satisfies Meta<ChannelLogo>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
	args: {
		piconBaseUrl: piconUrl,
		piconPrefix: 'default',
		icon: defaultIcon
	}
};

export const Multiple: Story = {
	args: {
		piconBaseUrl: piconUrl,
		piconPrefix: 'default',
		icon: defaultIcon
	}
};
