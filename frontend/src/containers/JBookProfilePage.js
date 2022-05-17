import React, { useState, useContext, useEffect } from 'react';
import SearchBar from '../components/searchBar/SearchBar';
import GCAccordion from '../components/common/GCAccordion';
import { Typography, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import JBookJAICReviewForm from '../components/modules/jbook/jbookJAICReviewForm';
import JBookServiceReviewForm from '../components/modules/jbook/jbookServiceReviewForm';
import JBookPOCReviewForm from '../components/modules/jbook/jbookPOCReviewForm';
import GCPrimaryButton from '../components/common/GCButton';
import Permissions from '@dod-advana/advana-platform-ui/dist/utilities/permissions';
import { gcOrange } from '../components/common/gc-colors';
import CloseIcon from '@material-ui/icons/Close';
import { getQueryVariable } from '../utils/gamechangerUtils';
import './jbook.css';
import { setState } from '../utils/sharedFunctions';
import Notifications from '../components/notifications/Notifications';
import { getClassLabel, getSearchTerms } from '../utils/jbookUtilities';
import { JBookContext } from '../components/modules/jbook/jbookContext';
import jca_data from '../components/modules/jbook/JCA.json';

import {
	Accomplishments,
	aggregateProjectDescriptions,
	Contracts,
	formatNum,
	BasicData,
	Metadata,
	ProjectDescription,
	SideNav,
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
} from '../components/modules/jbook/profilePage/profilePageStyles';
import Auth from '@dod-advana/advana-platform-ui/dist/utilities/Auth';
import GameChangerAPI from '../components/api/gameChanger-service-api';
const _ = require('lodash');

const gameChangerAPI = new GameChangerAPI();

const JBookProfilePage = (props) => {
	const { cloneData } = props;

	const context = useContext(JBookContext);
	const { state, dispatch } = context;
	const { projectData, reviewData, keywordsChecked } = state;
	const [permissions, setPermissions] = useState({
		is_primary_reviewer: false,
		is_service_reviewer: false,
		is_poc_reviewer: false,
	});

	useEffect(() => {
		if (!state.cloneDataSet) {
			setState(dispatch, { cloneData: cloneData, cloneDataSet: true });
		}
	}, [cloneData, state, dispatch]);

	const [profileLoading, setProfileLoading] = useState(false);
	const [dropdownData, setDropdownData] = useState({});

	const [budgetType, setBudgetType] = useState('');
	const [budgetLineItem, setBudgetLineItem] = useState('');
	const [programElement, setProgramElement] = useState('');
	const [projectNum, setProjectNum] = useState('');
	const [budgetYear, setBudgetYear] = useState('');
	const [id, setID] = useState('');
	const [appropriationNumber, setAppropriationNumber] = useState('');

	const [projectDescriptions, setProjectDescriptions] = useState([]);

	const [searchText, setSearchText] = useState(undefined);
	const [keywordCheckboxes, setKeywordCheckboxes] = useState([]);
	const [isCheckboxSet, setIsCheckboxSet] = useState(false);
	const [accomplishments, setAccomplishments] = useState([]);
	const [contracts, setContracts] = useState([]);
	const [contractMapping, setContractMapping] = useState([]);

	const getProjectData = async (
		programElement,
		projectNum,
		type,
		budgetYear,
		budgetLineItem,
		id,
		appropriationNumber,
		useElasticSearch
	) => {
		setProfileLoading(true);

		let projectData;
		try {
			projectData = await gameChangerAPI.callDataFunction({
				functionName: 'getProjectData',
				cloneName: cloneData.clone_name,
				options: {
					programElement,
					projectNum,
					type,
					budgetYear,
					budgetLineItem,
					id,
					appropriationNumber,
					useElasticSearch,
				},
			});

			if (projectData.data) {
				if (projectData.data.contracts) {
					setContracts(projectData.data.contracts);
					const tempMapping = {};
					for (let i = 0; i < projectData.data.contracts.length; i++) {
						const currentContract = projectData.data.contracts[i];
						if (tempMapping[currentContract.vendorName] === undefined) {
							tempMapping[currentContract.vendorName] = true;
						}
					}
					setContractMapping(tempMapping);
					if (
						projectData.data.review.serviceMissionPartnersChecklist === null ||
						projectData.data.review.serviceMissionPartnersChecklist === undefined
					) {
						projectData.data.review.serviceMissionPartnersChecklist = JSON.stringify(tempMapping);
					}
					if (
						projectData.data.review.pocMissionPartnersChecklist === null ||
						projectData.data.review.pocMissionPartnersChecklist === undefined
					) {
						projectData.data.review.pocMissionPartnersChecklist = JSON.stringify(tempMapping);
					}
				}
			}
		} catch (err) {
			console.log('Error fetching project and review data');
			console.log(err);
		}

		let dropdownData;
		try {
			dropdownData = await gameChangerAPI.callDataFunction({
				functionName: 'getBudgetDropdownData',
				cloneName: cloneData.clone_name,
				options: {},
			});
			setDropdownData(dropdownData.data);
		} catch (err) {
			console.log('Error fetching dropdown data');
			console.log(err);
		}

		setProfileLoading(false);

		setState(dispatch, { projectData: projectData ? projectData.data : {} });
		if (projectData && projectData.data && projectData.data.review) {
			let domainTasks = _.cloneDeep(state.domainTasks);
			if (projectData.data.review.domainTask && projectData.data.review.domainTaskSecondary) {
				domainTasks[projectData.data.review.domainTask] = projectData.data.review.domainTaskSecondary;
			}

			// Review changes to make things behave properly
			if (!projectData.data.review.serviceAgreeLabel || projectData.data.review.serviceAgreeLabel === null) {
				projectData.data.review.serviceAgreeLabel = 'Yes';
			}
			if (
				!projectData.data.review.servicePTPAgreeLabel ||
				projectData.data.review.servicePTPAgreeLabel === null
			) {
				projectData.data.review.servicePTPAgreeLabel = 'Yes';
			}
			// Review changes to make things behave properly
			if (!projectData.data.review.pocAgreeLabel || projectData.data.review.pocAgreeLabel === null) {
				projectData.data.review.pocAgreeLabel = 'Yes';
			}
			if (!projectData.data.review.pocPTPAgreeLabel || projectData.data.review.pocPTPAgreeLabel === null) {
				projectData.data.review.pocPTPAgreeLabel = 'Yes';
			}
			if (!projectData.data.review.pocMPAgreeLabel || projectData.data.review.pocMPAgreeLabel === null) {
				projectData.data.review.pocMPAgreeLabel = 'Yes';
			}

			setState(dispatch, { reviewData: { ...projectData.data.review }, domainTasks });
		}
	};

	useEffect(() => {
		try {
			const url = window.location.href;
			const programElement = getQueryVariable('programElement', url);
			const projectNum = getQueryVariable('projectNum', url);
			const type = getQueryVariable('type', url);
			const budgetLineItem = getQueryVariable('budgetLineItem', url);
			const budgetYear = getQueryVariable('budgetYear', url);
			const searchText = getQueryVariable('searchText', url);
			const id = getQueryVariable('id', url);
			const appropriationNumber = getQueryVariable('appropriationNumber', url);
			const useElasticSearch = getQueryVariable('useElasticSearch', url) === 'true';

			setProgramElement(programElement);
			setProjectNum(projectNum);
			setBudgetType(type);
			setBudgetLineItem(budgetLineItem);
			setBudgetYear(budgetYear);
			setSearchText(searchText);
			setID(id);
			setAppropriationNumber(appropriationNumber);

			getProjectData(
				programElement,
				projectNum,
				type,
				budgetYear,
				budgetLineItem,
				id,
				appropriationNumber,
				useElasticSearch
			);

			if (searchText && searchText !== 'undefined') {
				setState(dispatch, { searchText });
			}
		} catch (err) {
			console.log(err);
			console.log('Error retrieving budget profile page data');
			setProfileLoading(false);
		}

		const userData = Auth.getTokenPayload();

		if (userData.extra_fields && userData.extra_fields.jbook) {
			const tmpPermissions = {
				is_admin: userData.extra_fields.jbook.is_admin,
				is_primary_reviewer: userData.extra_fields.jbook.is_primary_reviewer,
				is_service_reviewer: userData.extra_fields.jbook.is_service_reviewer,
				is_pos_reviewer: userData.extra_fields.jbook.is_pos_reviewer,
			};

			setPermissions(tmpPermissions);
		}

		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		console.log(projectData);
		if (projectData.id) {
			if (!isCheckboxSet) {
				setIsCheckboxSet(true);
				setState(dispatch, { keywordsChecked: projectData.keywords });
				setKeywordCheckboxes(projectData.keywords);
			} else {
				let accomp = [];

				if (projectData.accomplishments) {
					projectData.accomplishments.forEach((accom) => {
						accomp.push({
							title: accom.Accomp_Title_text,
							data: [
								{
									Key: 'Description',
									Value: accom.Accomp_Desc_text ?? '',
								},
								{
									Key: 'Prior Year Plans',
									Value: accom.PlanPrgrm_Fund_CY_Text ?? '',
								},
								{
									Key: 'Prior Year Amount',
									Value: accom.PlanPrgrm_Fund_CY ? formatNum(accom.PlanPrgrm_Fund_CY) : '',
								},
								{
									Key: 'Current Year Plans',
									Value: accom.PlanPrgrm_Fund_BY1Base_Text ?? '',
								},
								{
									Key: 'Current Year Amount',
									Value: accom.PlanPrgrm_Fund_BY1Base ? formatNum(accom.PlanPrgrm_Fund_BY1Base) : '',
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
								accomp[i].data[y].Value = accomp[i].data[y].Value.replaceAll(
									/(^|[^\n])\n(?!\n)/g,
									'$1<br />'
								);
								accomp[i].data[y].Value = accomp[i].data[y].Value.replaceAll(`â¢`, `&bull;`);
								accomp[i].data[y].Value = accomp[i].data[y].Value.replaceAll(`â`, `'`);
							}
						});
					});

					console.log(accomp);
				}

				try {
					// highlight keywords (initially all keywords included)
					// turn the initial matches into checkboxes
					// let projectDescription = projectData.projectMissionDescription ? projectData.projectMissionDescription : projectData.programDescription ? projectData.programDescription : projectData.missionDescBudgetJustification;
					let projectDescriptions = aggregateProjectDescriptions(projectData);

					// take care of weird formatting, translate to HTML:
					for (let i = 0; i < projectDescriptions.length; i++) {
						projectDescriptions[i].value = projectDescriptions[i].value.replaceAll(`â¢`, `&bull;`);
						projectDescriptions[i].value = projectDescriptions[i].value.replaceAll(`â`, `'`);
						projectDescriptions[i].value = projectDescriptions[i].value.replaceAll(
							/(^|[^\n])\n(?!\n)/g,
							'$1<br />'
						);
					}

					if (searchText) {
						const terms = getSearchTerms(searchText);

						for (let i = 0; i < projectDescriptions.length; i++) {
							let matches = [];

							// if there is an or, highlight terms separately
							if (searchText.indexOf('or') !== -1) {
								terms.forEach((term) => {
									const regex = new RegExp(`${term}([a-z]+)?`, 'gi');
									const tmpMatches = projectDescriptions[i].value.match(regex);
									matches = matches.concat(tmpMatches);
								});
							}
							// else highlight as 1 phrase
							else {
								const regex = new RegExp(`${searchText}([a-z]+)?`, 'gi');
								const tmpMatches = projectDescriptions[i].value.match(regex);
								matches = matches.concat(tmpMatches);
							}

							if (matches && matches !== null) {
								for (const match of matches) {
									projectDescriptions[i].value = projectDescriptions[i].value.replaceAll(
										match,
										`<span style="background-color: ${'#1C2D64'}; color: white; padding: 0 4px;">${match}</span>`
									);
								}
							}
						}

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
					}

					if (keywordsChecked) {
						const keywordBoxes = [];
						for (let i = 0; i < projectDescriptions.length; i++) {
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

								let matches = projectDescriptions[i].value.match(regex);
								const hyphenRegex = new RegExp(`${keyword.replace(' ', '-')}([a-z]+)?`, 'gi');
								const hyphenMatches = projectDescriptions[i].value.match(hyphenRegex);
								if (matches === null) {
									matches = hyphenMatches;
								} else {
									matches = matches.concat(hyphenMatches);
								}

								if (keywordsChecked.length > 0 && matches) {
									for (const match of matches) {
										projectDescriptions[i].value = projectDescriptions[i].value.replaceAll(
											match,
											`<span style="background-color: ${gcOrange}; color: white; padding: 0 4px;">${match}</span>`
										);

										if (!isCheckboxSet && keywordBoxes.indexOf(keyword) === -1) {
											keywordBoxes.push(keyword);
										}
									}
								}
							}
						}

						accomp.forEach((accomplishment) => {
							accomplishment.data.forEach((accompObject) => {
								if (accompObject.Key === 'Description' && accompObject.Value !== null) {
									for (const keyword of keywordsChecked) {
										const regex = new RegExp(`${keyword}([a-z]+)?`, 'gi');
										const matches = accompObject.Value.match(regex);

										if (keywordsChecked.length > 0 && matches) {
											for (const match of matches) {
												accompObject.Value = accompObject.Value.replaceAll(
													match,
													`<span style="background-color: ${gcOrange}; color: white; padding: 0 4px;">${match}</span>`
												);
											}
										}
									}
								}
							});
						});

						setProjectDescriptions(projectDescriptions);
						setAccomplishments(accomp);

						// if we haven't set checkboxes up yet
						if (!isCheckboxSet) {
							setIsCheckboxSet(true);
							setKeywordCheckboxes(keywordBoxes.sort());
							setState(dispatch, { keywordsChecked: keywordBoxes });
						}
					}
				} catch (err) {
					console.log('Error setting highlights');
					console.log(err);
				}
			}
		}
	}, [projectData, keywordsChecked, dispatch, isCheckboxSet, searchText]);

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
				<CloseButton>
					<CloseIcon fontSize="large" />
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

	const setReviewData = (field, value) => {
		let newReviewData = _.cloneDeep(reviewData);

		const { domainTasks, serviceValidation, pocValidation } = state;
		const { domainTask } = reviewData;
		let newDomainTasks = _.cloneDeep(domainTasks);
		let newServiceValidation;
		let newPOCValidation;

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
					primaryReviewNotes: null,
				};
				break;
			case 'serviceForm':
				newReviewData = {
					...newReviewData,
					serviceMissionPartnersList: null,
					serviceMissionPartnersChecklist: JSON.stringify(contractMapping),
					serviceAgreeLabel: 'Yes',
					primaryClassLabel: null,
					servicePTPAgreeLabel: 'Yes',
					servicePlannedTransitionPartner: null,
					otherMissionPartners: null,
					servicePOCTitle: null,
					servicePOCName: null,
					servicePOCEmail: null,
					servicePOCOrg: null,
					servicePOCPhoneNumber: null,
					serviceReviewerNotes: null,
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
					pocAIType: null,
					pocAIRoleDescription: null,
					pocAITypeDescription: null,
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

				newDomainTasks = {
					'Natural Language Processing': [],
					'Sensing and Perception': [],
					'Planning, Scheduling, and Reasoning': [],
					'Prediction and Assessment': [],
					'Modeling and Simulation': [],
					'Human-Machine Interaction': [],
					'Responsible AI': [],
					Other: [],
				};
				break;
			case 'domainTaskSecondary':
				if (domainTasks[domainTask]) {
					const index = newDomainTasks[domainTask].indexOf(value);

					if (index !== -1) {
						newDomainTasks[domainTask].splice(index, 1);
					} else {
						newDomainTasks[domainTask].push(value);
					}
				}

				newReviewData.domainTaskSecondary = newDomainTasks[domainTask];
				break;
			case 'domainTaskOther':
				if (domainTasks['Other'].length > 0) {
					newDomainTasks['Other'][0] = value;
				} else {
					newDomainTasks['Other'].push(value);
				}
				newReviewData.domainTaskSecondary = newDomainTasks['Other'];
				break;
			case 'setMissionPartners':
				if (!newReviewData.serviceMissionPartnersList) {
					newReviewData.serviceMissionPartnersList = '';
				}
				newReviewData.serviceMissionPartnersList = value.join('|');
				break;
			case 'setMissionPartnersChecklist':
				if (!newReviewData.serviceMissionPartnersChecklist) {
					newReviewData.serviceMissionPartnersChecklist = '';
				}
				newReviewData.serviceMissionPartnersChecklist = JSON.stringify(value);
				break;
			case 'setPOCMissionPartners':
				if (!newReviewData.pocMissionPartnersList) {
					newReviewData.pocMissionPartnersList = '';
				}
				newReviewData.pocMissionPartnersList = value.join('|');
				break;
			case 'setPOCMissionPartnersChecklist':
				if (!newReviewData.pocMissionPartnersChecklist) {
					newReviewData.pocMissionPartnersChecklist = '';
				}
				newReviewData.pocMissionPartnersChecklist = JSON.stringify(value);
				break;
			case 'domainTask':
				if (newReviewData.domainTask === value) {
					newReviewData.domainTask = '';
				} else {
					newReviewData[field] = value;
				}
				break;
			case 'pocJointCapabilityArea':
				if (newReviewData.pocJointCapabilityArea === value) {
					newReviewData.pocJointCapabilityArea = '';
					newReviewData.pocJointCapabilityArea2 = [];
					newReviewData.pocJointCapabilityArea3 = [];
				} else {
					newReviewData[field] = value;
					newReviewData.pocJointCapabilityArea2 = [];
					newReviewData.pocJointCapabilityArea3 = [];
				}
				break;
			case 'pocJointCapabilityArea2':
				const JCAindex2 = newReviewData['pocJointCapabilityArea2'].indexOf(value);
				if (JCAindex2 !== -1) {
					const tier3 = Object.keys(jca_data[newReviewData.pocJointCapabilityArea][value]);
					newReviewData.pocJointCapabilityArea3 = newReviewData.pocJointCapabilityArea3.filter(
						(val) => tier3.indexOf(val) === -1
					);
					newReviewData.pocJointCapabilityArea2.splice(JCAindex2, 1);
				} else {
					newReviewData[field].push(value);
				}
				break;
			case 'pocJointCapabilityArea3':
				const JCAindex3 = newReviewData['pocJointCapabilityArea3'].indexOf(value);
				if (JCAindex3 !== -1) {
					newReviewData.pocJointCapabilityArea3.splice(JCAindex3, 1);
				} else {
					newReviewData[field].push(value);
				}
				break;
			case 'clearJCA':
				newReviewData.pocJointCapabilityArea = '';
				break;
			case 'clearDomainTask':
				newReviewData.domainTask = '';
				newReviewData.domainTaskSecondary = [];
				newDomainTasks = {
					'Natural Language Processing': [],
					'Sensing and Perception': [],
					'Planning, Scheduling, and Reasoning': [],
					'Prediction and Assessment': [],
					'Modeling and Simulation': [],
					'Human-Machine Interaction': [],
					'Responsible AI': [],
					Other: [],
				};
				break;
			case 'clearDataType':
				newReviewData.pocAIType = '';
				break;
			case 'pocSlider':
				newReviewData.pocDollarsAttributed = value.pocDollarsAttributed;
				newReviewData.pocPercentageAttributed = value.pocPercentageAttributed;
				break;
			default:
				newReviewData[field] = value !== null ? value : '';
				break;
		}

		stateObject.reviewData = newReviewData;
		stateObject.domainTasks = newDomainTasks;

		if (field in serviceValidation && value && value.length > 0) {
			newServiceValidation = _.cloneDeep(serviceValidation);
			newServiceValidation[field] = true;
			stateObject.serviceValidation = newServiceValidation;
		} else if (field in pocValidation && value && value.length > 0) {
			newPOCValidation = _.cloneDeep(pocValidation);
			newPOCValidation[field] = true;
			stateObject.pocValidation = newPOCValidation;
		}

		setState(dispatch, stateObject);
	};

	const validateForm = (form) => {
		const { reviewData } = state;
		const validationForm = _.cloneDeep(state[form + 'Validation']);
		let validated = true;
		for (const field of Object.keys(validationForm)) {
			const fieldValue = reviewData[field];

			if (field === 'amountAttributed') {
				if (getClassLabel(reviewData) !== 'Not AI') {
					let dollarsAttributed = reviewData['pocDollarsAttributed'];
					let percentageAttributed = reviewData['pocPercentageAttributed'];

					validationForm[field] =
						(dollarsAttributed !== undefined && dollarsAttributed !== null && dollarsAttributed !== '') ||
						(percentageAttributed !== undefined &&
							percentageAttributed !== null &&
							percentageAttributed !== '');

					if (validationForm[field] === false) {
						validated = false;
					}
				} else {
					validationForm[field] = true;
				}
			} else if (field === 'servicePlannedTransitionPartner') {
				validationForm[field] =
					reviewData['servicePTPAgreeLabel'] === 'Yes' ||
					(fieldValue !== null && fieldValue !== undefined && fieldValue !== '');
			} else if (field === 'serviceClassLabel') {
				validationForm[field] =
					reviewData['serviceAgreeLabel'] === 'Yes' ||
					(fieldValue !== null && fieldValue !== undefined && fieldValue !== '');
			} else if (field === 'pocClassLabel') {
				validationForm[field] =
					reviewData['pocAgreeLabel'] === 'Yes' ||
					(fieldValue !== null && fieldValue !== undefined && fieldValue !== '');
			} else if (field === 'pocMissionPartners') {
				validationForm[field] =
					reviewData['pocMPAgreeLabel'] === 'Yes' ||
					(fieldValue !== null && fieldValue !== undefined && fieldValue !== '');
			} else if (field === 'pocPlannedTransitionPartner') {
				validationForm[field] =
					reviewData['pocPTPAgreeLabel'] === 'Yes' ||
					(fieldValue !== null && fieldValue !== undefined && fieldValue !== '');
			} else if (getClassLabel(reviewData) === 'AI Enabling' || getClassLabel(reviewData) === 'Not AI') {
				if (
					!(
						field === 'domainTask' ||
						field === 'pocJointCapabilityArea' ||
						field === 'roboticsSystemAgree' ||
						field === 'intelligentSystemsAgree' ||
						field === 'pocAIType' ||
						field === 'pocAITypeDescription' ||
						field === 'pocAIRoleDescription'
					)
				) {
					validationForm[field] = fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
					if (validationForm[field] === false) {
						validated = false;
					}
				} else {
					validationForm[field] = true;
				}
			} else {
				validationForm[field] = fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
				if (validationForm[field] === false) {
					validated = false;
				}
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
			await gameChangerAPI.callDataFunction({
				functionName: 'storeBudgetReview',
				cloneName: cloneData.clone_name,
				options: {
					frontendReviewData: {
						...reviewData,
						budgetType: budgetType,
						revProgramElement: programElement,
						id: undefined,
						revBudgetLineItems: budgetLineItem,
						budgetYear: budgetYear,
					},
					isSubmit,
					reviewType,
					projectNum,
					appropriationNumber,
				},
			});

			getProjectData(programElement, projectNum, budgetType, budgetYear, budgetLineItem, id, appropriationNumber);
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
			},
		});
		await getProjectData(
			programElement,
			projectNum,
			budgetType,
			budgetYear,
			budgetLineItem,
			id,
			appropriationNumber
		);
		setState(dispatch, { [loading]: false });
	};

	const setKeywordCheck = (keyword, keywordsChecked) => {
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

	const scorecardData = (classification, reviewData) => {
		let data = [];

		if (classification && classification.modelPredictionProbability && classification.modelPrediction) {
			let num = classification.modelPredictionProbability;
			num = num.toString(); //If it's not already a String
			num = num.slice(0, num.indexOf('.') + 3); //With 3 exposing the hundredths place
			Number(num); //If you need it back as a Number

			data.push({
				name: 'Predicted Tag',
				description:
					'The AI tool classified the BLI as "' +
					classification.modelPrediction +
					'" with a confidence score of ' +
					num,
				value: num,
			});
		}
		if (reviewData.primaryReviewStatus === 'Finished Review') {
			data.push({
				name: 'Reviewer Tag',
				description:
					reviewData.primaryReviewer + ' classified this document as "' + reviewData.primaryClassLabel + '"',
				timestamp: new Date(reviewData.updatedAt).toLocaleDateString(),
				justification: reviewData.primaryReviewNotes ? reviewData.primaryReviewNotes : '',
			});
		}

		return data;
	};

	return (
		<div>
			<Notifications context={context} />
			<SearchBar context={context} />
			<SideNav context={context} budgetType={budgetType} budgetYear={budgetYear} />
			<StyledContainer>
				<div style={{ width: '400px' }}>
					{/* <BasicData
						budgetType={budgetType}
						admin={Permissions.hasPermission('JBOOK Admin')}
						loading={profileLoading}
						programElement={programElement}
						projectNum={projectNum}
						budgetYear={budgetYear}
						budgetLineItem={budgetLineItem}
						id={id}
						appropriationNumber={appropriationNumber}
					/> */}
					<ClassificationScoreCard scores={scorecardData(projectData.classification, reviewData)} />
				</div>

				<ProjectDescription
					profileLoading={profileLoading}
					projectData={projectData}
					programElement={programElement}
					projectNum={projectNum}
					projectDescriptions={projectDescriptions}
				/>
				<Metadata
					budgetType={budgetType}
					projectNum={projectNum}
					keywordCheckboxes={keywordCheckboxes}
					setKeywordCheck={setKeywordCheck}
				/>
			</StyledContainer>
			<StyledReviewContainer>
				<StyledReviewLeftContainer>
					{accomplishments && accomplishments.length && accomplishments.length > 0 ? (
						<StyledAccordionContainer id={'Accomplishment'}>
							<GCAccordion
								contentPadding={0}
								expanded={false}
								header={`ACCOMPLISHMENTS ${accomplishments ? `(${accomplishments.length})` : ''}`}
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
								header={`CONTRACT DATA (FROM GENERAL LEDGER AND FPDS-NG) ${
									contracts ? `(${contracts.length})` : ''
								}`}
								headerBackground={'rgb(238,241,242)'}
								headerTextColor={'black'}
								headerTextWeight={'600'}
							>
								<Contracts contracts={contracts} />
							</GCAccordion>
						</StyledAccordionContainer>
					)}
					<StyledAccordionContainer id={'Primary Reviewer Section'}>
						<GCAccordion
							contentPadding={0}
							expanded={true}
							headerWidth="100%"
							header={
								<StyledAccordionHeader headerWidth="100%">
									<strong>PRIMARY REVIEWER</strong>
									<FiberManualRecordIcon
										style={{
											color:
												reviewData.primaryReviewStatus === 'Finished Review'
													? 'green'
													: '#F9B32D',
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
								setReviewData={setReviewData}
								dropdownData={dropdownData}
								reviewerProp={projectData.reviewer}
								serviceReviewerProp={projectData.serviceReview}
							/>
						</GCAccordion>
					</StyledAccordionContainer>

					<StyledAccordionContainer id={'Service / DoD Component Reviewer Section'}>
						<GCAccordion
							contentPadding={0}
							expanded={true}
							headerWidth="100%"
							header={
								<StyledAccordionHeader>
									<strong>SERVICE REVIEWER</strong>
									<FiberManualRecordIcon
										style={{
											color:
												reviewData.serviceReviewStatus === 'Finished Review'
													? 'green'
													: '#F9B32D',
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
													Auth.getTokenPayload().email ===
														reviewData.serviceSecondaryReviewerEmail)
										  )
								}
								reviewStatus={reviewData.serviceReviewStatus ?? 'Needs Review'}
								finished={reviewData.serviceReviewStatus === 'Finished Review'}
								submitReviewForm={submitReviewForm}
								setReviewData={setReviewData}
								vendorData={projectData.vendors}
								dropdownData={dropdownData}
							/>
						</GCAccordion>
					</StyledAccordionContainer>

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
											color:
												reviewData.pocReviewStatus === 'Finished Review' ? 'green' : '#F9B32D',
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
								roleDisabled={
									Permissions.hasPermission('JBOOK Admin')
										? false
										: !(
												Permissions.hasPermission('JBOOK POC Reviewer') &&
												(Auth.getTokenPayload().email === reviewData.servicePOCEmail ||
													Auth.getTokenPayload().email === reviewData.altPOCEmail)
										  )
								}
								reviewStatus={reviewData.pocReviewStatus ?? 'Needs Review'}
								dropdownData={dropdownData}
								vendorData={projectData.vendors}
								submitReviewForm={submitReviewForm}
								setReviewData={setReviewData}
								totalBudget={
									projectData.currentYearAmount && projectData.currentYearAmount > 0
										? projectData.currentYearAmount
										: projectData.currentYearAmountMax && projectData.currentYearAmountMax > 0
										? projectData.currentYearAmountMax
										: 3000
								}
							/>
						</GCAccordion>
					</StyledAccordionContainer>
				</StyledReviewLeftContainer>
				<StyledReviewRightContainer></StyledReviewRightContainer>
			</StyledReviewContainer>
		</div>
	);
};

export default JBookProfilePage;
