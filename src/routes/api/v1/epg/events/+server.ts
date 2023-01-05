import { json } from '@sveltejs/kit';

import { epgEventsQuery, EPGFilter } from '$lib/server/ApiHelper';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ locals, url }) => {
	const body = {};
	const filter = new EPGFilter();
	epgEventsQuery(filter, url, body, locals.db.epgSorted);

	return json(body);
};
