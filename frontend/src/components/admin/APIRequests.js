import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import Popover from '@material-ui/core/Popover';
import CloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';

import GameChangerAPI from '../api/gameChanger-service-api';
import GCAccordion from '../common/GCAccordion';
import GCButton from '../common/GCButton';
import { trackEvent } from '../telemetry/Matomo';
import { styles, TableRow } from './util/GCAdminStyles';

const gameChangerAPI = new GameChangerAPI();

/**
 * A table to view api keys and requests
 * @class APIRequests
 */
export default () => {
	// State Variables
	const [gcAPIRequestData, setGCAPIRequestData] = useState({
		approved: [],
		pending: [],
	});
	const [gcAPIKeyVision, setGCAPIKeyVision] = useState(false);
	const [popperIsOpen, setPopperIsOpen] = useState(false);
	const [popperAnchorEl, setPopperAnchorEl] = useState(null);
	const [keyDescriptions, setKeyDescriptions] = useState({});
	// Comonent Methods
	/**
     * Grabs all the data from the backend to populate the table
     * @method getApiKeyRequestData
     */
	const getApiKeyRequestData = async () => {
		const { data } = await gameChangerAPI.getAPIKeyRequestData();
		data.pending.forEach((request, idx) => {
			const cloneString = request.clone_meta.map(meta => meta.clone_name).join(', ');
			data.pending[idx].cloneString = cloneString;
		})
		data.approved.forEach((request, idx) => {
			const cloneString = request.keyClones.map(clone => clone.clone_name).join(', ');
			data.approved[idx].cloneString = cloneString;
		})
		setGCAPIRequestData(data || {approved: [], pending: []});
	}

	useEffect(()=>{
		if(!Object.keys(keyDescriptions).length){
			const descriptions = {};
			gcAPIRequestData.approved.forEach(request => descriptions[request.key] = request.description);
			setKeyDescriptions(descriptions);
		}
	}, [gcAPIRequestData, keyDescriptions])
	/**
     * Attemps to revoke a key based on the id
     * @method revokeAPIKeyRequestData
     * @param {*} id 
     */
	const revokeAPIKeyRequestData = async (id) => {
		gameChangerAPI.revokeAPIKeyRequest(id).then(resp => {
			getApiKeyRequestData();
		});
	};
	/**
     * Either approves or rejects a key request with an id and boolean
     * @method approveRejectAPIKeyRequestData
     * @param {Object} request - API key request containing it's ID and the associated username
     * @param {*} request.id
     * @param {string} request.username
     * @param {boolean} approve 
     */
	const approveRejectAPIKeyRequestData = async ({ id, username }, approve) => {
		if(gcAPIRequestData.approved.find(request => request.username === username && approve)){ 
			return setPopperIsOpen(true);
		}
		gameChangerAPI.approveRejectAPIKeyRequest(id, approve).then(resp => {
			getApiKeyRequestData();
		});
	}
	useEffect(()=>{
		getApiKeyRequestData()
	},[]);

	const handleChange = (key, event) => {
		const newDescriptions = {...keyDescriptions};
		newDescriptions[key] = event.target.value;
		setKeyDescriptions(newDescriptions);
	}
	// Columns 
	const approvedColumns = [
		{
			Header: 'Name',
			accessor: 'name',
			width: 200,
			Cell: row => (
				<TableRow>{row.value}</TableRow>
			)
		},
		{
			Header: 'Username',
			accessor: 'username',
			width: 200,
			Cell: row => (
				<TableRow>{row.value}</TableRow>
			)
		},
		{
			Header: 'Email',
			accessor: 'email',
			width: 200,
			Cell: row => (
				<TableRow>{row.value}</TableRow>
			)
		},
		{
			Header: 'Decscription',
			accessor:  'key',
			width: 200,
			Cell: row => (
				<TableRow>
					{Object.keys(keyDescriptions).length && 
                    <input style={{width: '100%'}} value={keyDescriptions[row.value]} onChange={(event) => handleChange(row.value, event)} />}
				</TableRow>
			)
		},
		{
			Header: 'Clones',
			accessor: 'cloneString',
			width: 200,
			Cell: row => (
				<TableRow>{row.value}</TableRow>
			)
		},
		{
			Header: 'Key',
			accessor: 'key',
			Cell: row => 
			{ return (gcAPIKeyVision ? 
				<TableRow>{row.value}</TableRow> :
				<TableRow>******************************************</TableRow> )
			}
		},
		{
			Header: ' ',
			accessor: 'key',
			width: 120,
			Cell: row => (
				<TableRow>
					<GCButton
						onClick={() => {
							// trackEvent('GAMECHANGER_Admin', "AdminPage", "DeleteAPIKey", row.value);
							gameChangerAPI.updateAPIKeyDescription(keyDescriptions[row.value], row.value);
						}}
						style={{minWidth: 'unset', backgroundColor: 'green', borderColor: 'green', height: 35}}
					>Update</GCButton>
				</TableRow>
			)
		},
		{
			Header: ' ',
			accessor: 'id',
			width: 120,
			Cell: row => (
				<TableRow>
					<GCButton
						onClick={() => {
							trackEvent('GAMECHANGER_Admin', 'AdminPage', 'DeleteAPIKey', row.value);
							revokeAPIKeyRequestData(row.value);
						}}
						style={{minWidth: 'unset', backgroundColor: 'red', borderColor: 'red', height: 35}}
					>Revoke</GCButton>
				</TableRow>
			)
		}
	]
    
	const pendingColumns = [
		{
			Header: 'Name',
			accessor: 'name',
			width: 200,
			Cell: row => (
				<TableRow>{row.value}</TableRow>
			)
		},
		{
			Header: 'Username',
			accessor: 'username',
			width: 200,
			Cell: row => (
				<TableRow>{row.value}</TableRow>
			)
		},
		{
			Header: 'Email',
			accessor: 'email',
			width: 200,
			Cell: row => (
				<TableRow>{row.value}</TableRow>
			)
		},
		{
			Header: 'Reason',
			accessor: 'reason',
			Cell: row => (
				<TableRow>{row.value}</TableRow>
			)
		},
		{
			Header: 'Clones',
			accessor: 'cloneString',
			Cell: row => (
				<TableRow>{row.value}</TableRow>
			)
		},
		{
			Header: ' ',
			id: 'Approve',
			accessor:  request => {return {id: request.id, username: request.username}},
			width: 230,
			Cell: row => (
				<TableRow>
					<GCButton
						onClick={(event) => {
							setPopperAnchorEl(event.target);
							trackEvent('GAMECHANGER_Admin', 'AdminPage', 'ApproveAPIKeyRequest', row.value);
							approveRejectAPIKeyRequestData(row.value, true);
						}}
						style={{minWidth: 'unset', backgroundColor: 'green', borderColor: 'green', height: 35}}
					>Approve</GCButton>
					<GCButton
						onClick={() => {
							trackEvent('GAMECHANGER_Admin', 'AdminPage', 'RejectAPIKeyRequest', row.value);
							approveRejectAPIKeyRequestData(row.value, false);
						}}
						style={{minWidth: 'unset', backgroundColor: 'red', borderColor: 'red', height: 35}}
					>Reject</GCButton>
				</TableRow>
			)
		}
	]

	const CloseButton = styled.div`
        padding: 6px;
        background-color: white;
        border-radius: 5px;
        color: #8091A5 !important;
        border: 1px solid #B0B9BE;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex: .4;
        position: absolute;
        right: 15px;
        top: 15px;
    `;

	const handleClosePopOver = () => {
    	setPopperIsOpen(false);
		setPopperAnchorEl(null);
	}

	const renderPopOver = () => {
		return<Popover
			onClose={() => handleClosePopOver()}
			open={popperIsOpen} anchorEl={popperAnchorEl}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
		>
			<div style={{padding: '0px 15px 10px'}}>
				<div style={{display: 'flex', justifyContent: 'flex-end'}}>
					<CloseButton onClick={() => handleClosePopOver()}>
						<CloseIcon fontSize="small"/>
					</CloseButton>
				</div>
				<div style={{width: 350, margin: 5}}>
					<div style={{margin: '65px 15px 0'}}>User already has an API key. Either reject the request or revoke the user's current API key.
					</div>
					<div style={{display: 'flex', justifyContent: 'flex-end'}}>
						<GCButton
							onClick={() => handleClosePopOver()}
							style={{
								height: 40,
								minWidth: 40,
								padding: '2px 8px 0px',
								fontSize: 14,
								margin: '16px 0px 0px 10px'
							}}
							isSecondaryBtn={true}
						>Close
						</GCButton>
					</div>
				</div>
			</div>
		</Popover>
	}
     
	return (
		<div style={{height: '100%'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
				<p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>API Key Requests</p>
			</div>

			{renderPopOver()}
            
			<div style={{margin: '10px 80px'}}>
				<GCAccordion expanded={false} header={'APPROVED API KEYS'}>
					<div style={{display:'flex', flexDirection: 'column', width: '100%'}}>
						<ReactTable
							data={gcAPIRequestData.approved}
							columns={approvedColumns}
							pageSize={10}
							style={{width: '100%'}}
							getTheadTrProps={() => {
								return { style: { height: 'fit-content', textAlign: 'left', fontWeight: 'bold' } };
							}}
							getTheadThProps={() => {
								return { style: { fontSize: 15, fontWeight: 'bold', borderBottom: 'rgba(0,0,0,0.05) 1px solid' } };
							}}
						/>
						{gcAPIRequestData.approved.length>0 && <GCButton
							id={'editCloneSubmit'}
							onClick={()=>setGCAPIKeyVision(!gcAPIKeyVision)}
							style={{margin:'10px'}}
						>
                            Show/Hide API keys
						</GCButton>}
					</div>
				</GCAccordion>
				<GCAccordion expanded={true} header={'PENDING API KEYS'}>
					<ReactTable
						data={gcAPIRequestData.pending}
						columns={pendingColumns}
						pageSize={10}
						style={{width: '100%'}}
						getTheadTrProps={() => {
							return { style: { height: 'fit-content', textAlign: 'left', fontWeight: 'bold' } };
						}}
						getTheadThProps={() => {
							return { style: { fontSize: 15, fontWeight: 'bold', borderBottom: 'rgba(0,0,0,0.05) 1px solid' } };
						}}
					/>
				</GCAccordion>
			</div>
		</div>
	)
}
