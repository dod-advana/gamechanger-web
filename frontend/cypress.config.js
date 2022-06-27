const { defineConfig } = require('cypress');

module.exports = defineConfig({
	chromeWebSecurity: false,
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
