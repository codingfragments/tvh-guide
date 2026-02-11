import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ locals }) => {
	const tags = await locals.db.getChannelTags();
	const body: Record<string, unknown> = {};

	body['tags'] = tags;
	return json(body);
};
