<script lang="ts">
	import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
	import ThemedStorybookContainer from '$stories/lib/ThemedStorybookContainer.svelte';
	import ChannelLogo from '$lib/components/epg/ChannelLogo.svelte';

	const defaultIcon = 'picon://1_0_1_283D_3FB_1_C00000_0_0_0.png';
	const piconUrl = 'https://codingfragments.github.io/tv-epg-picon.github.io/picons/';
	const sizes = ['w-10', 'w-20', 'w-36'];
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
		<div class="flex bg-base-100 shadow-xl m-5">
			<ChannelLogo {...args} />
			<span class="text-md my-auto ml-5 ">Simple Channel Logo</span>
		</div>
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
		{#each sizes as s}
			<div class="flex bg-base-100 shadow-xl border-2 rounded-md  m-5 p-1 pl-4">
				<ChannelLogo {...args} class="{s} my-auto" />
				<span class="text-md my-auto ml-5 ">Simple Channel Logo Size {s}</span>
			</div>
		{/each}
	</ThemedStorybookContainer>
</Story>
