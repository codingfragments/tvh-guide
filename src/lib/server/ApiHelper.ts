import type { ITVHChannel, ITVHEpgEvent } from "$lib/types/epg-interfaces"

import type {TVHCache} from "$lib/server/tvh/tvh-cache"

export class EPGFilter{
    addGenreTag(tag: string) {
        this.genres.push(tag)
    }
    addChannel(channel: ITVHChannel) {
        this.channels.push(channel)
    }
    public constructor(private tvh:TVHCache,
         private channels:ITVHChannel[]=[], private genres:string[]=[], private fromDate:Date=null,private toDate:Date=null,
         private nowDate:Date=null){
    }

    public filter (epg:ITVHEpgEvent[]=null){
        if (epg == null){
            epg = this.tvh.epgSorted;
        }
        if (this.channels.length >0){
            epg= epg.filter( (event)=>{
                const cid = event.channel.uuid;
                return this.channels.find((ch)=>{return ch.uuid==cid}) != null
            })
        }

        if (this.genres.length >0) {
            epg = epg.filter( (event)=>{
                if (!event.genre) return false;
                return event.genre.find((t)=>{
                    if (this.genres.includes(t.toLowerCase())){
                        return true;
                    }
                }) != null
            })
        }
        epg = epg.filter( (event)=>{
            let erg=true;
            erg = this.fromDate ? new Date(event.startDate)>= this.fromDate : erg;
            erg = this.toDate ? new Date(event.startDate)<= this.toDate:erg;
            erg = this.nowDate ? (new Date(event.stopDate)>this.nowDate && new Date(event.startDate)<=this.nowDate):erg;

            return erg;
        })
        return epg;
    }

    public fromUrl(url:URL){
        const params = url.searchParams;

        // DATE Filter
        if (params.has("filterFrom")) {
            try{
                this.fromDate = new Date(params.get('filterFrom'));
            } catch{
                console.error("Wrong conversion, keep default");
            }
        }
        if (params.has("filterTo")) {
            try{
                this.toDate = new Date(params.get('filterTo'));
            } catch{
                console.error("Wrong conversion, keep default");
            }
        }
        if (params.has("filterAt")) {
            try{
                this.nowDate = new Date(params.get('filterAt'));
            } catch{
                console.error("Wrong conversion, keep default");
            }
        }

        // TODO allow Genre filter from URL
        // TODO allow Channel filter from URL
        // TODO allow ChannelTag Filter from URL


    }


}
export  class SearchRange<T> {
    filterMap(elements: Map<string, T>) {
        return this.filter(Array.from(elements.values()))
    }
    filterIterator (elements:IterableIterator<T>){
        return this.filter(Array.from(elements))
    }

    filter(epgs: T[]) {
      return epgs.slice(this.first,this.last)
    }
    fillResponseInfo(body = {}, totalLength: number) {
        body["first"]=this.first
        body["page"]=this.page
        body["maxPage"]=Math.ceil(totalLength/this.range)-1
        body["results"]=totalLength
        }
    constructor(public page = 0, public range=10){

    }


    public get first()  {
        return this.page*this.range
    }
    public get last()  {
        return ((this.page+1)*this.range)
    }

    public fromUrl(url:URL){
        if (url.searchParams.has("page")) {
            try{
                this.page = parseInt(url.searchParams.get("page"))
            } catch{
                console.error("Wrong conversion, keep default")
            }
        }
        if (url.searchParams.has("range")) {
            try{
                this.range = parseInt(url.searchParams.get("range"))
            } catch{
                console.error("Wrong conversion, keep default")
            }
        }

    }



}

export function httpErr404(msg="Not found",request={}){
    return {
        status:404,
        body:{
            msg:msg,
            req:request
        }
    }
}


export function epgEventsQuery(filter: EPGFilter, url: URL, body:Record<string,unknown>,epgs:ITVHEpgEvent[]) {
    const range = new SearchRange<ITVHEpgEvent>();

    filter.fromUrl(url);
    range.fromUrl(url);

    const filteredEvents = filter.filter(epgs);
    const events = range.filter(filteredEvents);
    range.fillResponseInfo(body, filteredEvents.length);
    body["events"] = events;
}
