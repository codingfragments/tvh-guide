// Types used to communicate

export interface ServerStatus {
	firstDate: Date;
	lastDate: Date;
	lastUpdate: Date;

	numEvents: number;
	numChannels: number;
	cacheUUID: string;
}
