import React, { useEffect } from 'react';
import Notification from './Notification';
import { useMountEffect } from '../../utils/gamechangerUtils';
import { setState } from '../../utils/sharedFunctions';
import GameChangerAPI from '../api/gameChanger-service-api';

let notificationInterval;

const gameChangerAPI = new GameChangerAPI();

export const defaultNotification = {
	id: 0,
	level: 'error',
	message: `We're sorry! GAMECHANGER is temporarily under construction. We'll be up and running again shortly.`,
};

export const pollNotifications = async (state, dispatch) => {
	let newNotifications = [];
	try {
		const { data = [] } = await gameChangerAPI.getNotifications();
		const tmpNotifications = data.filter(({ active }) => active);
		newNotifications = tmpNotifications.filter(
			({ id }) => state.notificationIds.indexOf(id) === -1
		);
		if (newNotifications.length > 0) {
			setState(dispatch, {
				notificationIds: [
					...state.notificationIds,
					...newNotifications.map(({ id }) => id),
				],
				notifications: [...state.notifications, ...newNotifications],
			});
		}
	} catch (e) {
		setState(dispatch, {
			notificationIds: [0],
			notifications: [defaultNotification],
		});
	}
};

export const getNotifications = async (dispatch) => {
	try {
		const { data = [] } = await gameChangerAPI.getNotifications();
		const notifications = data.filter(({ active }) => active);
		setState(dispatch, {
			notificationIds: notifications.map(({ id }) => id),
			notifications: notifications,
		});
	} catch (e) {
		setState(dispatch, {
			notificationIds: [0],
			notifications: [defaultNotification],
		});
	}
};

const Notifications = (props) => {
	const { state, dispatch } = props.context;

	// Get any notifications
	useMountEffect(() => {
		getNotifications(dispatch).finally(() => {
			notificationInterval = setInterval(async () => {
				pollNotifications(state, dispatch);
			}, 90000);
		});
	});

	useEffect(() => {
		return () => {
			clearInterval(notificationInterval);
		};
	}, []);

	const dismissNotifications = (newNotifications) => {
		setState(dispatch, { notifications: newNotifications });
	};

	const renderNotifications = () => {
		const dismissFunc = (i) => {
			const newNotifications = state.notifications.filter(
				(_, index) => i !== index
			);
			dismissNotifications(newNotifications);
		};
		return state.notifications.map(({ level, message }, index) => (
			<Notification
				level={level}
				message={message}
				key={level + message}
				dismissFunc={() => dismissFunc(index)}
			/>
		));
	};

	return <>{renderNotifications()}</>;
};

export default Notifications;
