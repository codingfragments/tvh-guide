<script lang="ts">
	import { setMediaContext, setUIDarkContext } from '$lib/client/state/layoutContext';
	import type { MediaResult } from '$lib/client/utils/mediaquery';
	import { writable } from 'svelte/store';

	export let dark: false;
	export let darkTheme = 'dark';
	export let lightTheme = 'light';
	let clazz = '';
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
	export let media: Array<MediaCategories> = ['sm', 'md', 'lg'];

	let mediaStore = writable<MediaResult>();
	$: {
		let tempMedia: MediaResult = { classNames: '' };
		const values = ['xs', 'lg', 'xl'];
		media.forEach((element) => {
			tempMedia[element] = true;
			tempMedia.classNames = 'media-' + element + ' ' + tempMedia.classNames;
		});
		mediaStore.set(tempMedia);
	}

	let darkStore = writable(dark);
	$: darkStore.set(dark);

	setMediaContext(mediaStore);
	setUIDarkContext(darkStore);
</script>

<div data-theme={dark ? darkTheme : lightTheme} class={clazz}>
	<slot />
</div>
