import React, { useState, useEffect } from 'react';
import { setState } from '../../../utils/sharedFunctions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import {
	Typography,
	Grid,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	makeStyles,
} from '@material-ui/core';
import GCPrimaryButton from '../../common/GCButton';
import Autocomplete from '@material-ui/lab/Autocomplete';
import GameChangerAPI from '../../api/gameChanger-service-api';
const gameChangerAPI = new GameChangerAPI();

const _ = require('lodash');

const useStyles = makeStyles((theme) => ({
	input: {
		height: 40,
		fontSize: '1.2em',
	},
}));

const FeedbackModal = ({ dispatch, state }) => {
	const { feedbackModalOpen, feedbackForm, feedbackValidated, feedbackFormValidation } = state;

	const classes = useStyles();

	const [description, setDescription] = useState(feedbackForm.description);

	const [focusFName, setFocusFName] = useState(false);
	const [focusLName, setFocusLName] = useState(false);
	const [focusEmail, setFocusEmail] = useState(false);

	useEffect(() => {
		setDescription(feedbackForm.description);
	}, [feedbackForm.description]);

	const setFeedbackForm = (field, value) => {
		let newFeedbackForm = _.cloneDeep(feedbackForm);
		let newFeedbackFormValidation;

		switch (field) {
			default:
				newFeedbackForm[field] = value;
				break;
		}

		let stateObject = { feedbackForm: newFeedbackForm };

		if (field in feedbackFormValidation && value && value.length > 0) {
			newFeedbackFormValidation = _.cloneDeep(feedbackFormValidation);
			newFeedbackFormValidation[field] = true;
			stateObject.feedbackFormValidation = newFeedbackFormValidation;
		}

		setState(dispatch, stateObject);
	};

	const validateForm = () => {
		const feedbackValidation = _.cloneDeep(feedbackFormValidation);
		let validated = true;

		for (const field of Object.keys(feedbackValidation)) {
			const fieldValue = feedbackForm[field];

			feedbackValidation[field] = fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
			if (feedbackValidation[field] === false) {
				validated = false;
			}
		}

		setState(dispatch, { feedbackFormValidation: feedbackValidation, feedbackValidated: validated });
		return validated;
	};

	return (
		<Dialog open={feedbackModalOpen} scroll={'paper'} maxWidth="lg" disableEscapeKeyDown disableBackdropClick>
			<DialogTitle>
				<div style={{ display: 'flex', width: '100%' }}>
					<Typography
						variant="h3"
						display="inline"
						style={{ fontWeight: 700 }}
					>{`Help us improve your experience with feedback!`}</Typography>
				</div>
				<IconButton
					aria-label="close"
					style={{
						position: 'absolute',
						right: '0px',
						top: '0px',
						height: 60,
						width: 60,
						color: 'black',
						// backgroundColor: styles.backgroundGreyLight,
						borderRadius: 0,
					}}
					onClick={() => setState(dispatch, { feedbackModalOpen: false })}
				>
					<CloseIcon style={{ fontSize: 30 }} />
				</IconButton>
			</DialogTitle>
			<DialogContent style={{ height: 500 }}>
				<div style={{ width: '700px' }}>
					<Grid container>
						<Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between' }}>
							<TextField
								error={!feedbackValidated && !feedbackFormValidation['first_name']}
								label="First Name"
								id="margin-dense"
								defaultValue={feedbackForm ? feedbackForm.first_name : null}
								margin="dense"
								variant="outlined"
								style={{ width: 330 }}
								InputProps={{
									classes: {
										input: classes.input,
									},
									onFocus: () => {
										setFocusFName(true);
									},
									onBlur: (e) => {
										setFeedbackForm('first_name', e.target.value);
										setFocusFName(false);
									},
								}}
								InputLabelProps={{
									style: {
										top:
											focusFName || (feedbackForm && feedbackForm['first_name'].length > 0)
												? '0px'
												: '8px',
									},
								}}
								FormHelperTextProps={{
									style: {
										margin: '5px 0 0',
									},
								}}
								helperText={<i style={{ color: '#d32f2f', fontSize: '11px' }}>*Required</i>}
							/>
							<TextField
								error={!feedbackValidated && !feedbackFormValidation['last_name']}
								label="Last Name"
								id="margin-dense"
								defaultValue={feedbackForm ? feedbackForm.last_name : null}
								margin="dense"
								variant="outlined"
								style={{ width: 330 }}
								InputProps={{
									classes: {
										input: classes.input,
									},
									onFocus: () => {
										setFocusLName(true);
									},
									onBlur: (e) => {
										setFeedbackForm('last_name', e.target.value);
										setFocusLName(false);
									},
								}}
								InputLabelProps={{
									style: {
										top:
											focusLName || (feedbackForm && feedbackForm['last_name'].length > 0)
												? '0px'
												: '8px',
									},
								}}
								FormHelperTextProps={{
									style: {
										margin: '5px 0 0',
									},
								}}
								helperText={<i style={{ color: '#d32f2f', fontSize: '11px' }}>*Required</i>}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								error={!feedbackValidated && !feedbackFormValidation['email']}
								style={{ width: '100%', margin: '10px 0 0' }}
								label="Email"
								id="margin-dense"
								defaultValue={feedbackForm ? feedbackForm.email : null}
								onBlur={(e) => setFeedbackForm('email', e.target.value)}
								margin="dense"
								variant="outlined"
								InputProps={{
									classes: {
										input: classes.input,
									},
									onFocus: () => {
										setFocusEmail(true);
									},
									onBlur: (e) => {
										setFeedbackForm('email', e.target.value);
										setFocusEmail(false);
									},
								}}
								InputLabelProps={{
									style: {
										top:
											focusEmail || (feedbackForm && feedbackForm['email'].length > 0)
												? '0px'
												: '8px',
									},
								}}
								FormHelperTextProps={{
									style: {
										margin: '5px 0 0',
									},
								}}
								helperText={<i style={{ color: '#d32f2f', fontSize: '11px' }}>*Required</i>}
							/>
						</Grid>
						<Grid item xs={6}>
							<Autocomplete
								options={['Question', 'Suggestion', 'Content', 'Other']}
								style={{ width: 330, backgroundColor: 'white', margin: '15px 0 0' }}
								renderInput={(params) => (
									<TextField {...params} label="Report a technical issue" variant="outlined" />
								)}
								value={feedbackForm ? feedbackForm.type : null}
								onChange={(event, value) => setFeedbackForm('type', value)}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								style={{ width: '100%', margin: '25px 0 0' }}
								label="Description"
								id="margin-dense"
								value={description}
								onBlur={(e) => setFeedbackForm('description', e.target.value)}
								onChange={(event, value) => setDescription(value)}
								margin="dense"
								variant="outlined"
								rows={6}
								multiline
							/>
						</Grid>
					</Grid>
				</div>
			</DialogContent>
			<DialogActions>
				{!feedbackValidated && <span style={{ color: '#F44336' }}>Please fill out the required fields</span>}
				<GCPrimaryButton
					id={'editUserClose'}
					onClick={() => setState(dispatch, { feedbackModalOpen: false })}
					style={{ margin: '10px', color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0' }}
				>
					Close
				</GCPrimaryButton>
				<GCPrimaryButton
					id={'editUserSubmit'}
					onClick={async () => {
						if (validateForm()) {
							const res = await gameChangerAPI.callDataFunction({
								functionName: 'submitFeedbackForm',
								cloneName: 'jbook',
								options: {
									feedbackForm,
								},
							});
							if (res.data) {
								setState(dispatch, {
									feedbackModalOpen: false,
									feedbackSubmitted: true,
									feedbackText: 'Successfully submitted',
								});
							} else {
								setState(dispatch, {
									feedbackModalOpen: true,
									feedbackText: 'Error submitting feedback',
								});
							}
						}
					}}
					style={{ margin: '10px', backgroundColor: '#1C2D64', borderColor: '#1C2D64' }}
				>
					Submit
				</GCPrimaryButton>
			</DialogActions>
		</Dialog>
	);
};

export default FeedbackModal;
