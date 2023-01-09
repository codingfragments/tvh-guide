import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ locals }) => {
	const resp = new Response();
	resp.json;
	return json({
		serviceHealth: 'OK',
		serviceUp: true,
		cache: await locals.db.getStatus(),
		memory: process.memoryUsage()
	});
};
