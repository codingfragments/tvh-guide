<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	const dispatch = createEventDispatcher();
	let clazz = '';
	export { clazz as class };
</script>

<!-- SIDEBAR-->

<div class=" bg-base-200 pl-4 pr-2 shadow-2xl flex flex-row relative {clazz}" in:fly|global={{ y: 200, duration: 200 }}>
	<slot />
	<button
		class="btn btn-circle btn-sm absolute left-2 -top-4 w-8 h-8 z-overlay outline-offset-8 border-base-300"
		on:click={() => dispatch('closed')}>X</button
	>
</div>
