import React from "react";
import {TabPanel} from "react-tabs";
import EDASummaryView from "./edaSummaryView";
import EDASidePanel from "./edaSidePanel";
import {
	StyledCenterContainer
} from "../../../gamechangerUtils";

const EdaMainViewHandler = {

	
	getTabNames(props) {

		return [
			{
				name: 'summaryView',
				title: 'SUMMARY VIEW',
				className: '',
				id: 'edaSummaryView'
			}
		];
	},
	
	getTabPanels(props) {
		const {
			context
		} = props;

		const {state, dispatch} = context;

		const {
			edaSearchSettings,
			docSearchResults,
			loading
		} = state;

		
		const tabPanels = [];
		tabPanels.push(
			<TabPanel>
				<StyledCenterContainer showSideFilters={true}>
					<div className={'left-container'}>
						<EDASidePanel 
							searchResults={docSearchResults}
						/>
					</div>
					<div className={'right-container'}>
						<EDASummaryView 
							edaSearchSettings={edaSearchSettings}
							searchResults={docSearchResults}
							loading={loading}
							dispatch={dispatch}
						/>
					</div>
				</StyledCenterContainer>
			</TabPanel>
		);

		return tabPanels;
	}
};

export default EdaMainViewHandler;
