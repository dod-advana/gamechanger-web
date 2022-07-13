import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import ExportIcon from '../../../images/icon/Export.svg';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useBottomScrollListener } from 'react-bottom-scroll-listener';
import { trackEvent } from '../../telemetry/Matomo';
import GCButton from '../../common/GCButton';
import GameChangerAPI from '../../api/gameChanger-service-api';
import { gcOrange } from '../../common/gc-colors';
import GCResponsibilityChartView from './GCResponsibilityChartView';
import GCResponsibilityDocumentView from './GCResponsibilityDocumentView';
import GCToolTip from '../../common/GCToolTip';
import { exportToCsv, getTrackingNameForFactory } from '../../../utils/gamechangerUtils';
import TutorialOverlay from '@dod-advana/advana-tutorial-overlay/dist/TutorialOverlay';
import { reTutorialSteps } from './tutotialSteps';
import { useStyles } from '../../modules/default/defaultViewHeaderHandler.js';

const gameChangerAPI = new GameChangerAPI();

const parseFilename = (filename) => {
	const splitName = filename.split(' ');
	const letters = splitName[0];
	let numbers = splitName[1];
	if (numbers.includes('.pdf')) {
		numbers = numbers.slice(0, -4);
	}
	return `${letters} ${numbers}`;
};

