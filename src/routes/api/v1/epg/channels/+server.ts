import { json } from '@sveltejs/kit';

import { SearchRange } from '$lib/server/ApiHelper';

import type { ITVHChannel } from '$lib/types/epg-interfaces';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ locals, url }) => {
	const range = new SearchRange<ITVHChannel>();

	range.fromUrl(url);

	let channels = Array.from(locals.db.channels);
	channels = channels.sort((c1, c2) => {
		return c1.number - c2.number;
	});

	channels = range.filter(channels);
	const body: Record<string, unknown> = {};
	range.fillResponseInfo(body, channels.length);

	body['channels'] = channels;
	return json(body);
};
