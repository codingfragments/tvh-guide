import anylogger from 'anylogger';

const LOG = anylogger('thv:DatastoreHelper');

import { toBool } from '$lib/tools';
import type { ITVHChannel, ITVHEpgEvent } from '$lib/types/epg-interfaces';
import { createTVHClient } from './tvheadend-client';
import { days } from '$lib/timeGlobals';
import type { EPGDatastoreFilter } from '../types/database';

/** Convert EPG to data form, change some files and calculate Dates and
 *  Link to DTOs
 */
export function convertEPG(epg: ITVHEpgEvent, _channels: Map<string, ITVHChannel>, _contentTypes: Map<string, string>) {
	epg.startDate = new Date(epg.start * 1000).toISOString();
	epg.stopDate = new Date(epg.stop * 1000).toISOString();
	epg.widescreen = toBool(epg.widescreen);
	epg.subtitled = toBool(epg.subtitled);
	const channel = _channels.get(epg.channelUuid);
	if (typeof channel !== 'undefined') {
		epg.channel = channel;
	} else {
		throw new Error('EPG Transform failed, EPG-Channel not found :\n' + JSON.stringify(epg, null, 2));
	}
	epg.uuid = '' + epg.eventId;

	epg.nextEventUuid = '' + epg.nextEventId;
	const newGenre = new Array<string>();
	if (epg.genre) {
		for (const g1 of epg.genre) {
			const g2 = _contentTypes.get(g1);
			if (g2) {
				if (g2.includes('/')) {
					for (const g3 of g2.split('/')) {
						newGenre.push(g3.trim());
					}
				} else {
					newGenre.push(g2.trim());
				}
			}
		}
		epg.genre = newGenre.filter((v, i, a) => a.indexOf(v) === i);
	}
}

export async function loadStateFromTVH() {
	const tvhClient = createTVHClient();
	const channels = await tvhClient.getChannelGrid();
	const channelTags = await tvhClient.getChannelTags();
	const contentTypes = await tvhClient.getContentTypes();

	// FUTURE: Create better handling of big data (Loop as in /app/epg/+server.ts)
	const epgs = (await tvhClient.getEpgGrid(1000000000)).entries;

	const _channelTags = new Map<string, string>();
	for (const tag of channelTags.entries) {
		_channelTags.set(tag.key, tag.val);
	}
	const _contentTypes = new Map<string, string>();
	for (const genre of contentTypes.entries) {
		_contentTypes.set(genre.key, genre.val);
	}
	// Convert Channel
	// ===============
	const _channels = new Map<string, ITVHChannel>();
	for (const channel of channels.entries) {
		const tags: string[] = [];
		for (const tag of channel.tags) {
			const ctag = _channelTags.get(tag);
			if (typeof ctag !== 'undefined') {
				tags.push(ctag);
			}
		}
		// Convert to DTO and store
		channel.tags = tags;
		_channels.set(channel.uuid, channel);
	}

	const _epg = new Map<string, ITVHEpgEvent>();
	// Convert EPGs
	// ============
	for (const epg of epgs) {
		try {
			convertEPG(epg, _channels, _contentTypes);
			_epg.set(epg.uuid, epg);
		} catch (err) {
			LOG.error('Failed to convert, skipping element', err);
		}
	}

	// second Pass, relink EPGs
	for (const epg of epgs) {
		if (typeof epg.nextEventUuid !== 'undefined') {
			const targetEpg = _epg.get(epg.nextEventUuid);
			if (typeof targetEpg !== 'undefined') {
				targetEpg.prevEventUuid = epg.uuid;
			}
		}
	}

	return {
		channels: Array.from(_channels.values()),
		channelTags: channelTags.entries,
		contentTypes: contentTypes.entries,
		epgs
	};
}

