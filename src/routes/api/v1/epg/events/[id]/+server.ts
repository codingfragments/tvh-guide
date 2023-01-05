import { json } from '@sveltejs/kit';

import { httpErr404 } from '$lib/server/ApiHelper';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ locals, params }) => {
	const epgid = params.id;

	if (!locals.db.hasEvent(epgid)) {
		throw httpErr404('EPG Event not found', params);
	} else {
		const body: Record<string, unknown> = {};
		body['event'] = locals.db.getEvent(epgid);
		return json(body);
	}
};
