import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

import path from "path"

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// alias handling like described https://codingcat.dev/tutorial/integrating-storybook-with-sveltekit
	// for more information about preprocessors
	vite: {
		resolve: {
		  alias: {
			$lib: path.resolve('./src/lib'),
			$components: path.resolve('./src/lib/components'),
		  },
		},
	  },
	preprocess: preprocess(),

	kit: {
		adapter: adapter({ out: 'build' })
	}
};

export default config;
