import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ locals }) => {
	const tags = locals.db.genres;
	return json({ tags: tags });
};
