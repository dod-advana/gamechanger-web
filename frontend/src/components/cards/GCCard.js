import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import _ from 'lodash';
import { CARD_FONT_SIZE, getTrackingNameForFactory } from '../../utils/gamechangerUtils';
import GCTooltip from '../common/GCToolTip';
import '../../components/common/magellan-table.css';
import './keyword-result-card.css';
import { trackEvent } from '../telemetry/Matomo';
import { makeStyles } from '@material-ui/core/styles';
import GCButton from '../common/GCButton';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import {
	handleSaveFavoriteDocument,
	handleSaveFavoriteTopic,
	handleSaveFavoriteOrganization,
	setState,
} from '../../utils/sharedFunctions';
import Fade from '@material-ui/core/Fade';
import GameChangerAPI from '../api/gameChanger-service-api';
import CloseIcon from '@material-ui/icons/Close';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';
import { Checkbox } from '@material-ui/core';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { gcOrange } from '../common/gc-colors';

const DefaultCardHandler = LoadableVisibility({
	loader: () => import('../modules/default/defaultCardHandler'),
	loading: () => {
		return <LoadingIndicator />;
	},
});

const CDOCardHandler = LoadableVisibility({
	loader: () => import('../modules/cdo/cdoCardHandler'),
	loading: () => {
		return <LoadingIndicator />;
	},
});

const EDACardHandler = LoadableVisibility({
	loader: () => import('../modules/eda/edaCardHandler'),
	loading: () => {
		return <LoadingIndicator />;
	},
});

const GlobalSearchCardHandler = LoadableVisibility({
	loader: () => import('../modules/globalSearch/globalSearchCardHandler'),
	loading: () => {
		return <LoadingIndicator />;
	},
});

const HermesCardHandler = LoadableVisibility({
	loader: () => import('../modules/hermes/hermesCardHandler'),
	loading: () => {
		return <LoadingIndicator />;
	},
});
const AmhsCardHandler = LoadableVisibility({
	loader: () => import('../modules/amhs/amhsCardHandler'),
	loading: () => {
		return <LoadingIndicator />;
	},
});
const JBookCardHandler = LoadableVisibility({
	loader: () => import('../modules/jbook/jbookCardHandler'),
	loading: () => {
		return <LoadingIndicator customColor={'#1C2D65'} />;
	},
});

const JexnetCardHandler = LoadableVisibility({
	loader: () => import('../modules/jexnet/jexnetCardHandler'),
	loading: () => {
		return <LoadingIndicator />;
	},
});

const PolicyCardHandler = LoadableVisibility({
	loader: () => import('../modules/policy/policyCardHandler'),
	loading: () => {
		return <LoadingIndicator customColor={gcOrange} />;
	},
});

const CARD_HEIGHT = 412;

// Internet Explorer 6-11
const IS_IE = /*@cc_on!@*/ !!document.documentMode;

// Edge 20+
const IS_EDGE = !IS_IE && !!window.StyleMedia;

const gameChangerAPI = new GameChangerAPI();

