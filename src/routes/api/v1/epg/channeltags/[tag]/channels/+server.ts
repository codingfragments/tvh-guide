import { json } from '@sveltejs/kit';

import { tvhCache } from '$lib/server/tvh/tvh-cache';
import { httpErr404 } from '$lib/server/ApiHelper';

import { SearchRange } from '$lib/server/ApiHelper';
import type { ITVHChannel } from '$lib/types/epg-interfaces';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ params, url }) => {
	const body: Record<string, unknown> = {};

	// check for tags Either a clear type or UUID.
	// If a clear text tag is given it will return the first positive match.
	// IF non unique Tagnames are used the UUID is the only way to make sure to be consistent

	//TODO Make sure channel Tags are lowercase allways

	const tagFilter = tvhCache.channelTags.find((tag) => {
		return tag.uuid === params['tag'] || tag.name === params['tag'];
	});

	if (!tagFilter) {
		throw httpErr404('Tag not found !', params);
	}

	const range = new SearchRange<ITVHChannel>();

	range.fromUrl(url);

	let channels = Array.from(tvhCache.channels.values()).filter((channel) => {
		return channel.tags.includes(tagFilter.name);
	});
	channels = channels.sort((c1, c2) => {
		return c1.number - c2.number;
	});
	range.fillResponseInfo(body, channels.length);

	body['channels'] = range.filter(channels);
	body['tag'] = tagFilter;

	return json(body);
};
