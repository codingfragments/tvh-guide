import type { APIResultStats } from '$lib/client/apiTypes';
import {  httpErr404, SearchRange } from '$lib/server/ApiHelper';
import { EPGDatastoreUrlFilter } from '$lib/server/tvh/datastoreGlobals';
import type { EPGDatastoreFilter } from '$lib/server/types/database';

import type { ITVHChannel, ITVHEpgEvent } from '$lib/types/epg-interfaces';

import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ locals, params, url }) => {
	const channelId = params.channelId;
	if (!(await locals.db.hasChannel(channelId))) {
		throw httpErr404('Channel not found', params);
	}

	const body: {
		query?: APIResultStats;
		channel?: ITVHChannel;
		events?: ITVHEpgEvent[];
		filter?: EPGDatastoreFilter;
	} = {};

	const range = new SearchRange<ITVHEpgEvent>();
	range.fromUrl(url);
	body.filter = new EPGDatastoreUrlFilter(url);
	body.filter.channel = [channelId];
	body.channel = await locals.db.getChannel(channelId);

	const epgs = await locals.db.getFilteredEvents(body.filter);
	range.fillResponseInfo(body, epgs.length);
	body.events = range.filter(epgs);

	return json(body);
};
