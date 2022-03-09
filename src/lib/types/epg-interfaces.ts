
export interface ITVHSearchBase {
    type: string;
    field: string;
}
export class ITVHStringSearch implements ITVHSearchBase {
    public type = "string";
    public constructor(public field: string, public value: string) { }
}
export class ITVHNumberSearch implements ITVHSearchBase {
    public type = "numeric";
    public intsplit: string
    public value: string;
    public constructor(public field: string, public comparison: "lt" | "gt" | "eq", val: number, split = 1000000) {
        // this.value;
        this.intsplit = String(Math.floor(split));
        this.value = String(Math.floor(val) * Math.floor(split));
    }
}


export interface ITVHResponseBase {
    total: number
    totalCount: number
}
export interface ITVHGeneric extends ITVHResponseBase {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entries: any[]
}
export interface ITVHResponse<T> extends ITVHResponseBase {
    entries: T[]
}

type TVHUuid = string;

export interface ITVHChannel {
    autoname: boolean;
    bouquet: string;
    dvr_pre_time: number
    dvr_pst_time: number
    enabled: boolean;
    epg_running: number;
    epgauto: boolean;
    epggrab: TVHUuid[];
    icon: string;
    icon_public_url: string;
    name: string;
    number: number;
    services: TVHUuid[];
    tags: TVHUuid[];
    uuid: TVHUuid;
}



export interface ITVHEpgEvent {
    ageRating: string;
    channelIcon: string;
    channelName: string;
    channelNumber: string;
    channelUuid: string;
    description: string;
    dvrState: string;
    dvrUuid: string;
    episodeId: string;
    episodeNumber: number;
    episodeOnscreen: string;
    eventId: string;
    genre: string[];
    hd: number;
    image: string;
    nextEventId: string;
    seasonNumber: number;
    starRating: string;
    start: number;
    stop: number;
    subtitle: string;
    subtitled: boolean;
    summary: string;
    title: string;
    widescreen: boolean;
}


export interface ITVHTag {
    key: string;
    val: string;
}