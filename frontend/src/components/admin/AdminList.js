import React, {useState, useEffect} from 'react';
import ReactTable from "react-table";
import _ from "underscore";

import GameChangerAPI from '../api/gameChanger-service-api';
import GCButton from "../common/GCButton";
import { trackEvent } from '../telemetry/Matomo';
import {styles, TableRow} from './GCAdminStyles';

const gameChangerAPI = new GameChangerAPI();

/**
 * 
 * @class AdminList
 */
export default (props) => {
    // Component Properties
    const {openAdminModal, setPageToView} = props;
    const [gcAdminTableData, setGCAdminTableData] = useState([]);
    // Component Methods

    const getAdminData = async () => {
        const tableData = [];
    
        const data = await gameChangerAPI.getAdminData();
    
        _.forEach(data.data.admins, result => {
            tableData.push({
                username: result.username
            });
        });
    
        setGCAdminTableData(tableData);
    }
	const deleteAdminData = async (username) => {
		await gameChangerAPI.deleteAdminData(username);
	}

    useEffect(()=>{
        getAdminData()
    },[])
    // The table columns
    const columns = [
        {
            Header: 'Username',
            accessor: 'username',
            Cell: row => (
                <TableRow>{row.value}</TableRow>
            )
        },
        {
            Header: ' ',
            accessor: 'username',
            width: 150,
            Cell: row => (
                <TableRow>
                    <GCButton
                        onClick={() => {
                            trackEvent('GAMECHANGER_Admin', "DeleteAdmin", "onClick", row.value);
                            deleteAdminData(row.value).then(() => {
                                getAdminData(setGCAdminTableData).then(() => {
                                    setPageToView();
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
        <div>
			<div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
				<p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>Gamechanger Admins</p>
				<GCButton
					onClick={() => {
						trackEvent('GAMECHANGER_Admin', "CreateAdmin", "onClick");
						openAdminModal()
					}}
					style={{minWidth: 'unset'}}
				>Create Admin</GCButton>
			</div>
			<ReactTable
				data={gcAdminTableData}
				columns={columns}
				style={{margin: '0 80px 20px 80px', height: 700}}
				pageSize={10}
			/>
		</div>
    )
}