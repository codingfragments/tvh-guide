import { json } from '@sveltejs/kit';

import { epgEventsQuery, EPGFilter, httpErr404 } from '$lib/server/ApiHelper';
import { tvhCache } from '$lib/server/tvh/tvh-cache';

import { SearchRange } from '$lib/server/ApiHelper';
import type { ITVHChannel } from '$lib/types/epg-interfaces';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ params, url }) => {
	const tags = tvhCache.channelTags;
	const body: Record<string, unknown> = {};

	// check for tags Either a clear type or UUID.
	// If a clear text tag is given it will return the first positive match.
	// IF non unique Tagnames are used the UUID is the only way to make sure to be consistent

	const tagFilter = tvhCache.channelTags.find((tag) => {
		return tag.uuid === params['tag'] || tag.name === params['tag'];
	});

	if (!tagFilter) {
		throw httpErr404('Tag not found !', params);
	}

	const range = new SearchRange<ITVHChannel>();

	range.fromUrl(url);

	const channels = Array.from(tvhCache.channels.values()).filter((channel) => {
		return channel.tags.includes(tagFilter.name);
	});
	body['tag'] = tagFilter;

	const filter = new EPGFilter(tvhCache);
	for (const channel of channels) {
		filter.addChannel(channel);
	}
	epgEventsQuery(filter, url, body, tvhCache.epgSorted);
	return json(body);
};
