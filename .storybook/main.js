const { mergeConfig } = require('vite');
const path = require('path');
const preprocess = require('svelte-preprocess');

module.exports = {
	async viteFinal(config, { configType }) {
		// const sveltePluginsWithoutKit = config.plugins[0].filter(
		// 	(plugin) => plugin.name !== 'vite-plugin-svelte-kit'
		// );
		// return the customized config
		const finalConfig = mergeConfig(config, {
			// customize the Vite config here
			resolve: {
				alias: {
					$lib: path.resolve(__dirname, '../src/lib'),
					$stories: path.resolve(__dirname, '../src/stories')
				}
			}
		});
		// finalConfig.plugins[0] = sveltePluginsWithoutKit;
		// console.log(finalConfig);
		return finalConfig;
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
