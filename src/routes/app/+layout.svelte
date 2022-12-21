<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { uiCfg } from '$lib/globals';
	import { browser } from '$app/environment';

	let segment: string;

	import Nav from '$lib/components/Nav.svelte';

	import { onMount } from 'svelte';
	import anylogger from 'anylogger';
	import { NavRoute } from '$lib/components/NavRoute';
	import { getMediaContext, getUIDarkContext } from '$lib/client/state/layoutContext';

	const media = getMediaContext();
	const uiThemeDark = getUIDarkContext();

	const LOG = anylogger('App-Layout');
	onMount(() => {
		LOG.debug('Inner Mount');
		LOG.debug('Navigate :' + segment);
	});

	const routes = [
		new NavRoute('/app/epg', 'epg', 'EPG', 'dvr'),
		new NavRoute('/app/epgNow', 'now', 'Now', 'today'),
		new NavRoute('/api/swagger', 'api', 'API', 'voicemail'),
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
				LOG.debug('Navigate to ' + ev.detail.path);
				goto(ev.detail.path);
			}}
			on:toggleTheme={(ev) => {
				$uiThemeDark = ev.detail.dark;
			}}
		/>
	</div>
	<main class="grdMain bg-base-100 overflow-hidden max-h-full h-full">
		<slot />
	</main>
</div>

<style lang="postcss">
	.grid-container {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr) 75px;
		gap: 0px 0px;
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
