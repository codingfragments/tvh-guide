import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
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