const StyledCardContainer = styled.div`
	width: ${({ listView, showSideFilters, graphView }) => {
		if (graphView) {
			return listView ? '100%' : '414px';
		} else {
			if (showSideFilters) {
				return listView ? '100%' : '33.33% !important';
			} else {
				return listView ? '100%' : '25% !important';
			}
		}
	}};
	min-width: ${({ listView }) => (listView ? '' : '351px')};
	padding-right: 5px !important;
	padding-left: 5px !important;

	.styled-card-container {
		min-height: ${({ listView }) => (listView ? 70 : CARD_HEIGHT)}px;
		height: ${({ listView }) => (listView ? 'auto' : '280px')};
		margin: ${({ listView }) => (listView ? 'auto' : '')};
		background-color: transparent;
		border: solid 4px transparent;
		perspective: 1000px;

		hr {
			background-color: rgb(151, 151, 151);
			height: 1px;
		}

		.styled-card-inner {
			margin-bottom: 8px;
			font-family: 'Noto Sans';
			text-align: left;
			background-color: transparent;
			border-radius: 5px;
			display: flex;
			border: ${({ listView, isRevoked, selected }) => {
				if (listView) {
					return 'none';
				} else {
					if (isRevoked) {
						return selected ? '2px solid #386F94' : '2px solid #e50000';
					} else {
						return selected ? '2px solid #386F94' : '2px solid rgb(224, 224, 224)';
					}
				}
			}};
			box-shadow: ${({ listView, selected }) => {
				if (listView) {
					return 'none';
				} else {
					return !selected ? 'none' : '#386F94 0px 0px 2px 2px';
				}
			}};
			transition: ${({ listView }) =>
				listView ? 'transform .5s !important;' : 'box-shadow .2s, transform .5s !important'};
			transform: ${({ toggledMore }) => (toggledMore ? 'rotateY(180deg)' : '')};
			transform-style: preserve-3d !important;
			position: relative;
			width: 100%;
			height: 100%;

			&:hover {
				box-shadow: #386f94 0px 0px 2px 2px !important;
			}

			.styled-card-inner-front {
				display: ${({ toggledMore }) => (toggledMore ? 'none' : '')};
				position: ${({ listView }) => (listView ? 'static' : 'absolute')};
				width: 100%;
				height: 100%;
				backface-visibility: hidden;

				.styled-card-inner-wrapper {
					display: flex;
					height: 100%;
					flex-direction: column;
					border-radius: 5px;
					overflow: auto;
					background-color: ${({ listView, intelligentSearch }) => {
						if (intelligentSearch) {
							return listView ? '#9BB1C8' : 'rgb(238,241,242)';
						} else {
							return listView ? 'white' : 'rgb(238,241,242)';
						}
					}};

					.styled-card-front-content {
						font-size: ${CARD_FONT_SIZE}px;
						font-family: 'Noto Sans';
						position: relative;
						padding: 5px 5px;
						display: inline-block;
						overflow: ${({ allowScroll }) => (allowScroll ? 'auto' : 'hidden')};
					}

					.styled-card-front-buttons {
						margin-top: auto;
						display: flex;
						border-top: ${({ listView }) => (listView ? '' : '1px solid rgb(189, 189, 189)')};
						align-items: center;
						padding: 0px 10px;
						min-height: 60px;
						justify-content: flex-end;
						overflow: hidden;

						.styled-action-buttons-group {
							flex: 1 1 0%;
							justify-content: flex-end;
							display: flex;
							align-items: center;
						}
					}
				}
			}

			.styled-card-inner-back {
				transform: rotateY(180deg);
				box-shadow: none;
				position: absolute;
				width: 100%;
				height: 100%;
				backface-visibility: hidden;

				.styled-card-inner-wrapper {
					display: flex;
					height: 100%;
					flex-direction: column;
					border-radius: 5px;
					overflow: auto;
					background-color: ${({ listView }) => (listView ? 'white' : 'rgb(238,241,242)')};

					.styled-card-back-content {
						background-color: rgb(238, 241, 242);
						display: block;
						overflow: auto;
						height: 100%;
					}

					.styled-card-back-buttons {
						margin-top: auto;
						display: flex;
						border-top: 1px solid rgb(189, 189, 189);
						align-items: center;
						padding: 0px 10px;
						min-height: 60px;
						justify-content: flex-end;
						overflow: hidden;

						.styled-action-buttons-group {
							flex: 1 1 0%;
							justify-content: flex-end;
							display: flex;
							align-items: center;
						}
					}
				}
			}
		}
	}
`;

const CloseButton = styled.div`
	padding: 6px;
	background-color: white;
	border-radius: 5px;
	color: #8091a5 !important;
	border: 1px solid #b0b9be;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 0.4;
	position: absolute;
	right: 15px;
	top: 15px;
`;

const styles = {
	container: {
		marginBottom: 5,
		fontFamily: 'Noto Sans',
		textAlign: 'left',
		backgroundColor: 'transparent',
		borderRadius: '5px',
		display: 'flex',
	},
	innerContainer: {
		display: 'flex',
		height: '100%',
		flexDirection: 'column',
		borderRadius: '5px',
		overflow: 'auto',
	},
	icon: {
		width: '25px',
		margin: '0 10px 0 0',
	},
	tab: {
		display: 'flex',
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		cursor: 'pointer',
		border: '1px solid rgb(224, 224, 224)',
		fontWeight: 600,
	},
	infoCircleDiv: {
		flexGrow: 1,
	},
	tooltipRow: {
		display: 'flex',
		justifyContent: 'space-between',
		textAlign: 'center',
		width: '100%',
		maxWidth: '100px',
		marginRight: 'auto',
	},
};

