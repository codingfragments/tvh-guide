import type { ServerStatus } from '$lib/types/api';
import type { ITVHChannel, ITVHChannelTag, ITVHEpgEvent, ITVHGenre, ITVHTag } from '$lib/types/epg-interfaces';
import type { DataStore } from '../types/database';
import { v4 as uuidv4 } from 'uuid';
import { toBool } from '$lib/tools';

import anylogger from 'anylogger';

const LOG = anylogger('srv:PouchStore');

import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import PouchQuickSearch from 'pouchdb-quick-search';
PouchDB.plugin(PouchQuickSearch);
PouchDB.plugin(PouchFind);

import { createTVHClient } from './tvheadend-client';
import { days, minutes } from '$lib/timeGlobals';

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

		this.datastore.search({
			fields: [
				'epg.channelName',
				'epg.description',
				'epg.title',
				'epg.genre',
				'epg.copyright_year',
				'epg.channel.tags'
			],
			build: true
		});
	}

	/** Convert EPG to data form, change some files and calculate Dates and
	 *  Link to DTOs
	 */
	private convertEPG(epg: ITVHEpgEvent, _channels: Map<string, ITVHChannel>, _contentTypes: Map<string, string>) {
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

	private async loadStateFromTVH() {
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
				this.convertEPG(epg, _channels, _contentTypes);
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

		this.lastUpdate = new Date();

		return {
			channels: Array.from(_channels.values()),
			channelTags: channelTags.entries,
			contentTypes: contentTypes.entries,
			epgs
		};
	}

	private async load(retries: number) {
		LOG.info(`Load Data from TVH `);
		this.loadStateFromTVH()
			.then((data) => {
				this.storeStateToDatastore(data).then(() => {
					setInterval(() => this.load(this.retries), minutes(this.reloadTime));
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

		await this.updateDateRange();
	}

	// Calculate the daterange based on 50/50 rules.
	// Take the first date where 50% Channels have a minimum of data
	// Take the last data where 50% of channels have Data
	async updateDateRange() {
		const startDates: Date[] = [];
		const endDates: Date[] = [];
		const epgs = await this.getEpgSorted();
		const epgMap = new Map<string, ITVHEpgEvent[]>();
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
		this.firstDate = startDates.sort((a, b) => a.getTime() - b.getTime())[Math.round(startDates.length * 0.5)];
		this.lastDate = endDates.sort((a, b) => a.getTime() - b.getTime())[Math.round(endDates.length * 0.8)];
		return this.dateRange;
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
		LOG.debug({ msg: 'PDB initialized', info });

		this.load(this.retries);
		// TODO Init indexes needed
	}

	get dateRange() {
		return { start: this.firstDate, stop: this.lastDate };
	}

	//
	// Interface Methods
	// =================
	//
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
		const result = await this.datastore.allDocs({
			startkey: 'epgevent:',
			endkey: 'epgevent:\uffff',
			include_docs: true
		});

		let erg: ITVHEpgEvent[] = [];
		result.rows.forEach((row) => {
			if (row.doc?.epg) {
				erg.push(row.doc.epg);
			}
		});
		erg = Array.from(erg).sort((a, b) => {
			return a.start - b.start;
		});
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
	async search(query: string): Promise<ITVHEpgEvent[]> {
		const qq = await this.datastore.search({
			query: query,
			fields: [
				'epg.channelName',
				'epg.description',
				'epg.title',
				'epg.genre',
				'epg.copyright_year',
				'epg.channel.tags'
			],
			include_docs: true
		});
		const ergs = new Array<ITVHEpgEvent>();
		qq.rows.forEach((row) => {
			if (row.doc.epg) {
				ergs.push(row.doc.epg);
			}
		});
		return ergs;
	}
}

// //TODO move path  to environment settings
// export const pouchStore = new PouchStore('./epgcache/DBTest');
