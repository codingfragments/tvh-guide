<script lang="ts">
	import { setMediaContext, setUIDarkContext } from '$lib/client/state/layoutContext';
	import type { MediaResult } from '$lib/client/utils/mediaquery';
	import { writable } from 'svelte/store';

	export let dark = false;
	export let darkTheme = 'dark';
	export let lightTheme = 'light';
	let clazz = 'p-4';
	export { clazz as class };
	import { media as media2 } from '$lib/client/state/global';

	let mediaStore = writable<MediaResult>();

	let darkStore = writable(dark);
	$: darkStore.set(dark);

	setMediaContext(media2);
	setUIDarkContext(darkStore);

	// React on Storybook Dark mode
	import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
	import addons from '@storybook/addons';
	// const channel = addons.getChannel();

	import { onMount } from 'svelte';
	function setDark(value: boolean) {
		dark = value;
	}

	onMount(() => {
		checkGlobals();
		const wmap: Record<string, any> = window;
		wmap['sb7_chkGlobals_container'] = checkGlobals;
	});

	function checkGlobals() {
		const wmap: Record<string, any> = window;
		const globs = wmap['sb7_globals'];
		console.log('CHECK', globs);
		if (globs) {
			const lt = globs.lightTheme;
			if (lt && lightTheme !== lt) {
				console.log('SET lightTheme from globals', lt);
				lightTheme = lt;
			}
			const dt = globs.darkTheme;
			if (dt && darkTheme !== dt) {
				console.log('SET darkTheme from globals', dt);
				darkTheme = dt;
			}
			const isD = globs.darkMode === 'dark';
			if (globs.darkMode && dark !== isD) {
				console.log('SET Mode from globals', globs.darkMode);
				setDark(isD);
			}
		}
	}
	let layoutClass = '';
	let thisComp: HTMLDivElement;
	let thisIsRoot = false;

	// onMount(() => {
	// 	if (thisComp) {
	// 		const pid = thisComp?.parentElement?.id;
	// 		console.log('PID', pid);
	// 		if (pid && pid == 'storybook-root') {
	// 			thisIsRoot = true;
	// 		} else {
	// 			thisIsRoot = false;
	// 		}
	// 	}
	// });
</script>

<div data-theme={dark ? darkTheme : lightTheme} class="{clazz} " bind:this={thisComp} id="themed">
	<slot {dark} />
</div>
<!-- <slot /> -->
