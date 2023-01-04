import type { ITVHChannel, ITVHChannelTag, ITVHEpgEvent, ITVHGenre } from '$lib/types/epg-interfaces';
import { createTVHClient } from './tvheadend-client';
import { v4 as uuidv4 } from 'uuid';
import type { ServerStatus } from '$lib/types/api';
import type { FSCache } from '$lib/types/cache';
import { toBool } from '$lib/tools';
import * as fs from 'fs';
import anylogger from 'anylogger';
import Fuse from 'fuse.js';
import { minutes } from '$lib/timeGlobals';
const LOG = anylogger('CACHE');

export class TVHCache {
	private _channelTags = new Map<string, string>();
	private _contentTypes = new Map<string, string>();
	private _channels = new Map<string, ITVHChannel>();
	private _epg = new Map<string, ITVHEpgEvent>();
	private _epgByChannel = new Map<string, ITVHEpgEvent[]>();
	private _epgSorted = new Array<ITVHEpgEvent>();

	private _firstDate?: Date;
	private _lastDate?: Date;
	private _lastUpdate?: Date;
	private _searchCache = new Map<string, { timestamp: Date; results: Fuse.FuseResult<ITVHEpgEvent>[] }>();

	private _searchIndex: Fuse<ITVHEpgEvent> = new Fuse(this._epgSorted, {
		includeScore: true,
		useExtendedSearch: false,
		keys: ['channelName', 'description', 'title', 'genre', 'copyright_year', 'channel.tags']
	});

	// prep this in case we like to sync on shared datastopres between client and server
	// using a trivial sync protocol later

	// FIXME: Maybe add a mutex to check for reloading and block higher level API calls while reloading. Potential Race condition
	private uuid = uuidv4();
	private currentDataVersion = 0;

	// Access Patterns
	// ---------------
	get channels() {
		return this._channels;
	}
	get epg() {
		return this._epg;
	}
	get epgByChannel() {
		return this._epgByChannel;
	}
	get dateRange() {
		return { start: this._firstDate, stop: this._lastDate };
	}
	get epgSorted() {
		return this._epgSorted;
	}

	get channelTags(): ITVHChannelTag[] {
		return Array.from(this._channelTags.entries()).map((entry) => {
			return { name: entry[1], uuid: entry[0] };
		});
	}
	get genres(): ITVHGenre[] {
		// FIXME Move this to a cleanup state after load all or load from cache !!!
		const genre = new Map<string, ITVHGenre>();
		for (const tvhGenreEntry of this._contentTypes.entries()) {
			const newGenre: string[] = [];
			const tvhGenre = tvhGenreEntry[1];
			if (tvhGenre.includes('/')) {
				for (const g3 of tvhGenre.split('/')) {
					newGenre.push(g3.trim().toLowerCase());
				}
			} else {
				newGenre.push(tvhGenre.trim().toLowerCase());
			}

			for (const ng of newGenre) {
				const tempGenre = genre.get(ng);
				if (typeof tempGenre !== 'undefined') {
					tempGenre.tvhIds.push(parseInt(tvhGenreEntry[0]));
				} else {
					genre.set(ng, { name: ng, tvhIds: [parseInt(tvhGenreEntry[0])] });
				}
			}
		}
		return Array.from(genre.values());
	}

	public getEpgEntriesByTime(start = 0, end = 9999999) {
		return Array.from(this._epg.values()).slice(start, end);
	}

	private prepSearchIndex() {
		this._searchCache.clear();
		const filteredEPG = this._epgSorted.filter((e) => {
			return e.description && e.description.length > 10;
		});
		LOG.debug({
			msg: 'Filter and prep search Index',
			count: filteredEPG.length,
			all: this._epgSorted.length
		});
		this._searchIndex.setCollection(filteredEPG);
	}
	public clear() {
		this._channels.clear();
		this._channelTags.clear();
		this._epgByChannel.clear();
		this._contentTypes.clear();
		this._epg.clear();
		this._epgSorted = [];
		this._firstDate = undefined;
		this._lastDate = undefined;
		this.prepSearchIndex();
		this.uuid = uuidv4();
		this.currentDataVersion = 0;
	}

	public get status(): ServerStatus {
		const status: ServerStatus = {
			firstDate: this._firstDate,
			lastDate: this._lastDate,
			lastUpdate: this._lastUpdate,
			numEvents: this._epg.size,
			numChannels: this._channels.size,
			cacheUUID: this.uuid
		};
		return status;
	}

