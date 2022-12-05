import { json } from '@sveltejs/kit';

import { httpErr404 } from '$lib/server/ApiHelper';

import { tvhCache } from '$lib/server/tvh/tvh-cache';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ params }) => {
	const channelId = params.channelId;
	if (!tvhCache.channels.has(channelId)) {
		throw httpErr404('EPG Event not found', params);
	} else {
		const body: Record<string, unknown> = {};
		body['channel'] = tvhCache.channels.get(channelId);
		return json(body);
	}
};
