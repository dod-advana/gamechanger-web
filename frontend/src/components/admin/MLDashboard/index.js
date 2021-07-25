import React, { useState, useEffect } from 'react';
import { Tabs, Tab, TabPanel, TabList } from "react-tabs";
import { Typography } from "@material-ui/core";
import TabStyles from '../../common/TabStyles';
import styles from '../GCAdminStyles';
import Info from './info';
import S3 from './s3';
import Models from './models';

const status = ['ok', 'loading', 'error'];
const logs = [];

/**
 * This class queries the ml api information and provides controls 
 * for the different endpoints
 * @class MLDashboard
 */
 export default () => {
	const [tabIndex, setTabIndex] = useState('documents');
	const [apiErrors, setApiErrors] = useState([]);
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

	useEffect(() => {
        
         // eslint-disable-next-line
	},[]);
    

    return (
		<div style={{...TabStyles.tabContainer, minHeight:"calc(100vh-100px)"}}>
			<div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 80px'}}>
                <p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>Machine Learning API</p>
            </div>
			<Tabs>
				<div style={TabStyles.tabButtonContainer}>
					<TabList style={TabStyles.tabsList}>
						<Tab style={{...TabStyles.tabStyle,
							...(tabIndex === 'documents' ? TabStyles.tabSelectedStyle : {}),
							borderRadius: `5px 0 0 0`
							}} title="userHistory" onClick={() => setTabIndex('documents')}>
							<Typography variant="h6" display="inline" title="cardView">INFORMATION</Typography>
						</Tab>
						<Tab style={{...TabStyles.tabStyle,
							...(tabIndex === 'crawler' ? TabStyles.tabSelectedStyle : {}),
							borderRadius: '0 0 0 0'}}
							title="crawlerTable" onClick={() => setTabIndex('crawler')}>
							<Typography variant="h6" display="inline">PROGRESS</Typography>
						</Tab>
						<Tab style={{
							...TabStyles.tabStyle,
							...(tabIndex === 'version' ? TabStyles.tabSelectedStyle : {}),
							borderRadius: `0 0 0 0`
						}} title="versionDocs" onClick={() => setTabIndex('version')}>
							<Typography variant="h6" display="inline" title="cardView">S3</Typography>
						</Tab>
						<Tab style={{
							...TabStyles.tabStyle,
							...(tabIndex === 'models' ? TabStyles.tabSelectedStyle : {}),
							borderRadius: `0 5px 0 0`
						}} title="models" onClick={() => setTabIndex('models')}>
							<Typography variant="h6" display="inline" title="cardView">MODELS</Typography>
						</Tab>
					</TabList>

					<div style={TabStyles.spacer}  />
				</div>

				<div style={TabStyles.panelContainer}>
					<TabPanel>
						<Info apiErrors={apiErrors} updateLogs={updateLogs}/>
					</TabPanel>
					<TabPanel>
						<Info apiErrors={apiErrors} updateLogs={updateLogs}/>
					</TabPanel>
					<TabPanel>
						<S3 updateLogs={updateLogs}/>
					</TabPanel>
					<TabPanel>
						<Models updateLogs={updateLogs}/>
					</TabPanel>
				</div>
			</Tabs>
		</div>)
 }