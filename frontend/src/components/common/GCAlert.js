import React from 'react';
import CloseIcon from '@material-ui/icons/Close';
import Check from '@material-ui/icons/Check';
import Warning from '@material-ui/icons/Warning';
import Info from '@material-ui/icons/Info';
import {
	success,
	successLight,
	warning,
	warningLight,
	error,
	errorLight,
	info,
	infoLight,
	primaryGreyDark,
} from './gc-colors';

const DEFAULT_ALERT_TYPE = 'info';
const HIDE_TIMER = 10 * 1000;

const alertStyles = {
	success: {
		icon: <Check style={{ fontSize: '26', color: { success } }} />,
		styles: {
			backgroundColor: successLight,
			borderColor: success,
		},
	},
	warning: {
		icon: <Warning style={{ fontSize: '26', color: { warning } }} />,
		styles: {
			backgroundColor: warningLight,
			borderColor: warning,
		},
	},
	error: {
		icon: <CloseIcon style={{ fontSize: '26', color: { error } }} />,
		styles: {
			backgroundColor: errorLight,
			borderColor: error,
		},
	},
	info: {
		icon: <Info style={{ fontSize: '26', color: { info } }} />,
		styles: {
			backgroundColor: infoLight,
			borderColor: info,
		},
	},
};

export default class UoTAlert extends React.Component {
	static defaultProps = {
		autoDismiss: true,
		top: 140,
	};
	constructor() {
		super();
		this.state = { isOpen: true };
		this.hideTimer = null;
	}

	componentDidMount() {
		const { onHide, autoDismiss } = this.props;
		if (autoDismiss) {
			this.hideTimer = setTimeout(() => {
				this.setState({ isOpen: false });
				if (onHide) onHide();
			}, HIDE_TIMER);
		}
	}

	componentWillUnmount() {
		if (this.hideTimer) clearTimeout(this.hideTimer);
	}

	render() {
		const self = this;
		const { message, title, onHide, elementId, top, containerStyles } =
			this.props;
		const { isOpen } = this.state;
		if (!isOpen) {
			return <i></i>;
		}
		const type = this.props.type ? this.props.type : DEFAULT_ALERT_TYPE;
		const typeStyles = alertStyles[type].styles;
		const allRootStyles = {
			...styles.alert,
			...typeStyles,
			...{ top },
			...containerStyles,
		};
		const icon = alertStyles[type].icon;
		return (
			<div style={allRootStyles} className="UoTAlert">
				<div
					id={elementId ? elementId : 'alert-message'}
					style={styles.message}
				>
					<div style={styles.iconWrapper}>{icon}</div>
					<span style={styles.title}>{title}</span>
					{message}
				</div>
				<div>
					<a
						href="/"
						style={styles.iconWrapper}
						onClick={(e) => {
							e.preventDefault();
							self.setState({ isOpen: false });
							if (onHide) onHide();
						}}
					>
						<CloseIcon style={{ fontSize: '26', color: { primaryGreyDark } }} />
					</a>
				</div>
			</div>
		);
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
		alignItems: 'center',
	},
	iconWrapper: {
		display: 'flex',
		alignItems: 'center',
	},
};