const useStyles = makeStyles((theme) => ({
	root: {
		padding: 0,

		'&:hover': {
			backgroundColor: 'transparent',
		},
	},
	paper: {
		border: '1px solid',
		padding: theme.spacing(1),
		backgroundColor: theme.palette.background.paper,
	},
	textField: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		marginTop: '14px',
		paddingBottom: '8px',
		height: 'auto',
		width: '322px',
		'& .MuiFormHelperText-root': {
			fontSize: 14,
			marginLeft: 'unset',
		},
		'& .MuiInputBase-root': {
			'& .MuiInputBase-input': {
				height: '24px',
				fontSize: '14px',
			},
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-disabled fieldset': {
				borderColor: (props) => (props.error ? 'red' : 'inherit'),
			},
		},
	},
	textArea: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		marginTop: '14px',
		paddingBottom: '8px',
		height: 'auto',
		width: '322px',
		'& .MuiFormHelperText-root': {
			fontSize: 14,
			marginLeft: 'unset',
		},
		'& .MuiInputBase-root': {
			'& .MuiInputBase-input': {
				fontSize: '14px',
			},
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-disabled fieldset': {
				borderColor: (props) => (props.error ? 'red' : 'inherit'),
			},
		},
	},
	infoCircle: {
		fontSize: 25,
		color: 'rgb(56, 111, 148)',
		fontWeight: 'normal',
		alignSelf: 'center',
		flexGrow: 1,
		'&:hover': {
			color: 'rgb(0, 48, 143)',
			cursor: 'pointer',
		},
	},
	feedback: {
		fontSize: 25,
		flexGrow: 1,
		justifyContent: 'center',
		'-webkit-text-stroke': '1px #808080',
		'&:hover': {
			cursor: 'pointer',
			'-webkit-text-stroke': '1px black',
		},
	},
}));

