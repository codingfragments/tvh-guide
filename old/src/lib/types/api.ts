// Types used to communicate

export interface ApiResultHealth {
	serviceHealth: string;
	serviceUp: boolean;
	cache: ServerStatus;
	memory: object;
}
export interface ServerStatus {
	firstDate?: Date;
	lastDate?: Date;
	lastUpdate?: Date;
	numEvents: number;
	numChannels: number;
	cacheUUID: string;
}

export interface ApiResultStats {
	first: number;
	page: number;
	maxPage: number;
	results: number;
}
