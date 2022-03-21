import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	createRef,
	useMemo
} from 'react';
import styled from 'styled-components';
import { Tabs, Tab, TabPanel, TabList } from 'react-tabs';
import anchorme from 'anchorme';
import sanitizeHtml from 'sanitize-html';
import TabStyles from '../common/TabStyles';
import {Grid, Typography} from '@material-ui/core';
import GCAccordion from '../common/GCAccordion';
//import GameChangerAPI from '../api/gameChanger-service-api';
import JAICLogo from '../../images/logos/JAIC_logo.png';
import {StyledSummaryFAQContainer} from '../modules/jbook/jbookMainViewStyles';
import {GC_COLORS} from '../modules/jbook/jbookMainViewHandler2';

//const gameChangerAPI = new GameChangerAPI();

const StyledCategories = styled.ul`
	list-style-type: none;
	font-family: 'Montserrat';
	font-weight: 600;
	font-size: 13px;
	padding: 30px 0 0 0;
	height: 500px;
	position: sticky;
	top: 50px;
`;

const StyledListItem = styled.li`
	border-left: ${({ selected, id }) =>
		selected === id ? '6px solid #E9691E' : ''}
	background: ${({ selected, id }) => (selected === id ? '#E9691E59' : '')}
	color: ${({ selected, id }) => (selected === id ? '#1C2D65' : '#000000DE')}
	padding-left: ${({ selected, id }) => (selected === id ? '34px' : '40px')}
	padding-top: 4px;
	padding-bottom: 4px;
	width: 15vw;
	cursor: pointer;

	&:hover {
		background: #E9691E59
		color: #1C2D65
	}
`;

// const styles = {
// 	iconContainer: {
// 		display: 'flex',
// 	},
// 	iconStyle: {
// 		width: '90px',
// 		height: '90px',
// 		marginRight: '30px',
// 	},
// };

