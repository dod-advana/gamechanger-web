import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { styles } from '../../mainView/commonStyles';
import { handleDidYouMeanClicked, getUserProfilePage } from '../../mainView/commonFunctions';
import GameChangerSearchMatrix from '../../searchMetrics/GCSearchMatrix';
import {
	getMainView,
	handlePageLoad as defaultHandlePageLoad,
	getViewNames as defaultGetViewNames,
} from '../default/defaultMainViewHandler';
import ViewHeader from '../../mainView/ViewHeader';
import { trackEvent } from '../../telemetry/Matomo';
import { Typography } from '@material-ui/core';
import {
	setState,
	handleSaveFavoriteTopic,
	getNonMainPageOuterContainer,
	getUserData,
	handleSaveFavoriteDocument,
	handleDeleteFavoriteSearch,
	handleClearFavoriteSearchNotification,
	handleSaveFavoriteSearchHistory,
	handleSaveFavoriteOrganization,
} from '../../../utils/sharedFunctions';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import SearchSection from '../globalSearch/SearchSection';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { gcOrange } from '../../common/gc-colors';
import { Card } from '../../cards/GCCard';
import { DidYouMean } from '../../searchBar/SearchBarStyledComponents';
import Pagination from 'react-js-pagination';
import GCTooltip from '../../common/GCToolTip';
import GetQAResults from '../default/qaResults';
import {
	getQueryVariable,
	getTrackingNameForFactory,
	PAGE_DISPLAYED,
	RESULTS_PER_PAGE,
	StyledCenterContainer,
} from '../../../utils/gamechangerUtils';
import DocumentIcon from '../../../images/icon/Document.png';
import OrganizationIcon from '../../../images/icon/Organization.png';
import ApplicationsIcon from '../../../images/icon/slideout-menu/applications icon.png';
import {
	// TrendingSearchContainer,
	RecentSearchContainer,
	SourceContainer,
} from '../../mainView/HomePageStyledComponents';
import GameChangerThumbnailRow from '../../mainView/ThumbnailRow';
import '../../mainView/main-view.css';
import DefaultSeal from '../../mainView/img/GC Default Seal.png';
import DefaultPub from '../../mainView/img/default_cov.png';
import SearchHandlerFactory from '../../factories/searchHandlerFactory';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';

const _ = require('lodash');

