import React, { useState, useEffect } from 'react';
import { Tooltip} from '@material-ui/core'
import ReactTable from 'react-table';

import {TableRow, StatusCircle, BorderDiv} from './util/styledDivs';
import styles from '../GCAdminStyles';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCPrimaryButton from "../../common/GCButton";
import "react-table/react-table.css";
import './index.scss';
const status = ['ok', 'warning', 'error', 'loading'];

const gameChangerAPI = new GameChangerAPI();

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
const initTransformer = {
    encoder:'',
    sim:''
}

/**
 * This class queries the ml api information and provides controls 
 * for the different endpoints
 * @class Info
 */
export default (props) => {
	// Set state variables
    const [APIData, setAPIData] = useState({});
    const [currentTransformer, setCurrentTransformer] = useState(initTransformer);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState('');
    const [currentQexp, setCurrentQexp] = useState('');
    const [currentQa, setCurrentQa] = useState('');


    /**
     * Load all the initial data on transformers and s3
     * @method onload
     */
    const onload = async ()=>{
        getAPIInformation();
        getCurrentTransformer();
        
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
            setCurrentTransformer(current.data.sentence_models?current.data.sentence_models:initTransformer);
            setCurrentSentenceIndex(current.data.sentence_index?current.data.sentence_index.replace(/^.*[\\/]/, ''):'');
            setCurrentQexp(current.data.qexp_model?current.data.qexp_model.replace(/^.*[\\/]/, ''):'');
            setCurrentQa(current.data.qa_model?current.data.qa_model.replace(/^.*[\\/]/, ''):'');
            props.updateLogs('Successfully queried current transformer',0);
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
        }catch (e) {
            props.updateLogs("Error querying api information: " + e.toString() ,2);
            throw e;
        }
    }
    /**
     * @method getLastQueried
     * @returns 
     */
    const getLastQueried = () =>{
        let mostRecent = '';
        for(const message of props.apiErrors){
            if(mostRecent === ''){
                mostRecent= message.timeStamp
            }
            else if(Date.parse(message.timeStamp) > Date.parse(mostRecent)){
                mostRecent= message.timeStamp
            }
        }
        return mostRecent
    }
    /**
     * @method getConnectionStatus
     * @return integer 0-3
     */
    const getConnectionStatus = () =>{
        let success = false;
        let error = false;
        for(const message of props.apiErrors){
            if(message.status === "OK"){
                success = true
            }
            if(message.status === "ERROR"){
                error = true
            }
        }
        //setLastQueried(new Date(Date.now()).toLocaleString());
        if(success && error){
            return 1
        }
        else if(!success && error){
            return 2
        }
        else if(!success && ! error){
            return 3
        }
        return 0
    }

	useEffect(() => {
        onload();
         // eslint-disable-next-line
	},[]);
    

    return (			
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
                <p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>General Information</p>
                
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
                        <Tooltip title={"Connection " + status[getConnectionStatus()].toUpperCase()} placement="right" arrow><StatusCircle className = {status[getConnectionStatus()]}/></Tooltip>
                    </div>
                    <fieldset className={'field'}>
                        <div className='info-container'>
                            <div style={{width:'35%', boxSizing:'border-box'}} className='half'>
                                Application: <br />
                                Version: <br />
                                Connection Status: <br />
                                Last Queried: <br />
                                Loaded Models:<br />
                                <div style={{paddingLeft:'15px'}}>Sentence Index:</div> 
                                <div style={{paddingLeft:'15px'}}>Query Expansion:</div> 
                                <div style={{paddingLeft:'15px'}}>Question Answer:</div> 
                                <div style={{paddingLeft:'15px'}}>Transformer:</div> 
                                <div style={{paddingLeft:'30px'}}>Encoder:</div> 
                                <div style={{paddingLeft:'30px'}}>Sim:</div>
                            </div>
                            <div style={{width:'65%'}} className='half'>
                                {APIData.API_Name} <br />
                                {APIData.Version} <br />
                                {status[getConnectionStatus()].toUpperCase()} <br />
                                {getLastQueried()} <br />
                                <br />
                                {currentSentenceIndex} <br />
                                {currentQexp} <br />
                                {currentQa} <br />
                                <br />
                                {currentTransformer.encoder.replace(/^.*[\\/]/, '')}<br />
                                {currentTransformer.sim.replace(/^.*[\\/]/, '')}
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