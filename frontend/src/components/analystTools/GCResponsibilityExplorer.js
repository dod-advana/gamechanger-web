import React, { useState, useEffect } from 'react'
import _ from 'lodash';
import { 
	FormControl,
	InputLabel,
	MenuItem,  
	Select
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import GameChangerAPI from '../api/gameChanger-service-api';
import { gcOrange } from '../common/gc-colors';
import GCResponsibilityTracker from './GCResponsibilityTracker';
import ResponsibilityDocumentExplorer from './GCResponsibilityDocumentExplorer';
import { GroupAdd } from '@material-ui/icons';

const gameChangerAPI = new GameChangerAPI();

const useStyles = makeStyles({
	root: {
		paddingTop: '16px',
		marginRight: '10px',
		'& .MuiInputBase-root':{
			height: '50px',
			fontSize: 20
		},
		'& .MuiFormLabel-root': {
			fontSize: 20
		},
		'&:hover .MuiInput-underline:before':{
			borderBottom: `3px solid ${gcOrange}`
		},
		'& .MuiInput-underline:before':{
			borderBottom: `3px solid rgba(0, 0, 0, 0.42)`
		},
		'& .MuiInput-underline:after':{
			borderBottom: `3px solid ${gcOrange}`
		},
		'& .Mui-focused':{
			borderColor: `${gcOrange}`,
			color:`${gcOrange}`
		}
	},
	selectRoot: {
		color: '#3F4A56',
	},
	selectIcon: {
		marginTop: '4px'
	},
	formlabel: {
		paddingTop: '16px'
	}
})

export default function GCResponsibilityExplorer({
	state,
	dispatch
}) {

	const classes = useStyles();
	const DOCS_PER_PAGE = 10;

	const [reView, setReView] = useState('Document');
	const [responsibilityData, setResponsibilityData] = useState([]);
	const [docResponsibilityData, setDocResponsibilityData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [sorts, setSorts] = useState([]);
	const [filters, setFilters] = useState([]);
	const [offsets, setOffsets] = useState([]);
	const [resultsPage, setResultsPage] = useState(1);
	const [reloadResponsibilities, setReloadResponsibilities] = useState(true);
	const [docTitle, setDocTitle] = useState([]);
	const [documentList, setDocumentList] = useState([]);
	const [organization, setOrganization] = useState([]);
	const [responsibilityText, setResponsibilityText] = useState({});

	useEffect(() => {
		if (reloadResponsibilities) {
			handleFetchData({ page: resultsPage, sorted: sorts, filtered: filters });
			setReloadResponsibilities(false);
		}
	 }, [reloadResponsibilities, resultsPage, sorts, filters]); // eslint-disable-line react-hooks/exhaustive-deps

	 useEffect(() => {
		const fetchDocTitles = async() => {
			const { data } = await gameChangerAPI.getResponsibilityDocTitles();
			setDocumentList(data.results);
		}
		fetchDocTitles();
	 },[])

	const handleFetchData = async ({ page, sorted, filtered }) => {
		try {
			setLoading(true);
			const tmpFiltered = _.cloneDeep(filtered);
			let offset = 0;
			let limit = 0;
			for(let i = 0; i < page * DOCS_PER_PAGE - DOCS_PER_PAGE; i++){
				if(!offsets[i]) break;
				offset += offsets[i];
			}
			for(let i =(page - 1) * DOCS_PER_PAGE; i < page * DOCS_PER_PAGE; i++){
				if(!offsets[i]) break;
				limit += offsets[i];
			}
			const { results = [] } = await getData({
				limit,
				offset,
				sorted,
				filtered: tmpFiltered,
			});
			// results.forEach((result) => {
			// 	result.selected = selectedIds.includes(result.id);
			// });
			setResponsibilityData(results);
		} catch (e) {
			setResponsibilityData([]);
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const groupResponsibilities = (data) => {
		const groupedData = {};
		data.forEach((responsibility) => {
			const doc = responsibility.documentTitle;
			let entity = responsibility.organizationPersonnel;
			if(!entity) entity = 'NO ENTITY';
			if(!groupedData[doc]) groupedData[doc] = {}
			if(!groupedData[doc][entity]) groupedData[doc][entity]= [];
			groupedData[doc][entity].push(responsibility);
		})
		setDocResponsibilityData(groupedData);
	}

	useEffect(() => {
		groupResponsibilities(responsibilityData);
	}, [responsibilityData])

	const getData = async ({
		limit,
		offset = 0,
		sorted = [],
		filtered = [],
	}) => {
		const order = sorted.map(({ id, desc }) => [id, desc ? 'DESC' : 'ASC']);
		const where = filtered;
                                                    
		try {
			const { data } = await gameChangerAPI.getResponsibilityData({
				docView: true,
				limit,
				offset,
				order,
				where,
			});
			if(data.offsets){
				setOffsets(data.offsets);
			}
			return data;
		} catch (err) {
			this.logger.error(err.message, 'GEADAKS');
			return []
		}
	};

	const handleChangeView = (event) => {
		const { value } = event.target;
		setReView(value);
	}

	return (
		<div>
			<div className='row' style={{ height: 65, marginTop: '10px', paddingLeft: 0 }}>
				<div style={{ display: 'flex', paddingLeft: 0 }}>
					<FormControl variant="outlined" classes={{root:classes.root}} style={{marginLeft: 'auto', marginTop: '-10px'}}>
						<InputLabel classes={{root: classes.formlabel}} id="view-name-select">View</InputLabel>
						<Select
							className={`MuiInputBase-root`}
							labelId="re-view-name"
							label="View"
							id="re-view-name-select"
							value={reView}
							onChange={handleChangeView}
							classes={{ root: classes.selectRoot, icon: classes.selectIcon }}
							autoWidth
						>
							<MenuItem key={`Document`} value={'Document'}>Document View</MenuItem>,
							<MenuItem key={`Chart`} value={'Chart'}>Chart View</MenuItem>
						</Select>
					</FormControl>
				</div>
			</div>
			{reView === 'Chart' && 
			<GCResponsibilityTracker 
				state={state} 
				dispatch={dispatch}
				filters={filters}
				setFilters={setFilters}
				docTitle={docTitle}
				setDocTitle={setDocTitle}
				organization={organization}
				setOrganization={setOrganization}
				responsibilityText={responsibilityText}
				setResponsibilityText={setResponsibilityText}
			/>
			}
			{reView === 'Document' && 
				<ResponsibilityDocumentExplorer 
					state={state} 
					dispatch={dispatch} 
					responsibilityData={docResponsibilityData} 
					loading={loading}
					docsPerPage={DOCS_PER_PAGE}
					totalCount={offsets.length}
					resultsPage={resultsPage}
					onPaginationClick={(page) => {
						setResultsPage(page);
						setReloadResponsibilities(true);
					}}
					setReloadResponsibilities={setReloadResponsibilities}
					docTitle={docTitle}
					setDocTitle={setDocTitle}
					organization={organization}
					setOrganization={setOrganization}
					responsibilityText={responsibilityText}
					setResponsibilityText={setResponsibilityText}
					setFilters={setFilters}
					documentList={documentList}
				/>
			}
		</div>
	)
}
