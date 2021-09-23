import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	Select,
	MenuItem,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {TokenAnnotator} from 'react-text-annotate';
import {CustomMark} from './CustomMark';
import withStyles from '@material-ui/core/styles/withStyles';
import { Typography } from '@material-ui/core';
import {
	backgroundWhite, 
	tertiaryRed, 
	tertiaryGreen, 
	secondaryAlt
} from '../common/gc-colors';
import GCButton from '../common/GCButton';

const useStyles = makeStyles((theme) => ({
	formControl: {
		//margin: theme.spacing(1),
		minWidth: 350,
	},
	selectEmpty: {
		marginTop: theme.spacing(2),
		fontSize: '16px',
		height: '40px',
	},
}));

const CustomFormControlLabel = withStyles((theme) => ({
	label: {
		color: backgroundWhite,
	},
}))(FormControlLabel);

const StyledRadio = (props) => {
	return (
		<div
			style={{
				background: backgroundWhite,
				borderTopRightRadius: '3px',
				borderBottomRightRadius: '3px',
				marginLeft: '5px',
				display: 'flex',
				//borderBottom: '.5px solid black',
				//borderTop: '.5px solid black',
				//borderLeft: '1px solid black',
				height: '100%',
			}}
		>
			<Radio {...props} />
		</div>
	);
};

