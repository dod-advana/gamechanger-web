const nodemailer = require('nodemailer');
const LOGGER = require('@dod-advana/advana-logger');

class EmailUtility {
	constructor({ transportOptions, fromName, fromEmail }) {
		this.transportOptions = transportOptions;
		this.fromName = fromName;
		this.fromEmail = fromEmail;
		this.logger = LOGGER;
	}

	sendEmail(html, subject, recipientEmails, userEmail, attachments = null, userId) {
		return new Promise((resolve, reject) => {
			try {
				let transporter = nodemailer.createTransport(this.transportOptions);

				let mailOptions = {
					from: `"${this.fromName}" <${this.fromEmail}>`,
					to: recipientEmails,
					cc: userEmail,
					subject,
					html,
				};

				if (attachments) {
					mailOptions.attachments = attachments;
				}

				transporter.sendMail(mailOptions, (error, info) => {
					if (error) {
						this.logger.error(error, '2QO316278', userId);
						error.message = 'Sending contact message failed due to internal error.';
						reject({ error });
					} else {
						resolve({ message: 'Message successfully sent', info });
					}
				});
			} catch (err) {
				this.logger.error(err, '2QO3162', userId);
				reject({ error: { message: `Code: 2QO3162, ${err}` } });
			}
		});
	}
}

module.exports = EmailUtility;
