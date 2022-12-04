import type {
	ITVHChannel,
	ITVHChannelTag,
	ITVHEpgEvent,
	ITVHGenre
} from '$lib/types/epg-interfaces';
import { createTVHClient } from './tvheadend-client';
import { v4 as uuidv4 } from 'uuid';
import type { ServerStatus } from '$lib/types/api';
import type { FSCache } from '$lib/types/cache';
import { toBool } from '$lib/tools';
import * as fs from 'fs';

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

	// prep this in case we like to sync on shared datastopres between client and server
	// using a trivial sync protocol later

	// TODO: Maybe add a mutex to check for reloading and block higher level API calls while reloading
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
        // TODO Move trhis to a cleanup state after load all or load from cache !!!
		const genre = new Map<string, ITVHGenre>();
		for (const tvhGenreEntry of this._contentTypes.entries()) {
			const newGenre: string[] = [];
			const tvhGenre = tvhGenreEntry[1];
			if (tvhGenre.includes('/')) {
				for (const g3 of tvhGenre.split('/')) {
					newGenre.push(g3.trim().toLowerCase());
				}
			} else {
				newGenre.push( tvhGenre.trim().toLowerCase());
			}

            for (const ng of newGenre){
                if (genre.has(ng)) {
                    const tempGenre = genre.get(ng);
                    tempGenre.tvhIds.push(parseInt( tvhGenreEntry[0]))
                } else {
                    genre.set(ng,{name:ng,tvhIds:[parseInt(tvhGenreEntry[0])]})
                }
            }

		}
		return Array.from(genre.values());
	}

	public getEpgEntriesByTime(start = 0, end = 9999999) {
		return Array.from(this._epg.values()).slice(start, end);
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
		// TODO: When doing partial updates, make sure this will remove duplicates first, or refill from epg store totally
		channelEpg.push(dto);

		// Register Raw EPGEvent
		this._epg.set(dto.uuid, dto);

		// TODO: Make sure that during partial updates, and delete to check wether or not the first date need updates
		// Check for Dates
		if (this._firstDate) {
			if (new Date(dto.startDate).getTime() < this._firstDate.getTime()) {
				this._firstDate = new Date(dto.startDate);
			}
		} else {
			this._firstDate = new Date(dto.startDate);
		}

		if (this._lastDate) {
			if (new Date(dto.stopDate).getTime() > this._lastDate.getTime()) {
				this._lastDate = new Date(dto.stopDate);
			}
		} else {
			this._lastDate = new Date(dto.stopDate);
		}
	}

	// Calculate the daterange based on 20/80 rules.
	// Take the first date where 80% Channels have a minimum of data
	// Take the last data where 80% of channels have Data
	private calcDateRanges() {
		const startDates: Date[] = [];
		const endDates: Date[] = [];
		for (const ch of this._epgByChannel.keys()) {
			const epg = this.epgByChannel.get(ch);

			startDates.push(new Date(epg[0].startDate));
			endDates.push(new Date(epg[epg.length - 1].stopDate));
		}
		this._firstDate = startDates.sort((a, b) => a.getTime() - b.getTime())[
			Math.round(startDates.length * 0.5)
		];
		this._lastDate = endDates.sort((a, b) => a.getTime() - b.getTime())[
			Math.round(endDates.length * 0.5)
		];
	}

	private convertEPG(epg: ITVHEpgEvent) {
		epg.startDate = new Date(epg.start * 1000).toISOString();
		epg.stopDate = new Date(epg.stop * 1000).toISOString();
		epg.widescreen = toBool(epg.widescreen);
		epg.subtitled = toBool(epg.subtitled);
		epg.channel = this._channels.get(epg.channelUuid);
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
				}
			});
		}
	}
	public storeAll(path = './static/cache') {
		if (fs.existsSync(path)) {
			const data: FSCache = {
				channelTags: Object.fromEntries(this._channelTags),
				channels: Object.fromEntries(this._channels),
				contentTypes: Object.fromEntries(this._contentTypes),
				epg: Object.fromEntries(this._epg),
				epgByChannel: Object.fromEntries(this._epgByChannel),
				firstDate: new Date(this._firstDate),
				lastDate: new Date(this._lastDate),
				lastUpdate: new Date(this._lastUpdate)
			};
			fs.writeFileSync(path + '/cache.json', JSON.stringify(data, null, 2));
		}
	}

	public async loadAll(clear = false) {
		const tvhClient = createTVHClient()
		const channels = await tvhClient.getChannelGrid();
		const channelTags = await tvhClient.getChannelTags();
		const contentTypes = await tvhClient.getContentTypes();

		// TODO: Create better handling of big data
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
			const tags = [];
			for (const tag of channel.tags) {
				if (this._channelTags.has(tag)) {
					tags.push(this._channelTags.get(tag));
				}
			}
			// Convert to DTO and store
			channel.tags = tags;
			this._channels.set(channel.uuid, channel);
		}

		// EPG
		// ------------------------

		for (const epg of epgs) {
			this.convertEPG(epg);
			this.registerEvent(epg);
		}

		this._lastUpdate = new Date();
		this.calcDateRanges();
		this._epgSorted = Array.from(this._epg.values()).sort((a, b) => {
			return a.start - b.start;
		});

		this.storeAll();
	}

	public async reloadAll(retryTime = 1) {
		try {
			await this.loadAll(true);
		} catch (error) {
			console.error(error); // from creation or business logic
			console.log('Retry !!');
			setTimeout(() => this.reloadAll(retryTime), 1000 * 60 * retryTime);
		}
	}

	public async updateAll() {
		// TODO: Try to add new and change existing, bbut keep the old one to cuttof
		this.clear();
		await this.loadAll();
	}
	public searchEventsByChannel(
		channelUuid: string,
		start: Date,
		stop: Date = undefined
	): Array<ITVHEpgEvent> {
		const ch = this.epgByChannel.get(channelUuid);
		if (ch === undefined) return [];
		else {
			const res: ITVHEpgEvent[] = [];
			for (const epg of ch) {
				if (new Date(epg.startDate) >= start || new Date(epg.stopDate) >= start) {
					if (stop === undefined || new Date(epg.startDate) < stop) {
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
	console.log('preload Started');
	// preload cache
	const loading = cache.loadAll(true);
	loading
		.then(() => {
			console.log(`Preload Finished `);
			setInterval(() => cache.reloadAll(retryTime), 1000 * 60 * reloadTime);
		})
		.catch((error) => {
			console.error(error);
			console.error('Initial load failed.');
			if (retries > 0) {
				console.error('Retry scheduled in ' + retryTime + '  minutes!');
				setTimeout(
					() => initCache(cache, reloadTime, retryTime, retries - 1),
					1000 * 60 * retryTime
				);
			}
		});
}
