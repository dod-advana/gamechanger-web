import React, { useState, useEffect } from 'react';
import { TextField, Typography, CircularProgress, Tooltip } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import GCPrimaryButton from '../../common/GCButton';
import { setState } from '../../../utils/sharedFunctions';
import { makeStyles } from '@material-ui/core/styles';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { StyledFooterDiv, ButtonStyles } from './profilePage/profilePageStyles';

const useStyles = makeStyles((_theme) => ({
	customWidth: {
		maxWidth: 1050,
		padding: '15px 10px 15px 0',
	},
}));

const createReviewersObject = (dropdownData, reviewerType) => {
	const reviewers = {};

	if (dropdownData[reviewerType]) {
		dropdownData[reviewerType].forEach((reviewer) => {
			const display = `${reviewer.name}${
				reviewer?.organization?.length > 1 ? ` (${reviewer.organization})` : ''
			}`;
			reviewers[display] = {
				display,
				...reviewer,
			};
		});
	}

	//sorts reviewers
	return Object.keys(reviewers)
		.sort()
		.reduce((obj, key) => {
			obj[key] = reviewers[key];
			return obj;
		}, {});
};

const ReviewersValue = React.memo((props) => {
	const {
		primaryReviewer, // from reviewData
		finished,
		dropdownData,
		setReviewDataMultiple,
	} = props;

	const reviewers = createReviewersObject(dropdownData, 'reviewers');

	return (
		<Autocomplete
			size="small"
			options={Object.keys(reviewers)}
			style={{ width: 300 }}
			renderInput={(params) => (
				<TextField {...params} label="Reviewer" data-cy="jbook-reviewer-label" variant="outlined" />
			)}
			value={primaryReviewer ?? null}
			onChange={(_e, value) => {
				setReviewDataMultiple({ primaryReviewer: value, primaryReviewerEmail: reviewers[value].email });
			}}
			disabled={finished} //|| roleDisabled}
			disableClearable
		/>
	);
});

const CoreAIAnalysisKey = React.memo(() => {
	const classes = useStyles();

	return (
		<div style={{ width: '100%', height: '43px' }}>
			Core AI Analysis{' '}
			<Tooltip
				classes={{ tooltip: classes.customWidth }}
				placement="right"
				arrow
				title={
					<div style={{ width: '1000px' }}>
						<ul>
							<li>
								<i>Core AI</i> programs develop AI applications such as machine learning/deep learning,
								collaborative behavior, computer vision, human-machine teaming, automated reasoning,
								robotic autonomy, automated data fusion, and self-healing networks. DoD’s RDT&E programs
								are not the only source of Core AI for the Department; private sector R&D and
								commercially available products may also provide Core AI applications for incorporation
								into DoD systems. By this definition, Core AI spending is always RDT&E spending.
							</li>
							<hr />
							<li>
								<i>AI-enabled</i> programs develop the gamut of DoD warfighting and business systems,
								incorporating Core AI applications for analyzing, automating, communicating,
								maneuvering, monitoring, sensing, and many other tasks. While AI spending is usually a
								small percentage of these programs, their system’s performance may be critically
								dependent upon the incorporation of Core AI.
							</li>
							<hr />
							<li>
								<i>AI-enabling</i> programs include technologies such as cloud computing and advanced
								microelectronics required to support the deployment of effective AI-enabled capabilities
								at scale.
							</li>
						</ul>
					</div>
				}
			>
				<InfoOutlinedIcon style={{ margin: '-2px 0px' }} />
			</Tooltip>
		</div>
	);
});

const CoreAIAnalysisValue = React.memo((props) => {
	const { dropdownData, setReviewData, primaryClassLabel, finished } = props;

	return (
		<Autocomplete
			size="small"
			options={dropdownData && dropdownData.primaryClassLabel ? dropdownData.primaryClassLabel : []}
			getOptionLabel={(option) => option.primary_class_label ?? ''}
			getOptionSelected={(option, value) => option.primary_class_label === value.primary_class_label}
			style={{ width: 300, backgroundColor: 'white' }}
			onChange={(_event, value) => setReviewData('primaryClassLabel', value.primary_class_label)}
			renderInput={(params) => <TextField {...params} label="Analysis" variant="outlined" />}
			value={primaryClassLabel ? { primary_class_label: primaryClassLabel } : null}
			disabled={finished} //|| roleDisabled}
			disableClearable
		/>
	);
});

