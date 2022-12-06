import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	build: {
		sourcemap: true
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
	// resolve: {
	// 	alias: {
	// 		$lib: path.resolve('./src/lib'),
	// 		$components: path.resolve('./src/lib/components')
	// 	}
	// }
};

export default config;
