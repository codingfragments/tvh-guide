import type { ITVHChannel, ITVHEpgEvent, ITVHTag } from "$lib/types/epg-interfaces";
import { TVHeadendClient } from "$lib/server/tvh/tvheadend-client";
import { serverCfg } from "$lib/server/globals";


import type { RequestHandlerOutput } from "@sveltejs/kit";

const tvhClient = new TVHeadendClient(serverCfg.tvheadend.host,
    serverCfg.tvheadend.port,
    serverCfg.tvheadend.username,
    serverCfg.tvheadend.password);
console.log("tvh")

/** @type {import('./').RequestHandler} */
export async function get() :Promise<RequestHandlerOutput>{
    const ctags = await tvhClient.getChannelTags(10);
    const channels = await tvhClient.getChannelGrid(10);
    const epg = await tvhClient.getEpgGrid(10);
    const types = await tvhClient.getContentTypes()

    const body = {}
    body["health"]="OK"
    body["types"]=types.entries;
    body["ctags"]=ctags.entries;
    body["channels"]=channels.entries;
    body["epg"]=epg.entries

    return {
      body: body
    };
}
