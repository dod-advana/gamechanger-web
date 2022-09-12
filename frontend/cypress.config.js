const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
	chromeWebSecurity: false,
	viewportHeight: 1080,
	viewportWidth: 1920,
	defaultCommandTimeout: 15000,
	component: {
		devServer: {
			framework: 'create-react-app',
			bundler: 'webpack',
		},
	},
	e2e: {
		excludeSpecPattern: 'cypress/e2e/examples/**/*.cy.js',
		setupNodeEvents(on, config) {
			on('task', {
				getFiles(folderName) {
					return new Promise((resolve, reject) => {
						fs.readdir(folderName, (err, files) => {
							if (err) {
								return reject(err);
							}

							resolve(files);
						});
					});
				},
				deleteFolder(folderName) {
					console.log('clearing folder %s', folderName);

					return new Promise((resolve, reject) => {
						fs.readdir(folderName, (err, files) => {
							if (err) throw err;

							for (const file of files) {
								fs.unlink(path.join(folderName, file), (err) => {
									if (err) throw err;
								});
							}
						});
						resolve(true);
					});
				},
			});
		},
	},
	reporter: 'mochawesome',
	reporterOptions: {
		reportDir: 'cypress/results',
		overwrite: false,
		html: false,
		json: true,
	},
	retries: {
		runMode: 3,
		openMode: 0,
	},
});
