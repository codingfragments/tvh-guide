<script lang="ts">
	import { invalidate } from '$app/navigation';
</script>

<div class="h-full w-full overflow-y-auto">
	<div class="prose">
		<h1 class="">HEAD</h1>
		<h2 class="">NOPE</h2>
		<h3 class="">LINES</h3>
	</div>
	<div>This is a simple text <span class="font-bold text-primary">With</span> some placeholder</div>
	<button class="btn btn-primary" on:click={() => invalidate('SERVER:health')}>RELOAD HEALTH</button>
</div>
