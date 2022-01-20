import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import { primaryGreyLight } from '../common/gc-colors';
import GamechangerLogo from '../../images/logos/GAMECHANGER-NoPentagon.png';
import TitleBarFactory from '../factories/titleBarFactory';
import AdvanaMegaMenuPill, {
	PillButton,
	TitleText,
} from '@dod-advana/advana-platform-ui/dist/megamenu/AdvanaMegaMenuPill';

const isDecoupled =
	window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' ||
	process.env.REACT_APP_GC_DECOUPLED === 'true';

const styles = {
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
		width: '100%',
	},
	title: {
		margin: '0 50px 0 55px',
		cursor: 'pointer',
		width: '190px',
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

const SearchBanner = (props) => {
	const {
		style,
		children,
		onTitleClick,
		componentStepNumbers = [],
		isDataTracker,
		jupiter,
		cloneData,
		detailsType,
		titleBarModule,
		rawSearchResults,
		selectedCategories,
		categoryMetadata,
		activeCategoryTab,
		setActiveCategoryTab,
		pageDisplayed,
		dispatch,
		loading,
	} = props;

	const [titleBarHandler, setTitleBarHandler] = useState();
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		// Create the factory
		if (titleBarModule && !loaded) {
			const factory = new TitleBarFactory(titleBarModule);
			const handler = factory.createHandler();
			setTitleBarHandler(handler);
			setLoaded(true);
		}
	}, [loaded, titleBarModule]);

	return (
		<div
			style={{ ...styles.container, ...style }}
			className={
				componentStepNumbers
					? `tutorial-step-${componentStepNumbers['Search Bar']}`
					: null
			}
		>
			{loaded && (
				<div
					style={titleBarHandler.getTitleBarStyle({
						rawSearchResults,
						pageDisplayed,
					})}
				>
					{titleBarHandler.getTitleBar({
						onTitleClick,
						componentStepNumbers,
						cloneData,
						detailsType,
					})}
					{isDataTracker && (
						<div style={{ display: 'flex' }}>
							<img
								src={GamechangerLogo}
								style={styles.adminTitle}
								onClick={onTitleClick}
								alt="gamechanger"
								className={
									componentStepNumbers
										? `tutorial-step-${componentStepNumbers['Gamechanger Title']}`
										: null
								}
							/>
							<Typography
								variant="h2"
								style={styles.adminWording}
								display="inline"
							>
								Data Tracker
							</Typography>
						</div>
					)}
					<div style={styles.searchBar}>{children}</div>
					{!jupiter && (
						<>
							{isDecoupled ? (
								<PillButton
									margin={'0 60px 0 5px'}
									justifyContent="center"
									onClick={() => window.location.href = 'https://advana.data.mil/'}
								>
									<TitleText>ADVANA</TitleText>
								</PillButton>
							) : (
								<AdvanaMegaMenuPill
									margin="0 0 0 5px"
									defaultHeader="Applications"
								/>
							)}
						</>
					)}
				</div>
			)}

			{loaded &&
				titleBarHandler.getCategoryTabs({
					rawSearchResults,
					pageDisplayed,
					selectedCategories,
					activeCategoryTab,
					setActiveCategoryTab,
					categoryMetadata,
					cloneData,
					dispatch,
					loading,
				})
			}
		</div>
	);
};

SearchBanner.propTypes = {
	style: PropTypes.objectOf(PropTypes.string),
	children: PropTypes.element,
	onTitleClick: PropTypes.func,
	componentStepNumbers: PropTypes.objectOf(PropTypes.number),
	isDataTracker: PropTypes.bool,
	jupiter: PropTypes.bool,
	cloneData: PropTypes.object,
	detailsType: PropTypes.string,
	titleBarModule: PropTypes.string,
	rawSearchResults: PropTypes.array,
	selectedCategories: PropTypes.objectOf(PropTypes.bool),
	categoryMetadata: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number)),
	activeCategoryTab: PropTypes.string,
	setActiveCategoryTab: PropTypes.func,
	pageDisplayed: PropTypes.string,
	dispatch: PropTypes.func,
};

export default SearchBanner;
