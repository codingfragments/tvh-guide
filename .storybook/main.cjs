const { mergeConfig } = require('vite');
const path = require('path');
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
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: [
		'@storybook/addon-links',
		'@storybook/addon-essentials',
		'@storybook/addon-interactions',
		'@storybook/addon-docs'

		// BROKEN from SB7 will use workarround in the meantime
		// 'storybook-dark-mode'
	],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},
	docs: {
		autodocs: 'tag'
	}
};
