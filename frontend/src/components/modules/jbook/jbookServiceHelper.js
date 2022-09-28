import React, { useState, useEffect } from 'react';
import {
	StyledTableKeyContainer,
	StyledTableValueContainer,
	StyledInlineContainer,
	StyledFooterDiv,
	ButtonStyles,
} from './profilePage/profilePageStyles';
import { TextField, Typography, CircularProgress, Tooltip } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { renderMissionPartnersCheckboxes } from './missionPartnerChecklist';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import GCPrimaryButton from '../../common/GCButton';
import { setState } from '../../../utils/sharedFunctions';

const errorColor = '#F44336';

const boldKeys = (data) => {
	return data.map((pair) => {
		pair.Key = <strong>{pair.Key}</strong>;
		return pair;
	});
};

const useStyles = makeStyles((theme) => ({
	customWidth: {
		maxWidth: 1050,
		padding: '15px 10px 15px 0',
	},
	autocompleteError: {
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: errorColor,
		},
		'&:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: '#c7382e',
		},
	},
	labelError: {
		color: errorColor,
	},
	cssOutlinedInput: {
		'&$cssFocused $notchedOutline': {
			borderColor: `${errorColor}`,
		},
		'&:hover $notchedOutline': {
			borderColor: `#c7382e`,
		},
	},
	cssFocused: {},
	notchedOutline: {
		borderColor: 'red',
	},
}));

