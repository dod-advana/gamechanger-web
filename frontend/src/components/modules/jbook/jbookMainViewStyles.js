import styled from 'styled-components';
import LandingImage from '../../../images/JAIC_banner.png';

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
