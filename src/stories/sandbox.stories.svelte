<script lang="ts">
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import ThemedStorybookContainer from '$stories/lib/ThemedStorybookContainer.svelte';
	import themecfg from '$lib/client/themecfg';

	function getThemes(dark: boolean): Array<string> {
		return dark ? themecfg.themes.dark : themecfg.themes.light;
	}
</script>

<Meta title="Sandbox/play" />

<Story name="Sandbox1" let:context>
	<ThemedStorybookContainer {...context.globals} class="absolute top-0 bottom-0 left-0 right-0 ">
		<div class="p-4 "><h1 class="">SANDBOX</h1></div>
		<div class="flex flex-row bg-secondary items-center rounded-xl m-5 p-4">
			<div class="bg-base-300  h-full text-3xl mr-2">T</div>
			<div class="flex-grow self-center ">Lorem Ispudm dkihd k hdkljhd kljhd</div>
			<div class="bg-base-200 w-20 ">3</div>
		</div>
	</ThemedStorybookContainer>
</Story>
