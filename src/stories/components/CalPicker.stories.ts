import type { Meta, StoryObj } from '@storybook/svelte';
import CalPicker from '$lib/components/calendar/CalPicker.svelte';
import { wrapThemedContext } from '$stories/lib/SB7StoryDecorators';
import Center from '$stories/lib/LayoutMX_Auto.svelte';
const meta = {
	title: 'Components/app/DatePicker',
	component: CalPicker,
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
			return s(c);
		},
		() => Center,
		wrapThemedContext()
	]
} satisfies Meta<CalPicker>;

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

// <Story name="Popup" let:context>
// 	<ThemedStorybookContainer {...context.globals}>
// 		<div class="my-20  mx-20 max-md:mx-4 flex flex-row shadow-lg ">
// 			<div class="relative">
// 				<button
// 					class="lg:ml-8 pl-2 btn btn-sm btn-ghost px-0 "
// 					on:click={() => (showDlg = !showDlg)}
// 					>{dateformat(currentDate, 'dddd dd.mm.yyyy')}<Icon icon="expand_more" size="sm" />
// 				</button>
// 				<div class="p-3 rounded-md shadow-lg absolute top-full left-0" class:hidden={!showDlg}>
// 					<CalPicker bind:date={currentDate} on:dateSelected={() => (showDlg = false)} />
// 				</div>
// 			</div>
// 		</div>
// 	</ThemedStorybookContainer>
// </Story>
