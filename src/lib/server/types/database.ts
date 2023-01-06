//
// DB global types for use in defining interfaces and services
// ==============================================================

import type { ServerStatus } from '$lib/types/api';
import type { ITVHChannel, ITVHChannelTag, ITVHEpgEvent, ITVHGenre } from '$lib/types/epg-interfaces';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DataStore {
	getStatus(): Promise<ServerStatus>;

	getChannels(): Promise<ITVHChannel[]>;
	hasChannel(channelId: string): Promise<boolean>;
	getChannel(channelId: string): Promise<ITVHChannel | undefined>;
	getChannelTags(): Promise<ITVHChannelTag[]>;
	findChannelsByTag(tag: ITVHChannelTag): Promise<ITVHChannel[]>;

	getEpgSorted(): Promise<ITVHEpgEvent[]>;
	hasEvent(epgEventId: string): Promise<boolean>;
	getEvent(epgEventId: string): Promise<ITVHEpgEvent | undefined>;

	getGenres(): Promise<ITVHGenre[]>;

	search(query: string): Promise<ITVHEpgEvent[]>;
}
