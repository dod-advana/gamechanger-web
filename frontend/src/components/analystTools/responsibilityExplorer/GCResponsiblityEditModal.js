import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
	FormControl,
	Select,
	MenuItem,
} from '@material-ui/core';
import styled from 'styled-components';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import GCButton from '../../common/GCButton';

const CloseButton = styled.div`
	padding: 6px;
	background-color: white;
	border-radius: 5px;
	color: #8091a5 !important;
	border: 1px solid #b0b9be;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 0.4;
	position: absolute;
	right: 15px;
	top: 15px;
`;

const useStyles = makeStyles((theme) => ({
	formControl: {
		minWidth: 350,
	},
	selectEmpty: {
		marginTop: theme.spacing(2),
		fontSize: '16px',
		height: '40px',
	},
	dialogXl: {
		maxWidth: '1360px',
		minWidth: '1000px',
	},
}));

export default function GCResponsiblityEditModal(props) {
	const { open, setOpen, entity, responsibility, editResponsibility, editEntity, rejectResponsibility } = props;
	const [issueType, setIssueType] = useState(0);

	useEffect(() => {
		if (!open) {
			setIssueType(0);
		}
	}, [open]);

	const classes = useStyles();

	return (
		<Dialog
			open={open}
			scroll={'paper'}
			maxWidth="xl"
			disableEscapeKeyDown
			disableBackdropClick
			classes={{
				paperWidthXl: classes.dialogXl,
			}}
		>
			<DialogTitle>
				<div style={{ display: 'flex', width: '100%' }}>
					<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>
						Report Responsibility Data Issue
					</Typography>
				</div>
				<CloseButton onClick={() => setOpen(false)}>
					<CloseIcon fontSize="large" />
				</CloseButton>
			</DialogTitle>

			<DialogContent style={{ padding: '15px' }}>
				<div
					style={{
						backgroundColor: '#DFE6EE',
						padding: '20px 15px',
						marginBottom: '15px',
					}}
				>
					<p style={{ margin: 0 }}>
						GAMECHANGER uses machine learning models to extract responsibility data from documents.
						Occasionally there is an issue with how a piece of data is extracted. By reporting an issue, you
						will help improve the data and models.
					</p>
					<ol style={{ margin: 0, padding: '0 18px', fontWeight: 600 }}>
						<li>Select the type of issue in the dropdown.</li>
						<li>If "This is not a Responsibility", click "Submit" and no further action is needed.</li>
						<li>
							If "Responsibility is correct, but not linked to the correct Entity" or "Entity is correct,
							but Responsibility Text is incomplete", click "Submit".
						</li>
						<li>
							Highlight the actual responsibility or entity directly on the PDF and click the save button
							that appears above.
						</li>
						<li>Your feedback will be received and help improve the data and models.</li>
					</ol>
				</div>
				<div style={{ marginTop: '10px' }}>
					<Typography variant="h5" display="outline">
						Please choose the type of issue with the responsibility:
					</Typography>
					<FormControl variant="outlined" className={classes.formControl}>
						<Select
							value={issueType}
							onChange={(event) => setIssueType(event.target.value)}
							displayEmpty
							className={classes.selectEmpty}
							inputProps={{ 'aria-label': 'Without label' }}
						>
							<MenuItem
								style={{ display: 'flex', padding: '3px 6px' }}
								value={0}
								disabled
								classes={{ root: { fontSize: '16px' } }}
							>
								Select...
							</MenuItem>
							<MenuItem
								style={{ display: 'flex', padding: '3px 6px' }}
								value={1}
								classes={{ root: { fontSize: '16px' } }}
							>
								Responsibility is correct, but not linked to the correct Entity
							</MenuItem>
							<MenuItem
								style={{ display: 'flex', padding: '3px 6px' }}
								value={2}
								classes={{ root: { fontSize: '16px' } }}
							>
								Entity is correct, but Responsibility Text is incomplete
							</MenuItem>
							<MenuItem
								style={{ display: 'flex', padding: '3px 6px' }}
								value={3}
								classes={{ root: { fontSize: '16px' } }}
							>
								This is not a Responsibility
							</MenuItem>
						</Select>
					</FormControl>
				</div>
				<div
					style={{
						border: '2px solid rgb(176, 186, 197)',
						boxShadow: 'grey 1px 1px',
						borderRadius: '5px',
						padding: '10px',
						marginTop: '15px',
					}}
				>
					<div>
						<strong>Entity:</strong> {entity}
					</div>
					<div>
						<strong>Responsibility:</strong> {responsibility}
					</div>
				</div>
			</DialogContent>

			<DialogActions style={{ padding: '15px' }}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'end',
						width: '100%',
					}}
				>
					<div>
						<GCButton
							onClick={() => {
								setOpen(false);
							}}
							isSecondaryBtn={true}
						>
							Cancel
						</GCButton>
						<GCButton
							onClick={() => {
								switch (issueType) {
									case 1:
										editEntity();
										break;
									case 2:
										editResponsibility();
										break;
									case 3:
										rejectResponsibility();
										break;
									default:
										setOpen(false);
								}
								setOpen(false);
							}}
							disabled={!issueType}
						>
							Submit
						</GCButton>
					</div>
				</div>
			</DialogActions>
		</Dialog>
	);
}
