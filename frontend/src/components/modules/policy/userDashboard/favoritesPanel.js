import React, { useState, useEffect } from 'react';
import Config from '../../../../config/config';
import GCAccordion from '../../../common/GCAccordion';
import { gcOrange } from '../../../common/gc-colors';
import _ from 'lodash';
import Pagination from 'react-js-pagination';
import { trackEvent } from '../../../telemetry/Matomo';
import { decodeTinyUrl, getTrackingNameForFactory } from '../../../../utils/gamechangerUtils';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import moment from 'moment';
import GCTooltip from '../../../common/GCToolTip';
import Icon from '@material-ui/core/Icon';
import FavoriteCard from '../../../cards/GCFavoriteCard';
import { StyledPlaceHolder } from './userDashboardStyles';
import GCButton from '../../../common/GCButton';
import AddToGroupModal from './AddToGroupModal';

const RESULTS_PER_PAGE = 12;

const FavoritesPanel = ({
	userData,
	cloneData,
	handleFavoriteTopic,
	handleFavoriteOrganization,
	handleSaveFavoriteDocument,
	reload,
	setReload,
	updateUserData,
	classes,
	handleClearFavoriteSearchNotification,
	handleDeleteFavoriteSearch,
	favoriteSearchesSlice,
	setFavoriteSearchesSlice,
	documentGroups,
}) => {
	const [topicFavoritesPage, setTopicFavoritesPage] = useState(1);
	const [organizationFavoritesPage, setOrganizationFavoritesPage] = useState(1);

	const [favoriteTopicsLoading, setFavoriteTopicsLoading] = useState(false);

	const [topicFavoritesTotalCount, setTopicFavoritesTotalCount] = useState(0);
	const [favoriteTopics, setFavoriteTopics] = useState([]);
	const [favoriteTopicsSlice, setFavoriteTopicsSlice] = useState([]);

	const [favoriteOrganizationsLoading, setFavoriteOrganizationsLoading] = useState(false);
	const [organizationFavoritesTotalCount, setOrganizationFavoritesTotalCount] = useState(0);
	const [favoriteOrganizations, setFavoriteOrganizations] = useState([]);
	const [favoriteOrganizationsSlice, setFavoriteOrganizationsSlice] = useState([]);

	const [favoriteSearchesLoading, setFavoriteSearchesLoading] = useState(true);
	const [searchFavoritesPage, setSearchFavoritesPage] = useState(1);
	const [searchFavoritesTotalCount, setSearchFavoritesTotalCount] = useState(0);
	const [favoriteSearches, setFavoriteSearches] = useState([]);

	const [favoriteDocumentsLoading, setFavoriteDocumentsLoading] = useState(true);
	const [documentFavoritesPage, setDocumentFavoritesPage] = useState(1);
	const [documentFavoritesTotalCount, setDocumentFavoritesTotalCount] = useState(0);
	const [favoriteDocuments, setFavoriteDocuments] = useState([]);
	const [favoriteDocumentsSlice, setFavoriteDocumentsSlice] = useState([]);

	const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);

	useEffect(() => {
		if (userData === null) return;

		// Decode url data
		if (userData.favorite_searches) {
			userData.favorite_searches = userData.favorite_searches.filter((search) => {
				const searchArr = search.url.split('?');
				return searchArr[0] === cloneData.url;
			});
			userData.favorite_searches.forEach((search) => {
				const data = decodeTinyUrl(search.url);
				Object.assign(search, data);
			});

			setFavoriteSearches(userData.favorite_searches);
			setSearchFavoritesTotalCount(userData.favorite_searches ? userData.favorite_searches.length : 0);
			setFavoriteSearchesSlice(userData.favorite_searches.slice(0, RESULTS_PER_PAGE));
			setFavoriteSearchesLoading(false);
		}

		if (userData.favorite_documents) {
			setFavoriteDocuments(userData.favorite_documents);
			setDocumentFavoritesTotalCount(userData.favorite_documents ? userData.favorite_documents.length : 0);
			setFavoriteDocumentsSlice(userData.favorite_documents.slice(0, RESULTS_PER_PAGE));
			setFavoriteDocumentsLoading(false);
		}

		if (userData.favorite_topics) {
			setFavoriteTopics(userData.favorite_topics);
			setTopicFavoritesTotalCount(userData.favorite_topics ? userData.favorite_topics.length : 0);
			setFavoriteTopicsSlice(userData.favorite_topics.slice(0, RESULTS_PER_PAGE));
			setFavoriteTopicsLoading(false);
		}

		if (userData.favorite_organizations) {
			setFavoriteOrganizations(userData.favorite_organizations);
			setOrganizationFavoritesTotalCount(
				userData.favorite_organizations ? userData.favorite_organizations.length : 0
			);
			setFavoriteOrganizationsSlice(userData.favorite_organizations.slice(0, RESULTS_PER_PAGE));
			setFavoriteOrganizationsLoading(false);
		}
	}, [userData, cloneData.clone_name, cloneData.url, setFavoriteSearchesSlice]);

	const handleDeleteFavoriteTopic = async (idx) => {
		favoriteTopicsSlice[idx].favorite = false;
		handleFavoriteTopic(favoriteTopicsSlice[idx]);
		updateUserData();
	};

	const renderFavoriteTopicCard = (topic, idx) => {
		const toggleActive = () => {
			topic.active = !topic.active;
		};

		const createdDate = moment(Date.parse(topic.createdAt)).utc().format('YYYY-MM-DD HH:mm UTC');

		const searchDetails = (
			<div className={'stats-details'}>
				<div className={'favorited-date'}>{createdDate}</div>
				<div className={'stats-details-stat-div'}>
					<GCTooltip title={'The number of times this topic has been favorited by others'} placement="top">
						<div className={'stats-stat'}>
							<span className={'stats-text'}>{topic.favorited}</span>
							<Icon className="fa fa-heart-o" />
						</div>
					</GCTooltip>
					<GCTooltip title={'Click to see comments'} placement="top">
						<div className={'stats-comment'}>
							<Icon
								className="fa fa-comment"
								onClick={() => {
									toggleActive();
									setReload(!reload);
								}}
							/>
						</div>
					</GCTooltip>
				</div>
			</div>
		);

		return (
			<FavoriteCard
				key={`topic-favorite-${idx}`}
				favoriteObject={topic}
				favoriteType={'topic'}
				handleDeleteFavorite={handleDeleteFavoriteTopic}
				details={searchDetails}
				reload={reload}
				setReload={setReload}
				idx={idx}
				toggleActive={toggleActive}
				cloneData={cloneData}
			/>
		);
	};

	const renderTopicFavorites = () => {
		if (favoriteTopicsLoading) {
			return (
				<div style={{ width: '100%', height: '100%' }}>
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={gcOrange} />
					</div>
				</div>
			);
		} else {
			return (
				<div style={{ width: '100%', height: '100%' }}>
					{favoriteTopicsSlice.length > 0 ? (
						<div style={{ height: '100%', overflow: 'hidden', marginBottom: 10 }}>
							<div className={'col-xs-12'} style={{ padding: 0 }}>
								<div className="row" style={{ marginLeft: 0, marginRight: 0 }}>
									{_.map(favoriteTopicsSlice, (topic, idx) => {
										return renderFavoriteTopicCard(topic, idx);
									})}
								</div>
							</div>
						</div>
					) : (
						<StyledPlaceHolder>Favorite a topic to see it listed here</StyledPlaceHolder>
					)}

					{favoriteTopicsSlice.length > 0 && (
						<div className="gcPagination">
							<Pagination
								activePage={topicFavoritesPage}
								itemsCountPerPage={RESULTS_PER_PAGE}
								totalItemsCount={topicFavoritesTotalCount}
								pageRangeDisplayed={8}
								onChange={(page) => {
									trackEvent(
										getTrackingNameForFactory(cloneData.clone_name),
										'UserDashboardTopicFavorites',
										'pagination',
										page
									);
									handlePaginationChange(page, 'topicFavorites');
								}}
							/>
						</div>
					)}
				</div>
			);
		}
	};

	const handleDeleteFavoriteOrganization = async (idx) => {
		favoriteOrganizationsSlice[idx].favorite = false;
		handleFavoriteOrganization(favoriteOrganizationsSlice[idx]);
		updateUserData();
	};

	const renderFavoriteOrganizationCard = (organization, idx) => {
		const toggleActive = () => {
			organization.active = !organization.active;
		};

		const createdDate = moment(Date.parse(organization.createdAt)).utc().format('YYYY-MM-DD HH:mm UTC');

		const searchDetails = (
			<div className={'stats-details'}>
				<div className={'favorited-date'}>{createdDate}</div>
				<div className={'stats-details-stat-div'}>
					<GCTooltip
						title={'The number of times this organization has been favorited by others'}
						placement="top"
					>
						<div className={'stats-stat'}>
							<span className={'stats-text'}>{organization.favorited}</span>
							<Icon className="fa fa-heart-o" />
						</div>
					</GCTooltip>
					<GCTooltip title={'Click to see comments'} placement="top">
						<div className={'stats-comment'}>
							<Icon
								className="fa fa-comment"
								onClick={() => {
									toggleActive();
									setReload(!reload);
								}}
							/>
						</div>
					</GCTooltip>
				</div>
			</div>
		);
		return (
			<FavoriteCard
				key={`organization-favorite-${idx}`}
				favoriteObject={organization}
				favoriteType={'organization'}
				handleDeleteFavorite={handleDeleteFavoriteOrganization}
				details={searchDetails}
				reload={reload}
				setReload={setReload}
				idx={idx}
				toggleActive={toggleActive}
				cloneData={cloneData}
			/>
		);
	};

	const renderOrganizationFavorites = () => {
		if (favoriteOrganizationsLoading) {
			return (
				<div style={{ width: '100%', height: '100%' }}>
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={gcOrange} />
					</div>
				</div>
			);
		} else {
			return (
				<div style={{ width: '100%', height: '100%' }}>
					{favoriteOrganizationsSlice.length > 0 ? (
						<div style={{ height: '100%', overflow: 'hidden', marginBottom: 10 }}>
							<div className={'col-xs-12'} style={{ padding: 0 }}>
								<div className="row" style={{ marginLeft: 0, marginRight: 0 }}>
									{_.map(favoriteOrganizationsSlice, (organization, idx) => {
										return renderFavoriteOrganizationCard(organization, idx);
									})}
								</div>
							</div>
						</div>
					) : (
						<StyledPlaceHolder>Favorite an organization to see it listed here</StyledPlaceHolder>
					)}

					{favoriteOrganizationsSlice.length > 0 && (
						<div className="gcPagination">
							<Pagination
								activePage={organizationFavoritesPage}
								itemsCountPerPage={RESULTS_PER_PAGE}
								totalItemsCount={organizationFavoritesTotalCount}
								pageRangeDisplayed={8}
								onChange={(page) => {
									handlePaginationChange(page, 'organizationFavorites');
								}}
							/>
						</div>
					)}
				</div>
			);
		}
	};

	const handleAcknowledgeUpdatesToDocs = (idx, name) => {
		switch (name) {
			case 'updated':
				favoriteDocuments[idx].updated = !favoriteDocuments[idx].updated;
				break;
			case 'archived':
				favoriteDocuments[idx].archived = !favoriteDocuments[idx].archived;
				break;
			case 'removed':
				favoriteDocuments[idx].removed = !favoriteDocuments[idx].removed;
				break;
			default:
		}
		setReload(!reload);
	};

	const handleDeleteFavoriteDocument = async (idx) => {
		favoriteDocumentsSlice[idx].favorite = false;
		handleSaveFavoriteDocument(favoriteDocumentsSlice[idx]);
		updateUserData();
	};

	const renderFavoriteDocumentCard = (document, idx) => {
		const toggleActive = () => {
			document.active = !document.active;
		};

		const createdDate = moment(Date.parse(document.createdAt)).utc().format('YYYY-MM-DD HH:mm UTC');

		const documentDetails = (
			<>
				<div className={'buttons-div'}>
					<GCButton
						onClick={() => handleAcknowledgeUpdatesToDocs(idx, 'updated')}
						style={{ visibility: document.updated ? null : 'hidden' }}
						buttonColor={'#059FD9'}
						textStyle={{
							color: '#ffffff',
							fontFamily: 'Noto Sans Medium',
							fontSize: 12,
						}}
					>
						Updated
					</GCButton>
					<GCButton
						onClick={() => handleAcknowledgeUpdatesToDocs(idx, 'archived')}
						style={{ visibility: document.archived ? null : 'hidden' }}
						buttonColor={'#32124D'}
						textStyle={{
							color: '#ffffff',
							fontFamily: 'Noto Sans Medium',
							fontSize: 12,
						}}
					>
						Archived
					</GCButton>
					<GCButton
						onClick={() => handleAcknowledgeUpdatesToDocs(idx, 'removed')}
						style={{ visibility: document.removed ? null : 'hidden' }}
						buttonColor={'#E9691D'}
						textStyle={{
							color: '#ffffff',
							fontFamily: 'Noto Sans Medium',
							fontSize: 12,
						}}
					>
						Removed
					</GCButton>
				</div>
				<div className={'stats-details'}>
					<div className={'favorited-date'}>{createdDate}</div>
					<div className={'stats-details-stat-div'}>
						<GCTooltip
							title={'The number of times this document has been favorited by others'}
							placement="top"
						>
							<div className={'stats-stat'}>
								<span className={'stats-text'}>{document.favorited}</span>
								<Icon className="fa fa-heart-o" />
							</div>
						</GCTooltip>
						<GCTooltip title={'Click to see document comments'} placement="top">
							<div className={'stats-comment'}>
								<Icon
									className="fa fa-comment"
									onClick={() => {
										document.active = !document.active;
										setReload(!reload);
									}}
								/>
							</div>
						</GCTooltip>
					</div>
				</div>
			</>
		);

		return (
			<FavoriteCard
				key={`document-favorite-${idx}`}
				favoriteObject={document}
				favoriteType={'document'}
				handleDeleteFavorite={handleDeleteFavoriteDocument}
				details={documentDetails}
				reload={reload}
				setReload={setReload}
				idx={idx}
				toggleActive={toggleActive}
				cloneData={cloneData}
			/>
		);
	};

	const renderDocumentFavorites = () => {
		if (favoriteDocumentsLoading) {
			return (
				<div style={{ width: '100%', height: '100%' }}>
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={gcOrange} />
					</div>
				</div>
			);
		}

		return (
			<div style={{ width: '100%', height: '100%' }}>
				{favoriteDocumentsSlice.length > 0 ? (
					<>
						<div
							style={{
								display: 'flex',
								justifyContent: 'flex-end',
								marginLeft: '40px',
								paddingRight: 0,
								width: '95%',
							}}
						>
							{userData.favorite_groups.length > 0 && (
								<GCButton
									onClick={() => {
										setShowAddToGroupModal(true);
									}}
								>
									Add To Group
								</GCButton>
							)}
						</div>
						<AddToGroupModal
							showAddToGroupModal={showAddToGroupModal}
							setShowAddToGroupModal={setShowAddToGroupModal}
							documentGroups={documentGroups}
							userData={userData}
							updateUserData={updateUserData}
							favoriteDocuments={favoriteDocuments}
							classes={classes}
						/>
						<div style={{ height: '100%', overflow: 'hidden', marginBottom: 10 }}>
							<div className={'col-xs-12'} style={{ padding: 0 }}>
								<div className="row" style={{ marginLeft: 0, marginRight: 0 }}>
									{_.map(favoriteDocumentsSlice, (document, idx) => {
										return renderFavoriteDocumentCard(document, idx);
									})}
								</div>
							</div>
						</div>
					</>
				) : (
					<StyledPlaceHolder>Favorite a document to see it listed here</StyledPlaceHolder>
				)}

				{favoriteDocumentsSlice.length > 0 && (
					<div className="gcPagination">
						<Pagination
							activePage={documentFavoritesPage}
							itemsCountPerPage={RESULTS_PER_PAGE}
							totalItemsCount={documentFavoritesTotalCount}
							pageRangeDisplayed={8}
							onChange={(page) => {
								trackEvent(
									getTrackingNameForFactory(cloneData.clone_name),
									'UserDashboardDocumentFavorites',
									'pagination',
									page
								);
								handlePaginationChange(page, 'documentsFavorites');
							}}
						/>
					</div>
				)}
			</div>
		);
	};

	const _handleClearFavoriteSearchNotification = async (idx) => {
		favoriteSearchesSlice[idx].updated_results = false;
		handleClearFavoriteSearchNotification(favoriteSearchesSlice[idx]);
		updateUserData();
	};

	const renderFavoriteSearchCard = (search, idx) => {
		const toggleActive = () => {
			search.active = !search.active;
		};

		const createdDate = moment(Date.parse(search.createdAt)).utc().format('YYYY-MM-DD HH:mm UTC');

		const searchDetails = (
			<>
				<GCTooltip title={search.search_text} placement="top">
					<div className={'search-text'}>
						Search Text:{' '}
						{search.search_text.length > 55 ? search.search_text.slice(0, 40) + '...' : search.search_text}
					</div>
				</GCTooltip>
				<div className={'stats-details'}>
					<div className={'favorited-date'}>{createdDate}</div>
					<div className={'stats-details-stat-div'}>
						<GCTooltip title={'Number of documents found in search'} placement="top">
							<div className={'stats-stat'}>
								<span className={'stats-text'}>{search.document_count}</span>
								<Icon className="fa fa-file-pdf-o" />
							</div>
						</GCTooltip>
						<GCTooltip title={''} placement="top">
							<div className={'stats-stat'}>
								{/* <span className={'stats-text'}>{search.favorited}</span> */}
								<Icon className="fa fa-share" />
							</div>
						</GCTooltip>
						<GCTooltip title={'Click to see comments'} placement="top">
							<div className={'stats-comment'}>
								<Icon
									className="fa fa-comment"
									onClick={() => {
										toggleActive();
										setReload(!reload);
									}}
								/>
							</div>
						</GCTooltip>
					</div>
				</div>
			</>
		);

		const searchOverlayText = <div>{search.search_summary}</div>;

		const revoked = search.isRevoked ? 'true' : 'false';

		const searchSettings =
			cloneData.clone_name === 'gamechanger' ? (
				<>
					<div style={{ textAlign: 'left', margin: '0 0 10px 0' }}>
						<span style={{ fontWeight: 'bold' }}>Source Filter:</span> {search.orgFilterText}
					</div>
					<div style={{ textAlign: 'left', margin: '0 0 10px 0' }}>
						<span style={{ fontWeight: 'bold' }}>Type Filter:</span> {search.typeFilterText}
					</div>
					<div style={{ textAlign: 'left', margin: '0 0 10px 0' }}>
						<span style={{ fontWeight: 'bold' }}>Publication Date:</span> {search.pubDate}
					</div>
					<div style={{ textAlign: 'left', margin: '0 0 10px 0' }}>
						<span style={{ fontWeight: 'bold' }}>Include Canceled:</span> {revoked}
					</div>
				</>
			) : (
				<>
					<div style={{ textAlign: 'left', margin: '0 0 10px 0' }}>
						<span style={{ fontWeight: 'bold' }}>Search Text:</span> {search.search_text}
					</div>
					<div style={{ textAlign: 'left', margin: '0 0 10px 0' }}>
						<span style={{ fontWeight: 'bold' }}>Source:</span> {search.orgFilterText}
					</div>
				</>
			);

		return (
			<FavoriteCard
				key={`search-favorite-${idx}`}
				favoriteObject={{ ...search, summary: searchSettings, overlayText: searchOverlayText }}
				favoriteType={'search'}
				handleDeleteFavorite={handleDeleteFavoriteSearch}
				handleClearFavoriteSearchNotification={_handleClearFavoriteSearchNotification}
				details={searchDetails}
				reload={reload}
				setReload={setReload}
				idx={idx}
				toggleActive={toggleActive}
				cloneData={cloneData}
			/>
		);
	};

	const renderSearchFavorites = () => {
		if (favoriteSearchesLoading) {
			return (
				<div style={{ width: '100%', height: '100%' }}>
					<div style={{ margin: '0 auto' }}>
						<LoadingIndicator customColor={gcOrange} />
					</div>
				</div>
			);
		}

		return (
			<div style={{ width: '100%', height: '100%' }}>
				{favoriteSearchesSlice.length > 0 ? (
					<div style={{ height: '100%', overflow: 'hidden', marginBottom: 10 }}>
						<div className={'col-xs-12'} style={{ padding: 0 }}>
							<div className="row" style={{ marginLeft: 0, marginRight: 0 }}>
								{_.map(favoriteSearchesSlice, (search, idx) => {
									return renderFavoriteSearchCard(search, idx);
								})}
							</div>
						</div>
					</div>
				) : (
					<StyledPlaceHolder>Favorite a search to see it listed here</StyledPlaceHolder>
				)}

				{favoriteSearchesSlice.length > 0 && (
					<div className="gcPagination">
						<Pagination
							activePage={searchFavoritesPage}
							itemsCountPerPage={RESULTS_PER_PAGE}
							totalItemsCount={searchFavoritesTotalCount}
							pageRangeDisplayed={8}
							onChange={(page) => {
								trackEvent(
									getTrackingNameForFactory(cloneData.clone_name),
									'UserDashboardSearchFavorites',
									'pagination',
									page
								);
								handlePaginationChange(page, 'searchFavorites');
							}}
						/>
					</div>
				)}
			</div>
		);
	};

	const handlePaginationChange = (page, panel) => {
		switch (panel) {
			case 'searchHistory':
				break;
			case 'exportHistory':
				break;
			case 'searchFavorites':
				setSearchFavoritesPage(page);
				setFavoriteSearchesSlice(
					favoriteSearches.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE)
				);
				break;
			case 'documentsFavorites':
				setDocumentFavoritesPage(page);
				setFavoriteDocumentsSlice(
					favoriteDocuments.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE)
				);
				break;
			case 'topicFavorites':
				setTopicFavoritesPage(page);
				setFavoriteTopicsSlice(favoriteTopics.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE));
				break;
			case 'organizationFavorites':
				setOrganizationFavoritesPage(page);
				setFavoriteOrganizationsSlice(
					favoriteOrganizations.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE)
				);
				break;
			default:
		}
	};

	return (
		<div>
			{/* {Config.GAMECHANGER.SHOW_TOPICS && cloneData.clone_name === 'gamechanger' && (
				<GCAccordion expanded={false} header={'FAVORITE TOPICS'} itemCount={topicFavoritesTotalCount}>
					{renderTopicFavorites()}
				</GCAccordion>
			)}
			{cloneData.clone_name === 'gamechanger' && (
				<GCAccordion
					expanded={false}
					header={'FAVORITE ORGANIZATIONS'}
					itemCount={organizationFavoritesTotalCount}
				>
					{renderOrganizationFavorites()}
				</GCAccordion>
			)} */}
			{cloneData.clone_name === 'gamechanger' && (
				<GCAccordion expanded={false} header={'FAVORITE DOCUMENTS'} itemCount={documentFavoritesTotalCount}>
					{renderDocumentFavorites()}
				</GCAccordion>
			)}

			<GCAccordion expanded={true} header={'FAVORITE SEARCHES'} itemCount={searchFavoritesTotalCount}>
				{renderSearchFavorites()}
			</GCAccordion>
		</div>
	);
};

export default FavoritesPanel;
