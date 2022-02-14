import React, {useState, useEffect} from 'react';
import ReactTable from 'react-table';
import _ from 'underscore';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCButton from '../../common/GCButton';
import { trackEvent } from '../../telemetry/Matomo';
import {GCCheckbox, styles, TableRow} from '../util/GCAdminStyles';
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

/**
 * 
 * @class UserList
 */
const UserList = React.memo((props) => {

	const {
		cloneName
	} = props;

	// Component Properties
	const [gcUserTableData, setGCUserTableData] = useState([]);
	const [showCreateEditUserModal, setShowCreateEditUserModal] = useState(false);
	const [editUserData, setEditUserData] = useState({});
	const [permissionsInfo, setPermissionInfo] = useState({});
	// Component Methods

	const getUserData = async () => {
		const tableData = [];
    
		const data = await gameChangerAPI.getUserData(cloneName);

		_.forEach(data.data.users, result => {
			tableData.push(result);
		});
    
		setGCUserTableData(tableData);
	}


	const deleteUserData = async (userRowId) => {
		await gameChangerAPI.deleteUserData(userRowId);
	}

	useEffect(()=>{
		getClonePermissions().then(data => {
			setPermissionInfo(data);
		});
		getUserData();
		// eslint-disable-next-line
    },[])

	// The table columns
	const columns = [
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
		},
		{
			Header: 'Admin',
			accessor: 'is_admin',
			width: 100,
			Cell: row => (
				<TableRow>
					<GCCheckbox
						checked={row.value}
						onChange={() => {}}
						name={'admin'}
						color="inherit"
						style={{...styles.checkbox, color: '#1C2D64'}}
					/>
				</TableRow>
			)
		},
		{
			Header: 'Super Admin',
			accessor: 'is_super_admin',
			width: 100,
			Cell: row => (
				<TableRow>
					<GCCheckbox
						checked={row.value}
						onChange={() => {}}
						name={'super_admin'}
						color="inherit"
						style={{...styles.checkbox, color: '#1C2D64'}}
					/>
				</TableRow>
			)
		},
		{
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
		},
		{
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
		}
	];

	return ( 
		<>   
			<div>
				<div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
					<p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>{`${cloneName ? cloneName.toUpperCase() : 'GAMECHANGER'} Users`}</p>
				</div>
				<ReactTable
					data={gcUserTableData}
					columns={columns}
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
	)
});

export default UserList;