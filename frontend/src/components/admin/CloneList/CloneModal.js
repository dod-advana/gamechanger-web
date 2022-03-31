import React, { useState, useEffect } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Input } from '@material-ui/core';
import GCButton from '../../common/GCButton';
import { styles, GCCheckbox, useStyles } from '../util/GCAdminStyles';
import styled from 'styled-components';
import { gcOrange } from '../../common/gc-colors';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

const DEFAULT_VALUES = {
	clone_name: '',
	card_module: 'default/defaultCardHandler',
	display_name: '',
	export_module: 'simple/simpleExportHandler',
	graph_module: 'simple/simpleGraphHandler',
	main_view_module: 'default/defaultMainViewHandler',
	navigation_module: 'default/defaultNavigationHandler',
	search_module: 'simple/simpleSearchHandler',
	search_bar_module: 'default/defaultSearchBarHandler',
	s3_bucket: 'advana-data-zone/bronze',
	title_bar_module: 'default/defaultTitleBarHandler',
	data_source_name: '',
	source_agency_name: '',
	metadata_creation_group: '',
	source_s3_bucket: '',
	source_s3_prefix: '',
	permissions: ['is_admin'],
};

const TabContainer = styled.div`
	align-items: center;
	min-height: 613px;

	.tab-button-container {
		width: 100%;
		display: flex;
		align-items: center;
	}

	.tabs-list {
		border-bottom: 2px solid ${gcOrange};
		padding: 0;
		display: flex;
		align-items: center;
		flex: 9;
		margin: 10px !important;
	}

	.panel-container {
		align-items: center;
		margin: 10px;
	}
`;

const tabList = [
	{
		title: 'cloneMeta',
		onClick: () => {},
		children: (
			<Typography variant="h6" display="inline" title="cardView">
				Clone Meta
			</Typography>
		),
	},
	{
		title: 'clonePermissions',
		onClick: () => {},
		children: (
			<Typography variant="h6" display="inline" title="cardView">
				Clone Permissions
			</Typography>
		),
	},
];

/**
 *
 * @class CloneModal
 */

