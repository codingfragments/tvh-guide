import { json } from '@sveltejs/kit';

import { SearchRange } from '$lib/server/ApiHelper';

import type { RequestHandler } from './$types';
import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
import type { EPGDatastoreFilter } from '$lib/server/types/database';
import { convertFilter, EPGDatastoreUrlFilter, filterEPGs } from '$lib/server/tvh/datastoreGlobals';
import type { ApiResultStats } from '$lib/types/api';

import anylogger from 'anylogger';

const LOG = anylogger('api:epg/events');

export const GET: RequestHandler = async ({ locals, url }) => {
	const body: {
		query?: ApiResultStats;
		events?: ITVHEpgEvent[];
		filter?: EPGDatastoreFilter;
	} = {};

	body.filter = new EPGDatastoreUrlFilter(url);
	const range = new SearchRange<ITVHEpgEvent>();
	range.fromUrl(url);

	const epgs = await locals.db.getFilteredEvents(body.filter);
	range.fillResponseInfo(body, epgs.length);
	body.events = range.filter(epgs);

	return json(body);
};

export const POST: RequestHandler = async ({ locals, url, request }) => {
	const returnBody: {
		query?: ApiResultStats;
		events?: ITVHEpgEvent[];
		filter?: EPGDatastoreFilter;
	} = {};
	returnBody.filter = convertFilter(await request.json());
	LOG.debug({ msg: 'Filter', filter: returnBody.filter });

	const range = new SearchRange<ITVHEpgEvent>();
	range.fromUrl(url);

	const epgs = filterEPGs(await locals.db.getSortedEvents(), returnBody.filter);
	range.fillResponseInfo(returnBody, epgs.length);
	returnBody.events = range.filter(epgs);
	return json(returnBody);
};
