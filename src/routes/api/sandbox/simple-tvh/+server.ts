import { json } from '@sveltejs/kit';

import { tvhCache } from '$lib/server/tvh/tvh-cache';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = () => {
	const body: Record<string, unknown> = {};
	body['health'] = 'OK';
	body['cache'] = tvhCache.status;

	return json(body);
};
