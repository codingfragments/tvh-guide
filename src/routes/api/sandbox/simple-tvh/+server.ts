import { json } from '@sveltejs/kit';

import { httpErr404, SearchRange } from '$lib/server/ApiHelper';

import { tvhCache } from '$lib/server/tvh/tvh-cache';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = () => {
	const body: Record<string, unknown> = {};
	body['health'] = 'OK';
	body['cache'] = tvhCache.status;

	return json(body);
};
