import type { RequestHandlerOutput } from "@sveltejs/kit";

/** @type {import('./').RequestHandler} */
export async function get() :Promise<RequestHandlerOutput>{

      return {
        body: { serviceHealth:"OK",
                serviceUp:true
        }
      };
  }