const ServiceComponentReviewerValue = React.memo((props) => {
	const { serviceReviewer, finished, dropdownData, setReviewDataMultiple } = props;

	const reviewers = createReviewersObject(dropdownData, 'serviceReviewers');

	return (
		<Autocomplete
			size="small"
			options={Object.keys(reviewers)}
			style={{ width: 300, backgroundColor: 'white' }}
			renderInput={(params) => <TextField {...params} label="Reviewer" variant="outlined" />}
			value={serviceReviewer ?? null}
			onChange={(_e, value) => {
				setReviewDataMultiple({ serviceReviewer: value, serviceReviewerEmail: reviewers[value].email });
			}}
			disabled={finished} //|| roleDisabled}
			disableClearable
		/>
	);
});

const PlannedTransitionPartnerKey = React.memo(() => {
	const classes = useStyles();

	return (
		<div style={{ width: '100%', height: '43px' }}>
			Planned Transition Partner{' '}
			<Tooltip
				classes={{ tooltip: classes.customWidth }}
				placement="right"
				arrow
				title={
					<div style={{ width: '1000px', paddingLeft: '15px' }}>
						Transition Is Defined As:
						<ul>
							<li>
								The process of applying critical technology in military systems to provide an effective
								weapons or support system—in the quantity and quality needed by the operators to carry
								out assigned missions and at the “best value” as measured by the technology sponsor and
								customer.
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
				<InfoOutlinedIcon style={{ margin: '-2px 0px' }} />
			</Tooltip>
		</div>
	);
});

const PlannedTransitionPartnerValue = React.memo((props) => {
	const { dropdownData, setReviewData, primaryPlannedTransitionPartner, finished } = props;

	return (
		<Autocomplete
			size="small"
			options={dropdownData && dropdownData.transitionPartners ? dropdownData.transitionPartners : []}
			style={{ width: 300, backgroundColor: 'white' }}
			onChange={(_event, value) => setReviewData('primaryPlannedTransitionPartner', value)}
			renderInput={(params) => <TextField {...params} label="Partner" variant="outlined" />}
			value={primaryPlannedTransitionPartner ?? null}
			disabled={finished} //|| roleDisabled}
			disableClearable
		/>
	);
});

const CurrentMissionPartnersValue = React.memo((props) => {
	const { dropdownData, setReviewData, serviceAdditionalMissionPartners, finished } = props;
	return (
		<>
			<Autocomplete
				size="small"
				options={dropdownData && dropdownData.missionPartners ? dropdownData.missionPartners : []}
				getOptionLabel={(option) => option.current_msn_part ?? ''}
				getOptionSelected={(option, value) => option.current_msn_part === value.current_msn_part}
				style={{ width: 300, backgroundColor: 'white' }}
				onChange={(event, value) => setReviewData('serviceAdditionalMissionPartners', value.current_msn_part)}
				renderInput={(params) => <TextField {...params} label="Partners" variant="outlined" />}
				value={serviceAdditionalMissionPartners ? { current_msn_part: serviceAdditionalMissionPartners } : null}
				disabled={finished} //|| roleDisabled}
				disableClearable
			/>
		</>
	);
});

const JustificationValue = React.memo((props) => {
	const { setReviewData, finished, primaryReviewNotes } = props;

	const [reviewerNotes, setReviewerNotes] = useState(primaryReviewNotes);

	useEffect(() => {
		setReviewerNotes(primaryReviewNotes);
	}, [primaryReviewNotes]);

	return (
		<>
			<TextField
				placeholder="Provide justification for the tag selected above"
				variant="outlined"
				value={reviewerNotes}
				style={{ backgroundColor: 'white', width: '100%', margin: '0 0 0 0' }}
				onBlur={(event) => setReviewData('primaryReviewNotes', event.target.value)}
				onChange={(event, value) => setReviewerNotes(value)}
				inputProps={{
					style: {
						width: '100%',
					},
				}}
				rows={10}
				multiline
				disabled={finished} //|| roleDisabled}
			/>
		</>
	);
});

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

const ButtonFooter = React.memo((props) => {
	const { finished, roleDisabled, dispatch, setReviewData, submitReviewForm, primaryReviewLoading } = props;

	return (
		<StyledFooterDiv>
			{finished && !roleDisabled && (
				<GCPrimaryButton style={ButtonStyles.main} onClick={() => setState(dispatch, { JAICModalOpen: true })}>
					Re-Enable (Partial Review)
				</GCPrimaryButton>
			)}
			<GCPrimaryButton
				style={ButtonStyles.main}
				onClick={() => {
					setReviewData('jaicForm');
				}}
				disabled={finished || roleDisabled}
			>
				{!primaryReviewLoading ? (
					'Reset Form'
				) : (
					<CircularProgress color="#515151" size={25} style={{ display: 'flex', justifyContent: 'center' }} />
				)}
			</GCPrimaryButton>
			<GCPrimaryButton
				style={ButtonStyles.main}
				onClick={() => submitReviewForm('primaryReviewLoading', false, 'primary')}
				disabled={finished || roleDisabled}
			>
				{!primaryReviewLoading ? (
					'Save (Partial Review)'
				) : (
					<CircularProgress color="#515151" size={25} style={{ display: 'flex', justifyContent: 'center' }} />
				)}
			</GCPrimaryButton>
			<GCPrimaryButton
				style={ButtonStyles.submit}
				onClick={() => submitReviewForm('primaryReviewLoading', true, 'primary')}
				disabled={finished || roleDisabled}
			>
				{!primaryReviewLoading ? (
					'Submit'
				) : (
					<CircularProgress color="#FFFFFF" size={25} style={{ display: 'flex', justifyContent: 'center' }} />
				)}
			</GCPrimaryButton>
		</StyledFooterDiv>
	);
});

const SimpleButtonFooter = React.memo((props) => {
	const { finished, roleDisabled, dispatch, setReviewData, submitReviewForm, primaryReviewLoading } = props;

	return (
		<StyledFooterDiv style={{ paddingTop: '10px' }}>
			{finished && !roleDisabled && (
				<GCPrimaryButton
					style={{ color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0', height: '35px' }}
					onClick={() => setState(dispatch, { JAICModalOpen: true })}
				>
					Re-Enable (Partial Review)
				</GCPrimaryButton>
			)}
			<GCPrimaryButton
				style={{ color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0', height: '35px' }}
				onClick={() => {
					setReviewData('jaicForm');
				}}
				disabled={finished || roleDisabled}
			>
				{!primaryReviewLoading ? (
					'Reset Form'
				) : (
					<CircularProgress color="#515151" size={25} style={{ display: 'flex', justifyContent: 'center' }} />
				)}
			</GCPrimaryButton>
			<GCPrimaryButton
				style={{ color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0', height: '35px' }}
				onClick={() => submitReviewForm('primaryReviewLoading', false, 'primary')}
				disabled={finished || roleDisabled}
			>
				{!primaryReviewLoading ? (
					'Save (Partial Review)'
				) : (
					<CircularProgress color="#515151" size={25} style={{ display: 'flex', justifyContent: 'center' }} />
				)}
			</GCPrimaryButton>
			<GCPrimaryButton
				style={{ color: 'white', backgroundColor: '#1C2D64', borderColor: '#1C2D64', height: '35px' }}
				onClick={() => submitReviewForm('primaryReviewLoading', true, 'primary')}
				disabled={finished || roleDisabled}
			>
				{!primaryReviewLoading ? (
					'Submit'
				) : (
					<CircularProgress color="#FFFFFF" size={25} style={{ display: 'flex', justifyContent: 'center' }} />
				)}
			</GCPrimaryButton>
		</StyledFooterDiv>
	);
});

export {
	ReviewersValue,
	CoreAIAnalysisKey,
	CoreAIAnalysisValue,
	ServiceComponentReviewerValue,
	PlannedTransitionPartnerKey,
	PlannedTransitionPartnerValue,
	CurrentMissionPartnersValue,
	JustificationValue,
	ReviewStatus,
	ButtonFooter,
	SimpleButtonFooter,
};
