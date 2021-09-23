import GamechangerLogo from '../../../images/logos/GAMECHANGER-NoPentagon.png';
import React from 'react';
import { SearchContext } from '../globalSearch/SearchContext';
import SearchTabBar from '../globalSearch/SearchTabBar';
import defaultTitleBarHandler from '../default/defaultTitleBarHandler';

const PolicyTitleBarHandler = {
	getTitleBar: (props) => {
		const { onTitleClick, componentStepNumbers } = props;
		return (
			<img
				src={GamechangerLogo}
				style={styles.title}
				onClick={onTitleClick}
				alt="gamechanger"
				id={'titleButton'}
				className={
					componentStepNumbers
						? `tutorial-step-${componentStepNumbers['Gamechanger Title']}`
						: null
				}
			/>
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
			dispatch,
			loading,
		} = props;

		return (
			<>
				{rawSearchResults?.length !== 0 &&
					!loading &&
					pageDisplayed === 'main' && (
					<SearchContext.Provider
						value={{
							searchTypes: selectedCategories,
							activeTab: activeCategoryTab,
							setActiveTab: setActiveCategoryTab,
							resultMetaData: categoryMetadata,
							returnHome: () => {
								window.location.href = `/#/${cloneData.clone_name}`;
								dispatch({ type: 'RESET_STATE' });
							},
						}}
					>
						<SearchTabBar containerStyles={{ width: '100%' }} />
					</SearchContext.Provider>
				)}
			</>
		);
	},

	getTitleBarStyle(props) {
		return defaultTitleBarHandler.getTitleBarStyle(props);
	},
};

export default PolicyTitleBarHandler;

const styles = {
	title: {
		margin: '0 50px 0 55px',
		cursor: 'pointer',
		width: '190px',
		height: '50x',
	},
};
