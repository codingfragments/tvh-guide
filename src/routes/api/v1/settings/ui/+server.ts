import { error } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { uiCfg } from '$lib/server/globals';

import type { RequestHandler } from './$types';
export const GET: RequestHandler = () => {
	const resp = new Response();
	resp.json;
	return json(uiCfg);
};
