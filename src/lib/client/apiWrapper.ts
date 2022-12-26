import anylogger from 'anylogger';

const LOG = anylogger('APIWrapper');

type fetchFun = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;

interface QueryFilter {
	page?: number;
	range?: number;
	filterFrom?: Date;
	filterTo?: Date;
	filterAt?: Date;
}

function applyFilter(url: URL, filter: QueryFilter) {
	if (filter.page) {
		url.searchParams.set('page', '' + filter.page);
	}
	if (filter.range) {
		url.searchParams.set('range', '' + filter.range);
	}
	if (filter.filterFrom) {
		url.searchParams.set('filterFrom', filter.filterFrom.toISOString());
	}
	if (filter.filterTo) {
		url.searchParams.set('filterTo', filter.filterTo.toISOString());
	}
	if (filter.filterAt) {
		url.searchParams.set('filterAt', filter.filterAt.toISOString());
	}
}
export async function apiGetEvent(fetch: fetchFun, eventId: string) {
	return fetch(`/api/v1/epg/events/${eventId}`);
}

export async function apiGetEvents(fetch: fetchFun, baseUrl: URL, filter: QueryFilter) {
	const url = new URL('/api/v1/epg/events', baseUrl);
	applyFilter(url, filter);
	LOG.debug({ msg: 'constructing events loader', url: url });
	return fetch(url);
}

export async function apiSearchEvents(
	fetch: fetchFun,
	baseUrl: URL,
	q: string,
	filter: QueryFilter = {}
) {
	const url = new URL('/api/v1/epg/events/search', baseUrl);
	url.search = baseUrl.search;
	url.searchParams.set('q', q);
	applyFilter(url, filter);
	LOG.debug({ msg: 'constructing events loader', url: url });
	return fetch(url);
}
