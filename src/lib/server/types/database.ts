//
// DB global types for use in defining interfaces and services
// ==============================================================

import type { ServerStatus } from '$lib/types/api';
import type { ITVHChannel, ITVHChannelTag, ITVHEpgEvent, ITVHGenre } from '$lib/types/epg-interfaces';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DataStore {
	get status(): ServerStatus;

	get channels(): ITVHChannel[];
	hasChannel(channelId: string): boolean;
	getChannel(channelId: string): ITVHChannel | undefined;
	get channelTags(): ITVHChannelTag[];
	findChannelsByTag(tag: ITVHChannelTag): ITVHChannel[];

	get epgSorted(): ITVHEpgEvent[];
	hasEvent(epgEventId: string): boolean;
	getEvent(epgEventId: string): ITVHEpgEvent | undefined;

	get genres(): ITVHGenre[];

	search(query: string): ITVHEpgEvent[];
}
