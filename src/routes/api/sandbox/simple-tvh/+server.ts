
import { json } from '@sveltejs/kit';

import {httpErr404, SearchRange} from "$lib/server/ApiHelper"

import {tvhCache} from "$lib/server/tvh/tvh-cache"

/** @type {import('@sveltejs/kit').RequestHandler<{
 * }>} */
export function GET({ params,url }:{params:Record<string,string>,url:URL}) {

    const body:Record<string,unknown> = {}
    body["health"]="OK"
    body["cache"]=tvhCache.status

    return json(body);
}
