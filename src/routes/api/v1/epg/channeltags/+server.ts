import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ locals }) => {
	const tags = locals.db.channelTags;
	const body: Record<string, unknown> = {};

	body['tags'] = tags;
	return json(body);
};
