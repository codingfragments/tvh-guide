export interface TVHeadSettings {
	host: string;
	port: number;
	username: string;
	password: string;
}

export interface PiconSettings {
	base_url: string;
}
export interface ThemeSettings {
	light: string;
	dark: string;
}
export interface UISettings {
	picons: PiconSettings;
	showChannelNumbers: boolean;
	collapsed: boolean;
	theme: ThemeSettings;
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
