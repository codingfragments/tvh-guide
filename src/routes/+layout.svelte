<script context="module" lang="ts">
</script>

<script lang="ts">
	import '../app.css';
	import '$lib/globals';
	import { uiCfg, uiThemeDark } from '$lib/globals';
	import { setMediaContext, setUIDarkContext } from '$lib/client/state/layoutContext';

	import anylogger from 'anylogger';

	import { onMount } from 'svelte';
	const LOG = anylogger('Main App');
	export let segment: string;

	// Check for Media Changes Management
	// ----------------------------------
	import { media } from '$lib/client/state/global';
	onMount(() => {
		LOG.info('Mounted main Layout');
	});
	$: LOG.info('Viewport Changes :' + $media.classNames);
	$: uiThemeDark.set($media.dark == true);

	setMediaContext(media);
	setUIDarkContext(uiThemeDark);

	LOG.debug(' Root Navigation ::' + segment);

	import type { LayoutData } from './$types';
	export let data: LayoutData;

	uiCfg.set(data.uiCfg);
</script>

<slot />
