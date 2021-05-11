const TUTORIAL_OVERLAYS = require('../models').tutorial_overlays;
const LOGGER = require('../lib/logger');

class TutorialOverlayController {
	constructor(opts = {}) {
		const {
			tutorialOverlays = TUTORIAL_OVERLAYS,
			logger = LOGGER,
		} = opts;

		this.tutorialOverlays = tutorialOverlays;
		this.logger = logger;

		// need to bind to have <this> in context, mostly for logger
		this.fetchTutorialOverlays = this.fetchTutorialOverlays.bind(this);
		this.saveTutorialOverlays = this.saveTutorialOverlays.bind(this);
	}

	async fetchTutorialOverlays(req, res) {
		const userId = req.get('SSL_CLIENT_S_DN_CN');
		try {
			const data = await this.tutorialOverlays.findAll();
			res.send(data);

			// for tests
			return data;
		} catch (err) {
			this.logger.error(err, 'TWQ2FBN', userId);
			res.status(500).send(err);
			return err;
		}
	}

	async saveTutorialOverlays(req, res) {
		const { appName, componentsList } = req.body;
		const userId = req.get('SSL_CLIENT_S_DN_CN');

		try {
			return this.tutorialOverlays.update(componentsList, {
				where: {
					app_name: appName
				}
			})
				.then((result) => {
					if (result[0] === 1) {
						res.status(200).send('Successfully updated tutorial');

						// for tests
						return 'Successfully updated tutorial';
					} else {
						res.status(400).send('Failed to update tutorial');
					}
				}).catch((err) => {
					console.log(err);
					return res.status(400).send(err);
				});
		} catch (err) {
			console.log(err);
			this.logger.error(err, 'JE2CXPV', userId);
			return res.status(500).send(err);
		};
	}
}

module.exports.TutorialOverlayController = TutorialOverlayController;
