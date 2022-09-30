import React, { useState, useEffect, useContext } from 'react';
import {
	TextField,
	Typography,
	Slider,
	Input,
	FormControlLabel,
	Radio,
	FormControl,
	FormGroup,
	Checkbox,
	Tooltip,
} from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import Autocomplete from '@material-ui/lab/Autocomplete';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import { JBookContext } from './jbookContext';
import {
	StyledTableKeyContainer,
	StyledTableValueContainer,
	StyledInlineContainer,
	StyledAccordionDiv,
	ButtonStyles,
} from './profilePage/profilePageStyles';
import { renderMissionPartnersCheckboxes } from './missionPartnerChecklist';
import GCPrimaryButton from '../../common/GCButton';
import GCAccordion from '../../common/GCAccordion';
import JCAdata from './JCA.json';
import './jbook.css';

const errorColor = '#F44336';
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

const styles = {
	radio: {
		width: 20,
		height: 20,
		border: '2px solid rgb(189, 204, 222)',
		margin: '0 10px 0 0',
		padding: 1,
	},
	radioIcon: {
		visibility: 'hidden',
	},
	radioChecked: {
		color: '#E9691D',
		width: 12,
		height: 12,
	},
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

const renderRadioButtons = (reviewData, reviewDataProp, setReviewData, radioButtonOptions, finished, roleDisabled) => {
	const radioButtons = [];

	const examples = [];

	for (const option of radioButtonOptions) {
		radioButtons.push(
			<FormControlLabel
				name={option.name}
				value={option.name}
				control={
					<Radio
						style={styles.radio}
						icon={<RadioButtonUncheckedIcon style={styles.radioIcon} />}
						checkedIcon={<FiberManualRecordIcon style={styles.radioChecked} />}
						onClick={() => setReviewData(reviewDataProp, option.name)}
						checked={reviewData && reviewData[reviewDataProp] === option.name}
					/>
				}
				label={option.name}
				labelPlacement="end"
				style={{ ...styles.titleText, margin: '10px 0' }}
				disabled={finished || roleDisabled}
			/>
		);

		if (option.example) {
			examples.push(<span style={{ margin: '10px 0' }}>{option.example}</span>);
		}
	}

	return (
		<FormControl style={{ margin: '15px 0 15px 10px', flexDirection: 'row', color: 'gray' }}>
			<FormGroup>{radioButtons}</FormGroup>
			<FormGroup style={{ margin: '0 0 0 15px' }}>{examples}</FormGroup>
		</FormControl>
	);
};

const DropdownRadioButton = ({
	reviewData,
	reviewDataProp,
	setReviewData,
	radioButtonData,
	finished,
	domainTaskOther,
	setDomainTaskOther,
	roleDisabled,
}) => {
	const { radioButton, data } = radioButtonData;
	return (
		<GCAccordion
			contentPadding={0}
			expanded={reviewData?.[reviewDataProp] && reviewData[reviewDataProp] === radioButton}
			disabled={finished || roleDisabled}
			controlled={true}
			header={
				<FormControlLabel
					name={radioButton}
					value={radioButton}
					control={
						<Radio
							style={styles.radio}
							icon={<RadioButtonUncheckedIcon style={styles.radioIcon} />}
							checkedIcon={<FiberManualRecordIcon style={styles.radioChecked} />}
							checked={reviewData && reviewData[reviewDataProp] === radioButton}
							onClick={() => {
								if (!finished) {
									setReviewData(reviewDataProp, radioButton);
								}
							}}
						/>
					}
					label={radioButton}
					labelPlacement="end"
					style={{ ...styles.titleText, margin: '10px 0' }}
					disabled={finished || roleDisabled}
				/>
			}
			headerBackground={'rgb(238,241,242)'}
			headerTextColor={'black'}
			headerTextWeight={'600'}
		>
			<StyledAccordionDiv padding={'12px'} style={{ textAlign: 'left' }}>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					{radioButton !== 'Other' ? (
						Object.keys(data).map((name) => {
							return (
								<DomainCheckbox
									name={name}
									secondary={data[name]}
									reviewData={reviewData}
									domainTask={radioButton}
									setReviewData={setReviewData}
									finished={finished || roleDisabled}
								/>
							);
						})
					) : (
						<TextField
							placeholder=""
							variant="outlined"
							value={domainTaskOther}
							style={{ backgroundColor: 'white', width: '100%' }}
							onBlur={(event) => setReviewData('domainTaskOther', event.target.value)}
							onChange={(_event, value) => setDomainTaskOther(value)}
							disabled={finished || radioButton !== reviewData?.domainTask || roleDisabled}
						/>
					)}
				</div>
			</StyledAccordionDiv>
		</GCAccordion>
	);
};

const JCACTier2CheckBox = ({ tier1, tier2, tier3List, setReviewData, tier1Checked, tier2Checked, finished }) => {
	return (
		<GCAccordion
			contentPadding={0}
			expanded={tier2Checked}
			disabled={finished}
			controlled={true}
			key={tier2}
			header={
				<FormControlLabel
					name={tier2}
					value={tier2}
					control={
						<Checkbox
							style={{
								backgroundColor: '#ffffff',
								borderRadius: '5px',
								padding: '2px',
								border: '2px solid #bdccde',
								pointerEvents: 'none',
								margin: '0px 10px 0px 5px',
							}}
							icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
							checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
							checked={tier2Checked}
							onClick={() => setReviewData('pocJointCapabilityArea2', tier2)}
						/>
					}
					label={tier2}
					labelPlacement="end"
					style={{ ...styles.titleText, margin: '10px 0' }}
					disabled={finished || !tier1Checked} //|| roleDisabled}
				/>
			}
			headerBackground={'rgb(238,241,242)'}
			headerTextColor={'black'}
			headerTextWeight={'600'}
		>
			<StyledAccordionDiv padding={'12px'} style={{ textAlign: 'left' }}>
				<div style={{ width: '100%', margin: '0 0 15px 0' }}>{JCAdata[tier1][tier2]['Description']}</div>
				{tier3List}
			</StyledAccordionDiv>
		</GCAccordion>
	);
};

const JCACTier3CheckBox = ({ tier1, tier2, tier3, setReviewData, reviewData, tier2Checked, finished }) => {
	return (
		<FormControlLabel
			name={tier3}
			value={tier3}
			key={tier3}
			style={{ width: '100%', margin: '10px 0' }}
			control={
				<Checkbox
					style={{
						backgroundColor: '#ffffff',
						borderRadius: '5px',
						padding: '2px',
						border: '2px solid #bdccde',
						pointerEvents: 'none',
						margin: '0px 10px 0px 5px',
					}}
					onClick={() => setReviewData('pocJointCapabilityArea3', tier3)}
					icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
					checked={tier2Checked && reviewData?.['pocJointCapabilityArea3'].indexOf(tier3) !== -1}
					checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
					name={tier3}
				/>
			}
			label={
				<span style={{ fontSize: 13, lineHeight: '5px' }}>
					<b>{tier3}</b>- {JCAdata[tier1][tier2][tier3]}
				</span>
			}
			labelPlacement="end"
			disabled={finished || !tier2Checked} //|| roleDisabled}
		/>
	);
};

const JCAChecklist = (props) => {
	const { reviewData, setReviewData, finished, roleDisabled } = props;
	console.log('jcachecklist', props);
	const radioDropdowns = [];
	let tier2List = [];
	let tier3List = [];

	for (const tier1 in JCAdata) {
		const tier1Checked = reviewData?.['pocJointCapabilityArea'] === tier1;
		for (const tier2 in JCAdata[tier1]) {
			const tier2Checked = tier1Checked && reviewData?.['pocJointCapabilityArea2'].indexOf(tier2) !== -1;
			for (const tier3 in JCAdata[tier1][tier2]) {
				if (tier3 !== 'Description') {
					tier3List.push(
						<JCACTier3CheckBox
							tier1={tier1}
							tier2={tier2}
							tier3={tier3}
							setReviewData={setReviewData}
							reviewData={reviewData}
							tier2Checked={tier2Checked}
							finished={finished || roleDisabled}
						/>
					);
				}
			}
			if (tier2 !== 'Description') {
				tier2List.push(
					<JCACTier2CheckBox
						tier1={tier1}
						tier2={tier2}
						tier3List={tier3List}
						setReviewData={setReviewData}
						tier1Checked={tier1Checked}
						tier2Checked={tier2Checked}
						finished={finished || roleDisabled}
					/>
				);
			}
			tier3List = [];
		}

		radioDropdowns.push(
			<GCAccordion
				contentPadding={0}
				expanded={tier1Checked}
				disabled={finished || roleDisabled}
				controlled={true}
				key={tier1}
				header={
					<FormControlLabel
						name={tier1}
						value={tier1}
						control={
							<Radio
								style={styles.radio}
								icon={<RadioButtonUncheckedIcon style={styles.radioIcon} />}
								checkedIcon={<FiberManualRecordIcon style={styles.radioChecked} />}
								checked={tier1Checked}
								onClick={() => {
									if (!finished) {
										setReviewData('pocJointCapabilityArea', tier1);
									}
								}}
							/>
						}
						label={tier1}
						labelPlacement="end"
						style={{ ...styles.titleText, margin: '10px 0' }}
						disabled={finished || roleDisabled}
					/>
				}
				headerBackground={'rgb(238,241,242)'}
				headerTextColor={'black'}
				headerTextWeight={'600'}
			>
				<StyledAccordionDiv padding={'12px'} style={{ textAlign: 'left' }}>
					<div style={{ width: '100%', margin: '0 0 15px 15px' }}>{JCAdata[tier1]['Description']}</div>
					{tier2List}
				</StyledAccordionDiv>
			</GCAccordion>
		);
		tier2List = [];
	}

	return (
		<>
			<div style={{ width: '100%', margin: '15px 0px' }}>{radioDropdowns}</div>
		</>
	);
};

const DomainCheckbox = ({ secondary, domainTask, reviewData, setReviewData, finished, name }) => {
	const [checked, setChecked] = useState(false);

	const selectedDomainTask = reviewData?.domainTask;

	useEffect(() => {
		if (domainTask === selectedDomainTask && reviewData.domainTaskSecondary?.includes(name)) {
			setChecked(true);
		} else {
			setChecked(false);
		}
	}, [domainTask, name, reviewData.domainTaskSecondary, selectedDomainTask]);

	return (
		<FormControlLabel
			name={name}
			value={name}
			style={{ margin: '10px 0' }}
			control={
				<Checkbox
					style={{
						backgroundColor: '#ffffff',
						borderRadius: '5px',
						padding: '2px',
						border: '2px solid #bdccde',
						pointerEvents: 'none',
						margin: '0px 10px 0px 5px',
					}}
					onClick={() => setReviewData('domainTaskSecondary', name)}
					icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
					checked={checked}
					checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
					name={name}
				/>
			}
			label={
				<span style={{ fontSize: 13, lineHeight: '5px' }}>
					<b>{name}</b> {secondary}
				</span>
			}
			labelPlacement="end"
			disabled={finished || domainTask !== selectedDomainTask} //|| roleDisabled}
		/>
	);
};

const AltAIPOCKey = React.memo(() => {
	return (
		<StyledTableKeyContainer>
			<strong>Alternate AI Point of Contact (POC) for Effort</strong>
			<Typography variant="subtitle1" style={{ fontSize: 12 }}>
				If available, please share the appropriate alternate AI POC for this effort.
			</Typography>
			<Typography variant="subtitle1" style={{ fontSize: 12, marginTop: 15 }}>
				If you are not the appropriate POC for this Program/Project, please enter an alternate AI Point of
				Contact for this Program/Project in the POC section of the Service Reviewer Section. A suitable type of
				POC would be the Program Element Monitor. We ask that you enter the POC Title, Name, Email address,
				Organization and Phone Number in this section.
			</Typography>
		</StyledTableKeyContainer>
	);
});

const AltAIPOCValue = React.memo((props) => {
	const { setReviewData, roleDisabled } = props;

	const context = useContext(JBookContext);
	const { state } = context;
	const { reviewData } = state;
	const finished = reviewData.pocReviewStatus === 'Finished Review';

	const [altPOCTitle, setAltPOCTitle] = useState('');
	const [altPOCName, setAltPOCName] = useState('');
	const [altPOCEmail, setAltPOCEmail] = useState('');
	const [altPOCOrg, setAltPOCOrg] = useState('');
	const [altPOCPhoneNumber, setAltPOCPhoneNumber] = useState('');

	useEffect(() => {
		setAltPOCTitle(reviewData.altPOCTitle);
	}, [reviewData.altPOCTitle]);

	useEffect(() => {
		setAltPOCName(reviewData.altPOCName);
	}, [reviewData.altPOCName]);

	useEffect(() => {
		setAltPOCEmail(reviewData.altPOCEmail);
	}, [reviewData.altPOCEmail]);

	useEffect(() => {
		setAltPOCOrg(reviewData.altPOCOrg);
	}, [reviewData.altPOCOrg]);

	useEffect(() => {
		setAltPOCPhoneNumber(reviewData.altPOCPhoneNumber);
	}, [reviewData.altPOCPhoneNumber]);

	return (
		<StyledTableValueContainer>
			<StyledInlineContainer justifyContent={'left'}>
				<Typography variant="subtitle1" style={{ fontSize: 16, marginRight: 20, width: 90 }}>
					POC Title
				</Typography>
				<TextField
					placeholder="Title"
					variant="outlined"
					value={altPOCTitle}
					defaultValue={altPOCTitle}
					style={{ backgroundColor: 'white', width: '40%' }}
					onChange={(event, value) => setAltPOCTitle(value)}
					onBlur={(event) => setReviewData('altPOCTitle', event.target.value)}
					size="small"
					disabled={finished || roleDisabled}
					// InputProps={!pocValidated && !pocValidation.altPOCTitle ? {
					// 	classes: {
					// 		root: classes.cssOutlinedInput,
					// 		focused: classes.cssFocused,
					// 		notchedOutline: classes.notchedOutline
					// 	}
					// } : {}
					//}
				/>
			</StyledInlineContainer>
			<StyledInlineContainer justifyContent={'left'}>
				<Typography variant="subtitle1" style={{ fontSize: 16, marginRight: 20, width: 90 }}>
					POC Name
				</Typography>
				<TextField
					placeholder="Name"
					variant="outlined"
					value={altPOCName}
					style={{ backgroundColor: 'white', width: '40%' }}
					onChange={(event, value) => setAltPOCName(value)}
					onBlur={(event) => setReviewData('altPOCName', event.target.value)}
					size="small"
					disabled={finished || roleDisabled}
					// InputProps={!pocValidated && !pocValidation.altPOCName ? {
					// 	classes: {
					// 		root: classes.cssOutlinedInput,
					// 		focused: classes.cssFocused,
					// 		notchedOutline: classes.notchedOutline
					// 	}
					// } : {}
					// }
				/>
			</StyledInlineContainer>
			<StyledInlineContainer justifyContent={'left'}>
				<Typography variant="subtitle1" style={{ fontSize: 16, marginRight: 20, width: 90 }}>
					POC Email
				</Typography>
				<TextField
					placeholder="Email"
					variant="outlined"
					value={altPOCEmail}
					style={{ backgroundColor: 'white', width: '40%' }}
					onChange={(event, value) => setAltPOCEmail(value)}
					onBlur={(event) => setReviewData('altPOCEmail', event.target.value)}
					size="small"
					disabled={finished || roleDisabled}
					// InputProps={!pocValidated && !pocValidation.altPOCEmail ? {
					// 	classes: {
					// 		root: classes.cssOutlinedInput,
					// 		focused: classes.cssFocused,
					// 		notchedOutline: classes.notchedOutline
					// 	}
					// } : {}
					// }
				/>
			</StyledInlineContainer>
			<StyledInlineContainer justifyContent={'left'}>
				<Typography variant="subtitle1" style={{ fontSize: 16, marginRight: 20, width: 90 }}>
					POC Org
				</Typography>
				<TextField
					placeholder="Org"
					variant="outlined"
					value={altPOCOrg}
					style={{ backgroundColor: 'white', width: '40%' }}
					onChange={(event, value) => setAltPOCOrg(value)}
					onBlur={(event) => setReviewData('altPOCOrg', event.target.value)}
					size="small"
					disabled={finished || roleDisabled}
					// InputProps={!pocValidated && !pocValidation.altPOCOrg ? {
					// 	classes: {
					// 		root: classes.cssOutlinedInput,
					// 		focused: classes.cssFocused,
					// 		notchedOutline: classes.notchedOutline
					// 	}
					// } : {}
					// }
				/>
			</StyledInlineContainer>
			<StyledInlineContainer justifyContent={'left'}>
				<Typography variant="subtitle1" style={{ fontSize: 16, marginRight: 20, width: 90 }}>
					POC Phone Number
				</Typography>
				<TextField
					placeholder="Phone Number"
					variant="outlined"
					value={altPOCPhoneNumber}
					style={{ backgroundColor: 'white', width: '40%' }}
					onChange={(event, value) => setAltPOCPhoneNumber(value)}
					onBlur={(event) => setReviewData('altPOCPhoneNumber', event.target.value)}
					size="small"
					disabled={finished || roleDisabled}
					// InputProps={!pocValidated && !pocValidation.altPOCPhoneNumber ? {
					// 	classes: {
					// 		root: classes.cssOutlinedInput,
					// 		focused: classes.cssFocused,
					// 		notchedOutline: classes.notchedOutline
					// 	}
					// } : {}
					// }
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
				Select whether you agree or disagree with the JAIC's determination of the tag for this Program/Project
				as Core AI, AI Enabled, AI Enabling or Not AI. If you disagree with the JAIC's tagging, simply select No
				from the Agree/Disagree dropdown and enter your assessment of the correct tag based on the definitions
				above in the "How would you tag this effort" dropdown.
			</Typography>
		</StyledTableKeyContainer>
	);
});

const LabelingValidationValue = React.memo((props) => {
	const { setReviewData, dropdownData, roleDisabled } = props;

	const classes = useStyles();

	const context = useContext(JBookContext);
	const { state } = context;
	const { pocValidated, pocValidation, reviewData } = state;
	const finished = reviewData.pocReviewStatus === 'Finished Review';

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
					//renderInput={(params) => <TextField {...params} label="Select" variant="outlined" classes={{ focused: classes.focused }} />}
					value={
						reviewData && reviewData.pocAgreeLabel && reviewData.pocAgreeLabel !== null
							? reviewData.pocAgreeLabel
							: 'Yes'
					}
					onChange={(event, value) => setReviewData('pocAgreeLabel', value)}
					disabled={finished || roleDisabled}
					disableClearable
					renderInput={(params) => (
						<TextField
							{...params}
							InputLabelProps={{
								className: !pocValidated && !pocValidation.pocAgreeLabel ? classes.labelError : '',
							}}
							InputProps={{ ...params.InputProps }}
							FormHelperTextProps={{ className: classes.helperText }}
							label="Select"
							variant="outlined"
						/>
					)}
					classes={{
						inputRoot: !pocValidated && !pocValidation.pocAgreeLabel ? classes.autocompleteError : '',
					}}
				/>
			</StyledInlineContainer>
			<StyledInlineContainer>
				<Typography variant="subtitle1" style={{ fontSize: 16 }}>
					If not, how would you tag this effort?{' '}
				</Typography>
				<Autocomplete
					size="small"
					style={{ width: 300 }}
					options={
						dropdownData && reviewData && dropdownData.primaryClassLabel
							? dropdownData.primaryClassLabel
							: []
					}
					getOptionLabel={(option) => option.primary_class_label ?? ''}
					getOptionSelected={(option, value) => option.primary_class_label === value.primary_class_label}
					renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
					onChange={(event, value) => setReviewData('pocClassLabel', value.primary_class_label)}
					value={
						reviewData &&
						(reviewData.serviceClassLabel || reviewData.primaryClassLabel || reviewData.pocClassLabel)
							? {
									primary_class_label:
										reviewData.pocClassLabel ??
										reviewData.serviceClassLabel ??
										reviewData.primaryClassLabel,
							  }
							: null
					}
					disabled={finished || (!finished && reviewData.pocAgreeLabel === 'Yes') || roleDisabled}
					disableClearable
					classes={{
						inputRoot:
							!pocValidated && !pocValidation.pocClassLabel && pocValidation.pocAgreeLabel === 'No'
								? classes.autocompleteError
								: '',
					}}
				/>
			</StyledInlineContainer>
		</StyledTableValueContainer>
	);
});

