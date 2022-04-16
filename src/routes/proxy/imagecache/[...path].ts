import { createTVHClient } from "$lib/server/tvh/tvheadend-client";
import type { RequestHandlerOutput } from "@sveltejs/kit";
import type { AxiosError } from "axios";


/** @type {import('./').RequestHandler} */
export async function get({params}) :Promise<RequestHandlerOutput>{
    const tvhClient = createTVHClient()
    try {
        const response = await tvhClient.getImage(params.path)
        const bResp = new Uint8Array(response);
         return {
            body:bResp
        }
    } catch( error ){
        const err:AxiosError=error;
        console.error("Error")
        console.error(err.response.status)
        return {body:{}}
    }

}
