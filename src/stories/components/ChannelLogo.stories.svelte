<script lang="ts">
	import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
	import ThemedStorybookContainer from '$stories/lib/ThemedStorybookContainer.svelte';
	import ChannelLogo from '$lib/components/epg/ChannelLogo.svelte';

	const defaultIcon = 'picon://1_0_1_283D_3FB_1_C00000_0_0_0.png';
	const piconUrl = 'https://codingfragments.github.io/tv-epg-picon.github.io/picons/';
</script>

<Meta
	title="Components/ChannelLogo"
	component={ChannelLogo}
	argTypes={{
		piconPrefix: {
			control: 'select',
			options: ['default', 'big', 'small', 'xs']
		}
	}}
/>

<Template let:args let:context>
	<ThemedStorybookContainer
		darkTheme={context.globals.darkTheme}
		lightTheme={context.globals.lightTheme}
		class="absolute left-0 top-0 right-0 bottom-0"
	>
		<ChannelLogo {...args} />
	</ThemedStorybookContainer>
</Template>

<Story
	name="Simple"
	args={{
		piconBaseUrl: piconUrl,
		piconPrefix: 'default',
		icon: defaultIcon
	}}
/>

<Story
	name="Multiple"
	args={{
		piconBaseUrl: piconUrl,
		piconPrefix: 'default',
		icon: defaultIcon
	}}
	let:context
	let:args
>
	<ThemedStorybookContainer
		darkTheme={context.globals.darkTheme}
		lightTheme={context.globals.lightTheme}
		class="absolute left-0 top-0 right-0 bottom-0 flex flex-col p-10 space-y-5"
	>
		<ChannelLogo {...args} class="w-10" />
		<ChannelLogo {...args} class="w-20" />
		<ChannelLogo {...args} class="w-36" />
	</ThemedStorybookContainer>
</Story>
