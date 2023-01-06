import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ locals }) => {
	const body: Record<string, unknown> = {};
	body['health'] = 'OK';
	body['cache'] = await locals.db.getStatus();

	return json(body);
};