const JBookAboutUs = (props) => {
	const [tabIndex, setTabIndex] = useState('about');
	const [selectedCategory, setSelectedCategory] = useState('general');
	const [FAQdata, setFAQdata] = useState([]);
	const categoryRefs = useRef([]);

	const categoryOrder = useMemo(() => {
		return [
			'General',
		];
	},[]);

	const arrLength = categoryOrder.length;
	let ignoreNextScrollEvent = false;

	if (categoryRefs.current?.length !== arrLength) {
		categoryRefs.current = Array(arrLength)
			.fill()
			.map((_, i) => categoryRefs.current[i] || createRef());
	}

	const onScroll = useCallback(
		(e) => {
			if (categoryRefs.current[1] && categoryRefs.current[1].current !== null && !ignoreNextScrollEvent) {
				const currentScroll = e.target.documentElement.scrollTop;
				let index = 0;
				let closestNegative = categoryOrder
					.map((cat) => cat.toLowerCase())
					.indexOf(selectedCategory);
				while (index < categoryOrder.length) {
					const diff =
						categoryRefs.current[index].current.offsetTop - 30 - currentScroll; // 30 for the height of each dummy div
					if (diff < 50) {
						closestNegative = index;
					}
					index += 1;
				}

				setSelectedCategory(categoryOrder[closestNegative].toLowerCase());
			}
		},
		[categoryOrder, ignoreNextScrollEvent, selectedCategory]
	);

	useEffect(() => {
		// const fetchData = async () => {
		// 	const { data } = await gameChangerAPI.getFAQ();
		// 	const categorized = {};
		// 	data.forEach((entry) => {
		// 		entry.answer = anchorme(entry.answer);
		//
		// 		if (entry.category in categorized) {
		// 			categorized[entry.category].push(entry);
		// 		} else {
		// 			categorized[entry.category] = [entry];
		// 		}
		// 	});

		const categorized = {general: [
			{
				answer: anchorme(`The Joint Artificial Intelligence Center (JAIC) is the Department of Defense’s (DoD) Artificial Intelligence (AI) Center of Excellence that provides a critical mass of expertise and capability to help the Department and the Military Services harness the game-changing power of AI. To help operationally prepare the Department for AI, the JAIC integrates technology development, with the requisite policies, knowledge, processes and relationships to ensure long term success and scalability.
					<br />
					<br />The mission of the JAIC is to transform the DoD by accelerating the delivery and adoption of AI to achieve mission impact at scale.
					<br />
					<br />Learn more about the JAIC at <a href="https://www.ai.mil/index.html">https://www.ai.mil/index.html</a> 
				`),
				question: `What is the JAIC?`
			},
			{
				answer: anchorme(`The JAIC assists military services and DoD components with a broad set of service offerings, including AI consulting & advisory, AI test & evaluation, AI acquisition support, AI-related training & education programs, and AI/ML development solutions.
					<br />
					<br />For DoD Data Scientists and AI/ML developers (and approved industry/academic partners), the JAIC provides free access to the Joint Common Foundation, a cloud-enabled NIPR/SIPR AI development platform. The JCF hosts a comprehensive set of enterprise capabilities for the development of AI, including leading open-source and commercial tools for Data Ingest & Exploration, Data Processing and Preparation, AI Model Development & Training, and AI Application Development.  It is available for use with unclassified, CUI, and SECRET data.  
					<br />
					<br />If you have a Common Access Card (CAC) and are on NIPRNet, please proceed to  <a href="https://portal.jcf.jaic.mil/">https://portal.jcf.jaic.mil/</a> to receive a free JCF shared services account or to request a dedicated AI/ML development enclave on the JCF. 
				`),
				question: 'What Services Does the JAIC Offer?'
			},
			{
				answer: anchorme(`As part of the FY21 Defense Appropriations Bill, Congress tasked the Director of the DoD Joint AI Center to provide the congressional defense committees an inventory of all DoD artificial intelligence activities, to include each: 
				<br />
				<ul>
					<li>program’s appropriation, project, and (budget) line number </li>
					<li>the current and future years defense program funding (FY21-FY25) </li>
					<li>the identification of academic or industry mission partners, if applicable </li>
					<li>any planned transition partners, if applicable </li>
				</ul>
				<br /> Over the past year, JAIC has worked closely with OUSD(R&E), OUSD(C), the Services, and other DoD Component representatives of the DoD AI Working Group in scoping and executing this task. We delivered the Phase I Inventory of DoD AI Programs in April 2021.
				<br />
				<br /> In partnership with OUSD(C), the JAIC is executing the Phase II AI Inventory via the Advana Platform, which the Deputy Secretary of Defense has officially designated “as the single enterprise authoritative data management and analytics platform.”
				<br />
				<br /> Using the Advana Gamechanger platform, you will be able to easily review key budget and contracting data about AI-related programs and projects and input additional information needed to complete this congressionally mandated tasking.
				<br />
				<br /> Phase II of the AI Inventory (to be submitted to Congress in early 2022) will result in a tool that addresses limitations of Phase I deliverable and includes an inventory of classified programs. The Phase II inventory will be conducted via a three-part data coordination and review process: at the JAIC-level, Service-level, and program POC-level.
				<br />
				<br /> JAIC-Level Review: The JAIC will publish and refine the SIPR and NIPR tools, and review the inventory data to initially classify projects and programs as either AI-core, AI-enabled, or AI-enabling. 
				<br />
				<br /> Service-Level Review: After initial classification and tool refinement, the Services will confirm classification of the projects and programs, which will be followed by detailed analysis of each project or program at the POC-level.
				<br />
				<br /> Program PoC-Level Review: The POCs will provide more detailed information on each program and project, to include: Joint Capability Area, Type of AI, AI domain & task.  
				<br /> After all phases of coordination and review, the final PAT and Phase II of the inventory will be submitted to Congress in early 2022. After that time, this dataset will be made available to the entire DoD AI community for use in their analysis and planning.
				`),
				question: 'What is the JAIC Phase II AI Inventory?'
			},
			{
				answer: anchorme('As part of its commitment to providing information and enabling services to DoD AI leaders, the JAIC has partnered with the OUSD(C) Advana Team and the Military Services to develop and provide the DoD AI Inventory via the Advana Gamechanger Platform – JBOOK application. This tool will unify budget, contracting, requirements, and program data into a secure and searchable database to provide the most comprehensive, accurate, organized, and useful picture of the DoD AI Portfolio ever. Upon completion, it will provide valuable information and insights to DoD and Military Service Leadership.'),
				question: 'What is the DoD JBOOK Search for the AI Inventory Portfolio?'
			},
			{
				answer: anchorme('DoD and Military Service Leadership, DoD Portfolio Managers, DoD Analysts and any other member of the DoD AI community interested in understanding how the DoD is investing resources for its Artificial Intelligence Portfolio.'),
				question: 'Who Should Use the DoD JBOOK Search for the AI Inventory Portfolio?'
			},
			{
				answer: anchorme(`Organizations intended to complete the Service Level review are the designated representatives of OUSD(R&E), the Military Services, and Special Operations Command. 
					<br />
					<br />Upon logging in, click on the Reviewer Checklist Tab. On this tab, you will find the projects you are supposed to review. Double click on an individual Project line, and you will be taken to the Project Profile page. Read the Project Description (and any AI related key words in highlighted text), the General Ledger, Accomplishments and Contracts information as well as the Primary Reviewer section. Then scroll down to the Service Reviewer section. In this section you can review and accept or reject the accuracy of the JAIC’s findings about the project in question.   
					<br />
					<br />The primary reviewer name will prepopulate based on your service. If desired, enter a secondary reviewer name in the text box labeled Secondary Reviewer. Use the drop downs to select if you agree with the JAICs determination regarding whether or not the project is Core AI, AI Enabled, AI enabling or not AI. Definitions for each of these terms can be found by hovering over the relevant text next to the drop down. If you do not agree with the JAICs determination, enter whether the project is Core AI, AI Enabled, AI enabling or not AI in the relevant drop down.  
					<br />
					<br />Finally, add the project POC, POC Organization, POC title and POC email in the text boxes provided. A suitable type of PoC would be the Program Element Monitor. Add any other relevant information to the Reviewer Notes Text Box. Once all these tasks are complete click on the submit button at the bottom of the Service Reviewer section. If you need to revise a submitted set of information on a project, click on the reset button at the bottom of the Service Reviewer section. Close this page when complete and go back to the Reviewer Checklist page to select the next project for review.
				`),
				question: 'How Does the Tool Work for Service Level Reviewers?'
			},
			{
				answer: anchorme(`Upon logging in, click on the Reviewer Checklist Tab. On this tab, you will find the projects you are supposed to review. Double click on an individual Project line, and you will be taken to the Project Profile page. Read the Project Description (and any AI related key words in highlighted text), the General Ledger, and Contracts information as well as the Primary and Service Reviewer sections. Then scroll down to the POC Reviewer section.  
					<br />
					<br />If you are not the appropriate POC for this Program/Project, please enter an alternate AI Point of Contact for this Program/Project in the POC section of the Service Reviewer Section. We ask that you enter the Alternate POC Title, Name, Email address, Organization and Phone number in this section.    
					<br />
					<br />Use the drop downs to select if you agree with the JAICs determination of the official transition partner. Definitions for transition partner can be found by hovering over the relevant text next to the drop down. If you do not agree with the JAICs determination, enter whether the project’s transition partner in the relevant drop down. Next, use the check boxes to identify Academic/Industry Mission Partners. If the Academic/Industry Mission Partner(s) are not listed add them in the text box below the check box list.  Using the radio buttons, select the primary Joint Capability Area the AI portion of this system is performing. Next Use the drop downs to select the primary AI Domain. A list of checkboxes will pop up for AI tasks. Select all checkboxes that apply under AI task. Definitions for each of these terms can be found by hovering over the relevant text next to the drop down or check box. Finally, select the primary AI category from the drop down menu and use the slider to the right to enter an estimate of AI spend for this project. Definitions for these terms can be found by hovering over the relevant text next to the drop down.  
					<br />
					<br />Once all these tasks are complete click on the submit button at the bottom of the Service Reviewer section. If you need to revise a submitted set of information on a project, click on the reset button at the bottom of the POCReviewer section. Close this page when complete and go back to the Reviewer Checklist page to select the next project for review.
				`),
				question: 'How Does the Tool Work For Project/POC Level Reviewers?'
			}
		]};
		categorized['general'].push();
		setFAQdata(categorized);

	}, []);

	useEffect(() => {
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, [selectedCategory, onScroll]);

	const renderAboutGC = () => {
		return [
			<StyledSummaryFAQContainer>
				<Grid container className={'summarySection'}>
					<Grid item xs={12} className={'summaryTextSectionContainer'}>
						<Typography className={'summarySectionHeader'}>Congressionally-Mandated Inventory of DoD AI Programs | Summary and FAQ</Typography>
					</Grid>
				</Grid>
				<Grid container>
					<Grid item xs={12}>
						<Grid container className={'summaryTextSection'}>
							<Grid item xs={8}>
								<Typography className={'summarySectionSubHeader'}>Welcome to the Phase II DoD AI Inventory!</Typography>
								<Typography className={'summarySectionText'}>Click <a href="https://wiki.advana.data.mil/display/SDKB/GAMECHANGER+Training+Resources">here</a> to view our User Guide.</Typography>
								<Typography className={'summarySectionText'}>As part of the FY21 Defense Appropriations Bill, Congress tasked the Director of the DoD Joint AI Center to provide the congressional defense committees an inventory of all DoD artificial intelligence activities, to include each:</Typography>
								<ul className={'summarySectionList'}>
									<li>program’s appropriation, project, and (budget) line number</li>
									<li>the current and future years defense program funding (FY21-FY25)</li>
									<li>the identification of academic or industry mission partners, if applicable</li>
									<li>any planned transition partners, if applicable</li>
								</ul>
								<Typography className={'summarySectionText'}>
										Over the past year, JAIC has worked closely with OUSD(R&E), OUSD(C), the Services, and other DoD Component representatives of the DoD AI Working Group in scoping and executing this task. We delivered the Phase I Inventory of DoD AI Programs in April 2021.
								</Typography>
								<Typography className={'summarySectionText'}>
										In partnership with OUSD(C), the JAIC is executing the Phase II AI Inventory via the Advana Platform, which the Deputy Secretary of Defense has officially designated “as the single enterprise authoritative data management and analytics platform.”
								</Typography>
							</Grid>
							<Grid item xs={4} className={'summaryLogoSectionContainer'}>
								<div className={'summaryLogoSection'}>
									<img
										src={JAICLogo}
										alt="jaic-title"
										id={'titleButton'}
										className={'jaic-image'}
									/>
								</div>
							</Grid>

						</Grid>
						<div className={'summaryTextSection'}>
							<Typography className={'summarySectionText'}>
									Using the Advana Gamechanger platform, you will be able to easily review key budget and contracting data about AI-related programs and projects and input additional information needed to complete this congressionally mandated tasking.
							</Typography>
							<Typography className={'summarySectionText'}>
									Phase II of the AI Inventory (to be submitted to Congress in early 2022) will result in a tool that addresses limitations of Phase I deliverable and includes an inventory of classified programs. The Phase II inventory will be conducted via a three-part data coordination and review process: at the JAIC-level, Service-level, and program POC-level.
							</Typography>
							<Typography className={'summarySectionText'}>
									JAIC-Level Review: The JAIC will publish and refine the SIPR and NIPR tools, and review the inventory data to initially classify projects and programs as either AI-core, AI-enabled, or AI-enabling.
							</Typography>
							<Typography className={'summarySectionText'}>
									Service-Level Review: After initial classification and tool refinement, the Services will confirm classification of the projects and programs, which will be followed by detailed analysis of each project or program at the POC-level.
							</Typography>
							<Typography className={'summarySectionText'}>
									Program PoC-Level Review: The POCs will provide more detailed information on each program and project, to include: Joint Capability Area, Type of AI, AI domain & task.
							</Typography>
							<Typography className={'summarySectionText'}>
									After all phases of coordination and review, the final PAT and Phase II of the inventory will be submitted to Congress in early 2022. After that time, this dataset will be made available to the entire DoD AI community for use in their analysis and planning.
							</Typography>
						</div>
					</Grid>
				</Grid>
			</StyledSummaryFAQContainer>
		];
	};

	const renderFAQ = () => {
		return [
			<div style={{width: 900}}>
				<Typography style={{fontFamily: 'Montserrat', fontSize: 38, fontWeight: 'bold', marginBottom: 20}}>Your Questions Answered</Typography>
				<Typography style={{fontFamily: 'Noto Sans', fontSize: 20, marginBottom: 20}}>Browse our answers to some of your most frequently asked questions (FAQs) JBook Search and JAIC AI Inventory. We’ve organized our responses around our guiding principles.</Typography>
				<Typography style={{fontFamily: 'Noto Sans', fontSize: 20, marginBottom: 20}}>We want to make sure we’re answering all your questions, so if you can’t find what you’re looking for, let us know. Submit a new question or concern, and we’ll do our best to address it.</Typography>
				<Typography style={{fontFamily: 'Noto Sans', fontSize: 20}}>We’ll continuously update this page with new insights and information. So check back often.</Typography>
			</div>,
			<div style={{ display: 'flex' }}>
				<StyledCategories>
					{categoryOrder.map((cat, i) => {
						const category = cat.toLowerCase();
						return (
							<StyledListItem
								id={category}
								selected={selectedCategory}
								onClick={() => {
									ignoreNextScrollEvent = true;
									categoryRefs.current[i].current.scrollIntoView();
									setSelectedCategory(category);
								}}
							>
								{cat}
							</StyledListItem>
						);
					})}
				</StyledCategories>
				<div style={{ margin: '0 0 0 30px' }}>
					{categoryOrder.map((cat, i) => {
						const category = cat.toLowerCase();
						return (
							<div style={{ marginBottom: 30 }}>
								<div
									id="spacer"
									ref={categoryRefs.current[i]}
									style={{ height: 30 }}
								/>
								<Typography variant="h5" style={{ marginBottom: 15 }}>
									{cat}
								</Typography>
								{FAQdata[category] ? (
									FAQdata[category].map((obj) => (
										<GCAccordion
											expanded={false}
											header={obj.question}
											contentAlign="left"
										>
											<div
												dangerouslySetInnerHTML={{
													__html: sanitizeHtml(obj.answer),
												}}
											/>
										</GCAccordion>
									))
								) : (
									<Typography variant="body">
										None for now, please check back later.
									</Typography>
								)}
							</div>
						);
					})}
				</div>
			</div>,
		];
	};

	return (
		<div style={TabStyles.tabContainer}>
			<Tabs>
				<div style={{ ...TabStyles.tabButtonContainer, paddingLeft: 0 }}>
					<TabList style={{...TabStyles.tabsList, borderBottom: `2px solid ${GC_COLORS.primary}`,}}>
						<Tab
							style={{
								...TabStyles.tabStyle,
								...(tabIndex === 'about' ? {...TabStyles.tabSelectedStyle, backgroundColor: GC_COLORS.primary} : {}),
								borderRadius: `5px 0 0 0`,
							}}
							title="userHistory"
							onClick={() => setTabIndex('about')}
						>
							<Typography variant="h6" display="inline" title="cardView">
								ABOUT JBOOK
							</Typography>
						</Tab>
						<Tab
							style={{
								...TabStyles.tabStyle,
								...(tabIndex === 'faq' ? {...TabStyles.tabSelectedStyle, backgroundColor: GC_COLORS.primary} : {}),
								borderRadius: `5px 0 0 0`,
							}}
							title="userHistory"
							onClick={() => setTabIndex('faq')}
						>
							<Typography variant="h6" display="inline" title="cardView">
								FAQ
							</Typography>
						</Tab>
					</TabList>
				</div>

				<div style={TabStyles.panelContainer}>
					<TabPanel>{renderAboutGC()}</TabPanel>
					<TabPanel>
						<StyledSummaryFAQContainer>
							<div className={'faqSection'}>
								{renderFAQ()}
							</div>
						</StyledSummaryFAQContainer>
					</TabPanel>
				</div>
			</Tabs>
		</div>
	);
};

export default JBookAboutUs;
