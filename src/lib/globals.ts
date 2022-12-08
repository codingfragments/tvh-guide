import { writable, type Writable } from 'svelte/store';
import type { UISettings } from '$lib/types/config';

export const uiCfg: Writable<UISettings> = writable();
export const uiThemeDark = writable(false);
