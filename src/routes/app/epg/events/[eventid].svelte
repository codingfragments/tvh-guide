<script lang="ts" context="module">
	/** @type {import('./[eventid]').Load} */
	export async function load({ params, url, fetch, session, context }) {
		const response = await fetch(`/api/v1/epg/events/${params.eventid}`);
		return {
			status: response.status,
			props: {
				epgEvent: response.ok && (await response.json()).event
			}
		};
	}
</script>

<script lang="ts">
	import Channel from '$lib/components/epg/channel.svelte';
	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
	export let epgEvent: ITVHEpgEvent;
</script>


<Channel channel={epgEvent.channel} size="sm"  />
<div class="h-10"  />
<Channel channel={epgEvent.channel} size="md" displayName />
<div class="h-10"  />
<Channel channel={epgEvent.channel} size="lg" displayName displayNumber/>
<div class="h-10"  />
<Channel channel={epgEvent.channel} size="xl"  displayNumber numberClass="text-3xl self-end mb-[-18px]"/>
<div class="h-10"  />
<div class="w-40">
	<Channel
		channel={epgEvent.channel}
		displayName displayNumber
		/>
</div>
