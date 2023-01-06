import { json } from '@sveltejs/kit';

import { epgEventsQuery, EPGFilter } from '$lib/server/ApiHelper';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ locals, url }) => {
	const body = {};
	const filter = new EPGFilter();
	epgEventsQuery(filter, url, body, await locals.db.getEpgSorted());

	return json(body);
};
