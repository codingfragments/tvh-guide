import { error } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';


/** @type {import('./$types').RequestHandler} */
export function GET({ }) {
      const resp = new Response()
      resp.json
      return json({
            serviceHealth:"OK",
            serviceUp:true
        });
  }
