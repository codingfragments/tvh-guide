<script lang="ts">
	export let colData: Promise<any[]>;
	export let cellHeight = 0;
	export let colHeader: any;
	export let colsOld: any[] = [];

	// this will be used to double buffer the promise results for delayed rendering of old list while waiting for the new one.
	// Need to check within boundaries and render only what's working based on start and stop rate.
	// More to Come on the EPG Column Renderer
	function setCols(cols: any[]): any {
		colsOld = cols;
		return cols;
	}
</script>

{#await colData}
	<!-- <div class="absolute inset-0 bg-base-200 bg-opacity-50" /> -->
	<!-- <div style:height="{cellHeight * maxRows}px">&nbsp;</div> -->
	{#each colsOld as h}
		<div style="height:{cellHeight}px">{colHeader}::{h}</div>
	{/each}
{:then cols}
	{#each setCols(cols) as h}
		<div style="height:{cellHeight}px">{h}</div>
	{/each}
{/await}
