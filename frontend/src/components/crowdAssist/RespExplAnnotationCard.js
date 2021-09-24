import React, {useState} from 'react'
import {FormControlLabel, Radio, RadioGroup, Typography} from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import GCAccordion from '../common/GCAccordion';

import {TokenAnnotator} from 'react-text-annotate';
import {CustomMark} from './CustomMark';
import {backgroundWhite, primaryGreyLight} from '../common/gc-colors';
import GCButton from '../common/GCButton';


const CustomFormControlLabel = withStyles((theme) => ({
	label: {
		color: backgroundWhite
	},
}))(FormControlLabel);

const StyledRadio = (props) => {
	return (
		<div style={{
			background: backgroundWhite,
			borderTopRightRadius: '3px',
			borderBottomRightRadius: '3px',
			marginLeft: '5px',
			display: 'flex',
			//borderBottom: '.5px solid black',
			//borderTop: '.5px solid black',
			//borderLeft: '1px solid black',
			height: '100%'
		}}>
			<Radio {...props} />
		</div>
	)
}

export const RespExplAnnotationCard = ({ text, tags, currentTokens, setCurrentTokens, componentStepNumbers, colorMap, moreTextClick, aboveDisabled, belowDisabled}) => {
	const [tag, setTag] = useState(tags[0])
	const [tagColorMap] = useState(colorMap)


	const options = tags.map((tagText) => (
		<CustomFormControlLabel
			control={<StyledRadio/>}
			key={tagText}
			value={tagText}
			label={<span style={{
				margin: '5px 10px',
				color: 'white'
			}}>{tagText}</span>}
			labelPlacement="start"
			style={{
				background: tagColorMap[tagText],
				border: '1px solid #DDDDDD',
				borderRadius: '4px',
				paddingLeft: '5px',
				margin: '0 25px 0 0'
			 }}
		/>
	))

	return (
		<div className={`tutorial-step-${componentStepNumbers['Crowd Assist Panel']}`} >
			<div className={'section'}>
				<GCAccordion expanded={true} header={'How to use this tool:'}
					backgroundColor={'rgb(238,241,242)'}>
					<ol style={{ margin: 0, padding: '0 18px', fontWeight: 600}}>
						<li style={{ textAlign: 'justify' }}>
							If this line was improperly labelled as a Responsibility, select the No Responsibility button; otherwise:
						</li>
						<li style={{ textAlign: 'justify' }}>
							Select an Hightlight Type.
						</li>
						<li style={{ textAlign: 'justify' }}>
							Highlight words, sentences, or parts of text that apply.
						</li>
						<li style={{ textAlign: 'justify' }}>
							Submit to tag the text with for review.
						</li>
					</ol>
				</GCAccordion>
			</div>

			<div className={'row'} style={{ margin: '15px 0 '}}>
				<div className={'row'}>
					<Typography variant="h5" display="outline" style={{ margin: '15px 5px 0 15px' }}>Highlight text for:</Typography>
					<RadioGroup
						row
						onChange={({ target: { value } }) => { setTag(value) }}
						value={tag}
						style={{ marginTop: '5px' }}
					>
						{options}
					</RadioGroup>
				</div>
				

			</div>
			<GCButton className={'row'} style={{height: '25%', width: '100%', margin: '0 0'}}
				id={'gcAssistAbove'}
				onClick={() => { moreTextClick(-1) }}
				textStyle={{color: 'grey'}}
				buttonColor={'white'}
				borderColor={primaryGreyLight}
				disabled={aboveDisabled}
			>
				More Context Above
			</GCButton>
			<div style={{ border: '2px solid #B0BAC5', boxShadow: '1px 1px gray', borderRadius: '5px', height: 200 }}>
				<TokenAnnotator
					className={`tutorial-step-${componentStepNumbers['Paragraph to Tag']}`}
					style={{
						lineHeight: 1.5,
						height: '100%',
						overflowY: 'auto',
						padding: 20,
						whiteSpace: 'pre-wrap'
					}}
					tokens={text.trim().split(' ')}
					value={currentTokens || []}
					onChange={updatedTokens => { setCurrentTokens(updatedTokens); }}
					getSpan={span => {
						return {
							...span,
							tag: tag,
							color: tagColorMap[tag] || 'red',
						}
					}}
					renderMark={CustomMark}
				/>				
			</div>
			<GCButton className={'row'} style={{height: '25%',width: '100%', margin: '0 0'}}
				id={'gcAssistBelow'}
				onClick={() => { moreTextClick(1) }}
				textStyle={{color: 'grey'}}
				buttonColor={'white'}
				borderColor={primaryGreyLight}
				disabled={belowDisabled}
			>
				More Context Below
			</GCButton>
		</div>
	)
}