export const GeneralUserAnnotationCard = ({
	paragraph,
	tags,
	tag,
	entities,
	componentStepNumbers,
	entityAnswer,
	colorMap,
	tagDescriptions,
	handleAnswer,
}) => {
	const [options, setOptions] = useState([]);
	const [tokens, setTokens] = useState([]);
	const [entityIncorrect, setEntityIncorrect] = useState(!entityAnswer.correct);
	const [entityUnknown, setEntityUnknown] = useState(entityAnswer.unknown);
	const [incorrectReason, setIncorrectReason] = useState(
		entityAnswer.incorrectReason
	);
	const [answered, setAnswered] = useState(entityAnswer.incorrectReason);

	const classes = useStyles();

	useEffect(() => {
		const options = [];

		tags.forEach((tagText) => {
			if (tagText === tag) {
				options.push(
					<CustomFormControlLabel
						control={<StyledRadio />}
						key={tagText}
						value={tagText}
						label={
							<span
								style={{
									margin: '5px 10px',
									color: 'white',
									display: 'flex',
								}}
							>
								{tagText}{' '}
								<div style={{ fontSize: 10, marginLeft: 5 }}>
									{tagDescriptions[tagText]}
								</div>
							</span>
						}
						labelPlacement="start"
						style={{
							background: colorMap.get(tagText),
							border: '1px solid #DDDDDD',
							borderRadius: '4px',
							paddingLeft: '5px',
							margin: '0 25px 0 0',
						}}
					/>
				);
			}
		});

		setTokens(paragraph ? paragraph.par_raw_text_t.split(' ') : []);
		setOptions(options);
		setEntityIncorrect(false);
		setIncorrectReason('');
		setAnswered(false);
	}, [tags, tag, colorMap, tagDescriptions, paragraph]);

	useEffect(() => {
		setEntityIncorrect(!entityAnswer.correct && !entityAnswer.unknown);
		setEntityUnknown(entityAnswer.unknown);
		setIncorrectReason(entityAnswer.incorrectReason);
		setAnswered(entityAnswer.answered);
	}, [entityAnswer]);

	function annotationCorrect() {
		handleAnswer(true, '');
	}

	function annotationIncorrect() {
		setEntityIncorrect(true);
		setEntityUnknown(false);
	}

	function annotationUnknown() {
		setEntityUnknown(true);
		setEntityIncorrect(false);
		handleAnswer(false, '', true);
	}

	function handleIncorrectReasonChange(event) {
		setIncorrectReason(event.target.value);
		handleAnswer(false, event.target.value);
	}

	return (
		<div
			className={`tutorial-step-${componentStepNumbers['Crowd Assist Panel']}`}
		>
			<div
				style={{
					backgroundColor: '#DFE6EE',
					padding: '20px 15px',
					marginBottom: '15px',
				}}
			>
				<p style={{ margin: 0 }}>
					Help the community! Answer a simple yes or no if the highlighted words
					are tagged correctly.
				</p>
				<ol style={{ margin: 0, padding: '0 18px', fontWeight: 600 }}>
					<li>Click "Yes" if the word(s) is/are tagged correctly.</li>
					<li>
						Click "No" if the word(s) is/are not tagged correctly. Then select
						why using the drop down menu that appears.
					</li>
					<li>Click "Not Sure" if unsure.</li>
					<li>Submit Assist to save the assist and show another.</li>
					<li>Click "Close" to close this dialog.</li>
				</ol>
			</div>

			<div style={{ margin: '10px 0 ' }}>
				<Typography variant="h5" display="inline">
					Is the highlighted text in the paragraph below an entity of the type:
				</Typography>
				<div style={{ display: 'flex', marginTop: '5px' }}>
					<FormControl
						className={`tutorial-step-${componentStepNumbers['Tag Selection']}`}
						component="fieldset"
						style={{ width: '100%', paddingTop: '2px', maxWidth: 600 }}
					>
						<RadioGroup
							row
							// onChange={({ target: { value } }) => { setTag(value) }}
							value={tag}
						>
							{options}
						</RadioGroup>
					</FormControl>
					<div style={{ width: '100%' }}></div>
				</div>
				<div
					style={{ display: 'flex', marginTop: '10px', marginLeft: '-10px' }}
				>
					<GCButton
						id={'correctBtn'}
						onClick={() => annotationCorrect()}
						buttonColor={tertiaryGreen}
						style={{
							height: 40,
							minWidth: 70,
							boxShadow: answered
								? !entityIncorrect && !entityUnknown
									? `0 0 14px 3px ${tertiaryGreen}`
									: null
								: null,
						}}
					>
						Yes
					</GCButton>
					<GCButton
						id={'falseBtn'}
						onClick={() => annotationIncorrect()}
						buttonColor={tertiaryRed}
						style={{
							height: 40,
							minWidth: 70,
							boxShadow: answered
								? entityIncorrect && !entityUnknown
									? `0 0 14px 3px ${tertiaryRed}`
									: null
								: null,
						}}
					>
						No
					</GCButton>
					<GCButton
						id={'falseBtn'}
						onClick={() => annotationUnknown()}
						buttonColor={secondaryAlt}
						style={{
							height: 40,
							minWidth: 150,
							boxShadow: answered
								? entityUnknown
									? `0 0 14px 3px ${secondaryAlt}`
									: null
								: null,
						}}
					>
						Not Sure
					</GCButton>
				</div>
				{entityIncorrect && (
					<div style={{ marginTop: '10px' }}>
						<Typography variant="h5" display="outline">
							Please choose why the highlighted text is incorrect:
						</Typography>
						<FormControl variant="outlined" className={classes.formControl}>
							<Select
								value={incorrectReason}
								onChange={handleIncorrectReasonChange}
								displayEmpty
								className={classes.selectEmpty}
								inputProps={{ 'aria-label': 'Without label' }}
							>
								<MenuItem
									value=""
									disabled
									classes={{ root: { fontSize: '16px' } }}
								>
									Select...
								</MenuItem>
								<MenuItem value={1} classes={{ root: { fontSize: '16px' } }}>
									Text is an entity but classified wrong
								</MenuItem>
								<MenuItem value={2} classes={{ root: { fontSize: '16px' } }}>
									Text is an entity but parts are missing
								</MenuItem>
								<MenuItem value={3} classes={{ root: { fontSize: '16px' } }}>
									This is not an entity
								</MenuItem>
							</Select>
						</FormControl>
					</div>
				)}
			</div>

			<div
				style={{
					border: '2px solid #B0BAC5',
					boxShadow: '1px 1px gray',
					borderRadius: '5px',
					height: 300,
				}}
			>
				<TokenAnnotator
					style={{
						lineHeight: 1.5,
						height: '100%',
						overflowY: 'auto',
						padding: 20,
					}}
					tokens={tokens}
					value={[entities] || []}
					onChange={(updatedTokens) => null}
					getSpan={(span) => {
						return {
							...span,
							tag: tag,
							color: colorMap.get(tag) || 'red',
						};
					}}
					renderMark={CustomMark}
				/>
			</div>
		</div>
	);
};

GeneralUserAnnotationCard.propTypes = {
	tag: PropTypes.string.isRequired,
	entities: PropTypes.shape({
		color: PropTypes.string,
		end: PropTypes.number,
		start: PropTypes.number,
		tag: PropTypes.string,
		text: PropTypes.string,
	}),
	colorMap: PropTypes.instanceOf(Map).isRequired,
	handleAnswer: PropTypes.func.isRequired,
	paragraph: PropTypes.shape({
		par_raw_text_t: PropTypes.string,
	}),
	tags: PropTypes.array,
	componentStepNumbers: PropTypes.objectOf(PropTypes.number),
	entityAnswer: PropTypes.shape({
		correct: PropTypes.bool,
		incorrectReason: PropTypes.string,
	}),
	tagDescriptions: PropTypes.objectOf(PropTypes.string),
};

export default GeneralUserAnnotationCard;
