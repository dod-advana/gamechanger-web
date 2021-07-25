import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { Select, MenuItem, Tooltip, Input, Checkbox } from '@material-ui/core'
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
const DEFAULT_MODEL_NAME = 'msmarco-distilbert-base-v2';
const DEFAULT_VERSION = 'v4'

/**
 * This class queries the ml api information and provides controls 
 * for the different endpoints
 * @class MLDashboard
 */
export default (props) => {
	// Set state variables
    const [downloadedModelsList, setDonwloadedModelsList] = useState({
        "transformers": {},
        "sentence": {},
        "qexp": {},
    });

    const [APIData, setAPIData] = useState({});
    const [currentTransformer, setCurrentTransformer] = useState({});
    const [selectedSentence, setSelectedSentence] = useState([]);
    const [selectedQEXP, setSelectedQEXP] = useState([]);
	const [loadingData, setLoadingData] = useState(true);

    const [modelName, setModelName] = useState(DEFAULT_MODEL_NAME);
	const [version, setVersion] = useState(DEFAULT_VERSION);
    const [gpu, setgpu] = useState(true);
    const [upload, setUpload] = useState(false);

    // flags that parameters have been changed and on 
    // blur or enter press we should update the query
    const [connectionStatus, setConnectionStatus] = useState(1);
    const [lastQueried, setLastQueried] = useState("");
    const [reloading, setReloading] = useState(false);
    const [training, setTraining] = useState(false);

    /**
     * Load all the initial data on transformers and s3
     * @method onload
     */
    const onload = async ()=>{
        getCurrentTransformer();
        getModelsList();
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
        }catch (e) {
            props.updateLogs("Error querying current transformer: " + e.toString() ,2);
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
            props.updateLogs('Successfully queried models list',0);
        }catch (e) {
            props.updateLogs("Error querying models list: " + e.toString() ,2);
            throw e;
        }
    }
    
    /**
     * @method triggerTrainModel
     */
     const triggerTrainModel = async () => {
        try{
            setTraining(true);
            await gameChangerAPI.trainModel({
                "version": version,
                "encoder_model": modelName,
                "gpu":gpu,
                "upload":upload
            });
            props.updateLogs('Started training',0);
        } catch(e){
            props.updateLogs('Error training model: ' + e.toString() ,2);
        }
        finally{
            setTraining(false);
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
            props.updateLogs('Reloaded Models',0);
        } catch(e){
            props.updateLogs('Error reloading models: ' + e.toString() ,2);
        }
        finally{
            setReloading(false);
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
                    <div style={{width:'100%', display:'inline-block', paddingBottom:'5px'}}>
                        <div style={{display:'inline-block'}}>API Controls:</div>
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
                                {Object.keys(downloadedModelsList.sentence).map((name) => {
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
                                {Object.keys(downloadedModelsList.qexp).map((name) => {
                                    return (
                                        <MenuItem 
                                            style={{fontSize:'small'}}
                                            value={name}>{name}</MenuItem>
                                    )
                                })}
                            </Select>
                        </div>
                        
					</div>

                    <div style={{ width: '100%', padding: '20px', marginBottom: '10px', border: '2px solid darkgray', borderRadius: '6px', display: 'inline-block', justifyContent: 'space-between' }}>
						<b>Train Model</b><br/>
                        <GCPrimaryButton
                            onClick={() => {
                                triggerTrainModel();
                            }}
                            disabled={loadingData || training}
                            style={{float: 'right', minWidth: 'unset'}}
                        >Train</GCPrimaryButton>
                        
                        <div>
                            <div style={{width: '110px', display: 'inline-block'}}>Encoder Model:</div>
                            <Input
                                value={modelName}
                                onChange={e => setModelName(e.target.value)}
                                name="labels"
                                style={{fontSize:'small',  minWidth: 'unset', margin:'10px'}}
                            />
                            <div style={{width: '60px', display: 'inline-block', marginLeft:'20px'}}>GPU:</div>
                            <Checkbox
                                checked = {gpu}
                                onChange={e => setgpu(e.target.checked)}
                            />
                        </div>
                        <div>
                            <div style={{width: '110px', display: 'inline-block'}}>Version:</div>
                            <Input
                                value={version}
                                onChange={e => setVersion(e.target.value)}
                                name="labels"
                                style={{fontSize:'small',  minWidth: 'unset', margin:'10px'}}
                            />
                            <div style={{width: '60px', display: 'inline-block', marginLeft:'20px'}}>Upload:</div>
                            <Checkbox
                                checked = {upload}
                                onChange={e => setUpload(e.target.checked)}
                            />
                        </div>
                        
					</div>
                </BorderDiv>
            </div>
        </div>
    )
}
