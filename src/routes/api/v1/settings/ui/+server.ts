import { error } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import {uiCfg} from '$lib/server/globals'

/** @type {import('./$types').RequestHandler} */
export function GET({ }) {
      const resp = new Response()
      resp.json
      return json(uiCfg);
  }
