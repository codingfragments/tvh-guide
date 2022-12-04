import type { UISettings } from '$lib/types/config';

/** @type {import('./$types').LayoutServerLoad} */
export async function load( {fetch}) {
  return {
    uiCfg: <UISettings> await (await fetch("/api/v1/settings/ui")).json()
  };
}