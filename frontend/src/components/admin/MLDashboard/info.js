import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Tooltip} from '@material-ui/core'
import GameChangerAPI from '../../api/gameChanger-service-api';
import ReactTable from 'react-table';
import GCPrimaryButton from "../../common/GCButton";
import styles from '../GCAdminStyles';
import "react-table/react-table.css";
import './index.scss';
const status = ['ok', 'loading', 'error'];

const gameChangerAPI = new GameChangerAPI();

const TableRow = styled.div`
	text-align: center;
`

const StatusCircle = styled.div`
    height: 25px;
    width: 25px;
    border-radius: 50%;
    display: inline-block;
    float: right;
    padding:15px;
`

const BorderDiv = styled.div`
    border: 2px solid grey;
    border-radius: 8px;
`

const apiColumns = [
    {
        Header: 'Response',
        accessor: 'response',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Time Stamp',
        accessor: 'timeStamp',
        width:220,
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Status',
        accessor: 'status',
        width:100,
        Cell: row => (
            <TableRow><div style={{borderRadius:'8px'}} className={row.value.toLowerCase()}>{row.value}</div></TableRow>
        )
    }
]


/**
 * This class queries the ml api information and provides controls 
 * for the different endpoints
 * @class MLDashboard
 */
export default (props) => {
	// Set state variables
    const [APIData, setAPIData] = useState({});
    const [currentTransformer, setCurrentTransformer] = useState({});


    // flags that parameters have been changed and on 
    // blur or enter press we should update the query
    const [connectionStatus, setConnectionStatus] = useState(1);
    const [lastQueried, setLastQueried] = useState("");


    /**
     * Load all the initial data on transformers and s3
     * @method onload
     */
    const onload = async ()=>{
        getAPIInformation();
        getCurrentTransformer();
        setLastQueried(new Date(Date.now()).toLocaleString());
    }
    /**
     * Retrieves the current transformer from gameChangerAPI.getCurrentTransformer()
     * @method getCurrentTransformer
     */
    const getCurrentTransformer = async () =>{
        try{
            // set currentTransformer
            const current = await gameChangerAPI.getCurrentTransformer();
            // current.data is of the form {sentence_models:{encoder, sim}}
            setCurrentTransformer(current.data.sentence_models?current.data.sentence_models:{});
            props.updateLogs('Successfully queried current transformer',0);
            setConnectionStatus(0);
        }catch (e) {
            props.updateLogs("Error querying current transformer: " + e.toString() ,2);
            throw e;
        }
    }
    /**
     * Get the general information for the API
     * @method getAPIInformation
     */
     const getAPIInformation = async () =>{
        try{
            // set APIData
            const info = await gameChangerAPI.getAPIInformation();
            setAPIData(info.data);
            props.updateLogs('Successfully queried api information',0);
            setConnectionStatus(0);
        }catch (e) {
            props.updateLogs("Error querying api information: " + e.toString() ,2);
            throw e;
        }
    }

	useEffect(() => {
        onload();
         // eslint-disable-next-line
	},[]);
    

    return (			
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
                <p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>Machine Learning API</p>
                
                <GCPrimaryButton
						onClick={() => {
							onload();
						}}
						style={{minWidth: 'unset'}}
					>Refresh</GCPrimaryButton>
            </div>
            <div className='info'>
                <BorderDiv className='half'>
                    <div style={{width:'100%', display:'inline-block', paddingBottom:'5px'}}>
                        <div style={{display:'inline-block'}}>Current State:</div>
                        <Tooltip title={"Connection " + status[connectionStatus].toUpperCase()} placement="right" arrow><StatusCircle className = {status[connectionStatus]}/></Tooltip>
                    </div>
                    <fieldset className={'field'}>
                        <div className='info-container'>
                            <div style={{width:'35%', boxSizing:'border-box'}} className='half'>
                                Application: <br />
                                Version: <br />
                                Connection Status: <br />
                                Last Queried: <br />
                                Current Transformer: <br />
                                <div style={{paddingLeft:'15px'}}>Encoder:</div> 
                                <div style={{paddingLeft:'15px'}}>Sim:</div>
                            </div>
                            <div style={{width:'65%'}} className='half'>
                                {APIData.API_Name} <br />
                                {APIData.Version} <br />
                                {status[connectionStatus].toUpperCase()} <br />
                                {lastQueried} <br />
                                <br />
                                {currentTransformer.encoder} <br />
                                {currentTransformer.sim} <br />
                            </div>
                        </div>           
                    </fieldset>

                    
                </BorderDiv>
                <BorderDiv className='half' style={{float:'right'}}>
                    <div style={{width:'100%', display:'inline-block', paddingBottom:'5px', marginTop:'10px'}}>
                        <div style={{display:'inline-block'}}>API Response:</div>
                    </div>
                    <fieldset className={'field'}>
                        <div className='info-container'>
                            <ReactTable
                                data={props.apiErrors}
                                columns={apiColumns}
                                className='striped -highlight'
                                defaultSorted = {[ { id: "searchtime", desc: true } ]}
                                defaultPageSize={5}
                            />
                        </div>           
                    </fieldset>
                </BorderDiv>
            </div>
        </div>
    )
}
