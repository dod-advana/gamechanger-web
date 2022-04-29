import GamechangerLogo from '../../../images/logos/GAMECHANGER-NoPentagon.png';
import React from 'react';
import { SearchContext } from '../globalSearch/SearchContext';
import SearchTabBar from '../globalSearch/SearchTabBar';
import { getTitleBarStyle, styles } from '../default/defaultTitleBarHandler';
import PropTypes from 'prop-types';
import AdvanaMegaMenuPill from '@dod-advana/advana-platform-ui/dist/megamenu/AdvanaMegaMenuPill';

const getTitleBar = (props) => {
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
};

const getCategoryTabs = (props) => {
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
};

const PolicyTitleBarHandler = (props) => {
	const {
		style,
		children,
		onTitleClick,
		componentStepNumbers = [],
		jupiter,
		cloneData,
		rawSearchResults,
		selectedCategories,
		categoryMetadata,
		activeCategoryTab,
		setActiveCategoryTab,
		pageDisplayed,
		dispatch,
		loading,
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
					onTitleClick,
					componentStepNumbers,
				})}
				<div style={styles.searchBar}>{children}</div>
				{!jupiter && <AdvanaMegaMenuPill margin="0 -30px 0 20px" defaultHeader="Applications" />}
			</div>

			{getCategoryTabs({
				rawSearchResults,
				pageDisplayed,
				selectedCategories,
				activeCategoryTab,
				setActiveCategoryTab,
				categoryMetadata,
				cloneData,
				dispatch,
				loading,
			})}
		</div>
	);
};

PolicyTitleBarHandler.propTypes = {
	style: PropTypes.objectOf(PropTypes.string),
	children: PropTypes.element,
	onTitleClick: PropTypes.func,
	componentStepNumbers: PropTypes.objectOf(PropTypes.number),
	jupiter: PropTypes.bool,
	cloneData: PropTypes.object,
	rawSearchResults: PropTypes.array,
	selectedCategories: PropTypes.objectOf(PropTypes.bool),
	categoryMetadata: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number)),
	activeCategoryTab: PropTypes.string,
	setActiveCategoryTab: PropTypes.func,
	pageDisplayed: PropTypes.string,
	dispatch: PropTypes.func,
};

export default PolicyTitleBarHandler;