export function calcDateRange(epgs: ITVHEpgEvent[]) {
	const startDates: Date[] = [];
	const endDates: Date[] = [];
	const epgMap = new Map<string, ITVHEpgEvent[]>();
	epgs = epgs.sort((a, b) => a.start - b.start);
	LOG;
	epgs.forEach((e) => {
		if (new Date(e.stopDate) <= new Date(Date.now() - days(1))) {
			// skip old epg entries
			return;
		}
		const cid = e.channel.uuid;
		if (!epgMap.has(cid)) {
			epgMap.set(cid, []);
		}
		const l = epgMap.get(cid) ?? [];
		l.push(e);
	});

	for (const ch of epgMap.keys()) {
		const epg = epgMap.get(ch);

		if (typeof epg !== 'undefined') {
			startDates.push(new Date(epg[0].startDate));
			endDates.push(new Date(epg[epg.length - 1].stopDate));
		}
	}
	// IDEA Prio Channels based on tags or groups
	const firstDate = startDates.sort((a, b) => a.getTime() - b.getTime())[Math.round(startDates.length * 0.5)];
	const lastDate = endDates.sort((a, b) => a.getTime() - b.getTime())[Math.round(endDates.length * 0.8)];
	return { start: firstDate, stop: lastDate };
}

export function convertFilter(jsonObj: object): EPGDatastoreFilter {
	const filter: EPGDatastoreFilter = jsonObj;
	if (filter.dateRange) {
		filter.dateRange.from = new Date(filter.dateRange.from);
		filter.dateRange.to = new Date(filter.dateRange.to);
	}
	return filter;
}

// provide item base default filter. usefull for memory DB and caches as well as derrived filter (like in api/event/search)
export function filterEPGs(epgs: ITVHEpgEvent[], filter: EPGDatastoreFilter = {}): ITVHEpgEvent[] {
	let filteredEPGs = epgs;
	if (filter.channel) {
		const clist = filter.channel;
		filteredEPGs = filteredEPGs.filter((epg) => {
			return clist.indexOf(epg.channelUuid) > -1 || clist.indexOf(epg.channelNumber) > -1;
		});
	}

	if (filter.epgGenre) {
		const glist = filter.epgGenre;
		filteredEPGs = filteredEPGs.filter((epg) => {
			const foundGenres = epg.genre?.find((g) => glist.indexOf(g) > -1) || [];
			return foundGenres.length > 0;
		});
	}

	if (filter.dateRange) {
		const range = filter.dateRange;
		const fromUnix = new Date(range.from).getTime() / 1000;
		const toUnix = new Date(range.to).getTime() / 1000;
		filteredEPGs = filteredEPGs.filter((epg) => {
			return epg.stop > fromUnix && epg.start <= toUnix;
		});
	}
	return filteredEPGs;
}

export class EPGDatastoreUrlFilter implements EPGDatastoreFilter {
	dateRange?: { from: Date; to: Date };
	epgGenre?: string[];
	channel?: string[];

	constructor(url: URL) {
		const params = url.searchParams;

		if (params.has('channel')) {
			const c = params.getAll('channel');
			this.channel = c;
		}

		if (params.has('genre')) {
			const g = params.getAll('genre');
			this.epgGenre = g;
		}

		if (params.has('filterFrom') || params.has('filterTo')) {
			if (!this.dateRange) {
				this.dateRange = {
					from: new Date('1.1.1900'),
					to: new Date('1.1.2300')
				};
			}
		}
		if (params.has('filterFrom')) {
			try {
				if (this.dateRange) {
					this.dateRange.from = new Date(<string>params.get('filterFrom'));
				}
			} catch {
				LOG.error('Wrong conversion, keep default');
			}
		}
		if (params.has('filterTo')) {
			try {
				if (this.dateRange) {
					this.dateRange.to = new Date(<string>params.get('filterTo'));
				}
			} catch {
				LOG.error('Wrong conversion, keep default');
			}
		}
		if (params.has('filterAt')) {
			try {
				const d = new Date(<string>params.get('filterAt'));
				// by setting from and to to the same date,
				// only active Events at date will match
				this.dateRange = { from: d, to: d };
			} catch {
				LOG.error('Wrong conversion, keep default');
			}
		}
	}
}
