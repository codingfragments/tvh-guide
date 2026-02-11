import { json } from '@sveltejs/kit';

import { httpErr404 } from '$lib/server/ApiHelper';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ locals, params }) => {
	const channelId = params.channelId;
	if (!(await locals.db.hasChannel(channelId))) {
		throw httpErr404('EPG Event not found', params);
	} else {
		const body: Record<string, unknown> = {};
		body['channel'] = await locals.db.getChannel(channelId);
		return json(body);
	}
};
