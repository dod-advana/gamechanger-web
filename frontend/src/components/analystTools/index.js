import React, { useEffect, useState } from 'react';
import { backgroundGreyDark, backgroundWhite, gcOrange } from '../common/gc-colors';
import { Typography } from '@material-ui/core';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import propTypes from 'prop-types';
import { trackEvent } from '../telemetry/Matomo';
import { getTrackingNameForFactory } from '../../utils/gamechangerUtils';
import PolicyDocumentsComparisonTool from '../modules/policy/policyDocumentsComparisonTool';
import EDADocumentsComparisonTool from '../modules/eda/edaDocumentsComparisonTool';
import { setState } from '../../utils/sharedFunctions';
import GCResponsibilityExplorer from './responsibilityExplorer/GCResponsibilityExplorer';

const AnalystTools = ({ context, showResponsibilityExplorer = true, showDocumentComparisonTool = true }) => {
	const { state, dispatch } = context;

	const [tabIndex, setTabIndex] = useState('');

	const TAB_INDEX = {
		RESPONSIBILITY_EXPLORER: 'responsibility_explorer',
		DOCUMENT_COMPARISON_TOOL: 'dct',
	};

	useEffect(() => {
		if (showResponsibilityExplorer) {
			setState(dispatch, { analystToolsPageDisplayed: 'Responsibility Explorer' });
			setTabIndex(TAB_INDEX.RESPONSIBILITY_EXPLORER);
		} else if (showDocumentComparisonTool) {
			setState(dispatch, { analystToolsPageDisplayed: 'Document Comparison Tool' });
			setTabIndex(TAB_INDEX.DOCUMENT_COMPARISON_TOOL);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleTabClicked = (tabIndex) => {
		trackEvent(
			getTrackingNameForFactory(state.cloneData.clone_name),
			'ResponsibilityTracker',
			`${tabIndex} tab clicked`
		);

		switch (tabIndex) {
			case TAB_INDEX.RESPONSIBILITY_EXPLORER:
				setState(dispatch, { analystToolsPageDisplayed: 'Responsibility Explorer' });
				break;
			case TAB_INDEX.DOCUMENT_COMPARISON_TOOL:
				setState(dispatch, { analystToolsPageDisplayed: 'Document Comparison Tool' });
				break;
			default:
				break;
		}

		setTabIndex(tabIndex);
	};

	return (
		<>
			<div style={styles.tabContainer}>
				<Tabs>
					<div style={styles.tabButtonContainer}>
						<TabList style={styles.tabsList}>
							{showResponsibilityExplorer && (
								<Tab
									style={{
										...styles.tabStyle,
										...(tabIndex === TAB_INDEX.RESPONSIBILITY_EXPLORER
											? styles.tabSelectedStyle
											: {}),
										borderRadius: `5px 5px 0 0`,
									}}
									title="userHistory"
									onClick={() => handleTabClicked(TAB_INDEX.RESPONSIBILITY_EXPLORER)}
								>
									<Typography variant="h6" display="inline" title="cardView">
										RESPONSIBILITY EXPLORER
									</Typography>
								</Tab>
							)}
							{showDocumentComparisonTool && (
								<Tab
									style={{
										...styles.tabStyle,
										...(tabIndex === TAB_INDEX.DOCUMENT_COMPARISON_TOOL
											? styles.tabSelectedStyle
											: {}),
										borderRadius: `5px 5px 0 0`,
									}}
									title="userHistory"
									onClick={() => handleTabClicked(TAB_INDEX.DOCUMENT_COMPARISON_TOOL)}
								>
									<Typography variant="h6" display="inline" title="cardView">
										DOCUMENT COMPARISON TOOL
									</Typography>
								</Tab>
							)}
						</TabList>

						<div style={styles.panelContainer}>
							{showResponsibilityExplorer && (
								<TabPanel>
									<GCResponsibilityExplorer state={state} dispatch={dispatch} />
								</TabPanel>
							)}
							{showDocumentComparisonTool && (
								<TabPanel>
									{state.cloneData.clone_name === 'eda' ? (
										<EDADocumentsComparisonTool context={context} />
									) : (
										<PolicyDocumentsComparisonTool context={context} />
									)}
								</TabPanel>
							)}
						</div>
					</div>
				</Tabs>
			</div>
		</>
	);
};

const styles = {
	buttons: {
		paddingTop: 2,
	},
	tabsList: {
		borderBottom: `2px solid ${gcOrange}`,
		padding: 0,
		display: 'flex',
		alignItems: 'center',
		flex: 9,
		margin: '10px 0 10px 0px',
	},
	tabStyle: {
		//width: '180px',
		border: '1px solid',
		borderColor: backgroundGreyDark,
		borderBottom: 'none !important',
		borderRadius: `6px 6px 0px 0px`,
		position: ' relative',
		listStyle: 'none',
		padding: '2px 12px',
		cursor: 'pointer',
		textAlign: 'center',
		backgroundColor: backgroundWhite,
		marginRight: '2px',
		marginLeft: '2px',
		height: 45,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabSelectedStyle: {
		border: '1px solid transparent',
		backgroundColor: gcOrange,
		borderColor: 'none',
		color: 'white',
	},
	tabContainer: {
		// alignItems: 'center',
		// minHeight: '613px',
	},
	tabButtonContainer: {
		backgroundColor: '#ffffff',
		paddingTop: 4,
		margin: '0px 30px',
	},
	panelContainer: {
		alignItems: 'center',
		minHeight: 'calc(100vh - 600px)',
	},
	disclaimerContainer: {
		alignItems: 'center',
		fontWeight: 'bold',
		marginLeft: '80px',
		marginRight: '80px',
		paddingTop: '20px',
		paddingBottom: '20px',
	},
};

AnalystTools.prototypes = {
	state: propTypes.objectOf({}),
};

export default AnalystTools;
