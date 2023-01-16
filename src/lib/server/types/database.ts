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
	init(): Promise<void>;
}

export interface EPGDatastoreFilter {
	// Will Filter for events that start before to Date AND end after from Date, which will include partial played events
	dateRange?: { from: Date; to: Date };

	// this will exclude any event that doesn't have at least on given values in epg.genre[]
	epgGenre?: string[];

	// This will search for channel Number OR UUID (if multiple inputs are given, at least one needs to fit)
	channel?: string[];
}
