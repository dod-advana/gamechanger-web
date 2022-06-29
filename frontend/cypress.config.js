const { defineConfig } = require('cypress');

module.exports = defineConfig({
	chromeWebSecurity: false,
	viewportHeight: 1080,
	viewportWidth: 1920,
	component: {
		devServer: {
			framework: 'create-react-app',
			bundler: 'webpack',
		},
	},
	e2e: {
		excludeSpecPattern: 'cypress/e2e/examples/**/*.cy.js',
	},
	reporter: 'mochawesome',
	reporterOptions: {
		reportDir: 'cypress/results',
		overwrite: false,
		html: false,
		json: true,
	},
});
