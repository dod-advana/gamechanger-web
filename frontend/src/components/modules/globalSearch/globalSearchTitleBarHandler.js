import React from "react";
import {Typography} from "@material-ui/core";
import {SearchContext} from "./SearchContext";
import SearchTabBar from "./SearchTabBar";

const GlobalSearchTitleBarHandler = {
	getTitleBar: (props) => {
		const {
			onTitleClick,
			componentStepNumbers,
			cloneData
		} = props;
		return (
			<div className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				 onClick={onTitleClick}>
				<Typography variant="h1" style={styles.wording} display="inline">
					{cloneData.display_name}
				</Typography>
				<Typography variant="h6" style={styles.wording} display="inline">
					Powered by GAMECHANGER
				</Typography>
			</div>
		);
	},
	
	getCategoryTabs(props) {
		const {
			rawSearchResults = [],
			pageDisplayed,
			selectedCategories,
			activeCategoryTab,
			setActiveCategoryTab,
			categoryMetadata,
			cloneData,
			dispatch
		} = props;
		
		return (
			<>
				<SearchContext.Provider
					value={{
						searchTypes: selectedCategories,
						activeTab: activeCategoryTab,
						setActiveTab: setActiveCategoryTab,
						resultMetaData: categoryMetadata,
						returnHome: () => {
							window.location.href = `/#/${cloneData.clone_name}`
							dispatch({type: 'RESET_STATE'});
						}
					}}
				>
					<SearchTabBar containerStyles={{width:'100%'}}/>
				</SearchContext.Provider>
			</>
		)
	},
	
	getTitleBarStyle(props) {
		return {
			...styles.titleBar,
			borderBottom: '2px solid rgb(176, 186, 197)'
		};
	}
}

export default GlobalSearchTitleBarHandler;

const styles = {
	wording: {
		color: '#131E43',
		marginRight: 15
	},
	titleBar: {
		padding: '20px 1em',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flex: 1,
		minHeight: 80,
		width: '100%'
	},
};
