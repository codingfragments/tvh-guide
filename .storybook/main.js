const { mergeConfig } = require('vite');
const path = require('path');
const preprocess = require('svelte-preprocess');

module.exports = {
	async viteFinal(config, { configType }) {
		// return the customized config
		return mergeConfig(config, {
			// customize the Vite config here
			resolve: {
				alias: {
					$lib: path.resolve(__dirname, '../src/lib'),
					$components: path.resolve(__dirname, '../src/lib/components')
				}
			}
		});
	},
	stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx|svelte)'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'storybook-dark-mode',
		'@storybook/addon-storysource',
		// '@storybook/addon-interactions',
		'@storybook/addon-svelte-csf',
		'@storybook/addon-docs'
		// {
		//   name: '@storybook/addon-docs',
		//   options: {
		//     sourceLoaderOptions: {
		//       injectStoryParameters: true,
		//     },
		//   },
		// },
	],
	framework: '@storybook/svelte',
	core: {
		builder: '@storybook/builder-vite'
	},
	svelteOptions: {
		// https://codingcat.dev/tutorial/integrating-storybook-with-sveltekit
		// Tutorial used
		preprocess: preprocess()
	},
	features: {
		storyStoreV7: false
	}
};
