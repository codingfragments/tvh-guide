<script context="module" lang="ts">

</script>

<script lang="ts">
	import type { NavRoute } from './NavRoute';

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	import Icon from './Icon.svelte';

	export let segment: string;
	export let routes: NavRoute[] = [];
	export let vertical = false;
	export let collapsed = false;
	const cssItem = 'overflow-hidden overflow-ellipsis w-14 justify-end text-theme-onPrimaryInactive';
	const cssItemSelected =
		'overflow-hidden overflow-ellipsis w-14 text-theme-secondary    justify-end';
</script>
<!-- svelte-ignore a11y-click-events-have-key-events -->

{#if vertical}
	<nav class="flex flex-col h-full w-full justify-start items-end">
		<div class="h-24 flex flex-col pr-4 pt-2 ">
			<Icon icon="dvr" size={collapsed ? 'lg' : 'xl'} class="self-end text-white " />
			<!-- <div class="transform origin-top-left -rotate-90 translate-x-3 translate-y-4 italic font-bold">EPG@Home</div> -->
		</div>
		{#each routes as route}
			<div on:click={()=>dispatch("navigate",{path:route.path})} class="cursor-pointer pt-4">
				<div
					class="w-full flex flex-row {segment == route.segment
						? cssItemSelected
						: cssItem} mt-2 h-8"
				>
					<div class="text-base   pl-2 self-center" class:hidden={collapsed}>{route.label}</div>
					<Icon icon={route.icon} size="lg" class="px-4 self-center" />
				</div>
			</div>
		{/each}
		<div class="h-full flex-grow" />
		<div class="mr-2 mb-2" on:click={() => (collapsed = !collapsed)}>
			<Icon
				icon="navigate_{collapsed ? 'next' : 'before'}"
				class="{collapsed ? 'text-theme-secondary' : 'text-theme-onPrimaryInactive'} "
				size="lg"
			/>
		</div>
	</nav>
{:else}
	<nav class="flex h-full">
		<div class="flex-1 flex flex-row justify-evenly self-center  ">
			{#each routes as route}
			<div on:click={()=>dispatch("navigate",{path:route.path})} class="cursor-pointer">
        <div class="flex flex-col {segment == route.segment ? cssItemSelected : cssItem} h-12">
						<div class="material-icons md-24 self-center">{route.icon}</div>
						<div class="text-sm  self-center">{route.label}</div>
					</div>
				</div>
			{/each}
		</div>
	</nav>
{/if}
