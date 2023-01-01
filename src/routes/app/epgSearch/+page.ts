import { apiSearchEvents } from '$lib/client/apiWrapper';
import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import anylogger from 'anylogger';
import type { ApiResultStats } from '$lib/types/api';

const LOG = anylogger('Page:/epgNow:LOAD');

export const load: PageLoad = async ({ fetch, url, depends }) => {
	depends('app:epgSearch');

	let searchString = '';
	if (!url.searchParams.has('q')) {
		return {
			searchString
		};
	}
	searchString = url.searchParams.get('q') ?? '';
	LOG.debug({ msg: 'EPGSearch', searchString });

	const result = await apiSearchEvents(fetch, url, searchString);
	if (result.status >= 300) {
		throw error(result.status, result.statusText);
	}
	const resultDTO = await result.json();
	const events: ITVHEpgEvent[] = resultDTO.events;
	const queryStats: ApiResultStats = resultDTO.query;

	return {
		queryStats,
		events: events,
		searchString
	};
};
