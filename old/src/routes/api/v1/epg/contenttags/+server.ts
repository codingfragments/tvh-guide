import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ locals }) => {
	const tags = await locals.db.getGenres();
	return json({ tags: tags });
};
