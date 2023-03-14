import React, { useCallback, useEffect, useState } from 'react';
import propTypes from 'prop-types';
import { trackEvent } from '../../telemetry/Matomo';
import { setState, handleSaveFavoriteDocument } from '../../../utils/sharedFunctions';
import {
	encode,
	getTrackingNameForFactory,
	exportToCsv,
	convertDCTScoreToText,
	handlePdfOnLoad,
} from '../../../utils/gamechangerUtils';
import { Collapse } from 'react-collapse';
import TextField from '@material-ui/core/TextField';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { Grid, Typography, Checkbox, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import GCAnalystToolsSideBar from '../../analystTools/GCAnalystToolsSideBar';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { gcOrange } from '../../common/gc-colors';
import GCTooltip from '../../common/GCToolTip';
import GCButton from '../../common/GCButton';
import ExportIcon from '../../../images/icon/Export.svg';
import DragAndDrop from '../../common/DragAndDrop';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';

const EDADocumentsComparisonTool = ({
	context,
	gameChangerAPI,
	styles,
	DocumentInputContainer,
	resetAdvancedSettings,
	classes,
}) => {
	const { state, dispatch } = context;
	const { analystToolsSearchSettings } = state;
	const { allOrgsSelected, organizations, majcoms, allYearsSelected, fiscalYears, contractsOrMods, idvPIID } =
		analystToolsSearchSettings;

	const [paragraphText, setParagraphText] = useState('');
	const [paragraphs, setParagraphs] = useState([]);
	const [selectedInput, setSelectedInput] = useState(undefined);
	const [returnedDocs, setReturnedDocs] = useState([]);
	const [viewableDocs, setViewableDocs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [compareDocument, setCompareDocument] = useState(undefined);
	const [selectedParagraph, setSelectedParagraph] = useState(undefined);
	const [itemsToCombine, setItemsToCombine] = useState({});
	const [combineDisabled, setCombineDisabled] = useState(true);
	const [noResults, setNoResults] = useState(false);
	const [filterChange, setFilterChange] = useState(false);
	const [inputError, setInputError] = useState(false);
	const [collapseKeys, setCollapseKeys] = useState([]);
	const [feedbackList, setFeedbackList] = useState({});
	const [sortType, setSortType] = useState('Similarity Score');
	const [needsSort, setNeedsSort] = useState(true);
	const [sortOrder, setSortOrder] = useState('desc');
	const [updateFilters, setUpdateFilters] = useState(false);

	const reset = () => {
		setParagraphText('');
		setInputError(false);
		setReturnedDocs([]);
		setViewableDocs([]);
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

	/**
	 * This is necessary for documents that are dragged and dropped.
	 * If their input is too big, we're chunking it down based on important sections found in most contracts.
	 * 5000 chars is around the range for an acceptable search length in DCT.
	 *
	 * @param {*} paragraph
	 * @returns a array of paragraphs with snippets from the important sections found in the imported contract
	 */
	const modifyParagraphs = (paragraph) => {
		const importantSections = ['SUMMARY OF CHANGES', 'PURPOSE OF MODIFICATION', 'PERFORMANCE WORK STATEMENT'];
		let newParagraphs = [];
		importantSections.forEach((section, index) => {
			if (paragraph.text.includes(section)) {
				newParagraphs.push({
					id: index,
					text: paragraph.text.slice(paragraph.text.indexOf(section), paragraph.text.indexOf(section) + 1700),
				});
			}
		});
		if (!newParagraphs.length) {
			newParagraphs.push({ id: 0, text: paragraph.text.slice(0, 5000) });
		}

		return newParagraphs;
	};

	useEffect(() => {
		if (updateFilters) {
			setUpdateFilters(false);
			const newSearchSettings = { ...state.analystToolsSearchSettings };
			const sourceCount = {};
			const typeCount = {};

			returnedDocs.forEach((doc) => {
				if (typeCount[doc.display_doc_type_s]) {
					typeCount[doc.display_doc_type_s]++;
				} else {
					typeCount[doc.display_doc_type_s] = 1;
				}
				if (sourceCount[doc.display_org_s]) {
					sourceCount[doc.display_org_s]++;
				} else {
					sourceCount[doc.display_org_s] = 1;
				}
			});
			newSearchSettings.orgCount = sourceCount;
			newSearchSettings.typeCount = typeCount;

			setState(dispatch, { analystToolsSearchSettings: newSearchSettings });
		}
	}, [dispatch, returnedDocs, state.analystToolsSearchSettings, updateFilters]);

	useEffect(() => {
		setUpdateFilters(true);
	}, [returnedDocs]);

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
		setFilterChange(true);
	}, [allOrgsSelected, organizations, majcoms, allYearsSelected, fiscalYears, contractsOrMods, idvPIID]);

	useEffect(() => {
		setNoResults(false);
	}, [paragraphText]);

	useEffect(() => {
		if (state.runDocumentComparisonSearch) {
			setLoading(true);
			setCollapseKeys([]);
			let newParagraphs = paragraphs;
			if (paragraphs.length === 1 && paragraphs[0].text.length > 5500) {
				newParagraphs = modifyParagraphs(paragraphs[0]);
			}

			const filters = {
				allOrgsSelected,
				organizations,
				majcoms,
				allYearsSelected,
				fiscalYears,
				contractsOrMods,
				idvPIID,
			};
			gameChangerAPI
				.compareDocumentPOST({ cloneName: state.cloneData.clone_name, paragraphs: newParagraphs, filters })
				.then((resp) => {
					if (resp.data.docs.length <= 0) {
						setNoResults(true);
					} else {
						let paragraph;
						const document = resp.data.docs.find((doc) => {
							const foundPar = doc.pageHits.find(
								(page) => page.paragraphIdBeingMatched === selectedInput
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
					setState(dispatch, { runDocumentComparisonSearch: false });
					setParagraphs(newParagraphs);
					setLoading(false);
				})
				.catch(() => {
					setReturnedDocs([]);
					setState(dispatch, { runDocumentComparisonSearch: false });
					setParagraphs(newParagraphs);
					setLoading(false);
					console.log('server error');
				});
		}
	}, [
		state.runDocumentComparisonSearch,
		paragraphText,
		state.cloneData.clone_name,
		dispatch,
		allOrgsSelected,
		organizations,
		majcoms,
		fiscalYears,
		allYearsSelected,
		contractsOrMods,
		idvPIID,
		paragraphs,
		selectedInput,
		gameChangerAPI,
	]);

	useEffect(() => {
		if (needsSort && returnedDocs.length) {
			setNeedsSort(false);
			const newViewableDocs = returnedDocs.filter((doc) => {
				return doc.pageHits.find((match) => match.paragraphIdBeingMatched === selectedInput);
			});
			const order = sortOrder === 'desc' ? 1 : -1;
			let sortFunc = {};
			switch (sortType) {
				case 'Alphabetically':
					sortFunc = sortAlphabeticalFunc(order);
					break;
				case 'Date Published':
					sortFunc = sortDatePublishedFunc(order);
					break;
				default:
					sortFunc = defaultSortFunc(order);
					break;
			}
			const sortedDocs = newViewableDocs.sort(sortFunc);
			if (!selectedParagraph && sortedDocs.length) {
				setSelectedParagraph(sortedDocs[0].pageHits[0]);
				setCompareDocument(sortedDocs[0]);
			}
			setViewableDocs(sortedDocs);
		}
	}, [needsSort, returnedDocs, selectedInput, sortType, viewableDocs, sortOrder, selectedParagraph]);

	const sortAlphabeticalFunc = (order) => {
		return (docA, docB) => {
			if (docA.title > docB.title) return order;
			if (docA.title < docB.title) return -order;
			return 0;
		};
	};

	const sortDatePublishedFunc = (order) => {
		return (docA, docB) => {
			if (docA.publication_date_dt > docB.publication_date_dt) return -order;
			if (docA.publication_date_dt < docB.publication_date_dt) return order;
			if (!docA.publication_date_dt) return 1;
			if (!docB.publication_date_dt) return -1;
			return 0;
		};
	};

	const defaultSortFunc = (order) => {
		return (docA, docB) => {
			if (docA.score > docB.score) return -order;
			if (docA.score < docB.score) return order;
			return 0;
		};
	};

	const handleFeedback = (doc, paragraph, positiveFeedback) => {
		let undo = false;
		if (positiveFeedback === feedbackList[paragraph.paragraphIdBeingMatched]) {
			undo = true;
			const newList = { ...feedbackList };
			delete newList[paragraph.paragraphIdBeingMatched];
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

	const measuredRef = useCallback(
		(node) => {
			if (node !== null && compareDocument) {
				if (compareDocument && selectedParagraph) {
					gameChangerAPI
						.dataStorageDownloadGET(
							encode(compareDocument.file_location_eda_ext || ''),
							`"${selectedParagraph.snippet}"`,
							selectedParagraph.pageNumber,
							true,
							state.cloneData
						)
						.then((url) => {
							node.src = url;
						});
				}
			}
		},
		[compareDocument, state.cloneData, selectedParagraph, gameChangerAPI]
	);

	useEffect(() => {
		handleSetParagraphs();
	}, [paragraphText, handleSetParagraphs]);

	const removeParagraph = (id) => {
		const newParagraphs = paragraphs.filter((par) => par.id !== id);
		if (id === selectedInput) {
			setSelectedInput(newParagraphs[0].id);
			setNeedsSort(true);
			setToFirstResultofInput(newParagraphs[0].id);
		}
		setParagraphs(newParagraphs);
		const newReturnedDocs = returnedDocs.filter((doc) => {
			const newReturnedDocsParagraphs = doc.pageHits.filter((par) => {
				return par.paragraphIdBeingMatched !== id;
			});
			return newReturnedDocsParagraphs.length;
		});
		setReturnedDocs(newReturnedDocs);
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
		setReturnedDocs([]);
		handleCompare();
	};

	const handleCompare = () => {
		if (!paragraphs.length) return;
		setNoResults(false);
		setFilterChange(false);
		setSelectedInput(paragraphs?.[0].id);
		setNeedsSort(true);
		setItemsToCombine({});
		setState(dispatch, { runDocumentComparisonSearch: true });
	};

	const saveDocToFavorites = (filename, paragraph) => {
		const text = paragraphs.find((input) => input.id === paragraph.paragraphIdBeingMatched).text;
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

	const getExportDoc = (page) => {
		const textInput = paragraphs.find((input) => page.paragraphIdBeingMatched === input.id).text;
		return {
			filename: document.filename,
			title: document.title,
			page: page.pageNumber,
			textInput,
			textMatch: page.snippet,
			score: convertDCTScoreToText(page.score),
		};
	};

	const exportSingleDoc = (document) => {
		const exportList = [];
		document.pageHits.forEach((page) => {
			exportList.push(getExportDoc(page));
		});
		handleExport(exportList, 'ExportSindleDocCSV');
	};

	const exportAll = () => {
		const exportList = [];
		returnedDocs.forEach((document) => {
			document.pageHits.forEach((page) => {
				exportList.push(getExportDoc(page));
			});
		});
		handleExport(exportList, 'ExportSindleDocCSV');
	};

	const handleExport = (exportList, type) => {
		try {
			trackEvent(
				getTrackingNameForFactory(state.cloneData.clone_name),
				'DocumentComparisonTool',
				type,
				exportList.length
			);
			exportToCsv('DocumentComparisonData.csv', exportList, true);
		} catch (e) {
			console.error(e);
			return [];
		}
	};

	const setToFirstResultofInput = (inputId) => {
		let paragraph;
		const document = viewableDocs.find((doc) => {
			const foundPar = doc.pageHits.find((page) => page.paragraphIdBeingMatched === inputId);
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

	// handle an uploaded file to drag and drop
	const handleFileDrop = useCallback(async (acceptedFile = [{}]) => {
		let [file] = acceptedFile;

		switch (file.type) {
			case 'text/plain':
			case 'application/json':
				let text = await file.text();
				setParagraphText(text);
				break;
			case 'application/pdf':
				pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

				let fileReader = new FileReader();

				fileReader.onload = (event) => {
					let typedarray = new Uint8Array(event.target.result);

					const loadingTask = pdfjsLib.getDocument(typedarray);
					loadingTask.promise.then((pdf) => {
						let maxPages = pdf._pdfInfo.numPages;
						let countPromises = [];
						for (let i = 1; i <= maxPages; i++) {
							let page = pdf.getPage(i);

							countPromises.push(
								page.then((data) => {
									let textContent = data.getTextContent();
									return textContent.then((textData) => {
										return textData.items
											.map((s) => {
												return s.str;
											})
											.join('');
									});
								})
							);
						}

						return Promise.all(countPromises).then((texts) => {
							setParagraphText(texts.join(''));
						});
					});
				};

				fileReader.readAsArrayBuffer(file);

				break;
			case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
				break;
			default:
				break;
		}
	}, []);

	const handleConditional = (bool, trueProp, falseProp) => {
		return bool ? trueProp : falseProp;
	};

	const setDocParagraph = (e, doc, paragraph) => {
		e.preventDefault();
		setCompareDocument(doc);
		setSelectedParagraph(paragraph);
	};

	const renderDocParagraphs = (doc, docOpen) => {
		if (doc.paragraphs) {
			return doc.paragraphs
				.filter((paragraph) => paragraph.paragraphIdBeingMatched === selectedInput)
				.map((paragraph) => {
					let blockquoteClass = 'searchdemo-blockquote-sm';
					const pOpen = selectedParagraph?.id === paragraph.id;
					const isHighlighted = pOpen && docOpen;
					if (isHighlighted) blockquoteClass += ' searchdemo-blockquote-sm-active';
					return (
						<div key={paragraph.id} style={{ position: 'relative' }}>
							{isHighlighted && <span className="searchdemo-arrow-left-sm"></span>}
							<div
								className={blockquoteClass}
								onClick={(e) => setDocParagraph(e, doc, paragraph)}
								style={{
									marginLeft: 20,
									marginRight: 0,
									border: handleConditional(isHighlighted, 'none', '1px solid #DCDCDC'),
									padding: '3px',
									cursor: 'pointer',
								}}
							>
								<span
									className="gc-document-explorer-result-header-text"
									style={{
										color: handleConditional(isHighlighted, 'white', '#131E43'),
									}}
								>
									{handleConditional(
										isHighlighted,
										`Page: ${paragraph.page_num_i + 1}, Par: ${
											paragraph.id.split('_')[1]
										}, Similarity Score: ${paragraph.score_display}`,
										paragraph.par_raw_text_t
									)}
								</span>
							</div>
							<Collapse isOpened={pOpen && docOpen}>
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
									<span
										className="gc-document-explorer-result-header-text"
										style={{ fontWeight: 'normal' }}
									>
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
													onClick={() => saveDocToFavorites(doc.filename, paragraph)}
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
												className={classes.feedback + ' fa fa-thumbs-up'}
												style={handleConditional(
													feedbackList[paragraph.id],
													{
														color: '#939395',
														WebkitTextStroke: '1px black',
													},
													{}
												)}
												onClick={() => handleFeedback(doc, paragraph, true)}
											/>
										</GCTooltip>
										<GCTooltip title={'Was this result relevant?'} placement="bottom" arrow>
											<i
												className={classes.feedback + ' fa fa-thumbs-down'}
												style={handleConditional(
													feedbackList[paragraph.id] === false,
													{
														color: '#939395',
														WebkitTextStroke: '1px black',
													},
													{}
												)}
												onClick={() => handleFeedback(doc, paragraph, false)}
											/>
										</GCTooltip>
									</div>
								</div>
							</Collapse>
						</div>
					);
				});
		}
		return <></>;
	};

	const renderPageHits = (doc, docOpen) => {
		if (doc.pageHits) {
			return doc.pageHits
				.filter((paragraph) => paragraph.paragraphIdBeingMatched === selectedInput)
				.map((paragraph) => {
					let blockquoteClass = 'searchdemo-blockquote-sm';
					const pOpen = selectedParagraph?.id === paragraph.id;
					const isHighlighted = pOpen && docOpen;
					if (isHighlighted) blockquoteClass += ' searchdemo-blockquote-sm-active';
					return (
						<div key={paragraph.id} style={{ position: 'relative' }}>
							{isHighlighted && <span className="searchdemo-arrow-left-sm"></span>}
							<div
								className={blockquoteClass}
								onClick={(e) => setDocParagraph(e, doc, paragraph)}
								style={{
									marginLeft: 20,
									marginRight: 0,
									border: handleConditional(isHighlighted, 'none', '1px solid #DCDCDC'),
									padding: '3px',
									cursor: 'pointer',
								}}
							>
								<span
									className="gc-document-explorer-result-header-text"
									style={{
										color: handleConditional(isHighlighted, 'white', '#131E43'),
									}}
								>
									{handleConditional(
										isHighlighted,
										`Page: ${paragraph.pageNumber}, Par: ${paragraph.id}, Similarity Score: ${paragraph.score_display}`,
										paragraph.text
									)}
								</span>
							</div>
							<Collapse isOpened={pOpen && docOpen}>
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
									<span
										className="gc-document-explorer-result-header-text"
										style={{ fontWeight: 'normal' }}
									>
										{paragraph.text}
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
													onClick={() => saveDocToFavorites(doc.filename, paragraph)}
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
												className={classes.feedback + ' fa fa-thumbs-up'}
												style={handleConditional(
													feedbackList[paragraph.id],
													{
														color: '#939395',
														WebkitTextStroke: '1px black',
													},
													{}
												)}
												onClick={() => handleFeedback(doc, paragraph, true)}
											/>
										</GCTooltip>
										<GCTooltip title={'Was this result relevant?'} placement="bottom" arrow>
											<i
												className={classes.feedback + ' fa fa-thumbs-down'}
												style={handleConditional(
													feedbackList[paragraph.id] === false,
													{
														color: '#939395',
														WebkitTextStroke: '1px black',
													},
													{}
												)}
												onClick={() => handleFeedback(doc, paragraph, false)}
											/>
										</GCTooltip>
									</div>
								</div>
							</Collapse>
						</div>
					);
				});
		} else {
			return <></>;
		}
	};

	return (
		<Grid container style={{ marginTop: 20, paddingBottom: 20 }}>
			<Grid item xs={12}>
				<div style={{ display: 'flex' }}>
					<div style={{ fontWeight: 'bold', alignItems: 'center', fontFamily: 'Noto Sans' }}>
						The Document Comparison Tool enables you to input text and locate contracts in the GAMECHANGER
						contract repository with semantically similar language. Using the Document Comparison Tool
						below, you can conduct deeper contract analysis and understand how one piece of a contract
						compares to the GAMECHANGER contract repository.
					</div>
					{!loading && returnedDocs.length > 0 && (
						<div style={{ display: 'flex', marginLeft: 20 }}>
							<FormControl
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
			<Grid item xs={2} style={{ marginTop: 20 }}>
				<GCAnalystToolsSideBar context={context} results={returnedDocs} />
				<GCButton
					isSecondaryBtn
					onClick={() => resetAdvancedSettings(dispatch)}
					style={{ margin: 0, width: '100%' }}
				>
					Clear Filters
				</GCButton>
				{!loading && returnedDocs.length > 0 && (
					<GCButton
						onClick={() => {
							setNoResults(false);
							setReturnedDocs([]);
							setNeedsSort(true);
							setState(dispatch, { runDocumentComparisonSearch: true });
						}}
						style={{ margin: '10px 0 0 0', width: '100%' }}
						disabled={!filterChange}
					>
						Apply filters
					</GCButton>
				)}
			</Grid>
			{returnedDocs.length <= 0 && !loading && (
				<Grid item xs={10}>
					<DocumentInputContainer>
						<Grid container className={'input-container-grid'} style={{ margin: 0 }}>
							<Grid item xs={12}>
								<Grid container style={{ display: 'flex', flexDirection: 'column' }}>
									<Grid item xs={12}>
										<div className={'instruction-box'}>
											To search for similar documents, upload a document:
										</div>
										<DragAndDrop
											text="Drag and drop a file here, or click to select a file (currently pdf, txt, or json only)"
											acceptedFileTypes={[
												'application/pdf',
												'text/plain',
												'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
												'application/json',
											]}
											handleFileDrop={handleFileDrop}
										/>
									</Grid>

									<Grid container style={{ display: 'flex' }}>
										<Grid item xs={12}>
											<div className={'input-box'}>
												<TextField
													id="input-box"
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
									<GCButton disabled={inputError} onClick={handleCompare}>
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
				</Grid>
			)}
			{loading && (
				<Grid item xs={10}>
					<div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
						<LoadingIndicator customColor={gcOrange} />
					</div>
				</Grid>
			)}
			{!loading && returnedDocs.length > 0 && (
				<>
					<Grid item xs={6} style={{ marginTop: 20 }}>
						<div style={{ margin: '0px 20px', height: '800px' }}>
							<iframe
								title={'PDFViewer'}
								className="aref"
								id={'pdfViewer'}
								ref={measuredRef}
								onLoad={() =>
									handlePdfOnLoad(
										'pdfViewer',
										'viewerContainer',
										compareDocument?.filename,
										'PDF Viewer'
									)
								}
								style={{ width: '100%', height: '100%' }}
							/>
						</div>
					</Grid>
					<Grid
						item
						xs={4}
						style={{
							marginTop: 20,
							height: '800px',
							overflowY: 'auto',
							maxWidth: 'calc(33.333333% + 20px)',
							flexBasis: 'calc((33.333333% + 20px)',
							paddingLeft: '20px',
							marginLeft: '-20px',
						}}
					>
						<div
							style={{
								padding: 20,
								background: '#F6F8FA 0% 0% no-repeat padding-box',
								border: '1px dashed #707070',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Typography variant="body1" style={{ marginBottom: 10 }}>
								Paragraph Input
							</Typography>
							{paragraphs.map((paragraph, indexAsKey) => (
								<div
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
									disabled={combineDisabled}
									onClick={() => {
										handleCombine();
									}}
								>
									Combine
								</GCButton>
								<GCButton
									style={{ marginTop: 0, width: 'fit-content' }}
									isSecondaryBtn
									onClick={() => {
										setNoResults(false);
										setFilterChange(false);
										return reset();
									}}
								>
									Reset
								</GCButton>
							</div>
						</div>
						<div style={{ marginTop: 20 }}>
							{viewableDocs.length ? (
								<></>
							) : (
								<div style={{ ...styles.resultsText, marginLeft: 0 }}>
									<div className={'text'}>No results for paragraph found</div>
								</div>
							)}
							{viewableDocs.map((doc) => {
								const docOpen = collapseKeys[doc.filename] ?? false;
								const displayTitle = doc.title;
								return (
									<div key={doc.title}>
										<div
											className="searchdemo-modal-result-header"
											style={{ marginTop: 0 }}
											onClick={(e) => {
												e.preventDefault();
												setCollapseKeys({ ...collapseKeys, [doc.filename]: !docOpen });
											}}
										>
											<i
												style={{
													marginRight: handleConditional(docOpen, 10, 14),
													fontSize: 20,
													cursor: 'pointer',
												}}
												className={`fa fa-caret-${handleConditional(docOpen, 'down', 'right')}`}
											/>
											<span className="gc-document-explorer-result-header-text">
												{displayTitle}
											</span>
										</div>
										<div>
											<Collapse isOpened={docOpen}>{renderDocParagraphs(doc, docOpen)}</Collapse>
										</div>
										<div>
											<Collapse isOpened={docOpen}>{renderPageHits(doc, docOpen)}</Collapse>
										</div>
									</div>
								);
							})}
						</div>
					</Grid>
				</>
			)}
		</Grid>
	);
};

EDADocumentsComparisonTool.propTypes = {
	context: propTypes.objectOf({}),
};

export default EDADocumentsComparisonTool;
