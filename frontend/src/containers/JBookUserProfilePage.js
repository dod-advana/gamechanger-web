import React, { useState, useContext, useEffect } from 'react';
import Notifications from '../components/notifications/Notifications';
import SearchBar from '../components/searchBar/SearchBar';
import {BudgetSearchContext} from '../components/modules/budgetSearch/budgetSearchContext';
import SideNavigation from '../components/navigation/SideNavigation';
import Alerts from '../components/notifications/Alerts';
import {setState} from '../sharedFunctions';
import UserProfile from '../components/user/UserProfile';
import JBookAPI from '../components/api/jbook-service-api';
import GCAccordion from '../components/common/GCAccordion';
import {Typography} from '@mui/material';
import ReactTable from "react-table";
import DropdownFilter from "../components/modules/budgetSearch/DropdownFilter";
import InputFilter from "../components/modules/budgetSearch/InputFilter";

const jbookAPI = new JBookAPI();

const styles = {
	leftContainerSummary: {
		width: '15%',
		marginTop: 10
	},
	rightContainerSummary: {
		marginLeft: '17.5%',
		width: '79.7%'
	},
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		margin: '2px 5px 0px'
	},
	titleText: {
		fontSize: 22,
		fontWeight: 500,
		color: '#131E43',
		margin: '20px 0',
		fontFamily: 'Montserrat'
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
		justifyContent: 'center'
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
		paddingTop: 20
	},
	orangeText: {
		fontWeight: 'bold',
		color: '#E9691D'
	}
}

const columns = [
	{
		Header: () => <p style={styles.tableColumn}>ID</p>,
		accessor: 'id',
		width: 190,
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value}</p>
			</div>
		),
		headerStyle: {
			overflow: 'visible'
		},
		id: 'id',
		sortable: false,
		show: false
	},
	{
		Header: () => <p style={styles.tableColumn}>BUDGET TYPE</p>,
		accessor: 'type',
		width: 130,
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value}</p>
			</div>
		),
		headerStyle: {
			overflow: 'visible'
		},
		id: 'budgetType',
		sortable: false
	},
	{
		Header: () => <p style={styles.tableColumn}>BUDGET YEAR (FY)</p>,
		accessor: 'budgetYear',
		width: 130,
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value}</p>
			</div>
		),
		headerStyle: {
			overflow: 'visible'
		},
		id: 'budgetYear',
	},
	{
		Header: () => <p style={styles.tableColumn}>PROGRAM ELEMENT / BUDGET LINE ITEM</p>,
		accessor: row => row.budgetLineItem && row.budgetLineItem !== '-' ? row.budgetLineItem : row.programElement,
		width: 180,
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value}</p>
			</div>
		),
		id: 'programElement'
	},
	{
		Header: () => <p style={styles.tableColumn}>PROJECT #</p>,
		accessor: 'projectNum',
		width: 155,
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value}</p>
			</div>
		),
		id: 'projectNum'
	},
	{
		Header: () => <p style={styles.tableColumn}>PROJECT TITLE</p>,
		accessor: 'projectTitle',
		width: 190,
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value}</p>
			</div>
		),
		id: 'projectTitle'
	},
	{
		Header: () => <p style={styles.tableColumn}>SERVICE / AGENCY</p>,
		accessor: 'serviceAgency',
		width: 150,
		headerStyle: {
			overflow: 'visible'
		},
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value}</p>
			</div>
		),
		id: 'serviceAgency'
	},
	{
		Header: () => <p style={styles.tableColumn}>PRIMARY REVIEWER</p>,
		accessor: 'primaryReviewer',
		width: 130,
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value}</p>
			</div>
		),
		headerStyle: {
			overflow: 'visible'
		},
		id: 'primaryReviewer',
	},
	{
		Header: () => <p style={styles.tableColumn}>SERVICE REVIEWER</p>,
		accessor: row => row.serviceSecondaryReviewer && row.serviceSecondaryReviewer !== '' ? row.serviceSecondaryReviewer : row.serviceReviewer,
		width: 130,
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value}</p>
			</div>
		),
		headerStyle: {
			overflow: 'visible'
		},
		id: 'serviceReviewer',
	},
	{
		Header: () => <p style={styles.tableColumn}>POC REVIEWER</p>,
		accessor: row => row.altPOCName && row.altPOCName !== '' ? row.altPOCOrg ? `${row.altPOCName} (${row.altPOCOrg})` : row.altPOCName : row.servicePOCOrg ? `${row.servicePOCName} (${row.servicePOCOrg})` : row.servicePOCName,
		width: 120,
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value}</p>
			</div>
		),
		headerStyle: {
			overflow: 'visible'
		},
		id: 'pocReviewer',
	},
	{
		Header: () => <p style={styles.tableColumn}>KEYWORD(S)</p>,
		accessor: row => row.keywords,
		width: 150,
		show: false,
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value}</p>
			</div>
		),
		id: 'keywords'
	},
	{
		Header: () => <p style={styles.tableColumn}>REVIEW STATUS</p>,
		accessor: 'reviewStatus',
		width: 140,
		sortable: false,
		Cell: row => {
			return (
				<div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
					{row.value}
				</div>
			)
		},
		headerStyle: {
			overflow: 'visible'
		},
		id: 'serviceReviewStatus'
	},
	{
		Header: () => <p style={styles.tableColumn}>LABEL(S)</p>,
		accessor: 'reviewStatus',
		width: 150,
		sortable: false,
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value === 'Finished Review' ? row.original.pocClassLabel ?? row.original.serviceClassLabel ?? row.original.primaryClassLabel : row.value === 'Partial Review (POC)' ? row.original.serviceClassLabel ?? row.original.primaryClassLabel : row.original.primaryClassLabel}</p>
			</div>
		),
		headerStyle: {
			overflow: 'visible'
		},
		id: 'primaryClassLabel',
	},
	{
		Header: () => <p style={styles.tableColumn}>SOURCE</p>,
		accessor: 'sourceTag',
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value}</p>
			</div>
		),
		headerStyle: {
			overflow: 'visible'
		},
		width: 180,
		id: 'sourceTag'
	},
	{
		Header: () => <p style={styles.tableColumn}>BUDGET LINE ITEM #</p>,
		accessor: 'budgetLineItem',
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value}</p>
			</div>
		),
		id: 'budgetLineItem',
		show: false
	},
	{
		Header: () => <p style={styles.tableColumn}>APPROPRIATION NUMBER</p>,
		accessor: 'appropriationNumber',
		Cell: row => (
			<div style={{ textAlign: 'center' }}>
				<p>{row.value}</p>
			</div>
		),
		id: 'appropriationNumber',
		show: false
	},
];

