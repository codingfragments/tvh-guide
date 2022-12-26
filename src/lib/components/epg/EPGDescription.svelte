<script lang="ts">
	import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';

	export let epgEvent: ITVHEpgEvent;

	function subtitleForDisplayExceptDescription(expanded = false): string {
		if (!expanded) {
			if (epgEvent.summary) return epgEvent.summary;
			if (epgEvent.subtitle) return epgEvent.subtitle;
		}
		let additionalInfo = '';
		if (
			typeof epgEvent.episodeNumber !== 'undefined' &&
			typeof epgEvent.seasonNumber !== 'undefined' &&
			epgEvent.seasonNumber > 0 &&
			epgEvent.episodeNumber > 0
		) {
			additionalInfo += `S${epgEvent.seasonNumber}/E${epgEvent.episodeNumber}`;
		}
		if (typeof epgEvent.copyright_year !== 'undefined') {
			additionalInfo += ` (${epgEvent.copyright_year})`;
		}
		return additionalInfo;
	}
	function descriptionHtml(): string {
		let desc = epgEvent.description;
		desc = desc.replace('\n', '<br/>');
		return desc;
	}

	export let mode: 'normal' | 'expandedLabel' | 'description' = 'normal';
</script>

{#if mode === 'description'}
	{#if epgEvent.description == undefined}
		{subtitleForDisplayExceptDescription()}
	{:else}
		<div>{@html descriptionHtml()}</div>
	{/if}
{:else}
	{subtitleForDisplayExceptDescription(mode === 'expandedLabel')}
{/if}
