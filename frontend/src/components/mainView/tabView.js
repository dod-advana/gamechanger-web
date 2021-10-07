import React, { useEffect, useState } from 'react';
import { TabList, Tabs, Tab } from 'react-tabs';
import { trackEvent } from '../telemetry/Matomo';
import {
	getTrackingNameForFactory,
	PAGE_BORDER_RADIUS,
	useMountEffect,
} from '../../utils/gamechangerUtils';
import {
	backgroundGreyDark,
	backgroundWhite,
} from '../../components/common/gc-colors';
import { gcOrange } from '../../components/common/gc-colors';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import GCButton from '../common/GCButton';
import {
	checkUserInfo,
	createCopyTinyUrl,
	setState,
} from '../../utils/sharedFunctions';
import { SelectedDocsDrawer } from '../searchBar/GCSelectedDocsDrawer';

const StyledTabsList = styled(TabList)`
	border-bottom: 2px solid
		${({ primary_color }) => (primary_color ? primary_color : gcOrange)};
	padding: 0px !important;
	display: flex;
	align-items: center;
	flex: 9;
	margin: 20px 0 10px 50px !important;
`;

const StyledTab = styled(Tab)`
	width: 185px;
	height: 45px !important;
	color: ${({ active }) => (active === 'true' ? 'white' : null)};
	border: 1px solid ${({ active }) => (active === 'true' ? 'transparent' : '')} !important;
	border-color: ${({ active }) =>
		active === 'true' ? 'none' : backgroundGreyDark} !important;
	border-bottom: none !important;
	border-radius: ${({ first }) => (first === 'true' ? PAGE_BORDER_RADIUS : 0)}px
		${({ last }) => (last === 'true' ? PAGE_BORDER_RADIUS : 0)}px 0px 0px;
	position: relative !important;
	list-style: none !important;
	padding: 2px 12px !important;
	cursor: pointer !important;
	text-align: center;
	background-color: ${({ active, primary_color }) =>
		active === 'true' ? primary_color : backgroundWhite} !important;
	margin-right: 2px;
	margin-left: 2px;
	display: flex !important;
	align-items: center;
	justify-content: center !important;
`;

const TabView = (props) => {
	const { context, tabNames = [], tabPanels = [] } = props;

	const { state, dispatch } = context;

	const { cloneData } = state;

	const [currentTabIndex, setCurrentTabIndex] = useState(0);
	const [toolStyle, setToolStyle] = useState({ primaryColor: gcOrange });
	const [tabName, setTabName] = useState('');

	useMountEffect(() => {
		if (cloneData?.toolStyle) {
			setToolStyle(cloneData.toolStyle);
		} else {
			setToolStyle({
				primaryColor: gcOrange,
			});
		}

		setTabName(tabNames[0].name);
		setState(dispatch, { tabName: tabNames[0].name });
	});

	useEffect(() => {
		setTabName(state.tabName);
	}, [state.tabName]);

	const handleTabClicked = (tabIndex, lastIndex, tabName) => {
		const { searchText } = state;

		trackEvent(
			getTrackingNameForFactory(state.cloneData.clone_name),
			'TabSelected',
			tabName
		);

		setState(dispatch, { tabName: tabName });
		setCurrentTabIndex(tabIndex);

		if (tabName === 'graphView' && searchText !== '') {
			setState(dispatch, { runGraphSearch: true });
		}
	};

	const renderTabs = () => {
		return (
			<StyledTabsList
				style={styles.tabsList}
				primary_color={toolStyle.primaryColor}
			>
				{tabNames.map((tmpTabName, idx) => {
					return (
						<StyledTab
							active={tabName === tmpTabName.name ? 'true' : 'false'}
							title={tmpTabName.name}
							key={tmpTabName.name}
							first={idx === 0 ? 'true' : 'false'}
							last={idx === tabNames.length - 1 ? 'true' : 'false'}
							primary_color={toolStyle.primaryColor}
							className={tmpTabName.className}
						>
							<Typography variant="h6" display="inline" title={tmpTabName.name}>
								{tmpTabName.title}
							</Typography>
						</StyledTab>
					);
				})}
			</StyledTabsList>
		);
	};

	const setDrawer = (open) => {
		setState(dispatch, { docsDrawerOpen: open });
	};

	const setDrawerReady = (ready) => {
		setState(dispatch, { isDrawerReady: ready });
	};

	const setStepIndex = (stepIndex) => {
		setState(dispatch, { stepIndex: stepIndex });
	};

	return (
		<Tabs
			selectedIndex={currentTabIndex}
			onSelect={(tabIndex, lastIndex, event) =>
				handleTabClicked(tabIndex, lastIndex, event.target.title)
			}
		>
			<div style={styles.tabButtonContainer}>
				{!state.hideTabs && renderTabs()}

				{!state.hideTabs && cloneData?.clone_name === 'eda' && (
					<a
						target="_blank"
						rel="noopener noreferrer"
						href="https://qlik.advana.data.mil/sense/app/604403a7-bf08-4d56-8807-7b5491a3db22/sheet/96329f3e-18a3-40e8-8b02-99d82feb1a6b/state/analysis"
					>
						<GCButton
							style={{ height: 50, margin: '16px 0px 0px 10px', minWidth: 0 }}
						>
							Validation Metrics
						</GCButton>
					</a>
				)}

				{!state.hideTabs && (
					<GCButton
						className={`tutorial-step-${state.componentStepNumbers['Share Search']}`}
						id={'gcShareSearch'}
						onClick={() => createCopyTinyUrl(cloneData.url, dispatch)}
						style={{ height: 50, margin: '16px 0px 0px 10px', minWidth: 0 }}
						disabled={
							!state.rawSearchResults || state.rawSearchResults.length <= 0
						}
					>
						Share <i className="fa fa-share" style={{ margin: '0 0 0 5px' }} />
					</GCButton>
				)}

				{!state.hideTabs && (
					<SelectedDocsDrawer
						selectedDocuments={state.selectedDocuments}
						docsDrawerOpen={state.docsDrawerOpen}
						setDrawer={setDrawer}
						clearSelections={() =>
							setState(dispatch, { selectedDocuments: new Map() })
						}
						openExport={() => setState(dispatch, { exportDialogVisible: true })}
						removeSelection={(doc) => this.removeSelectedDocument(doc)}
						componentStepNumbers={state.componentStepNumbers}
						isDrawerReady={state.isDrawerReady}
						setDrawerReady={setDrawerReady}
						setShowTutorial={(showTutorial) =>
							setState(dispatch, { showTutorial: showTutorial })
						}
						setStepIndex={setStepIndex}
						showTutorial={state.showTutorial}
						rawSearchResults={state.rawSearchResults}
						checkUserInfo={() => {
							checkUserInfo(state, dispatch);
						}}
					/>
				)}
				<div style={styles.spacer} />
			</div>

			{!state.hideTabs && tabPanels.map((tabPanel) => tabPanel)}
		</Tabs>
	);
};

const styles = {
	tabContainer: {
		alignItems: 'center',
		marginBottom: '14px',
		height: '600px',
		margin: '0px 4% 0 65px',
	},
	tabButtonContainer: {
		width: '100%',
		display: 'flex',
		padding: '0em 1em',
		alignItems: 'center',
	},
	spacer: {
		flex: '0.375',
	},
};

export default TabView;
