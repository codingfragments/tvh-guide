import { epgEventsQuery, EPGFilter, httpErr404 } from '$lib/server/ApiHelper';

import type { ITVHChannel } from '$lib/types/epg-interfaces';

import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ locals, params, url }) => {
	const channelId = params.channelId;
	if (!locals.db.hasChannel(channelId)) {
		throw httpErr404('Channel not found', params);
	}
	const body: Record<string, unknown> = {};
	body['channel'] = locals.db.getChannel(channelId);

	const filter = new EPGFilter();
	const channel = locals.db.getChannel(channelId);
	if (channel) {
		filter.addChannel(channel);
		epgEventsQuery(filter, url, body, locals.db.epgSorted);
	}
	return json(body);
};
