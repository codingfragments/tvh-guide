<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	const dispatch = createEventDispatcher();
	let clazz = '';
	export { clazz as class };
</script>

<!-- SIDEBAR-->
<div
	class="w-[300px] bg-base-200 pl-4 pr-2 shadow-2xl flex flex-col relative {clazz}"
	transition:fly={{ x: 200, duration: 500 }}
>
	<slot />
	<button class="btn btn-circle btn-sm absolute -left-3" on:click={() => dispatch('closed')}
		>X</button
	>
</div>
