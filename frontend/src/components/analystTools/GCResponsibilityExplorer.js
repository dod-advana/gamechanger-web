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
import { setState } from '../../utils/sharedFunctions';

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
	let PAGE_SIZE = 10;

	const [reView, setReView] = useState('Document');
	const [responsibilityData, setResponsibilityData] = useState([]);
	const [docResponsibilityData, setDocResponsibilityData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [pageIndex, setPageIndex] = useState(0);
	const [sorts, setSorts] = useState([]);
	const [filters, setFilters] = useState([]);
	const [otherEntRespFiltersList, setOtherEntRespFiltersList] = useState([]);
	const [numPages, setNumPages] = useState(0);

	useEffect(() => {
		if (state.reloadResponsibilityTable) {
			handleFetchData({ page: pageIndex, sorted: sorts, filtered: filters });
			setState(dispatch, {reloadResponsibilityTable: false});
		}
	 }, [state, dispatch, pageIndex, sorts, filters]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleFetchData = async ({ page, sorted, filtered }) => {
		try {
			setLoading(true);
			const tmpFiltered = _.cloneDeep(filtered);
			if (otherEntRespFiltersList.length > 0) {
				tmpFiltered.push({
					id: 'otherOrganizationPersonnel',
					value: otherEntRespFiltersList,
				});
			}
			const { totalCount, results = [] } = await getData({
				offset: page * PAGE_SIZE,
				sorted,
				filtered: tmpFiltered,
			});
			const pageCount = Math.ceil(totalCount / PAGE_SIZE);
			setNumPages(pageCount);
			// results.forEach((result) => {
			// 	result.selected = selectedIds.includes(result.id);
			// });
			setResponsibilityData(results);
		} catch (e) {
			setResponsibilityData([]);
			setNumPages(0);
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const groupResponsibilities = (data) => {
		const groupedData = {};
		data.forEach((responsibility, i) => {
			let entity = responsibility.organizationPersonnel;
			if(!entity) entity = 'NO ENTITY';
			if(!groupedData[entity]) groupedData[entity]= [];
			groupedData[entity].push(responsibility)
		})
		setDocResponsibilityData(groupedData);
	}

	useEffect(() => {
		groupResponsibilities(responsibilityData);
	}, [responsibilityData])

	const getData = async ({
		limit = PAGE_SIZE,
		offset = 0,
		sorted = [],
		filtered = [],
	}) => {
		const order = sorted.map(({ id, desc }) => [id, desc ? 'DESC' : 'ASC']);
		const where = filtered;
                                                    
		try {
			const { data } = await gameChangerAPI.getResponsibilityData({
				limit,
				offset,
				order,
				where,
			});
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
			<div className='row' style={{ height: 100, marginTop: '10px' }}>
				<FormControl variant="outlined" classes={{root:classes.root}}>
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
			{reView === 'Chart' && <GCResponsibilityTracker state={state} dispatch={dispatch} responsibilityData={responsibilityData} loading={loading}/>}
			{reView === 'Document' && 
                <ResponsibilityDocumentExplorer 
                	state={state} 
                	dispatch={dispatch} 
                	responsibilityData={docResponsibilityData} 
                	loading={loading}
                	onPaginationClick={(page) => {
                		console.log(page)
                		// setState(dispatch, { resultsPage: page, runSearch: true });
                	}}
                />}
		</div>
	)
}