export default ({
	storeCloneData,
	cloneToEdit,
	cloneTableMetaData,
	showCreateEditCloneModal,
	setShowCreateEditCloneModal,
	getCloneModalTextDisplayName,
}) => {
	// console.log('cloneToEdit\n', JSON.stringify(cloneToEdit))
	// State Variables
	const [editCloneData, setEditCloneData] = useState({});
	const [editCloneDataErrors, setEditCloneDataErrors] = useState({});
	const [tabIndex, setTabIndex] = useState(0);
	const [addPermissionField, setAddPermissionField] = useState('');
	const classes = useStyles();

	//Component Methods
	const closeCloneModal = () => {
		setEditCloneData({});
		setEditCloneDataErrors({});
		setShowCreateEditCloneModal(false);
		setTabIndex(0);
	};

	const handleCheck = (event) => {
		setEditCloneData({
			...editCloneData,
			[event.target.name]: event.target.checked,
		});
	};

	const handleTextChange = (event, key) => {
		const tmpData = { ...editCloneData };
		const cloneErrors = { ...editCloneDataErrors };

		cloneErrors[key] = false;
		tmpData[key] = event.target.value;

		setEditCloneDataErrors(cloneErrors);
		setEditCloneData(tmpData);
	};

	useEffect(() => {
		if (showCreateEditCloneModal && cloneToEdit) {
			const tmpData = { ...cloneToEdit };
			if (tmpData.available_at !== null) {
				tmpData.available_at = tmpData.available_at.join(', ');
			}
			if (!tmpData.permissions || tmpData.permissions === null) {
				tmpData.permissions = DEFAULT_VALUES.permissions;
			}
			setEditCloneData(tmpData);
		} else {
			setEditCloneData({ ...DEFAULT_VALUES });
		}
	}, [showCreateEditCloneModal, cloneToEdit]);

	const handleTabClicked = (tabIndex, lastIndex, event) => {
		setTabIndex(tabIndex);
	};

	const renderCloneMeta = () => {
		return (
			<div>
				<div>
					<Typography variant="h4" style={styles.modalHeaders}>
						Input Fields
					</Typography>
					{cloneTableMetaData.stringFields.map((field) => (
						<TextField
							key={field.key}
							label={getCloneModalTextDisplayName(field)}
							value={editCloneData[field.key]}
							onChange={(event) => handleTextChange(event, field.key)}
							className={classes.textField}
							helperText={field.display_name}
							margin="dense"
							error={editCloneDataErrors[field.key]}
						/>
					))}
				</div>
				<div>
					<Typography variant="h4" style={styles.modalHeaders}>
						Boolean Fields
					</Typography>
					{cloneTableMetaData.booleanFields.map((field) => (
						<FormControlLabel
							key={field.key}
							control={
								<GCCheckbox
									checked={editCloneData[field.key]}
									onChange={handleCheck}
									name={field.key}
									color="primary"
									style={styles.checkbox}
								/>
							}
							label={field.display_name}
						/>
					))}
				</div>
			</div>
		);
	};

	const renderClonePermissions = () => {
		const addPermission = (permission) => {
			const tmpData = { ...editCloneData };

			if (!tmpData.permissions.includes(permission)) {
				tmpData.permissions.push(permission);
				setEditCloneData(tmpData);
			}

			setAddPermissionField('');
		};

		const deletePermissions = (permission) => {
			const tmpData = { ...editCloneData };

			if (tmpData.permissions.includes(permission)) {
				tmpData.permissions = tmpData.permissions.filter((item) => item !== permission);
				setEditCloneData(tmpData);
			}
		};

		const handleAddPermissionFieldChange = (event) => {
			setAddPermissionField(event.target.value);
		};

		return (
			<div>
				<Typography variant="h4" style={styles.modalHeaders}>
					Add Permission
				</Typography>
				<div style={{ marginBottom: 20 }}>
					<TextField
						label={'Add Permission'}
						value={addPermissionField}
						onChange={(event) => handleAddPermissionFieldChange(event)}
						className={classes.textField}
						margin="dense"
					/>
					<GCButton
						id={'addPermissionButton'}
						onClick={() => addPermission(addPermissionField)}
						style={{ margin: '10px' }}
					>
						Add
					</GCButton>
				</div>
				<Typography variant="h4" style={styles.modalHeaders}>
					Permissions
				</Typography>
				<div>
					{editCloneData.permissions &&
						editCloneData.permissions.map((permission) => (
							<div style={{ marginBottom: 10 }}>
								<Input
									id={`${permission}-input`}
									className={classes.inputBox}
									value={permission}
									disabled={true}
								/>
								<GCButton
									id={`${permission}-delete`}
									onClick={() => deletePermissions(permission)}
									style={{
										minWidth: 'unset',
										backgroundColor: 'red',
										borderColor: 'red',
										marginTop: -15,
									}}
								>
									Remove
								</GCButton>
							</div>
						))}
				</div>
			</div>
		);
	};

	return (
		<Dialog
			open={showCreateEditCloneModal}
			scroll={'paper'}
			maxWidth="lg"
			disableEscapeKeyDown
			disableBackdropClick
			classes={{
				paperWidthLg: classes.dialogLg,
			}}
		>
			<DialogTitle>
				<div style={{ display: 'flex', width: '100%' }}>
					<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>
						{editCloneData.id && editCloneData.id > 0 ? 'Edit Clone' : 'Create Clone'}
					</Typography>
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
						backgroundColor: styles.backgroundGreyLight,
						borderRadius: 0,
					}}
					onClick={() => closeCloneModal()}
				>
					<CloseIcon style={{ fontSize: 30 }} />
				</IconButton>
			</DialogTitle>

			<DialogContent style={{ height: 760 }}>
				<TabContainer id="gc-clone-modal">
					<Tabs onSelect={(tabIndex, lastIndex, event) => handleTabClicked(tabIndex, lastIndex, event)}>
						<div className={'tab-button-container'}>
							<TabList className={'tabs-list'}>
								{tabList.map((tab, index) => {
									const tl = index === 0 ? '5px' : '0';
									const tr = index === tabList.length - 1 ? '5px' : '0';
									return (
										<Tab
											style={{
												...styles.tabStyle,
												...(tabIndex === index ? styles.tabSelectedStyle : {}),
												borderRadius: `${tl} ${tr} 0 0`,
											}}
											title={tab.title}
											onClick={tab.onClick}
										>
											{tab.children}
										</Tab>
									);
								})}
							</TabList>
						</div>

						<div className={'panel-container'}>
							<TabPanel>{renderCloneMeta()}</TabPanel>
							<TabPanel>{renderClonePermissions()}</TabPanel>
						</div>
					</Tabs>
				</TabContainer>
			</DialogContent>

			<DialogActions>
				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						width: '100%',
						margin: '0px 18px',
					}}
				>
					<GCButton
						id={'editCloneSubmit'}
						onClick={() => storeCloneData(editCloneData)}
						style={{ margin: '10px' }}
					>
						Submit
					</GCButton>
				</div>
			</DialogActions>
		</Dialog>
	);
};
