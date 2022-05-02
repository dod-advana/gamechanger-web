import React, { useEffect, useState } from 'react';
import moment from 'moment';
import GameChangerSearchMatrix from '../../searchMetrics/GCSearchMatrix';
import GameChangerSideBar from '../../searchMetrics/GCSideBar';
import DefaultGraphView from '../../graph/defaultGraphView';
import {
	getMainView,
	handleDidYouMeanClicked,
	styles,
	handlePageLoad as defaultHandlePageLoad,
	getViewNames as defaultGetViewNames,
} from '../default/defaultMainViewHandler';
import PolicyDocumentExplorer from './policyDocumentExplorer';
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
	checkUserInfo,
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
	TrendingSearchContainer,
	RecentSearchContainer,
	SourceContainer,
} from '../../mainView/HomePageStyledComponents';
import GameChangerThumbnailRow from '../../mainView/ThumbnailRow';
import GameChangerAPI from '../../api/gameChanger-service-api';
import '../../mainView/main-view.css';
import DefaultSeal from '../../mainView/img/GC Default Seal.png';
import DefaultPub from '../../mainView/img/default_cov.png';
import GamechangerUserManagementAPI from '../../api/GamechangerUserManagement';
import SearchHandlerFactory from '../../factories/searchHandlerFactory';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';
import GCUserDashboard from '../../user/GCUserDashboard';
const _ = require('lodash');

const gameChangerAPI = new GameChangerAPI();
const gcUserManagementAPI = new GamechangerUserManagementAPI();

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

const getSearchResults = (searchResultData, state, dispatch) => {
	return _.map(searchResultData, (item, idx) => {
		return <Card key={idx} item={item} idx={idx} state={state} dispatch={dispatch} />;
	});
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
			</div>
			<Typography style={styles.subtext}>
				<strong>Source Filter: </strong>
				{orgFilterString.length === 0 ? 'All' : orgFilterString.join(', ')}
			</Typography>
			<Typography style={styles.subtext}>
				<strong>Type Filter: </strong>
				{typeFilterString.length === 0 ? 'All' : typeFilterString.join(', ')}
			</Typography>
			<Typography style={styles.subtext}>
				<strong>Publication Date: </strong>
				{publicationDateAllTime ? 'All' : publicationDateFilter.join(' - ')}
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

const handlePopPubs = async (pop_pubs, pop_pubs_inactive, state, dispatch, cancelToken) => {
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
				.thumbnailStorageDownloadPOST([filteredPubs[i]], 'thumbnails', state.cloneData, cancelToken)
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
				})
				.catch((e) => {
					//Do nothing
				});
		}
	} catch (e) {
		//Do nothing
		console.log(e);
		setState(dispatch, { searchMajorPubs: filteredPubs });
	}
};

const handleLastOpened = async (last_opened_docs, state, dispatch, cancelToken) => {
	let cleanedDocs = [];
	let filteredPubs = [];

	for (let doc of last_opened_docs) {
		cleanedDocs.push(doc.document.split(' - ')[1].split('.pdf')[0]);
		cleanedDocs = [...new Set(cleanedDocs)];
	}
	try {
		filteredPubs = cleanedDocs.map((name) => ({
			name,
			doc_filename: name,
			img_filename: name + '.png',
			id: name + '.pdf_0',

			imgSrc: DefaultPub,
		}));

		setState(dispatch, { lastOpened: filteredPubs });
		setState(dispatch, { loadingLastOpened: false });

		for (let i = 0; i < filteredPubs.length; i++) {
			gameChangerAPI
				.thumbnailStorageDownloadPOST([filteredPubs[i]], 'thumbnails', state.cloneData, cancelToken)
				.then((pngs) => {
					const buffers = pngs.data;
					buffers.forEach((buf, idx) => {
						if (buf.status === 'fulfilled') {
							filteredPubs[i].imgSrc = 'data:image/png;base64,' + buf.value;
						} else {
							filteredPubs[i].imgSrc = DefaultPub;
						}
					});
					setState(dispatch, { lastOpened: filteredPubs });
				})
				.catch((e) => {
					//Do nothing
				});
		}
	} catch (e) {
		//Do nothing
		console.log(e);
		setState(dispatch, { lastOpened: filteredPubs });
	}
};

const handleRecDocs = async (rec_docs, state, dispatch, cancelToken) => {
	let filteredPubs = [];
	try {
		filteredPubs = rec_docs.map((name) => ({
			name,
			doc_filename: name,
			img_filename: name + '.png',
			id: name + '.pdf_0',

			imgSrc: DefaultPub,
		}));
		setState(dispatch, { recDocs: filteredPubs });
		setState(dispatch, { loadingrecDocs: false });

		for (let i = 0; i < filteredPubs.length; i++) {
			gameChangerAPI
				.thumbnailStorageDownloadPOST([filteredPubs[i]], 'thumbnails', state.cloneData, cancelToken)
				.then((pngs) => {
					const buffers = pngs.data;
					buffers.forEach((buf, idx) => {
						if (buf.status === 'fulfilled') {
							filteredPubs[i].imgSrc = 'data:image/png;base64,' + buf.value;
						} else {
							filteredPubs[i].imgSrc = DefaultPub;
						}
					});
					setState(dispatch, { recDocs: filteredPubs });
				})
				.catch((e) => {
					//Do nothing
				});
		}
	} catch (e) {
		//Do nothing
		console.log(e);
		setState(dispatch, { recDocs: filteredPubs });
	}
};