export default function GCResponsibilityExplorer({ state, dispatch }) {
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
	const [collapseKeys, setCollapseKeys] = useState({});

	const [stepIndex, setStepIndex] = useState(0);
	const [showTutorial, setShowTutorial] = useState(false);

	const tutorialSearch = () => {
		setOrganization(['dod']);
		const newFilters = [{ id: 'organizationPersonnel', value: 'dod' }];
		setCollapseKeys({
			'DoDI 1304.02 Accession Processing Data Collection Forms': true,
			'DoDI 1304.02 Accession Processing Data Collection FormsThe Heads of the OSD and DoD Components': true,
		});
		setFilters(newFilters);
		setInfiniteCount(1);
		setReloadResponsibilities(true);
	};

	useEffect(() => {
		if (stepIndex === 5) {
			setReView('Document');
		}
		if (stepIndex === 6) {
			setReView('Chart');
		}
		if (stepIndex === 1 || stepIndex === 2) {
			window.scrollTo(0, 0);
			const resultsDiv = document.getElementById('re-results-col');
			resultsDiv.scrollTop = 0;
			setCollapseKeys({
				'DoDI 1304.02 Accession Processing Data Collection Forms': true,
				'DoDI 1304.02 Accession Processing Data Collection FormsThe Heads of the OSD and DoD Components': true,
			});
		}
	}, [stepIndex]);

	useEffect(() => {
		if (reloadResponsibilities) {
			handleFetchData({ page: 1, filtered: filters });
			setReloadResponsibilities(false);
		}
	}, [reloadResponsibilities, filters]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const fetchDocTitles = async () => {
			const { data } = await gameChangerAPI.getResponsibilityDocTitles();
			setDocumentList(data.results);
		};
		fetchDocTitles();
	}, []);

	const resetPage = () => {
		setStepIndex(0);
		setReView('Document');
		setFilters([]);
		setOrganization([]);
		setResponsibilityText({});
		setReloadResponsibilities(true);
	};

	const scrollRef = useBottomScrollListener(
		() => {
			if (!loading && Object.keys(docResponsibilityData)?.length < offsets.length) {
				handleInfiniteScroll();
			}
		},
		{
			debounce: 200,
			debounceOptions: {
				leading: true,
				trailing: false,
			},
		}
	);

	const handleInfiniteScroll = () => {
		handleFetchData({ page: infiniteCount + 1, filtered: filters, scroll: true });
		setInfiniteCount(infiniteCount + 1);
	};

	const handleFetchData = async ({ page, filtered, scroll }) => {
		try {
			setLoading(true);
			const tmpFiltered = _.cloneDeep(filtered);
			let offset = 0;
			for (let i = 0; i < page * DOCS_PER_PAGE - DOCS_PER_PAGE; i++) {
				if (!offsets[i]) break;
				offset += offsets[i];
			}
			const { results = [] } = await getData({
				page,
				offset,
				filtered: tmpFiltered,
			});
			if (scroll) {
				setResponsibilityData([...responsibilityData, ...results]);
			} else {
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
			const doc = `${parseFilename(responsibility.filename)} ${responsibility.documentTitle}`;
			let entity = responsibility.organizationPersonnel;
			if (!entity) entity = 'NO ENTITY';
			if (!groupedData[doc]) groupedData[doc] = {};
			if (!groupedData[doc][entity]) groupedData[doc][entity] = [];
			groupedData[doc][entity].push(responsibility);
		});
		setDocResponsibilityData(groupedData);
	};

	useEffect(() => {
		groupResponsibilities(responsibilityData);
	}, [responsibilityData]);

	const getData = async ({ page = 1, offset = 0, filtered = [] }) => {
		try {
			const { data } = await gameChangerAPI.getResponsibilityData({
				docView: true,
				page: page,
				offset,
				order: [],
				where: filtered,
				DOCS_PER_PAGE,
			});
			if (data.offsets) {
				setOffsets(data.offsets);
			}
			return data;
		} catch (err) {
			this.logger.error(err.message, 'GEADAKS');
			return [];
		}
	};

	const handleChangeView = (event) => {
		const { value } = event.target;
		setReView(value);
		if (value === 'Document') setReloadResponsibilities(true);
	};

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
			exportToCsv('ResponsibilityData.csv', data.results, true);
		} catch (e) {
			console.error(e);
			return [];
		}
	};

	return (
		<div>
			<div className="row" style={{ margin: 0, padding: 0, justifyContent: 'flex-end' }}>
				<div style={{ display: 'flex', alignItems: 'center', margin: '10px 0 20px 0' }}>
					<div style={{ fontWeight: 'bold', alignItems: 'center', fontFamily: 'Noto Sans' }}>
						The Responsibility Explorer enables users to identify the responsibilities that have been
						assigned to various entities across an expansive corpus of DoD strategy, guidance, and policy
						documents. Filter capabilities allow users to explore extracted portions of responsibility text
						in specific documents, by organization/role/entity, and/or by responsibility area.
					</div>
					<GCToolTip title="Start tutorial" placement="bottom" arrow enterDelay={500}>
						<HelpOutlineIcon
							style={{ cursor: 'pointer' }}
							onClick={() => {
								setReView('Document');
								setShowTutorial(true);
							}}
						/>
					</GCToolTip>
					<span
						style={{
							margin: '0px 10px',
						}}
					>
						<GCToolTip title="Export" placement="top" arrow enterDelay={500}>
							<span>
								<GCButton
									className="re-tutorial-step-5"
									onClick={exportCSV}
									style={{
										minWidth: 50,
										padding: '0px 7px',
										height: 50,
										marginLeft: 0,
									}}
									disabled={Object.keys(docResponsibilityData).length ? false : true}
								>
									<img
										src={ExportIcon}
										style={{
											margin: '0 0 3px 3px',
											width: 15,
											opacity: Object.keys(docResponsibilityData).length ? 1 : 0.6,
										}}
										alt="export"
									/>
								</GCButton>
							</span>
						</GCToolTip>
					</span>
					<FormControl
						variant="outlined"
						classes={{ root: classes.root }}
						style={{ minWidth: 210, margin: '-16px 0px 0px 0px' }}
					>
						<InputLabel classes={{ root: classes.formlabel }} id="view-name-select">
							View
						</InputLabel>
						<Select
							className={`MuiInputBase-root re-tutorial-step-6`}
							labelId="re-view-name"
							label="View"
							id="re-view-name-select"
							value={reView}
							onChange={handleChangeView}
							classes={{ root: classes.selectRoot, icon: classes.selectIcon }}
							autoWidth
						>
							<MenuItem
								key={`Document`}
								value={'Document'}
								style={{ display: 'flex', padding: '3px 6px' }}
							>
								Document View
							</MenuItem>
							,
							<MenuItem key={`Chart`} value={'Chart'} style={{ display: 'flex', padding: '3px 6px' }}>
								Chart View
							</MenuItem>
						</Select>
					</FormControl>
				</div>
			</div>
			{reView === 'Chart' && (
				<GCResponsibilityChartView
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
			)}
			{reView === 'Document' && (
				<GCResponsibilityDocumentView
					state={state}
					dispatch={dispatch}
					responsibilityData={docResponsibilityData}
					loading={loading}
					totalCount={offsets.length}
					setResultsPage={setInfiniteCount}
					infiniteCount={infiniteCount}
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
					collapseKeys={collapseKeys}
					setCollapseKeys={setCollapseKeys}
					showTutorial={showTutorial}
				/>
			)}
			<TutorialOverlay
				tutorialJoyrideSteps={reTutorialSteps}
				setShowTutorial={setShowTutorial}
				showTutorial={showTutorial}
				buttonColor={gcOrange}
				resetPage={resetPage}
				stepIndex={stepIndex}
				setStepIndex={setStepIndex}
				showSkipButton={false}
			/>

			<GCButton style={{ display: 'none' }} id="update-search" onClick={() => tutorialSearch()}></GCButton>
		</div>
	);
}
