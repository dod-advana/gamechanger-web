import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from 'react-modal';
import _ from 'lodash';
import makeStyles from '@material-ui/core/styles/makeStyles';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { Typography, Checkbox, FormControlLabel } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { getOrgToOrgQuery, getTypeQuery } from '../../utils/gamechangerUtils';
import ExportResultsDialog from '../export/ExportResultsDialog';
import GCGroupCard from '../../components/cards/GCGroupCard';
import GCButton from '../common/GCButton';
import {
	handleGenerateGroup,
	getSearchObjectFromString,
	setCurrentTime,
	getUserData,
	setState,
} from '../../utils/sharedFunctions';
import GCCloseButton from '../common/GCCloseButton';

const StyledPlaceHolder = styled.div`
	font-family: Montserrat;
	font-size: 20px;
	font-weight: 300;
	text-align: center;
`;

const useStyles = makeStyles((theme) => ({
	root: {
		padding: 0,

		'&:hover': {
			backgroundColor: 'transparent',
		},
	},
	paper: {
		border: '1px solid',
		padding: theme.spacing(1),
		backgroundColor: theme.palette.background.paper,
	},
	modalTextField: {
		marginTop: '14px',
		paddingBottom: '8px',
		height: 'auto',
		width: '100%',
		'& .MuiFormHelperText-root': {
			fontSize: 14,
			marginLeft: 'unset',
		},
		'& .MuiInputBase-root': {
			'& .MuiInputBase-input': {
				height: '24px',
				fontSize: '14px',
			},
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-disabled fieldset': {
				borderColor: (props) => (props.error ? 'red' : 'inherit'),
			},
		},
	},
	modalTextArea: {
		marginTop: '14px',
		paddingBottom: '8px',
		height: 'auto',
		width: '100%',
		'& .MuiFormHelperText-root': {
			fontSize: 14,
			marginLeft: 'unset',
		},
		'& .MuiInputBase-root': {
			'& .MuiInputBase-input': {
				fontSize: '14px',
			},
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-disabled fieldset': {
				borderColor: (props) => (props.error ? 'red' : 'inherit'),
			},
		},
	},
	icon: {
		borderRadius: 4,
		color: '#DFE6EE',
		width: 20,
		height: 20,
		boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
		backgroundColor: '#ffffff',
		backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
		'$root.Mui-focusVisible &': {
			outline: '2px auto #DFE6EE',
			outlineOffset: 2,
		},
		'input:hover ~ &': {
			backgroundColor: '#ebf1f5',
		},
		'input:disabled ~ &': {
			boxShadow: 'none',
			background: 'rgba(206,217,224,.5)',
		},
	},
	checkedIcon: {
		backgroundColor: '#ffffff',
		color: '#E9691D',
		backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
		'&:before': {
			display: 'block',
			width: 20,
			height: 20,
			backgroundImage:
				`url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath` +
				` fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 ` +
				`1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23E9691D'/%3E%3C/svg%3E")`,
			content: '""',
		},
		'input:hover ~ &': {
			backgroundColor: '#ebf1f5',
		},
	},
	newGroupModal: {
		position: 'fixed',
		top: '35%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		backgroundColor: 'white',
		zIndex: 9999,
		border: '1px solid #CCD8E5',
		boxShadow: '0px 12px 14px #00000080',
		borderRadius: '6px',
		padding: 15,
	},
	addToGroupModal: {
		position: 'fixed',
		top: '35%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		backgroundColor: 'white',
		zIndex: 1000,
		border: '1px solid #CCD8E5',
		boxShadow: '0px 12px 14px #00000080',
		borderRadius: '6px',
		padding: 15,
	},
	label: {
		fontSize: 14,
		maxWidth: 350,
	},
	groupSelect: {
		fontSize: '16px',
		'&:focus': { backgroundColor: 'white' },
	},
}));

