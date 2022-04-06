import GamechangerLogo from '../../../images/logos/GAMECHANGER-NoPentagon.png';
import React from 'react';
import { SearchContext } from '../globalSearch/SearchContext';
import SearchTabBar from '../globalSearch/SearchTabBar';

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
				className={componentStepNumbers ? `tutorial-step-${componentStepNumbers['Gamechanger Title']}` : null}
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
				{rawSearchResults?.length !== 0 && !loading && pageDisplayed === 'main' && (
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
		const { rawSearchResults, pageDisplayed, backgroundColor } = props;
		return {
			...styles.titleBar,
			borderBottom: rawSearchResults.length > 0 && pageDisplayed === 'main' ? '2px solid rgb(176, 186, 197)' : '',
			backgroundColor: `${backgroundColor || null}`,
		};
	},
};

export default PolicyTitleBarHandler;

const styles = {
	title: {
		margin: '0 50px 0 15px',
		cursor: 'pointer',
		width: '190px',
		height: '50x',
	},
	titleBar: {
		padding: '0 1em',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flex: 1,
		minHeight: 80,
		width: '100%',
	},
};
