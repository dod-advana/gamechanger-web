import React from 'react';
import { SearchContext } from '../globalSearch/SearchContext';
import SearchTabBar from '../globalSearch/SearchTabBar';
import Hermes from '../../../images/logos/HermesLogo.png';
import NFR from '../../../images/logos/NFRLogo.png';
import NGA from '../../../images/logos/NGALogo.png';
import SpaceForce from '../../../images/logos/SpaceForceLogo.png';
import Covid19 from '../../../images/logos/Covid19Logo.png';
import CDO from '../../../images/logos/CDOLogo.png';
import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import AdvanaMegaMenuPill from '@dod-advana/advana-platform-ui/dist/megamenu/AdvanaMegaMenuPill';
import { primaryGreyLight } from '../../common/gc-colors';

const getTitleBar = (props) => {
	const { onTitleClick, componentStepNumbers, cloneData } = props;
	if (cloneData.display_name === 'NGA') {
		return (
			<div
				className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				onClick={onTitleClick}
			>
				<img
					src={NGA}
					style={styles.title}
					onClick={onTitleClick}
					alt="gamechanger NGA"
					id={'titleButton'}
					className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				/>
			</div>
		);
	} else if (cloneData.display_name === 'Hermes') {
		return (
			<div
				className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				onClick={onTitleClick}
			>
				<img
					src={Hermes}
					style={styles.title}
					onClick={onTitleClick}
					alt="gamechanger hermes"
					id={'titleButton'}
					className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				/>
			</div>
		);
	} else if (cloneData.display_name === 'NFR') {
		return (
			<div
				className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				onClick={onTitleClick}
			>
				<img
					src={NFR}
					style={styles.title}
					onClick={onTitleClick}
					alt="gamechanger NFR"
					id={'titleButton'}
					className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				/>
			</div>
		);
	} else if (cloneData.display_name === 'Space Force') {
		return (
			<div
				className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				onClick={onTitleClick}
			>
				<img
					src={SpaceForce}
					style={styles.title}
					onClick={onTitleClick}
					alt="gamechanger space force"
					id={'titleButton'}
					className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				/>
			</div>
		);
	} else if (cloneData.display_name === 'Covid-19') {
		return (
			<div
				className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				onClick={onTitleClick}
			>
				<img
					src={Covid19}
					style={styles.title}
					onClick={onTitleClick}
					alt="gamechanger Covid19"
					id={'titleButton'}
					className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				/>
			</div>
		);
	} else if (cloneData.display_name === 'CDO') {
		return (
			<div
				className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				onClick={onTitleClick}
			>
				<img
					src={CDO}
					style={styles.title}
					onClick={onTitleClick}
					alt="gamechanger CDO"
					id={'titleButton'}
					className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				/>
			</div>
		);
	} else {
		return (
			<div
				className={`tutorial-step-${componentStepNumbers[`${cloneData.display_name} Title`]}`}
				onClick={onTitleClick}
			>
				<Typography variant="h1" style={styles.wording} display="inline">
					{cloneData.display_name}
				</Typography>
				<Typography variant="h6" style={styles.wording} display="inline">
					Powered by GAMECHANGER
				</Typography>
			</div>
		);
	}
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

export const getTitleBarStyle = (props) => {
	const { rawSearchResults = [], pageDisplayed, backgroundColor } = props;
	return {
		...styles.titleBar,
		borderBottom: rawSearchResults.length > 0 && pageDisplayed === 'main' ? '2px solid rgb(176, 186, 197)' : '',
		backgroundColor: `${backgroundColor || null}`,
	};
};

const DefaultTitleBarHandler = (props) => {
	const {
		style,
		children,
		onTitleClick,
		componentStepNumbers = [],
		jupiter,
		cloneData = {},
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
					cloneData,
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

DefaultTitleBarHandler.propTypes = {
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

export default DefaultTitleBarHandler;

export const styles = {
	container: {
		backgroundColor: 'rgba(223,230,238,0.5)',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	titleBar: {
		padding: '0 1em',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flex: 1,
		minHeight: 80,
		maxHeight: 80,
		width: '100%',
	},
	title: {
		margin: '0 20px 0 15px',
		cursor: 'pointer',
		width: '400px',
		height: '50x',
	},
	divider: {
		margin: '0 .3em',
		backgroundColor: primaryGreyLight,
		height: 1,
	},
	searchBar: {
		flex: 8,
	},
	wording: {
		color: '#131E43',
		marginRight: 15,
	},
	gcIcon: {
		margin: '0 50px 0 55px',
		cursor: 'pointer',
		width: '70px',
		flex: 1,
	},
	collapseContainer: {
		width: '91%',
	},
	searchTerms: {
		display: 'flex',
		flexWrap: 'wrap',
		transition: 'any .2s',
		overflow: 'hidden',
		margin: '0 0 0 20px',
	},
	searchTerm: {
		margin: '0 1em 0 0',
		fontSize: 14,
		backgroundColor: 'white',
		cursor: 'pointer',
	},
	searchTermsContainer: {
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'row',
		margin: '.5em 0',
	},
};
