import React from 'react';
import Ionicon from 'react-ionicons';
import {
	success,
	successLight,
	warning,
	warningLight,
	error,
	errorLight,
	info,
	infoLight,
	primaryGreyDark
} from './gc-colors';

const DEFAULT_ALERT_TYPE = 'info';
const HIDE_TIMER = 10 * 1000;

const alertStyles = {
	success: {
		icon: <Ionicon icon="ion-checkmark" fontSize="26px" color={success} />,
		styles: {
			backgroundColor: successLight,
			borderColor: success
		}

	},
	warning: {
		icon: <Ionicon icon="ion-android-warning" fontSize="26px" color={warning} />,
		styles: {
			backgroundColor: warningLight,
			borderColor: warning
		}
	},
	error: {
		icon: <Ionicon icon="ion-close" fontSize="26px" color={error} />,
		styles: {
			backgroundColor: errorLight,
			borderColor: error
		}
	},
	info: {
		icon: <Ionicon icon="ion-information-circled" fontSize="26px" color={info} />,
		styles: {
			backgroundColor: infoLight,
			borderColor: info
		}
	}
}

export default class UoTAlert extends React.Component {
	static defaultProps = {
		autoDismiss: true,
		top: 140
	}
	constructor() {
		super();
		this.state = { isOpen: true }
		this.hideTimer = null;
	}

	componentDidMount() {
		const { onHide, autoDismiss } = this.props;
		if (autoDismiss){
			this.hideTimer = setTimeout(() => {
				this.setState({ isOpen: false })
				if (onHide) onHide();
			}, HIDE_TIMER)
		}
		
	}

	componentWillUnmount() {
		if (this.hideTimer) clearTimeout(this.hideTimer)
	}

	render() {
		const { message, title, onHide, elementId, top, containerStyles } = this.props;
		const { isOpen } = this.state;
		if (!isOpen) return <i></i>
		const type = this.props.type || DEFAULT_ALERT_TYPE;
		const typeStyles = alertStyles[type].styles;
		const allRootStyles = Object.assign({}, styles.alert, typeStyles, { top }, containerStyles);
		const icon = alertStyles[type].icon;
		return <div style={allRootStyles} className='UoTAlert'>

			<div id={elementId || 'alert-message'} style={styles.message}>
				<div style={styles.iconWrapper}>{icon}</div>
				<span style={styles.title}>{title}</span>
				{message}
			</div>
			<div>
				<a href='/' style={styles.iconWrapper} onClick={(e) => {
					e.preventDefault();
					this.setState({ isOpen: false })
					if (onHide) onHide();
				}}>
					<Ionicon
						icon="ion-close"
						fontSize="26px"
						color={primaryGreyDark}
					/>
				</a>
			</div>
		</div>
	}
}

const styles = {
	alert: {
		padding: 15,
		position: 'fixed',
		top: 115,
		width: 'calc(100% - 90px)',
		border: '2px solid',
		display: 'flex',
		justifyContent: 'space-between',
		zIndex: 10,
	},
	title: {
		fontWeight: 'bold',
		paddingRight: 15,
		paddingLeft: 15,
	},
	message: {
		display: 'flex',
		alignItems: 'center'
	},
	iconWrapper: {
		display: 'flex',
		alignItems: 'center'
	}
}