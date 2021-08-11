import React, {useState} from 'react';
import { Tabs, Tab, TabPanel, TabList } from "react-tabs";
import TabStyles from '../common/TabStyles'
import { Typography } from "@material-ui/core";

import GCIcon from "../../images/icon/gc-logo.png";
import FileIcon from "../../images/icon/GC 312@3x.png";
import SearchIcon from "../../images/icon/GC 317@3x.png";
import GraphIcon from "../../images/icon/GC 318@3x.png";
import ScaleIcon from "../../images/icon/GC 319@3x.png";
import NLPIcon from "../../images/icon/GC 320@3x.png";
import PentagonImage from "../../images/GC-Ourstoryimg.png";

const styles = {
	iconContainer: {
		display:'flex'
	},
	iconStyle: {
		width:'90px',
		height:'90px',
		marginRight:'30px'
	}
}
const GCAboutUs = (props) => {
	const [tabIndex, setTabIndex] = useState('about');

	const renderAboutGC = () => {

		return([
			<div style={{margin: '30px 0px 30px 100px', display:'flex'}}>
				<div style={{display:'flex', flexDirection:'column',paddingRight:'150px'}}>
					<Typography variant="h2" display="inline">About GAMECHANGER</Typography>
					<Typography variant="body" display="block">Today, tens of thousands of documents govern how the Department of Defense (DoD) operates. The documents exist in different repositories, often exist on different networks, are discoverable to different communities, are updated independently, and evolve rapidly. No single ability has ever existed that would enable navigation of the vast universe universe of governing requirements and guidance documents, leaving the Department unable to make evidence-based, data-driven decisions. Today, merely one year into development, GAMECHANGER offers a scalable solution with with an authoritative corpus comprising a single trusted repository of all statutory and policy driven requirements based on Artificial-Intelligence (AI) enabled technologies.</Typography>
					<Typography variant="h5" display="block" style={{marginTop:'30px'}}>Our Vision and Mission</Typography>
					<Typography variant="body" style={{marginTop:'10px'}}><b>Vision: </b>To fundamentally change the way in which the Department navigates its universe of requirements and makes decisions</Typography>
					<Typography variant="body" syyle={{marginTop:'10px'}}><b>Mission: </b>To create a trusted Department-wide solution for evidence-based, data-driven decision making across the universe of DoD requirements, by:<br/>• Building the Department’s authoritative corpus of requirements and policy to drive search, discovery, understanding, and analytic capabilities <br/>• Operationalizing cutting-edge technologies, algorithms, models, and interfaces to automate and scale the solution <br/>• Fusing best practices from industry, academia, and government to advance innovation and research <br/>• Engaging the open-source community to build generalizable and replicable technology</Typography>
				</div>
				<img style={{width:'520px', height:'550px', marginRight:150}} src={GCIcon}></img>
			</div>,
			<div style={{backgroundColor:'#ECF1F7'}}>
				<div style={{margin: '0 350px 0 100px', paddingBottom: '30px'}}>
					<div style={{padding: '30px 0 30px 0'}}>
						<Typography variant="h5" display="inline">Key Goals</Typography>
					</div>
					<div style={styles.iconContainer}>
						<img style={styles.iconStyle} src={FileIcon}></img>
						<div>
							<Typography variant="body"><b>Authoritative Corpus of DoD Requirements</b><br/>Provides a single, comprehensive, trusted repository of all DoD governing requirements built using AI-enabled technologies, including Natural Language Processing (NLP), and using generalizable data engineering pipelines for a variety of data formats</Typography>
						</div>
					</div>
					<div style={styles.iconContainer}>
						<img style={styles.iconStyle} src={SearchIcon}></img>
						<div>
							<Typography variant="body"><b>Keyword and Semantic Search</b><br/>Queries the policy corpus to identify relevant requirements based on exact words, phrases, and/or semantic context to identify applicable responsibilities, functions, strategies, and more</Typography>
						</div>
					</div>
					<div style={styles.iconContainer}>
						<img style={styles.iconStyle} src={GraphIcon}></img>
						<div>
							<Typography variant="body"><b>Knowledge Graph</b><br/>Maps relationships between documents and entities to enable discovery of interdependencies, connection points, redundancies, and/or inconsistencies between requirements</Typography>
						</div>
					</div>
					<div style={styles.iconContainer}>
						<img style={styles.iconStyle} src={ScaleIcon}></img>
						<div>
							<Typography variant="body"><b>Built to Scale</b><br/>Enables application cloning to facilitate new use cases, operationalizes open-source technology, and exposes application programming interfaces to stakeholders</Typography>
						</div>
					</div>
					<div style={styles.iconContainer}>
						<img style={styles.iconStyle} src={NLPIcon}></img>
						<div>
							<Typography variant="body"><b>Natural Language Processing</b><br/>Ensures linked data is never out of sync by leveraging an agile machine learning operations (MLOps) process to continually refine NLP technologies, including AI and machine learning capabilities, which train automation models to identify, aggregate, ingest, and integrate data sources</Typography>
						</div>
					</div>
				</div>
			</div>,
			<div style={{backgroundColor: '#0000000A'}}>
				<div style={{display:'flex', margin: '0 300px 0 100px', padding: '30px 0 30px 0'}}>
					<img src={PentagonImage}></img>
					<div style={{marginLeft:'30px'}}>
						<div style={{paddingBottom:'30px'}}>
							<Typography variant="h5" display="inline">Delivering Mission Utility<br/></Typography>
						</div>
						<Typography variant="body">
							GAMECHANGER enhances insights and refines processes by changing the way in which users interact with the policy domain:<br/>
							<b>Policy Analysts/General Counsel</b><br/>
							• Mitigate conflicting policy<br/>
							• Discover interdependencies<br/>
							• Extract features and meaning from documents<br/><br/>
							<b>Component/Agency Leadership</b><br/>
							• Connect strategy and requirements meaningfully<br/>
							• Automate identification of policy and revisions and create exponentially better policy <br/><br/>
							<b>Budget/Financial Staff</b><br/>
							• Understand financial implications of proposed changes or revisions to existing policy<br/>
							• Identify budget efficiencies by streamlining policy and de-conflicting requirements <br/><br/>
							<b>Data Scientists/Engineers</b><br/>
							• Establish the foundation for a more integrated DoD<br/>
							• Operationalize open source algorithms and new developments in NLP<br/>
							• Develop code collaboratively among DoD civilians, military personnel, and commercial contractors<br/>
						</Typography>
					</div>
				</div>
			</div>
		])
	}

	return (
	<div style={TabStyles.tabContainer}>
		<Tabs>
			<div style={TabStyles.tabButtonContainer}>
				<TabList style={TabStyles.tabsList}>
					<Tab style={{...TabStyles.tabStyle,
						...(tabIndex === 'about' ? TabStyles.tabSelectedStyle : {}),
						borderRadius: `5px 0 0 0`
						}} title="userHistory" onClick={() => setTabIndex('about')}>
						<Typography variant="h6" display="inline" title="cardView">ABOUT GAMECHANGER</Typography>
					</Tab>
					<Tab style={{...TabStyles.tabStyle,
						...(tabIndex === 'faq' ? TabStyles.tabSelectedStyle : {}),
						borderRadius: `5px 0 0 0`
						}} title="userHistory" onClick={() => setTabIndex('faq')}>
						<Typography variant="h6" display="inline" title="cardView">FAQ</Typography>
					</Tab>
				</TabList>
			</div>

			<div style={TabStyles.panelContainer}>
				<TabPanel>
					{renderAboutGC()}
				</TabPanel>
				<TabPanel>
					<p>This is the faq page</p> 
				</TabPanel>
			</div>
		</Tabs>
	</div>)
}

export default GCAboutUs;