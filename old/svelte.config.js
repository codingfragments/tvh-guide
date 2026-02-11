import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	onwarn: (warning, handler) => {
		if (warning.code.startsWith('a11y-')) {
			return;
		}
		handler(warning);
	},

	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors

	preprocess: preprocess({
		sourceMap: true
	}),

	kit: {
		adapter: adapter({ out: 'dist' })
	}
};

export default config;
