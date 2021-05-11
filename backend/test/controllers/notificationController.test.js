const assert = require('assert');
const { NotificationController } = require('../../node_app/controllers/notificationController');
const { constructorOptionsMock, AsyncRedisMock, reqMock, resMock } = require('../resources/testUtility');

describe('NotificationController', function () {

	describe('#getNotifications', () => {
		const notifications = [{
			id: 1,
			project_name: 'Test',
			level: 'Warning',
			message: 'This is a message',
			active: true
		}];

		const opts = {
			...constructorOptionsMock,
			notifications: {
				findAll(data) {
					const returnData = [];
					notifications.forEach(notification => {
						if (notification.project_name === data.where.project_name) {
							returnData.push(notification);
						}
					});
					return Promise.resolve(returnData);
				}
			}
		};

		it('should return all notifications', async () => {

			const target = new NotificationController(opts);

			const req = {
				...reqMock,
				body: {
					project_name: 'Test'
				}
			};

			let resCode;
			let resMsg;

			const res = {
				status(code){
					resCode = code;
					return this;
				},
				send(msg){
					resMsg = msg;
				}
			};

			await target.getNotifications(req, res);

			const expected = [{active: true, id: 1, level: 'Warning', message: 'This is a message', project_name: 'Test'}];
			assert.deepStrictEqual(resMsg, expected);

		});
	});

	describe('#createNotification', () => {
		const notifications = [];

		const opts = {
			...constructorOptionsMock,
			notifications: {
				create(data) {
					notifications.push({
						project_name: data.project_name,
						level: data.level,
						message: data.message,
						active: data.active
					});
					return Promise.resolve(true);
				}
			}
		};

		it('should return create a notification', async () => {

			const target = new NotificationController(opts);

			const req = {
				...reqMock,
				body: {
					project_name: 'Test',
					level: 'Warning',
					message: 'This is a message',
					active: true
				}
			};

			let resCode;
			let resMsg;

			const res = {
				status(code){
					resCode = code;
					return this;
				},
				send(msg){
					resMsg = msg;
				}
			};

			await target.createNotification(req, res);

			const expected = {active: true, level: 'Warning', message: 'This is a message', project_name: 'Test'};
			assert.deepStrictEqual(notifications[0], expected);

		});
	});

	describe('#deleteNotification', () => {
		const notifications = [{
			id: 1,
			project_name: 'Test',
			level: 'Warning',
			message: 'This is a message',
			active: true
		}];

		const opts = {
			...constructorOptionsMock,
			notifications: {
				destroy(data) {
					let tmpIndex = -1;
					notifications.forEach((notification, index) => {
						if (notification.id === data.where.id) {
							tmpIndex = index;
						}
					});
					notifications.splice(tmpIndex, 1);
					Promise.resolve(tmpIndex !== -1);
				}
			}
		};

		it('should delete a notification', async () => {

			const target = new NotificationController(opts);

			const req = {
				...reqMock,
				body: {
					id: 1
				}
			};

			let resCode;
			let resMsg;

			const res = {
				status(code){
					resCode = code;
					return this;
				},
				send(msg){
					resMsg = msg;
				}
			};

			await target.deleteNotification(req, res);

			const expected = [];
			assert.deepStrictEqual(notifications, expected);

		});
	});

	describe('#editNotificationActive', () => {
		const notifications = [{
			id: 1,
			project_name: 'Test',
			level: 'Warning',
			message: 'This is a message',
			active: true
		}];

		const opts = {
			...constructorOptionsMock,
			notifications: {
				update(data, where) {
					let tmpNotification;

					notifications.forEach(notification => {
						if (notification.id === where.where.id) {
							tmpNotification = notification;
						}
					});

					if (tmpNotification) {
						tmpNotification.active = data.active;
						return Promise.resolve(true);
					} else {
						return Promise.resolve('Fail');
					}
				}
			}
		};

		it('should delete a notification', async () => {

			const target = new NotificationController(opts);

			const req = {
				...reqMock,
				body: {
					id: 1,
					active: false
				}
			};

			let resCode;
			let resMsg;

			const res = {
				status(code){
					resCode = code;
					return this;
				},
				send(msg){
					resMsg = msg;
				}
			};

			await target.editNotificationActive(req, res);

			const expected = [{active: false, id: 1, level: 'Warning', message: 'This is a message', project_name: 'Test'}];
			assert.deepStrictEqual(notifications, expected);

		});
	});
});
