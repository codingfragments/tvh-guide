import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	use: {
		viewport: { width: 1280, height: 720 },
		headless: false
	},
	webServer: {
		command: 'npm run build && npm run preview -- -m testing',
		port: 4173
	},

	testDir: 'tests'
};

export default config;
