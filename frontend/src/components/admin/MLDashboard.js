import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Select, MenuItem, Tooltip } from '@material-ui/core'
import GameChangerAPI from '../api/gameChanger-service-api';
import ReactTable from 'react-table';
import GCPrimaryButton from "../common/GCButton";
import { trackEvent } from '../telemetry/Matomo';
import styles from './GCAdminStyles';
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

const s3Columns = [
    {
        Header: 'Tar File',
        accessor: 'file',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Upload Time',
        accessor: 'upload',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    }
]
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
const logs = [];
let loaded = 0;
let errored = 0;

/**
 * This class queries the ml api information and provides controls 
 * for the different endpoints
 * @class MLDashboard
 */
export default () => {

	// Set state variables
    const [downloadedModelsList, setDonwloadedModelsList] = useState({
        "transformers": [],
        "sentence": [],
        "qexp": [],
    });
    const [s3List, setS3List] = useState([]);
    const [APIData, setAPIData] = useState({});
    const [currentTransformer, setCurrentTransformer] = useState({});
    const [selectedSentence, setSelectedSentence] = useState([]);
    const [selectedQEXP, setSelectedQEXP] = useState([]);
	const [loadingData, setLoadingData] = useState(true);

    // flags that parameters have been changed and on 
    // blur or enter press we should update the query
    const [connectionStatus, setConnectionStatus] = useState(1);
    const [lastQueried, setLastQueried] = useState("");
    const [apiErrors, setApiErrors] = useState([]);
    const [reloading, setReloading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    /**
     * Creates log objects with the inital message, 
     * status level, and time it was triggered.
     * @method updateLogs
     * @param {String} log - the message
     * @param {Number} logStatus - 0,1,2 which correlate to a status const
     */
    const updateLogs = (log, logStatus) => {
        const enterStatus = status[logStatus].toUpperCase();
        logs.push({
            response:log,
            timeStamp: new Date(Date.now()).toLocaleString(),
            status:enterStatus
        });
        setApiErrors([].concat(logs));
    }
    /**
     * Track if all asnyc calls have loaded or errored
     * @method updateLoadCounter
     * @param {Boolean} error - just pass in true if there was an error
     */
    const updateLoadCounter = (error) => {
        loaded ++;
        errored = !error? errored:errored +1;
        // Set status to OK or ERROR
        if (loaded>=4){
            if(errored > 0){
                setConnectionStatus(2);
            }
            else{
                setConnectionStatus(0);
            }
            setLoadingData(false);
        }
    }
    /**
     * Load all the initial data on transformers and s3
     * @method onload
     */
    const onload = async ()=>{
        loaded = 0;
        errored = 0;
        try {
            // The awaits are for the try catch 
            // to work and the finally to come last.
            getAPIInformation();
            getCurrentTransformer();
            getS3List();
            getModelsList();

        } catch (e) {
            // Set status to ERROR
            setConnectionStatus(2);
        }
        finally{
            setLastQueried(new Date(Date.now()).toLocaleString());
        }
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
            setCurrentTransformer(current.data.sentence_models);
            updateLogs('Successfully queried current transformer',0);
            updateLoadCounter();
        }catch (e) {
            updateLogs("Error querying current transformer: " + e.toString() ,2);
            updateLoadCounter(true);
            throw e;
        }
    }
    /**
     * Get all the tar files in s3 with their upload time.
     * @method getS3List
     */
    const getS3List = async () =>{
        try{
            // set transformerList
            const slist = await gameChangerAPI.getS3List();
            const setList = [];
            // slist is an array of arrays of length 2.
            // First is the name of the tar file,
            // the second is the time it was uploaded to s3
            for(const s3 of slist.data){
                setList.push({
                    file: s3[0],
                    upload: s3[1]
                })
            }
            setS3List(setList);
            updateLogs('Successfully queried s3 models',0);
            updateLoadCounter();
        }catch (e) {
            updateLogs("Error querying s3 models: " + e.toString() ,2);
            updateLoadCounter(true);
            throw e;
        }
    }
    /**
     * Get a list of all the downloaded sentence index, qexp, and transformers.
     * @method getModelsList
     */
    const getModelsList = async () =>{
        try{
            // set downloadedModelsList
            const list = await gameChangerAPI.getModelsList();
            setDonwloadedModelsList(list.data);
            updateLogs('Successfully queried models list',0);
            updateLoadCounter();
        }catch (e) {
            updateLogs("Error querying models list: " + e.toString() ,2);
            updateLoadCounter(true);
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
            updateLogs('Successfully queried api information',0);
            updateLoadCounter();
        }catch (e) {
            updateLogs("Error querying api information: " + e.toString() ,2);
            updateLoadCounter(true);
            throw e;
        }
    }
    /**
     * @method triggerDownload
     */
    const triggerDownload = async () => {
        try{
            setDownloading(true);
            await gameChangerAPI.downloadDependencies();
            updateLogs('Triggered download dependencies',0);
        } catch(e){
            updateLogs('Error setting transformer model: ' + e.toString() ,2);
        }
        finally{
            setDownloading(false);
        }
    }
    /**
     * @method triggerReloadModels
     */
    const triggerReloadModels = async () => {
        try{
            setReloading(true);
            await gameChangerAPI.reloadModels({
                "transformer": "",
                "sentence": selectedSentence,
                "qexp": selectedQEXP,
            });
            updateLogs('Reloaded Models',0);
        } catch(e){
            updateLogs('Error reloading models: ' + e.toString() ,2);
        }
        finally{
            setReloading(false);
        }
    }

	useEffect(() => {
		onload();
	}, []);
    

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
                    <div style={{width:'100%', display:'inline-block', paddingBottom:'5px', marginTop:'10px'}}>
                        <div style={{display:'inline-block'}}>S3 Models:</div>
                    </div>
                    <fieldset className={'field'}>
                        <div className='info-container'>
                            <ReactTable
                                data={s3List}
                                columns={s3Columns}
                                className='striped -highlight'
                                defaultPageSize={10}
                            />
                        </div>           
                    </fieldset>
                    <div style={{width:'100%', display:'inline-block', paddingBottom:'5px', marginTop:'10px'}}>
                        <div style={{display:'inline-block'}}>API Response:</div>
                    </div>
                    <fieldset className={'field'}>
                        <div className='info-container'>
                            <ReactTable
                                data={apiErrors}
                                columns={apiColumns}
                                className='striped -highlight'
                                defaultSorted = {[ { id: "searchtime", desc: true } ]}
                                defaultPageSize={5}
                            />
                        </div>           
                    </fieldset>
                </BorderDiv>
                <BorderDiv className='half' style={{float:'right'}}>
                    <div style={{width:'100%', display:'inline-block', paddingBottom:'5px'}}>
                        <div style={{display:'inline-block'}}>API Controls:</div>
                    </div>
                    <div style={{ width: '100%', padding: '20px', marginBottom: '10px', border: '2px solid darkgray', borderRadius: '6px', display: 'inline-block', justifyContent: 'space-between' }}>
						<b>Download dependencies from s3 Args</b>
                        <GCPrimaryButton
                            onClick={() => {
                                triggerDownload();
                            }}
                            disabled={loadingData || downloading}
                            style={{float: 'right', minWidth: 'unset'}}
                        >Download</GCPrimaryButton>
                    </div>
                    <div style={{ width: '100%', padding: '20px', marginBottom: '10px', border: '2px solid darkgray', borderRadius: '6px', display: 'inline-block', justifyContent: 'space-between' }}>
						<b>Reload Models</b><br/>
                        <GCPrimaryButton
                            onClick={() => {
                                triggerReloadModels();
                            }}
                            disabled={loadingData || reloading}
                            style={{float: 'right', minWidth: 'unset'}}
                        >Reload</GCPrimaryButton>
                        <div>
                            Sentence Model:
                            <Select
                                value={selectedSentence}
                                onChange={e => setSelectedSentence(e.target.value)}
                                name="labels"
                                style={{fontSize:'small',  minWidth: 'unset', margin:'10px'}}
                            >
                                {downloadedModelsList.sentence.map((name) => {
                                    return (
                                        <MenuItem 
                                            style={{fontSize:'small'}}
                                            value={name}>{name}</MenuItem>
                                    )
                                })}
                            </Select><br/>
                            QEXP Model:
                            <Select
                                value={selectedQEXP}
                                onChange={e => setSelectedQEXP(e.target.value)}
                                name="labels"
                                style={{fontSize:'small',  minWidth: 'unset', margin:'10px'}}
                            >
                                {downloadedModelsList.qexp.map((name) => {
                                    return (
                                        <MenuItem 
                                            style={{fontSize:'small'}}
                                            value={name}>{name}</MenuItem>
                                    )
                                })}
                            </Select>
                        </div>
                        
					</div>
                </BorderDiv>
            </div>
        </div>
    )
}
