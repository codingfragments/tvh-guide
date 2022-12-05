import { writable, type Writable } from 'svelte/store';
import type { UISettings } from '$lib/types/config';

import 'anylogger-console';

export const uiCfg: Writable<UISettings> = writable();
export const uiThemeDark = writable(false);
