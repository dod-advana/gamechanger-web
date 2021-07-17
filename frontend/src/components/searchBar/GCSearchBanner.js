import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Typography, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';
import Modal from 'react-modal';
import { primaryGreyLight } from '../common/gc-colors';
import GamechangerLogo from '../../images/logos/GAMECHANGER-NoPentagon.png';
import AdvanaStackedLogo from '@dod-advana/advana-platform-ui/dist/images/Stackedlogo.png';
import TitleBarFactory from "../factories/titleBarFactory";
import AdvanaMegaMenuPill, { 
	PillButton,
	TitleText
} from '@dod-advana/advana-platform-ui/dist/megamenu/AdvanaMegaMenuPill';
import GCButton from "../common/GCButton";

const isDecoupled = window?.__env__?.REACT_APP_GC_DECOUPLED === 'true' || process.env.REACT_APP_GC_DECOUPLED === 'true';

const styles = {
	container: {
		backgroundColor: 'rgba(223,230,238,0.5)',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center'
	},
	titleBar: {
		padding: '0 1em',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flex: 1,
		minHeight: 80,
		width: '100%'
	},
	title: {
		margin: '0 50px 0 55px',
		cursor: 'pointer',
		width: '190px',
		height: '50x'
	},
	divider: {
		margin: '0 .3em',
		backgroundColor: primaryGreyLight,
		height: 1
	},
	searchBar: {
		flex: 8
	},
	wording: {
		color: '#131E43',
		marginRight: 15
	},
	gcIcon: {
		margin: '0 50px 0 55px',
		cursor: 'pointer',
		width: '70px',
		flex: 1
	},
	collapseContainer: {
		width: '91%',
	},
	searchTerms: {
		display: 'flex',
		flexWrap: 'wrap',
		transition: 'any .2s',
		overflow: 'hidden',
		margin: '0 0 0 20px'
	},
	searchTerm: {
		margin: '0 1em 0 0',
		fontSize: 14,
		backgroundColor: 'white',
		cursor: 'pointer'
	},
	searchTermsContainer: {
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'row',
		margin: '.5em 0'
	}
};

const LoginModalHeader = styled.div`
	display:flex;
	width: 100%;
	height: 10%;
	align-items: center;
	justify-content: flex-end;
	font-size: 23px;
	padding-top: 20px;
`;

const LoginModalBody = styled.div`
	display: flex;
	width: 100%;
	height: 90%;
	align-items: center;
	justify-content: space-between;
	flex-direction: column;
	padding: 20px;
`;

const LoginModalBodyDiv = styled.div`
	width: ${({ width }) => width ? width : '100%'};
	display: flex;
	justify-content: center;
`;

const AdvanaLogo = styled.img`
	width: 40%;
`;

const SearchBanner = (props) => {
	const {
		style,
		children,
		onTitleClick,
		componentStepNumbers = [],
		isDataTracker,
		loginModalOpen,
		setLoginModal,
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
		dispatch
	} = props;

	const [titleBarHandler, setTitleBarHandler] = useState();
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		// Create the factory
		if (titleBarModule && !loaded) {
			const factory = new TitleBarFactory(titleBarModule);
			const handler = factory.createHandler();
			setTitleBarHandler(handler)
			setLoaded(true);
		}
		
		
	}, [loaded, titleBarModule]);

	return (
		<div style={{ ...styles.container, ...style }} className={componentStepNumbers ? `tutorial-step-${componentStepNumbers["Search Bar"]}` : null}>
			{loaded &&
				<div style={titleBarHandler.getTitleBarStyle({rawSearchResults, pageDisplayed})}>
					{titleBarHandler.getTitleBar({onTitleClick, componentStepNumbers, cloneData, detailsType})}
					{isDataTracker &&
						<div style={{display: 'flex'}}>
							<img src={GamechangerLogo} style={styles.adminTitle} onClick={onTitleClick} alt='gamechanger'
								 className={componentStepNumbers ? `tutorial-step-${componentStepNumbers["Gamechanger Title"]}` : null}/>
							<Typography variant="h2" style={styles.adminWording} display="inline">
								Data Tracker
							</Typography>
						</div>
					}
					<div style={styles.searchBar}>
						{children}
					</div>
					{!jupiter &&
						<>
							{isDecoupled ? (
								<PillButton margin={'0 60px 0 4%'} justifyContent='center' onClick={() => setLoginModal(true)}>
									<TitleText>ADVANA</TitleText>
								</PillButton>
							) : (
								<AdvanaMegaMenuPill
									margin='0 0 0 5px'
									defaultHeader='Applications'
								/>
							)}
						</>
					}
				</div>
			}
	
			{loaded && titleBarHandler.getCategoryTabs({
				rawSearchResults,
				pageDisplayed,
				selectedCategories,
				activeCategoryTab,
				setActiveCategoryTab,
				categoryMetadata,
				cloneData,
				dispatch}
			)}

			<Modal 
				style={{
					content: {
						inset: '28% 35%',
						padding: 'none'
					},
					overlay: {
						backgroundColor: 'rgba(0, 0, 0, 0.75)',
						zIndex: 10000
					}
				}}
				isOpen={loginModalOpen}
				onClose={() => setLoginModal(false)}>
					<LoginModalHeader>
						<IconButton aria-label="close" onClick={() => setLoginModal(false)} style={{ borderRadius: '0', backgroundColor: '#F5F5F5'}}>
							<CloseIcon style={{ fontSize: 30 }} />
						</IconButton>
					</LoginModalHeader>
					<LoginModalBody>
						<LoginModalBodyDiv>
							<TitleText style={{ fontSize: 25 }}>Advana Account</TitleText>
						</LoginModalBodyDiv>
						<LoginModalBodyDiv>
							<AdvanaLogo src={AdvanaStackedLogo} alt='advana' />
						</LoginModalBodyDiv>
						<LoginModalBodyDiv width='85%'>
							<a href="https://advana.data.mil/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', borderRadius: '5px' }}>
								<GCButton style={{ flex: 1 }} buttonColor={'#8091A5'}>
									Login here
								</GCButton>
							</a>

							<a href="https://signup.data.mil/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', borderRadius: '5px' }}>
								<GCButton style={{ flex: 2 }}>
									Sign up for an account
								</GCButton>
							</a>
						</LoginModalBodyDiv>
					</LoginModalBody>
			</Modal>

		</div>
	);
}

SearchBanner.propTypes = {
	style: PropTypes.objectOf(PropTypes.string),
	children: PropTypes.element,
	onTitleClick: PropTypes.func,
	componentStepNumbers: PropTypes.objectOf(PropTypes.number),
	isDataTracker: PropTypes.bool,
	loginModalOpen: PropTypes.bool,
	setLoginModal: PropTypes.func,
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
	dispatch: PropTypes.func
}

export default SearchBanner