const handleSources = async (state, dispatch, cancelToken) => {
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
					buffers.forEach((buf, idx) => {
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
				.catch((e) => {
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

const handlePageLoad = async (props) => {
	const { state, dispatch } = props;
	await defaultHandlePageLoad(props);
	setState(dispatch, { loadingrecDocs: true });
	setState(dispatch, { loadingLastOpened: true });

	let topics = [];
	let pop_pubs = [];
	let pop_pubs_inactive = [];
	let rec_docs = [];

	const user = await gcUserManagementAPI.getUserData();
	const { favorite_documents = [], export_history = [], pdf_opened = [] } = user.data;

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
	setState(
		dispatch,
		getQueryVariable('view', window.location.hash.toString()) === 'graph'
			? { adminTopics: topics, currentViewName: 'Graph', runGraphSearch: true }
			: { adminTopics: topics }
	);
	// handlePubs(pubs, state, dispatch);
	handleSources(state, dispatch, props.cancelToken);
	handlePopPubs(pop_pubs, pop_pubs_inactive, state, dispatch, props.cancelToken);
	handleRecDocs(rec_docs, state, dispatch, props.cancelToken);
	handleLastOpened(pdf_opened, state, dispatch, props.cancelToken);
};

const renderHideTabs = (props) => {
	const { state, dispatch, searchHandler } = props;
	const {
		adminTopics,
		searchMajorPubs,
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

	const showDidYouMean = didYouMean && !loading;
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

	if (trending) {
		trending.data.forEach((search) => {
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

	const favTopicNames = favorite_topics.map((item) => item.topic_name.toLowerCase());
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
					<DidYouMean onClick={() => handleDidYouMeanClicked(didYouMean, state, dispatch)}>
						{didYouMean}
					</DidYouMean>
					?
				</div>
			)}
			<div style={{ margin: '0 70px 0 70px' }}>
				<GameChangerThumbnailRow links={trendingLinks} title={'Trending Searches'} width={'300px'}>
					{trendingLinks.map(({ search, favorite, count }, idx) => (
						<TrendingSearchContainer
							onClick={() => setState(dispatch, { searchText: search, runSearch: true })}
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
								<Typography style={styles.containerText}>
									<i className="fa fa-search" style={{ marginRight: 12 }} />
									{`   ${idx + 1}. ${search.length < 18 ? search : search.substring(0, 20) + '...'}`}
								</Typography>
							</div>
						</TrendingSearchContainer>
					))}
				</GameChangerThumbnailRow>
				<GameChangerThumbnailRow
					links={adminTopics}
					title={"Editor's Choice: Top Topics"}
					width="100px"
					style={{ marginLeft: '0' }}
				>
					{adminTopics.map((item, idx) => (
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
									handleSaveFavoriteTopic(item.name.toLowerCase(), '', !item.favorite, dispatch);
								}}
							/>
						</div>
					))}
				</GameChangerThumbnailRow>
				<GameChangerThumbnailRow links={recDocs} title="Recommended For You" width="215px">
					{recDocs.length > 0 &&
						recDocs[0].imgSrc &&
						recDocs.map((pub) => (
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
										pub.imgSrc !== DefaultPub
											? window.open(
													`#/gamechanger-details?cloneName=${cloneData.clone_name}&type=document&documentName=${pub.id}`
											  )
											: setState(dispatch, { searchText: pub.name, runSearch: true });
									}}
								>
									<div className="hover-text">{formatString(pub.name)}</div>
								</div>
							</div>
						))}
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
				<GameChangerThumbnailRow links={lastOpened} title="Recently Viewed" width="215px">
					{lastOpened.length > 0 &&
						lastOpened[0].imgSrc &&
						lastOpened.map((pub) => (
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
										pub.imgSrc !== DefaultPub
											? window.open(
													`#/gamechanger-details?cloneName=${cloneData.clone_name}&type=document&documentName=${pub.id}`
											  )
											: setState(dispatch, { searchText: pub.name, runSearch: true });
									}}
								>
									<div className="hover-text">{formatString(pub.name)}</div>
								</div>
							</div>
						))}
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
				<GameChangerThumbnailRow links={recentSearches} title="Recent Searches" width="300px">
					{recentSearches.map((search) => renderRecentSearches(search, state, dispatch))}
				</GameChangerThumbnailRow>
				<GameChangerThumbnailRow links={searchMajorPubs} title="Popular Publications" width="215px">
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
				</GameChangerThumbnailRow>
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
	const { cloneData, count, docSearchResults, resultsPage, loading, prevSearchText, searchText } = state;
	const viewPanels = [];
	viewPanels.push({
		panelName: 'Explorer',
		panel: (
			<StyledCenterContainer showSideFilters={false}>
				<div className={'right-container'} style={{ ...styles.tabContainer, margin: '0', height: '800px' }}>
					<ViewHeader {...props} mainStyles={{ margin: '20px 0 0 0' }} resultsText=" " />
					<PolicyDocumentExplorer
						handleSearch={() => setState(dispatch, { runSearch: true })}
						data={docSearchResults}
						searchText={searchText}
						prevSearchText={prevSearchText}
						totalCount={count}
						loading={loading}
						resultsPage={resultsPage}
						resultsPerPage={RESULTS_PER_PAGE}
						onPaginationClick={(page) => {
							setState(dispatch, { resultsPage: page, runSearch: true });
						}}
						isClone={true}
						cloneData={cloneData}
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

const getCardViewPanel = (props) => {
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
		searchSettings,
		rawSearchResults,
	} = state;

	let sideScroll = {
		height: '72vh',
	};
	if (!iframePreviewLink) sideScroll = {};
	const cacheTip = `Cached result from ${
		timeSinceCache > 0 ? timeSinceCache + ' hour(s) ago' : 'less than an hour ago'
	}`;

	return (
		<div key={'cardView'}>
			<div key={'cardView'} style={{ marginTop: hideTabs ? 40 : 'auto' }}>
				<div>
					<div id="game-changer-content-top" />
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
														<SearchSection
															section={'Documents'}
															color={'#131E43'}
															icon={DocumentIcon}
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
																			<LoadingIndicator customColor={gcOrange} />
																		</div>
																	)}
																	<div className="gcPagination col-xs-12 text-center">
																		<Pagination
																			activePage={resultsPage}
																			itemsCountPerPage={RESULTS_PER_PAGE}
																			totalItemsCount={count}
																			pageRangeDisplayed={8}
																			onChange={async (page) => {
																				trackEvent(
																					getTrackingNameForFactory(
																						cloneData.clone_name
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
													) : (
														<div className="col-xs-12">
															<LoadingIndicator customColor={gcOrange} />
														</div>
													)}
												</div>
											)}

										{entitySearchResults &&
											entitySearchResults.length > 0 &&
											(activeCategoryTab === 'Organizations' || activeCategoryTab === 'all') &&
											selectedCategories['Organizations'] && (
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
													<SearchSection
														section={'Organizations'}
														color={'#376f94'}
														icon={OrganizationIcon}
													>
														{getSearchResults(entitySearchResults, state, dispatch)}
														<div className="gcPagination col-xs-12 text-center">
															<Pagination
																activePage={entityPage}
																itemsCountPerPage={RESULTS_PER_PAGE}
																totalItemsCount={entityCount}
																pageRangeDisplayed={8}
																onChange={async (page) => {
																	trackEvent(
																		getTrackingNameForFactory(cloneData.clone_name),
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
											(activeCategoryTab === 'Topics' || activeCategoryTab === 'all') &&
											selectedCategories['Topics'] && (
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
													<SearchSection
														section={'Topics'}
														color={'#4da593'}
														icon={ApplicationsIcon}
													>
														{getSearchResults(topicSearchResults, state, dispatch)}
														<div className="gcPagination col-xs-12 text-center">
															<Pagination
																activePage={topicPage}
																itemsCountPerPage={RESULTS_PER_PAGE}
																totalItemsCount={topicCount}
																pageRangeDisplayed={8}
																onChange={async (page) => {
																	trackEvent(
																		getTrackingNameForFactory(cloneData.clone_name),
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
	const { state } = props;
	return <GCAboutUs state={state} />;
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
			checkUserInfo={() => {
				return checkUserInfo(state, dispatch);
			}}
			dispatch={dispatch}
		/>
	);
};

const PolicyMainViewHandler = (props) => {
	const { state, dispatch, cancelToken, setCurrentTime } = props;

	const [pageLoaded, setPageLoaded] = useState(false);
	const [userProfileHandler, setUserProfileHandler] = useState();

	useEffect(() => {
		if (state.cloneDataSet && state.historySet && !pageLoaded) {
			const searchFactory = new SearchHandlerFactory(state.cloneData.search_module);
			const searchHandler = searchFactory.createHandler();

			handlePageLoad({ state, dispatch, history: state.history, searchHandler, cancelToken });
			setState(dispatch, { viewNames: getViewNames({ cloneData: state.cloneData }) });
			setPageLoaded(true);
		}
	}, [cancelToken, dispatch, pageLoaded, state]);

	const getViewPanels = () => {
		const viewPanels = { Card: getCardViewPanel({ context: { state, dispatch } }) };

		const extraViewPanels = getExtraViewPanels({ context: { state, dispatch } });
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
			return getNonMainPageOuterContainer(getUserProfilePage(getGCUserDashboard), state, dispatch);
		case PAGE_DISPLAYED.aboutUs:
			return getNonMainPageOuterContainer(getAboutUs({ state }), state, dispatch);
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
