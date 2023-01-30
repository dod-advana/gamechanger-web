import React, { useCallback, useEffect, useState } from 'react';
import propTypes from 'prop-types';
import { trackEvent } from '../../telemetry/Matomo';
import { setState, handleSaveFavoriteDocument } from '../../../utils/sharedFunctions';
import {
	encode,
	getOrgToOrgQuery,
	getTypeQuery,
	getTrackingNameForFactory,
	exportToCsv,
	handlePdfOnLoad,
} from '../../../utils/gamechangerUtils';
import TextField from '@material-ui/core/TextField';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { Grid, Typography, Checkbox, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TutorialOverlay from '@dod-advana/advana-tutorial-overlay/dist/TutorialOverlay';
import GCAnalystToolsSideBar from '../../analystTools/GCAnalystToolsSideBar';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import Collapse from 'react-collapse';
import { gcOrange } from '../../common/gc-colors';
import GCTooltip from '../../common/GCToolTip';
import GCButton from '../../common/GCButton';
import ExportIcon from '../../../images/icon/Export.svg';
import { dctTutorialSteps } from '../../analystTools/tutotialSteps';
import GameChangerAPI from '../../api/gameChanger-service-api';

const gameChangerAPI = new GameChangerAPI();

const trackingAction = 'DocumentComparisonTool';

const saveDocToFavorites = (filename, selectedParagraph, paragraphs, state, dispatch) => {
	const text = paragraphs.find((input) => input.id === selectedParagraph.paragraphIdBeingMatched).text;
	handleSaveFavoriteDocument(
		{
			filename,
			is_favorite: true,
			search_text: text,
			favorite_summary: `Document Comparison result of "${text}"`,
		},
		state,
		dispatch
	);
};

const getExportDoc = (selectedParagraph, paragraphs, document) => {
	const textInput = paragraphs.find((input) => selectedParagraph.paragraphIdBeingMatched === input.id).text;
	return {
		filename: document.filename,
		title: document.title,
		page: selectedParagraph.page_num_i + 1,
		textInput,
		textMatch: selectedParagraph.par_raw_text_t,
		score: selectedParagraph.score_display,
	};
};

const heandleExport = (exportList, type) => {
	try {
		trackEvent(getTrackingNameForFactory('gamechanger'), 'DocumentComparisonTool', type, exportList.length);
		exportToCsv('DocumentComparisonData.csv', exportList, true);
	} catch (e) {
		console.error(e);
		return [];
	}
};

const DocumentParagraph = ({
	doc,
	docOpen,
	paragraph,
	selectedParagraph,
	paragraphs,
	setDocParagraph,
	state,
	dispatch,
}) => {
	const [feedbackList, setFeedbackList] = useState({});

	const exportSingleDoc = (document) => {
		const exportList = [];
		document.paragraphs.forEach((paragraph) => {
			exportList.push(getExportDoc(paragraph, paragraphs, document));
		});
		heandleExport(exportList, 'ExportSindleDocCSV');
	};

	const handleFeedback = (doc, paragraph, positiveFeedback) => {
		let undo = false;
		if (positiveFeedback === feedbackList[paragraph.id]) {
			undo = true;
			const newList = { ...feedbackList };
			delete newList[paragraph.id];
			setFeedbackList(newList);
		} else {
			setFeedbackList({ ...feedbackList, [paragraph.id]: positiveFeedback });
		}

		const searchedParagraph = paragraphs.find((input) => input.id === paragraph.paragraphIdBeingMatched).text;
		const matchedParagraphId = paragraph.id;

		gameChangerAPI.compareFeedbackPOST({
			searchedParagraph,
			matchedParagraphId,
			docId: doc.id,
			positiveFeedback,
			undo,
		});
	};

	const paragraphSelected = docOpen && selectedParagraph?.id === paragraph.id;

	let blockquoteClass = 'searchdemo-blockquote-sm';
	if (paragraphSelected) blockquoteClass += ' searchdemo-blockquote-sm-active';
	return (
		<div key={paragraph.id} style={{ position: 'relative' }}>
			{paragraphSelected && <span className="searchdemo-arrow-left-sm"></span>}
			<div
				className={blockquoteClass}
				onClick={() => setDocParagraph(doc, paragraph)}
				style={{
					marginLeft: 20,
					marginRight: 0,
					border: paragraphSelected ? 'none' : '1px solid #DCDCDC',
					padding: '3px',
					cursor: 'pointer',
				}}
			>
				<span
					className="gc-document-explorer-result-header-text"
					style={{
						color: paragraphSelected ? 'white' : '#131E43',
					}}
				>
					{paragraphSelected
						? `Page: ${paragraph.page_num_i + 1}, Par: ${paragraph.id.split('_')[1]}, Similarity Score: ${
								paragraph.score_display
						  }`
						: paragraph.par_raw_text_t}
				</span>
			</div>
			<Collapse isOpened={paragraphSelected}>
				<div
					className="searchdemo-blockquote-sm"
					style={{
						marginLeft: 20,
						marginRight: 0,
						border: '1px solid #DCDCDC',
						padding: '10px',
						whiteSpace: 'normal',
					}}
				>
					<span className="gc-document-explorer-result-header-text" style={{ fontWeight: 'normal' }}>
						{paragraph.par_raw_text_t}
					</span>
					<div
						style={{
							display: 'flex',
							justifyContent: 'right',
							marginTop: '10px',
						}}
					>
						<GCTooltip title={'Export document matches to CSV'} placement="bottom" arrow>
							<div>
								<GCButton
									onClick={() => exportSingleDoc(doc)}
									style={{
										marginLeft: 10,
										height: 36,
										padding: '0px, 10px',
										minWidth: 0,
										fontSize: '14px',
										lineHeight: '15px',
									}}
								>
									Export
								</GCButton>
							</div>
						</GCTooltip>
						<GCTooltip title={'Save document to favorites'} placement="bottom" arrow>
							<div>
								<GCButton
									onClick={() =>
										saveDocToFavorites(doc.filename, paragraph, paragraphs, state, dispatch)
									}
									style={{
										marginLeft: 10,
										height: 36,
										padding: '0px, 10px',
										minWidth: 0,
										fontSize: '14px',
										lineHeight: '15px',
									}}
								>
									Save to Favorites
								</GCButton>
							</div>
						</GCTooltip>
						<GCTooltip title={'Was this result relevant?'} placement="bottom" arrow>
							<i
								className="dct-feedback fa fa-thumbs-up"
								style={
									feedbackList[paragraph.id]
										? {
												color: '#939395',
												WebkitTextStroke: '1px black',
										  }
										: {}
								}
								onClick={() => handleFeedback(doc, paragraph, true)}
							/>
						</GCTooltip>
						<GCTooltip title={'Was this result relevant?'} placement="bottom" arrow>
							<i
								className="dct-feedback fa fa-thumbs-down"
								style={
									feedbackList[paragraph.id] === false
										? {
												color: '#939395',
												WebkitTextStroke: '1px black',
										  }
										: {}
								}
								onClick={() => handleFeedback(doc, paragraph, false)}
							/>
						</GCTooltip>
					</div>
				</div>
			</Collapse>
		</div>
	);
};

const DocumentResult = ({
	doc,
	index,
	selectedInput,
	selectedParagraph,
	paragraphs,
	setDocParagraph,
	stepIndex,
	state,
	dispatch,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const displayTitle = doc.display_title_s;

	useEffect(() => {
		if (index === 0 && stepIndex === 4) setIsOpen(false);
	}, [index, stepIndex]);

	return (
		<div key={doc.id} className={index === 0 ? 'dct-tutorial-step-7' : ''}>
			<div
				id={index === 0 ? 'first-dct-result' : ''}
				className="searchdemo-modal-result-header"
				style={{ marginTop: 0 }}
				onClick={() => {
					setIsOpen(!isOpen);
				}}
			>
				<i
					style={{
						marginRight: isOpen ? 10 : 14,
						fontSize: 20,
						cursor: 'pointer',
					}}
					className={`fa fa-caret-${isOpen ? 'down' : 'right'}`}
				/>
				<span className="gc-document-explorer-result-header-text">{displayTitle}</span>
			</div>
			<Collapse isOpened={isOpen}>
				{doc.paragraphs &&
					doc.paragraphs
						.filter((paragraph) => paragraph.paragraphIdBeingMatched === selectedInput)
						.map((paragraph) => (
							<DocumentParagraph
								doc={doc}
								docOpen={isOpen}
								paragraph={paragraph}
								selectedParagraph={selectedParagraph}
								paragraphs={paragraphs}
								setDocParagraph={setDocParagraph}
								state={state}
								dispatch={dispatch}
							/>
						))}
			</Collapse>
		</div>
	);
};

const sortAlphabetically = (order) => {
	return (docA, docB) => {
		if (docA.display_title_s > docB.display_title_s) return order;
		if (docA.display_title_s < docB.display_title_s) return -order;
		return 0;
	};
};
const sortByDate = (order) => {
	return (docA, docB) => {
		if (docA.publication_date_dt > docB.publication_date_dt) return -order;
		if (docA.publication_date_dt < docB.publication_date_dt) return order;
		if (!docA.publication_date_dt) return 1;
		if (!docB.publication_date_dt) return -1;
		return 0;
	};
};
const sortByScore = (order) => {
	return (docA, docB) => {
		if (docA.score > docB.score) return -order;
		if (docA.score < docB.score) return order;
		return 0;
	};
};

const TutorialCover = ({ showTutorial }) => {
	return showTutorial ? (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 0,
				height: '100%',
				width: '100%',
				zIndex: 2,
			}}
		></div>
	) : (
		<></>
	);
};

