import { json } from '@sveltejs/kit';

import { epgEventsQuery, EPGFilter } from '$lib/server/ApiHelper';

// import anylogger from 'anylogger';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const LOG = anylogger('search');

import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ locals, url }) => {
	const body = {};
	const filter = new EPGFilter();
	const query = url.searchParams.get('q');
	if (query) {
		const results = locals.db.search(query);
		epgEventsQuery(filter, url, body, results);
	}
	return json(body);
};
