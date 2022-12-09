import { json } from '@sveltejs/kit';

import { epgEventsQuery, EPGFilter } from '$lib/server/ApiHelper';

import { tvhCache } from '$lib/server/tvh/tvh-cache';

import anylogger from 'anylogger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOG = anylogger('search');

import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ url }) => {
	const body = {};
	const filter = new EPGFilter(tvhCache);
	const query = url.searchParams.get('q');
	if (query) {
		const results = tvhCache.search(query);
		epgEventsQuery(filter, url, body, results);
	}
	// epgEventsQuery(filter, url, body, tvhCache.epgSorted);
	return json(body);
};
