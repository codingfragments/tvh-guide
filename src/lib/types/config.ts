export interface TVHeadSettings {
	host: string;
	port: number;
	username: string;
	password: string;
}

export interface UISettings {
	piconsBaseUrl: string;
	showChannelNumbers: boolean;
	themeLight: string;
	themeDark: string;
	dateLong: string;
	dateShort: string;
	timeLong: string;
	timeShort: string;
}

export interface ServerSettings {
	tvheadend: TVHeadSettings;
}
export interface Settings {
	server: ServerSettings;
	ui: UISettings;
}

export const baseConfig = `{
"tvheadend": {
    "host": "",
    "port":9981,
        "username": "",
        "password": ""
},
"picons": {
    "base_url": "https://codingfragments.github.io/tv-epg-picon.github.io/picons/"
}

}`;
