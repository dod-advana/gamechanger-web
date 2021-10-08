import React from 'react';
import moment from 'moment';
import GameChangerSearchMatrix from '../../searchMetrics/GCSearchMatrix';
import GameChangerSideBar from '../../searchMetrics/GCSideBar';
import DefaultGraphView from '../../graph/defaultGraphView';
import defaultMainViewHandler from '../default/defaultMainViewHandler';
import ViewHeader from '../../mainView/ViewHeader';
import { trackEvent } from '../../telemetry/Matomo';
import { Typography } from '@material-ui/core';
import { setState, handleSaveFavoriteTopic } from '../../../utils/sharedFunctions';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import SearchSection from '../globalSearch/SearchSection';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { gcOrange } from '../../common/gc-colors';
import { Card } from '../../cards/GCCard';
import { DidYouMean } from '../../searchBar/SearchBarStyledComponents';
import Pagination from 'react-js-pagination';
import GCTooltip from '../../common/GCToolTip';
import GetQAResults from '../default/qaResults';
import GameChangerThumbnailRow from '../../mainView/ThumbnailRow';
import {
	getTrackingNameForFactory,
	RESULTS_PER_PAGE,
	StyledCenterContainer,
} from '../../../utils/gamechangerUtils';
import {
	TrendingSearchContainer,
	RecentSearchContainer,
	SourceContainer,
} from '../../mainView/HomePageStyledComponents';
import GameChangerAPI from '../../api/gameChanger-service-api';
import '../../mainView/main-view.css';
import DefaultSeal from '../../mainView/img/GC Default Seal.png';
import DefaultPub from '../../mainView/img/default_cov.png';

const _ = require('lodash');

const gameChangerAPI = new GameChangerAPI();

const fullWidthCentered = {
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
};

const styles = {
	listViewBtn: {
		minWidth: 0,
		margin: '20px 0px 0px',
		marginLeft: 10,
		padding: '0px 7px 0',
		fontSize: 20,
		height: 34,
	},
	cachedResultIcon: {
		display: 'flex',
		justifyContent: 'center',
		padding: '0 0 1% 0',
	},
	searchResults: fullWidthCentered,
	paginationWrapper: fullWidthCentered,
	resultsCount: {
		fontFamily: 'Noto Sans',
		fontSize: 22,
		fontWeight: 'bold',
		color: '#131E43',
		paddingTop: '10px',
	},
	subtext: {
		color: '#8091A5',
		fontSize: 12,
	},
	containerText: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	checkboxPill: {
		textAlign: 'center',
		borderRadius: '10px',
		paddingLeft: '10px',
		paddingRight: '10px',
		lineHeight: 1.2,
		fontSize: '12px',
		marginLeft: '10px',
		border: '2px solid #bdccde',
		backgroundColor: 'white',
		boxSizing: 'border-box',
		color: 'black',
		minHeight: '35px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		cursor: 'pointer',
	},
};

const getSearchResults = (searchResultData, state, dispatch) => {
	return _.map(searchResultData, (item, idx) => {
		return (
			<Card key={idx} item={item} idx={idx} state={state} dispatch={dispatch} />
		);
	});
};

const handleDidYouMeanClicked = (didYouMean, state, dispatch) => {
	trackEvent(
		getTrackingNameForFactory(state.cloneData.clone_name),
		'SuggestionSelected',
		'DidYouMean'
	);
	setState(dispatch, { searchText: didYouMean, runSearch: true });
};

// const openDocument = (filename, cloneData, cloneName, pageNumber = 0) => {
// 	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction' , 'PDFOpen');
// 	trackEvent(getTrackingNameForFactory(cloneName), 'CardInteraction', 'filename', filename);
// 	window.open(`/#/pdfviewer/gamechanger?filename=${filename}&pageNumber=${pageNumber}&cloneIndex=${cloneData.clone_name}`);
// };