const JBookUserProfilePage = (props) => {
	
	const {
		cloneData
	} = props;
	
	const context = useContext(BudgetSearchContext);
	const {state, dispatch} = context;

	const [toDoList, setToDoList] = useState([]);
	const [completedList, setCompletedList] = useState([]);
	const [permissions, setPermissions] = useState({primary: false, service: false, poc: false});
	const [email, setEmail] = useState(undefined);

	useEffect(() => {
		const tmpPermissions = {primary: false, service: false, poc: false};

		jbookAPI.getUserProfileData().then(data => {
			tmpPermissions['primary'] = data.data.is_primary_reviewer;
			tmpPermissions['service'] = data.data.is_service_reviewer;
			tmpPermissions['poc'] = data.data.is_poc_reviewer;

			setPermissions(tmpPermissions);
			setEmail(data.data.email)
		});
	}, []);

	useEffect(() => {
		if (permissions && email) {
			jbookAPI.callDataFunction({
				functionName: 'getUserSpecificReviews',
				cloneName: 'budgetSearch',
				options: {permissions, email}
			}).then(data => {
				const docs = data.data.docs;
				const toDo = docs.filter(doc => {
					let returnBool = false;
					if (permissions.primary){
						returnBool = doc.primaryReviewStatus !== 'Finished Review';
					}

					if (permissions.service){
						returnBool = doc.serviceReviewStatus !== 'Finished Review';
					}

					if (permissions.poc){
						returnBool = doc.pocReviewStatus !== 'Finished Review';
					}

					return returnBool;
				})

				const finished = docs.filter(doc => {
					let returnBool = false;
					if (permissions.primary){
						returnBool = doc.primaryReviewStatus === 'Finished Review';
					}

					if (permissions.service){
						returnBool = doc.serviceReviewStatus === 'Finished Review';
					}

					if (permissions.poc){
						returnBool = doc.pocReviewStatus === 'Finished Review';
					}

					return returnBool;
				})

				setToDoList(toDo);
				setCompletedList(finished);
			});
		}
	}, [permissions, email]);

	useEffect(() => {
		if (!state.cloneDataSet) {
			setState(dispatch, {cloneData: cloneData, cloneDataSet: true});
		}
	}, [cloneData, state, dispatch]);

	const renderToDoList = () => {
		return (
			<>
				<ReactTable
					data={toDoList}
					columns={columns}
					style={{width: '100%', height: 500}}
					filterable={true}
					defaultPageSize={5}
					defaultFilterMethod={(filter, row) =>
						String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase())
					}
					getTbodyProps={(state, rowInfo, column) => {
						return {
							style: {
								overflowY: 'auto',
								overflowX: 'hidden'
							},
							id: 'list-view-tbody'
						};
					}}
					getTdProps={(state, rowInfo, column) => ({
						style: {
							whiteSpace: 'unset',
						},
					})
					}
					getTheadThProps={(state, rowInfo, column) => {
						return { style: { fontSize: 15, fontWeight: 'bold', whiteSpace: 'unset' } };
					}}
					getTheadTrProps={(state, rowInfo, column) => {
						return { style: { overflow: 'visible' } };
					}}
					getTrProps={(state, rowInfo, column) => {
						return {
							style: { cursor: 'pointer' },
							onClick: () => {
								const row = rowInfo.row;
								const {
									projectTitle,
									projectNum,
									budgetLineItem,
									budgetType,
									keywords,
									budgetYear,
									id,
									appropriationNumber
								} = row;
								// I do not understand why row changes programElement into BLI
								const programElement = rowInfo.original.programElement;
								let url = `#/profile?title=${projectTitle}&programElement=${programElement}&projectNum=${projectNum}&type=${encodeURIComponent(budgetType)}&budgetLineItem=${budgetLineItem}&budgetYear=${budgetYear}&searchText=${''}&id=${id}&appropriationNumber=${appropriationNumber}`;
								if (keywords && keywords.length) {
									url += `&keywords=${keywords}`;
								}
								window.open(url);
							},
						}
					}}
				/>
			</>
		);
	}

	const renderCompletedList = () => {
		return (
			<>
				<ReactTable
					data={completedList}
					columns={columns}
					style={{width: '100%', height: 500}}
					filterable={true}
					defaultPageSize={5}
					defaultFilterMethod={(filter, row) =>
						String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase())
					}
					getTbodyProps={(state, rowInfo, column) => {
						return {
							style: {
								overflowY: 'auto',
								overflowX: 'hidden'
							},
							id: 'list-view-tbody'
						};
					}}
					getTdProps={(state, rowInfo, column) => ({
						style: {
							whiteSpace: 'unset',
						},
					})
					}
					getTheadThProps={(state, rowInfo, column) => {
						return { style: { fontSize: 15, fontWeight: 'bold', whiteSpace: 'unset' } };
					}}
					getTheadTrProps={(state, rowInfo, column) => {
						return { style: { overflow: 'visible' } };
					}}
					getTrProps={(state, rowInfo, column) => {
						return {
							style: { cursor: 'pointer' },
							onClick: () => {
								const row = rowInfo.row;
								const {
									projectTitle,
									projectNum,
									budgetLineItem,
									budgetType,
									keywords,
									budgetYear,
									id,
									appropriationNumber
								} = row;
								// I do not understand why row changes programElement into BLI
								const programElement = rowInfo.original.programElement;
								let url = `#/profile?title=${projectTitle}&programElement=${programElement}&projectNum=${projectNum}&type=${encodeURIComponent(budgetType)}&budgetLineItem=${budgetLineItem}&budgetYear=${budgetYear}&searchText=${''}&id=${id}&appropriationNumber=${appropriationNumber}`;
								if (keywords && keywords.length) {
									url += `&keywords=${keywords}`;
								}
								window.open(url);
							},
						}
					}}
				/>
			</>
		);
	}

	const displayUserRelatedItems = () => {
		return (
			<div>
				<GCAccordion
					expanded={toDoList.length > 0}
					header={`MY TO DO LIST`}
					itemCount={toDoList.length}
				 >
					{renderToDoList()}
				</GCAccordion>
				<GCAccordion
					expanded={completedList.length > 0}
					header={`FINISHED ITEMS`}
					itemCount={completedList.length}
				 >
					{renderCompletedList()}
				</GCAccordion>
			</div>
		);
	}
    
	return (
		<div style={{ minHeight: 'calc(100vh - 120px)' }}>
			{/* Side Navigation */}
			<SideNavigation context={context} />

			{/* Alerts */}
			<Alerts context={context} />

			{/* Notifications */}
			<Notifications context={context} />

			{/* Search Bar */}
			<SearchBar context={context} />

			{/* User Profile Page */}
			<UserProfile
				getUserData={jbookAPI.getUserProfileData}
				updateUserData={jbookAPI.updateUserProfileData}
				getAppRelatedUserData={() => {}}
				updateAppRelatedUserData={() => {}}
				displayCustomAppContent={displayUserRelatedItems}
				style={{margin: '20px 40px'}}
				primaryColor={'#1C2D65'}
				secondaryColor={'#8091A5'}
			/>

		</div>  
	);
}

export default JBookUserProfilePage;