const PanelToggle = ({ panelOpen, handlePanelToggle }) => {
	return (
		<div className="searchdemo-vertical-bar-toggle" style={{ bottom: '0px' }} onClick={handlePanelToggle}>
			<i
				className={`fa ${panelOpen ? 'fa-rotate-270' : 'fa-rotate-90'} fa-angle-double-up`}
				style={{
					color: 'white',
					verticalAlign: 'sub',
					height: 20,
					width: 20,
					margin: '20px 0 20px 2px',
				}}
			/>
			<span>{panelOpen ? 'Hide' : 'Show'} Filters</span>
			<i
				className={`fa ${panelOpen ? 'fa-rotate-270' : 'fa-rotate-90'} fa-angle-double-up`}
				style={{
					color: 'white',
					verticalAlign: 'sub',
					height: 20,
					width: 20,
					margin: '20px 0 20px 2px',
				}}
			/>
		</div>
	);
};

const PolicyDocumentsComparisonTool = ({ context, styles, DocumentInputContainer, resetAdvancedSettings, classes }) => {
	const { state, dispatch } = context;
	const { analystToolsSearchSettings } = state;
	const { allOrgsSelected, orgFilter, allTypesSelected, typeFilter, publicationDateFilter, includeRevoked } =
		analystToolsSearchSettings;

	const [paragraphText, setParagraphText] = useState('');
	const [paragraphs, setParagraphs] = useState([]);
	const [selectedInput, setSelectedInput] = useState(undefined);
	const [returnedDocs, setReturnedDocs] = useState([]);
	const [viewableDocs, setViewableDocs] = useState([]);
	const [resultsLoading, setResultsLoading] = useState(false);
	const [filterCountsLoading, setFilterCountsLoading] = useState(false);
	const [compareDocument, setCompareDocument] = useState(undefined);
	const [selectedParagraph, setSelectedParagraph] = useState(undefined);
	const [itemsToCombine, setItemsToCombine] = useState({});
	const [combineDisabled, setCombineDisabled] = useState(true);
	const [filtersLoaded, setFiltersLoaded] = useState(false);
	const [noResults, setNoResults] = useState(false);
	const [filterChange, setFilterChange] = useState(false);
	const [inputError, setInputError] = useState(false);
	const [sortType, setSortType] = useState('Similarity Score');
	const [needsSort, setNeedsSort] = useState(true);
	const [sortOrder, setSortOrder] = useState('desc');
	const [updateFilters, setUpdateFilters] = useState(false);
	const [leftPanelOpen, setLeftPanelOpen] = useState(true);
	const [stepIndex, setStepIndex] = useState(0);
	const [showTutorial, setShowTutorial] = useState(false);
	const [tutorialLogicSwitch, setTutorialLogicSwitch] = useState(false);
	const [loading, setLoading] = useState(false);

	const trackingCategory = getTrackingNameForFactory(state.cloneData.clone_name);

	const getPresearchData = useCallback(async () => {
		const { cloneData } = state;

		if (Object.keys(state.presearchSources).length === 0) {
			const resp = await gameChangerAPI.callSearchFunction({
				functionName: 'getPresearchData',
				cloneName: cloneData.clone_name,
				options: {},
			});

			const orgFilters = {};
			for (const key in resp.data.orgs) {
				orgFilters[resp.data.orgs[[key]]] = false;
			}
			const typeFilters = {};
			for (const key in resp.data.types) {
				let name = resp.data.types[key];
				typeFilters[name] = false;
			}
			const newSearchSettings = structuredClone(state.analystToolsSearchSettings);
			newSearchSettings.orgFilter = orgFilters;
			newSearchSettings.typeFilter = typeFilters;
			if (Object.keys(state.presearchSources).length === 0) {
				setState(dispatch, { presearchSources: orgFilters });
			}
			if (Object.keys(state.presearchTypes).length === 0) {
				setState(dispatch, { presearchTypes: typeFilters });
			}
			setState(dispatch, { analystToolsSearchSettings: newSearchSettings });
		} else {
			const newSearchSettings = structuredClone(state.searchSettings);
			newSearchSettings.orgFilter = state.presearchSources;
			newSearchSettings.typeFilter = state.presearchTypes;
			setState(dispatch, { analystToolsSearchSettings: newSearchSettings });
		}
	}, [state, dispatch]);

	useEffect(() => {
		setLoading(resultsLoading || filterCountsLoading || updateFilters);
	}, [resultsLoading, filterCountsLoading, updateFilters]);

	// useEffect for handling state changes and some other odd behavior during the tutorial the tutorial
	useEffect(() => {
		if (stepIndex === 0 && showTutorial === true)
			setParagraphText(
				'Ensure the transfer of enterprise-wide MHRR information from the DoD to the National Archives and Records Administration.\nEstablish and implement procedures within their respective Components in accordance with this Instruction.'
			);
		if (stepIndex === 2 && tutorialLogicSwitch) {
			setReturnedDocs([]);
			setViewableDocs([]);
			setTutorialLogicSwitch(false);
		}
		if (stepIndex === 3 && showTutorial && !tutorialLogicSwitch) setShowTutorial(false);
		if (stepIndex === 3 && viewableDocs.length) {
			setShowTutorial(true);
			setTutorialLogicSwitch(true);
		}
	}, [stepIndex, showTutorial, viewableDocs, tutorialLogicSwitch]);

	// This useEffect updates filter counts based on the filter configuration in analystToolsSearchSettings.
	// updateFilters is set alongside certain calls to setReturnedDocs().
	useEffect(() => {
		if (updateFilters) {
			setFilterCountsLoading(true);
			setUpdateFilters(false);
			const newSearchSettings = { ...state.analystToolsSearchSettings };

			const filters = {
				orgFilters: getOrgToOrgQuery(allOrgsSelected, orgFilter),
				typeFilters: getTypeQuery(allTypesSelected, typeFilter),
				dateFilter: publicationDateFilter,
				canceledDocs: includeRevoked,
			};

			gameChangerAPI
				.getFilterCountsPOST({
					cloneName: state.cloneData.clone_name,
					paragraphs: paragraphs,
					filters,
				})
				.then((resp) => {
					const { orgCount, typeCount } = resp.data;
					newSearchSettings.orgCount = orgCount;
					newSearchSettings.typeCount = typeCount;
					setState(dispatch, { analystToolsSearchSettings: newSearchSettings });
					setFilterCountsLoading(false);
				})
				.catch(() => {
					newSearchSettings.orgCount = {};
					newSearchSettings.typeCount = {};
					setState(dispatch, {
						analystToolsSearchSettings: newSearchSettings,
					});
					setFilterCountsLoading(false);
				});
		}
	}, [
		dispatch,
		returnedDocs,
		noResults,
		paragraphs,
		updateFilters,
		paragraphText,
		state.cloneData.clone_name,
		state.analystToolsSearchSettings,
		allOrgsSelected,
		orgFilter,
		allTypesSelected,
		typeFilter,
		publicationDateFilter,
		includeRevoked,
	]);

	const handleSetParagraphs = useCallback(() => {
		const newParagraphs = paragraphText
			.split('\n')
			.map((paragraph, idx) => {
				return { text: paragraph.trim(), id: idx };
			})
			.filter((paragraph) => paragraph.text.length > 0);

		if (newParagraphs.length > 5) {
			setInputError(true);
		} else {
			setInputError(false);
		}

		setParagraphs(newParagraphs);
	}, [paragraphText]);

	useEffect(() => {
		let disable = 0;
		Object.keys(itemsToCombine).forEach((par) => {
			if (itemsToCombine[par]) disable++;
		});
		setCombineDisabled(disable < 2);
	}, [itemsToCombine]);

	useEffect(() => {
		if (!filtersLoaded) {
			getPresearchData();
			setFiltersLoaded(true);
		}
	}, [getPresearchData, filtersLoaded]);

	useEffect(() => {
		setFilterChange(true);
	}, [orgFilter, typeFilter, publicationDateFilter, includeRevoked]);

	useEffect(() => {
		setNoResults(false);
	}, [paragraphText]);

	useEffect(() => {
		if (state.runDocumentComparisonSearch) {
			setResultsLoading(true);
			const filters = {
				orgFilters: getOrgToOrgQuery(allOrgsSelected, orgFilter),
				typeFilters: getTypeQuery(allTypesSelected, typeFilter),
				dateFilter: publicationDateFilter,
				canceledDocs: includeRevoked,
			};

			gameChangerAPI
				.compareDocumentPOST({ cloneName: state.cloneData.clone_name, paragraphs: paragraphs, filters })
				.then((resp) => {
					if (resp.data.docs.length <= 0) {
						setNoResults(true);
					} else {
						let paragraph;
						const document = resp.data.docs.find((doc) => {
							const foundPar = doc.paragraphs.find(
								(par) => par.paragraphIdBeingMatched === selectedInput
							);
							if (foundPar) {
								paragraph = foundPar;
								return true;
							} else {
								return false;
							}
						});
						setCompareDocument(document);
						setSelectedParagraph(paragraph);
					}
					setReturnedDocs(resp.data.docs);
					setUpdateFilters(true);
					setState(dispatch, {
						runDocumentComparisonSearch: false,
					});
					setResultsLoading(false);
				})
				.catch(() => {
					setReturnedDocs([]);
					setUpdateFilters(true);
					setState(dispatch, {
						runDocumentComparisonSearch: false,
					});
					setResultsLoading(false);
					console.log('server error');
				});
		}
	}, [
		state.runDocumentComparisonSearch,
		paragraphText,
		state.cloneData.clone_name,
		dispatch,
		allOrgsSelected,
		orgFilter,
		allTypesSelected,
		typeFilter,
		publicationDateFilter,
		includeRevoked,
		paragraphs,
		selectedInput,
	]);

	// This useEffect ensures that returnedDocs changes before viewableDocs,
	// thereby fixing a bug where viewableDocs would hold old returnedDocs.
	// This is at the expense of possibly running the following useEffect
	// in some unnecessary cases.
	useEffect(() => {
		if (returnedDocs.length > 0) {
			setNeedsSort(true);
		}
	}, [returnedDocs]);

	// This useEffect sorts docs, sets the selected paragraph, AND sets viewableDocs.
	useEffect(() => {
		if (needsSort && returnedDocs.length) {
			setNeedsSort(false);
			const newViewableDocs = returnedDocs.filter((doc) => {
				return doc.paragraphs.find((match) => match.paragraphIdBeingMatched === selectedInput);
			});
			const order = sortOrder === 'desc' ? 1 : -1;
			let sortFunc;
			switch (sortType) {
				case 'Alphabetically':
					sortFunc = sortAlphabetically(order);
					break;
				case 'Date Published':
					sortFunc = sortByDate(order);
					break;
				default:
					sortFunc = sortByScore(order);
					break;
			}
			const sortedDocs = newViewableDocs.sort(sortFunc);
			if (!selectedParagraph && sortedDocs.length) {
				setSelectedParagraph(sortedDocs[0].paragraphs[0]);
				setCompareDocument(sortedDocs[0]);
			}
			setViewableDocs(sortedDocs);
		}
	}, [needsSort, returnedDocs, selectedInput, sortType, viewableDocs, sortOrder, selectedParagraph]);

	const measuredRef = useCallback(
		(node) => {
			if (node !== null && compareDocument) {
				if (compareDocument && selectedParagraph) {
					gameChangerAPI
						.dataStorageDownloadGET(
							encode(compareDocument.filename || ''),
							'',
							selectedParagraph.page_num_i + 1,
							true,
							state.cloneData
						)
						.then((url) => {
							node.src = url;
						});
				}
			}
		},
		[compareDocument, state.cloneData, selectedParagraph]
	);

	useEffect(() => {
		handleSetParagraphs();
	}, [paragraphText, handleSetParagraphs]);

	const removeParagraph = (id) => {
		const newParagraphs = paragraphs.filter((par) => par.id !== id);
		if (id === selectedInput) {
			setSelectedInput(newParagraphs[0].id);
			setToFirstResultofInput(newParagraphs[0].id);
		}
		setParagraphs(newParagraphs);
		const newReturnedDocs = returnedDocs.filter((doc) => {
			const newReturnedDocsParagraphs = doc.paragraphs.filter((par) => {
				return par.paragraphIdBeingMatched !== id;
			});
			return newReturnedDocsParagraphs.length;
		});
		setReturnedDocs(newReturnedDocs);
		setUpdateFilters(true);
	};

	const handleCombine = () => {
		const oldParagraphs = [];
		const paragraphsToCombine = [];
		paragraphs.forEach((par) => {
			if (itemsToCombine[par.id]) {
				paragraphsToCombine.push(par.text);
			} else {
				oldParagraphs.push(par.text);
			}
		});
		const combinedParagraphs = paragraphsToCombine.join(' ');
		oldParagraphs.push(combinedParagraphs);
		const newParagraphs = oldParagraphs.map((text, idx) => {
			return { text, id: idx };
		});
		setParagraphs(newParagraphs);
		const newParagraphText = newParagraphs.map((paragraph) => paragraph.text).join('\n');
		setParagraphText(newParagraphText);
		handleCompare();
	};

	const handleCompare = () => {
		trackEvent(trackingCategory, `${trackingAction}-Submit`, paragraphs.map((par) => par.text).join('\n'));
		if (!paragraphs.length) return;
		setNoResults(false);
		setFilterChange(false);
		setSelectedInput(paragraphs?.[0].id);
		setItemsToCombine({});
		setState(dispatch, { runDocumentComparisonSearch: true });
	};

	const exportAll = () => {
		const exportList = [];
		returnedDocs.forEach((document) => {
			document.paragraphs.forEach((paragraph) => {
				exportList.push(getExportDoc(paragraph, paragraphs, document));
			});
		});
		heandleExport(exportList, 'ExportSindleDocCSV');
	};

	const setToFirstResultofInput = (inputId) => {
		let paragraph;
		const document = viewableDocs.find((doc) => {
			const foundPar = doc.paragraphs.find((par) => par.paragraphIdBeingMatched === inputId);
			if (foundPar) {
				paragraph = foundPar;
				return true;
			} else {
				return false;
			}
		});
		setCompareDocument(document);
		setSelectedParagraph(paragraph);
	};

	const reset = () => {
		setParagraphText('');
		setInputError(false);
		setReturnedDocs([]);
		setViewableDocs([]);
		setNoResults(false);
		setFilterChange(false);
		setLeftPanelOpen(true);
		setStepIndex(0);
		setTutorialLogicSwitch(false);
	};

	const handleCheck = (id) => {
		setItemsToCombine({
			...itemsToCombine,
			[id]: !itemsToCombine?.[id],
		});
	};

	const handleSelectInput = (id) => {
		setSelectedParagraph(undefined);
		setSelectedInput(id);
		setNeedsSort(true);
	};

	const handleChangeOrder = (order) => {
		setSortOrder(order);
		setNeedsSort(true);
	};

	const setDocParagraph = (doc, paragraph) => {
		setCompareDocument(doc);
		setSelectedParagraph(paragraph);
	};

	const handleLeftPanelToggle = () => {
		setLeftPanelOpen(!leftPanelOpen);
	};

	const getDocumentGridWidth = () => {
		return leftPanelOpen ? 6 : 8;
	};

	return (
		<Grid container style={{ marginTop: 20, paddingBottom: 20 }}>
			<TutorialCover showTutorial={showTutorial} />
			<Grid item xs={12}>
				<div style={{ display: 'flex' }}>
					{/* different */}
					<div style={{ fontWeight: 'bold', alignItems: 'center', fontFamily: 'Noto Sans' }}>
						The Document Comparison Tool enables users to compare submitted text (in the field below) with
						existing text in the GAMECHANGER repository. After submitting a sentence, paragraph, or string
						of paragraphs into the open text field, the tool will search for and yield the top existing
						policy documents available within GAMECHANGER that share the most semantically similar text.
					</div>
					<GCTooltip title="Start tutorial" placement="bottom" arrow enterDelay={500}>
						<HelpOutlineIcon
							style={{ cursor: 'pointer', marginRight: 20, alignSelf: 'center' }}
							onClick={() => {
								reset();
								setShowTutorial(true);
							}}
						/>
					</GCTooltip>
					{!loading && returnedDocs.length > 0 && (
						<div style={{ display: 'flex', alignSelf: 'center' }}>
							<FormControl
								className="dct-tutorial-step-9"
								variant="outlined"
								classes={{ root: classes.root }}
								style={{ marginLeft: 'auto', margin: '-10px 0px 0px 0px', minWidth: 195 }}
							>
								<InputLabel classes={{ root: classes.formlabel }} id="view-name-select">
									Sort
								</InputLabel>
								<Select
									className={`MuiInputBase-root`}
									labelId="re-view-name"
									label="View"
									id="re-view-name-select"
									value={sortType}
									onChange={(event) => {
										setSortType(event.target.value);
										setNeedsSort(true);
									}}
									classes={{ root: classes.selectRoot, icon: classes.selectIcon }}
									autoWidth
								>
									<MenuItem
										key={`Similarity Score`}
										value={'Similarity Score'}
										style={{ display: 'flex', padding: '3px 6px' }}
									>
										Similarity Score
									</MenuItem>
									<MenuItem
										key={`Alphabetically`}
										value={'Alphabetically'}
										style={{ display: 'flex', padding: '3px 6px' }}
									>
										Alphabetically
									</MenuItem>
									<MenuItem
										key={`Date Published`}
										value={'Date Published'}
										style={{ display: 'flex', padding: '3px 6px' }}
									>
										Date Published
									</MenuItem>
								</Select>
							</FormControl>
							<div style={{ width: '40px', marginLeft: '10px', display: 'flex' }}>
								<i
									className="fa fa-sort-amount-desc"
									style={{
										marginTop: '50%',
										marginRight: '5px',
										cursor: 'pointer',
										color: sortOrder === 'desc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('desc');
									}}
								></i>
								<i
									className="fa fa-sort-amount-asc"
									style={{
										marginTop: '50%',
										cursor: 'pointer',
										color: sortOrder === 'asc' ? 'rgb(233, 105, 29)' : 'grey',
									}}
									aria-hidden="true"
									onClick={() => {
										handleChangeOrder('asc');
									}}
								></i>
							</div>
							<GCTooltip title="Export all results" placement="bottom" arrow>
								<div style={{ marginTop: 6 }}>
									<GCButton
										className="dct-tutorial-step-10"
										onClick={exportAll}
										style={{
											minWidth: 50,
											padding: '0px 7px',
											height: 50,
										}}
									>
										<img
											src={ExportIcon}
											style={{
												margin: '0 0 3px 3px',
												width: 15,
											}}
											alt="export"
										/>
									</GCButton>
								</div>
							</GCTooltip>
						</div>
					)}
				</div>
			</Grid>
			<div
				style={{
					marginTop: 20,
					display: leftPanelOpen ? 'block' : 'none',
					maxWidth: 'calc(16.666667% + 20px)',
					flexBasis: 'calc(16.666667% + 20px)',
				}}
			>
				<div className="dct-tutorial-step-2" style={{ marginRight: 20 }}>
					<GCAnalystToolsSideBar context={context} results={returnedDocs} />
					<GCButton
						isSecondaryBtn
						onClick={() => {
							trackEvent(trackingCategory, `${trackingAction}-ClearFiltersButton`, 'onClick');
							resetAdvancedSettings(dispatch);
							setNoResults(false);
							setState(dispatch, { runDocumentComparisonSearch: true });
						}}
						style={{ margin: 0, width: '100%' }}
					>
						Clear Filters
					</GCButton>
					{!loading && returnedDocs.length > 0 && (
						<GCButton
							onClick={() => {
								setNoResults(false);
								setState(dispatch, { runDocumentComparisonSearch: true });
							}}
							style={{ margin: '10px 0 0 0', width: '100%' }}
							disabled={!filterChange}
						>
							Apply Filters
						</GCButton>
					)}
				</div>
			</div>
			{((returnedDocs.length <= 0 && !loading) || stepIndex === 2) && (
				<div style={{ maxWidth: 'calc(83.333333% - 20px)', flexBasis: 'calc(83.333333% - 20px)' }}>
					<DocumentInputContainer policy>
						<Grid container className={'input-container-grid'} style={{ margin: 0 }}>
							<Grid item xs={12}>
								<Grid container style={{ display: 'flex', flexDirection: 'column' }}>
									<Grid item xs={12}>
										<div className={'instruction-box'}>
											To search for similar documents, paste text into the box below.
										</div>
									</Grid>

									<Grid container style={{ display: 'flex' }}>
										<Grid item xs={12}>
											<div className={'input-box'}>
												<TextField
													id="dct-input-box"
													className="dct-tutorial-step-1"
													disabled={returnedDocs.length > 0}
													multiline
													rows={1000}
													variant="outlined"
													value={paragraphText}
													onChange={(event) => {
														setParagraphText(event.target.value);
													}}
													onClick={() => setState(dispatch, { inputActive: 'compareInput' })}
													InputProps={{
														classes: {
															root: classes.outlinedInput,
															focused: classes.focused,
															notchedOutline: classes.notchedOutline,
														},
													}}
													placeholder={'Text Content Here'}
													fullWidth={true}
													helperText={
														inputError ? 'Input currently limited to five paragraphs' : ''
													}
													FormHelperTextProps={{
														style: {
															color: 'red',
															fontSize: 12,
															backgroundColor: 'rgba(0,0,0,0)',
														},
													}}
												/>
											</div>
										</Grid>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
						<Grid container style={{ justifyContent: 'flex-end' }}>
							<GCTooltip title={'Compare Documents'} placement="top" arrow>
								<div style={{ marginTop: 20 }}>
									<GCButton
										id="compare-button"
										disabled={inputError}
										onClick={handleCompare}
										className="dct-tutorial-step-3"
									>
										Submit
									</GCButton>
								</div>
							</GCTooltip>
						</Grid>
					</DocumentInputContainer>
					{noResults && !loading && (
						<div style={styles.resultsText}>
							<div className={'text'}>No results found</div>
						</div>
					)}
				</div>
			)}
			{loading && (
				<div style={{ maxWidth: 'calc(83.333333% - 20px)', flexBasis: 'calc(83.333333% - 20px)' }}>
					<div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
						<LoadingIndicator customColor={gcOrange} />
					</div>
				</div>
			)}
			{!loading && returnedDocs.length > 0 && (
				<>
					<div
						style={{
							marginTop: 20,
							position: 'relative',
							height: '800px',
							maxWidth: `calc(${getDocumentGridWidth() / 0.12}% - 20px)`,
							flexBasis: `calc(${getDocumentGridWidth() / 0.12}% - 20px)`,
						}}
					>
						<PanelToggle panelOpen={leftPanelOpen} handlePanelToggle={handleLeftPanelToggle} />
						<div className="dct-tutorial-step-8" style={{ margin: '0px 20px', height: '800px' }}>
							<iframe
								title={'PDFViewer'}
								className="aref"
								id={'pdfViewer'}
								ref={measuredRef}
								onLoad={() =>
									handlePdfOnLoad(
										'pdfViewer',
										'viewerContainer',
										compareDocument.filename,
										'PDF Viewer',
										'gamechanger',
										gameChangerAPI
									)
								}
								style={{ width: '100%', height: '100%', border: 'none' }}
							/>
						</div>
					</div>
					<div
						id="dct-right-col"
						style={{
							marginTop: 20,
							height: '800px',
							overflow: showTutorial ? 'hidden' : 'auto',
							maxWidth: 'calc(33.333333% + 20px)',
							flexBasis: 'calc(33.333333% + 20px)',
							paddingLeft: '20px',
							marginLeft: '-20px',
						}}
					>
						<div
							className="dct-tutorial-step-4"
							style={{
								padding: 20,
								background: '#F6F8FA 0% 0% no-repeat padding-box',
								border: '1px dashed #707070',
								display: 'flex',
								flexDirection: 'column',
								position: 'relative',
							}}
						>
							<Typography variant="body1" style={{ marginBottom: 10 }}>
								Paragraph Input
							</Typography>
							{paragraphs.map((paragraph) => (
								<div
									id={`paragraph-input-${paragraph.id}`}
									key={paragraph.id}
									style={{
										border: paragraph.id === selectedInput ? 'none' : `2px solid #B6C6D8`,
										boxShadow: paragraph.id === selectedInput ? '0px 3px 6px #00000029' : 'none',
										padding: 10,
										borderRadius: 6,
										display: 'flex',
										lineHeight: '20px',
										marginBottom: 10,
										cursor: 'pointer',
										backgroundColor: paragraph.id === selectedInput ? '#DFE6EE' : '#FFFFFF',
									}}
									onClick={() => {
										handleSelectInput(paragraph.id);
									}}
								>
									{paragraphs.length > 1 && (
										<div
											onClick={(event) => {
												event.stopPropagation();
												handleCheck(paragraph.id);
											}}
											style={{ margin: 'auto 0px' }}
										>
											<Checkbox
												checked={itemsToCombine[paragraph.id] ? true : false}
												classes={{ root: classes.filterBox }}
												icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
												checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
											/>
										</div>
									)}
									<div
										style={
											paragraph.id === selectedInput
												? { margin: 'auto 0' }
												: styles.collapsedInput
										}
									>
										{paragraph.text}
									</div>
									{paragraphs.length > 1 && (
										<div style={{ margin: 'auto 0 auto auto' }}>
											<i
												style={styles.image}
												onClick={(event) => {
													event.stopPropagation();
													removeParagraph(paragraph.id);
												}}
												className="fa fa-trash fa-2x"
											/>
										</div>
									)}
								</div>
							))}
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<GCButton
									style={{ marginTop: 0, width: 'fit-content' }}
									isSecondaryBtn
									disabled={combineDisabled && !showTutorial}
									onClick={handleCombine}
									className="dct-tutorial-step-5"
								>
									Combine
								</GCButton>
								<GCButton style={{ marginTop: 0, width: 'fit-content' }} isSecondaryBtn onClick={reset}>
									Reset
								</GCButton>
							</div>
						</div>
						<div className="dct-tutorial-step-6" style={{ marginTop: 20 }}>
							{viewableDocs.length ? (
								<></>
							) : (
								<div style={{ ...styles.resultsText, marginLeft: 0 }}>
									<div className={'text'}>No results for paragraph found</div>
								</div>
							)}
							{viewableDocs.map((doc, i) => (
								<DocumentResult
									doc={doc}
									index={i}
									selectedInput={selectedInput}
									selectedParagraph={selectedParagraph}
									paragraphs={paragraphs}
									setDocParagraph={setDocParagraph}
									stepIndex={stepIndex}
									state={state}
									dispatch={dispatch}
								/>
							))}
						</div>
					</div>
				</>
			)}
			<TutorialOverlay
				tutorialJoyrideSteps={dctTutorialSteps}
				setShowTutorial={setShowTutorial}
				showTutorial={showTutorial}
				buttonColor={gcOrange}
				resetPage={reset}
				stepIndex={stepIndex}
				setStepIndex={setStepIndex}
				showSkipButton={false}
			/>
		</Grid>
	);
};

PolicyDocumentsComparisonTool.propTypes = {
	context: propTypes.object,
};

export default PolicyDocumentsComparisonTool;
