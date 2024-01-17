import { apiGetEvents } from '$lib/client/apiWrapper';
import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import anylogger from 'anylogger';

const LOG = anylogger('Page:/epgNow:LOAD');

export const load: PageLoad = async ({ fetch, url, depends }) => {
	depends('app:epgNow');

	let searchDate = new Date();
	let modeNow = true;

	try {
		if (url.searchParams.has('time')) {
			const paramDate = new Date(url.searchParams.get('time') ?? '');
			searchDate = paramDate;
			LOG.debug({ msg: 'loadtime detected', date: searchDate });
			modeNow = false;
		}
	} catch (e) {
		LOG.warn('Error while converting time parameter', e);
	}
	const result = await apiGetEvents(fetch, url, { range: 1000, filterAt: searchDate });
	if (result.status >= 300) {
		error(result.status, result.statusText);
	}
	let events: ITVHEpgEvent[] = (await result.json()).events;
	events = events.sort((a, b) => {
		return a.channel.number - b.channel.number;
	});
	return {
		searchDate: searchDate,
		events: events,
		modeNow: modeNow
	};
};
