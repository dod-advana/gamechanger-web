import React, { useState, useEffect } from 'react';
import { Tooltip, Input} from '@material-ui/core'
import {TableRow, BorderDiv} from './util/styledDivs';
import GameChangerAPI from '../../api/gameChanger-service-api';
import ReactTable from 'react-table';
import GCPrimaryButton from "../../common/GCButton";
import styles from '../GCAdminStyles';
import "react-table/react-table.css";
import './index.scss';
const status = ['ok', 'loading', 'error'];

const gameChangerAPI = new GameChangerAPI();

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

const S3_CORPUS_PATH = 'gamechanger/json';

/**
 * This class queries the ml api information and provides controls 
 * for the different endpoints
 * @class MLDashboard
 */
export default (props) => {
	// Set state variables
    const [s3List, setS3List] = useState([]);
    const [corpus, setCorpus] = useState(S3_CORPUS_PATH);

    // flags that parameters have been changed and on 
    // blur or enter press we should update the query
    const [downloading, setDownloading] = useState(false);
    const [downloadingCorpus, setDownloadingCorpus] = useState(false);

    
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
            props.updateLogs('Successfully queried s3 models',0);
        }catch (e) {
            props.updateLogs("Error querying s3 models: " + e.toString() ,2);
            throw e;
        }
    }
    
    /**
     * @method triggerDownloadModel
     */
    const triggerDownloadModel = async () => {
        try{
            setDownloading(true);
            await gameChangerAPI.downloadDependencies();
            props.updateLogs('Triggered download dependencies',0);
        } catch(e){
            props.updateLogs('Error setting transformer model: ' + e.toString() ,2);
        }
        finally{
            setDownloading(false);
        }
    }
    /**
     * @method triggerDownloadCorpus
     */
     const triggerDownloadCorpus = async () => {
        try{
            setDownloadingCorpus(true);
            await gameChangerAPI.downloadCorpus({
                "corpus": corpus
            });
            props.updateLogs('Downloaded Corpus: '+ corpus,0);
        } catch(e){
            props.updateLogs('Error downloading corpus: ' + e.toString() ,2);
        }
        finally{
            setDownloadingCorpus(false);
        }
    }

	useEffect(() => {
        getS3List();
         // eslint-disable-next-line
	},[]);
    

    return (			
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
                <p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>S3 Resources and Controls</p>
                
                <GCPrimaryButton
						onClick={() => {
							getS3List();
						}}
						style={{minWidth: 'unset'}}
					>Refresh</GCPrimaryButton>
            </div>
            <div className='info'>
                <BorderDiv className='half'>
                    <div style={{width:'100%', display:'inline-block', paddingBottom:'5px'}}>
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
                </BorderDiv>
                <BorderDiv className='half' style={{float:'right'}}>
                    <div style={{width:'100%', display:'inline-block', paddingBottom:'5px'}}>
                        <div style={{display:'inline-block'}}>API Controls:</div>
                    </div>
                    <div style={{ width: '100%', padding: '20px', marginBottom: '10px', border: '2px solid darkgray', borderRadius: '6px', display: 'inline-block', justifyContent: 'space-between' }}>
						<b>Download dependencies from s3 Args</b>
                        <GCPrimaryButton
                            onClick={() => {
                                triggerDownloadModel();
                            }}
                            disabled={downloading}
                            style={{float: 'right', minWidth: 'unset'}}
                        >Download</GCPrimaryButton>
                    </div>
                    <div style={{ width: '100%', padding: '20px', marginBottom: '10px', border: '2px solid darkgray', borderRadius: '6px', display: 'inline-block', justifyContent: 'space-between' }}>
						<b>Download Corpus</b><br/>
                        <GCPrimaryButton
                            onClick={() => {
                                triggerDownloadCorpus();
                            }}
                            disabled={downloadingCorpus}
                            style={{float: 'right', minWidth: 'unset'}}
                        >Download</GCPrimaryButton>
                        <div>
                            Corpus:
                            <Input
                                value={corpus}
                                onChange={e => setCorpus(e.target.value)}
                                name="labels"
                                style={{fontSize:'small',  minWidth: 'unset', margin:'10px'}}
                            />
                        </div>
                        
					</div>
                </BorderDiv>
            </div>
        </div>
    )
}
