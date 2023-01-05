import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ locals }) => {
	const resp = new Response();
	resp.json;
	return json({
		serviceHealth: 'OK',
		serviceUp: true,
		cache: locals.db.status
	});
};
