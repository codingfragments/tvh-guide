import type { Meta, StoryObj } from '@storybook/svelte';
import DateTimePicker from '$lib/components/calendar/DateTimePicker.svelte';
import { wrapThemedContext } from '$stories/lib/SB7StoryDecorators';

const meta = {
	title: 'Components/app/DateTimePicker',
	component: DateTimePicker,
	tags: ['autodocs'],
	argTypes: {
		date: { control: 'date' },
		dateStart: { control: 'date' },
		dateEnd: { control: 'date' },
		rangeMode: { control: 'select', options: ['underlined', 'hide'] }
	},
	decorators: [
		(s, c) => {
			const d1 = c.args.date;
			if (d1 && typeof d1 !== 'undefined') {
				c.args.date = new Date(d1);
			}
			console.log('DATE XXX' + typeof c.args.date);
			return s(c);
		},
		wrapThemedContext()
	]
} satisfies Meta<DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
	args: {
		date: new Date(),
		dateStart: new Date('8.12.2022'),
		dateEnd: new Date('6.5.2023'),
		rangeMode: 'hide'
	}
};
