import React from 'react';
import PropTypes from 'prop-types';
import UoTAlert from '../common/GCAlert';

const Alerts = (props) => {
	const { state, dispatch } = props.context;
	const alerts = state.alerts;

	return (
		<>
			{alerts.noResultsMessage && (
				<UoTAlert
					title={'No results'}
					top={140}
					type={'warning'}
					message={alerts.noResultsMessage}
					onHide={() =>
						dispatch({ type: 'SET_ALERT', payload: { noResultsMessage: null } })
					}
					containerStyles={styles.alertStyle}
				/>
			)}
			{alerts.unauthorizedError && (
				<UoTAlert
					title={'Error communicating with the API'}
					type={'error'}
					top={140}
					message={alerts.unauthorizedError}
					onHide={() =>
						dispatch({
							type: 'SET_ALERT',
							payload: { unauthorizedError: false },
						})
					}
					containerStyles={styles.alertStyle}
				/>
			)}
			{alerts.transformFailed && (
				<UoTAlert
					title={`We're sorry! Intelligent Search couldn't complete your query. Results below defaulted to Keyword Search.`}
					type={'warning'}
					top={140}
					message={alerts.transformFailed}
					onHide={() =>
						dispatch({ type: 'SET_ALERT', payload: { transformFailed: false } })
					}
					containerStyles={styles.alertStyle}
				/>
			)}
		</>
	);
};

Alerts.propTypes = {
	context: PropTypes.shape({
		state: PropTypes.shape({
			alerts: PropTypes.objectOf(PropTypes.bool),
		}),
		dispatch: PropTypes.func,
	}),
};

export default Alerts;

const styles = {
	alertStyle: {
		width: '94%',
		marginLeft: '6px',
		zIndex: 9999,
	},
};