const renderRecentSearches = (search, state, dispatch) => {
	const {
		searchText,
		favorite,
		orgFilterString,
		publicationDateAllTime,
		publicationDateFilter,
		typeFilterString,
		includeRevoked,
		run_at,
	} = search;
	return (
		<RecentSearchContainer
			onClick={() => {
				const orgFilters = { ...state.searchSettings.orgFilter };
				if (orgFilterString.length > 1) {
					Object.keys(orgFilters).forEach((key) => {
						if (orgFilterString.includes(key)) {
							orgFilters[key] = true;
						} else {
							orgFilters[key] = false;
						}
					});
				}
				const currSearchSettings = {
					...state.searchSettings,
					orgFilter: orgFilters,
					specificOrgsSelected: orgFilterString.length > 0,
					allOrgsSelected: orgFilterString.length === 0,
					publicationDateAllTime,
					publicationDateFilter,
					includeRevoked,
				};
				setState(dispatch, {
					searchText,
					runSearch: true,
					searchSettings: currSearchSettings,
				});
			}}
		>
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<Typography style={styles.containerText}>{searchText}</Typography>
				<i
					className={favorite ? 'fa fa-star' : 'fa fa-star-o'}
					style={{
						color: favorite ? '#E9691D' : 'rgb(224, 224, 224)',
						cursor: 'pointer',
						fontSize: 20,
					}}
				/>
			</div>
			<Typography style={styles.subtext}>
				Organization Filter:
				{orgFilterString.length === 0 ? 'All' : orgFilterString.join(', ')}
			</Typography>
			<Typography style={styles.subtext}>
				Type Filter:
				{typeFilterString.length === 0 ? 'All' : typeFilterString.join(', ')}
			</Typography>
			<Typography style={styles.subtext}>
				Publication Date:
				{publicationDateAllTime ? 'All' : publicationDateFilter.join(' - ')}
			</Typography>
			<Typography style={styles.subtext}>
				Include Canceled: {includeRevoked ? 'Yes' : 'No'}
			</Typography>
			<Typography style={styles.subtext}>
				Search Time:{' '}
				{moment(Date.parse(run_at)).utc().format('YYYY-MM-DD HH:mm UTC')}
			</Typography>
		</RecentSearchContainer>
	);
};

const handlePopPubs = async (pop_pubs, pop_pubs_inactive, state, dispatch) => {
	let filteredPubs = _.filter(pop_pubs, (item) => {
		return !_.includes(pop_pubs_inactive, item.id);
	});
	try {
		filteredPubs = filteredPubs.map((item) => ({
			...item,
			imgSrc: DefaultPub,
		}));
		setState(dispatch, { searchMajorPubs: filteredPubs });

		for (let i = 0; i < filteredPubs.length; i++) {
			gameChangerAPI
				.thumbnailStorageDownloadPOST([filteredPubs[i]], 'thumbnails', {
					clone_name: 'gamechanger',
				})
				.then((pngs) => {
					const buffers = pngs.data;
					buffers.forEach((buf, idx) => {
						if (buf.status === 'fulfilled') {
							filteredPubs[i].imgSrc = 'data:image/png;base64,' + buf.value;
						} else {
							filteredPubs[i].imgSrc = DefaultPub;
						}
					});
					setState(dispatch, { searchMajorPubs: filteredPubs });
				});
		}
	} catch (e) {
		//Do nothing
		console.log(e);
		setState(dispatch, { searchMajorPubs: filteredPubs });
	}
};

