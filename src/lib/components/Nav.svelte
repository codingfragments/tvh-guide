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
	const cssItem = 'overflow-hidden overflow-ellipsis w-14 justify-end text-base-content';
	const cssItemSelected =
		'overflow-hidden overflow-ellipsis w-14 text-primary-focus    justify-end';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->

{#if vertical}
	<nav class="flex flex-col h-full w-full justify-start items-end ">
		<div class="h-24 flex flex-col pr-4 pt-2 ">
			<Icon icon="dvr" size={collapsed ? 'lg' : 'xl'} class="self-end text-base-content " />
			<!-- <div class="transform origin-top-left -rotate-90 translate-x-3 translate-y-4 italic font-bold">EPG@Home</div> -->
		</div>
		<ul class="menu menu-compact flex flex-col p-0 px-2 pt-10 text-right ">
			{#each routes as route}
				<li class="">
					<div
						class="flex w-full  cursor-pointer self-end "
						class:active={segment == route.segment}
						on:click={() => dispatch('navigate', { path: route.path })}
					>
						<span class="flex-grow text-lg" class:hidden={collapsed}>{route.label}</span>
						<Icon icon={route.icon} size="lg" class=" self-center " />
					</div>
				</li>
			{/each}
		</ul>
		<div class="h-full flex-grow" />
		<div class="mr-2 mb-2" on:click={() => (collapsed = !collapsed)}>
			<Icon
				icon="navigate_{collapsed ? 'next' : 'before'}"
				class="{collapsed ? 'text-base-content' : 'text-base-content'} "
				size="lg"
			/>
		</div>
	</nav>
{:else}
	<nav class="flex ">
		<!-- <div class="flex-1 flex flex-row justify-evenly self-center  ">
			{#each routes as route}
				<div on:click={() => dispatch('navigate', { path: route.path })} class="cursor-pointer">
					<div class="flex flex-col {segment == route.segment ? cssItemSelected : cssItem} h-12">
						<div class="material-icons md-24 self-center">{route.icon}</div>
						<div class="text-sm  self-center">{route.label}</div>
					</div>
				</div>
			{/each}
		</div> -->
		<ul class="menu menu-compact flex-1 flex flex-row justify-evenly self-center  ">
			{#each routes as route}
				<li class="">
					<div
						class="flex flex-col w-full h-full  cursor-pointer  "
						class:active={segment == route.segment}
						on:click={() => dispatch('navigate', { path: route.path })}
					>
						<div class="material-icons text-[28px] self-center">{route.icon}</div>
						<div class="text-sm  self-center">{route.label}</div>
					</div>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
