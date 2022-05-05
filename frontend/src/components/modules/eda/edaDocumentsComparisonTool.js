import React, { useCallback, useEffect, useState } from 'react';
import propTypes from 'prop-types';
import GCDocumentsComparisonTool from '../../analystTools/GCDocumentsComparisonTool';
import { trackEvent } from '../../telemetry/Matomo';
import GameChangerAPI from '../../api/gameChanger-service-api';
import { setState, handleSaveFavoriteDocument } from '../../../utils/sharedFunctions';
import { encode, getTrackingNameForFactory, exportToCsv, convertDCTScoreToText } from '../../../utils/gamechangerUtils';

const gameChangerAPI = new GameChangerAPI();

const EDADocumentsComparisonTool = (props) => {
	const { context } = props;
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
		const paragraphs = paragraphText
			.split('\n')
			.map((paragraph, idx) => {
				return { text: paragraph.trim(), id: idx };
			})
			.filter((paragraph) => paragraph.text.length > 0);

		if (paragraphs.length > 5) {
			setInputError(true);
		} else {
			setInputError(false);
		}

		setParagraphs(paragraphs);
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
				.compareDocumentPOST({ cloneName: state.cloneData.clone_name, paragraphs: paragraphs, filters })
				.then((resp) => {
					if (resp.data.docs.length <= 0) {
						setNoResults(true);
					} else {
						let paragraph;
						console.log('DOCS!!!');
						console.log(resp.data.docs);
						console.log(selectedInput);
						console.log('PARAGRAPHS!!!');
						console.log(paragraphs);
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
					setLoading(false);
				})
				.catch(() => {
					setReturnedDocs([]);
					setState(dispatch, { runDocumentComparisonSearch: false });
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
	]);

	useEffect(() => {
		if (needsSort && returnedDocs.length) {
			setNeedsSort(false);
			const newViewableDocs = returnedDocs.filter((doc) => {
				return doc.pageHits.find((match) => match.paragraphIdBeingMatched === selectedInput);
			});
			const order = sortOrder === 'desc' ? 1 : -1;
			let sortFunc = () => {};
			switch (sortType) {
				case 'Alphabetically':
					sortFunc = (docA, docB) => {
						if (docA.title > docB.title) return order;
						if (docA.title < docB.title) return -order;
						return 0;
					};
					break;
				case 'Date Published':
					sortFunc = (docA, docB) => {
						if (docA.publication_date_dt > docB.publication_date_dt) return -order;
						if (docA.publication_date_dt < docB.publication_date_dt) return order;
						if (!docA.publication_date_dt) return 1;
						if (!docB.publication_date_dt) return -1;
						return 0;
					};
					break;
				default:
					sortFunc = (docA, docB) => {
						if (docA.score > docB.score) return -order;
						if (docA.score < docB.score) return order;
						return 0;
					};
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
		[compareDocument, state.cloneData, selectedParagraph]
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
			const newParagraphs = doc.pageHits.filter((par) => {
				return par.paragraphIdBeingMatched !== id;
			});
			return newParagraphs.length;
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

	const exportSingleDoc = (document) => {
		const exportList = [];
		document.pageHits.forEach((page) => {
			const textInput = paragraphs.find((input) => page.paragraphIdBeingMatched === input.id).text;
			exportList.push({
				filename: document.filename,
				title: document.title,
				page: page.pageNumber,
				textInput,
				textMatch: page.snippet,
				score: convertDCTScoreToText(page.score),
			});
		});
		heandleExport(exportList, 'ExportSindleDocCSV');
	};

	const exportAll = () => {
		const exportList = [];
		returnedDocs.forEach((document) => {
			document.pageHits.forEach((page) => {
				const textInput = paragraphs.find((input) => page.paragraphIdBeingMatched === input.id).text;
				exportList.push({
					filename: document.filename,
					title: document.title,
					page: page.pageNumber,
					textInput,
					textMatch: page.snippet,
					score: convertDCTScoreToText(page.score),
				});
			});
		});
		heandleExport(exportList, 'ExportSindleDocCSV');
	};

	const heandleExport = (exportList, type) => {
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

	return (
		<GCDocumentsComparisonTool
			context={context}
			description="The Document Comparison Tool enables you to input text and locate contracts in the GAMECHANGER contract repository with semantically similar language. Using the Document Comparison Tool below, you can conduct deeper contract analysis and understand how one piece of a contract compares to the GAMECHANGER contract repository."
			loading={loading}
			returnedDocs={returnedDocs}
			setReturnedDocs={setReturnedDocs}
			sortType={sortType}
			setSortType={setSortType}
			setNeedsSort={setNeedsSort}
			sortOrder={sortOrder}
			setSortOrder={setSortOrder}
			exportAll={exportAll}
			setNoResults={setNoResults}
			noResults={noResults}
			filterChange={filterChange}
			setFilterChange={setFilterChange}
			paragraphText={paragraphText}
			setParagraphText={setParagraphText}
			setInputError={setInputError}
			inputError={inputError}
			setViewableDocs={setViewableDocs}
			viewableDocs={viewableDocs}
			setItemsToCombine={setItemsToCombine}
			itemsToCombine={itemsToCombine}
			setSelectedParagraph={setSelectedParagraph}
			selectedParagraph={selectedParagraph}
			setSelectedInput={setSelectedInput}
			selectedInput={selectedInput}
			handleCompare={handleCompare}
			measuredRef={measuredRef}
			compareDocument={compareDocument}
			setCompareDocument={setCompareDocument}
			paragraphs={paragraphs}
			removeParagraph={removeParagraph}
			combineDisabled={combineDisabled}
			handleCombine={handleCombine}
			collapseKeys={collapseKeys}
			setCollapseKeys={setCollapseKeys}
			exportSingleDoc={exportSingleDoc}
			saveDocToFavorites={saveDocToFavorites}
			feedbackList={feedbackList}
			handleFeedback={handleFeedback}
		/>
	);
};

EDADocumentsComparisonTool.propTypes = {
	context: propTypes.objectOf({}),
};

export default EDADocumentsComparisonTool;