const handleSources = async (state, dispatch) => {
	let crawlerSources = await gameChangerAPI.gcCrawlerSealData();
	crawlerSources = crawlerSources.data.map((item) => ({
		...item,
		imgSrc: DefaultSeal,
	}));
	setState(dispatch, { crawlerSources });

	try {
		let folder = 'crawler_images';
		const thumbnailList = crawlerSources.map((item) => {
			let filename = item.image_link.split('/').pop();
			return { img_filename: filename };
		});

		for (let i = 0; i < thumbnailList.length; i++) {
			gameChangerAPI
				.thumbnailStorageDownloadPOST([thumbnailList[i]], folder, {
					clone_name: 'gamechanger',
				})
				.then((pngs) => {
					const buffers = pngs.data;
					buffers.forEach((buf, idx) => {
						if (buf.status === 'fulfilled') {
							crawlerSources[i].imgSrc = 'data:image/png;base64,' + buf.value;
							if (crawlerSources[i].image_link.split('.').pop() === 'png') {
								crawlerSources[i].imgSrc = 'data:image/png;base64,' + buf.value;
							} else if (
								crawlerSources[i].image_link.split('.').pop() === 'svg'
							) {
								crawlerSources[i].imgSrc =
									'data:image/svg+xml;base64,' + buf.value;
							}
						} else {
							crawlerSources[i].imgSrc = DefaultSeal;
						}
					});
					setState(dispatch, { crawlerSources });
				});
		}
	} catch (e) {
		//Do nothing
		console.log(e);
		setState(dispatch, { crawlerSources });
	}
};

const formatString = (text) => {
	let titleCase = text
		.split(' ')
		.map(function (val) {
			if (val.charAt(0) === '(' && val.charAt(val.length - 1) === ')') {
				return val;
			} else {
				return val.charAt(0).toUpperCase() + val.substr(1).toLowerCase();
			}
		})
		.join(' ');
	return _.truncate(titleCase, { length: 60, separator: /,?\.* +/ });
};

