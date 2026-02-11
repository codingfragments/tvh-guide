// Some Global Layout Context definition, kept here to allow override in sublayouts and storybook while Maintaining Type Safety

import { getContext, setContext } from 'svelte';
import type { MediaResult } from '$lib/client/utils/mediaquery';
import { readable, type Writable } from 'svelte/store';
import anylogger from 'anylogger';

export const CTX_MEDIA_STORE = 'mediaStore';
export const CTX_THEME_DARK_STORE = 'themeDarkStore';
const LOG = anylogger('HLP.context');

export function setMediaContext(media: Writable<MediaResult>) {
	setContext(CTX_MEDIA_STORE, media);
}

export function getMediaContext() {
	const media = getContext<Writable<MediaResult>>(CTX_MEDIA_STORE);
	if (typeof media !== 'undefined') {
		return media;
	} else {
		throw new Error('Media Context can not be retrieved before being set');
	}
}

export function setUIDarkContext(dark: Writable<boolean>) {
	setContext(CTX_THEME_DARK_STORE, dark);
}
export function getUIDarkContext() {
	const dark = getContext<Writable<boolean>>(CTX_THEME_DARK_STORE);
	if (typeof dark !== 'undefined') {
		return dark;
	} else {
		LOG.warn({
			msg: 'Tried to get CTX before being established, default to FALSE. CTX will be disconnected. ',
			func: 'getUIDarkContext'
		});
		return readable(false);
	}
}
