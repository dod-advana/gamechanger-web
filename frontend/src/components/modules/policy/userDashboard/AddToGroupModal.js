import React, { useState } from 'react';
import { Typography, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import GameChangerAPI from '../../../api/gameChanger-service-api';
import GCTooltip from '../../../common/GCToolTip';
import GCCloseButton from '../../../common/GCCloseButton';
import GCButton from '../../../common/GCButton';
import Modal from 'react-modal';
import _ from 'lodash';

const gameChangerAPI = new GameChangerAPI();

const styles = {
	menuItem: {
		fontSize: 16,
	},
	modalError: {
		color: '#f44336',
	},
};

export default function AddToGroupModal(props) {
	const {
		showAddToGroupModal,
		setShowAddToGroupModal,
		documentGroups,
		userData,
		updateUserData,
		favoriteDocuments,
		classes,
	} = props;

	const [selectedGroup, setSelectedGroup] = useState({ id: null, name: '' });
	const [addToGroupError, setAddToGroupError] = useState(false);
	const [documentsToGroup, setDocumentsToGroup] = useState([]);

	const handleChange = ({ target }) => {
		setAddToGroupError('');
		const groupId = documentGroups.find((group) => group.group_name === target.value).id;
		setDocumentsToGroup([]);
		setSelectedGroup({ id: groupId, name: target.value });
	};

	const handleCloseAddGroupModal = () => {
		setAddToGroupError('');
		setShowAddToGroupModal(false);
		setDocumentsToGroup([]);
	};

	const handleAddToFavorites = async () => {
		if (!selectedGroup.name) return setAddToGroupError('Please select a group');
		const selectedGroupInfo = userData.favorite_groups.find((group) => group.id === selectedGroup.id);
		let totalInGroup = documentsToGroup.length;
		selectedGroupInfo.favorites.forEach((favId) => {
			if (!documentsToGroup.includes(favId)) totalInGroup++;
		});
		if (totalInGroup > 5) return setAddToGroupError('Groups can only contain up to 5 items');
		await gameChangerAPI.addTofavoriteGroupPOST({ groupId: selectedGroup.id, documentIds: documentsToGroup });
		updateUserData();
		handleCloseAddGroupModal();
	};

	const handleAddToGroupCheckbox = (value) => {
		const newDocumentsToGroup = [...documentsToGroup];
		const index = newDocumentsToGroup.indexOf(value);
		if (index > -1) {
			newDocumentsToGroup.splice(index, 1);
		} else {
			newDocumentsToGroup.push(value);
		}
		setDocumentsToGroup(newDocumentsToGroup);
	};
	const renderDocumentsToAdd = () => {
		let groupFavorites;
		if (selectedGroup.name)
			groupFavorites = userData.favorite_groups.find(
				(group) => group.group_name === selectedGroup.name
			)?.favorites;
		return (
			<div style={{ overflow: 'auto', maxHeight: 300, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
				{_.map(favoriteDocuments, (doc) => {
					if (selectedGroup.name) {
						if (groupFavorites?.includes(doc.favorite_id)) {
							return <></>;
						}
					}
					return (
						<GCTooltip title={doc.title} placement="top" style={{ zIndex: 1001 }}>
							<FormControlLabel
								style={{ margin: '0px 0px 20px 0px' }}
								control={
									<Checkbox
										onChange={() => handleAddToGroupCheckbox(doc.favorite_id)}
										color="primary"
										icon={
											<CheckBoxOutlineBlankIcon
												style={{ width: 25, height: 25, fill: 'rgb(224, 224, 224)' }}
												fontSize="large"
											/>
										}
										checkedIcon={
											<CheckBoxIcon style={{ width: 25, height: 25, fill: '#386F94' }} />
										}
										key={doc.id}
									/>
								}
								label={
									<Typography variant="h6" noWrap className={classes.label}>
										{doc.title}
									</Typography>
								}
							/>
						</GCTooltip>
					);
				})}
			</div>
		);
	};
	return (
		<Modal
			isOpen={showAddToGroupModal}
			onRequestClose={() => handleCloseAddGroupModal()}
			className={classes.addToGroupModal}
			overlayClassName="new-group-modal-overlay"
			id="new-group-modal"
			closeTimeoutMS={300}
			style={{ margin: 'auto', marginTop: '30px', display: 'flex', flexDirection: 'column' }}
		>
			<div>
				<GCCloseButton onClick={() => handleCloseAddGroupModal()} />
				<Typography variant="h2" style={{ width: '100%', fontSize: '24px', marginBottom: 20 }}>
					Add Favorite Document to Group
				</Typography>
				<div style={{ width: 815 }}>
					{selectedGroup.name && renderDocumentsToAdd()}
					<FormControl variant="outlined" style={{ width: '100%' }}>
						<InputLabel className={classes.labelFont}>Select Group</InputLabel>
						<Select
							classes={{ root: classes.groupSelect }}
							value={selectedGroup.name}
							onChange={handleChange}
						>
							{_.map(documentGroups, (group) => {
								return (
									<MenuItem style={styles.menuItem} value={group.group_name} key={group.id}>
										{group.group_name}
									</MenuItem>
								);
							})}
						</Select>
					</FormControl>
					<div style={{ display: 'flex' }}>
						{addToGroupError && <div style={styles.modalError}>{addToGroupError}</div>}
						<div style={{ marginLeft: 'auto' }}>
							<GCButton
								onClick={() => handleCloseAddGroupModal()}
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
								onClick={() => handleAddToFavorites()}
								style={{
									height: 40,
									minWidth: 40,
									padding: '2px 8px 0px',
									fontSize: 14,
									margin: '16px 0px 0px 10px',
								}}
							>
								Save
							</GCButton>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
}
