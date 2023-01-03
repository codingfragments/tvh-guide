import type { APIGetChannelResults, APIGetChannelsResults } from '$lib/client/apiTypes';
import { apiGetChannels } from '$lib/client/apiWrapper';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const result = await apiGetChannels(fetch, url, { range: 1000 });
	if (result.status >= 300) {
		throw error(result.status, result.statusText);
	}
	const data: APIGetChannelsResults = await result.json();
	return { channels: data.channels };
};
