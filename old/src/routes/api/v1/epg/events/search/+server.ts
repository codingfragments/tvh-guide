import { json } from '@sveltejs/kit';

// import anylogger from 'anylogger';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const LOG = anylogger('search');

import type { RequestHandler } from './$types';
import { EPGDatastoreUrlFilter, filterEPGs } from '$lib/server/tvh/datastoreGlobals';
import type { EPGDatastoreFilter } from '$lib/server/types/database';
import type { ApiResultStats } from '$lib/types/api';
import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
import { SearchRange } from '$lib/server/ApiHelper';
export const GET: RequestHandler = async ({ locals, url }) => {
	const body: {
		query?: ApiResultStats;
		events?: ITVHEpgEvent[];
		filter?: EPGDatastoreFilter;
		searchString?: string;
	} = {};

	const query = url.searchParams.get('q');
	const range = new SearchRange<ITVHEpgEvent>();
	range.fromUrl(url);

	body.filter = new EPGDatastoreUrlFilter(url);
	if (query) {
		body.searchString = query;
		const results = await locals.db.search(query);
		const epgs = filterEPGs(results, body.filter);
		range.fillResponseInfo(body, epgs.length);
		body.events = range.filter(epgs);
	}
	return json(body);
};