	private registerEvent(dto: ITVHEpgEvent) {
		// Register per Channel
		let channelEpg = this._epgByChannel.get(dto.channel.uuid);
		if (channelEpg === undefined) {
			channelEpg = [];
			this._epgByChannel.set(dto.channel.uuid, channelEpg);
		}
		// FUTURE: When doing partial updates, make sure this will remove duplicates first, or refill from epg store totally
		channelEpg.push(dto);
		// Register Raw EPGEvent
		this._epg.set(dto.uuid ?? '', dto);
	}

	private cachedSearch(query: string): Fuse.FuseResult<ITVHEpgEvent>[] {
		if (this._searchCache.has(query)) {
			const cachedResult = this._searchCache.get(query);
			LOG.debug({ msg: 'Cache hit for Query', ts: cachedResult?.timestamp, query });
			return cachedResult?.results ?? [];
		}
		const results = this._searchIndex?.search(query);
		// just make sure to call cache Cleanup regulary
		// FUTURE Move this to a more clever offline scheduler
		this.cacheHousekeeping();
		this._searchCache.set(query, { timestamp: new Date(), results });
		return results;
	}
	private cacheHousekeeping() {
		// This is mainly to have some minimum protection against memory leaks. Better, keep 50% of the most recent results
		// Cache will be completly cleared on every epg reload anyways (as long as this is not done in a merge-update way in the future)
		//TODO Change this if merge update gets implemented
		//TODO check for memory and performance impacts and add more logic
		if (this._searchCache.size > 30) {
			this._searchCache.clear();
		}
	}
	public search(query: string, scoreFilter = 0.75): Array<ITVHEpgEvent> {
		let result = this.cachedSearch(query);
		result = result.filter((e) => {
			return e.score && e.score <= scoreFilter;
		});
		if (result) {
			const apiResult = Array.from(result.values(), (e) => {
				const epg = e.item;
				epg._searchScore = e.score;
				return e.item;
			});
			return apiResult;
		} else {
			return [];
		}
	}

	// Calculate the daterange based on 50/50 rules.
	// Take the first date where 50% Channels have a minimum of data
	// Take the last data where 50% of channels have Data
	private calcDateRanges() {
		const startDates: Date[] = [];
		const endDates: Date[] = [];
		for (const ch of this._epgByChannel.keys()) {
			const epg = this.epgByChannel.get(ch);

			if (typeof epg !== 'undefined') {
				startDates.push(new Date(epg[0].startDate));
				endDates.push(new Date(epg[epg.length - 1].stopDate));
			}
		}
		// IDEA Prio Channels based on tags or groups
		this._firstDate = startDates.sort((a, b) => a.getTime() - b.getTime())[Math.round(startDates.length * 0.5)];
		this._lastDate = endDates.sort((a, b) => a.getTime() - b.getTime())[Math.round(endDates.length * 0.8)];
	}

