import React, {useState, useEffect} from 'react';
import ReactTable from 'react-table';
import _ from 'underscore';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCButton from '../../common/GCButton';
import { trackEvent } from '../../telemetry/Matomo';
import {styles, TableRow} from '../util/GCAdminStyles';
import UserModal from './EditUserModal';

const gameChangerAPI = new GameChangerAPI();

const getClonePermissions = async () => {
	const { data } = await gameChangerAPI.getCloneData();

	const permissionsInfo = {};
	data.forEach(clone => {
		let permissions = [];

		if (clone.permissions && clone.permissions !== null) {
			permissions = clone.permissions;
		}

		if (!permissions.includes('is_admin')) {
			permissions.push('is_admin');
		}

		permissionsInfo[clone.clone_name] = permissions;
	});

	return permissionsInfo;
};

// The table columns
const DEFAULT_COLUMNS = [
	{
		Header: 'First',
		accessor: 'first_name',
		Cell: row => (
			<TableRow>{row.value && row.value !== null ? row.value : 'Unknown First'}</TableRow>
		)
	},
	{
		Header: 'Last',
		accessor: 'last_name',
		Cell: row => (
			<TableRow>{row.value && row.value !== null ? row.value : 'Unknown Last'}</TableRow>
		)
	},
	{
		Header: 'Organization',
		accessor: 'organization',
		Cell: row => (
			<TableRow>{row.value}</TableRow>
		)
	}
];

/**
 * 
 * @class UserList
 */
const UserList = React.memo((props) => {

	const {
		cloneName,
		columns,
		title,
		titleAdditions,
		descriptionAdditions
	} = props;

	// Component Properties
	const [gcUserTableData, setGCUserTableData] = useState([]);
	const [showCreateEditUserModal, setShowCreateEditUserModal] = useState(false);
	const [editUserData, setEditUserData] = useState({});
	const [permissionsInfo, setPermissionInfo] = useState({});
	const [tableColumns, setTableColumns] = useState([]);
	// Component Methods

	const getUserData = async () => {
		const tableData = [];
    
		const data = await gameChangerAPI.getUserData(cloneName);

		_.forEach(data.data.users, result => {
			tableData.push(result);
		});
		setGCUserTableData(tableData);
	};

	const deleteUserData = async (userRowId) => {
		await gameChangerAPI.deleteUserData(userRowId);
	};

	useEffect(()=>{
		getClonePermissions().then(data => {
			setPermissionInfo(data);
		});
		getUserData();
		// eslint-disable-next-line
    },[])

	useEffect(() => {
		let tmpColumns = [...DEFAULT_COLUMNS];

		if (columns && gcUserTableData) {
			if (columns.length > 0) {
				columns.forEach(column => tmpColumns.push(column));
			}

			tmpColumns.push({
				Header: ' ',
				accessor: 'id',
				width: 120,
				filterable: false,
				Cell: row => (
					<TableRow>
						<GCButton
							onClick={() => {
								trackEvent('GAMECHANGER_Admin', 'EditUser', 'onClick', row.value);
								setEditUserData(gcUserTableData.filter(user => user.id === row.value)[0]);
								setShowCreateEditUserModal(true);
							}}
							style={{minWidth: 'unset', backgroundColor: '#1C2D64', borderColor: '#1C2D64'}}
						>Edit</GCButton>
					</TableRow>
				)
			});
			tmpColumns.push({
				Header: ' ',
				accessor: 'id',
				width: 120,
				filterable: false,
				Cell: row => (
					<TableRow>
						<GCButton
							onClick={() => {
								trackEvent('GAMECHANGER_Admin', 'DeleteUser', 'onClick', row.value);
								deleteUserData(row.value).then(() => {
									getUserData().then(() => {
										setShowCreateEditUserModal(false);
									});
								});
							}}
							style={{minWidth: 'unset', backgroundColor: 'red', borderColor: 'red'}}
						>Delete</GCButton>
					</TableRow>
				)
			});
		}

		setTableColumns(tmpColumns);
		// eslint-disable-next-line
	}, [columns, gcUserTableData])

	return ( 
		<>   
			<div>
				<div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
					<p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>{title ? title : `${cloneName ? cloneName.toUpperCase() : 'GAMECHANGER'} Users`}</p>
					{titleAdditions && titleAdditions()}
				</div>
				{descriptionAdditions && descriptionAdditions()}
				<ReactTable
					data={gcUserTableData}
					columns={tableColumns}
					style={{margin: '0 80px 20px 80px', height: 700}}
					defaultPageSize={10}
					filterable={true}
					defaultFilterMethod={(filter, row) =>
						String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase())
					}
					defaultSorted={[{
						id   : 'last_name',
						desc : false,
					}]}
				/>
			</div>
			<UserModal
				showCreateEditUserModal={showCreateEditUserModal}
				setShowCreateEditUserModal={setShowCreateEditUserModal}
				userData={{...editUserData}}
				getUserData={getUserData}
				permissionsInfo={permissionsInfo}
				cloneName={cloneName}
			/>
		</>
	);
});

export default UserList;