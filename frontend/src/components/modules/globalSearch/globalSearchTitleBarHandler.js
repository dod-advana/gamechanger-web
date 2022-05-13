import React from 'react';
import AdvanaLightTheme from '@dod-advana/advana-platform-ui/dist/images/AdvanaLightTheme.png';
import { SearchContext } from './SearchContext';
import SearchTabBar from './SearchTabBar';
import PropTypes from 'prop-types';
import AdvanaMegaMenuPill from '@dod-advana/advana-platform-ui/dist/megamenu/AdvanaMegaMenuPill';

const getTitleBar = (props) => {
	const {
		// onTitleClick,
		componentStepNumbers,
		cloneData = {},
	} = props;
	return (
		<img
			src={AdvanaLightTheme}
			style={styles.title}
			onClick={() => (window.location.href = 'https://advana.data.mil/')}
			alt="search"
			id={'titleButton'}
			className={
				componentStepNumbers ? `tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}` : null
			}
		/>
	);
};

const getCategoryTabs = (props) => {
	const { selectedCategories, activeCategoryTab, setActiveCategoryTab, categoryMetadata } = props;

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
};

const getTitleBarStyle = (props) => {
	return {
		...styles.titleBar,
		borderBottom: '2px solid rgb(176, 186, 197)',
	};
};

const GlobalSearchTitleBarHandler = (props) => {
	const {
		style,
		children,
		componentStepNumbers = [],
		jupiter,
		cloneData,
		rawSearchResults,
		selectedCategories,
		categoryMetadata,
		activeCategoryTab,
		setActiveCategoryTab,
		pageDisplayed,
		openPillRight,
		openPillTop,
		closeButtonRight,
		closeButtonTop,
	} = props;

	return (
		<div
			style={{ ...styles.container, ...style }}
			className={componentStepNumbers ? `tutorial-step-${componentStepNumbers['Search Bar']}` : null}
		>
			<div
				style={getTitleBarStyle({
					rawSearchResults,
					pageDisplayed,
				})}
			>
				{getTitleBar({
					componentStepNumbers,
					cloneData,
				})}
				<div style={styles.searchBar}>{children}</div>
				{!jupiter && (
					<AdvanaMegaMenuPill
						margin="0 -30px 0 20px"
						defaultHeader="Applications"
						location={{ pathname: 'search' }}
						openPillRight={openPillRight}
						openPillTop={openPillTop}
						closeButtonRight={closeButtonRight}
						closeButtonTop={closeButtonTop}
					/>
				)}
			</div>

			{getCategoryTabs({
				selectedCategories,
				activeCategoryTab,
				setActiveCategoryTab,
				categoryMetadata,
			})}
		</div>
	);
};

GlobalSearchTitleBarHandler.propTypes = {
	style: PropTypes.objectOf(PropTypes.string),
	children: PropTypes.element,
	componentStepNumbers: PropTypes.objectOf(PropTypes.number),
	jupiter: PropTypes.bool,
	cloneData: PropTypes.object,
	rawSearchResults: PropTypes.array,
	selectedCategories: PropTypes.objectOf(PropTypes.bool),
	categoryMetadata: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number)),
	activeCategoryTab: PropTypes.string,
	setActiveCategoryTab: PropTypes.func,
	pageDisplayed: PropTypes.string,
};

export default GlobalSearchTitleBarHandler;

const styles = {
	container: {
		backgroundColor: 'rgba(223,230,238,0.5)',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	wording: {
		color: '#131E43',
		marginRight: 15,
	},
	titleBar: {
		padding: '0px 1em',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flex: 1,
		minHeight: 80,
		width: '100%',
	},
	title: {
		margin: '0px 50px 0px 15px',
		cursor: 'pointer',
		width: '255px',
		height: '50x',
	},
	searchBar: {
		flex: 8,
	},
};
