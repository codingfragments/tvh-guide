<script lang="ts">
	import { page } from '$app/stores';
	import { goto, invalidate } from '$app/navigation';
	import { uiCfg } from '$lib/globals';
	import { browser } from '$app/environment';

	let segment: string;

	import Nav from '$lib/components/Nav.svelte';

	import { onMount, onDestroy, tick } from 'svelte';
	import anylogger from 'anylogger';
	import { NavRoute } from '$lib/components/NavRoute';
	import { getMediaContext, getUIDarkContext } from '$lib/client/state/layoutContext';
	import NavigationSpinner from '$lib/components/utilities/NavigationSpinner.svelte';
	import { registerNavigationCallback } from '$lib/client/navigation';
	import { minutes, seconds } from '$lib/timeGlobals';

	const media = getMediaContext();
	const uiThemeDark = getUIDarkContext();
	let showSpinner = false;

	const LOG = anylogger('App-Layout');
	let removeNavigationFeedback: () => void;

	onMount(() => {
		LOG.debug('Inner Mount');
		LOG.debug('Navigate :' + segment);
		removeNavigationFeedback = registerNavigationCallback(async (ev) => {
			if (ev.showLoadSpinner) showSpinner = true;
			await tick();
		});
	});

	onDestroy(() => {
		LOG.debug('Destroy Layout');
		if (removeNavigationFeedback) removeNavigationFeedback();
	});

	const routes = [
		new NavRoute('/app/epg', 'epg', 'EPG', 'dvr'),
		new NavRoute('/app/epgNow', 'epgNow', 'Now', 'today'),
		new NavRoute('/app/epgSearch', 'epgSearch', 'Search', 'search'),
		new NavRoute('/app/timer', 'timer', 'Timer', 'videocam'),
		new NavRoute('/app/settings', 'settings', 'Settings', 'settings')
	];

	// calc segment based on full URL and current path
	const pathPrefix = '/app/';
	$: {
		const logPara = $page.url.searchParams.get('LOG');
		if (logPara) {
			LOG.debug('log para', logPara);
			if (browser) {
				localStorage.setItem('log', logPara);
			}
		}
		if ($page.url.pathname.startsWith(pathPrefix)) {
			segment = $page.url.pathname.substring(pathPrefix.length).split('/')[0];
		}
		showSpinner = false;
	}
</script>

<div
	class=" h-full"
	class:grid-container={!$media.lg}
	class:grid-containerXL={$media.lg}
	data-theme={$uiThemeDark ? $uiCfg.themeDark : $uiCfg.themeLight}
>
	<div class="grdNav   bg-base-300 text-base-content elevation-5 z-tools">
		<Nav
			{segment}
			{routes}
			vertical={$media.lg == true}
			on:navigate={(ev) => {
				showSpinner = true;
				LOG.debug('Navigate to ' + ev.detail.path);
				goto(ev.detail.path);
			}}
			on:toggleTheme={(ev) => {
				$uiThemeDark = ev.detail.dark;
			}}
			showHorizontalLabels={false}
		/>
	</div>
	<main class="relative grdMain bg-base-100 overflow-hidden max-h-full h-full">
		<NavigationSpinner vCenter showAutomatic={false} show={showSpinner} delayMs={0} />
		<slot />
	</main>
</div>

<style lang="postcss">
	.grid-container {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr) min-content;
		gap: 0px 0px;
		padding-bottom: max(0px, env(safe-area-inset-bottom));

		grid-template-areas:
			'grdMain'
			'grdNav';
	}

	.grid-containerXL {
		display: grid;
		grid-template-columns: minmax(0, auto) minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
		gap: 0px 0px;
		grid-template-areas: 'grdNav grdMain';
	}

	.grdNav {
		grid-area: grdNav;
	}

	.grdMain {
		grid-area: grdMain;
	}
</style>
