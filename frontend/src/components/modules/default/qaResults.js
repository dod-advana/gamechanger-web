import React, {useState} from "react";
import Fade from '@material-ui/core/Fade';
import {makeStyles} from "@material-ui/core/styles";
import {
	getTrackingNameForFactory
} from "../../../gamechangerUtils";
import {trackEvent} from "../../telemetry/Matomo";
import GCTooltip from "../../common/GCToolTip";
import GameChangerAPI from "../../api/gameChanger-service-api";
import Link from "@material-ui/core/Link";

const styles = {
	tooltipRow: {
		display: 'flex',
	  	justifyContent: 'space-between',
  		textAlign: 'center',
		width: '100%',
		maxWidth: '100px',
		marginRight: 'auto',
		marginTop: '10px'
	},
	infoCircleDiv: {
		flexGrow: 1,
	},
}
const useStyles = makeStyles((theme) => ({
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

const gameChangerAPI = new GameChangerAPI();

const GetQAResults = (props) => {
	const {
		context,
	} = props;
	const {state} = context;
	const { question, answers, filenames, docIds, resultTypes }  = state.qaResults;
	const classes = useStyles();
	const [feedback, setFeedback] = useState('');
	
	const preventDefault = (event) => event.preventDefault();
	
	const qaFeedbackComponent = (answer, filename, docId) => {
		return(
		<div style={styles.tooltipRow}>
			<GCTooltip
				enterDelay={100}
				title={
				<div style={{textAlign: 'center'}}>
					<span>This answer was retrieved based on beta artificial intelligent answering. <br />User discretion is encouraged while we continue maturing this capability.</span>
				</div>
			} placement='right' arrow>
					<i className={classes.infoCircle + " fa fa-info-circle"} aria-hidden="true"/>
			</GCTooltip>
			<Fade in={feedback === ''} timeout={ 1500 }>
				<div style={{flexGrow: 2, display: 'flex'}}>
					<i
						className={classes.feedback + " fa fa-thumbs-up"}
						style={{color: feedback === 'thumbsUp' ? '#238823' : 'white'}}
						onClick={() => {
							if(feedback === ''){
								setFeedback('thumbsUp');
								gameChangerAPI.sendQAFeedback('qa_thumbs_up', question, answer, filename, docId);
								trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'CardInteraction', 'QAThumbsUp', `question : ${question}, answer: ${answer}`);
							}
						}}>
	
					</i>
					<i
						className={classes.feedback + " fa fa-thumbs-down" }
						style={{color: feedback === 'thumbsDown' ? '#D2222D' : 'white'}}
						onClick={() => {
							if(feedback === ''){
								setFeedback('thumbsDown');
								gameChangerAPI.sendQAFeedback('qa_thumbs_down', question, answer, filename, docId);
								trackEvent(getTrackingNameForFactory(state.cloneData.clone_name), 'CardInteraction', 'QAThumbsDown', `question : ${question}, title: ${answer}`);
							}
						}}>
					</i>
				</div>
			</Fade>
		</div>);
	}

	const wikiContainer = {
		margin: '5px',
		padding: '20px',
		backgroundColor: 'rgb(241, 245, 249)',
		fontSize: '1.2em',
		width: '100%',
	}
	
	if (question !== '' && answers.length > 0){
		return (
			<div style={wikiContainer}>
					<strong>{question.toUpperCase()}</strong>
					<b style={{color: 'red', fontSize: 14, marginLeft: '5px'}}>(Beta)</b> 
					<p style={{marginTop: '10px', marginBottom: '0'}}>{answers[0]}</p>
					<Link href={"#"} onClick={(event)=> {
      						preventDefault(event);
      						window.open(`#/gamechanger-details?cloneName=${state.cloneData.clone_name}&type=${resultTypes[0]}&${resultTypes[0]}Name=${docIds[0]}`);
   						}}
					>
					<strong><b style={{fontSize: 14}}>{filenames[0]}</b></strong>
					</Link>
					{qaFeedbackComponent(answers[0], filenames[0], docIds[0])}
			</div>);
	} 
	return <></>;
}

export default GetQAResults;
