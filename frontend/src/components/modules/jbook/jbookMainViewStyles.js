import styled from 'styled-components';
import LandingImage from '../../../images/JAIC_banner.png';

export const fullWidthCentered = {
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
};

export const styles = {
	listViewBtn: {
		minWidth: 0,
		margin: '20px 0px 0px',
		marginLeft: 10,
		padding: '0px 7px 0',
		fontSize: 20,
		height: 34,
	},
	cachedResultIcon: {
		display: 'flex',
		justifyContent: 'center',
		padding: '0 0 1% 0',
	},
	searchResults: fullWidthCentered,
	paginationWrapper: fullWidthCentered,
	leftContainerSummary: {
		width: '15%',
		marginTop: 10,
	},
	rightContainerSummary: {
		marginLeft: '17.5%',
		width: '79.7%',
	},
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		margin: '2px 5px 0px',
	},
	titleText: {
		fontSize: 22,
		fontWeight: 500,
		color: '#131E43',
		margin: '20px 0',
		fontFamily: 'Montserrat',
	},
	tableColumn: {
		textAlign: 'center',
		margin: '4px 0',
	},
	tabsList: {
		borderBottom: `2px solid ${'#1C2D65'}`,
		padding: 0,
		display: 'flex',
		alignItems: 'center',
		flex: 9,
		marginRight: 15,
	},
	tabStyle: {
		border: `1px solid ${'#DCDCDC'}`,
		borderBottom: 'none !important',
		borderRadius: `6px 6px 0px 0px`,
		position: ' relative',
		listStyle: 'none',
		padding: '2px 12px',
		cursor: 'pointer',
		textAlign: 'center',
		backgroundColor: '#ffffff',
		marginRight: '2px',
		marginLeft: '2px',
		height: 45,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	tabSelectedStyle: {
		border: `1px solid ${'#0000001F'}`,
		backgroundColor: '#1C2D65',
		color: 'white',
	},
	tabContainer: {
		// alignItems: 'center',
		// minHeight: '613px',
	},
	tabButtonContainer: {
		backgroundColor: '#ffffff',
		width: '100%',
		paddingTop: 20,
	},
	orangeText: {
		fontWeight: 'bold',
		color: '#E9691D',
	},
};

export const StyledContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
`;

export const StyledMainContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 0 2em;
`;

export const StyledMainTopBar = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	align-items: center;
`;

export const StyledMainBottomContainer = styled.div`
	width: 100%;
	height: 100%;
`;

export const StyledSummaryFAQContainer = styled.div`
	margin: 20px 40px;
	
	.summarySection {
		background-image: url(${LandingImage});
		width: 100%;
		height: 150px;
		border-radius: 4px;
		align-self: center;
		
		& .summaryTextSectionContainer {
			padding: 20px 0 20px 20px;
			align-self: center;
			
			& .summarySectionHeader {
				font-family: Montserrat;
				font-weight: bold;
				font-size: 34px;
				color: ${'#FFFFFF'}
			}
		}
		
	}
	
	.summaryLogoSectionContainer {
	    align-self: center;
	    margin-top: 20px;
	    
		& .summaryLogoSection {
		    text-align: center;
		    
			& .jaic-image {
				width: 380px;
				margin-top: -12px;
			}
		}
	}
	
	.summaryTextSection {
		
		& .summarySectionText {
			font-family: Noto Sans;
			font-size: 20px;
			margin-top: 10px;
			color: ${'#000000'};
		}
		
		& .summarySectionSubHeader {
			font-family: Noto Sans;
			font-size: 22px;
			margin-top: 10px;
			color: ${'#000000'};
			font-weight: bold;
		}
		
		& ul {
			margin: 10px 0;
			& li {
				font-family: Noto Sans;
				font-size: 20px;
			}
		}
	}

	.faqSection {
		margin-top 30px;
	}
`;
