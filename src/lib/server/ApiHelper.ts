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

import anylogger from 'anylogger';
import type { ApiResultStats } from '$lib/types/api';
const LOG = anylogger('apiHelper');

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
