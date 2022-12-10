import { tvhCache } from '$lib/server/tvh/tvh-cache';
import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = () => {
	const resp = new Response();
	resp.json;
	return json({
		serviceHealth: 'OK',
		serviceUp: true,
		cache: tvhCache.status
	});
};
