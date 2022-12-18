import { apiGetEvent } from '$lib/apiWrapper';
import type { ITVHEpgEvent } from '$lib/types/epg-interfaces';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const result = await apiGetEvent(fetch, params.eventId);
	if (result.status >= 300) {
		throw error(result.status, result.statusText);
	}
	const jsonResults: ITVHEpgEvent = (await result.json()).event;
	return {
		event: jsonResults
	};
};
