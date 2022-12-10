<script lang="ts">
	// @ts-nocheck

	import { onMount } from 'svelte';
	import { SwaggerUIBundle } from 'swagger-ui-dist';
	import 'swagger-ui-dist/swagger-ui.css';
	let swagger;
	onMount(() => {
		console.log(swagger);
		SwaggerUIBundle({ url: '/epgapi.yaml', domNode: swagger });
	});
	// SwaggerUI({})
</script>

<div id="swagger" class="flex flex-col text-red-50 w-full h-full">
	<a class="btn" href="/app">HOME</a>
	<div bind:this={swagger} />
	>
</div>