const FavoriteComponent = (props) => {
	const { cardType, state, dispatch, filename, item, idx, displayTitle, classes } = props;

	const [favorite, setFavorite] = useState(false);
	const [favoriteSummary, setFavoriteSummary] = useState('');
	const [favorite_id, setFavoriteId] = useState(null);
	const [popperIsOpen, setPopperIsOpen] = useState(false);
	const [popperAnchorEl, setPopperAnchorEl] = useState(null);

	useEffect(() => Function.prototype, [popperIsOpen, popperAnchorEl, favorite]);

	useEffect(() => {
		let isFavorite = false;
		let temp_id = null;
		let favApps;
		switch (cardType) {
			case 'document':
				const faveDocs = state.userData ? state.userData.favorite_documents : [];
				const favDocInfo = _.find(faveDocs, (doc) => {
					return doc.id === item.id;
				});
				temp_id = favDocInfo?.favorite_id;
				isFavorite =
					_.find(faveDocs, (doc) => {
						return doc.id === item.id;
					}) !== undefined;
				break;
			case 'topic':
				const faveTopics = state.userData ? state.userData.favorite_topics : [];
				isFavorite =
					_.find(faveTopics, (topic) => {
						return topic.topic_name.toLowerCase() === item.name.toLowerCase();
					}) !== undefined;
				break;
			case 'organization':
				const faveOrganizations = state.userData ? state.userData.favorite_organizations : [];
				isFavorite =
					_.find(faveOrganizations, (organization) => {
						return organization.organization_name.toLowerCase() === item.name.toLowerCase();
					}) !== undefined;
				break;
			case 'applications':
			case 'dashboards':
				favApps = state.favoriteApps || [];
				isFavorite = favApps?.includes(item.id.toString()) || false;
				temp_id = item.id.toString();
				break;
			case 'dataSources':
			case 'databases':
			case 'models':
				favApps = state.favoriteApps || [];
				isFavorite = favApps?.includes(item.resource.id.toString()) || false;
				temp_id = item.resource.id.toString();
				break;
			default:
				break;
		}

		setFavoriteId(temp_id);
		setFavorite(isFavorite);
	}, [cardType, item, state.favoriteApps, state.userData]);

	const handleSaveFavorite = (isFavorite = false) => {
		switch (cardType) {
			case 'document':
				const documentData = {
					filename: filename,
					favorite_summary: favoriteSummary,
					favorite_id: favorite_id,
					favorite_name: '',
					is_favorite: isFavorite,
				};
				handleSaveFavoriteDocument(documentData, state, dispatch);
				break;
			case 'organization':
				handleSaveFavoriteOrganization(item.name, favoriteSummary, isFavorite, dispatch);
				break;
			case 'topic':
				handleSaveFavoriteTopic(item.name, favoriteSummary, isFavorite, dispatch);
				break;
			case 'applications':
			case 'dashboards':
			case 'dataSources':
			case 'databases':
			case 'models':
				let favApps = state.favoriteApps || [];
				if (isFavorite) {
					favApps.push(favorite_id);
				} else {
					favApps = favApps.filter((app) => app !== favorite_id);
				}
				gameChangerAPI.putUserFavoriteHomeApps({ favorite_apps: favApps });
				setState(dispatch, { favoriteApps: favApps, updateSearchFavorites: true });
				break;
			default:
				break;
		}
		setFavorite(isFavorite);
		setPopperAnchorEl(null);
		setPopperIsOpen(false);
		setFavoriteSummary('');
	};

	const openFavoritePopper = (target) => {
		if (popperIsOpen) {
			setPopperIsOpen(false);
			setPopperAnchorEl(null);
		} else {
			setPopperIsOpen(true);
			setPopperAnchorEl(target);
		}
	};

	const handleCancelFavorite = () => {
		setPopperIsOpen(false);
		setPopperAnchorEl(null);
	};

	return (
		<>
			<Popover
				onClose={() => handleCancelFavorite()}
				id={idx}
				open={popperIsOpen}
				anchorEl={popperAnchorEl}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
			>
				{favorite ? (
					<div style={{ padding: '0px 15px 10px' }}>
						<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
							<CloseButton onClick={() => handleCancelFavorite()}>
								<CloseIcon fontSize="small" />
							</CloseButton>
						</div>
						<div style={{ width: 350, margin: 5 }}>
							<div style={{ margin: '65px 15px 0' }}>
								Are you sure you want to delete this favorite? You will lose any comments made.
							</div>
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<GCButton
									onClick={() => handleCancelFavorite()}
									style={{
										height: 40,
										minWidth: 40,
										padding: '2px 8px 0px',
										fontSize: 14,
										margin: '16px 0px 0px 10px',
									}}
									isSecondaryBtn={true}
								>
									No
								</GCButton>
								<GCButton
									onClick={() => {
										handleSaveFavorite(false);
										gameChangerAPI.sendIntelligentSearchFeedback(
											'intelligent_search_cancel_favorite_document',
											displayTitle,
											state.searchText
										);
										trackEvent(
											getTrackingNameForFactory(state.cloneData.clone_name),
											'CancelFavorite',
											filename,
											`search : ${state.searchText}`
										);
									}}
									style={{
										height: 40,
										minWidth: 40,
										padding: '2px 8px 0px',
										fontSize: 14,
										margin: '16px 10px 0px',
										marginRight: 10,
									}}
								>
									Yes
								</GCButton>
							</div>
						</div>
					</div>
				) : (
					<div className={classes.paper}>
						<div style={{ width: 330, margin: 5 }}>
							<TextField
								label={'Favorite Summary'}
								value={favoriteSummary}
								onChange={(event) => {
									setFavoriteSummary(event.target.value);
								}}
								className={classes.textArea}
								margin="none"
								size="small"
								variant="outlined"
								multiline={true}
								rows={8}
							/>
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<GCButton
									onClick={() => handleCancelFavorite()}
									style={{
										height: 40,
										minWidth: 40,
										padding: '2px 8px 0px',
										fontSize: 14,
										margin: '16px 0px 0px 10px',
									}}
									isSecondaryBtn={true}
								>
									Cancel
								</GCButton>
								<GCButton
									onClick={() => {
										handleSaveFavorite(true);
										gameChangerAPI.sendIntelligentSearchFeedback(
											'intelligent_search_favorite_document',
											displayTitle,
											state.searchText
										);
										trackEvent(
											getTrackingNameForFactory(state.cloneData.clone_name),
											'Favorite',
											filename,
											`search : ${state.searchText}`
										);
									}}
									style={{
										height: 40,
										minWidth: 40,
										padding: '2px 8px 0px',
										fontSize: 14,
										margin: '16px 0px 0px 10px',
									}}
								>
									Save
								</GCButton>
							</div>
						</div>
					</div>
				)}
			</Popover>
			<GCTooltip title={`Favorite this ${cardType} to track in the User Dashboard`} placement="top" arrow>
				<i
					onClick={(event) => {
						switch (cardType) {
							case 'applications':
							case 'dashboards':
							case 'dataSources':
							case 'databases':
							case 'models':
								handleSaveFavorite(!favorite);
								break;
							default:
								openFavoritePopper(event.target);
								break;
						}
					}}
					className={favorite ? 'fa fa-star' : 'fa fa-star-o'}
					style={{
						color: favorite ? '#E9691D' : 'rgb(224, 224, 224)',
						marginLeft: 'auto',
						cursor: 'pointer',
						fontSize: 26,
						alignSelf: 'center',
					}}
				/>
			</GCTooltip>
		</>
	);
};

