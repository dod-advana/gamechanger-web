import React, { useState, useContext, useEffect, useCallback } from 'react';
import { trackEvent } from '../components/telemetry/Matomo';
import { CustomDimensions } from '../components/telemetry/utils';
import { getTrackingNameForFactory, encode, getQueryVariable } from '../utils/gamechangerUtils';
import GCAccordion from '../components/common/GCAccordion';
import { Typography, Dialog, DialogActions, DialogContent, DialogTitle, Tooltip } from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import JBookJAICReviewForm from '../components/modules/jbook/jbookJAICReviewForm';
import JBookServiceReviewForm from '../components/modules/jbook/jbookServiceReviewForm';
import JBookPOCReviewForm from '../components/modules/jbook/jbookPOCReviewForm';
import JBookSimpleReviewForm from '../components/modules/jbook/jbookSimpleReviewForm';
import GCPrimaryButton from '../components/common/GCButton';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import { gcOrange } from '../components/common/gc-colors';
import CloseIcon from '@material-ui/icons/Close';
import './gamechanger.css';
import './jbook.css';
import './jbook-styles.css';
import { setState } from '../utils/sharedFunctions';
import { getClassLabel, getSearchTerms, formatNum } from '../utils/jbookUtilities';
import { JBookContext } from '../components/modules/jbook/jbookContext';
import jca_data from '../components/modules/jbook/JCA.json';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import {
	Accomplishments,
	aggregateProjectDescriptions,
	Contracts,
	Metadata,
	ProjectDescription,
	ClassificationScoreCard,
} from '../components/modules/jbook/profilePage/jbookProfilePageHelper';
import {
	CloseButton,
	StyledContainer,
	StyledReviewContainer,
	StyledReviewLeftContainer,
	StyledReviewRightContainer,
	StyledAccordionContainer,
	StyledAccordionHeader,
	StyledLeftContainer,
	StyledRightContainer,
	StyledMainContainer,
} from '../components/modules/jbook/profilePage/profilePageStyles';
import Auth from '@dod-advana/advana-platform-ui/dist/utilities/Auth';
import GameChangerAPI from '../components/api/gameChanger-service-api';
import GameChangerUserAPI from '../components/api/GamechangerUserManagement';
import JBookPortfolioSelector from '../components/modules/jbook/portfolioBuilder/jbookPortfolioSelector';
import JBookBudgetYearSelector from '../components/modules/jbook/profilePage/jbookBudgetYearSelector';

const _ = require('lodash');

const gameChangerAPI = new GameChangerAPI();
const gameChangerUserAPI = new GameChangerUserAPI();

