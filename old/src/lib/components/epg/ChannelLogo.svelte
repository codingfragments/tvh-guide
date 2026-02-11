<script lang="ts">
	import { getUIDarkContext } from '$lib/client/state/layoutContext';

	// Icon URL for full channel icon or picon path
	export let icon = '';
	// Picon prefix (make sure the right picon library is available as subdir of base)
	// Example: big, big_light, default, default_light
	// small, small_light, small_tile, xs, xs_light,xs_tile

	export let piconPrefix: 'default' | 'xs' | 'big' | 'small' = 'default';
	const isDark = getUIDarkContext();

	let iconFullPrefix = '';
	$: {
		iconFullPrefix = piconPrefix;
		if ($isDark) {
			iconFullPrefix += '_light';
		}
	}
	// Alternative Text for Image Tag
	export let alt = '';

	// picons BASE URl
	export let piconBaseUrl: string;
	let clazz = '';
	export { clazz as class };

	let iconUrl = '';
	$: {
		if (icon.startsWith('picon://')) {
			iconUrl = `${piconBaseUrl}/${iconFullPrefix}/${icon.substring(8)}`;
		} else iconUrl = icon;
	}
</script>

<img src={iconUrl} {alt} class={clazz} />
