
const preprocess = require('svelte-preprocess');
const { mergeConfig } = require('vite');

const path = require('path');

module.exports = {
  async viteFinal(config, { configType }) {
    // return the customized config
    return mergeConfig(config, {
      // customize the Vite config here
      resolve: {
        alias:{
          '$lib': path.resolve(__dirname, '../src/lib'),
          '$components': path.resolve(__dirname, '../src/lib/components')
        }
      },
    });
  },
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx|svelte)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    '@storybook/addon-postcss',

  ],
  "framework": "@storybook/svelte",
  "core": {
    "builder": "@storybook/builder-vite"
  },
  "svelteOptions": {
    "preprocess": preprocess(),
  },
  "features": {
    "storyStoreV7": false
  }
}