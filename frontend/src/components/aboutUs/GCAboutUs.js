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
import { Typography } from '@material-ui/core';

import GCAccordion from '../common/GCAccordion';
import GameChangerAPI from '../api/gameChanger-service-api';

import GCLogo from '../../images/logos/Gamechanger logo.png';
import FileIcon from '../../images/icon/GC 312@3x.png';
import SearchIcon from '../../images/icon/GC 317@3x.png';
import GraphIcon from '../../images/icon/GC 318@3x.png';
import ScaleIcon from '../../images/icon/GC 319@3x.png';
import NLPIcon from '../../images/icon/GC 320@3x.png';
import PentagonImage from '../../images/GC-Ourstoryimg.png';

const gameChangerAPI = new GameChangerAPI();

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

const styles = {
	iconContainer: {
		display: 'flex',
	},
	iconStyle: {
		width: '90px',
		height: '90px',
		marginRight: '30px',
	},
};

const GCAboutUs = (props) => {
	const [tabIndex, setTabIndex] = useState('about');
	const [selectedCategory, setSelectedCategory] = useState('general');
	const [FAQdata, setFAQdata] = useState([]);
	const categoryRefs = useRef([]);

	const categoryOrder = useMemo(() => {
		return [
			'General',
			'Clones',
			'Search',
			'Graph View',
			'Data',
			'Analyst Tools',
			'Collaboration',
		]
	},[])

	const arrLength = categoryOrder.length;
	let ignoreNextScrollEvent = false;

	if (categoryRefs.current?.length !== arrLength) {
		categoryRefs.current = Array(arrLength)
			.fill()
			.map((_, i) => categoryRefs.current[i] || createRef());
	}

	const onScroll = useCallback(
		(e) => {
			if (categoryRefs.current[1].current !== null && !ignoreNextScrollEvent) {
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
		const fetchData = async () => {
			const { data } = await gameChangerAPI.getFAQ();
			const categorized = {};
			data.forEach((entry) => {
				entry.answer = anchorme(entry.answer);

				if (entry.category in categorized) {
					categorized[entry.category].push(entry);
				} else {
					categorized[entry.category] = [entry];
				}
			});

			setFAQdata(categorized);
		};

		fetchData();
	}, []);

	useEffect(() => {
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, [selectedCategory, onScroll]);

	const renderAboutGC = () => {
		return [
			<div style={{ margin: '0 0px 30px 100px', display: 'flex' }}>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						paddingRight: '150px',
					}}
				>
					<Typography variant="h2" display="inline">
						About GAMECHANGER
					</Typography>
					<Typography variant="body" display="block">
						Today, tens of thousands of documents govern how the Department of
						Defense (DoD) operates. The documents exist in different
						repositories, often exist on different networks, are discoverable to
						different communities, are updated independently, and evolve
						rapidly. No single ability has ever existed that would enable
						navigation of the vast universe universe of governing requirements
						and guidance documents, leaving the Department unable to make
						evidence-based, data-driven decisions. Today, merely one year into
						development, GAMECHANGER offers a scalable solution with with an
						authoritative corpus comprising a single trusted repository of all
						statutory and policy driven requirements based on
						Artificial-Intelligence (AI) enabled technologies.
					</Typography>
					<Typography
						variant="h5"
						display="block"
						style={{ marginTop: '30px' }}
					>
						Our Vision and Mission
					</Typography>
					<Typography variant="body" style={{ marginTop: '10px' }}>
						<b>Vision: </b>To fundamentally change the way in which the
						Department navigates its universe of requirements and makes
						decisions
					</Typography>
					<Typography variant="body" style={{ marginTop: '10px' }}>
						<b>Mission: </b>To create a trusted Department-wide solution for
						evidence-based, data-driven decision making across the universe of
						DoD requirements, by:
						<br />• Building the Department’s authoritative corpus of
						requirements and policy to drive search, discovery, understanding,
						and analytic capabilities <br />• Operationalizing cutting-edge
						technologies, algorithms, models, and interfaces to automate and
						scale the solution <br />• Fusing best practices from industry,
						academia, and government to advance innovation and research <br />•
						Engaging the open-source community to build generalizable and
						replicable technology
					</Typography>
				</div>
				<img
					style={{ width: '520px', height: '550px', marginRight: 150 }}
					alt="Gamechanger Logo"
					src={GCLogo}
				></img>
			</div>,
			<div style={{ backgroundColor: '#ECF1F7' }}>
				<div style={{ margin: '0 350px 0 100px', paddingBottom: '30px' }}>
					<div style={{ padding: '30px 0 30px 0' }}>
						<Typography variant="h5" display="inline">
							Key Goals
						</Typography>
					</div>
					<div style={styles.iconContainer}>
						<img style={styles.iconStyle} alt="File Icon" src={FileIcon}></img>
						<div>
							<Typography variant="body">
								<b>Authoritative Corpus of DoD Requirements</b>
								<br />
								Provides a single, comprehensive, trusted repository of all DoD
								governing requirements built using AI-enabled technologies,
								including Natural Language Processing (NLP), and using
								generalizable data engineering pipelines for a variety of data
								formats
							</Typography>
						</div>
					</div>
					<div style={styles.iconContainer}>
						<img
							style={styles.iconStyle}
							alt="Search Icon"
							src={SearchIcon}
						></img>
						<div>
							<Typography variant="body">
								<b>Keyword and Semantic Search</b>
								<br />
								Queries the policy corpus to identify relevant requirements
								based on exact words, phrases, and/or semantic context to
								identify applicable responsibilities, functions, strategies, and
								more
							</Typography>
						</div>
					</div>
					<div style={styles.iconContainer}>
						<img
							style={styles.iconStyle}
							alt="Graph Icon"
							src={GraphIcon}
						></img>
						<div>
							<Typography variant="body">
								<b>Knowledge Graph</b>
								<br />
								Maps relationships between documents and entities to enable
								discovery of interdependencies, connection points, redundancies,
								and/or inconsistencies between requirements
							</Typography>
						</div>
					</div>
					<div style={styles.iconContainer}>
						<img
							style={styles.iconStyle}
							alt="Scale Icon"
							src={ScaleIcon}
						></img>
						<div>
							<Typography variant="body">
								<b>Built to Scale</b>
								<br />
								Enables application cloning to facilitate new use cases,
								operationalizes open-source technology, and exposes application
								programming interfaces to stakeholders
							</Typography>
						</div>
					</div>
					<div style={styles.iconContainer}>
						<img style={styles.iconStyle} alt="NLP Icon" src={NLPIcon}></img>
						<div>
							<Typography variant="body">
								<b>Natural Language Processing</b>
								<br />
								Ensures linked data is never out of sync by leveraging an agile
								machine learning operations (MLOps) process to continually
								refine NLP technologies, including AI and machine learning
								capabilities, which train automation models to identify,
								aggregate, ingest, and integrate data sources
							</Typography>
						</div>
					</div>
				</div>
			</div>,
			<div style={{ backgroundColor: '#0000000A' }}>
				<div
					style={{
						display: 'flex',
						margin: '0 300px 0 100px',
						padding: '30px 0 30px 0',
					}}
				>
					<img alt="Our Story" src={PentagonImage}></img>
					<div style={{ marginLeft: '30px' }}>
						<div style={{ paddingBottom: '30px' }}>
							<Typography variant="h5" display="inline">
								Delivering Mission Utility
								<br />
							</Typography>
						</div>
						<Typography variant="body">
							GAMECHANGER enhances insights and refines processes by changing
							the way in which users interact with the policy domain:
							<br />
							<b>Policy Analysts/General Counsel</b>
							<br />
							• Mitigate conflicting policy
							<br />
							• Discover interdependencies
							<br />
							• Extract features and meaning from documents
							<br />
							<br />
							<b>Component/Agency Leadership</b>
							<br />
							• Connect strategy and requirements meaningfully
							<br />
							• Automate identification of policy and revisions and create
							exponentially better policy <br />
							<br />
							<b>Budget/Financial Staff</b>
							<br />
							• Understand financial implications of proposed changes or
							revisions to existing policy
							<br />
							• Identify budget efficiencies by streamlining policy and
							de-conflicting requirements <br />
							<br />
							<b>Data Scientists/Engineers</b>
							<br />
							• Establish the foundation for a more integrated DoD
							<br />
							• Operationalize open source algorithms and new developments in
							NLP
							<br />
							• Develop code collaboratively among DoD civilians, military
							personnel, and commercial contractors
							<br />
						</Typography>
					</div>
				</div>
			</div>,
		];
	};

	const renderFAQ = () => {
		return [
			<div style={{ margin: '0 0 30px 100px' }}>
				<Typography variant="h2">
					Your Questions Answered
					<br />
				</Typography>
				<Typography variant="body">
					Browse our answers to some of your most frequently asked questions.
					We’ll continually update this page with new insights and information,
					so check back often.
				</Typography>
			</div>,
			<div style={{ margin: '30px 0 30px 100px', display: 'flex' }}>
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
				<div style={{ margin: '0 100px 0 30px' }}>
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
					<TabList style={TabStyles.tabsList}>
						<Tab
							style={{
								...TabStyles.tabStyle,
								...(tabIndex === 'about' ? TabStyles.tabSelectedStyle : {}),
								borderRadius: `5px 0 0 0`,
							}}
							title="userHistory"
							onClick={() => setTabIndex('about')}
						>
							<Typography variant="h6" display="inline" title="cardView">
								ABOUT GAMECHANGER
							</Typography>
						</Tab>
						<Tab
							style={{
								...TabStyles.tabStyle,
								...(tabIndex === 'faq' ? TabStyles.tabSelectedStyle : {}),
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
					<TabPanel>{renderFAQ()}</TabPanel>
				</div>
			</Tabs>
		</div>
	);
};

export default GCAboutUs;
