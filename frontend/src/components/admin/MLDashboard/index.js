import React, { useState, useEffect } from 'react';
import { Tabs, Tab, TabPanel, TabList } from 'react-tabs';
import { Typography } from '@material-ui/core';
import TabStyles from '../../common/TabStyles';
import GameChangerAPI from '../../api/gameChanger-service-api';
import { styles } from '../util/GCAdminStyles';
import Training from './training';
import Inference from './inference';

const gameChangerAPI = new GameChangerAPI();
const status = ['ok', 'warning', 'error'];
const logs = [];
const trainLogs = [];
let processTimer;
/**
 * This class queries the ml api information and provides controls
 * for the different endpoints
 * @class MLDashboard
 */
export default () => {
	const [tabIndex, setTabIndex] = useState('train');
	const [apiErrors, setApiErrors] = useState([]);
	const [apiTrainErrors, setApiTrainErrors] = useState([]);
	const [processes, setProcesses] = useState({});

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
			response: log,
			timeStamp: new Date(Date.now()).toLocaleString(),
			status: enterStatus,
		});
		setApiErrors([].concat(logs));
	};

	/**
	 * Creates log objects with the inital message,
	 * status level, and time it was triggered.
	 * @method updateTrainLogs
	 * @param {String} log - the message
	 * @param {Number} logStatus - 0,1,2 which correlate to a status const
	 */
	const updateTrainLogs = (log, logStatus) => {
		const enterStatus = status[logStatus].toUpperCase();
		trainLogs.push({
			response: log,
			timeStamp: new Date(Date.now()).toLocaleString(),
			status: enterStatus,
		});
		setApiTrainErrors([].concat(trainLogs));
	};

	/**
	 * Get the current and past processes and flags for the API
	 * @method getProcesses
	 */
	const getProcesses = async () => {
		try {
			// set processes
			const processesData = await gameChangerAPI.getProcessStatus();
			setProcesses(processesData.data);
			checkProcesses(processesData.data);
		} catch (e) {
			updateLogs('Error querying processes: ' + e.toString(), 2);
			throw e;
		}
	};
	/**
	 * Checks all of the flags. If any of them are true then check again in 5 seconds.
	 * @method
	 */
	const checkProcesses = (processesData) => {
		if (processesData && processesData.process_status && processesData.process_status.flags) {
			let checkProcess = false;
			const flags = processesData.process_status.flags;
			for (const key in flags) {
				if (flags[key]) {
					checkProcess = true;
				}
			}
			if (checkProcess) {
				clearTimeout(processTimer);
				processTimer = setTimeout(getProcesses, 10000);
			}
		}
	};

	useEffect(() => {
		getProcesses();
		return () => {
			clearTimeout(processTimer);
		};
		// eslint-disable-next-line
	}, []);

	return (
		<div style={{ ...TabStyles.tabContainer, minHeight: 'calc(100vh-100px)' }}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					padding: '10px 80px',
					position: 'absolute',
					right: '0px',
				}}
			>
				<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>Machine Learning API</p>
			</div>
			<Tabs>
				<div
					style={{
						...TabStyles.tabButtonContainer,
						background: 'rgb(245 245 245)',
					}}
				>
					<TabList style={TabStyles.tabsList}>
						{/* <Tab
							style={{
								...TabStyles.tabStyle,
								...(tabIndex === 'processes' ? TabStyles.tabSelectedStyle : {}),
								borderRadius: '0 0 0 0',
							}}
							title="processes"
							onClick={() => setTabIndex('processes')}
						>
							<Typography variant="h6" display="inline">
								PROCESSES
							</Typography>
						</Tab> */}
						<Tab
							style={{
								...TabStyles.tabStyle,
								...(tabIndex === 'train' ? TabStyles.tabSelectedStyle : {}),
								borderRadius: `0 0 0 0`,
							}}
							title="train"
							onClick={() => setTabIndex('train')}
						>
							<Typography variant="h6" display="inline">
								TRAINING
							</Typography>
						</Tab>
						<Tab
							style={{
								...TabStyles.tabStyle,
								...(tabIndex === 'infer' ? TabStyles.tabSelectedStyle : {}),
								borderRadius: `0 5px 0 0`,
							}}
							title="infer"
							onClick={() => setTabIndex('infer')}
						>
							<Typography variant="h6" display="inline">
								INFERENCE
							</Typography>
						</Tab>
					</TabList>
					<div style={TabStyles.spacer} />
				</div>

				<div style={TabStyles.panelContainer}>
					<TabPanel>
						<Training
							apiTrainErrors={apiTrainErrors}
							updateTrainLogs={updateTrainLogs}
							processes={processes}
							getProcesses={getProcesses}
						/>
					</TabPanel>
					<TabPanel>
						<Inference
							apiErrors={apiErrors}
							updateLogs={updateLogs}
							processes={processes}
							getProcesses={getProcesses}
						/>
					</TabPanel>
				</div>
			</Tabs>
		</div>
	);
};
