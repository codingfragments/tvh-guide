import type { ServerStatus } from '$lib/types/api';
import type { ITVHChannel, ITVHChannelTag, ITVHEpgEvent, ITVHGenre, ITVHTag } from '$lib/types/epg-interfaces';
import type { DataStore } from '../types/database';
import { v4 as uuidv4 } from 'uuid';

import anylogger from 'anylogger';

const LOG = anylogger('srv:PouchStore');

import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
PouchDB.plugin(PouchFind);

import Fuse from 'fuse.js';

import { minutes } from '$lib/timeGlobals';
import { calcDateRange, loadStateFromTVH } from './datastoreGlobals';

export interface DataObj {
	_id: string;
	_rev?: string;
	type: 'epgevent' | 'channel' | 'channelTag' | 'contentType' | 'empty';
	epg?: ITVHEpgEvent;
	channel?: ITVHChannel;
	channelTag?: ITVHTag;
	contentType?: ITVHTag;
}

export class PouchStore implements DataStore {
	private datastore: PouchDB.Database<DataObj>;
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
		private path = './epgcache/DB',
		private reloadTime = 30,
		private retryTime = 1,
		private retries = 5
	) {
		this.datastore = new PouchDB<DataObj>(path, { revs_limit: 1, auto_compaction: true });

		this.datastore.createIndex({ index: { fields: ['type', '_id', 'epg.start', 'epg.stop'] } });
	}

	private async prepSearchIndex() {
		this.searchCache.clear();
		const filteredEPG = (await this.getEpgSorted()).filter((e) => {
			return e.description && e.description.length > 10;
		});
		LOG.debug({
			msg: 'Filter and prep search Index',
			count: filteredEPG.length,
			all: (await this.getEpgSorted()).length
		});
		this.searchIndex.setCollection(filteredEPG);
		LOG.debug('DONE');
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

	private async load(retries: number) {
		LOG.info(`Load Data from TVH `);
		loadStateFromTVH()
			.then((data) => {
				this.lastUpdate = new Date();
				this.storeStateToDatastore(data).then(() => {
					setInterval(() => this.load(this.retries), minutes(this.reloadTime));
					this.prepSearchIndex();
				});
				// TODO check if the FUSE search
				// Init search Index
				// this.prepSearchIndex();
			})
			.catch((error) => {
				LOG.error(error);
				LOG.info('Initial load failed.');
				if (this.retries > 0) {
					LOG.info('Retry scheduled in ' + this.retryTime + '  minutes!');
					setTimeout(() => this.load(retries - 1), minutes(this.retryTime));
				}
			});
	}
	async storeStateToDatastore(data: {
		channels: ITVHChannel[];
		channelTags: ITVHTag[];
		contentTypes: ITVHTag[];
		epgs: ITVHEpgEvent[];
	}) {
		LOG.info(`Load Finished `);

		// TODO Push Data to DB
		// this.storeData(data.epgs, data.channels, data.channelTags, data.contentTypes);
		await this.updateAndPush(
			Array.from(data.epgs).map((e): DataObj => {
				const obj: DataObj = { _id: 'epgevent:' + e.uuid, type: 'epgevent' };
				obj.epg = e;
				return obj;
			}),
			'epgevent:'
		);
		await this.updateAndPush(
			Array.from(data.channels).map((e): DataObj => {
				const obj: DataObj = { _id: 'channel:' + e.uuid, type: 'channel' };
				obj.channel = e;
				return obj;
			}),
			'channel:'
		);
		await this.updateAndPush(
			Array.from(data.channelTags).map((e): DataObj => {
				const obj: DataObj = { _id: 'channeltag:' + e.key, type: 'channelTag' };
				obj.channelTag = e;
				return obj;
			}),
			'channeltag:'
		);
		await this.updateAndPush(
			Array.from(data.contentTypes).map((e): DataObj => {
				const obj: DataObj = { _id: 'contenttype:' + e.key, type: 'contentType' };
				obj.contentType = e;
				return obj;
			}),
			'contenttype:'
		);

		const dateRange = calcDateRange(data.epgs);
		this.firstDate = dateRange.start;
		this.lastDate = dateRange.stop;
	}

	/**
	 *  Push block of objects, and make sure the _rev is updated as needed
	 * @param data Array of DataOBJ to push
	 * @param tag id prefix to enable start/endkey Limiter
	 */
	async updateAndPush(data: DataObj[], tag: string) {
		LOG.debug({ msg: 'Push Elements', tag, size: data.length });
		const current = await this.datastore.allDocs();

		const docmap = current.rows.reduce((map, e) => {
			map.set(e.id, e.value.rev);
			return map;
		}, new Map<string, string>());
		for (const d of data) {
			d._rev = docmap.get(d._id);
		}
		await this.datastore.bulkDocs(data);
	}

	public async init() {
		const info = await this.datastore.info();
		const dateRange = calcDateRange(await this.getEpgSorted());
		this.firstDate = dateRange.start;
		this.lastDate = dateRange.stop;
		LOG.debug({ msg: 'PDB initialized', info });

		await this.prepSearchIndex();
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
		const result = await this.datastore.allDocs({
			startkey: 'channel:',
			endkey: 'channel:\uffff',
			include_docs: true
		});

		const erg: ITVHChannel[] = [];
		result.rows.forEach((row) => {
			if (row.doc?.channel) {
				erg.push(row.doc.channel);
			}
		});
		return erg;
	}
	async hasChannel(channelId: string): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			this.datastore
				.get('channel:' + channelId)
				.then(() => {
					resolve(true);
				})
				.catch(() => {
					resolve(false);
				});
		});
	}
	async getChannel(channelId: string): Promise<ITVHChannel | undefined> {
		return new Promise((resolve) => {
			this.datastore
				.get('channel:' + channelId)
				.then((c) => {
					resolve(c.channel);
				})
				.catch(() => {
					resolve(undefined);
				});
		});
	}
	async getChannelTags(): Promise<ITVHChannelTag[]> {
		const result = await this.datastore.allDocs({
			startkey: 'channeltag:',
			endkey: 'channeltag:\uffff',
			include_docs: true
		});

		const erg: ITVHChannelTag[] = [];
		result.rows.forEach((row) => {
			if (row.doc?.channelTag) {
				erg.push({ uuid: row.doc.channelTag.key, name: row.doc.channelTag.val });
			}
		});
		return erg;
	}
	async findChannelsByTag(tag: ITVHChannelTag): Promise<ITVHChannel[]> {
		return Array.from(await this.getChannels()).filter((channel) => {
			return channel.tags.includes(tag.name);
		});
	}
	async getEpgSorted(): Promise<ITVHEpgEvent[]> {
		LOG.debug('Collect all events');
		const result = await this.datastore.allDocs({
			startkey: 'epgevent:',
			endkey: 'epgevent:\uffff',
			include_docs: true
		});

		LOG.debug('Reorder events');
		let erg: ITVHEpgEvent[] = [];
		result.rows.forEach((row) => {
			if (row.doc?.epg) {
				erg.push(row.doc.epg);
			}
		});
		erg = Array.from(erg).sort((a, b) => {
			return a.start - b.start;
		});
		LOG.debug({ msg: 'returning events', s: erg.length });

		return erg;
	}
	async hasEvent(epgEventId: string): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			this.datastore
				.get('epgevent:' + epgEventId)
				.then(() => {
					resolve(true);
				})
				.catch(() => {
					resolve(false);
				});
		});
	}
	async getEvent(epgEventId: string): Promise<ITVHEpgEvent | undefined> {
		return new Promise((resolve) => {
			this.datastore
				.get('epgevent:' + epgEventId)
				.then((c) => {
					resolve(c.epg);
				})
				.catch(() => {
					resolve(undefined);
				});
		});
	}
	async getContenttypes(): Promise<ITVHTag[]> {
		const result = await this.datastore.allDocs({
			startkey: 'contenttype:',
			endkey: 'contenttype:\uffff',
			include_docs: true
		});

		const tags: ITVHTag[] = [];
		result.rows.forEach((row) => {
			if (row.doc?.contentType) {
				tags.push(row.doc.contentType);
			}
		});
		return tags;
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
					newGenre.push(g3.trim().toLowerCase());
				}
			} else {
				newGenre.push(tvhGenre.trim().toLowerCase());
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
	public async search(query: string): Promise<ITVHEpgEvent[]> {
		// TODO Move this to config/env
		const scoreFilter = 0.75;
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

// //TODO move path  to environment settings
// export const pouchStore = new PouchStore('/tmp/epgdb');
// pouchStore.init();
