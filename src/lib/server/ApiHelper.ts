import type { ITVHChannel, ITVHEpgEvent } from '$lib/types/epg-interfaces';
import { json, error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export function GET() {
	const resp = new Response();
	resp.json;
	return json({
		serviceHealth: 'OK',
		serviceUp: true
	});
}

import type { TVHCache } from '$lib/server/tvh/tvh-cache';

import anylogger from 'anylogger';
import type { ApiResultStats } from '$lib/types/api';
const LOG = anylogger('apiHelper');

export class EPGFilter {
	addGenreTag(tag: string) {
		this.genres.push(tag);
	}
	addChannel(channel: ITVHChannel) {
		this.channels.push(channel);
	}
	public constructor(
		private tvh: TVHCache,
		private channels: ITVHChannel[] = [],
		private genres: string[] = [],
		private fromDate: Date | undefined = undefined,
		private toDate: Date | undefined = undefined,
		private nowDate: Date | undefined = undefined
	) {}

	public filter(epg: ITVHEpgEvent[] | undefined = undefined) {
		if (epg == undefined) {
			epg = this.tvh.epgSorted;
		}
		if (this.channels.length > 0) {
			epg = epg.filter((event) => {
				const cid = event.channel.uuid;
				return (
					this.channels.find((ch) => {
						return ch.uuid == cid;
					}) != null
				);
			});
		}

		if (this.genres.length > 0) {
			epg = epg.filter((event) => {
				if (!event.genre) return false;
				return (
					event.genre.find((t) => {
						if (this.genres.includes(t.toLowerCase())) {
							return true;
						}
					}) != null
				);
			});
		}
		epg = epg.filter((event) => {
			let erg = true;
			// Date Filter only really works if both dates are given
			if (event.startDate !== undefined && event.stopDate !== undefined) {
				erg = this.fromDate ? new Date(event.stopDate) >= this.fromDate && erg : erg;
				erg = this.toDate ? new Date(event.startDate) <= this.toDate && erg : erg;
				erg = this.nowDate
					? new Date(event.stopDate) > this.nowDate && new Date(event.startDate) <= this.nowDate
					: erg;
			}
			return erg;
		});
		return epg;
	}

	private filterStats() {
		return { filterNow: this.nowDate, filterTo: this.toDate, filterFrom: this.fromDate };
	}
	public fromUrl(url: URL) {
		const params = url.searchParams;

		// DATE Filter
		if (params.has('filterFrom')) {
			try {
				this.fromDate = new Date(<string>params.get('filterFrom'));
			} catch {
				LOG.error('Wrong conversion, keep default');
			}
		}
		if (params.has('filterTo')) {
			try {
				this.toDate = new Date(<string>params.get('filterTo'));
			} catch {
				LOG.error('Wrong conversion, keep default');
			}
		}
		if (params.has('filterAt')) {
			try {
				this.nowDate = new Date(<string>params.get('filterAt'));
			} catch {
				LOG.error('Wrong conversion, keep default');
			}
		}

		LOG.debug({ msg: 'Filter Build', stats: this.filterStats() });
		// TODO allow Complex filter from URL (Genre,Channel,Channeltag,Channelgroup)
	}
}
export class SearchRange<T> {
	filterMap(elements: Map<string, T>) {
		return this.filter(Array.from(elements.values()));
	}
	filterIterator(elements: IterableIterator<T>) {
		return this.filter(Array.from(elements));
	}

	filter(epgs: T[]) {
		return epgs.slice(this.first, this.last);
	}
	fillResponseInfo(body: Record<string, unknown> = {}, totalLength: number) {
		const results: ApiResultStats = {
			first: this.first,
			page: this.page,
			maxPage: Math.ceil(totalLength / this.range) - 1,
			results: totalLength
		};
		body['query'] = results;
	}
	constructor(public page = 0, public range = 10) {}

	public get first() {
		return this.page * this.range;
	}
	public get last() {
		return (this.page + 1) * this.range;
	}

	public fromUrl(url: URL) {
		if (url.searchParams.has('page')) {
			try {
				this.page = parseInt(<string>url.searchParams.get('page'));
			} catch {
				LOG.error('Wrong conversion, keep default');
			}
		}
		if (url.searchParams.has('range')) {
			try {
				this.range = parseInt(<string>url.searchParams.get('range'));
			} catch {
				LOG.error('Wrong conversion, keep default');
			}
		}
	}
}

export function httpErr404(msg = 'Not found', request = {}) {
	const eBody = {
		msg: msg,
		req: request
	};
	return error(404, eBody as unknown as Error);
}

export function epgEventsQuery(
	filter: EPGFilter,
	url: URL,
	body: Record<string, unknown>,
	epgs: ITVHEpgEvent[]
) {
	const range = new SearchRange<ITVHEpgEvent>();

	filter.fromUrl(url);
	range.fromUrl(url);

	const filteredEvents = filter.filter(epgs);
	const events = range.filter(filteredEvents);
	range.fillResponseInfo(body, filteredEvents.length);
	body['events'] = events;
}
