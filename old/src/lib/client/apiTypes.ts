import type { ITVHChannel, ITVHEpgEvent } from '$lib/types/epg-interfaces';

export interface APIResultStats {
	first: number;
	page: number;
	maxPage: number;
	results: number;
}

export interface APIGetChannelsResults {
	query: APIResultStats;
	channels: ITVHChannel[];
}

export interface APIGetChannelResults {
	channel: ITVHChannel;
}

export interface APIGetEventsResults {
	query: APIResultStats;
	events: ITVHEpgEvent[];
}
export interface APIGetEventResults {
	event: ITVHEpgEvent;
}

export interface APIGetChannelEventsResults extends APIGetEventsResults {
	channel: ITVHChannel;
}
