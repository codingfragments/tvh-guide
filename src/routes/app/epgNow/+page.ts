import { apiGetEvents } from '$lib/client/apiWrapper';
import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const searchDate = new Date();
	const result = await apiGetEvents(fetch, url, { range: 1000, filterAt: searchDate });
	if (result.status >= 300) {
		throw error(result.status, result.statusText);
	}
	let events: ITVHEpgEvent[] = (await result.json()).events;
	events = events.sort((a, b) => {
		return a.channel.number - b.channel.number;
	});
	return {
		searchDate: searchDate,
		events: events
	};
};
