import { tvhCache } from '$lib/server/tvh/tvh-cache';
import { epgEventsQuery, EPGFilter, httpErr404 } from '$lib/server/ApiHelper';
import { json } from '@sveltejs/kit';

import { SearchRange } from '$lib/server/ApiHelper';
import type { ITVHChannel } from '$lib/types/epg-interfaces';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ params, url }) => {
	const body: Record<string, unknown> = {};

	// check for tags Either a clear type or UUID.
	// If a clear text tag is given it will return the first positive match.
	// IF non unique Tagnames are used the UUID is the only way to make sure to be consistent

	const tagFilter = tvhCache.genres.filter((tag) => {
		return tag.tvhIds.includes(parseInt(params['tag'])) || tag.name === (params['tag'] as string).toLowerCase();
	});

	if (tagFilter.length == 0) {
		throw httpErr404('Tag not found !', params);
	}

	const range = new SearchRange<ITVHChannel>();
	range.fromUrl(url);

	body['tag'] = tagFilter;

	const filter = new EPGFilter(tvhCache);
	for (const tag of tagFilter) {
		filter.addGenreTag(tag.name);
	}
	epgEventsQuery(filter, url, body, tvhCache.epgSorted);
	return json(body);
};
