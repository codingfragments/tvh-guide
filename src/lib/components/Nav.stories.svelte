<script lang="ts">
	import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
	import Nav from '$lib/components/Nav.svelte';
	import { NavRoute } from '$lib/components/NavRoute';

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
		vertical: { controll: 'boolean' },
		collapsed: { controll: 'boolean' },
		routes: { controll: 'object' },
		onNavigate: { action: 'onNavigate' },
		theme: {
			control: 'select',
			options: ['light', 'dark'],
			defaultValue: 'light'
		}
	}}
/>

<Template let:args>
	<div data-theme={args.theme}>
		{#if args.vertical}
			<div class="flex flex-row absolute top-0 bottom-0 left-0 right-0">
				<div class=" bg-base-300 text-base-content elevation-5 z-tools flex-grow-0">
					<Nav {...args} on:navigate={args.onNavigate} />
				</div>
				<div class="flex-grow bg-base-100" />
			</div>
		{:else}
			<div class="flex flex-col absolute top-0 bottom-0 left-0 right-0">
				<div class="flex-grow bg-base-100" />
				<div class=" bg-base-300 text-base-content elevation-5 z-tools flex-grow-0">
					<Nav {...args} on:navigate={args.onNavigate} />
				</div>
			</div>
		{/if}
	</div>
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