const PolicyMainViewHandler = {
	async handlePageLoad(props) {
		const { state, dispatch } = props;
		await defaultMainViewHandler.handlePageLoad(props);
		let topics = [];
		// let pubs = [];
		let pop_pubs = [];
		let pop_pubs_inactive = [];
		try {
			const { data } = await gameChangerAPI.getHomepageEditorData();
			data.forEach((obj) => {
				if (obj.key === 'homepage_topics') {
					topics = JSON.parse(obj.value);
				}
				// else if(obj.key === 'homepage_major_pubs') {
				// 	pubs = JSON.parse(obj.value);
				// }
				else if (obj.key === 'homepage_popular_docs_inactive') {
					pop_pubs_inactive = JSON.parse(obj.value);
				} else if (obj.key === 'popular_docs') {
					pop_pubs = obj.value;
				}
			});
		} catch (e) {
			// Do nothing
		}

		setState(dispatch, { adminTopics: topics });
		// handlePubs(pubs, state, dispatch);
		handleSources(state, dispatch);
		handlePopPubs(pop_pubs, pop_pubs_inactive, state, dispatch);
	},

	getMainView(props) {
		return defaultMainViewHandler.getMainView(props);
	},

	handleCategoryTabChange(props) {
		defaultMainViewHandler.handleCategoryTabChange(props);
	},

	getViewNames(props) {
		const viewNames = defaultMainViewHandler.getViewNames(props);
		viewNames.push({
			name: 'Graph',
			title: 'Graph View',
			id: 'gcOpenGraphView',
		});
		return viewNames;
	},

	renderHideTabs(props) {
		const { state, dispatch, searchHandler } = props;
		const {
			adminTopics,
			searchMajorPubs,
			cloneData,
			crawlerSources,
			prevSearchText,
			resetSettingsSwitch,
			didYouMean,
			loading,
			userData,
			recentSearches,
		} = state;

		const showDidYouMean = didYouMean && !loading;
		// const trendingStorage = localStorage.getItem(`trending${cloneData.clone_name}Searches`) || '[]';
		const trendingStorage =
			localStorage.getItem(`trending${'gamechanger'}Searches`) || '[]';

		if (prevSearchText) {
			if (!resetSettingsSwitch) {
				dispatch({ type: 'RESET_SEARCH_SETTINGS' });
				setState(dispatch, {
					resetSettingsSwitch: true,
					showSnackbar: true,
					snackBarMsg: 'Search settings reset',
				});
				if (searchHandler) searchHandler.setSearchURL(state);
			}
		}

		const { favorite_topics = [], favorite_searches = [] } = userData;

		// const agencyPublications = ['Department of the United States Army', 'Department of the United States Navy', 'Department of the United States Marine Corp', 'Department of United States Air Force']

		let trendingLinks = [];
		if (trendingStorage) {
			JSON.parse(trendingStorage).forEach((search) => {
				if (search.search) {
					trendingLinks.push({
						search: search.search.replaceAll('&#039;', '"'),
						count: search.count,
						favorite: false,
					});
				}
			});
		}

		trendingLinks.forEach(({ search }, idx) => {
			favorite_searches.forEach((fav) => {
				if (fav.search_text === search) {
					trendingLinks[idx].favorite = true;
				}
			});
		});

		recentSearches.forEach((search, idx) => {
			favorite_searches.forEach((fav) => {
				recentSearches[idx].favorite = fav.tiny_url === search.tiny_url;
			});
		});

		const favTopicNames = favorite_topics.map((item) =>
			item.topic_name.toLowerCase()
		);
		adminTopics.forEach((topic, idx) => {
			if (
				_.find(favTopicNames, (item) => {
					return item === topic.name.toLowerCase();
				})
			) {
				adminTopics[idx].favorite = true;
			} else {
				adminTopics[idx].favorite = false;
			}
		});

		return (
			<div style={{ marginTop: '40px' }}>
				{prevSearchText && (
					<div style={{ margin: '10px auto', width: '67%' }}>
						<div style={styles.resultsCount}>
							<p style={{ fontWeight: 'normal', display: 'inline' }}>
								Looks like we don't have any matches for{' '}
							</p>
							"{prevSearchText}"
						</div>
					</div>
				)}
				{showDidYouMean && (
					<div
						style={{
							margin: '10px auto',
							fontSize: '25px',
							width: '67%',
							paddingLeft: 'auto',
						}}
					>
						Did you mean{' '}
						<DidYouMean
							onClick={() =>
								handleDidYouMeanClicked(didYouMean, state, dispatch)
							}
						>
							{didYouMean}
						</DidYouMean>
						?
					</div>
				)}
				<div style={{ margin: '0 70px 0 70px' }}>
					<GameChangerThumbnailRow
						links={trendingLinks}
						title={'Trending Searches'}
						width={'300px'}
					>
						{trendingLinks.map(({ search, favorite, count }, idx) => (
							<TrendingSearchContainer
								onClick={() =>
									setState(dispatch, { searchText: search, runSearch: true })
								}
							>
								<div
									style={{ display: 'flex', justifyContent: 'space-between' }}
								>
									<Typography style={styles.containerText}>{`#${idx + 1} ${
										search.length < 20
											? search
											: search.substring(0, 22) + '...'
									}`}</Typography>
									<i
										className={favorite ? 'fa fa-star' : 'fa fa-star-o'}
										style={{
											color: favorite ? '#E9691D' : 'rgb(224, 224, 224)',
											cursor: 'pointer',
											fontSize: 20,
										}}
									/>
								</div>
								<Typography style={styles.subtext}>
									<i
										className="fa fa-search"
										style={{ width: 16, height: 15 }}
									/>
									{`${count} searches this week`}
								</Typography>
							</TrendingSearchContainer>
						))}
					</GameChangerThumbnailRow>
					<GameChangerThumbnailRow
						links={adminTopics}
						title={`Editor's Choice: Top Topics`}
						width="100px"
						style={{ marginLeft: '0' }}
					>
						{adminTopics.map((item, idx) => (
							<div
								style={styles.checkboxPill}
								onClick={() => {
									trackEvent(
										getTrackingNameForFactory(cloneData.clone_name),
										'TopicOpened',
										item.name
									);
									window.open(
										`#/gamechanger-details?cloneName=${
											cloneData.clone_name
										}&type=topic&topicName=${item.name.toLowerCase()}`
									);
								}}
							>
								{item.name}
								<i
									className={item.favorite ? 'fa fa-star' : 'fa fa-star-o'}
									style={{
										color: item.favorite ? '#E9691D' : 'rgb(224,224,224)',
										marginLeft: 10,
										cursor: 'pointer',
										fontSize: 20,
									}}
									onClick={(event) => {
										event.stopPropagation();
										handleSaveFavoriteTopic(
											item.name.toLowerCase(),
											'',
											!item.favorite,
											dispatch
										);
									}}
								/>
							</div>
						))}
					</GameChangerThumbnailRow>
					<GameChangerThumbnailRow
						links={crawlerSources}
						title="Sources"
						width="300px"
					>
						{crawlerSources.length > 0 &&
							crawlerSources[0].imgSrc &&
							crawlerSources.map((source) => (
								<SourceContainer
									onClick={() => {
										trackEvent(
											getTrackingNameForFactory(cloneData.clone_name),
											'SourceOpened',
											source.display_source_s
										);
										window.open(
											`#/gamechanger-details?cloneName=${
												cloneData.clone_name
											}&type=source&sourceName=${source.display_source_s.toLowerCase()}`
										);
									}}
								>
									<img src={source.imgSrc} alt={'crawler seal'}></img>
									<Typography
										style={{
											...styles.containerText,
											color: '#313541',
											alignSelf: 'center',
											marginLeft: '20px',
										}}
									>
										{source.display_source_s}
									</Typography>
								</SourceContainer>
							))}
						{crawlerSources.length === 0 && (
							<div className="col-xs-12" style={{ height: '140px' }}>
								<LoadingIndicator
									customColor={gcOrange}
									inline={true}
									containerStyle={{ height: '140px', textAlign: 'center' }}
								/>
							</div>
						)}
					</GameChangerThumbnailRow>
					<GameChangerThumbnailRow
						links={recentSearches}
						title="Recent Searches"
						width="300px"
					>
						{recentSearches.map((search) =>
							renderRecentSearches(search, state, dispatch)
						)}
					</GameChangerThumbnailRow>
					<GameChangerThumbnailRow
						links={searchMajorPubs}
						title="Popular Publications"
						width="215px"
					>
						{searchMajorPubs.length > 0 &&
							searchMajorPubs[0].imgSrc &&
							searchMajorPubs.map((pub) => (
								<div className="topPublication">
									{pub.imgSrc !== 'error' ? (
										<img
											className="image"
											src={pub.imgSrc}
											alt="thumbnail"
											title={pub.name}
										/>
									) : (
										<div className="image">{pub.name}</div>
									)}

									<div
										className="hover-overlay"
										onClick={() => {
											trackEvent(
												getTrackingNameForFactory(cloneData.clone_name),
												'PublicationOpened',
												pub.name
											);
											// window.open(`/#/pdfviewer/gamechanger?filename=${name}&pageNumber=${1}&isClone=${true}&cloneIndex=${cloneData.clone_name}`)
											window.open(
												`#/gamechanger-details?cloneName=${cloneData.clone_name}&type=document&documentName=${pub.id}`
											);
										}}
									>
										<div className="hover-text">{formatString(pub.name)}</div>
									</div>
								</div>
							))}
						{searchMajorPubs.length > 0 &&
							searchMajorPubs[0].imgSrc === undefined && (
							<div className="col-xs-12">
								<LoadingIndicator customColor={gcOrange} />
							</div>
						)}
						{searchMajorPubs.length === 0 && (
							<div className="col-xs-12">
								<LoadingIndicator
									customColor={gcOrange}
									inline={true}
									containerStyle={{
										height: '300px',
										textAlign: 'center',
										paddingTop: '75px',
										paddingBottom: '75px',
									}}
								/>
							</div>
						)}
					</GameChangerThumbnailRow>
				</div>
			</div>
		);
	},

	getExtraViewPanels(props) {
		const { context } = props;

		const { state } = context;

		const viewPanels = defaultMainViewHandler.getExtraViewPanels(props);
		viewPanels.push({
			panelName: 'Graph',
			panel: (
				<div key={'graphView'}>
					{!state.loading && (
						<StyledCenterContainer showSideFilters={state.showSideFilters}>
							{state.showSideFilters && (
								<div className={'left-container'}>
									<div className={'side-bar-container'}>
										<div className={'filters-container sidebar-section-title'}>
											FILTERS
										</div>
										<GameChangerSearchMatrix context={context} />
										{state.sidebarDocTypes.length > 0 &&
											state.sidebarOrgs.length > 0 && (
											<>
												<div className={'sidebar-section-title'}>RELATED</div>
												<GameChangerSideBar
													context={context}
													cloneData={state.cloneData}
												/>
											</>
										)}
									</div>
								</div>
							)}
							<div className={'right-container'}>
								<DefaultGraphView context={context} />
							</div>
						</StyledCenterContainer>
					)}
				</div>
			),
		});

		return viewPanels;
	},

	getCardViewPanel(props) {
		const { context } = props;
		const { state, dispatch } = context;
		const {
			activeCategoryTab,
			cloneData,
			componentStepNumbers,

			count,
			docSearchResults,
			resultsPage,
			docsLoading,
			docsPagination,

			entityCount,
			entitySearchResults,
			entityPage,

			topicCount,
			topicSearchResults,
			topicPage,

			hideTabs,
			iframePreviewLink,
			isCachedResult,
			loading,
			selectedCategories,
			showSideFilters,
			sidebarOrgs,
			sidebarDocTypes,
			timeSinceCache,
		} = state;

		let sideScroll = {
			height: '72vh',
		};
		if (!iframePreviewLink) sideScroll = {};
		const cacheTip = `Cached result from ${
			timeSinceCache > 0
				? timeSinceCache + ' hour(s) ago'
				: 'less than an hour ago'
		}`;

		return (
			<div key={'cardView'}>
				<div key={'cardView'} style={{ marginTop: hideTabs ? 40 : 'auto' }}>
					<div>
						<div id="game-changer-content-top" />
						{!loading && (
							<StyledCenterContainer showSideFilters={showSideFilters}>
								{showSideFilters && (
									<div className={'left-container'}>
										<div className={'side-bar-container'}>
											<GameChangerSearchMatrix context={context} />
											{sidebarDocTypes.length > 0 && sidebarOrgs.length > 0 && (
												<>
													<div className={'sidebar-section-title'}>RELATED</div>
													<GameChangerSideBar
														context={context}
														cloneData={cloneData}
													/>
												</>
											)}
										</div>
									</div>
								)}
								<div className={'right-container'}>
									{!hideTabs && <ViewHeader {...props} />}
									<div
										className={`row tutorial-step-${componentStepNumbers['Search Results Section']} card-container`}
										style={{ padding: 0 }}
									>
										<div
											className={'col-xs-12'}
											style={{ ...sideScroll, padding: 0 }}
										>
											<div
												className="row"
												style={{ marginLeft: 0, marginRight: 0, padding: 0 }}
											>
												{!loading && <GetQAResults context={context} />}
											</div>
											{!loading &&
												(activeCategoryTab === 'Documents' ||
													activeCategoryTab === 'all') &&
												selectedCategories['Documents'] && (
												<div
													className={'col-xs-12'}
													style={{
														marginTop: 10,
														marginLeft: 0,
														marginRight: 0,
													}}
												>
													<SearchSection
														section={'Documents'}
														color={'#131E43'}
													>
														{activeCategoryTab === 'all' ? (
															<>
																{!docsLoading && !docsPagination ? (
																	getSearchResults(
																		docSearchResults,
																		state,
																		dispatch
																	)
																) : (
																	<div className="col-xs-12">
																		<LoadingIndicator
																			customColor={gcOrange}
																		/>
																	</div>
																)}
																<div className="col-xs-12 text-center">
																	<Pagination
																		activePage={resultsPage}
																		itemsCountPerPage={RESULTS_PER_PAGE}
																		totalItemsCount={count}
																		pageRangeDisplayed={8}
																		onChange={async (page) => {
																			trackEvent(
																				getTrackingNameForFactory(
																					state.cloneData.clone_name
																				),
																				'PaginationChanged',
																				'page',
																				page
																			);
																			setState(dispatch, {
																				docsLoading: true,
																				resultsPage: page,
																				docsPagination: true,
																			});
																		}}
																	/>
																</div>
															</>
														) : (
															<>
																{getSearchResults(
																	docSearchResults,
																	state,
																	dispatch
																)}
																{docsPagination && (
																	<div className="col-xs-12">
																		<LoadingIndicator
																			customColor={gcOrange}
																			containerStyle={{
																				margin: '-100px auto',
																			}}
																		/>
																	</div>
																)}
															</>
														)}
													</SearchSection>
												</div>
											)}

											{entitySearchResults &&
												entitySearchResults.length > 0 &&
												(activeCategoryTab === 'Organizations' ||
													activeCategoryTab === 'all') &&
												selectedCategories['Organizations'] && (
												<div
													className={'col-xs-12'}
													style={{
														marginTop: 10,
														marginLeft: 0,
														marginRight: 0,
													}}
												>
													<SearchSection
														section={'Organizations'}
														color={'#376f94'}
													>
														{getSearchResults(
															entitySearchResults,
															state,
															dispatch
														)}
														<div className="col-xs-12 text-center">
															<Pagination
																activePage={entityPage}
																itemsCountPerPage={RESULTS_PER_PAGE}
																totalItemsCount={entityCount}
																pageRangeDisplayed={8}
																onChange={async (page) => {
																	trackEvent(
																		getTrackingNameForFactory(
																			state.cloneData.clone_name
																		),
																		'PaginationChanged',
																		'page',
																		page
																	);
																	setState(dispatch, {
																		entitiesLoading: true,
																		entityPage: page,
																		entityPagination: true,
																	});
																}}
															/>
														</div>
													</SearchSection>
												</div>
											)}

											{topicSearchResults &&
												topicSearchResults.length > 0 &&
												(activeCategoryTab === 'Topics' ||
													activeCategoryTab === 'all') &&
												selectedCategories['Topics'] && (
												<div
													className={'col-xs-12'}
													style={{
														marginTop: 10,
														marginLeft: 0,
														marginRight: 0,
													}}
												>
													<SearchSection section={'Topics'} color={'#4da593'}>
														{getSearchResults(
															topicSearchResults,
															state,
															dispatch
														)}
														<div className="col-xs-12 text-center">
															<Pagination
																activePage={topicPage}
																itemsCountPerPage={RESULTS_PER_PAGE}
																totalItemsCount={topicCount}
																pageRangeDisplayed={8}
																onChange={async (page) => {
																	trackEvent(
																		getTrackingNameForFactory(
																			state.cloneData.clone_name
																		),
																		'PaginationChanged',
																		'page',
																		page
																	);
																	// setState(dispatch, {entitiesLoading: true, entityPage: page, entityPagination: true });
																}}
															/>
														</div>
													</SearchSection>
												</div>
											)}
										</div>
									</div>
								</div>
							</StyledCenterContainer>
						)}
						{isCachedResult && (
							<div style={styles.cachedResultIcon}>
								<GCTooltip title={cacheTip} placement="right" arrow>
									<i
										style={{ cursor: 'pointer' }}
										className="fa fa-bolt fa-2x"
									/>
								</GCTooltip>
							</div>
						)}
						{Permissions.isGameChangerAdmin() && !loading && (
							<div style={styles.cachedResultIcon}>
								<i
									style={{ cursor: 'pointer' }}
									className="fa fa-rocket"
									onClick={() =>
										setState(dispatch, { showEsQueryDialog: true })
									}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	},
};

export default PolicyMainViewHandler;