const PolicyDocumentExplorer = LoadableVisibility({
	loader: () => import('./policyDocumentExplorer'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const GCUserDashboard = LoadableVisibility({
	loader: () => import('./userDashboard'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const AnalystTools = LoadableVisibility({
	loader: () => import('../../analystTools'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const GCDataStatusTracker = LoadableVisibility({
	loader: () => import('../../dataTracker/GCDataStatusTracker'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const GCAboutUs = LoadableVisibility({
	loader: () => import('../../aboutUs/GCAboutUs'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const DefaultGraphView = LoadableVisibility({
	loader: () => import('../../graph/defaultGraphView'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const GameChangerSideBar = LoadableVisibility({
	loader: () => import('../../searchMetrics/GCSideBar'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const getSearchResults = (searchResultData, state, dispatch) => {
	return _.map(searchResultData, (item, idx) => {
		return <Card key={idx} item={item} idx={idx} state={state} dispatch={dispatch} />;
	});
};

const createFilteredPubs = (docs) => {
	return docs.map((name) => ({
		name,
		doc_filename: name,
		img_filename: name + '.png',
		id: name + '.pdf_0',

		imgSrc: DefaultPub,
	}));
};

const getImagesForFilteredPubs = async (filteredPubs, state, gameChangerAPI, cancelToken) => {
	filteredPubs.forEach(async (pub) => {
		await gameChangerAPI
			.thumbnailStorageDownloadPOST([pub], 'thumbnails', state.cloneData, cancelToken)
			.then((pngs) => {
				const buffers = pngs.data;
				buffers.forEach((buf) => {
					if (buf.status === 'fulfilled') {
						pub.imgSrc = 'data:image/png;base64,' + buf.value;
					} else {
						pub.imgSrc = DefaultPub;
					}
				});
			})
			.catch(() => {
				//Do nothing
			});
	});

	return filteredPubs;
};

const recRecentlyViewedOnClick = (cloneData, dispatch, pub) => {
	trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'PublicationOpened', pub.name);
	pub.imgSrc !== DefaultPub
		? window.open(`#/gamechanger-details?cloneName=${cloneData.clone_name}&type=document&documentName=${pub.id}`)
		: setState(dispatch, { searchText: pub.name, runSearch: true });
};

const renderRecentSearches = (search, state, dispatch) => {
	const {
		searchText,
		orgFilterString,
		publicationDateAllTime,
		publicationDateFilter,
		typeFilterString,
		includeRevoked,
		run_at,
	} = search;

	const formattedSourceFilter = orgFilterString.length === 0 ? 'All' : orgFilterString.join(', ');
	const formattedTypeFilter = typeFilterString.length === 0 ? 'All' : typeFilterString.join(', ');
	const formattedPublicationDate = publicationDateAllTime
		? 'All'
		: publicationDateFilter.map((isoDate) => isoDate.substr(0, 10)).join(' - ');

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
				<GCTooltip title={searchText} placement="top" arrow>
					<Typography
						style={{
							...styles.containerText,
							...styles.overflowEllipsis,
						}}
					>
						{searchText}
					</Typography>
				</GCTooltip>
			</div>
			<GCTooltip title={formattedSourceFilter} placement="top" arrow>
				<Typography
					style={{
						...styles.subtext,
						...styles.overflowEllipsis,
					}}
				>
					<strong>Source Filter: </strong>
					{formattedSourceFilter}
				</Typography>
			</GCTooltip>
			<GCTooltip title={formattedTypeFilter} placement="top" arrow>
				<Typography
					style={{
						...styles.subtext,
						...styles.overflowEllipsis,
					}}
				>
					<strong>Type Filter: </strong>
					{formattedTypeFilter}
				</Typography>
			</GCTooltip>
			<Typography style={styles.subtext}>
				<strong>Publication Date: </strong>
				{formattedPublicationDate}
			</Typography>
			<Typography style={styles.subtext}>
				<strong>Include Canceled: </strong>
				{includeRevoked ? 'Yes' : 'No'}
			</Typography>
			<Typography style={styles.subtext}>
				<strong>Search Time: </strong>
				{moment(Date.parse(run_at)).utc().format('YYYY-MM-DD HH:mm UTC')}
			</Typography>
		</RecentSearchContainer>
	);
};

const handlePopPubs = async (pop_pubs, pop_pubs_inactive, state, dispatch, cancelToken, gameChangerAPI) => {
	let filteredPubs = _.filter(pop_pubs, (item) => {
		return !_.includes(pop_pubs_inactive, item.id);
	});
	try {
		filteredPubs = filteredPubs.map((item) => ({
			...item,
			imgSrc: DefaultPub,
		}));
		const pubsWithImages = await getImagesForFilteredPubs(filteredPubs, state, gameChangerAPI, cancelToken);
		setState(dispatch, { searchMajorPubs: pubsWithImages });
	} catch (e) {
		//Do nothing
		console.log(e);
		setState(dispatch, { searchMajorPubs: filteredPubs });
	}
};

const handleLastOpened = async (last_opened_docs, state, dispatch, cancelToken, gameChangerAPI) => {
	let cleanedDocs = [];
	let filteredPubs = [];

	for (let doc of last_opened_docs) {
		cleanedDocs.push(doc.document.split(' - ')[1].split('.pdf')[0]);
		cleanedDocs = [...new Set(cleanedDocs)];
	}
	try {
		filteredPubs = createFilteredPubs(cleanedDocs);

		const pubsWithImages = await getImagesForFilteredPubs(filteredPubs, state, gameChangerAPI, cancelToken);
		setState(dispatch, { lastOpened: pubsWithImages, loadingLastOpened: false });
	} catch (e) {
		//Do nothing
		console.log(e);
		setState(dispatch, { lastOpened: filteredPubs });
	}
};

const handleRecDocs = async (rec_docs, state, dispatch, cancelToken, gameChangerAPI) => {
	let filteredPubs = [];
	try {
		filteredPubs = createFilteredPubs(rec_docs);

		const pubsWithImages = await getImagesForFilteredPubs(filteredPubs, state, gameChangerAPI, cancelToken);
		setState(dispatch, { recDocs: pubsWithImages, loadingrecDocs: false });
	} catch (e) {
		//Do nothing
		setState(dispatch, { recDocs: filteredPubs });
	}
};

const handleSources = async (state, dispatch, cancelToken, gameChangerAPI) => {
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
				.thumbnailStorageDownloadPOST([thumbnailList[i]], folder, state.cloneData, cancelToken)
				.then((pngs) => {
					const buffers = pngs.data;
					buffers.forEach((buf) => {
						if (buf.status === 'fulfilled') {
							crawlerSources[i].imgSrc = 'data:image/png;base64,' + buf.value;
							if (crawlerSources[i].image_link.split('.').pop() === 'png') {
								crawlerSources[i].imgSrc = 'data:image/png;base64,' + buf.value;
							} else if (crawlerSources[i].image_link.split('.').pop() === 'svg') {
								crawlerSources[i].imgSrc = 'data:image/svg+xml;base64,' + buf.value;
							}
						} else {
							crawlerSources[i].imgSrc = DefaultSeal;
						}
					});
					setState(dispatch, { crawlerSources });
				})
				.catch(() => {
					//Do nothing
				});
		}
	} catch (e) {
		//Do nothing
		console.log(e);
		setState(dispatch, { crawlerSources });
	}
};

const formatString = (text) => {
	return _.truncate(text, { length: 60, separator: /,?\.* +/ });
};

const handlePageLoad = async (props) => {
	const { state, dispatch, gameChangerAPI, cancelToken } = props;
	await defaultHandlePageLoad(props);
	setState(dispatch, { loadingrecDocs: true });
	setState(dispatch, { loadingLastOpened: true });

	let topics = [];
	let pop_pubs = [];
	let pop_pubs_inactive = [];
	let rec_docs = [];

	const { favorite_documents = [], export_history = [], pdf_opened = [] } = state.userData;

	try {
		const { data } = await gameChangerAPI.getHomepageEditorData({
			favorite_documents,
			export_history,
			pdf_opened,
		});
		data.forEach((obj) => {
			if (obj.key === 'homepage_topics') {
				topics = JSON.parse(obj.value);
			} else if (obj.key === 'homepage_popular_docs_inactive') {
				pop_pubs_inactive = JSON.parse(obj.value);
			} else if (obj.key === 'popular_docs') {
				pop_pubs = obj.value;
			} else if (obj.key === 'rec_docs') {
				rec_docs = obj.value;
			}
		});
	} catch (e) {
		// Do nothing
		console.log(e);
	}
	const view = getQueryVariable('view', window.location.hash.toString());
	if (view) {
		if (view === 'graph') {
			setState(dispatch, { adminTopics: topics, currentViewName: 'Graph', runGraphSearch: true });
		} else {
			setState(dispatch, { adminTopics: topics, currentViewName: view });
		}
	} else {
		setState(dispatch, { adminTopics: topics });
	}

	handleSources(state, dispatch, cancelToken, gameChangerAPI);
	handlePopPubs(pop_pubs, pop_pubs_inactive, state, dispatch, cancelToken, gameChangerAPI);
	handleRecDocs(rec_docs, state, dispatch, cancelToken, gameChangerAPI);
	handleLastOpened(pdf_opened, state, dispatch, cancelToken, gameChangerAPI);
};

const recRecentlyViewedMap = (cloneData, dispatch, pub) => {
	return (
		<div className="topPublication">
			{pub.imgSrc !== 'error' ? (
				<img className="image" src={pub.imgSrc} alt="thumbnail" title={pub.name} />
			) : (
				<div className="image">{pub.name}</div>
			)}

			<div className="hover-overlay" onClick={() => recRecentlyViewedOnClick(cloneData, dispatch, pub)}>
				<div className="hover-text">{formatString(pub.name)}</div>
			</div>
		</div>
	);
};

const renderShowDidYouMean = (didYouMean, loading, state, dispatch) => {
	const showDidYouMean = didYouMean && !loading;

	return (
		<>
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
					<DidYouMean onClick={() => handleDidYouMeanClicked(didYouMean, state, dispatch)}>
						{didYouMean}
					</DidYouMean>
					?
				</div>
			)}
		</>
	);
};

const renderPrevSearchText = (prevSearchText, resetSettingsSwitch, dispatch, searchHandler, state) => {
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

	return (
		<>
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
		</>
	);
};

const renderHideTabs = (props) => {
	const { state, dispatch, searchHandler } = props;
	const {
		adminTopics,
		// searchMajorPubs,
		recDocs,
		loadingrecDocs,
		cloneData,
		crawlerSources,
		prevSearchText,
		resetSettingsSwitch,
		didYouMean,
		loading,
		userData,
		recentSearches,
		trending,
		lastOpened = [],
		loadingLastOpened = true,
	} = state;

	const { favorite_topics = [], favorite_searches = [] } = userData;

	let trendingLinks = [];

	trending?.data?.forEach((search) => {
		if (search.search) {
			trendingLinks.push({
				search: search.search.replaceAll('&#039;', '"'),
				count: search.count,
				favorite: false,
			});
		}
	});

	trendingLinks.forEach(({ search }, idx) => {
		favorite_searches.forEach((fav) => {
			trendingLinks[idx].favorite = fav.search_text === search;
		});
	});

	recentSearches.forEach((search, idx) => {
		favorite_searches.forEach((fav) => {
			recentSearches[idx].favorite = fav.tiny_url === search.tiny_url;
		});
	});

	const favTopicNames = favorite_topics.map((item) => item.topic_name.toLowerCase());
	adminTopics.forEach((topic, idx) => {
		const topicMatchesAdmin = _.find(favTopicNames, (item) => {
			return item === topic.name.toLowerCase();
		});
		adminTopics[idx].favorite = !!topicMatchesAdmin;
	});

	return (
		<div style={{ marginTop: '40px' }}>
			{renderPrevSearchText(prevSearchText, resetSettingsSwitch, dispatch, searchHandler, state)}
			{renderShowDidYouMean(didYouMean, loading, state, dispatch)}
			<div style={{ margin: '0 70px 0 70px' }}>
				<GameChangerThumbnailRow links={recentSearches} title="Recent Searches" width="300px">
					{recentSearches.map((search) => renderRecentSearches(search, state, dispatch))}
				</GameChangerThumbnailRow>
				<GameChangerThumbnailRow links={lastOpened} title="Recently Viewed" width="215px">
					{lastOpened.length > 0 &&
						lastOpened[0].imgSrc &&
						lastOpened.map((pub) => recRecentlyViewedMap(cloneData, dispatch, pub))}
					{loadingLastOpened && lastOpened.length === 0 && (
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
					{!loadingLastOpened && lastOpened.length === 0 && (
						<div className="col-xs-12" style={{ height: '140px' }}>
							<Typography style={styles.containerText}>No recent documents to show.</Typography>
						</div>
					)}
				</GameChangerThumbnailRow>
				<GameChangerThumbnailRow links={recDocs} title="Recommended For You" width="215px">
					{recDocs.length > 0 &&
						recDocs[0].imgSrc &&
						recDocs.map((pub) => recRecentlyViewedMap(cloneData, dispatch, pub))}
					{loadingrecDocs && recDocs.length === 0 && (
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
					{!loadingrecDocs && recDocs.length === 0 && (
						<div className="col-xs-12" style={{ height: '140px' }}>
							<Typography style={styles.containerText}>
								Try favoriting more documents to see your personalized recommendations.
							</Typography>
						</div>
					)}
				</GameChangerThumbnailRow>
				<GameChangerThumbnailRow links={crawlerSources} title="Sources" width="300px">
					{crawlerSources.length > 0 &&
						crawlerSources[0].imgSrc &&
						crawlerSources.map((source) => (
							<SourceContainer
								onClick={() => {
									trackEvent(
										getTrackingNameForFactory(cloneData.clone_name),
										'SourceOpened',
										source.data_source_s
									);
									window.open(
										`#/gamechanger-details?cloneName=${
											cloneData.clone_name
										}&type=source&sourceName=${source.data_source_s.toLowerCase()}`
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
									{source.data_source_s}
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
				{/*<GameChangerThumbnailRow links={trendingLinks} title={'Trending Searches'} width={'300px'}>
					{trendingLinks.map(({ search }, idx) => (
						<TrendingSearchContainer
							onClick={() => {
								setState(dispatch, { searchText: search, runSearch: true });
							}}
						>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									wordSpacing: 3,
									letterSpacing: 2,
									marginTop: 8,
								}}
							>
								<GCTooltip title={search.length < 18 ? '' : search} placement="top" arrow>
									<Typography
										style={{
											...styles.containerText,
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											overflow: 'hidden',
										}}
									>
										<i className="fa fa-search" style={{ marginRight: 12 }} />
										{`   ${idx + 1}. ${search}`}
									</Typography>
								</GCTooltip>
							</div>
						</TrendingSearchContainer>
					))}
				</GameChangerThumbnailRow>*/}
				{/*<GameChangerThumbnailRow
					links={adminTopics}
					title={"Editor's Choice: Top Topics"}
					width="100px"
					style={{ marginLeft: '0' }}
				>
					{adminTopics.map((item) => (
						<div
							style={styles.checkboxPill}
							onClick={() => {
								trackEvent(getTrackingNameForFactory(cloneData.clone_name), 'TopicOpened', item.name);
								window.open(
									`#/gamechanger-details?cloneName=${
										cloneData.clone_name
									}&type=topic&topicName=${item.name.toLowerCase()}`
								);
							}}
						>
							{item.name}
							{ <i // begin comment
								className={item.favorite ? 'fa fa-star' : 'fa fa-star-o'}
								style={{
									color: item.favorite ? '#E9691D' : 'rgb(224,224,224)',
									marginLeft: 10,
									cursor: 'pointer',
									fontSize: 20,
								}}
								onClick={(event) => {
									event.stopPropagation();
									handleSaveFavoriteTopic(item.name.toLowerCase(), '', !item.favorite, dispatch);
								}}
							/> } // end comment
						</div>
					))}
				</GameChangerThumbnailRow>*/}
				{/*<GameChangerThumbnailRow links={searchMajorPubs} title="Popular Publications" width="215px">
					{searchMajorPubs.length > 0 &&
						searchMajorPubs[0].imgSrc &&
						searchMajorPubs.map((pub) => (
							<div className="topPublication">
								{pub.imgSrc !== 'error' ? (
									<img className="image" src={pub.imgSrc} alt="thumbnail" title={pub.name} />
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
				</GameChangerThumbnailRow>*/}
			</div>
		</div>
	);
};

const getViewNames = (props) => {
	const viewNames = defaultGetViewNames(props);
	viewNames.push({
		name: 'Graph',
		title: 'Graph View',
		id: 'gcOpenGraphView',
	});
	return viewNames;
};

const getExtraViewPanels = (props) => {
	const { context } = props;
	const { state, dispatch } = context;
	const { count } = state;
	const viewPanels = [];
	viewPanels.push({
		panelName: 'Explorer',
		panel: (
			<StyledCenterContainer showSideFilters={false}>
				<div className={'right-container'} style={{ ...styles.tabContainer, margin: '0', height: '800px' }}>
					<ViewHeader
						{...props}
						extraStyle={{ margin: `20px 0 0 ${state.docsExplorerLeftPanelOpen ? '470' : '0'}px` }}
						resultsText=" "
					/>
					<PolicyDocumentExplorer
						handleSearch={() => setState(dispatch, { runSearch: true })}
						totalCount={count}
						resultsPerPage={RESULTS_PER_PAGE}
						onPaginationClick={async (page) => {
							setState(dispatch, {
								docsLoading: true,
								resultsPage: page,
								docsPagination: true,
							});
						}}
						isClone={true}
						state={state}
						dispatch={dispatch}
					/>
				</div>
			</StyledCenterContainer>
		),
	});
	viewPanels.push({
		panelName: 'Graph',
		panel: (
			<div key={'graphView'}>
				{!state.loading && (
					<StyledCenterContainer showSideFilters={state.showSideFilters}>
						{state.showSideFilters && (
							<div className={'left-container'}>
								<div className={'side-bar-container'}>
									<div className={'filters-container sidebar-section-title'}>FILTERS</div>
									<GameChangerSearchMatrix context={context} />
									{state.sidebarDocTypes.length > 0 && state.sidebarOrgs.length > 0 && (
										<>
											<div className={'sidebar-section-title'}>RELATED</div>
											<GameChangerSideBar context={context} cloneData={state.cloneData} />
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
};

const renderResults = ({
	resultsType,
	searchResults,
	activeCategoryTab,
	selectedCategories,
	state,
	dispatch,
	page,
	count,
	cloneData,
	icon,
}) => {
	return (
		<>
			{searchResults &&
				searchResults.length > 0 &&
				(activeCategoryTab === resultsType || activeCategoryTab === 'all') &&
				selectedCategories[resultsType] && (
					<div
						className={'col-xs-12'}
						style={{
							marginTop: 10,
							marginLeft: 0,
							marginRight: 0,
							paddingRight: 0,
							paddingLeft: 0,
						}}
					>
						<SearchSection section={resultsType} color={'#376f94'} icon={icon}>
							{getSearchResults(searchResults, state, dispatch)}
							<div className="gcPagination col-xs-12 text-center">
								<Pagination
									activePage={page}
									itemsCountPerPage={RESULTS_PER_PAGE}
									totalItemsCount={count}
									pageRangeDisplayed={8}
									onChange={async (tmpPage) => {
										trackEvent(
											getTrackingNameForFactory(cloneData.clone_name),
											'PaginationChanged',
											'page',
											tmpPage
										);
										switch (resultsType) {
											case 'Organizations':
												setState(dispatch, {
													entitiesLoading: true,
													entityPage: tmpPage,
													entityPagination: true,
												});
												break;
											case 'Topics':
												setState(dispatch, {
													topicsLoading: true,
													topicPage: tmpPage,
													topicPagination: true,
												});
												break;
											default:
												break;
										}
									}}
								/>
							</div>
						</SearchSection>
					</div>
				)}
		</>
	);
};

const renderMainDocs = (props) => {
	const { context } = props;
	const { state, dispatch } = context;
	const {
		activeCategoryTab,
		cloneData,
		count,
		docSearchResults,
		resultsPage,
		docsLoading,
		docsPagination,
		loading,
		selectedCategories,
		searchSettings,
	} = state;

	let renderResultsOrLoading;
	if (!docsLoading && !docsPagination) {
		renderResultsOrLoading = getSearchResults(docSearchResults, state, dispatch);
	} else {
		renderResultsOrLoading = (
			<div className="col-xs-12">
				<LoadingIndicator customColor={gcOrange} />
			</div>
		);
	}

	let renderCategoryOrAll;
	if (activeCategoryTab === 'all') {
		renderCategoryOrAll = (
			<>
				{renderResultsOrLoading}
				<div className="gcPagination col-xs-12 text-center">
					<Pagination
						activePage={resultsPage}
						itemsCountPerPage={RESULTS_PER_PAGE}
						totalItemsCount={count}
						pageRangeDisplayed={8}
						onChange={async (page) => {
							trackEvent(
								getTrackingNameForFactory(cloneData.clone_name),
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
		);
	} else {
		renderCategoryOrAll = (
			<>
				{getSearchResults(docSearchResults, state, dispatch)}
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
		);
	}

	return (
		<>
			{!loading &&
				(activeCategoryTab === 'Documents' || activeCategoryTab === 'all') &&
				selectedCategories['Documents'] && (
					<div
						className={'col-xs-12'}
						style={{
							marginTop: 10,
							marginLeft: 0,
							marginRight: 0,
							paddingRight: 0,
							paddingLeft: 0,
						}}
					>
						{!searchSettings.isFilterUpdate ? (
							<SearchSection section={'Documents'} color={'#131E43'} icon={DocumentIcon}>
								{renderCategoryOrAll}
							</SearchSection>
						) : (
							<div className="col-xs-12">
								<LoadingIndicator customColor={gcOrange} />
							</div>
						)}
					</div>
				)}
		</>
	);
};

const renderResultView = (props) => {
	const { context } = props;
	const { state, dispatch } = context;
	const {
		activeCategoryTab,
		cloneData,
		componentStepNumbers,
		entityCount,
		entitySearchResults,
		entityPage,
		topicCount,
		topicSearchResults,
		topicPage,
		hideTabs,
		iframePreviewLink,
		loading,
		selectedCategories,
		showSideFilters,
		sidebarOrgs,
		sidebarDocTypes,
		rawSearchResults,
	} = state;

	let sideScroll = {};
	if (iframePreviewLink) {
		sideScroll = {
			height: '72vh',
		};
	}

	return (
		<>
			{!loading && !Boolean(rawSearchResults?.length === 0) && (
				<StyledCenterContainer showSideFilters={showSideFilters}>
					{showSideFilters && (
						<div className={'left-container'}>
							<div className={'side-bar-container'}>
								<GameChangerSearchMatrix context={context} />
								{sidebarDocTypes.length > 0 && sidebarOrgs.length > 0 && (
									<>
										<div className={'sidebar-section-title'}>RELATED</div>
										<GameChangerSideBar context={context} cloneData={cloneData} />
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
							<div className={'col-xs-12'} style={{ ...sideScroll, padding: 0 }}>
								<div className="row" style={{ marginLeft: 0, marginRight: 0, padding: 0 }}>
									{!loading && <GetQAResults context={context} />}
								</div>

								{renderMainDocs(props)}

								{renderResults({
									resultsType: 'Organizations',
									searchResults: entitySearchResults.filter(
										(result) => result.type === 'organization'
									),
									activeCategoryTab,
									selectedCategories,
									state,
									dispatch,
									page: entityPage,
									count: entityCount,
									cloneData,
									icon: OrganizationIcon,
								})}

								{renderResults({
									resultsType: 'Topics',
									searchResults: topicSearchResults,
									activeCategoryTab,
									selectedCategories,
									state,
									dispatch,
									page: topicPage,
									count: topicCount,
									cloneData,
									icon: ApplicationsIcon,
								})}
							</div>
						</div>
					</div>
				</StyledCenterContainer>
			)}
		</>
	);
};

const getCardViewPanel = (props) => {
	const { context } = props;
	const { state, dispatch } = context;
	const { hideTabs, isCachedResult, loading, timeSinceCache, rawSearchResults } = state;

	const cacheTip = `Cached result from ${
		timeSinceCache > 0 ? timeSinceCache + ' hour(s) ago' : 'less than an hour ago'
	}`;

	return (
		<div key={'cardView'}>
			<div key={'cardView'} style={{ marginTop: hideTabs ? 40 : 'auto' }}>
				<div>
					<div id="game-changer-content-top" />
					{renderResultView(props)}
					{isCachedResult && (
						<div style={styles.cachedResultIcon}>
							<GCTooltip title={cacheTip} placement="right" arrow>
								<i style={{ cursor: 'pointer' }} className="fa fa-bolt fa-2x" />
							</GCTooltip>
						</div>
					)}
					{Permissions.isGameChangerAdmin() && !loading && !Boolean(rawSearchResults?.length === 0) && (
						<div style={styles.cachedResultIcon}>
							<i
								style={{ cursor: 'pointer' }}
								className="fa fa-rocket"
								onClick={() => setState(dispatch, { showEsQueryDialog: true })}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const getAboutUs = (props) => {
	const { state, dispatch } = props;
	return <GCAboutUs state={state} dispatch={dispatch} initialTab="about" />;
};

const getFAQ = (props) => {
	const { state, dispatch } = props;
	return <GCAboutUs state={state} dispatch={dispatch} initialTab="faq" />;
};

const getAnalystTools = (context) => {
	return <AnalystTools context={context} />;
};

const getDataTracker = (state) => {
	return <GCDataStatusTracker state={state} />;
};

const getGCUserDashboard = (props) => {
	const { state, dispatch } = props;
	return (
		<GCUserDashboard
			state={state}
			userData={state.userData}
			updateUserData={() => getUserData(dispatch)}
			handleSaveFavoriteDocument={(document) => handleSaveFavoriteDocument(document, state, dispatch)}
			handleDeleteSearch={(search) => handleDeleteFavoriteSearch(search, dispatch)}
			handleClearFavoriteSearchNotification={(search) => handleClearFavoriteSearchNotification(search, dispatch)}
			saveFavoriteSearch={(favoriteName, favoriteSummary, favorite, tinyUrl, searchText, count) =>
				handleSaveFavoriteSearchHistory(
					favoriteName,
					favoriteSummary,
					favorite,
					tinyUrl,
					searchText,
					count,
					dispatch
				)
			}
			handleFavoriteTopic={({ topic_name, topic_summary, favorite }) =>
				handleSaveFavoriteTopic(topic_name, topic_summary, favorite, dispatch)
			}
			handleFavoriteOrganization={({ organization_name, organization_summary, favorite }) =>
				handleSaveFavoriteOrganization(organization_name, organization_summary, favorite, dispatch)
			}
			cloneData={state.cloneData}
			dispatch={dispatch}
		/>
	);
};

const PolicyMainViewHandler = (props) => {
	const { state, dispatch, cancelToken, setCurrentTime, gameChangerUserAPI, gameChangerAPI } = props;

	const [pageLoaded, setPageLoaded] = useState(false);
	const [searchHandler, setSearchHandler] = useState();

	useEffect(() => {
		const shouldRunPagination = (type) => {
			return Boolean(type && searchHandler);
		};

		if (shouldRunPagination(state.docsPagination)) {
			const replaceResults = state.currentViewName === 'Explorer' ? true : state.replaceResults;
			searchHandler.handleDocPagination(state, dispatch, replaceResults);
		}
		if (shouldRunPagination(state.entityPagination)) {
			searchHandler.handleEntityPagination(state, dispatch);
		}
		if (shouldRunPagination(state.topicPagination)) {
			searchHandler.handleTopicPagination(state, dispatch);
		}
	}, [state, dispatch, searchHandler]);

	useEffect(() => {
		if (state.cloneDataSet && state.historySet && !pageLoaded && state.userDataSet) {
			const searchFactory = new SearchHandlerFactory(state.cloneData.search_module);
			const tmpSearchHandler = searchFactory.createHandler();

			setSearchHandler(tmpSearchHandler);

			handlePageLoad({
				state,
				dispatch,
				history: state.history,
				searchHandler: tmpSearchHandler,
				cancelToken,
				gameChangerAPI,
				gameChangerUserAPI,
			});
			setState(dispatch, { viewNames: getViewNames({ cloneData: state.cloneData }) });
			setPageLoaded(true);
		}
	}, [cancelToken, dispatch, gameChangerAPI, gameChangerUserAPI, pageLoaded, state]);

	const getViewPanels = () => {
		const viewPanels = { Card: getCardViewPanel({ context: { state, dispatch } }) };

		const extraViewPanels = getExtraViewPanels({
			context: { state, dispatch },
		});
		extraViewPanels.forEach(({ panelName, panel }) => {
			viewPanels[panelName] = panel;
		});

		return viewPanels;
	};

	switch (state.pageDisplayed) {
		case PAGE_DISPLAYED.analystTools:
			return getNonMainPageOuterContainer(getAnalystTools({ state, dispatch }), state, dispatch);
		case PAGE_DISPLAYED.dataTracker:
			return getNonMainPageOuterContainer(getDataTracker(state), state, dispatch);
		case PAGE_DISPLAYED.userDashboard:
			return getNonMainPageOuterContainer(
				getUserProfilePage(getGCUserDashboard({ state, dispatch }), gameChangerUserAPI),
				state,
				dispatch
			);
		case PAGE_DISPLAYED.aboutUs:
			return getNonMainPageOuterContainer(getAboutUs({ state, dispatch }), state, dispatch);
		case PAGE_DISPLAYED.faq:
			return getNonMainPageOuterContainer(getFAQ({ state, dispatch }), state, dispatch);
		case PAGE_DISPLAYED.main:
		default:
			return getMainView({
				state,
				dispatch,
				setCurrentTime,
				renderHideTabs,
				pageLoaded,
				getViewPanels,
			});
	}
};

export default PolicyMainViewHandler;