const TransitionPartnerKey = React.memo(() => {
	const classes = useStyles();
	return (
		<StyledTableKeyContainer>
			<div style={{ width: '100%' }}>
				Transition Partners
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
			</div>
			<Typography variant="subtitle1" style={{ fontSize: 12 }}>
				Select whether you agree or disagree with the JAIC's determination of the transition partner from the
				Transition Partner dropdown. If you disagree with the JAIC's selection of transition partner, simply
				select No from the Agree/Disagree dropdown and enter your assessment of the correct transition partner
				based on the definitions above in the "If not, add them here" dropdown.
			</Typography>
		</StyledTableKeyContainer>
	);
});

const TransitionPartnerValue = React.memo((props) => {
	const { setReviewData, dropdownData, roleDisabled } = props;
	const classes = useStyles();
	const context = useContext(JBookContext);
	const { state } = context;
	const { pocValidated, pocValidation, reviewData } = state;
	const finished = reviewData.pocReviewStatus === 'Finished Review';

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
					onChange={(_event, value) => setReviewData('pocPTPAgreeLabel', value)}
					value={
						reviewData && reviewData.pocPTPAgreeLabel && reviewData.pocPTPAgreeLabel !== null
							? reviewData.pocPTPAgreeLabel
							: 'Yes'
					}
					disabled={finished || roleDisabled}
					disableClearable
					classes={{
						inputRoot: !pocValidated && !pocValidation.pocPTPAgreeLabel ? classes.autocompleteError : '',
					}}
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
					onChange={(_event, value) => setReviewData('pocPlannedTransitionPartner', value)}
					value={
						reviewData &&
						(reviewData.pocPlannedTransitionPartner ||
							reviewData.servicePlannedTransitionPartner ||
							reviewData.primaryPlannedTransitionPartner)
							? reviewData.pocPlannedTransitionPartner ??
							  reviewData.servicePlannedTransitionPartner ??
							  reviewData.primaryPlannedTransitionPartner
							: null
					}
					disabled={finished || (!finished && reviewData.pocPTPAgreeLabel === 'Yes') || roleDisabled}
					disableClearable
					classes={{
						inputRoot:
							!pocValidated &&
							!pocValidation.pocPlannedTransitionPartner &&
							pocValidation.pocAgreeLabel === 'No'
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
	const { setReviewData, vendorData, roleDisabled } = props;
	const classes = useStyles();
	const context = useContext(JBookContext);
	const { state } = context;
	const { pocValidated, pocValidation, reviewData } = state;
	const finished = reviewData.pocReviewStatus === 'Finished Review';

	const [pocMissionPartners, setPOCMissionPartners] = useState([]);
	const [pocMissionPartnersChecklist, setPOCMissionPartnersChecklist] = useState({});

	useEffect(() => {
		if (reviewData.pocMPAgreeLabel && reviewData.pocMPAgreeLabel !== null && reviewData.pocMPAgreeLabel === 'Yes') {
			if (Object.prototype.toString.call(reviewData.serviceMissionPartnersChecklist) === '[object Object]') {
				setPOCMissionPartnersChecklist(reviewData.serviceMissionPartnersChecklist);
			} else {
				setPOCMissionPartnersChecklist(
					reviewData.serviceMissionPartnersChecklist
						? JSON.parse(reviewData.serviceMissionPartnersChecklist)
						: {}
				);
			}
		} else {
			if (Object.prototype.toString.call(reviewData.pocMissionPartnersChecklist) === '[object Object]') {
				setPOCMissionPartnersChecklist(reviewData.pocMissionPartnersChecklist);
			} else {
				setPOCMissionPartnersChecklist(
					reviewData.pocMissionPartnersChecklist ? JSON.parse(reviewData.pocMissionPartnersChecklist) : {}
				);
			}
		}
	}, [
		reviewData.serviceMissionPartnersChecklist,
		reviewData.pocMissionPartnersChecklist,
		reviewData.pocMPAgreeLabel,
	]);

	useEffect(() => {
		if (reviewData.pocMPAgreeLabel && reviewData.pocMPAgreeLabel !== null && reviewData.pocMPAgreeLabel === 'Yes') {
			if (Array.isArray(reviewData.serviceMissionPartnersList)) {
				setPOCMissionPartners(reviewData.serviceMissionPartnersList);
			} else {
				setPOCMissionPartners(
					reviewData.serviceMissionPartnersList ? reviewData.serviceMissionPartnersList.split('|') : []
				);
			}
		} else {
			if (Array.isArray(reviewData.pocMissionPartnersList)) {
				setPOCMissionPartners(reviewData.pocMissionPartnersList);
			} else {
				setPOCMissionPartners(
					reviewData.pocMissionPartnersList ? reviewData.pocMissionPartnersList.split('|') : []
				);
			}
		}
	}, [reviewData.pocMissionPartnersList, reviewData.pocMPAgreeLabel, reviewData.serviceMissionPartnersList]);

	return (
		<StyledTableValueContainer>
			<StyledInlineContainer>
				<Typography variant="subtitle1" style={{ fontSize: 16, width: 520 }}>
					Do you agree with the mission partners for this effort?
				</Typography>
				<Autocomplete
					style={{ backgroundColor: 'white', width: 300 }}
					size="small"
					options={['Yes', 'No']}
					renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
					onChange={(event, value) => setReviewData('pocMPAgreeLabel', value)}
					value={
						reviewData && reviewData.pocMPAgreeLabel && reviewData.pocMPAgreeLabel !== null
							? reviewData.pocMPAgreeLabel
							: 'Yes'
					}
					disabled={finished || roleDisabled}
					disableClearable
					classes={{
						inputRoot:
							!pocValidated && !pocValidation.pocMPAgreeLabel && pocValidation.pocMPAgreeLabel === 'No'
								? classes.autocompleteError
								: '',
					}}
				/>
			</StyledInlineContainer>
			<StyledInlineContainer>
				<Typography variant="subtitle1" style={{ fontSize: 16 }}>
					Based on our analysis of contract data, please uncheck any academic and industry mission partners
					for this effort that do not involve AI. Select all that apply. If no partners are listed, use the
					dropdown box to provide more.
				</Typography>
			</StyledInlineContainer>
			{renderMissionPartnersCheckboxes(
				(value) => {
					setReviewData('setPOCMissionPartnersChecklist', value);
				},
				pocMissionPartnersChecklist,
				finished,
				reviewData.pocMPAgreeLabel === 'Yes'
			)}
			<Autocomplete
				multiple
				id={'pocMissionPartners'}
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
					<TextField {...params} variant={'outlined'} placeholder={'Mission Partners'} />
				)}
				onChange={(event, value) => {
					setReviewData('setPOCMissionPartners', value);
				}}
				value={pocMissionPartners}
				disabled={finished || (!finished && reviewData.pocMPAgreeLabel === 'Yes') || roleDisabled}
			/>
		</StyledTableValueContainer>
	);
});

