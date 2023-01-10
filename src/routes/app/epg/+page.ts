import type { APIGetChannelsResults, APIGetEventsResults } from '$lib/client/apiTypes';
import { apiGetChannels, apiGetEvents, type FetchFun } from '$lib/client/apiWrapper';
import { moduloMinutesDate } from '$lib/tools';
import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { hours } from '$lib/timeGlobals';

import anylogger from 'anylogger';
const LOG = anylogger('Page:/epg:LOAD');

async function loadEpgGrid(fetch: FetchFun, url: URL, from: Date, to: Date): Promise<Map<string, ITVHEpgEvent[]>> {
	let loadFinished = false;
	let page = 0;
	const grid = new Map<string, ITVHEpgEvent[]>();
	while (!loadFinished) {
		const result = await apiGetEvents(fetch, url, {
			filterFrom: from,
			filterTo: to,
			range: 10000,
			page: page
		});
		if (result.status >= 300) {
			throw error(result.status, result.statusText);
		}
		const data: APIGetEventsResults = await result.json();
		LOG.debug({ msg: 'Load Page', page, results: data.query.maxPage });

		// PROCESS RESULTS
		// ===============
		data.events.forEach((epg) => {
			if (grid.get(epg.channel.uuid)) {
				grid.get(epg.channel.uuid)?.push(epg);
			} else {
				grid.set(epg.channel.uuid, [epg]);
			}
		});

		if (page >= data.query.maxPage) {
			loadFinished = true;
		} else {
			page += 1;
		}
	}
	return grid;
}

export const load: PageLoad = async ({ fetch, url, parent }) => {
	const result = await apiGetChannels(fetch, url, { range: 1000 });
	if (result.status >= 300) {
		throw error(result.status, result.statusText);
	}

	// IDEA probably i could combine with epg load, and make sure to extract available Channels only.
	// This would make this Flow simpler to read and also will make sure to
	// only include Channels with at least 1 Event in the time searched

	const data: APIGetChannelsResults = await result.json();

	const returnData = {
		channels: data.channels,
		searchDate: new Date(),
		searchEndDate: new Date(),
		selectedDate: new Date(),
		epgGrid: new Map<string, ITVHEpgEvent[]>(),
		scroll: {
			scrollTo: false,
			scrollToDate: new Date()
		}
	};
	// When endless Scrolling is enabled the Date handling should be Focus on rendering the
	// date in question towards the middle of the screen.
	// search date == minimal epg Date || <4 hour distance Query from minimal Date and scroll
	// to search date
	// search Date >4 distance from minimal, query from searchDate-4 hours and scroll to
	// search date

	// explicit scroll dates will allways takes priority
	// searchEndDate will be 24 hours from query start
	// selectedDate will store the requested searchDate for UI Purposes

	// FUTURE Rework scroll position, the current reloading would scroll the requested time to the top of the window, this leaves less scroll down then up

	returnData.searchDate = moduloMinutesDate(new Date(url.searchParams.get('time') ?? new Date()), 15);
	returnData.selectedDate = returnData.searchDate;
	const layoutData = await parent();

	const distanceToMinimum = returnData.searchDate.getTime() - layoutData.epgDateRange.epgDateFirst.getTime();
	if (distanceToMinimum <= hours(12)) {
		returnData.scroll.scrollTo = true;
		returnData.scroll.scrollToDate = returnData.searchDate;
		returnData.searchDate = layoutData.epgDateRange.epgDateFirst;
	} else {
		returnData.scroll.scrollTo = true;
		returnData.scroll.scrollToDate = returnData.searchDate;
		returnData.searchDate = new Date(returnData.searchDate.getTime() - hours(12));
	}
	returnData.searchEndDate = new Date(returnData.searchDate);
	returnData.searchEndDate.setMinutes(60 * 24);

	returnData.epgGrid = await loadEpgGrid(fetch, url, returnData.searchDate, returnData.searchEndDate);

	LOG.debug({
		msg: 'EPGGrid Loaded',
		searchDate: returnData.searchDate,
		searchEndDate: returnData.searchEndDate
	});

	const scrollToDate = url.searchParams.get('scrollDate');
	if (scrollToDate) {
		returnData.scroll.scrollTo = true;
		returnData.scroll.scrollToDate = moduloMinutesDate(new Date(scrollToDate), 15);
	}

	return returnData;
};