function GCCard(props) {
	const {
		id,
		idx,
		state,
		dispatch,
		item,
		graphView = false,
		closeGraphCard,
		collection = [],
		detailPage = false,
		card_module = null,
	} = props;

	const cardType = item.type;
	const selected = state.selectedDocuments.has(item.filename);

	const isRevoked = item.is_revoked_b;
	const intelligentSearch = item.search_mode && item.search_mode === 'Intelligent Search';
	const allowScroll = true;

	const classes = useStyles();

	const [toggledMore, setToggledMore] = useState(false);
	const [metadataExpanded, setMetadataExpanded] = useState(false);
	const [hitsExpanded, setHitsExpanded] = useState(false);
	const [hoveredHit, setHoveredHit] = useState(0);
	const [favorite, setFavorite] = useState(false);
	const [favoriteSummary, setFavoriteSummary] = useState('');
	const [feedback, setFeedback] = useState('');
	const [loaded, setLoaded] = useState(false);
	const [filename, setFilename] = useState('');
	const [displayTitle, setDisplayTitle] = useState('');
	const [modalOpen, setModalOpen] = useState(false);

	useEffect(() => {
		// Create the factory
		if (cardType && !loaded) {
			setLoaded(true);
			if (cardType === 'organization') {
				gameChangerAPI.getOrgImageOverrideURLs([item.name]).then(({ data }) => {
					item.sealURLOverride = data[item.name];
				});
			}
		}
	}, [state, loaded, cardType, item, card_module]);

	useEffect(() => {
		if (state.listView) {
			setToggledMore(false);
		}
	}, [state.listView]);

	let searchText = state.searchText;

	const checkboxComponent = (key, value, tmpId) => {
		return (
			<GCTooltip title={'Select a document for export'} placement="top" arrow>
				<Checkbox
					style={styles.checkbox}
					onChange={() => handleCheckbox(key, value, tmpId)}
					color="primary"
					icon={
						<CheckBoxOutlineBlankIcon
							style={{ width: 25, height: 25, fill: 'rgb(224, 224, 224)' }}
							fontSize="large"
						/>
					}
					checkedIcon={<CheckBoxIcon style={{ width: 25, height: 25, fill: '#386F94' }} />}
					checked={selected}
					className={`tutorial-step-${state.componentStepNumbers['Search Result Checkbox']}`}
					id={'gcSearchResultCheckbox'}
				/>
			</GCTooltip>
		);
	};

	const handleCheckbox = (key, value, tmpId) => {
		const { selectedDocuments, selectedDocumentsForGraph = [] } = state;
		let newDocArray = [...selectedDocumentsForGraph];

		if (selectedDocuments.has(key)) {
			selectedDocuments.delete(key);
			newDocArray = newDocArray.filter((tmpItem) => tmpItem !== tmpId);
			trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'CardCheckboxUnchecked', key, 0);
		} else {
			selectedDocuments.set(key, value);
			newDocArray.push(tmpId);
			trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'CardCheckboxChecked', key, 1);
		}

		setState(dispatch, {
			selectedDocuments: new Map(selectedDocuments),
			selectedDocumentsForGraph: newDocArray,
		});
	};

	const intelligentFeedbackComponent = () => (
		<div style={styles.tooltipRow}>
			<GCTooltip
				enterDelay={100}
				title={
					<div style={{ textAlign: 'center' }}>
						<span>
							This card was retrieved based on a new machine learning algorithm.{' '}
							{feedback === '' && 'Was this result relevant?'}
						</span>
					</div>
				}
				placement="right"
				arrow
			>
				<i className={classes.infoCircle + ' fa fa-info-circle'} aria-hidden="true" />
			</GCTooltip>
			<Fade in={feedback === ''} timeout={1500}>
				<div style={{ flexGrow: 2, display: 'flex' }}>
					<i
						className={classes.feedback + ' fa fa-thumbs-up'}
						style={{ color: feedback === 'thumbsUp' ? '#238823' : 'white' }}
						onClick={() => {
							if (feedback === '') {
								setFeedback('thumbsUp');
								gameChangerAPI.sendIntelligentSearchFeedback(
									'intelligent_search_thumbs_up',
									displayTitle,
									searchText
								);
								trackEvent(
									getTrackingNameForFactory(state.cloneData.clone_name),
									'thumbsUp',
									filename`search : ${searchText}`
								);
							}
						}}
					/>
					<i
						className={classes.feedback + ' fa fa-thumbs-down'}
						style={{ color: feedback === 'thumbsDown' ? '#D2222D' : 'white' }}
						onClick={() => {
							if (feedback === '') {
								setFeedback('thumbsDown');
								gameChangerAPI.sendIntelligentSearchFeedback(
									'intelligent_search_thumbs_down',
									displayTitle,
									searchText
								);
								trackEvent(
									getTrackingNameForFactory(state.cloneData.clone_name),
									'thumbsDown',
									filename`search : ${searchText}`
								);
							}
						}}
					/>
				</div>
			</Fade>
		</div>
	);

	const getCardComponent = (thisProps) => {
		const module_name = card_module ?? state.cloneData.card_module;

		switch (module_name) {
			case 'policy/policyCardHandler':
				return <PolicyCardHandler {...thisProps} />;
			case 'hermes/hermesCardHandler':
				return <HermesCardHandler {...thisProps} />;
			case 'amhs/amhsCardHandler':
				return <AmhsCardHandler {...thisProps} />;
			case 'cdo/cdoCardHandler':
				return <CDOCardHandler {...thisProps} />;
			case 'globalSearch/globalSearchCardHandler':
				return <GlobalSearchCardHandler {...thisProps} />;
			case 'eda/edaCardHandler':
				return <EDACardHandler {...thisProps} />;
			case 'jbook/jbookCardHandler':
				return <JBookCardHandler {...thisProps} />;
			case 'jexnet/jexnetCardHandler':
				return <JexnetCardHandler {...thisProps} />;
			default:
				return <DefaultCardHandler {...thisProps} />;
		}
	};

	return (
		<StyledCardContainer
			listView={state.listView}
			toggledMore={toggledMore}
			isRevoked={isRevoked}
			selected={selected}
			allowScroll={allowScroll}
			showSideFilters={state.showSideFilters}
			intelligentSearch={intelligentSearch}
			graphView={graphView}
		>
			{getCardComponent({
				id,
				IS_EDGE,
				state,
				cardType,
				item,
				idx,
				checkboxComponent,
				favoriteComponent: () =>
					FavoriteComponent({ cardType, state, dispatch, filename, item, idx, displayTitle, classes }),
				graphView,
				intelligentSearch,
				toggledMore,
				detailPage,
				hitsExpanded,
				setHitsExpanded,
				hoveredHit,
				setHoveredHit,
				metadataExpanded,
				setMetadataExpanded,
				intelligentFeedbackComponent,
				collection,
				filename,
				searchText,
				setToggledMore,
				closeGraphCard,
				setModalOpen,
				dispatch,
				setFavorite,
				favorite,
				favoriteSummary,
				setFavoriteSummary,
				classes,
				modalOpen,
				setFilename,
				setDisplayTitle,
			})}
		</StyledCardContainer>
	);
}

GCCard.propTypes = {
	idx: PropTypes.number.isRequired,
	state: PropTypes.shape({
		selectedDocuments: PropTypes.instanceOf(Map),
		listView: PropTypes.bool.isRequired,
		componentStepNumbers: PropTypes.objectOf(PropTypes.number),
		showSideFilters: PropTypes.bool.isRequired,
		cloneData: PropTypes.shape({
			cardModule: PropTypes.string,
			clone_name: PropTypes.string.isRequired,
		}),
		searchText: PropTypes.string,
	}),
	dispatch: PropTypes.func.isRequired,
	item: PropTypes.shape({
		type: PropTypes.string.isRequired,
		title: PropTypes.string,
		filename: PropTypes.string,
		favorite: PropTypes.bool,
		is_revoked_b: PropTypes.bool,
		search_mode: PropTypes.string,
	}),
	id: PropTypes.number,
	graphView: PropTypes.bool,
	closeGraphCard: PropTypes.func,
	collection: PropTypes.array,
};

export const Card = React.memo(GCCard);
