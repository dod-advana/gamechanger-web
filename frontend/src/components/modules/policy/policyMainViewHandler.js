import React from "react";
import GameChangerSearchMatrix from "../../searchMetrics/GCSearchMatrix";
import GameChangerSideBar from "../../searchMetrics/GCSideBar";
import DefaultGraphView from "../../graph/defaultGraphView";
import {TabPanel} from "react-tabs";
import {StyledCenterContainer} from "../../../gamechangerUtils";

const PolicyMainViewHandler = {
	getTabNames(props) {
		const {
			componentStepNumbers
		} = props;
		return [{name: 'graphView', title: 'GRAPH VIEW', className: `tutorial-step-${componentStepNumbers['Open Graph View']}`, id: 'gcOpenGraphView'}];
	},
	
	getTabPanels(props) {
		const {
			context
		} = props;
		
		const {state} = context;
		
		const tabPanels = [];
		tabPanels.push(
			<TabPanel key={'graphView'}>
				{!state.loading &&
					<StyledCenterContainer showSideFilters={state.showSideFilters}>
						{state.showSideFilters &&
							<div className={'left-container'}>
								<div className={'side-bar-container'}>
									<div className={'filters-container sidebar-section-title'}>FILTERS</div>
									<GameChangerSearchMatrix context={context} />
									{state.sidebarDocTypes.length > 0 && state.sidebarOrgs.length > 0 &&
										<>
											<div className={'sidebar-section-title'}>RELATED</div>
											<GameChangerSideBar context={context} cloneData={state.cloneData} />
										</>
									}
								</div>
							</div>
						}
						<div className={'right-container'}>
							<DefaultGraphView context={context}/>
						</div>
					</StyledCenterContainer>
				}
			</TabPanel>
		);
		
		return tabPanels;
	}
}

export default PolicyMainViewHandler;
