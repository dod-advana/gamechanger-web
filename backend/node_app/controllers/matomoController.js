const MATOMO_STATUS = require('../models').matomo_status;
const LOGGER = require('../lib/logger');

class MatomoController {
	constructor(opts = {}) {
		const {
			matomoStatus = MATOMO_STATUS,
			logger = LOGGER
		} = opts;

		this.matomoStatus = matomoStatus;
		this.logger = logger;

		this.getAppMatomoStatus = this.getAppMatomoStatus.bind(this);
		this.setAppMatomoStatus = this.setAppMatomoStatus.bind(this);
		this.getUserMatomoStatus = this.getUserMatomoStatus.bind(this);
		this.setUserMatomoStatus = this.setUserMatomoStatus.bind(this);
	}

	async getAppMatomoStatus(req, res) {
		const userID = req.get('SSL_CLIENT_S_DN_CN');

		try {

			const data = await this.matomoStatus.findOne({
				where: {
					userID: 'advana' // the 'userID' of the app-wide matomo
				}
			});

			if (data === null) {
				this.matomoStatus.create({ userID: 'advana', tracking: true });
				res.status(200).send(true);
			} else {
				res.status(200).send(data.dataValues.tracking);
			}

			return data;

		} catch (err) {
			this.logger.error(err, 'gcNHADT0R', userID);
			res.status(500).send(err);
			return err;
		}
	}

	async setAppMatomoStatus(req, res) {
		const userID = req.get('SSL_CLIENT_S_DN_CN');

		try {

			const { tracking } = req.body;

			const data = await this.matomoStatus.findOne({
				where: {
					userID: 'advana'
				}
			});

			if (data === null) {
				this.matomoStatus.create({ userID: 'advana', tracking: true });
			} else {
				this.matomoStatus.update({
					tracking
				},
				{
					where: {
						userID: 'advana'
					}
				}
				);
			}

			res.status(200).send();
			return data;
		} catch (err) {
			this.logger.error(err, 'gcQGSIVKQ', userID);
			res.status(500).send(err);
			return err;
		}
	}

	async getUserMatomoStatus(req, res) {
		const userID = req.get('SSL_CLIENT_S_DN_CN');
		try {
			const data = await this.matomoStatus.findOne({
				where: {
					userID
				}
			});

			if (data === null) {
				res.status(200).send(true);
			} else {
				res.status(200).send(false);
			}

			return data;
		} catch (err) {
			this.logger.error(err, 'gc4XFH9TA', userID);
			res.status(500).send(err);
			return err;
		}
	}

	async setUserMatomoStatus(req, res) {
		const userID = req.get('SSL_CLIENT_S_DN_CN');

		try {
			const { tracking } = req.body;

			const data = await this.matomoStatus.findOne({
				where: {
					userID
				}
			});

			if (data === null) {
				if (!tracking) {
					this.matomoStatus.create({
						userID,
						tracking: false
					});
				}
			} else {
				if (tracking) {
					this.matomoStatus.destroy({
						where: {
							userID
						}
					});
				}
			}

			res.status(200).send(tracking);

		} catch (err) {
			this.logger.error(err, 'gc4XFH9TA', userID);
			res.status(500).send(err);
			return err;
		}
	}
}

module.exports = MatomoController;
