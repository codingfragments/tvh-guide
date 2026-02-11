export interface FSCache {
	currentDataVersion: number;
	channelTags: object;
	contentTypes: object;
	channels: object;
	epg: object;
	epgByChannel: object;
	firstDate: Date;
	lastDate: Date;
	lastUpdate: Date;
}
