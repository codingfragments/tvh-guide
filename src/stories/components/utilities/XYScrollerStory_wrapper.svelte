<script lang="ts">
	import anylogger from 'anylogger';

	const LOG = anylogger('SB:XYScroller');

	// import { debounce } from 'ts-debounce';

	import XYScroller, {
		type GridData,
		type GridPos,
		type GridRect
	} from '$lib/components/utilities/XYScroller.svelte';

	const data = Array.from(Array(20).keys()).map((x) => {
		return <GridData<number>>{ uuid: 'uu' + x, data: x + 1 };
	});

	export let cellWidth = 150;
	export let cellHeight = 50;
	export let maxRows = 100;
	export let offset = 0;

	let gridPos: GridPos;
	let gridLastPos: GridPos;
	let gridDimensions: GridRect;

	let hdata: string[];
	$: hdata = Array.from(Array(maxRows).keys()).map((x) => '' + (x + 1 + offset));

	function scrollEnded(): void {
		LOG.log({ msg: 'scroll ended', gridLastPos, gridDimensions });
		if (gridLastPos.y > 80) {
			let current = gridPos.y;
			offset += 20;
			scroller.scrollToGridY(current - 20, false, true);
		}
		if (gridPos.y < 20) {
			let current = gridPos.y;
			const oldOffset = offset;
			offset = Math.max(offset - 20, 0);

			scroller.scrollToGridY(current + oldOffset - offset, false, false);
		}
	}
	// const debouncedScrollHandles = debounce(scrollEnded, 500);

	let scroller: XYScroller;
</script>

<div class="w-[800px] h-[480px] relative border overflow-hidden">
	<XYScroller
		{cellHeight}
		{cellWidth}
		gridData={data}
		on:scrolledXY={scrollEnded}
		bind:gridPos
		bind:gridLastPos
		bind:gridDimensions
		bind:this={scroller}
	>
		<div slot="header" let:headerData class="border border-black text-center h-11">
			{headerData.data}
		</div>

		<div slot="sidebar" class="border">
			{#each hdata as h}
				<div style="height:{cellHeight}px">{h}</div>
			{/each}
		</div>
		<div slot="column" class="border" let:columnData>
			{#each hdata as h}
				<div style="height:{cellHeight}px">{columnData.data}::{h}</div>
			{/each}
		</div>
	</XYScroller>
</div>
