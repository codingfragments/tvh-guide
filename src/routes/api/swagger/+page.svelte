<script lang="ts">
	// @ts-nocheck

	import { onMount } from 'svelte';
	import { SwaggerUIBundle } from 'swagger-ui-dist';
	import 'swagger-ui-dist/swagger-ui.css';
	let swagger;
	onMount(() => {
		console.log(swagger);
		SwaggerUIBundle({ url: 'https://petstore3.swagger.io/api/v3/openapi.json', domNode: swagger });
	});
	// SwaggerUI({})
</script>

<div id="swagger" class="flex text-red-50">
	<a class="btn" href="/app">HOME</a>
	<div bind:this={swagger} />
	>
</div>
