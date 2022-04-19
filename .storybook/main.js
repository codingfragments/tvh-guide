const path = require('path');
const sveltePreprocess = require('svelte-preprocess');

// integrate with sveltekit like https://codingcat.dev/tutorial/integrating-storybook-with-sveltekit
// enable support for typescript and svelte preprocessing https://github.com/storybookjs/storybook/issues/12754#issuecomment-708884287

module.exports = {
	webpackFinal: async (config) => {
		// https://github.com/storybookjs/storybook/issues/12754#issuecomment-708884287
		// const svelteLoader = config.module.rules.find(
		// 	(r) => r.loader && r.loader.includes('svelte-loader')
		// );
		// svelteLoader.options.preprocess = require('svelte-preprocess')({});
		// END Support for typescript
		// Note, this may be obsolete in upcomming versions regarding (https://github.com/storybookjs/storybook/issues/12754#issuecomment-808856923) and (https://github.com/storybookjs/storybook/tree/next/examples/svelte-kitchen-sink)

		config.module.rules.push({
			test: [/\.stories\.js$/, /index\.js$/],
			use: [require.resolve('@storybook/source-loader')],
			include: [path.resolve(__dirname, '../src')],
			enforce: 'pre'
		});
		config.resolve.alias = {
			...config.resolve.alias,
			$lib: path.resolve(__dirname, '../src/lib'),
			$components: path.resolve(__dirname, '../src/lib/components')
		};
		return config;
	},
	stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx|svelte)'],
	addons: [

		'@storybook/addon-links',
		'@storybook/addon-essentials',
    // '@storybook/addon-storysource',

		'@storybook/addon-svelte-csf',
		{
			// Integrate with tailwindcss FROM https://stackoverflow.com/questions/65495912/storybook-tailwind-how-should-i-add-tailwind-to-storybook
			name: '@storybook/addon-postcss',
			options: {
				cssLoaderOptions: {
					// When you have splitted your css over multiple files
					// and use @import('./other-styles.css')
					importLoaders: 1
				},
				postcssLoaderOptions: {
					// When using postCSS 8
					implementation: require('postcss')
				}
			}
		}
	],
	framework: '@storybook/svelte',
	// svelteOptions: {
	// 	preprocess: import('../svelte.config.js').preprocess
	// }
	svelteOptions: {
		preprocess: sveltePreprocess()
	}
};