	private convertEPG(epg: ITVHEpgEvent) {
		epg.startDate = new Date(epg.start * 1000).toISOString();
		epg.stopDate = new Date(epg.stop * 1000).toISOString();
		epg.widescreen = toBool(epg.widescreen);
		epg.subtitled = toBool(epg.subtitled);
		const channel = this._channels.get(epg.channelUuid);
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
				const g2 = this._contentTypes.get(g1);
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

	public loadFromCache(path = './epgcache') {
		if (fs.existsSync(path + '/cache.json')) {
			fs.readFile(path + '/cache.json', (err, data) => {
				if (!err) {
					const dat: FSCache = JSON.parse(data.toString());
					this._channels = new Map(Object.entries(dat.channels));
					this._channelTags = new Map(Object.entries(dat.channelTags));
					this._contentTypes = new Map(Object.entries(dat.contentTypes));
					this._epg = new Map(Object.entries(dat.epg));
					this._epgByChannel = new Map(Object.entries(dat.epgByChannel));
					this._firstDate = new Date(dat.firstDate);
					this._lastDate = new Date(dat.lastDate);
					this._lastUpdate = new Date(dat.lastUpdate);
					this._epgSorted = Array.from(this._epg.values()).sort((a, b) => {
						return a.start - b.start;
					});
					this.prepSearchIndex();
				}
			});
		}
	}
	public storeAll(path = './epgcache') {
		if (fs.existsSync(path)) {
			const data: FSCache = {
				currentDataVersion: this.currentDataVersion,
				channelTags: Object.fromEntries(this._channelTags),
				channels: Object.fromEntries(this._channels),
				contentTypes: Object.fromEntries(this._contentTypes),
				epg: Object.fromEntries(this._epg),
				epgByChannel: Object.fromEntries(this._epgByChannel),
				firstDate: new Date(this._firstDate ?? 0),
				lastDate: new Date(this._lastDate ?? 0),
				lastUpdate: new Date(this._lastUpdate ?? 0)
			};
			fs.writeFileSync(path + '/cache.json', JSON.stringify(data, null, 2));
		}
	}

	public async loadAll(clear = false) {
		const tvhClient = createTVHClient();
		const channels = await tvhClient.getChannelGrid();
		const channelTags = await tvhClient.getChannelTags();
		const contentTypes = await tvhClient.getContentTypes();

		// FUTURE: Create better handling of big data (Loop as in /app/epg/+server.ts)
		const events = await tvhClient.getEpgGrid(1000000000);
		const epgs = events.entries.sort((a, b) => a.start - b.start);

		if (clear) {
			this.clear();
		}

		for (const tag of channelTags.entries) {
			this._channelTags.set(tag.key, tag.val);
		}

		for (const genre of contentTypes.entries) {
			this._contentTypes.set(genre.key, genre.val);
		}

		for (const channel of channels.entries) {
			const tags: string[] = [];
			for (const tag of channel.tags) {
				const ctag = this._channelTags.get(tag);
				if (typeof ctag !== 'undefined') {
					tags.push(ctag);
				}
			}
			// Convert to DTO and store
			channel.tags = tags;
			this._channels.set(channel.uuid, channel);
		}

		// EPG
		// ------------------------

		for (const epg of epgs) {
			try {
				this.convertEPG(epg);
				this.registerEvent(epg);
			} catch (err) {
				LOG.error('Failed to convert, skipping element', err);
			}
		}

		// second Pass, relink EPGs
		for (const epg of epgs) {
			if (typeof epg.nextEventUuid !== 'undefined') {
				const targetEpg = this._epg.get(epg.nextEventUuid);
				if (typeof targetEpg !== 'undefined') {
					targetEpg.prevEventUuid = epg.uuid;
				}
			}
		}

		this._lastUpdate = new Date();
		this.calcDateRanges();
		this._epgSorted = Array.from(this._epg.values()).sort((a, b) => {
			return a.start - b.start;
		});
		// Init search Index
		this.prepSearchIndex();

		this.storeAll();
	}

	public async reloadAll(retryTime = 1) {
		try {
			await this.loadAll(true);
		} catch (error) {
			LOG.error(error); // from creation or business logic
			LOG.info('Retry !!');
			setTimeout(() => this.reloadAll(retryTime), minutes(retryTime));
		}
	}

	public async updateAll() {
		// FUTURE: Try to add new and change existing, bbut keep the old one to cuttof
		this.clear();
		await this.loadAll();
	}
	public searchEventsByChannel(channelUuid: string, start: Date, stop?: Date): Array<ITVHEpgEvent> {
		const ch = this.epgByChannel.get(channelUuid);
		if (ch === undefined) return [];
		else {
			const res: ITVHEpgEvent[] = [];
			for (const epg of ch) {
				if (new Date(epg.startDate) >= start || new Date(epg.stopDate) >= start) {
					if (typeof stop === 'undefined' || new Date(epg.startDate) < stop) {
						res.push(epg);
					}
				}
			}
			return res;
		}
	}
}

export const tvhCache = new TVHCache();
tvhCache.loadFromCache();

export function initCache(cache: TVHCache, reloadTime = 30, retryTime = 1, retries = 5) {
	LOG.info('preload Started');
	// preload cache
	const loading = cache.loadAll(true);
	loading
		.then(() => {
			LOG.info(`Preload Finished `);
			setInterval(() => cache.reloadAll(retryTime), minutes(reloadTime));
		})
		.catch((error) => {
			LOG.error(error);
			LOG.info('Initial load failed.');
			if (retries > 0) {
				LOG.info('Retry scheduled in ' + retryTime + '  minutes!');
				setTimeout(() => initCache(cache, reloadTime, retryTime, retries - 1), minutes(retryTime));
			}
		});
}
