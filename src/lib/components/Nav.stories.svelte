<script lang="ts">
	import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
	import Nav from '$lib/components/Nav.svelte';
	import { NavRoute } from '$lib/components/NavRoute';
	import ThemedStorybookContainer from './storybook/ThemedStorybookContainer.svelte';

	const routes = [
		new NavRoute('/app/epg', 'epg', 'EPG', 'dvr'),
		new NavRoute('/app/now', 'now', 'Now', 'today'),
		new NavRoute('/app/now2', 'now2', 'Now', 'today'),
		new NavRoute('/app/recordings', 'recordings', 'Rec', 'voicemail'),
		new NavRoute('/app/settings', 'settings', 'Settings', 'settings')
	];
</script>

<Meta
	title="AppLayout/Navigation"
	component={Nav}
	argTypes={{
		segment: { control: 'text' },
		vertical: { control: 'boolean' },
		collapsed: { control: 'boolean' },
		routes: { control: 'object' },
		onNavigate: { action: 'onNavigate' },
		onToggleTheme: { action: 'onToggleTheme' },
		dark: { control: 'boolean' }
	}}
/>

<Template let:args>
	<ThemedStorybookContainer dark={args.dark} media={['sm', 'md', 'lg', 'xl']}>
		{#if args.vertical}
			<div class="flex flex-row absolute top-0 bottom-0 left-0 right-0">
				<div class=" bg-base-300 text-base-content elevation-5 z-tools flex-grow-0">
					<Nav
						{...args}
						themeDark={args.dark}
						on:navigate={args.onNavigate}
						on:toggleTheme={args.onToggleTheme}
					/>
				</div>
				<div class="flex-grow bg-base-100" />
			</div>
		{:else}
			<div class="flex flex-col absolute top-0 bottom-0 left-0 right-0">
				<div class="flex-grow bg-base-100" />
				<div class=" bg-base-300 text-base-content elevation-5 z-tools flex-grow-0">
					<Nav
						{...args}
						themeDark={args.dark}
						on:navigate={args.onNavigate}
						on:toggleTheme={args.onToggleTheme}
						on:toggleTheme={args.onToggleTheme}
					/>
				</div>
			</div>
		{/if}
	</ThemedStorybookContainer>
</Template>

<Story
	name="Vertical"
	args={{
		routes: routes,
		vertical: true,
		segment: 'now',
		collapsed: false
	}}
/>

<Story
	name="Horizontal"
	args={{
		routes: routes,
		vertical: false,
		segment: 'now',
		collapsed: false
	}}
/>
