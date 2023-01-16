import type { ServerStatus } from '$lib/types/api';
import type { ITVHChannel, ITVHChannelTag, ITVHEpgEvent, ITVHGenre, ITVHTag } from '$lib/types/epg-interfaces';
import type { DataStore, EPGDatastoreFilter } from '../types/database';
import { v4 as uuidv4 } from 'uuid';

import anylogger from 'anylogger';
// import anylogger from '$lib/server/logger';

const LOG = anylogger('srv:MemoryStore');

import { Low } from 'lowdb';

// @ts-expect-error missleading import, it's verified
import { JSONFile } from 'lowdb/node';

import { minutes } from '$lib/timeGlobals';
import { calcDateRange, filterEPGs, loadStateFromTVH } from './datastoreGlobals';
import Fuse from 'fuse.js';
import { isTrueish } from '$lib/tools';

export interface DataObj {
	epgs: ITVHEpgEvent[];
	channels: ITVHChannel[];
	channelTags: ITVHTag[];
	contentTypes: ITVHTag[];
}

export class MemoryStore implements DataStore {
	private datastore: Low<DataObj>;
	private idxEpgs: Map<string, ITVHEpgEvent> = new Map();
	private idxChannel: Map<string, ITVHChannel> = new Map();

	private uuid = uuidv4();
	private lastUpdate: Date = new Date('1990-01-01');
	lastDate: Date = new Date();
	firstDate: Date = new Date();

	private searchIndex: Fuse<ITVHEpgEvent> = new Fuse([], {
		includeScore: true,
		useExtendedSearch: false,
		keys: ['channelName', 'description', 'title', 'genre', 'copyright_year', 'channel.tags']
	});

	private searchCache = new Map<string, { timestamp: Date; results: Fuse.FuseResult<ITVHEpgEvent>[] }>();

	//
	// Initialization
	// ==============
	//
	public constructor(
		private path = './epgcache/DB.json',
		private reloadTime = 30,
		private retryTime = 1,
		private retries = 5,
		private skipLoad = false
	) {
		const adapter = new JSONFile<DataObj>(path);
		this.datastore = new Low(adapter);
	}

	private async load(retries: number) {
		if (this.skipLoad) {
			LOG.warn({ msg: `LOADING DATA bypassed, test mode`, dbPath: this.path });
			return;
		}
		LOG.info(`Load Data from TVH `);
		try {
			const data = await loadStateFromTVH();
			this.lastUpdate = new Date();
			await this.storeStateToDatastore(data);
			await this.prepSearchIndex();
			const dateRange = calcDateRange(data.epgs);
			this.firstDate = dateRange.start;
			this.lastDate = dateRange.stop;

			setTimeout(() => this.load(this.retries), minutes(this.reloadTime));
			LOG.info(`Load Data from TVH - finished `);
		} catch (error) {
			LOG.error(error);
			LOG.info('Initial load failed.');
			if (this.retries > 0) {
				LOG.info('Retry scheduled in ' + this.retryTime + '  minutes!');
				setTimeout(() => this.load(retries - 1), minutes(this.retryTime));
			} else {
				throw new Error('Fatal, retry failed TVH collection impossible');
			}
		}
	}
	async storeStateToDatastore(data: {
		channels: ITVHChannel[];
		channelTags: ITVHTag[];
		contentTypes: ITVHTag[];
		epgs: ITVHEpgEvent[];
	}) {
		LOG.info(`Load Finished `);

		// TODO Implement partial update/merge
		// this.storeData(data.epgs, data.channels, data.channelTags, data.contentTypes);
		if (this.datastore.data) {
			const db = this.datastore.data;
			db.epgs = data.epgs;

			db.channelTags = data.channelTags;
			db.contentTypes = data.contentTypes;
			db.channels = data.channels;

			this.idxEpgs.clear();
			db.epgs.forEach((e) => {
				this.idxEpgs.set(e.uuid, e);
			});
			this.idxChannel.clear();
			db.channels.forEach((c) => {
				this.idxChannel.set(c.uuid, c);
			});
			// await this.prepSearchIndex();
			const used = process.memoryUsage().heapUsed / 1024 / 1024;
			LOG.debug({ msg: 'MEMORY Reloaded', used, stats: process.memoryUsage() });
		} else {
			LOG.error('Memory Datastore seems to have failed on initialization');
		}

		try {
			await this.datastore.write();
		} catch (err) {
			LOG.error('Error while persisting Datastore', err);
		}
		const dateRange = calcDateRange(data.epgs);
		this.firstDate = dateRange.start;
		this.lastDate = dateRange.stop;
	}

	private async prepSearchIndex() {
		this.searchCache.clear();
		const filteredEPG = (await this.getSortedEvents()).filter((e) => {
			return e.description && e.description.length > 10;
		});
		LOG.debug({
			msg: 'Filter and prep search Index',
			count: filteredEPG.length,
			all: (await this.getSortedEvents()).length
		});
		this.searchIndex.setCollection(filteredEPG);
	}

