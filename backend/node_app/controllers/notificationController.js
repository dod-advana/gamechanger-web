const NOTIFICATIONS = require('../models').notifications;
const LOGGER = require('../lib/logger');

class NotificationController {

	constructor(opts = {}) {
		const {
			logger = LOGGER,
			notifications = NOTIFICATIONS,
		} = opts;

		this.logger = logger;
		this.notifications = notifications;

		this.getNotifications = this.getNotifications.bind(this);
		this.createNotification = this.createNotification.bind(this);
		this.deleteNotification = this.deleteNotification.bind(this);
		this.editNotificationActive = this.editNotificationActive.bind(this);
	}

	async getNotifications(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const { project_name = 'gamechanger' } = req.body;
			const notifications = await this.notifications.findAll({ where: { project_name } });
			res.status(200).send(notifications);

		} catch (err) {
			this.logger.error(err, 'Y3GSXTM', userId);
			res.status(500).send('Error retrieving notifications list');
		}
	}

	async createNotification(req, res) {
		let userId = 'webapp_unknown';
		try {
			const { body } = req;
			// allow project name to be set for clone specific problems
			const { project_name = 'gamechanger' } = body;

			userId = req.get('SSL_CLIENT_S_DN_CN');
			// use body. syntax to throw error if field not provided in body
			const created = await this.notifications.create({
				project_name,
				level: body.level,
				message: body.message,
				active: body.active
			});

			res.status(200).send(created);

		} catch (err) {
			this.logger.error(err, 'OYZAUNT', userId);
			res.status(500).send(`Error creating notification: ${err.message}`);
		}
	}

	async deleteNotification(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const { id } = req.body;

			const deleted = this.notifications.destroy({
				where: {
					id
				}
			});

			res.status(200).send(deleted);

		} catch (err) {
			this.logger.error(err, 'TD78YZ9', userId);
			res.status(500).send('Error deleting notification');
		}
	}

	async editNotificationActive(req, res) {
		let userId = 'webapp_unknown';
		try {
			userId = req.get('SSL_CLIENT_S_DN_CN');
			const { id, active } = req.body;

			const edited = this.notifications.update(
				{
					active
				},
				{
					where: {
						id
					}
				}
			);

			res.status(200).send(edited);

		} catch (err) {
			this.logger.error(err, 'Tx28Yo9', userId);
			res.status(500).send('Error updating notification');
		}
	}
}

module.exports.NotificationController = NotificationController;
