import React from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import UOTPrimaryButton from './GCPrimaryButton';
import UOTSecondaryButton from './GCSecondaryButton';

const UOTDialog = (props) => {

	const styles = {
		dialog: {
			width: '100%',
			maxWidth: props.width || 800,
			...props.dialogStyle,
		},
		mainContainer: {
			paddingLeft: 20,
			paddingRight: 20
		},
		title: {
			fontFamily: 'Roboto',
			fontSize: 24,
			color: '#3c4144',
			paddingBottom: 20
		},
		label: {
			height: 15,
			fontSize: 14,
			color: '#555555',
		},
		contentRow: {
			marginBottom: 20,
			maxHeight: props.maxHeight || 400,
			overflowY: 'auto'
		},
		secondaryButton: {
			marginRight: 10,
			display: 'inline'
		}
	};

	return (
		<Dialog
			modal={false}
			open={props.open}
			onRequestClose={props.onRequestClose}
			contentStyle={styles.dialog}
			autoScrollBodyContent={true}
			bodyStyle={props.bodyStyle}
			paperProps={props.paperProps}	// container
			bodyClassName={props.bodyClassName}
		>
			<div className="row" style={{ ...styles.mainContainer, ...props.mainContainerStyle }}>
				<div className="col-xs-12">
					<div className="row">
						<div className="col-xs-12">
							<h1 style={styles.title}>{props.title}</h1>
						</div>
					</div>

					<div className="row" style={props.contentStyle || styles.contentRow}>
						<div className="col-xs-12" style={props.contentColStyle}>
							{props.children}
						</div>
					</div>

					<div className="row" style={styles.buttonRow}>
						<div className="col-xs-12">
							<div className="pull-right">
								{props.tertiaryLabel &&
									<UOTSecondaryButton
										label={props.tertiaryLabel}
										onClick={props.tertiaryAction}
										marginRight={10}
										id="tertiary-dialog-btn"
									/>
								}	
								{props.secondaryLabel &&
									<UOTSecondaryButton
										label={props.secondaryLabel}
										onClick={props.secondaryAction}
										marginRight={10}
										id="secondary-dialog-btn"
									/>
								}
								{props.primaryLabel && 
									<UOTPrimaryButton
										label={props.primaryLabel}
										onClick={props.primaryAction}
										disabled={props.disabled}
										id="primary-dialog-btn"
									/>
								}
							</div>
						</div>
					</div>

				</div>
			</div>
		</Dialog>
	);

};

UOTDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	onRequestClose: PropTypes.func.isRequired,
	primaryLabel: PropTypes.string.isRequired,
	primaryAction: PropTypes.func.isRequired,
	disabled: PropTypes.bool,
	secondaryLabel: PropTypes.string,
	secondaryAction: PropTypes.func
};

export default UOTDialog;
