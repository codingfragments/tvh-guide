<script lang="ts" context="module">
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export interface GridData<T = any> {
		uuid: string;
		data: T;
	}

	export interface GridPos {
		x: number;
		y: number;
	}
	export interface GridRect {
		w: number;
		h: number;
	}
</script>

<script lang="ts">
	import { debounce } from 'ts-debounce';
	import { createEventDispatcher } from 'svelte';

	// LOGING
	// ======
	import anylogger from 'anylogger';
	const LOG = anylogger('COMP:XYScroller');

	const dispatch = createEventDispatcher();

	// Properties and bindings
	// ========================
	export let cellWidth = 100;
	export let cellHeight = 50;
	export let gridData: GridData[];
	export let gridDebug = true;
	export let scrollDebounceTime = 500;
	export let gridPos: GridPos = { x: 0, y: 0 };
	export let gridLastPos: GridPos = { x: 0, y: 0 };
	export let gridDimensions: GridRect = { w: 0, h: 0 };

	// Bindings and dervived DOM Values
	// =================================
	let cmpHead: HTMLElement;
	let cmpSide: HTMLElement;
	let cmpContent: HTMLElement;
	let scrollWidth = 0;
	let scrollHeight = 0;
	let scrollYPos = 0;
	let scrollXPos = 0;

	$: gridPos = calcHomeGrid(scrollXPos, scrollYPos);
	$: gridLastPos = calcHomeGrid(scrollXPos + scrollWidth, scrollYPos + scrollHeight);
	$: gridDimensions = {
		w: Math.floor(scrollWidth / cellWidth),
		h: Math.floor(scrollHeight / cellHeight)
	};

	/* SCROLL END Event

	   Main return event. Will notify parent Component about a scroll has ended,
	   Upstream components should wait for this signal before they do layout modifications or react
	   Debounced to make sure not fire to many false positives during normal scrolling
	*/
	function scrollEnd() {
		dispatch('scrolledXY', {
			left: cmpContent.scrollLeft,
			right: cmpContent.scrollLeft + cmpContent.clientWidth,
			top: cmpContent.scrollTop,
			bottom: cmpContent.scrollTop + cmpContent.clientHeight
		});
	}
	const debouncedScrollEnd = debounce(scrollEnd, scrollDebounceTime);

	/* ANIMATION and scrolls
	   This following section uses animation stores to control soft Scrols in X or Y direction.
	   Helper Methods are also exposed to binding parents, which allows for context sensitive controlling the
	   Scroll position. For Example Parent component may enable endless Grids by detecting the
	   Borders of the scroll area and change the Data to this component. It would then use Scroll X/Y Methods
	   To restore the window area within the changed Scroll Rect
	   */
	import { tweened, type Tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let dragScrolling = false;

	// soft scrolling via Animation Store
	let scrollX: Tweened<number> = tweened(scrollXPos, {
		duration: scrollDebounceTime / 2,
		easing: cubicOut
	});
	$: if (cmpContent) cmpContent.scrollTo($scrollX, cmpContent.scrollTop);

	// Scrolling Function (enable Soft Scrolling)
	// ==========================================

	// soft scrolling via Animation Store
	let scrollY: Tweened<number> = tweened(scrollYPos, {
		duration: scrollDebounceTime / 2,
		easing: cubicOut
	});
	$: if (cmpContent) cmpContent.scrollTo(cmpContent.scrollLeft, $scrollY);

	let filterScroll = false;
	const debouncedFilter = debounce(() => {
		filterScroll = false;
	}, 150);

	// Scrolling Function (enable Soft Scrolling)
	// ==========================================
	export function scrollToGridX(x: number, soft = true, filter = false) {
		if (filter) {
			filterScroll = true;
		}
		if (soft) {
			// scrollX = tweened(scrollXPos, {
			// 	duration: scrollDebounceTime / 2,
			// 	easing: cubicOut
			// });
			scrollX.set(scrollXPos, { duration: 0 });
			scrollX.set(cellWidth * x, { duration: scrollDebounceTime / 2 });
		} else {
			cmpContent.scrollTo(cellWidth * x, scrollYPos);
		}
	}
	export function scrollToGridY(y: number, soft = true, filter = false) {
		if (filter) {
			filterScroll = true;
		}
		if (soft) {
			// scrollY = tweened(scrollYPos, {
			// 	duration: scrollDebounceTime / 2,
			// 	easing: cubicOut
			// });
			scrollY.set(scrollYPos, { duration: 0 });
			scrollY.set(cellHeight * y, { duration: scrollDebounceTime / 2 });
		} else {
			cmpContent.scrollTo(scrollXPos, cellHeight * y);
		}
	}

	function snap() {
		if (dragScrolling) return;
		scrollToGridX(gridPos.x);
	}
	const debouncedSnap = debounce(snap, scrollDebounceTime / 2);

	function scrollMain() {
		scrollYPos = cmpContent.scrollTop;
		scrollXPos = cmpContent.scrollLeft;

		cmpHead.scrollTo(cmpContent.scrollLeft, cmpHead.scrollTop);
		cmpSide.scrollTo(cmpSide.scrollLeft, cmpContent.scrollTop);

		debouncedSnap();
		if (filterScroll) {
			debouncedFilter();
		} else {
			debouncedScrollEnd();
		} // snap
	}

	//helper
	function calcHomeGrid(xpos: number, ypos: number) {
		return { x: Math.floor(xpos / cellWidth + 0.5), y: Math.floor(ypos / cellHeight + 0.5) };
	}

	function handleMouseDown() {
		dragScrolling = true;
	}
	function handleMouseUp() {
		dragScrolling = false;
		debouncedSnap();
	}

	function handleShortcut(event: KeyboardEvent) {
		LOG.debug({ msg: 'KEY', event });
		switch (event.code) {
			case 'ArrowLeft':
				scrollToGridX(gridPos.x - 1);
				break;
			case 'ArrowRight':
				scrollToGridX(gridPos.x + 1);
				break;
			case 'ArrowDown':
				scrollToGridY(gridPos.y + 1);
				break;
			case 'ArrowUp':
				scrollToGridY(gridPos.y - 1);
				break;
			case 'KeyO':
				if (event.altKey && event.ctrlKey) {
					gridDebug = !gridDebug;
					LOG.log('toggeled DEBUG');
				}
		}
	}
</script>

<div
	class="relative h-full w-full grid grid-cols-[max-content_minmax(0,1fr)]
	       grid-rows-[max-content_minmax(0,1fr)]"
>
	<div class="col-start-2 row-start-1 ">
		<div class="flex flex-row overflow-hidden" bind:this={cmpHead}>
			{#each gridData as gd (gd.uuid)}
				<div style="width:{cellWidth}px" class="flex-none">
					<slot name="header" headerData={gd} />
				</div>
			{/each}
		</div>
	</div>
	<div class="col-start-1 row-start-2 overflow-hidden " bind:this={cmpSide}>
		<div>
			<slot name="sidebar" />
		</div>
	</div>
	<!-- NEED a better solution for scroller SNAP -->
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<div
		tabindex="0"
		class="overflow-scroll row-start-2 col-start-2 flex flex-row outline-none"
		bind:this={cmpContent}
		bind:clientHeight={scrollHeight}
		bind:clientWidth={scrollWidth}
		on:scroll={scrollMain}
		on:mousedown={handleMouseDown}
		on:mouseup={handleMouseUp}
		on:keydown={handleShortcut}
	>
		{#each gridData as gd (gd.uuid)}
			<div style="width:{cellWidth}px" class="flex-none snap-start">
				<slot name="column" columnData={gd} />
			</div>
		{/each}
	</div>

	{#if gridDebug}
		<div
			class="absolute w-[320px] bottom-0 right-0 z-overlay bg-opacity-70 bg-secondary-focus text-secondary-content flex flex-col px-2 py-4"
		>
			<div>
				DEBUG{#if dragScrolling}
					<span class="ml-4">DRAGING</span>
				{/if}
			</div>
			<div class="font-bold">
				Scroll Pos {scrollXPos}x{scrollYPos} ({scrollWidth}x{scrollHeight})
			</div>
			<div>
				GRID: {gridPos.x} : {gridPos.y} ({gridDimensions.w}:{gridDimensions.h})
			</div>
			<div>
				GRIDLast: {gridLastPos.x} : {gridLastPos.y} ({gridDimensions.w}:{gridDimensions.h})
			</div>
		</div>
	{/if}
</div>