export default function GroupsPanel(props) {
	const { state, dispatch, documentGroups } = props;

	const [showNewGroupModal, setShowNewGroupModal] = useState(false);
	const [groupName, setGroupName] = useState('');
	const [groupDescription, setGroupDescription] = useState('');
	const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
	const [groupsToDelete, setGroupsToDelete] = useState([]);
	const [createGroupError, setCreateGroupError] = useState('');

	const classes = useStyles();

	const handleSaveGroup = (groupType) => {
		const group = {
			group_type: groupType,
			group_name: groupName,
			group_description: groupDescription,
			create: true,
		};
		if (documentGroups.filter((group) => group.group_name === groupName).length > 0) {
			return setCreateGroupError('A group with that name already exists');
		}
		handleGenerateGroup(group, state, dispatch);
		handleCloseNewGroupModal();
	};

	const handleDeleteGroup = () => {
		const group = {
			group_ids: groupsToDelete,
			create: false,
		};
		handleGenerateGroup(group, state, dispatch);
		handleCloseDeleteGroupModal();
	};

	const handleCloseDeleteGroupModal = () => {
		setShowDeleteGroupModal(false);
		setGroupsToDelete([]);
	};

	const handleCloseNewGroupModal = () => {
		setShowNewGroupModal(false);
		setGroupName('');
		setGroupDescription('');
		setCreateGroupError('');
	};

	const handleDeleteGroupCheckbox = (value) => {
		const newGroupsToDelete = [...groupsToDelete];
		const index = newGroupsToDelete.indexOf(value);
		if (index > -1) {
			newGroupsToDelete.splice(index, 1);
		} else {
			newGroupsToDelete.push(value);
		}
		setGroupsToDelete(newGroupsToDelete);
	};

	return (
		<div style={{ width: '100%', height: '100%' }}>
			<div style={{ height: '100%', overflow: 'hidden', marginBottom: 10 }}>
				<div className={'col-xs-12'} style={{ padding: 0 }}>
					<div
						className="row"
						style={{
							display: 'flex',
							justifyContent: 'flex-end',
							paddingRight: 0,
							marginLeft: 40,
							width: '95%',
						}}
					>
						<GCButton onClick={() => setShowDeleteGroupModal(true)} style={{}} isSecondaryBtn={true}>
							Delete a Group
						</GCButton>
						<GCButton onClick={() => setShowNewGroupModal(true)} style={{}}>
							Create a New Group
						</GCButton>
						<Modal
							isOpen={showNewGroupModal}
							onRequestClose={() => handleCloseNewGroupModal()}
							className={classes.newGroupModal}
							overlayClassName="new-group-modal-overlay"
							id="new-group-modal"
							closeTimeoutMS={300}
							style={{ margin: 'auto', marginTop: '30px', display: 'flex', flexDirection: 'column' }}
						>
							<div>
								<GCCloseButton onClick={() => handleCloseNewGroupModal()} />
								<Typography variant="h2" style={{ width: '100%', fontSize: '24px' }}>
									Create a New Group
								</Typography>
								<div style={{ width: 490 }}>
									<TextField
										label={'Name of the Group'}
										value={groupName}
										onChange={(event) => {
											setGroupName(event.target.value);
											setCreateGroupError('');
										}}
										error={createGroupError}
										helperText={createGroupError}
										className={classes.modalTextField}
										margin="none"
										size="small"
										variant="outlined"
									/>
									<TextField
										label={'Description'}
										value={groupDescription}
										onChange={(event) => {
											setGroupDescription(event.target.value);
										}}
										className={classes.modalTextArea}
										margin="none"
										size="small"
										variant="outlined"
										multiline={true}
										rows={4}
									/>
									<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
										<GCButton
											onClick={() => handleCloseNewGroupModal()}
											style={{
												height: 40,
												minWidth: 40,
												padding: '2px 8px 0px',
												fontSize: 14,
												margin: '16px 0px 0px 10px',
											}}
											isSecondaryBtn
										>
											Close
										</GCButton>
										<GCButton
											onClick={() => handleSaveGroup('document')}
											style={{
												height: 40,
												minWidth: 40,
												padding: '2px 8px 0px',
												fontSize: 14,
												margin: '16px 0px 0px 10px',
											}}
										>
											Generate
										</GCButton>
									</div>
								</div>
							</div>
						</Modal>
						<Modal
							isOpen={showDeleteGroupModal}
							onRequestClose={() => handleCloseDeleteGroupModal()}
							className={classes.newGroupModal}
							overlayClassName="new-group-modal-overlay"
							id="new-group-modal"
							closeTimeoutMS={300}
							style={{ margin: 'auto', marginTop: '30px', display: 'flex', flexDirection: 'column' }}
						>
							<div>
								<GCCloseButton onClick={() => handleCloseDeleteGroupModal()} />
								<Typography variant="h2" style={{ width: '100%', fontSize: '24px' }}>
									Delete Groups
								</Typography>
								<div style={{ width: 490 }}>
									{_.map(documentGroups, (group) => {
										return (
											<FormControlLabel
												control={
													<Checkbox
														onChange={() => handleDeleteGroupCheckbox(group.id)}
														color="primary"
														icon={
															<CheckBoxOutlineBlankIcon
																style={{
																	width: 25,
																	height: 25,
																	fill: 'rgb(224, 224, 224)',
																}}
																fontSize="large"
															/>
														}
														checkedIcon={
															<CheckBoxIcon
																style={{ width: 25, height: 25, fill: '#386F94' }}
															/>
														}
														key={group.id}
													/>
												}
												label={
													<Typography variant="h6" noWrap className={classes.label}>
														{group.group_name}
													</Typography>
												}
											/>
										);
									})}
									<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
										<GCButton
											onClick={() => handleCloseDeleteGroupModal()}
											style={{
												height: 40,
												minWidth: 40,
												padding: '2px 8px 0px',
												fontSize: 14,
												margin: '16px 0px 0px 10px',
											}}
											isSecondaryBtn
										>
											Cancel
										</GCButton>
										<GCButton
											onClick={() => handleDeleteGroup()}
											style={{
												height: 40,
												minWidth: 40,
												padding: '2px 8px 0px',
												fontSize: 14,
												margin: '16px 0px 0px 10px',
											}}
										>
											Delete
										</GCButton>
									</div>
								</div>
							</div>
						</Modal>
						<ExportResultsDialog
							open={state.exportDialogVisible}
							handleClose={() =>
								setState(dispatch, {
									exportDialogVisible: false,
									selectedDocuments: new Map(),
									prevSearchText: '',
								})
							}
							searchObject={getSearchObjectFromString(state.prevSearchText ? state.prevSearchText : '')}
							setCurrentTime={setCurrentTime}
							selectedDocuments={state.selectedDocuments}
							isSelectedDocs={true}
							orgFilterString={getOrgToOrgQuery(
								state.searchSettings.allOrgsSelected,
								state.searchSettings.orgFilter
							)}
							typeFilterString={getTypeQuery(
								state.searchSettings.allTypesSelected,
								state.searchSettings.typeFilter
							)}
							orgFilter={state.searchSettings.orgFilter}
							typeFilter={state.searchSettings.typeFilter}
							getUserData={() => getUserData(dispatch)}
							isClone={true}
							cloneData={state.cloneData}
							searchType={state.searchSettings.searchType}
							edaSearchSettings={state.edaSearchSettings}
							sort={state.currentSort}
							order={state.currentOrder}
						/>
					</div>
					{documentGroups.length > 0 ? (
						<div className="row" style={{ marginLeft: 0, marginRight: 0 }}>
							{_.map(documentGroups, (group, idx) => {
								return (
									<GCGroupCard
										group={group}
										state={state}
										idx={idx}
										dispatch={dispatch}
										favorites={group.favorites}
										key={group.id}
									/>
								);
							})}
						</div>
					) : (
						<StyledPlaceHolder>Make a group to see it listed here</StyledPlaceHolder>
					)}
				</div>
			</div>
		</div>
	);
}