const JCAKey = React.memo(() => {
	return (
		<StyledTableKeyContainer>
			<strong>Joint Capability Area</strong>
			<Typography variant="subtitle1" style={{ fontSize: 12 }}>
				Using the radio buttons, select the primary Joint Capability Area in which the AI portion of this system
				is performing.
			</Typography>
		</StyledTableKeyContainer>
	);
});

const JCAValue = React.memo((props) => {
	const { setReviewData, roleDisabled } = props;
	const context = useContext(JBookContext);
	const { state, dispatch } = context;
	const { pocValidated, pocValidation, reviewData } = state;
	const finished = reviewData.pocReviewStatus === 'Finished Review';
	const classes = useStyles();

	const [aiRoleDescription, setAIRoleDescription] = useState('');

	useEffect(() => {
		setAIRoleDescription(reviewData.pocAIRoleDescription);
	}, [reviewData.pocAIRoleDescription]);

	return (
		<StyledTableValueContainer>
			<Typography variant="subtitle1" style={{ fontSize: 16 }}>
				Please select the primary Joint Capability Area the AI portion of this system is performing:{' '}
				{!pocValidated && !pocValidation.pocJointCapabilityArea ? (
					<span style={{ color: errorColor }}>Required</span>
				) : (
					''
				)}
			</Typography>
			<JCAChecklist
				reviewData={reviewData}
				setReviewData={setReviewData}
				finished={finished}
				roleDisabled={roleDisabled}
			/>
			<GCPrimaryButton
				style={{
					...ButtonStyles.main,
					margin: '5px 0px 10px',
				}}
				onClick={() => {
					setReviewData('clearJCA', '', state, dispatch);
				}}
				disabled={finished || roleDisabled}
			>
				Clear Selection
			</GCPrimaryButton>
			<Typography variant="subtitle1" style={{ fontSize: 16, marginBottom: 5 }}>
				Describe the role of AI in this project
			</Typography>
			<TextField
				placeholder="Reviewer Notes"
				variant="outlined"
				value={aiRoleDescription}
				style={{ backgroundColor: 'white', width: '100%' }}
				onBlur={(event) => setReviewData('pocAIRoleDescription', event.target.value)}
				onChange={(event, value) => setAIRoleDescription(value)}
				rows={6}
				multiline
				disabled={finished || roleDisabled}
				InputProps={
					!pocValidated && !pocValidation.pocAIRoleDescription
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
		</StyledTableValueContainer>
	);
});

const AIDomainKey = React.memo(() => {
	return (
		<StyledTableKeyContainer>
			<strong>AI Domain</strong>
			<Typography variant="subtitle1" style={{ fontSize: 12 }}>
				Use the dropdowns to select the primary AI Domain. A list of checkboxes will pop up for AI tasks. Select
				all checkboxes that apply under AI task.
			</Typography>
		</StyledTableKeyContainer>
	);
});

const radioButtonData = [
	{
		radioButton: 'Natural Language Processing',
		data: {
			'Information Extraction':
				'– techniques to produce useful structured information (e.g. names, events, relationships) from unstructured source documents',
			'Machine Translation': '– tools to convert text from one language to another',
			'Information Retrieval':
				'– methods to process and store documents to enable efficient identification of relevant documents in response to a user query',
			'Automated Speech Recognition': '– methods to process spoken audio signals and generate text transcripts',
			'Optical Character Recognition': '– Identification of text in images or scans',
			'Natural Language Generation': '– Tools that produce realistic-looking text artificially',
		},
	},
	{
		radioButton: 'Sensing and Perception',
		data: {
			Detection: '– determining whether an item of interest is present in the input',
			Classification: '– determining which of several categories an input best belongs to',
			Tracking:
				'– identifying and following an item of interest over a sequence of detections, often generating a trajectory over time',
			Mapping:
				'– constructing a map of the environment from collected sensor data (e.g. as a system moves about the environment)',
		},
	},
	{
		radioButton: 'Planning, Scheduling, and Reasoning',
		data: {
			'Action Planning': '– determining a sequence of actions to reach a desired goal',
			'Planning in Uncertainty':
				'– developing plans without perfect information (e.g. due to missing information, randomness, or the actions of others)',
			'Multi-AgentPlanning':
				'– coordinating the actions of a set of agents to achieve individual and/or shared goals',
			'Knowledge Representation':
				'– ways to structure information about the world in a format that a computer can reason about',
			'Pattern Analysis': '– identifying rules or patterns that account for regularities observed in the data',
			'Constraint Satisfaction':
				'-  finding solutions subject to various restrictions or constraints (e.g. Sudoku)',
			Scheduling: '– optimal allocation resources to a set of tasks',
		},
	},
	{
		radioButton: 'Prediction and Assessment',
		data: {
			'Predictive Analytics': '– estimation of future or hypothetical outcomes from historical data',
			'Risk Assessment': '– identification and prediction of potential hazards and estimating their likelihoods',
			'Recommender Systems':
				'- systems that suggest potentially relevant items based on context, user activity, or queries (example: Amazon, Netflix)',
			'Data Mining': '– techniques for finding patterns, rules, or insights from large volumes of data',
		},
	},
	{
		radioButton: 'Modeling and Simulation',
		data: {
			'Wargaming & "What-If" analysis':
				'– analysis and/or simulation of alternative hypothetical scenarios to support planning, decision making, and risk assessment',
			'Synthetic data generation':
				'– methods for creating data artificially, often to augment real data or as a substitute for sensitive data, specifically for deep neural network classification systems',
			'Model Analysis & Testing':
				'– assessment of a computational or machine learning models to estimate features such as performance and reliability',
			'Virtual Training':
				'– the use of model or simulation environments in place of real-world testing for training and validation of machine learning systems',
		},
	},
	{
		radioButton: 'Human-Machine Interaction',
		data: {
			'User-centered design/interfaces':
				'– iterative, use case / user-focused approaches to AI software development; also includes the use of AI to aid in User-Centered Design',
			'Data visualization': '-  tools and techniques for effective visual presentation of data to humans',
			'Shared control schemes': '– systems that integrate automation and human control',
			'Human-Machine task allocation':
				'– partitioning tasks between human operators and computer tools to make best use of the relative strengths of each',
		},
	},
	{
		radioButton: 'Responsible AI',
		data: {
			Explainability:
				'– efforts related to explanations for AI decisions, including tools to generate human-understandable explanations for AI outputs and ways to train models that are explainable by design',
			Adversarial:
				'– efforts focused on the behavior of AI systems in the presence of adversaries attempting to mislead, control, poison, or otherwise disrupt system functionality, and countermeasures to such attempts',
			Bias: '– work identifying and mitigating systematic errors or unintended consequences due to flawed assumptions implicit in the datasets, system design, or operational concept of AI systems',
			Manipulation:
				'– work concerning the potential of AI tools to mislead or manipulate human decisions or actions, as well as detections, mitigations, or countermeasures',
			'Ethical AI':
				'– methods and principles for assessing the ethical implications of AI deployments, and guidance for developing and deploying AI technologies in accordance with stated ethical principles',
		},
	},
	{ radioButton: 'Other' },
];

const AIDomainValue = React.memo((props) => {
	const { setReviewData, roleDisabled } = props;
	const context = useContext(JBookContext);
	const { state, dispatch } = context;
	const { pocValidated, pocValidation, reviewData } = state;
	const finished = reviewData.pocReviewStatus === 'Finished Review';

	const [domainTaskOther, setDomainTaskOther] = useState('');

	useEffect(() => {
		if (reviewData?.domainTask === 'Other') {
			setDomainTaskOther(reviewData.domainTaskSecondary?.[0] ?? '');
		} else {
			setDomainTaskOther('');
		}
	}, [reviewData]);

	return (
		<StyledTableValueContainer>
			<Typography variant="subtitle1" style={{ fontSize: 16 }}>
				Please select a domain to view sub-options{' '}
				{!pocValidated && !pocValidation.domainTask ? <span style={{ color: errorColor }}>Required</span> : ''}
			</Typography>
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<div style={{ display: 'flex', flexDirection: 'row' }}>
					<div style={{ width: '100%', margin: '15px 0px' }}>
						{radioButtonData.map((data) => {
							return (
								<DropdownRadioButton
									reviewData={reviewData}
									reviewDataProp={'domainTask'}
									setReviewData={setReviewData}
									radioButtonData={data}
									finished={finished}
									domainTaskOther={domainTaskOther}
									setDomainTaskOther={setDomainTaskOther}
									roleDisabled={roleDisabled}
								/>
							);
						})}
					</div>
				</div>
				<GCPrimaryButton
					style={{
						...ButtonStyles.main,
						margin: '5px 0px 0px',
						width: '158px',
					}}
					onClick={() => {
						setReviewData('clearDomainTask', '', state, dispatch);
					}}
					disabled={finished || roleDisabled}
				>
					Clear Selection
				</GCPrimaryButton>
			</div>
		</StyledTableValueContainer>
	);
});

const DataTypeKey = React.memo(() => {
	return (
		<StyledTableKeyContainer>
			<strong>Data Type</strong>
			<Typography variant="subtitle1" style={{ fontSize: 12 }}>
				Use the radio buttons to select the AI Data type.
			</Typography>
		</StyledTableKeyContainer>
	);
});

const DataTypeValue = React.memo((props) => {
	const { setReviewData, roleDisabled } = props;
	const context = useContext(JBookContext);
	const { state, dispatch } = context;
	const { pocValidated, pocValidation, reviewData } = state;
	const finished = reviewData.pocReviewStatus === 'Finished Review';
	const classes = useStyles();

	const [aiTypeDescription, setAITypeDescription] = useState('');

	useEffect(() => {
		setAITypeDescription(reviewData.pocAITypeDescription);
	}, [reviewData.pocAITypeDescription]);

	return (
		<StyledTableValueContainer>
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<Typography variant="subtitle1" style={{ fontSize: 16 }}>
					Please select a data type this project falls under:{' '}
					{!pocValidated && !pocValidation.pocAIType ? (
						<span style={{ color: errorColor }}>Required</span>
					) : (
						''
					)}
				</Typography>
				{renderRadioButtons(
					reviewData,
					'pocAIType',
					setReviewData,
					[
						{ name: 'Audio', example: 'Acoustic signals, non-speech' },
						{ name: 'Images', example: 'Satellite imagery' },
						{ name: 'Video', example: 'Full motion image captures' },
						{ name: 'Speech', example: 'Spoken human language' },
						{ name: 'Structured Text', example: 'Tabular/form data, computer protocol data' },
						{ name: 'Unstructured Text', example: 'Written language, chat, documents/articles' },
						{ name: 'Signal', example: 'Radio frequency data, time-series data' },
						{ name: 'RADAR', example: 'Synthetic Aperture Radar' },
						{ name: 'SONAR', example: 'Underwater acoustic emanations' },
						{ name: 'LIDAR', example: 'Light-based signal detection' },
						{ name: 'Multi / Hyperspectral', example: 'Satellite-based weather data' },
						{ name: 'Bio-medical', example: 'Heart electrical signals' },
						{ name: 'Biological', example: 'Protein expression data, DNA sequence data' },
						{ name: 'Graph / Network', example: 'Social network data' },
						{ name: 'Computer / Network', example: 'Binary, executable, communication data' },
					],
					finished,
					roleDisabled
				)}
				<GCPrimaryButton
					style={{
						...ButtonStyles.main,
						margin: '0px 0px 10px',
						width: '158px',
					}}
					onClick={() => {
						setReviewData('clearDataType', '', state, dispatch);
					}}
					disabled={finished || roleDisabled}
				>
					Clear Selection
				</GCPrimaryButton>
				<Typography variant="subtitle1" style={{ fontSize: 16 }}>
					Describe how this project fits this data type
				</Typography>
				<TextField
					placeholder="Reviewer Notes"
					variant="outlined"
					value={aiTypeDescription}
					style={{ backgroundColor: 'white', width: '100%' }}
					onBlur={(event) => setReviewData('pocAITypeDescription', event.target.value)}
					onChange={(event, value) => setAITypeDescription(value)}
					rows={6}
					multiline
					disabled={finished || roleDisabled}
					InputProps={
						!pocValidated && !pocValidation.pocAITypeDescription
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
				<StyledInlineContainer>
					<Typography variant="subtitle1" style={{ fontSize: 16 }}>
						Is the final deployment of the technology on a computer or robotic system?
					</Typography>
					<Autocomplete
						size="small"
						options={['Computer', 'Robotic']}
						style={{ minWidth: 180 }}
						renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
						value={reviewData.roboticsSystemAgree ?? null}
						onChange={(event, value) => setReviewData('roboticsSystemAgree', value)}
						disabled={finished || roleDisabled}
						disableClearable
						classes={{
							inputRoot:
								!pocValidated && !pocValidation.roboticsSystemAgree ? classes.autocompleteError : '',
						}}
					/>
				</StyledInlineContainer>
				<Typography variant="subtitle1" style={{ fontSize: 12 }}>
					Answer whether the final deployment of the AI system is on a computer or robotic system by selecting
					computer or robotic system from the dropdown.
				</Typography>
				<StyledInlineContainer>
					<Typography variant="subtitle1" style={{ fontSize: 16 }}>
						Does this program relate to the development or use of autonomous unmanned systems?
					</Typography>
					<Autocomplete
						size="small"
						options={['Yes', 'No']}
						style={{ minWidth: 180 }}
						renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
						value={reviewData?.intelligentSystemsAgree ?? null}
						onChange={(event, value) => setReviewData('intelligentSystemsAgree', value)}
						disabled={finished || roleDisabled}
						disableClearable
						classes={{
							inputRoot:
								!pocValidated && !pocValidation.intelligentSystemsAgree
									? classes.autocompleteError
									: '',
						}}
					/>
				</StyledInlineContainer>
				<Typography variant="subtitle1" style={{ fontSize: 12 }}>
					Answer whether the final deployment of the AI system is on an autonomous unmanned system by
					selecting Yes or No from the dropdown.
				</Typography>
			</div>
		</StyledTableValueContainer>
	);
});

const SliderKey = React.memo(() => {
	return (
		<StyledTableKeyContainer>
			<strong>Amount Attributed to AI</strong>
			<Typography variant="subtitle1" style={{ fontSize: 12 }}>
				Use the slider to the right to enter an estimate of AI spend for this project. AI Spend is defined as
				the fraction of total project cost/budget that directly relates to the AI part of the project/program.
			</Typography>
		</StyledTableKeyContainer>
	);
});

const SliderValue = React.memo((props) => {
	const { setReviewData, totalBudget, roleDisabled } = props;
	const context = useContext(JBookContext);
	const { state } = context;
	const { pocValidated, pocValidation, reviewData } = state;
	const finished = reviewData.pocReviewStatus === 'Finished Review';
	const { pocDollarsAttributed, pocPercentageAttributed } = reviewData;

	const classes = useStyles();

	const [attributionUnits, setAttributionUnits] = useState('%');
	const [dollarsAttributed, setDollarsAttributed] = useState(0);
	const [percentageAttributed, setPercentageAttributed] = useState(0);
	const [totalBudgetValue, setTotalBudgetValue] = useState(0);

	useEffect(() => {
		setTotalBudgetValue(totalBudget);
	}, [totalBudget]);

	useEffect(() => {
		setDollarsAttributed(pocDollarsAttributed);
	}, [pocDollarsAttributed]);

	useEffect(() => {
		setPercentageAttributed(pocPercentageAttributed);
	}, [pocPercentageAttributed]);

	const marks = [
		{
			value: attributionUnits === '$' ? Math.round(totalBudgetValue / 2) : 50,
			label: `$${Math.round(totalBudgetValue / 2)} M`,
		},
		{
			value: attributionUnits === '$' ? totalBudgetValue : 100,
			label: `$${parseFloat(totalBudgetValue).toFixed(2)} M`,
		},
	];

	return (
		<StyledTableValueContainer>
			<Typography variant="subtitle1" style={{ fontSize: 16, marginBottom: 15 }}>
				{' '}
				Select the {attributionUnits === '%' ? 'percentage' : 'dollar'} amount attributed to AI within this
				project or budget line item number:{' '}
				{!pocValidated && !pocValidation.amountAttributed ? (
					<span style={{ color: errorColor }}>Required</span>
				) : (
					''
				)}
			</Typography>
			<Typography variant="subtitle1" style={{ fontSize: 16, width: 140 }}>
				Choose Amount
			</Typography>
			<StyledInlineContainer>
				<Slider
					onChangeCommitted={(event, value) => {
						if (attributionUnits === '$') {
							const newData = {
								pocDollarsAttributed: value,
								pocPercentageAttributed: (
									(parseFloat(value) / parseFloat(totalBudgetValue)) *
									100
								).toFixed(2),
							};
							setReviewData('pocSlider', newData);
						} else {
							const newData = {
								pocDollarsAttributed: (value * 0.01 * parseFloat(totalBudgetValue)).toFixed(2),
								pocPercentageAttributed: value,
							};
							setReviewData('pocSlider', newData);
						}
					}}
					valueLabelDisplay="auto"
					step={1}
					value={
						attributionUnits === '$'
							? dollarsAttributed
								? parseFloat(dollarsAttributed).toFixed(2)
								: ''
							: percentageAttributed
							? parseFloat(percentageAttributed).toFixed(2)
							: ''
					}
					onChange={(event, value) => {
						if (attributionUnits === '$') {
							setDollarsAttributed(value);
							const percent = parseFloat(value) / parseFloat(totalBudgetValue);
							setPercentageAttributed(percent);
						} else {
							setPercentageAttributed(value);
							let dollars = value * 0.01 * parseFloat(totalBudgetValue);
							setDollarsAttributed(dollars);
						}
					}}
					min={0}
					max={attributionUnits === '$' ? parseFloat(totalBudgetValue).toFixed(2) : 100}
					// ValueLabelComponent={}
					style={{ fontSize: 14, margin: '0 20px 0 0', width: '70%' }}
					marks={marks}
					disabled={finished || attributionUnits === '' || roleDisabled}
				/>

				<div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '5px', marginLeft: '10px' }}>
					<Typography variant="subtitle1" style={{ fontSize: 16, marginTop: '3px' }}>
						{attributionUnits === '$' ? '$' : '%'}
					</Typography>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
						<Input
							value={
								reviewData
									? attributionUnits === '$'
										? reviewData.pocDollarsAttributed
										: reviewData.pocPercentageAttributed
									: null
							}
							margin="dense"
							style={{ width: 80, paddingLeft: '10px', paddingRight: '10px' }}
							onChange={(event, value) => {
								if (attributionUnits === '$') {
									const newData = {
										pocDollarsAttributed: event.target.value,
										pocPercentageAttributed: (
											(parseFloat(event.target.value) / totalBudgetValue) *
											100
										).toFixed(2),
									};
									setReviewData('pocSlider', newData);
								} else {
									const newData = {
										pocDollarsAttributed: (
											parseFloat(event.target.value) *
											0.01 *
											totalBudgetValue
										).toFixed(2),
										pocPercentageAttributed: event.target.value,
									};
									setReviewData('pocSlider', newData);
								}
							}}
							disabled={finished || attributionUnits === '' || roleDisabled}
							classes={{
								inputRoot:
									!pocValidated &&
									!pocValidation.pocDollarsAttributed &&
									!pocValidation.pocPercentageAttributed
										? classes.autocompleteError
										: '',
							}}
						/>
						<Typography
							variant="subtitle1"
							style={{
								alignSelf: 'center',
								color: 'rgba(0, 0, 0, 0.54)',
								fontSize: 16,
								margin: '5px 0 0 0px',
							}}
						>
							{attributionUnits === '$'
								? '(' +
								  (reviewData.pocPercentageAttributed
										? parseFloat(reviewData.pocPercentageAttributed).toFixed(2)
										: '0') +
								  '%)'
								: '($' +
								  (reviewData.pocDollarsAttributed
										? parseFloat(reviewData.pocDollarsAttributed).toFixed(2)
										: '0') +
								  'M)'}
						</Typography>
					</div>
					<Typography variant="subtitle1" style={{ fontSize: 16, marginTop: '3px' }}>
						{' '}
						{attributionUnits === '$' ? 'M' : ' '}
					</Typography>
				</div>
				<Autocomplete
					size="small"
					options={['$', '%']}
					style={{ width: 90, margin: '0 0 0 25px' }}
					renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
					value={attributionUnits}
					onChange={(event, value) => {
						setAttributionUnits(value);
					}}
					disableClearable
					disabled={finished || roleDisabled}
					defaultValue={'$'}
				/>
			</StyledInlineContainer>
		</StyledTableValueContainer>
	);
});

const FooterValue = React.memo(() => {
	return (
		<StyledTableValueContainer>
			<Typography variant="subtitle1" style={{ fontSize: 12 }}>
				Once your review is complete, click the submit finished review button to save your entries/information.
				You can also save a partial review to finish later by clicking the Save Partial Review button or reset
				the Service Reviewer Section to blank values by clicking the reset Form Buttons.
			</Typography>
			<hr />
			<Typography variant="subtitle1" style={{ fontSize: 12, color: errorColor }}>
				Do not click "Submit (Finished Review)" until all fields in the POC Reviewer section have been filled
				in.
			</Typography>
		</StyledTableValueContainer>
	);
});

export {
	renderRadioButtons,
	JCAChecklist,
	AltAIPOCKey,
	AltAIPOCValue,
	LabelingValidationKey,
	LabelingValidationValue,
	TransitionPartnerKey,
	TransitionPartnerValue,
	MissionPartnersKey,
	MissionPartnersValue,
	JCAKey,
	JCAValue,
	AIDomainKey,
	AIDomainValue,
	DataTypeKey,
	DataTypeValue,
	SliderKey,
	SliderValue,
	FooterValue,
};
