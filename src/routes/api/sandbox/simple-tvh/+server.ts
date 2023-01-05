import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ locals }) => {
	const body: Record<string, unknown> = {};
	body['health'] = 'OK';
	body['cache'] = locals.db.status;

	return json(body);
};
