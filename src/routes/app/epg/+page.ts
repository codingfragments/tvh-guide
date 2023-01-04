import type { APIGetChannelsResults, APIGetEventsResults } from '$lib/client/apiTypes';
import { apiGetChannels, apiGetEvents, type FetchFun } from '$lib/client/apiWrapper';
import { moduloMinutesDate } from '$lib/tools';
import type { ITVHChannel, ITVHEpgEvent } from '$lib/types/epg-interfaces';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import anylogger from 'anylogger';
const LOG = anylogger('Page:/epg:LOAD');

async function loadEpgGrid(
	fetch: FetchFun,
	url: URL,
	from: Date,
	to: Date
): Promise<Map<string, ITVHEpgEvent[]>> {
	let loadFinished = false;
	let page = 0;
	const grid = new Map<string, ITVHEpgEvent[]>();
	while (!loadFinished) {
		const result = await apiGetEvents(fetch, url, {
			filterFrom: from,
			filterTo: to,
			range: 1000,
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

interface EpgGridScrollData {
	scrollTo: boolean;
	scrollToDate: Date;
}
interface EpgGridData {
	channels: ITVHChannel[];
	searchDate: Date;
	searchEndDate: Date;
	epgGrid: Map<string, ITVHEpgEvent>;
	scroll: EpgGridScrollData;
}
export const load: PageLoad = async ({ fetch, url }): Promise<EpgGridData> => {
	const result = await apiGetChannels(fetch, url, { range: 1000 });
	if (result.status >= 300) {
		throw error(result.status, result.statusText);
	}
	const data: APIGetChannelsResults = await result.json();

	const returnData = {
		channels: data.channels,
		searchDate: new Date(),
		searchEndDate: new Date(),
		epgGrid: new Map(),
		scroll: {
			scrollTo: false,
			scrollToDate: new Date()
		}
	};
	// TODO Better handling of Dates
	// When endless Scrolling is enabled the Date handling should be Focus on rendering the
	// date in question towards the middle of the screen.
	// search date == minimal epg Date || <4 hour distance Query from minimal Date and scroll
	// to search date
	// search Date >4 distancee from minimal, query from searchDate-5 hours and scroll to
	// search date

	// explicit scroll dates will allways takes priority
	// searchEndDate will be 24 hours from query start

	returnData.searchDate = moduloMinutesDate(
		new Date(url.searchParams.get('time') ?? new Date()),
		15
	);
	returnData.searchEndDate = new Date(returnData.searchDate);
	returnData.searchEndDate.setMinutes(60 * 24);

	// TODO Load Channel and Events
	returnData.epgGrid = await loadEpgGrid(
		fetch,
		url,
		returnData.searchDate,
		returnData.searchEndDate
	);

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
