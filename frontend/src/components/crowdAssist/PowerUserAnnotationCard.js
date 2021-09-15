import React, { useEffect, useState } from 'react';
import {
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
} from '@material-ui/core';
import { TokenAnnotator } from 'react-text-annotate';
import { CustomMark } from './CustomMark';
import LinearProgressWithLabel from '@material-ui/core/LinearProgress';
import withStyles from '@material-ui/core/styles/withStyles';
import {
	primary,
	backgroundWhite,
	backgroundGreyDark,
	primaryPurple,
	primaryAlt,
	tertiaryGoldDarkest,
	primaryRed,
	primaryDark,
	tertiaryGreen,
} from '../../components/common/gc-colors';
import { Typography } from '@material-ui/core';

const BorderLinearProgress = withStyles((theme) => ({
	root: {
		height: 15,
		borderRadius: 10,
	},
	colorPrimary: {
		backgroundColor: backgroundGreyDark,
	},
	bar: {
		borderRadius: 10,
		backgroundColor: primary,
	},
}))(LinearProgressWithLabel);

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

const highlightColors = [
	primaryPurple,
	primaryAlt,
	tertiaryGoldDarkest,
	primaryRed,
	primaryDark,
	tertiaryGreen,
];

export const PowerUserAnnotationCard = ({
	text,
	tags,
	currentTokens,
	setCurrentTokens,
	progressText,
	progressValue,
	componentStepNumbers,
	isTutorial,
}) => {
	const [tag, setTag] = useState(tags[0]);
	// const [currentTokens, setCurrentTokens] = useState([])
	const [tagColorMap, setTagColorMap] = useState(new Map());

	useEffect(() => {
		// when tags prop changes this will create a new Map of colors for each tag
		for (let i = highlightColors.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[highlightColors[i], highlightColors[j]] = [
				highlightColors[j],
				highlightColors[i],
			];
		}
		const tagmap = tags.reduce((acc, tag, i) => {
			acc.set(tag, highlightColors[i % highlightColors.length]);
			return acc;
		}, new Map());

		setTagColorMap(tagmap);
		setTag(tags[0]);
	}, [tags]);

	const options = tags.map((tagText) => (
		<CustomFormControlLabel
			control={<StyledRadio />}
			key={tagText}
			value={tagText}
			label={
				<span
					style={{
						margin: '5px 10px',
						color: 'white',
					}}
				>
					{tagText}
				</span>
			}
			labelPlacement="start"
			style={{
				background: tagColorMap.get(tagText),
				border: '1px solid #DDDDDD',
				borderRadius: '4px',
				paddingLeft: '5px',
				margin: '0 25px 0 0',
			}}
		/>
	));

	return (
		<div
			className={`tutorial-step-${componentStepNumbers['Crowd Assist Panel']}`}
		>
			<div
				style={{
					backgroundColor: '#DFE6EE',
					padding: '20px 15px',
					margin: '15px 0',
				}}
			>
				<p style={{ margin: 0 }}>
					Help the community! Highlight text you're familiar with, and tag it
					with a corresponding opinion.
				</p>
				<ol style={{ margin: 0, padding: '0 18px', fontWeight: 600 }}>
					<li>Select one option</li>
					<li>Highlight words, sentences, or parts of text that apply.</li>
					<li>Submit Assist to tag text with options.</li>
				</ol>
			</div>
			<div className={'row'}>
				<div className={'col-xs-3'} style={{ marginTop: '5px' }}>
					<BorderLinearProgress
						variant="determinate"
						value={progressValue}
						className={`tutorial-step-${componentStepNumbers['Paragraph Progress']}`}
					/>
				</div>
				<p className={'col-xs-3'}>{progressText}</p>
			</div>

			<div className={'row'} style={{ margin: '10px 0 ' }}>
				<Typography variant="h5" display="outline">
					Please select an option
				</Typography>
				<FormControl
					className={`tutorial-step-${componentStepNumbers['Tag Selection']}`}
					component="fieldset"
					style={{ width: '100%', padding: '10px 0' }}
				>
					<RadioGroup
						row
						onChange={({ target: { value } }) => {
							setTag(value);
						}}
						value={tag}
						style={{ marginTop: '5px' }}
					>
						{options}
					</RadioGroup>
				</FormControl>
				<Typography
					variant="h5"
					display="outline"
					style={{ margin: '15px 0 0 0' }}
				>
					Highlight text for: {tag}
				</Typography>
			</div>

			<div
				style={{
					border: '2px solid #B0BAC5',
					boxShadow: '1px 1px gray',
					borderRadius: '5px',
					height: 200,
				}}
			>
				<TokenAnnotator
					className={`tutorial-step-${componentStepNumbers['Paragraph to Tag']}`}
					style={{
						lineHeight: 1.5,
						height: '100%',
						overflowY: 'auto',
						padding: 20,
					}}
					tokens={text.split(' ')}
					value={currentTokens || []}
					onChange={(updatedTokens) => {
						setCurrentTokens(updatedTokens);
					}}
					getSpan={(span) => {
						return {
							...span,
							tag: tag,
							color: tagColorMap.get(tag) || 'red',
						};
					}}
					renderMark={CustomMark}
				/>
			</div>
		</div>
	);
};