	public async init() {
		// Load the DB from stored state
		await this.datastore.read();
		this.datastore.data ||= {
			channels: [],
			channelTags: [],
			epgs: [],
			contentTypes: []
		};
		this.idxEpgs.clear();
		if (this.datastore.data.epgs) {
			this.datastore.data.epgs.forEach((e) => {
				this.idxEpgs.set(e.uuid, e);
			});
		}
		this.idxChannel.clear();
		if (this.datastore.data.channels) {
			this.datastore.data.channels.forEach((c) => {
				this.idxChannel.set(c.uuid, c);
			});
		}
		const dateRange = calcDateRange(this.datastore.data.epgs);
		this.firstDate = dateRange.start;
		this.lastDate = dateRange.stop;

		// restore Search
		await this.prepSearchIndex();
		LOG.debug({ msg: 'PDB initialized' });

		this.load(this.retries);
		// TODO Init indexes needed
	}

	//
	// Interface Methods
	// =================
	//

	get dateRange() {
		return { start: this.firstDate, stop: this.lastDate };
	}

	async getStatus(): Promise<ServerStatus> {
		const status: ServerStatus = {
			firstDate: this.firstDate,
			lastDate: this.lastDate,
			lastUpdate: this.lastUpdate,
			numEvents: (await this.getChannels()).length,
			numChannels: (await this.getChannels()).length,
			cacheUUID: this.uuid
		};
		return status;
	}
	async getChannels(): Promise<ITVHChannel[]> {
		return this.datastore.data?.channels || [];
	}
	async hasChannel(channelId: string): Promise<boolean> {
		return this.idxChannel.has(channelId) || false;
	}
	async getChannel(channelId: string): Promise<ITVHChannel | undefined> {
		return this.idxChannel.get(channelId);
	}
	async getChannelTags(): Promise<ITVHChannelTag[]> {
		if (!this.datastore.data) return [];

		const erg: ITVHChannelTag[] = [];
		this.datastore.data.channelTags.forEach((channelTag) => {
			erg.push({ uuid: channelTag.key, name: channelTag.val });
		});
		return erg;
	}

	async findChannelsByTag(tag: ITVHChannelTag): Promise<ITVHChannel[]> {
		return Array.from(await this.getChannels()).filter((channel) => {
			return channel.tags.includes(tag.name);
		});
	}
	async getSortedEvents(): Promise<ITVHEpgEvent[]> {
		if (!this.datastore.data) return [];

		const erg = Array.from(this.datastore.data.epgs).sort((a, b) => {
			return a.start - b.start;
		});

		return erg;
	}

	public async getFilteredEvents(filter: EPGDatastoreFilter): Promise<ITVHEpgEvent[]> {
		const epgs = await this.getSortedEvents();
		return filterEPGs(epgs, filter);
	}

	async hasEvent(epgEventId: string): Promise<boolean> {
		return this.idxEpgs.has(epgEventId) || false;
	}

	async getEvent(epgEventId: string): Promise<ITVHEpgEvent | undefined> {
		return this.idxEpgs.get(epgEventId);
	}

	async getContenttypes(): Promise<ITVHTag[]> {
		if (!this.datastore.data) return [];

		return this.datastore.data.contentTypes;
	}

	// FIXME complete migration
	async getGenres(): Promise<ITVHGenre[]> {
		// FIXME Move this to a cleanup state after load all or load from cache !!!
		const contenttypes = await this.getContenttypes();

		const genre = new Map<string, ITVHGenre>();
		for (const tvhGenreEntry of contenttypes.values()) {
			const newGenre: string[] = [];
			const tvhGenre = tvhGenreEntry.val;
			if (tvhGenre.includes('/')) {
				for (const g3 of tvhGenre.split('/')) {
					newGenre.push(g3.trim());
				}
			} else {
				newGenre.push(tvhGenre.trim());
			}

			for (const ng of newGenre) {
				const tempGenre = genre.get(ng);
				if (typeof tempGenre !== 'undefined') {
					tempGenre.tvhIds.push(parseInt(tvhGenreEntry.key));
				} else {
					genre.set(ng, { name: ng, tvhIds: [parseInt(tvhGenreEntry.key)] });
				}
			}
		}
		return Array.from(genre.values());
	}

	private cachedSearch(query: string): Fuse.FuseResult<ITVHEpgEvent>[] {
		if (this.searchCache.has(query)) {
			const cachedResult = this.searchCache.get(query);
			LOG.debug({ msg: 'Cache hit for Query', ts: cachedResult?.timestamp, query });
			return cachedResult?.results ?? [];
		}
		const results = this.searchIndex?.search(query);
		// just make sure to call cache Cleanup regulary
		// FUTURE Move this to a more clever offline scheduler
		this.cacheHousekeeping();
		this.searchCache.set(query, { timestamp: new Date(), results });
		return results;
	}

	private cacheHousekeeping() {
		// This is mainly to have some minimum protection against memory leaks. Better, keep 50% of the most recent results
		// Cache will be completly cleared on every epg reload anyways (as long as this is not done in a merge-update way in the future)
		//TODO Change this if merge update gets implemented
		//TODO check for memory and performance impacts and add more logic
		if (this.searchCache.size > 30) {
			this.searchCache.clear();
		}
	}
	public async search(query: string): Promise<ITVHEpgEvent[]> {
		// TODO Move this to config/env
		const scoreFilter = 0.75;
		LOG.debug('EVENT');
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
}
