<script lang="ts">
	import { getMediaContext } from '$lib/client/state/layoutContext';
	import { createEventDispatcher } from 'svelte';

	const media = getMediaContext();
	let bigMode = false;
	$: {
		bigMode = $media.lg == true;
	}
	export let showBottom = false;
</script>

<div
	class=" bg-base-200 h-full relative {showBottom ? 'layoutContainerActive' : 'layoutContainer'}"
>
	<div class="LCTop"><slot name="head" /></div>
	<!-- Main is supposed to handle the full layout, need to add sublayout and overflow as
         needed to ensure not to overflow the space-->
	<div class="LCMain relative min-h-0 min-w-0 ">
		<slot name="main" />
	</div>
	{#if bigMode && showBottom}
		<div class="LCFooter min-h-1/2">
			<slot name="footer" />
		</div>
	{/if}
</div>

<!-- https://grid.layoutit.com/?id=Qxz77Du -->
<style>
	.layoutContainer {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: min-content 1fr minmax(0, min-content);
		gap: 0px 0px;
		grid-auto-flow: row;
		grid-template-areas:
			'Top '
			'Main '
			'footer ';
	}
	.layoutContainerActive {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: min-content 1fr 33%;
		gap: 0px 0px;
		grid-auto-flow: row;
		grid-template-areas:
			'Top '
			'Main '
			'footer ';
	}

	.LCMain {
		grid-area: Main;
	}

	.LCFooter {
		grid-area: footer;
	}

	.LCTop {
		grid-area: Top;
	}
</style>
