export interface ITVHSearchBase {
	type: string;
	field: string;
}
export class ITVHStringSearch implements ITVHSearchBase {
	public type = 'string';
	public constructor(public field: string, public value: string) {}
}
export class ITVHNumberSearch implements ITVHSearchBase {
	public type = 'numeric';
	public intsplit: string;
	public value: string;
	public constructor(
		public field: string,
		public comparison: 'lt' | 'gt' | 'eq',
		val: number,
		split = 1000000
	) {
		// this.value;
		this.intsplit = String(Math.floor(split));
		this.value = String(Math.floor(val) * Math.floor(split));
	}
}

export interface ITVHResponseBase {
	total: number;
	totalCount: number;
}
export interface ITVHGeneric extends ITVHResponseBase {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	entries: any[];
}
export interface ITVHResponse<T> extends ITVHResponseBase {
	entries: T[];
}

type TVHUuid = string;

export interface ITVHChannelTag {
	uuid: string;
	name: string;
}

export interface ITVHGenre {
	name: string;
	tvhIds: number[];
}
export interface ITVHChannel {
	autoname: boolean;
	bouquet: string;
	dvr_pre_time: number;
	dvr_pst_time: number;
	enabled: boolean;
	epg_running: number;
	epgauto: boolean;
	epggrab: TVHUuid[];
	icon: string;
	icon_public_url: string;
	name: string;
	number: number;
	epglimit?: number;
	remote_timeshift?: boolean;
	services: TVHUuid[];
	tags: TVHUuid[];
	uuid: TVHUuid;
}

export interface ITVHEpgEvent {
	stopDate: string;
	startDate: string;
	nextEventUuid?: string;
	prevEventUuid?: string; //TODO need to be chained after load
	uuid: string;
	ageRating?: string;
	channelIcon: string;
	channelName: string;
	channelNumber: string;
	channelUuid: string;
	description: string;
	dvrState?: string;
	dvrUuid?: string;
	episodeId?: string;
	episodeNumber?: number;
	episodeOnscreen?: string;
	eventId: number;
	genre: string[];
	hd?: number;
	image: string;
	nextEventId: number;
	seasonNumber?: number;
	starRating?: string;
	start: number;
	stop: number;
	subtitle?: string;
	channel: ITVHChannel;
	subtitled: boolean;
	summary?: string;
	title: string;
	widescreen: boolean;
	copyright_year?: number;
}

export interface ITVHTag {
	key: string;
	val: string;
}
