import React from 'react';
import AdvanaLightTheme from '@dod-advana/advana-platform-ui/dist/images/AdvanaLightTheme.png';
import { SearchContext } from './SearchContext';
import SearchTabBar from './SearchTabBar';

const GlobalSearchTitleBarHandler = {
	getTitleBar: (props) => {
		const {
			// onTitleClick,
			componentStepNumbers,
			cloneData,
		} = props;
		return (
			<img
				src={AdvanaLightTheme}
				style={styles.title}
				onClick={() => (window.location.href = 'https://advana.data.mil/')}
				alt="globalsearch"
				id={'titleButton'}
				className={
					componentStepNumbers
						? `tutorial-step-${
							componentStepNumbers[`${cloneData.display_name} Title`]
						  }`
						: null
				}
			/>
		);
	},

	getCategoryTabs(props) {
		const {
			selectedCategories,
			activeCategoryTab,
			setActiveCategoryTab,
			categoryMetadata,
			// cloneData,
			// dispatch
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
							window.location.href = 'https://advana.data.mil/';
						},
					}}
				>
					<SearchTabBar containerStyles={{ width: '100%' }} />
				</SearchContext.Provider>
			</>
		);
	},

	getTitleBarStyle(props) {
		return {
			...styles.titleBar,
			borderBottom: '2px solid rgb(176, 186, 197)',
		};
	},
};

export default GlobalSearchTitleBarHandler;

const styles = {
	wording: {
		color: '#131E43',
		marginRight: 15,
	},
	titleBar: {
		padding: '20px 1em',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flex: 1,
		minHeight: 80,
		width: '100%',
	},
	title: {
		margin: '-10px 50px -10px 55px',
		cursor: 'pointer',
		width: '255px',
		height: '65x',
	},
};