const JBookProfilePage = () => {
	const context = useContext(JBookContext);
	const { state, dispatch } = context;
	const {
		projectData,
		reviewData,
		keywordsChecked,
		selectedPortfolio,
		cloneData,
		portfolios,
		profilePageBudgetYear,
		serviceValidation,
		pocValidation,
		commentThread,
		userData,
	} = state;
	const [permissions, setPermissions] = useState({
		is_admin: false,
		is_primary_reviewer: false,
		is_service_reviewer: false,
		is_poc_reviewer: false,
	});

	const [profileLoading, setProfileLoading] = useState(false);
	const [dropdownData, setDropdownData] = useState({});

	const [budgetType, setBudgetType] = useState('');
	const [budgetLineItem, setBudgetLineItem] = useState('');
	const [programElement, setProgramElement] = useState('');
	const [projectNum, setProjectNum] = useState('');
	const [budgetYear, setBudgetYear] = useState('');
	const [docID, setDocID] = useState('');
	const [appropriationNumber, setAppropriationNumber] = useState('');

	const [projectDescriptions, setProjectDescriptions] = useState([]);

	const [searchText, setSearchText] = useState(undefined);
	const [keywordCheckboxes, setKeywordCheckboxes] = useState([]);
	const [isCheckboxSet, setIsCheckboxSet] = useState(false);
	const [accomplishments, setAccomplishments] = useState([]);
	const [contracts, setContracts] = useState([]);
	const [contractMapping, setContractMapping] = useState([]);

	const [pMap, setMap] = useState({});
	const [userMap, setUserMap] = useState({});

	const [budgetYearProjectData, setBudgetYearProjectData] = useState({});
	let [init, setInit] = useState(false);

	useEffect(() => {
		if (selectedPortfolio === 'AI Inventory') {
			const prevYearData = budgetYearProjectData[`${projectData.budgetYear - 1}`];
			const previosuReview = prevYearData?.review_n?.find((review) => review.portfolio_name_s === 'AI Inventory');
			const previousClassLabel = previosuReview?.latest_class_label_s;
			if (previousClassLabel && !reviewData.primaryClassLabel)
				setReviewData('primaryClassLabel', previousClassLabel);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [budgetYearProjectData, budgetYear, selectedPortfolio]);

	const clickFnPDF = (filename, cloneName, pageNumber = 0) => {
		trackEvent(
			getTrackingNameForFactory(cloneName),
			'CardInteraction',
			'PDFOpen',
			null,
			CustomDimensions.create(true, filename, pageNumber)
		);
		window.open(
			`/#/pdfviewer/gamechanger?filename=${encode(filename)}&pageNumber=${pageNumber}&cloneIndex=${cloneName}`
		);
	};

	useEffect(() => {
		const getUserData = async () => {
			const currentUserData = await gameChangerUserAPI.getUserProfileData();
			setState(dispatch, { userData: currentUserData ? currentUserData.data : {} });
		};

		if (!init) {
			getUserData();
			setInit(true);
		}
	}, [init, setInit, dispatch]);

	const setContractData = (newProjectData) => {
		// set the contract data based on the current project data

		const tempMapping = {};

		if (newProjectData.contracts) {
			setContracts(newProjectData.contracts);
			for (const currentContract of newProjectData.contracts) {
				if (tempMapping[currentContract.vendorName] === undefined) {
					tempMapping[currentContract.vendorName] = true;
				}
			}
			setContractMapping(tempMapping);
		}

		return tempMapping;
	};

	const setProjectReviewData = (newProjectData, tempMapping, portfolioName) => {
		let review = newProjectData.reviews[portfolioName] ?? {};

		if (review.serviceMissionPartnersChecklist === null || review.serviceMissionPartnersChecklist === undefined) {
			review.serviceMissionPartnersChecklist = JSON.stringify(tempMapping);
		}
		if (review.pocMissionPartnersChecklist === null || review.pocMissionPartnersChecklist === undefined) {
			review.pocMissionPartnersChecklist = JSON.stringify(tempMapping);
		}

		// Review changes to make things behave properly
		if (!review.serviceAgreeLabel) {
			review.serviceAgreeLabel = 'Yes';
		}
		if (!review.servicePTPAgreeLabel) {
			review.servicePTPAgreeLabel = 'Yes';
		}
		// Review changes to make things behave properly
		if (!review.pocAgreeLabel) {
			review.pocAgreeLabel = 'Yes';
		}
		if (!review.pocPTPAgreeLabel) {
			review.pocPTPAgreeLabel = 'Yes';
		}
		if (!review.pocMPAgreeLabel) {
			review.pocMPAgreeLabel = 'Yes';
		}

		setState(dispatch, { reviewData: review });
	};

	const selectBudgetYearProjectData = (allBYProjectData, year, portfolioName) => {
		try {
			let newProjectData = allBYProjectData[year] || {};

			setBudgetLineItem(newProjectData.budgetLineItem || '');
			setProgramElement(newProjectData.programElement || '');
			setProjectNum(newProjectData.projectNum || '');
			setAppropriationNumber(newProjectData.appropriationNumber || '');
			setDocID(newProjectData.id || '');

			let tempMapping = setContractData(newProjectData);

			if (newProjectData.reviews) {
				setProjectReviewData(newProjectData, tempMapping, portfolioName);
			}

			setBudgetYear(year);

			setState(dispatch, { projectData: newProjectData, profilePageBudgetYear: year });

			return newProjectData.id;
		} catch (err) {
			console.log('Error setting budget year project data');
			console.log(err);
		}
	};

	const getDropdownData = async () => {
		try {
			let newDropdownData = await gameChangerAPI.callDataFunction({
				functionName: 'getBudgetDropdownData',
				cloneName: cloneData.clone_name,
				options: {},
			});
			setDropdownData(newDropdownData.data);
		} catch (err) {
			console.log('Error fetching dropdown data');
			console.log(err);
		}
	};

	const getCommentThread = async (id, portfolioName) => {
		const commentThreadData = await gameChangerAPI.callDataFunction({
			functionName: 'getCommentThread',
			cloneName: 'jbook',
			options: {
				docID: id,
				portfolioName,
			},
		});

		if (commentThreadData) {
			setState(dispatch, { commentThread: commentThreadData.data });
		}
	};

	// grab all profile page relaetd data
	const getAllBYProjectData = async (id, year, portfolioName) => {
		let allBYProjectData;
		const currentUserData = await gameChangerUserAPI.getUserProfileData();

		try {
			setProfileLoading(true);

			// get profile page data for all budget years
			allBYProjectData = await gameChangerAPI.callDataFunction({
				functionName: 'getAllBYProjectData',
				cloneName: cloneData.clone_name,
				options: {
					id,
					portfolioName,
					userRowId: currentUserData.data.id,
				},
			});

			if (allBYProjectData.data === 'Unauthorized Entry Detected') {
				let newHref = window.location.href;
				newHref = newHref.split('#')[0];
				newHref += '#/unauthorized';
				window.location.replace(newHref);
			}

			if (allBYProjectData?.data) {
				allBYProjectData = allBYProjectData.data;

				// set the project data for all budget years
				setBudgetYearProjectData(allBYProjectData);

				setProfileLoading(false);

				await selectBudgetYearProjectData(allBYProjectData, year, portfolioName);
			}

			await getDropdownData();

			await getCommentThread(id, portfolioName);
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		try {
			const url = window.location.href;
			const type = getQueryVariable('type', url);
			const year = getQueryVariable('budgetYear', url);
			const text = getQueryVariable('searchText', url);
			const id = getQueryVariable('id', url);
			const tmpPortfolioName = getQueryVariable('portfolioName', url);

			setBudgetType(type);
			setBudgetYear(year);
			setSearchText(text);
			setDocID(id);

			getAllBYProjectData(id, year, tmpPortfolioName).then(() => {
				setState(dispatch, { selectedPortfolio: tmpPortfolioName });
			});

			if (text && text !== 'undefined') {
				setState(dispatch, { searchText: text });
			}
		} catch (err) {
			console.log(err);
			console.log('Error retrieving budget profile page data');
			setProfileLoading(false);
		}

		const userData = Auth.getTokenPayload();

		if (userData?.extra_fields?.jbook) {
			const tmpPermissions = {
				is_admin: userData.extra_fields.jbook.is_admin,
				is_primary_reviewer: userData.extra_fields.jbook.is_primary_reviewer,
				is_service_reviewer: userData.extra_fields.jbook.is_service_reviewer,
				is_poc_reviewer: userData.extra_fields.jbook.is_poc_reviewer,
			};

			setPermissions(tmpPermissions);
		}

		const getPortfolioData = async () => {
			// grab the portfolio data
			const currentUserData = await gameChangerUserAPI.getUserProfileData();

			await gameChangerAPI
				.callDataFunction({
					functionName: 'getPortfolios',
					cloneName: 'jbook',
					options: { id: currentUserData.data.id },
				})
				.then(async (data) => {
					let publicData = [];
					let privateData = [];
					if (data.data) {
						publicData = data.data.publicPortfolios;
						privateData = data.data.privatePortfolios;
					}
					let portfolioData = [...publicData, ...privateData];
					let map = {};
					for (let item of portfolioData) {
						map[item.name] = item;
					}
					setMap(map);
					setState(dispatch, { portfolios: portfolioData });

					const userIdSet = [];
					Object.keys(map).forEach((portfolio) => {
						map[portfolio].user_ids.forEach((id) => {
							if (!userIdSet.includes(id)) userIdSet.push(id);
						});
					});
					const { data: userData } = await gameChangerAPI.getUserDataByIDs(userIdSet);
					const newUserMap = {};
					userData.users.forEach((user) => (newUserMap[user.id] = user));
					setUserMap(newUserMap);
				});
		};
		getPortfolioData();

		// eslint-disable-next-line
	}, []);

	const setupAccomplishmentData = useCallback(() => {
		const accomp = [];
		projectData.accomplishments = projectData.accomplishments ?? [];
		projectData.accomplishments.forEach((accom) => {
			accomp.push({
				title: accom.Accomp_Title_text_t,
				data: [
					{
						Key: 'Description',
						Value: accom.Accomp_Desc_text_t ?? '',
					},
					{
						Key: 'Prior Year Plans',
						Value: accom.PlanPrgrm_Fund_CY_Text_t ?? '',
					},
					{
						Key: 'Prior Year Amount',
						Value: accom.PlanPrgrm_Fund_CY_d ? formatNum(accom.PlanPrgrm_Fund_CY_d) : '',
					},
					{
						Key: 'Current Year Plans',
						Value: accom.PlanPrgrm_Fund_BY1Base_Text_t ?? '',
					},
					{
						Key: 'Current Year Amount',
						Value: accom.PlanPrgrm_Fund_BY1Base_d ? formatNum(accom.PlanPrgrm_Fund_BY1Base_d) : '',
					},
				],
			});
		});

		accomp.forEach((accom, i) => {
			accom.data.forEach((accompObject, y) => {
				if (
					(accompObject.Key === 'Description' ||
						accompObject.Key === 'Prior Year Plans' ||
						accompObject.Key === 'Current Year Plans') &&
					accompObject.Value !== undefined &&
					accompObject.Value !== null
				) {
					accomp[i].data[y].Value = accomp[i].data[y].Value.replaceAll(/(^|[^\n])\n(?!\n)/g, '$1<br />');
					accomp[i].data[y].Value = accomp[i].data[y].Value.replaceAll(`â¢`, `&bull;`);
					accomp[i].data[y].Value = accomp[i].data[y].Value.replaceAll(`â`, `'`);
				}
			});
		});

		return accomp;
	}, [projectData]);

	const highlightSearchTextDescriptions = useCallback(
		(terms, aggregations) => {
			for (const descriptions of aggregations) {
				let matches = [];

				// if there is an or, highlight terms separately
				if (searchText.indexOf('or') !== -1) {
					terms.forEach((term) => {
						const regex = new RegExp(`${term.replaceAll('"', '')}([a-z]+)?`, 'gi');
						const tmpMatches = descriptions.value.match(regex);
						matches = matches.concat(tmpMatches);
					});
				}
				// else highlight as 1 phrase
				else {
					const regex = new RegExp(`${searchText.replaceAll('"', '')}([a-z]+)?`, 'gi');
					const tmpMatches = descriptions.value.match(regex);
					matches = matches.concat(tmpMatches);
				}

				if (matches) {
					for (const match of matches) {
						descriptions.value = descriptions.value.replaceAll(
							match,
							`<span style="background-color: #1C2D64; color: white; padding: 0 4px;">${match}</span>`
						);
					}
				}
			}

			return aggregations;
		},
		[searchText]
	);

	const highlightSearchTextAccomps = (terms, accomp) => {
		accomp.forEach((accomplishment) => {
			accomplishment.data.forEach((accompObject) => {
				if (
					(accompObject.Key === 'Description' ||
						accompObject.Key === 'Prior Year Plans' ||
						accompObject.Key === 'Current Year Plans') &&
					accompObject.Value !== undefined &&
					accompObject.Value !== null
				) {
					let matches = [];

					terms.forEach((term) => {
						const regex = new RegExp(`${term}([a-z]+)?`, 'gi');
						const tmpMatches = accompObject.Value.match(regex);
						matches = matches.concat(tmpMatches);
					});
					if (matches && matches.length > 0 && matches !== null) {
						for (const match of matches) {
							accompObject.Value = accompObject.Value.replaceAll(
								match,
								`<span style="background-color: ${'#1C2D64'}; color: white; padding: 0 4px;">${match}</span>`
							);
						}
					}
				}
			});
		});

		return accomp;
	};

	const highlightSearchText = useCallback(
		(aggregatedDescriptions, accomp) => {
			// highlight search text
			if (searchText) {
				const terms = getSearchTerms(searchText);

				aggregatedDescriptions = highlightSearchTextDescriptions(terms, aggregatedDescriptions);

				accomp = highlightSearchTextAccomps(terms, accomp);
			}

			return [aggregatedDescriptions, accomp];
		},
		[highlightSearchTextDescriptions, searchText]
	);

	const applyHighlighting = useCallback(
		(textObject, keywordBoxes, matches, keyword, property) => {
			for (const match of matches) {
				textObject[property] = textObject[property].replaceAll(
					match,
					`<span style="background-color: ${gcOrange}; color: white; padding: 0 4px;">${match}</span>`
				);

				if (!isCheckboxSet && keywordBoxes.indexOf(keyword) === -1) {
					keywordBoxes.push(keyword);
				}
			}

			return [textObject[property], keywordBoxes];
		},
		[isCheckboxSet]
	);

	const highlightKeywordsDescriptions = useCallback(
		(aggregatedDescriptions) => {
			let keywordBoxes = [];
			for (const description of aggregatedDescriptions) {
				for (const keyword of keywordsChecked) {
					let tempKeyword = keyword;
					let regex = new RegExp(`${keyword}([a-z]+)?`, 'gi');
					if (keyword.split(' ').length > 1) {
						tempKeyword = keyword
							.split(' ')
							.map((word) => `([a-z]+)?${word}([a-z]+)?`)
							.join(' ');
						regex = new RegExp(tempKeyword, 'gi');
					}

					let matches = description.value.match(regex);
					const hyphenRegex = new RegExp(`${keyword.replace(' ', '-')}([a-z]+)?`, 'gi');
					const hyphenMatches = description.value.match(hyphenRegex);
					if (matches === null) {
						matches = hyphenMatches;
					} else {
						matches = matches.concat(hyphenMatches);
					}

					if (keywordsChecked.length > 0 && matches) {
						[description.value, keywordBoxes] = applyHighlighting(
							description,
							keywordBoxes,
							matches,
							keyword,
							'value'
						);
					}
				}
			}
			return keywordBoxes;
		},
		[keywordsChecked, applyHighlighting]
	);

	const highlightKeywordsAccomp = useCallback(
		(accomp) => {
			accomp.forEach((accomplishment) => {
				accomplishment.data.forEach((accompObject) => {
					if (accompObject.Key === 'Description' && accompObject.Value !== null) {
						for (const keyword of keywordsChecked) {
							const regex = new RegExp(`${keyword}([a-z]+)?`, 'gi');
							const matches = accompObject.Value.match(regex);

							if (keywordsChecked.length > 0 && matches) {
								[accompObject.Value] = applyHighlighting(accompObject, [], matches, keyword, 'Value');
							}
						}
					}
				});
			});
			return accomp;
		},
		[keywordsChecked, applyHighlighting]
	);

	const highlightKeywords = useCallback(
		(aggregatedDescriptions, accomp) => {
			const keywordBoxes = highlightKeywordsDescriptions(aggregatedDescriptions);

			accomp = highlightKeywordsAccomp(accomp);

			setProjectDescriptions(aggregatedDescriptions);
			setAccomplishments(accomp);

			// if we haven't set checkboxes up yet
			if (!isCheckboxSet) {
				setIsCheckboxSet(true);
				setKeywordCheckboxes(keywordBoxes.sort());
				setState(dispatch, { keywordsChecked: keywordBoxes });
			}
		},
		[dispatch, isCheckboxSet, highlightKeywordsDescriptions, highlightKeywordsAccomp]
	);

	// handle project description highlighting
	useEffect(() => {
		if (!projectData.id) {
			return;
		}
		if (!isCheckboxSet) {
			setIsCheckboxSet(true);
			setState(dispatch, { keywordsChecked: projectData.keywords });
			setKeywordCheckboxes(projectData.keywords);
			return;
		}

		let accomp = setupAccomplishmentData();

		try {
			// highlight keywords (initially all keywords included)
			// turn the initial matches into checkboxes
			// let projectDescription = projectData.projectMissionDescription ? projectData.projectMissionDescription : projectData.programDescription ? projectData.programDescription : projectData.missionDescBudgetJustification;
			let aggregatedDescriptions = aggregateProjectDescriptions(projectData);

			// take care of weird formatting, translate to HTML:
			for (const description of aggregatedDescriptions) {
				description.value = description.value.replaceAll(`â¢`, `&bull;`);
				description.value = description.value.replaceAll(`â`, `'`);
				description.value = description.value.replaceAll(/(^|[^\n])\n(?!\n)/g, '$1<br />');
			}

			[aggregatedDescriptions, accomp] = highlightSearchText(aggregatedDescriptions, accomp);

			// highlight based on keywords checked
			if (keywordsChecked) {
				highlightKeywords(aggregatedDescriptions, accomp);
			}
		} catch (err) {
			console.log('Error setting highlights');
			console.log(err);
		}
	}, [
		projectData,
		keywordsChecked,
		dispatch,
		isCheckboxSet,
		searchText,
		setupAccomplishmentData,
		highlightSearchText,
		highlightKeywords,
	]);

	const renderReenableModal = (reviewType) => {
		return (
			<Dialog open={state[reviewType + 'ModalOpen']} maxWidth="xl">
				<DialogTitle>
					<div style={{ display: 'flex', width: '100%' }}>
						<Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>
							Re-Enable Review Form
						</Typography>
					</div>
				</DialogTitle>
				<CloseButton onClick={() => setState(dispatch, { [`${reviewType}ModalOpen`]: false })}>
					<CloseIcon fontSize="25" />
				</CloseButton>
				<DialogContent>
					<p>Would you like to re-enable the {reviewType} review form?</p>
				</DialogContent>
				<DialogActions>
					<GCPrimaryButton
						style={{ color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0', height: '35px' }}
						onClick={() => setState(dispatch, { [`${reviewType}ModalOpen`]: false })}
					>
						Cancel
					</GCPrimaryButton>
					<GCPrimaryButton
						style={{ color: 'white', backgroundColor: '#1C2D64', borderColor: '#1C2D64', height: '35px' }}
						onClick={() => {
							setState(dispatch, { [`${reviewType}ModalOpen`]: false });
							reenableForm('primaryReviewLoading', reviewType.toLowerCase());
						}}
					>
						Re-Enable
					</GCPrimaryButton>
				</DialogActions>
			</Dialog>
		);
	};

	const updateValidation = useCallback(
		(field, value, stateObject) => {
			let newServiceValidation;
			let newPOCValidation;
			if (field in serviceValidation && value && value.length > 0) {
				newServiceValidation = _.cloneDeep(serviceValidation);
				newServiceValidation[field] = true;
				stateObject.serviceValidation = newServiceValidation;
			} else if (field in pocValidation && value && value.length > 0) {
				newPOCValidation = _.cloneDeep(pocValidation);
				newPOCValidation[field] = true;
				stateObject.pocValidation = newPOCValidation;
			}

			return stateObject;
		},
		[pocValidation, serviceValidation]
	);

	const setReviewDataMultiple = useCallback(
		(updates) => {
			let newReviewData = _.cloneDeep(reviewData);
			Object.keys(updates).forEach((field) => {
				newReviewData[field] = updates[field];
			});

			const stateObject = {};
			stateObject.reviewData = newReviewData;

			setState(dispatch, stateObject);
		},
		[dispatch, reviewData]
	);

	const setServicePOC = (value, reviewData) => {
		const { first_name, last_name, organization, job_title, email, phone_number } = value;
		reviewData.servicePOCTitle = job_title ?? '';
		reviewData.servicePOCName = `${first_name} ${last_name}`;
		reviewData.servicePOCEmail = email ?? '';
		reviewData.servicePOCOrg = organization ?? '';
		reviewData.servicePOCPhoneNumber = phone_number ?? '';
	};

	const setReviewData = useCallback(
		(field, value) => {
			let newReviewData = _.cloneDeep(reviewData);

			let stateObject = {};

			switch (field) {
				case 'jaicForm':
					newReviewData = {
						...newReviewData,
						primaryReviewer: null,
						primaryClassLabel: null,
						serviceReviewer: '',
						primaryPlannedTransitionPartner: null,
						serviceAdditionalMissionPartners: null,
						primaryReviewNotes: '',
					};
					break;
				case 'serviceForm':
					newReviewData = {
						...newReviewData,
						serviceMissionPartnersList: null,
						serviceMissionPartnersChecklist: JSON.stringify(contractMapping),
						serviceAgreeLabel: 'Yes',
						primaryClassLabel: null,
						serviceClassLabel: null,
						servicePTPAgreeLabel: 'Yes',
						servicePlannedTransitionPartner: null,
						otherMissionPartners: null,
						servicePOCTitle: '',
						servicePOCName: '',
						servicePOCEmail: '',
						servicePOCOrg: '',
						servicePOCPhoneNumber: '',
						serviceReviewerNotes: '',
						serviceSecondaryReviewer: '',
					};

					stateObject.serviceValidated = true;

					break;
				case 'pocForm':
					newReviewData = {
						...newReviewData,
						altPOCTitle: '',
						altPOCName: '',
						altPOCEmail: '',
						altPOCOrg: '',
						altPOCPhoneNumber: '',
						pocJointCapabilityArea: null,
						pocJointCapabilityArea2: null,
						pocJointCapabilityArea3: null,
						pocAIType: null,
						pocAIRoleDescription: '',
						pocAITypeDescription: '',
						pocDollarsAttributedCategory: null,
						pocPercentageAttributedCategory: null,
						pocDollarsAttributed: '',
						pocPercentageAttributed: '',
						pocAgreeLabel: 'Yes',
						pocClassLabel: null,
						pocPTPAgreeLabel: 'Yes',
						pocPlannedTransitionPartner: null,
						pocMPAgreeLabel: 'Yes',
						pocMissionPartnersList: null,
						pocMissionPartnersChecklist: JSON.stringify(contractMapping),
						domainTask: null,
						domainTaskSecondary: null,
						roboticsSystemAgree: null,
						pocMissionPartners: null,
						intelligentSystemsAgree: null,
					};

					stateObject.pocValidated = true;
					break;
				case 'domainTaskSecondary':
					const newDomainTasks = newReviewData.domainTaskSecondary ?? [];
					if (newDomainTasks.includes(value)) {
						newDomainTasks.splice(newDomainTasks.indexOf(value), 1);
					} else {
						newDomainTasks.push(value);
					}
					newReviewData.domainTaskSecondary = newDomainTasks;
					break;
				case 'domainTaskOther':
					const newOther = [value];
					newReviewData.domainTaskSecondary = newOther;
					break;
				case 'setMissionPartners':
					newReviewData.serviceMissionPartnersList = value.join('|');
					break;
				case 'setMissionPartnersChecklist':
					newReviewData.serviceMissionPartnersChecklist = JSON.stringify(value);
					break;
				case 'setPOCMissionPartners':
					newReviewData.pocMissionPartnersList = value.join('|');
					break;
				case 'setPOCMissionPartnersChecklist':
					newReviewData.pocMissionPartnersChecklist = JSON.stringify(value);
					break;
				case 'domainTask':
					newReviewData.domainTaskSecondary = null;
					if (newReviewData.domainTask === value) {
						newReviewData.domainTask = null;
						break;
					}
					newReviewData[field] = value;
					break;
				case 'pocJointCapabilityArea':
					if (newReviewData.pocJointCapabilityArea === value) {
						newReviewData.pocJointCapabilityArea = '';
						newReviewData.pocJointCapabilityArea2 = [];
						newReviewData.pocJointCapabilityArea3 = [];
						break;
					}
					newReviewData[field] = value;
					newReviewData.pocJointCapabilityArea2 = [];
					newReviewData.pocJointCapabilityArea3 = [];

					break;
				case 'pocJointCapabilityArea2':
					const JCAindex2 = newReviewData['pocJointCapabilityArea2']?.indexOf(value);
					if (JCAindex2 != null && JCAindex2 !== -1) {
						const tier3 = Object.keys(jca_data[newReviewData.pocJointCapabilityArea][value]);
						if (newReviewData.pocJointCapabilityArea3) {
							newReviewData.pocJointCapabilityArea3 = newReviewData.pocJointCapabilityArea3.filter(
								(val) => tier3.indexOf(val) === -1
							);
						}
						newReviewData.pocJointCapabilityArea2.splice(JCAindex2, 1);
						break;
					}
					if (!newReviewData[field]) newReviewData[field] = [];
					newReviewData[field].push(value);

					break;
				case 'pocJointCapabilityArea3':
					const JCAindex3 = newReviewData['pocJointCapabilityArea3']?.indexOf(value);
					if (JCAindex3 != null && JCAindex3 !== -1) {
						newReviewData.pocJointCapabilityArea3.splice(JCAindex3, 1);
						break;
					}
					if (!newReviewData[field]) newReviewData[field] = [];
					newReviewData[field].push(value);
					break;
				case 'clearJCA':
					newReviewData.pocJointCapabilityArea = null;
					newReviewData.pocJointCapabilityArea2 = null;
					newReviewData.pocJointCapabilityArea3 = null;
					break;
				case 'clearDomainTask':
					newReviewData.domainTask = '';
					newReviewData.domainTaskSecondary = [];
					break;
				case 'clearDataType':
					newReviewData.pocAIType = '';
					break;
				case 'pocSlider':
					newReviewData.pocDollarsAttributed = value.pocDollarsAttributed;
					newReviewData.pocPercentageAttributed = value.pocPercentageAttributed;
					break;
				case 'servicePOC':
					setServicePOC(value, newReviewData);
					break;
				default:
					newReviewData[field] = value !== null ? value : '';
					break;
			}

			stateObject.reviewData = newReviewData;

			stateObject = updateValidation(field, value, stateObject);

			setState(dispatch, stateObject);
		},
		[dispatch, contractMapping, reviewData, updateValidation]
	);

	const validString = (text) => {
		return text !== undefined && text !== null && text !== '';
	};

	const validateField = (classLabel, field, fieldValue) => {
		if (classLabel === 'AI Enabling' || classLabel === 'Not AI') {
			let excludeFields = [
				'domainTask',
				'pocJointCapabilityArea',
				'roboticsSystemAgree',
				'intelligentSystemsAgree',
				'pocAIType',
				'pocAITypeDescription',
				'pocAIRoleDescription',
			];
			if (excludeFields.indexOf(field) === -1) {
				return validString(fieldValue);
			} else {
				return true;
			}
		} else {
			return validString(fieldValue);
		}
	};

	const validateForm = (form) => {
		const validationForm = _.cloneDeep(state[form + 'Validation']);
		let validated = true;

		for (const field of Object.keys(validationForm)) {
			const fieldValue = reviewData[field];
			const classLabel = getClassLabel(reviewData);
			const fieldToReviewData = {
				servicePlannedTransitionPartner: 'servicePTPAgreeLabel',
				serviceClassLabel: 'serviceAgreeLabel',
				pocClassLabel: 'pocAgreeLabel',
				pocMissionPartners: 'pocMPAgreeLabel',
				pocPlannedTransitionPartner: 'pocPTPAgreeLabel',
			};

			switch (field) {
				case 'amountAttributed':
					if (classLabel !== 'Not AI') {
						let dollarsAttributed = reviewData['pocDollarsAttributed'];
						let percentageAttributed = reviewData['pocPercentageAttributed'];

						validationForm[field] = validString(dollarsAttributed) || validString(percentageAttributed);

						if (validationForm[field] === false) {
							validated = false;
						}

						break;
					}
					validationForm[field] = true;
					break;
				case 'servicePlannedTransitionPartner':
				case 'serviceClassLabel':
				case 'pocClassLabel':
				case 'pocMissionPartners':
				case 'pocPlannedTransitionPartner':
					validationForm[field] = reviewData[fieldToReviewData[field]] === 'Yes' || validString(fieldValue);
					break;
				default:
					validationForm[field] = validateField(classLabel, field, fieldValue);
					if (validationForm[field] === false) {
						validated = false;
					}
					break;
			}
		}

		setState(dispatch, { [form + 'Validation']: validationForm, [form + 'Validated']: validated });
		return validated;
	};

	const submitReviewForm = async (loading, isSubmit, reviewType) => {
		if (
			!isSubmit ||
			reviewType === 'primary' ||
			validateForm(reviewType) ||
			getClassLabel(reviewData) === 'Not AI'
		) {
			setState(dispatch, { [loading]: true });

			reviewData.latestClassLabel = reviewData.primaryClassLabel;
			if (reviewData.serviceAgreeLabel === 'No') {
				reviewData.latestClassLabel = reviewData.serviceClassLabel;
			}
			if (reviewData.pocAgreeLabel === 'No') {
				reviewData.latestClassLabel = reviewData.pocClassLabel;
			}
			await gameChangerAPI.callDataFunction({
				functionName: 'storeBudgetReview',
				cloneName: cloneData.clone_name,
				options: {
					frontendReviewData: {
						...reviewData,
						budgetType,
						programElement,
						budgetLineItem,
						budgetYear,
						appropriationNumber,
						budgetActivityNumber: projectData.budgetActivityNumber,
						serviceAgency: projectData.serviceAgency,
						portfolioName: selectedPortfolio,
						projectNum,
					},
					isSubmit,
					reviewType,
					portfolioName: selectedPortfolio,
					id: docID,
				},
			});

			await getAllBYProjectData(docID, budgetYear, selectedPortfolio);
			setState(dispatch, { [loading]: false });
		}
	};

	const reenableForm = async (loading, reviewType) => {
		setState(dispatch, { [loading]: true });
		await gameChangerAPI.callDataFunction({
			functionName: 'reenableForm',
			cloneName: cloneData.clone_name,
			options: {
				reviewType,
				budgetType,
				programElement,
				budgetLineItem,
				projectNum,
				appropriationNumber,
				portfolioName: selectedPortfolio,
				docID,
			},
		});
		await getAllBYProjectData(docID, budgetYear, selectedPortfolio);
		setState(dispatch, { [loading]: false });
	};

	const setKeywordCheck = (keyword) => {
		let newKeywordsChecked = _.cloneDeep(keywordsChecked);
		if (newKeywordsChecked) {
			const index = newKeywordsChecked.indexOf(keyword);

			if (index !== -1) {
				newKeywordsChecked.splice(index, 1);
			} else {
				newKeywordsChecked.push(keyword);
			}
		} else {
			newKeywordsChecked = [keyword];
		}

		setState(dispatch, { keywordsChecked: newKeywordsChecked });
	};

	const scorecardData = () => {
		let data = [];

		if (reviewData.primaryReviewStatus === 'Finished Review') {
			let latestReviewer;
			if (reviewData.pocClassLabel) {
				latestReviewer = reviewData.servicePOCName || 'The POC Reviewer';
				console.log('latestReviewer: ', latestReviewer);
			} else if (reviewData.serviceClassLabel) {
				latestReviewer = reviewData.serviceReviewer || 'The RAI Lead Reviewer';
			} else {
				latestReviewer = reviewData.primaryReviewer || 'The Initial Reviewer';
			}
			data.push({
				name: 'Reviewer Tag',
				description: latestReviewer + ' classified this document as "' + reviewData.latestClassLabel + '"',
				timestamp: new Date(reviewData.updatedAt).toLocaleDateString(),
				justification: reviewData.primaryReviewNotes ? reviewData.primaryReviewNotes : '',
			});
		}
		return data;
	};

	const renderPrimaryReviewerSection = () => {
		return (
			<StyledAccordionContainer id={'Primary Reviewer Section'}>
				<GCAccordion
					contentPadding={0}
					expanded={true}
					headerWidth="100%"
					header={
						<StyledAccordionHeader headerWidth="100%">
							<strong>INITIAL REVIEWER</strong>
							<FiberManualRecordIcon
								style={{
									color: reviewData.primaryReviewStatus === 'Finished Review' ? 'green' : '#F9B32D',
								}}
							/>
						</StyledAccordionHeader>
					}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'600'}
				>
					<JBookJAICReviewForm
						renderReenableModal={renderReenableModal}
						reviewStatus={reviewData.primaryReviewStatus ?? 'Needs Review'}
						roleDisabled={
							Permissions.hasPermission('JBOOK Admin')
								? false
								: !(
										permissions.is_primary_reviewer &&
										Auth.getTokenPayload().email === reviewData.primaryReviewerEmail
								  )
						}
						finished={reviewData.primaryReviewStatus === 'Finished Review'}
						submitReviewForm={submitReviewForm}
						setReviewDataMultiple={setReviewDataMultiple}
						setReviewData={setReviewData}
						dropdownData={dropdownData}
						reviewerProp={projectData.reviewer}
						serviceReviewerProp={projectData.serviceReview}
					/>
				</GCAccordion>
			</StyledAccordionContainer>
		);
	};

	const renderServiceReviewerSection = () => {
		return (
			<StyledAccordionContainer id={'Service / DoD Component Reviewer Section'}>
				<GCAccordion
					contentPadding={0}
					expanded={true}
					headerWidth="100%"
					header={
						<StyledAccordionHeader>
							<strong>RAI LEAD REVIEWER</strong>
							<FiberManualRecordIcon
								style={{
									color: reviewData.serviceReviewStatus === 'Finished Review' ? 'green' : '#F9B32D',
								}}
							/>
						</StyledAccordionHeader>
					}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'600'}
				>
					<JBookServiceReviewForm
						renderReenableModal={renderReenableModal}
						roleDisabled={
							Permissions.hasPermission('JBOOK Admin')
								? false
								: !(
										permissions.is_service_reviewer &&
										(Auth.getTokenPayload().email === reviewData.serviceReviewerEmail ||
											Auth.getTokenPayload().email === reviewData.serviceSecondaryReviewerEmail)
								  )
						}
						reviewStatus={reviewData.serviceReviewStatus ?? 'Needs Review'}
						finished={reviewData.serviceReviewStatus === 'Finished Review'}
						submitReviewForm={submitReviewForm}
						setReviewDataMultiple={setReviewDataMultiple}
						setReviewData={setReviewData}
						vendorData={projectData.vendors}
						dropdownData={dropdownData}
					/>
				</GCAccordion>
			</StyledAccordionContainer>
		);
	};

	const renderPOCReviewerSection = () => {
		let totalBudget = 3000;
		if (projectData.currentYearAmountMax > 0) {
			totalBudget = projectData.currentYearAmountMax;
		}
		if (projectData.currentYearAmount > 0) {
			totalBudget = projectData.currentYearAmount;
		}

		return (
			<StyledAccordionContainer id={'POC Reviewer Section'}>
				<GCAccordion
					contentPadding={0}
					expanded={true}
					headerWidth="100%"
					header={
						<StyledAccordionHeader>
							<strong>POC REVIEWER</strong>
							<FiberManualRecordIcon
								style={{
									color: reviewData.pocReviewStatus === 'Finished Review' ? 'green' : '#F9B32D',
								}}
							/>
						</StyledAccordionHeader>
					}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'600'}
				>
					<JBookPOCReviewForm
						renderReenableModal={renderReenableModal}
						finished={reviewData.pocReviewStatus === 'Finished Review'}
						roleDisabled={Permissions.hasPermission('JBOOK Admin') ? false : !permissions.is_poc_reviewer}
						reviewStatus={reviewData.pocReviewStatus ?? 'Needs Review'}
						dropdownData={dropdownData}
						vendorData={projectData.vendors}
						submitReviewForm={submitReviewForm}
						setReviewData={setReviewData}
						totalBudget={totalBudget}
					/>
				</GCAccordion>
			</StyledAccordionContainer>
		);
	};

	const renderSimpleReviewerSection = () => {
		let reviewers = [];
		let tags = [];
		if (pMap[selectedPortfolio]) {
			reviewers = [];
			for (let id of pMap[selectedPortfolio].user_ids) {
				if (userMap[id]) {
					reviewers.push({
						id: userMap[id].id,
						name: userMap[id].last_name + ', ' + userMap[id].first_name,
						email: userMap[id].email,
					});
				}
			}
			tags = pMap[selectedPortfolio].tags.map((item) => ({
				primary_class_label: item,
			}));
		}

		return (
			<StyledAccordionContainer id={'Simplified Reviewer Section'}>
				<GCAccordion
					contentPadding={0}
					expanded={true}
					headerWidth="100%"
					header={
						<StyledAccordionHeader>
							<strong>REVIEW</strong>
							<FiberManualRecordIcon
								style={{
									color: reviewData.primaryReviewStatus === 'Finished Review' ? 'green' : '#F9B32D',
								}}
							/>
						</StyledAccordionHeader>
					}
					headerBackground={'rgb(238,241,242)'}
					headerTextColor={'black'}
					headerTextWeight={'600'}
				>
					<JBookSimpleReviewForm
						renderReenableModal={renderReenableModal}
						reviewStatus={reviewData.primaryReviewStatus ?? 'Needs Review'}
						finished={reviewData.primaryReviewStatus === 'Finished Review'}
						submitReviewForm={submitReviewForm}
						setReviewDataMultiple={setReviewDataMultiple}
						setReviewData={setReviewData}
						dropdownData={{
							reviewers: reviewers,
							primaryClassLabel: tags,
						}}
						reviewerProp={projectData.reviewer}
						serviceReviewerProp={projectData.serviceReview}
					/>
				</GCAccordion>
			</StyledAccordionContainer>
		);
	};

	const renderReviewSection = () => {
		switch (selectedPortfolio) {
			case 'General':
				return null;
			case 'AI Inventory':
				return (
					<>
						{renderPrimaryReviewerSection()}
						{renderServiceReviewerSection()}
						{renderPOCReviewerSection()}
					</>
				);
			default:
				return <>{renderSimpleReviewerSection()}</>;
		}
	};

	return (
		<div>
			<StyledContainer>
				<StyledLeftContainer>
					<div style={{ paddingLeft: 20 }}>
						<JBookPortfolioSelector
							selectedPortfolio={selectedPortfolio}
							portfolios={portfolios}
							dispatch={dispatch}
							formControlStyle={{ margin: '10px 0', width: '100%' }}
							width={'100%'}
							projectData={projectData}
							docID={docID}
							getCommentThread={getCommentThread}
							pageDisplayed={state.pageDisplayed}
						/>
					</div>
					<div style={{ paddingLeft: 20 }}>
						<JBookBudgetYearSelector
							profilePageBudgetYear={profilePageBudgetYear}
							budgetYearProjectData={budgetYearProjectData}
							selectedPortfolio={selectedPortfolio}
							selectBudgetYearProjectData={selectBudgetYearProjectData}
							formControlStyle={{ margin: '10px 0', width: '100%' }}
							width={'100%'}
							getCommentThread={getCommentThread}
						/>
					</div>
					{selectedPortfolio !== 'General' && (
						<ClassificationScoreCard
							scores={scorecardData()}
							commentThread={commentThread}
							gameChangerAPI={gameChangerAPI}
							docID={docID}
							portfolioName={selectedPortfolio}
							getCommentThread={getCommentThread}
							userData={userData}
							updateUserProfileData={gameChangerUserAPI.updateUserProfileData}
							dispatch={dispatch}
						/>
					)}
				</StyledLeftContainer>
				<StyledMainContainer>
					<ProjectDescription
						profileLoading={profileLoading}
						projectData={projectData}
						programElement={programElement}
						projectNum={projectNum}
						projectDescriptions={projectDescriptions}
					/>
				</StyledMainContainer>
				<StyledRightContainer>
					{projectData.dtic_pdf_location_s && (
						<GCPrimaryButton
							style={{
								color: 'white',
								backgroundColor: '#1C2D64',
								borderColor: '#1C2D64',
								height: '35px',
								marginBottom: '15px',
								marginLeft: '0',
							}}
							onClick={() => {
								clickFnPDF(
									projectData.dtic_pdf_location_s,
									cloneData.clone_name,
									projectData.dtic_pdf_page_s
								);
							}}
						>
							OPEN DOCUMENT
						</GCPrimaryButton>
					)}
					{projectData.pdf_location_s && (
						<GCPrimaryButton
							style={{
								color: 'white',
								backgroundColor: '#1C2D64',
								borderColor: '#1C2D64',
								height: '35px',
								marginBottom: '15px',
								marginLeft: '0',
							}}
							onClick={() => {
								clickFnPDF(projectData.pdf_location_s, cloneData.clone_name);
							}}
						>
							OPEN FULL PDF
						</GCPrimaryButton>
					)}

					<Metadata
						budgetType={budgetType}
						projectNum={projectNum}
						keywordCheckboxes={keywordCheckboxes}
						setKeywordCheck={setKeywordCheck}
					/>
				</StyledRightContainer>
			</StyledContainer>
			<StyledReviewContainer>
				<StyledReviewLeftContainer>
					{accomplishments && accomplishments.length && accomplishments.length > 0 ? (
						<StyledAccordionContainer id={'Accomplishment'}>
							<GCAccordion
								contentPadding={0}
								expanded={false}
								header={`ACCOMPLISHMENTS ${accomplishments.length}`}
								headerBackground={'rgb(238,241,242)'}
								headerTextColor={'black'}
								headerTextWeight={'600'}
							>
								<Accomplishments accomplishments={accomplishments} />
							</GCAccordion>
						</StyledAccordionContainer>
					) : (
						<></>
					)}
					{contracts.length > 0 && (
						<StyledAccordionContainer id={'Contracts'}>
							<GCAccordion
								contentPadding={0}
								expanded={false}
								header={
									<>
										CONTRACT DATA (FROM GENERAL LEDGER AND FPDS-NG)
										{contracts ? ` (${contracts.length}) ` : ' '}
										<Tooltip placement="top" arrow title={'Contract data may be incomplete.'}>
											<InfoOutlinedIcon />
										</Tooltip>
									</>
								}
								headerBackground={'rgb(238,241,242)'}
								headerTextColor={'black'}
								headerTextWeight={'600'}
							>
								<Contracts contracts={contracts} />
							</GCAccordion>
						</StyledAccordionContainer>
					)}
					{renderReviewSection()}
				</StyledReviewLeftContainer>
				<StyledReviewRightContainer></StyledReviewRightContainer>
			</StyledReviewContainer>
		</div>
	);
};

export default JBookProfilePage;
