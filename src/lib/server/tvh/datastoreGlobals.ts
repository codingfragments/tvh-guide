import anylogger from 'anylogger';

const LOG = anylogger('thv:DatastoreHelper');

import { toBool } from '$lib/tools';
import type { ITVHChannel, ITVHEpgEvent } from '$lib/types/epg-interfaces';
import { createTVHClient } from './tvheadend-client';
import { days } from '$lib/timeGlobals';

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
