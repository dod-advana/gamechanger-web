import React, { useState, useEffect } from 'react'
import _ from 'lodash';
import { 
	FormControl,
	InputLabel,
	MenuItem,  
	Select
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import {trackEvent} from '../telemetry/Matomo';
import GCButton from '../common/GCButton';
import GameChangerAPI from '../api/gameChanger-service-api';
import { gcOrange } from '../common/gc-colors';
import GCResponsibilityTracker from './GCResponsibilityTracker';
import ResponsibilityDocumentExplorer from './GCResponsibilityDocumentExplorer';
import GCToolTip from '../common/GCToolTip';
import { exportToCsv, getTrackingNameForFactory } from '../../utils/gamechangerUtils';

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
	const DOCS_PER_PAGE = 15;

	const [reView, setReView] = useState('Document');
	const [responsibilityData, setResponsibilityData] = useState([]);
	const [docResponsibilityData, setDocResponsibilityData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState([]);
	const [offsets, setOffsets] = useState([]);
	const [reloadResponsibilities, setReloadResponsibilities] = useState(true);
	const [docTitle, setDocTitle] = useState([]);
	const [documentList, setDocumentList] = useState([]);
	const [organization, setOrganization] = useState([]);
	const [responsibilityText, setResponsibilityText] = useState({});
	const [infiniteCount, setInfiniteCount] = useState(1);

	useEffect(() => {
		if (reloadResponsibilities) {
			handleFetchData({ page: 1, filtered: filters });
			setReloadResponsibilities(false);
		}
	 }, [reloadResponsibilities, filters]); // eslint-disable-line react-hooks/exhaustive-deps

	 useEffect(() => {
		const fetchDocTitles = async() => {
			const { data } = await gameChangerAPI.getResponsibilityDocTitles();
			setDocumentList(data.results);
		}
		fetchDocTitles();
	 },[])

	 const scrollRef = useBottomScrollListener(
		() => {
			if(!loading && Object.keys(docResponsibilityData)?.length < offsets.length){
				handleInfiniteScroll();
			}
		},
		{ 
			debounce: 200,
			debounceOptions: {
				leading: true,
				trailing: false
			}
		}
	)

	const handleInfiniteScroll = () => {
		handleFetchData({ page: infiniteCount +1, filtered: filters, scroll: true });
		setInfiniteCount(infiniteCount + 1);
	}

	const handleFetchData = async ({ page, filtered, scroll }) => {
		try {
			setLoading(true);
			const tmpFiltered = _.cloneDeep(filtered);
			let offset = 0;
			for(let i = 0; i < page * DOCS_PER_PAGE - DOCS_PER_PAGE; i++){
				if(!offsets[i]) break;
				offset += offsets[i];
			}
			const { results = [] } = await getData({
				page,
				offset,
				filtered: tmpFiltered,
			});
			if(scroll) {
				setResponsibilityData([...responsibilityData, ...results]);
			} else{
				setResponsibilityData(results);
			}
			
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
		page = 1,
		offset = 0,
		filtered = [],
	}) => {
                                                    
		try {
			const { data } = await gameChangerAPI.getResponsibilityData({
				docView: true,
				page: page,
				offset,
				order: [],
				where: filtered,
				DOCS_PER_PAGE
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
		if(value === 'Document') setReloadResponsibilities(true)
	}

	const exportCSV = async () => {
		try {
			const { data } = await gameChangerAPI.getResponsibilityData({
				limit: null,
				offset: 0,
				order: [],
				where: filters,
			});

			trackEvent(
				getTrackingNameForFactory(state.cloneData.clone_name), 
				'ResponsibilityTracker', 
				'ExportCSV', 
				data?.results?.length
			);
			exportToCsv(
				'ResponsibilityData.csv', 
				data.results, 
				true
			);
		} catch (e) {
			console.error(e);
			return [];
		}
	};

	return (
		<div>
			<div className='row' style={{ height: 65, margin: 0, padding: 0 }}>
				<div style={{ display: 'flex', justifyContent: 'flex-end', padding: 0 }}>
					<GCButton 
						onClick={exportCSV}
						style={{
							minWidth: 50,
							padding: '0px 7px',
							margin: '6px 10px 0px 0px',
							height: 50,
						}}
					>
						<GCToolTip title="Export" placement="bottom" arrow enterDelay={500} >
							<Icon className="fa fa-external-link" style={{paddingTop: 2, transform: 'scale(1.3)'}}/>
						</GCToolTip>
					</GCButton>
					<FormControl variant="outlined" classes={{root:classes.root}} style={{marginLeft: 'auto', margin: '-10px 0px 0px 0px'}}>
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
					totalCount={offsets.length}
					setResultsPage={setInfiniteCount}
					setReloadResponsibilities={setReloadResponsibilities}
					docTitle={docTitle}
					setDocTitle={setDocTitle}
					organization={organization}
					setOrganization={setOrganization}
					responsibilityText={responsibilityText}
					setResponsibilityText={setResponsibilityText}
					filters={filters}
					setFilters={setFilters}
					documentList={documentList}
					infiniteScrollRef={scrollRef}
				/>
			}
		</div>
	)
}
