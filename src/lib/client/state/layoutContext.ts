
// Some Global Layout Context definition, kept here to allow override in sublayouts and storybook while Maintaining Type Safety



import {getContext,setContext} from "svelte";
import type { MediaResult } from "$lib/client/utils/mediaquery";
import type { Writable } from "svelte/store";


export const CTX_MEDIA_STORE="mediaStore";
export const CTX_THEME_DARK_STORE="themeDarkStore";

export function setMediaContext(media:Writable<MediaResult>){
    setContext(CTX_MEDIA_STORE,media)
}

export function getMediaContext(){
    const media = getContext<Writable<MediaResult>>(CTX_MEDIA_STORE)
    if (typeof media !== 'undefined') {
        return media;
    } else{
        throw new Error("Media Context can not be retrieved before being set");
    }
}

export function  setUIDarkContext(dark:Writable<boolean>){
    setContext(CTX_THEME_DARK_STORE,dark);
}
export function getUIDarkContext(){
    const dark = getContext<Writable<boolean>>(CTX_THEME_DARK_STORE)
    if (typeof dark !== 'undefined') {
        return dark;
    } else{
        throw new Error(CTX_THEME_DARK_STORE+ ": Context can not be retrieved before being set");
    }
}