const firstColWidth = {
	maxWidth: 100,
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const staticAIPartners = [
	'Alion Science and Technology Corporation',
	'Austal USA LLC',
	'General Dynamics Corporation',
	'Innovative Professional Solutions Inc.',
	'Johns Hopkins University',
	'Raytheon Company',
	'Saic Gemini Inc.',
	'Technical Systems Integration Inc.',
	'Textron Inc.',
	'Unknown',
];

const StyledChip = withStyles({
	label: {
		fontSize: '1.5rem',
	},
})(Chip);

const ReviewStatus = React.memo((props) => {
	const { reviewStatus, finished } = props;

	return (
		<div style={{ margin: '0 0 15px 0' }}>
			<Typography
				variant="subtitle1"
				style={{ color: finished ? 'green' : '#F9B32D', fontSize: '18px', textAlign: 'right' }}
			>
				{reviewStatus}
			</Typography>
		</div>
	);
});

const SecondaryReviewerKey = React.memo(() => {
	return (
		<StyledTableKeyContainer>
			<strong>Secondary Reviewer</strong>
			<Typography variant="subtitle1" style={{ fontSize: 12 }}>
				Service Level Reviewers can select a secondary reviewer for this Program/Project from the dropdown menu.
				Once selected and saved, the Secondary Reviewer Name will populate as the Reviewer on the Reviewer
				checklist tab and the review will be the responsibility of the Secondary Reviewer.
			</Typography>
		</StyledTableKeyContainer>
	);
});

const SecondaryReviewerValue = React.memo((props) => {
	const { dropdownData, serviceSecondaryReviewer, setReviewDataMultiple, finished } = props;
	const reviewers = {};
	if (dropdownData.secondaryReviewers) {
		dropdownData.secondaryReviewers.forEach((reviewer) => {
			const display = `${reviewer.name}${
				reviewer?.organization?.length > 1 ? ` (${reviewer.organization})` : ''
			}`;
			reviewers[display] = {
				display,
				...reviewer,
			};
		});
	}

	return (
		<StyledTableValueContainer>
			<StyledInlineContainer>
				<div />
				<Autocomplete
					size="small"
					options={Object.keys(reviewers)}
					style={{ width: 300, backgroundColor: 'white' }}
					renderInput={(params) => <TextField {...params} label="Secondary" variant="outlined" />}
					value={serviceSecondaryReviewer ?? null}
					onChange={(_event, value) => {
						setReviewDataMultiple({
							serviceSecondaryReviewer: value,
							serviceSecondaryReviewerEmail: reviewers[value]?.email,
						});
					}}
					disabled={finished}
				/>
			</StyledInlineContainer>
		</StyledTableValueContainer>
	);
});

const LabelingValidationKey = React.memo(() => {
	const classes = useStyles();

	return (
		<StyledTableKeyContainer>
			<strong>
				Tagging Validation
				<Tooltip
					classes={{ tooltip: classes.customWidth }}
					placement="right"
					arrow
					title={
						<div style={{ width: '1000px' }}>
							<ul>
								<li>
									<i>Core AI</i> programs develop AI applications such as machine learning/deep
									learning, collaborative behavior, computer vision, human-machine teaming, automated
									reasoning, robotic autonomy, automated data fusion, and self-healing networks. DoD’s
									RDT&E programs are not the only source of Core AI for the Department; private sector
									R&D and commercially available products may also provide Core AI applications for
									incorporation into DoD systems. By this definition, Core AI spending is always RDT&E
									spending.
								</li>
								<hr />
								<li>
									<i>AI-enabled</i> programs develop the gamut of DoD warfighting and business
									systems, incorporating Core AI applications for analyzing, automating,
									communicating, maneuvering, monitoring, sensing, and many other tasks. While AI
									spending is usually a small percentage of these programs, their system’s performance
									may be critically dependent upon the incorporation of Core AI.
								</li>
								<hr />
								<li>
									<i>AI-enabling</i> programs include technologies such as cloud computing and
									advanced microelectronics required to support the deployment of effective AI-enabled
									capabilities at scale.
								</li>
							</ul>
						</div>
					}
				>
					<InfoOutlinedIcon style={{ margin: '-2px 5px' }} />
				</Tooltip>
			</strong>
			<Typography variant="subtitle1" style={{ fontSize: 12 }}>
				Select whether you agree or disagree with the JAIC’s determination of the tag for this Program/Project
				as Core AI, AI Enabled, AI Enabling or Not AI. If you disagree with the JAIC’s tagging, simply select No
				from the Agree/Disagree dropdown and enter your assessment of the correct tag based on the definitions
				above in the “How would you tag this effort” dropdown.
			</Typography>
		</StyledTableKeyContainer>
	);
});

const LabelingValidationValue = React.memo((props) => {
	const {
		serviceAgreeLabel,
		setReviewData,
		dropdownData,
		primaryClassLabel,
		serviceClassLabel,
		finished,
		serviceValidated,
		serviceValidation,
	} = props;

	const classes = useStyles();

	return (
		<StyledTableValueContainer>
			<StyledInlineContainer>
				<Typography variant="subtitle1" style={{ fontSize: 16 }}>
					Do you agree with the tagging validation for this effort?
				</Typography>
				<Autocomplete
					size="small"
					options={['Yes', 'No']}
					style={{ width: 300 }}
					renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
					value={serviceAgreeLabel ?? 'Yes'}
					onChange={(event, value) => setReviewData('serviceAgreeLabel', value)}
					disabled={finished} //|| roleDisabled}
					disableClearable
				/>
			</StyledInlineContainer>
			<StyledInlineContainer>
				<Typography variant="subtitle1" style={{ fontSize: 16 }}>
					If not, how would you tag this effort?{' '}
				</Typography>
				<Autocomplete
					size="small"
					style={{ width: 300 }}
					options={dropdownData && dropdownData.primaryClassLabel ? dropdownData.primaryClassLabel : []}
					getOptionLabel={(option) => option.primary_class_label ?? ''}
					getOptionSelected={(option, value) => option.primary_class_label === value.primary_class_label}
					renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
					onChange={(event, value) => setReviewData('serviceClassLabel', value.primary_class_label)}
					value={
						serviceClassLabel || primaryClassLabel
							? { primary_class_label: serviceClassLabel ?? primaryClassLabel }
							: null
					}
					disabled={finished || (!finished && serviceAgreeLabel === 'Yes')} //|| roleDisabled}
					disableClearable
					classes={{
						inputRoot:
							!serviceValidated && !serviceValidation.serviceClassLabel && serviceAgreeLabel === 'No'
								? classes.autocompleteError
								: '',
					}}
				/>
			</StyledInlineContainer>
		</StyledTableValueContainer>
	);
});

const TransitionPartnersKey = React.memo(() => {
	const classes = useStyles();

	return (
		<StyledTableKeyContainer>
			<strong>
				{' '}
				Transition Partners{' '}
				<Tooltip
					classes={{ tooltip: classes.customWidth }}
					placement="right"
					arrow
					title={
						<div style={{ width: '1000px', paddingLeft: '15px' }}>
							Transition Is Defined As:
							<ul>
								<li>
									The process of applying critical technology in military systems to provide an
									effective weapons or support system—in the quantity and quality needed by the
									operators to carry out assigned missions and at the “best value” as measured by the
									technology sponsor and customer.
								</li>
								<hr />
								<li>
									The process by which technology deemed to be of significant use to the operational
									military community is transitioned from the science and technology environment to a
									military operational field unit for evaluation and then:
									<ul>
										<li>Incorporated into an existing acquisition program or</li>
										<li>Identified as the subject matter for a new acquisition program.</li>
									</ul>
								</li>
							</ul>
							The transition partner is defined as the DoD Entity responsible for executing the transition
							processes described above
						</div>
					}
				>
					<InfoOutlinedIcon style={{ margin: '-2px 5px' }} />
				</Tooltip>
			</strong>
			<Typography variant="subtitle1" style={{ fontSize: 12 }}>
				Select whether you agree or disagree with the JAIC’s determination of the transition partner from the
				Transition Partner dropdown. If you disagree with the JAIC’s selection of transition partner, simply
				select No from the Agree/Disagree dropdown and enter your assessment of the correct transition partner
				based on the definitions above in the “If not, add them here” dropdown.
			</Typography>
		</StyledTableKeyContainer>
	);
});

const TransitionPartnersValue = React.memo((props) => {
	const {
		finished,
		setReviewData,
		servicePTPAgreeLabel,
		dropdownData,
		servicePlannedTransitionPartner,
		primaryPlannedTransitionPartner,
		serviceValidated,
		serviceValidation,
	} = props;

	const classes = useStyles();

	return (
		<StyledTableValueContainer>
			<StyledInlineContainer>
				<Typography variant="subtitle1" style={{ fontSize: 16 }}>
					Do you agree with the transition partner for this effort?
				</Typography>
				<Autocomplete
					style={{ backgroundColor: 'white', width: 300 }}
					size="small"
					options={['Yes', 'No']}
					renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
					onChange={(_event, value) => setReviewData('servicePTPAgreeLabel', value)}
					value={servicePTPAgreeLabel ?? 'Yes'}
					disabled={finished} //|| roleDisabled}
					disableClearable
				/>
			</StyledInlineContainer>
			<StyledInlineContainer>
				<Typography variant="subtitle1" style={{ fontSize: 16 }}>
					If not, what transition partner would you identify for this effort?{' '}
				</Typography>
				<Autocomplete
					size="small"
					style={{ width: 300 }}
					options={dropdownData && dropdownData.transitionPartners ? dropdownData.transitionPartners : []}
					renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
					onChange={(_event, value) => setReviewData('servicePlannedTransitionPartner', value)}
					value={
						servicePlannedTransitionPartner || primaryPlannedTransitionPartner
							? servicePlannedTransitionPartner ?? primaryPlannedTransitionPartner
							: null
					}
					disabled={finished || (!finished && servicePTPAgreeLabel === 'Yes')} //|| roleDisabled}
					disableClearable
					classes={{
						inputRoot:
							!serviceValidated &&
							!serviceValidation.servicePlannedTransitionPartner &&
							servicePTPAgreeLabel === 'No'
								? classes.autocompleteError
								: '',
					}}
				/>
			</StyledInlineContainer>
		</StyledTableValueContainer>
	);
});

const MissionPartnersKey = React.memo(() => {
	return (
		<StyledTableKeyContainer>
			<strong>Academic/Industry Mission Partners</strong>
			<Typography variant="subtitle1" style={{ fontSize: 12 }}>
				The checkboxes at the right provide Academic/Industry Mission Partners (defined as the entity executing
				the Program/Project in Academia or Industry) identified based on contracts data. Please uncheck any
				Academic/Industry Mission Partners that do not involve AI. If no partners are listed, or if any are
				missing, use the box to provide more.
			</Typography>
		</StyledTableKeyContainer>
	);
});

const MissionPartnersValue = React.memo((props) => {
	const {
		setReviewData,
		vendorData,
		finished,
		serviceMissionPartners, // from reviewData
		serviceMissionPartnersChecklist, //
	} = props;

	const [missionPartners, setMissionPartners] = useState([]);
	const [missionPartnersChecklist, setMissionPartnersChecklist] = useState({});

	useEffect(() => {
		if (Array.isArray(serviceMissionPartners)) {
			setMissionPartners(serviceMissionPartners);
		} else {
			setMissionPartners(serviceMissionPartners ? serviceMissionPartners.split('|') : []);
		}
	}, [serviceMissionPartners]);

	useEffect(() => {
		if (Object.prototype.toString.call(serviceMissionPartnersChecklist) === '[object Object]') {
			setMissionPartnersChecklist(serviceMissionPartnersChecklist);
		} else {
			setMissionPartnersChecklist(
				serviceMissionPartnersChecklist ? JSON.parse(serviceMissionPartnersChecklist) : {}
			);
		}
	}, [serviceMissionPartnersChecklist]);

	return (
		<StyledTableValueContainer>
			<StyledInlineContainer>
				<Typography variant="subtitle1" style={{ fontSize: 16 }}>
					Based on our analysis of contract data, please uncheck any academic and industry mission partners
					for this effort that do not involve AI. Select all that apply. If no partners are listed, use the
					dropdown box to provide more.
				</Typography>
			</StyledInlineContainer>
			{renderMissionPartnersCheckboxes(
				(value) => {
					setReviewData('setMissionPartnersChecklist', value);
				},
				missionPartnersChecklist,
				finished
			)}
			<Autocomplete
				multiple
				id={'serviceMissionPartners'}
				options={
					vendorData && vendorData.length > 0 ? [...new Set(vendorData), 'Unknown'].sort() : staticAIPartners
				}
				freeSolo
				renderTags={(value, getTagProps) =>
					value.map((option, index) => (
						<StyledChip variant={'default'} label={option} {...getTagProps({ index })} />
					))
				}
				renderInput={(params) => (
					<TextField {...params} variant={'outlined'} placeholder={'Missions Partners'} />
				)}
				onChange={(event, value) => {
					setReviewData('setMissionPartners', value);
				}}
				value={missionPartners}
				disabled={finished}
			/>
		</StyledTableValueContainer>
	);
});

const AIPOCKey = React.memo(() => {
	return (
		<StyledTableKeyContainer>
			<strong>AI Point of Contact (POC) for Effort</strong>
			<Typography variant="subtitle1" style={{ fontSize: 12 }}>
				Enter the AI Point of Contact for this Program/Project in the POC section of the Service Reviewer
				Section. A suitable type of POC would be the Program Element Monitor. Select the POC's name from the
				drop-down. If they are not an option please follow this link.
			</Typography>
		</StyledTableKeyContainer>
	);
});

const AIPOCValue = React.memo((props) => {
	const {
		setReviewData,
		finished,
		dropdownData,
		serviceValidated,
		serviceValidation,
		servicePOCTitle, // from reviewData
		servicePOCName, //
		servicePOCEmail, //
		servicePOCOrg, //
		servicePOCPhoneNumber, //
	} = props;

	const classes = useStyles();

	return (
		<StyledTableValueContainer>
			<StyledInlineContainer justifyContent={'left'}>
				<Typography variant="subtitle1" style={{ fontSize: 16, marginRight: 20, width: 90 }}>
					POC Name
				</Typography>
				<Autocomplete
					style={{ backgroundColor: 'white', width: '40%' }}
					size="small"
					options={Object.keys(dropdownData.pocReviewers).map((poc) => poc)}
					renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
					onChange={(_event, value) => setReviewData('servicePOC', dropdownData.pocReviewers[value])}
					value={servicePOCName ?? null}
					disabled={finished} //|| roleDisabled}
					disableClearable
					noOptionsText={
						<Tooltip placement="top" arrow title={'This is a tooltip'}>
							<div>No Options</div>
						</Tooltip>
					}
				/>
			</StyledInlineContainer>
			<StyledInlineContainer justifyContent={'left'}>
				<Typography variant="subtitle1" style={{ fontSize: 16, marginRight: 20, width: 90 }}>
					POC Title
				</Typography>
				<TextField
					placeholder="Title"
					variant="outlined"
					value={servicePOCTitle ?? null}
					style={{ backgroundColor: 'white', width: '40%' }}
					size="small"
					disabled={true}
					InputProps={
						!serviceValidated && !serviceValidation.pocTitle
							? {
									classes: {
										root: classes.cssOutlinedInput,
										focused: classes.cssFocused,
										notchedOutline: classes.notchedOutline,
									},
							  }
							: {}
					}
				/>
			</StyledInlineContainer>
			<StyledInlineContainer justifyContent={'left'}>
				<Typography variant="subtitle1" style={{ fontSize: 16, marginRight: 20, width: 90 }}>
					POC Email
				</Typography>
				<TextField
					placeholder="Email"
					variant="outlined"
					value={servicePOCEmail ?? null}
					style={{ backgroundColor: 'white', width: '40%' }}
					size="small"
					disabled={true}
					InputProps={
						!serviceValidated && !serviceValidation.pocEmail
							? {
									classes: {
										root: classes.cssOutlinedInput,
										focused: classes.cssFocused,
										notchedOutline: classes.notchedOutline,
									},
							  }
							: {}
					}
				/>
			</StyledInlineContainer>
			<StyledInlineContainer justifyContent={'left'}>
				<Typography variant="subtitle1" style={{ fontSize: 16, marginRight: 20, width: 90 }}>
					POC Org
				</Typography>
				<TextField
					placeholder="Org"
					variant="outlined"
					value={servicePOCOrg ?? null}
					style={{ backgroundColor: 'white', width: '40%' }}
					size="small"
					disabled={true}
					InputProps={
						!serviceValidated && !serviceValidation.pocOrg
							? {
									classes: {
										root: classes.cssOutlinedInput,
										focused: classes.cssFocused,
										notchedOutline: classes.notchedOutline,
									},
							  }
							: {}
					}
				/>
			</StyledInlineContainer>
			<StyledInlineContainer justifyContent={'left'}>
				<Typography variant="subtitle1" style={{ fontSize: 16, marginRight: 20, width: 90 }}>
					POC Phone Number
				</Typography>
				<TextField
					placeholder="Phone Number"
					variant="outlined"
					value={servicePOCPhoneNumber ?? null}
					style={{ backgroundColor: 'white', width: '40%' }}
					size="small"
					disabled={true}
					InputProps={
						!serviceValidated && !serviceValidation.pocPhoneNumber
							? {
									classes: {
										root: classes.cssOutlinedInput,
										focused: classes.cssFocused,
										notchedOutline: classes.notchedOutline,
									},
							  }
							: {}
					}
				/>
			</StyledInlineContainer>
		</StyledTableValueContainer>
	);
});

const ReviewerNotesKey = React.memo(() => {
	return (
		<StyledTableKeyContainer>
			<strong>Reviewer Notes</strong>
			<Typography variant="subtitle1" style={{ fontSize: 12 }}>
				Please add any other relevant information to the Reviewer Notes Text Box.
			</Typography>
		</StyledTableKeyContainer>
	);
});

const ReviewerNotesValue = React.memo((props) => {
	const {
		setReviewData,
		finished,
		serviceReviewerNotes, // from reviewData
	} = props;

	const [reviewerNotes, setReviewerNotes] = useState(serviceReviewerNotes);

	useEffect(() => {
		setReviewerNotes(serviceReviewerNotes);
	}, [serviceReviewerNotes]);

	return (
		<StyledTableValueContainer>
			<TextField
				placeholder="Reviewer Notes"
				variant="outlined"
				value={reviewerNotes}
				style={{ backgroundColor: 'white', width: '100%' }}
				onBlur={(event) => setReviewData('serviceReviewerNotes', event.target.value)}
				onChange={(event, value) => setReviewerNotes(value)}
				inputProps={{
					style: {
						width: '100%',
					},
				}}
				rows={6}
				multiline
				disabled={finished} //|| roleDisabled}
			/>
		</StyledTableValueContainer>
	);
});

const ServiceDescriptionText = React.memo(() => {
	return (
		<StyledTableValueContainer>
			<Typography variant="subtitle1" style={{ fontSize: 12 }}>
				Once your review is complete, click the submit finished review button to save your entries/information.
				You can also Save a partial review to finish later by clicking the Save Partial Review button or you can
				reset the Service Reviewer Section to blank values by clicking the reset Form Buttons.
			</Typography>
			<hr />
			<Typography variant="subtitle1" style={{ fontSize: 12, color: errorColor }}>
				Do not click "Submit (Finished Service Review)" until all fields in the Service Reviewer section have
				been filled in.
			</Typography>
		</StyledTableValueContainer>
	);
});

const ButtonFooter = React.memo((props) => {
	const {
		serviceValidated,
		finished,
		roleDisabled,
		setReviewData,
		primaryReviewLoading,
		submitReviewForm,
		dispatch,
	} = props;

	return (
		<StyledFooterDiv>
			{!serviceValidated && <span style={{ color: errorColor }}>Please fill out the highlighted fields</span>}
			{finished && !roleDisabled && (
				<Tooltip
					placement="top"
					arrow
					title={'This button will re-enable the service level review for editing'}
				>
					<GCPrimaryButton
						style={ButtonStyles.main}
						onClick={() => setState(dispatch, { ServiceModalOpen: true })}
					>
						Re-Enable (Partial Service Review)
					</GCPrimaryButton>
				</Tooltip>
			)}
			<Tooltip placement="top" arrow title={'This button will reset the service level review with blank values'}>
				<GCPrimaryButton
					style={ButtonStyles.main}
					onClick={() => {
						setReviewData('serviceForm');
					}}
					disabled={finished || roleDisabled}
				>
					{!primaryReviewLoading ? (
						'Reset Form'
					) : (
						<CircularProgress color="#515151" size={25} style={{ margin: '3px' }} />
					)}
				</GCPrimaryButton>
			</Tooltip>
			<Tooltip placement="top" arrow title={'This will save a partial review to finish later'}>
				<GCPrimaryButton
					style={ButtonStyles.main}
					onClick={() => submitReviewForm('primaryReviewLoading', false, 'service')}
					disabled={finished || roleDisabled}
				>
					{!primaryReviewLoading ? (
						'Save (Partial Service Review)'
					) : (
						<CircularProgress color="#515151" size={25} style={{ margin: '3px' }} />
					)}
				</GCPrimaryButton>
			</Tooltip>
			<Tooltip
				placement="top"
				arrow
				title={'Once the review is complete, this button will submit the finished service level review'}
			>
				<GCPrimaryButton
					style={ButtonStyles.submit}
					onClick={() => submitReviewForm('primaryReviewLoading', true, 'service')}
					disabled={finished || roleDisabled}
				>
					{!primaryReviewLoading ? (
						'Submit (Finished Service Review)'
					) : (
						<CircularProgress color="#FFFFFF" size={25} style={{ margin: '3px' }} />
					)}
				</GCPrimaryButton>
			</Tooltip>
		</StyledFooterDiv>
	);
});

export {
	SecondaryReviewerKey,
	SecondaryReviewerValue,
	LabelingValidationKey,
	LabelingValidationValue,
	TransitionPartnersKey,
	TransitionPartnersValue,
	MissionPartnersKey,
	MissionPartnersValue,
	AIPOCKey,
	AIPOCValue,
	ReviewerNotesKey,
	ReviewerNotesValue,
	ServiceDescriptionText,
	boldKeys,
	firstColWidth,
	ReviewStatus,
	ButtonFooter,
};
