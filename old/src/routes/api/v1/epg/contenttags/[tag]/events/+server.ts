import { httpErr404 } from '$lib/server/ApiHelper';
import { json } from '@sveltejs/kit';

import { SearchRange } from '$lib/server/ApiHelper';
import type { ITVHChannel, ITVHEpgEvent } from '$lib/types/epg-interfaces';

import type { RequestHandler } from './$types';
import type { ApiResultStats } from '$lib/types/api';
import type { EPGDatastoreFilter } from '$lib/server/types/database';
import { EPGDatastoreUrlFilter } from '$lib/server/tvh/datastoreGlobals';
export const GET: RequestHandler = async ({ locals, params, url }) => {
	const body: {
		query?: ApiResultStats;
		events?: ITVHEpgEvent[];
		filter?: EPGDatastoreFilter;
	} = {};

	const tagFilter = (await locals.db.getGenres()).filter((tag) => {
		return (
			tag.tvhIds.includes(parseInt(params['tag'])) || tag.name.toLowerCase() === (params['tag'] as string).toLowerCase()
		);
	});

	if (tagFilter.length == 0) {
		throw httpErr404('Tag not found !', params);
	}

	body.filter = new EPGDatastoreUrlFilter(url);
	body.filter.epgGenre = tagFilter.map((tf) => tf.name);

	const range = new SearchRange<ITVHEpgEvent>();
	range.fromUrl(url);

	const epgs = await locals.db.getFilteredEvents(body.filter);
	range.fillResponseInfo(body, epgs.length);
	body.events = range.filter(epgs);

	return json(body);
};
