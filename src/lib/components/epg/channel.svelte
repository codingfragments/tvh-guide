<script lang="ts">
	import type { ITVHChannel } from '$lib/types/epg-interfaces';
	import Icon from '../Icon.svelte';

	export let channel: ITVHChannel;
	export let displayNumber = false;
	export let displayName = false;
	let clazz = '';
	export { clazz as class };

	export let size:"sm"|"md"|"lg"|"xl"="md";
	export let titleClass="";
	export let numberClass="";

	function convertImagePath(path: string) {
		if (path.startsWith('http')) {
			return path;
		}
		if (path.startsWith('imagecache')) {
			return `/proxy/${path}`;
		}
	}

	let titleClassTW="";
	let numberClassTW="";
	let mainClassTW=""
	$: {
		switch (size) {
			case "sm":{
				mainClassTW="w-20";
				break;
			}
			case "md":{
				mainClassTW="w-32";
				numberClassTW="text-lg"
				break;

			}
			case "lg":{
				mainClassTW="w-44";
				numberClassTW="text-xl"
				titleClassTW="text-lg"
				break;

			}
			case "xl":{
				mainClassTW="w-64";
				numberClassTW="text-2xl"
				titleClassTW="text-xl"

				break;

			}
		}
		titleClassTW+=" "+titleClass;
			numberClassTW+=" "+numberClass;
			mainClassTW+=" "+clazz;

	}
</script>

<!-- <div class="{clazz} grid grid-cols-2">
    <span>{channel.number}</span>
    <img src={convertImagePath(channel.icon_public_url)} alt="{channel.name}" />
</div> -->

<div class="{mainClassTW} grid grid-cols-[min-content_minmax(auto,_1fr)] ">
	{#if displayNumber}
		<div class="row-span-1 text-right  {numberClassTW} ">
			{channel.number}
		</div>
	{/if}
	<div class="col-start-2">
		<img
			src={convertImagePath(channel.icon_public_url)}
			alt={channel.name}
			class="w-full object-cover object-left"
		/>
	</div>
	{#if displayName}
		<div
			class=" w-full pt-1 pb-1 col-start-2  overflow-clip text-center whitespace-nowrap {titleClassTW}"
		>
			{channel.name}
		</div>
	{/if}
</div>
