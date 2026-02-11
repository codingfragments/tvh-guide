import { json } from '@sveltejs/kit';

import { httpErr404 } from '$lib/server/ApiHelper';

import { SearchRange } from '$lib/server/ApiHelper';
import type { ITVHChannel, ITVHChannelTag, ITVHEpgEvent } from '$lib/types/epg-interfaces';

import type { RequestHandler } from './$types';
import type { APIResultStats } from '$lib/client/apiTypes';
import type { EPGDatastoreFilter } from '$lib/server/types/database';
import { EPGDatastoreUrlFilter } from '$lib/server/tvh/datastoreGlobals';
export const GET: RequestHandler = async ({ locals, params, url }) => {
	const body: {
		query?: APIResultStats;
		channels?: ITVHChannel[];
		events?: ITVHEpgEvent[];
		filter?: EPGDatastoreFilter;
		tag?: ITVHChannelTag;
	} = {};
	// check for tags Either a clear type or UUID.
	// If a clear text tag is given it will return the first positive match.
	// IF non unique Tagnames are used the UUID is the only way to make sure to be consistent

	const tagFilter = (await locals.db.getChannelTags()).find((tag) => {
		return tag.uuid === params['tag'] || tag.name === params['tag'];
	});

	if (!tagFilter) {
		throw httpErr404('Tag not found !', params);
	}

	body.tag = tagFilter;

	const channels = await locals.db.findChannelsByTag(tagFilter);

	body.filter = new EPGDatastoreUrlFilter(url);
	body.filter.channel = channels.map((ch) => ch.uuid);
	body.channels = channels;

	const range = new SearchRange<ITVHEpgEvent>();
	range.fromUrl(url);
	const epgs = await locals.db.getFilteredEvents(body.filter);
	range.fillResponseInfo(body, epgs.length);
	body.events = range.filter(epgs);

	return json(body);
};
