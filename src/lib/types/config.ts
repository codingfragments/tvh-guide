
export interface TVHeadSettings {
    host: string;
    port: number;
    username: string;
    password: string;

}

export interface PiconSettings {
    base_url: string;
}
export interface UISettings {
    showChannelNumbers: boolean;
}

export interface Settings {
    tvheadend: TVHeadSettings;
    picons: PiconSettings
    ui: UISettings
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

}`
