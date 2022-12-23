<script lang="ts" context="module">
	import themecfg from '$lib/client/themecfg';
	export const themeArgs = {
		lightTheme: {
			control: 'select',
			options: themecfg.themes.light,
			defaultValue: themecfg.defaults.themeLight
		},
		darkTheme: {
			control: 'select',
			options: themecfg.themes.dark,
			defaultValue: themecfg.defaults.themeDark
		}
	};
</script>

<script lang="ts">
	import { setMediaContext, setUIDarkContext } from '$lib/client/state/layoutContext';
	import type { MediaResult } from '$lib/client/utils/mediaquery';
	import { writable } from 'svelte/store';

	export let dark = false;
	export let darkTheme = 'dark';
	export let lightTheme = 'light';
	let clazz = 'absolute inset-0';
	export { clazz as class };
	type MediaCategories =
		| 'xs'
		| 'sm'
		| 'md'
		| 'lg'
		| 'xl'
		| 'xxl'
		| 'short'
		| 'dark'
		| 'noanimations';
	export let media: Array<MediaCategories> = ['sm', 'md', 'lg', 'xl'];
	import { media as media2 } from '$lib/client/state/global';

	let mediaStore = writable<MediaResult>();
	$: {
		let tempMedia: MediaResult = { classNames: '' };
		media.forEach((element) => {
			tempMedia[element] = true;
			tempMedia.classNames = 'media-' + element + ' ' + tempMedia.classNames;
		});
		mediaStore.set(tempMedia);
	}

	let darkStore = writable(dark);
	$: darkStore.set(dark);

	setMediaContext(media2);
	setUIDarkContext(darkStore);

	// React on Storybook Dark mode
	import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
	import addons from '@storybook/addons';
	const channel = addons.getChannel();

	import { onMount, onDestroy } from 'svelte';
	function setDark(value: boolean) {
		dark = value;
	}
	onMount(async () => {
		channel.on(DARK_MODE_EVENT_NAME, setDark);
	});
	onDestroy(async () => {
		channel.off(DARK_MODE_EVENT_NAME, setDark);
	});
</script>

<div data-theme={dark ? darkTheme : lightTheme} class={clazz}>
	<slot {dark} />
</div>
