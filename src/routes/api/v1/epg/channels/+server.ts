import { json } from '@sveltejs/kit';

import { SearchRange} from "$lib/server/ApiHelper"

import {tvhCache} from "$lib/server/tvh/tvh-cache"
import type { ITVHChannel } from "$lib/types/epg-interfaces";


/** @type {import('./$types').RequestHandler} */
export function GET({ url }:{url:URL}) {

    const range=new SearchRange<ITVHChannel>()

    range.fromUrl(url);

    let channels = Array.from(tvhCache.channels.values())
    channels = channels.sort((c1,c2)=>{return c1.number-c2.number})

    channels = range.filter(channels)
    const body:Record<string,unknown>  = {}
    range.fillResponseInfo(body,tvhCache.channels.size);

    body["channels"]=channels
    return json(body);
}