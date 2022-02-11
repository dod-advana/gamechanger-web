import React, {useEffect, useRef, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {setState} from '../../utils/sharedFunctions';
import AnalystToolsFactory from '../factories/analystToolsFactory';

export default function GCAnalystToolsSideBar(props) {
	
	const classes = useStyles();
	
	const {
		context
	} = props;
	
	const {state, dispatch} = context;
	
	const [analystToolsSideBarHandler, setAnalystToolsSideBarHandler] = useState();
	const [loaded, setLoaded] = useState(false);
	const [sideFilterOverlayDimension, setSideFilterOverlayDimension] = useState({width: 0, height: 0});
	
	const sideBarFilterRef = useRef();
	
	useEffect(() => {
		if (sideBarFilterRef.current) {
			setSideFilterOverlayDimension({width: sideBarFilterRef.current.offsetWidth, height: sideBarFilterRef.current.offsetHeight});
		}
	}, [sideBarFilterRef]);
	
	useEffect(() => {
		// Create the factory
		if (state.cloneDataSet && !loaded) {
			const factory = new AnalystToolsFactory(state.cloneData.main_view_module);
			const handler = factory.createHandler();
			
			setAnalystToolsSideBarHandler(handler)
			setLoaded(true);
		}
	}, [state, loaded]);
	
	const handleSubmit = (event) => {
		if (event) {
			event.preventDefault();
		}
		setState(dispatch, { runDocumentComparisonSearch: true });
	}
	
	return (
		<div style={styles.cardBody} class='analyst-tools-filters'>
			<div style={styles.innerContainer} ref={sideBarFilterRef}>
				{loaded && analystToolsSideBarHandler.getSideBarItems({
					state,
					classes,
					dispatch,
					handleSubmit,
					sideFilterOverlayDimension
				})}
			</div>
		</div>
	);
}

const styles = {
	innerContainer: {
		display: 'flex',
		height: '100%',
		flexDirection: 'column'
	},
	cardBody: {
		fontSize: '1.1em',
		fontFamily: 'Noto Sans',
	},
	subHead: {
		fontSize: '1.0em',
		display: 'flex',
		position: 'relative'
	},
	headerColumn: {
		fontSize: '1.0em',
		width: '100%',
		padding: '8px 8px',
		backgroundColor: 'rgb(50,53,64)',
		display: 'flex',
		alignItems: 'center'
	}
};

const useStyles = makeStyles({
	radioButtonLabel: {
		position: 'relative',
		backgroundColor: '#ffffff',
		padding: '5px 10px 10px 10px',
		marginRight: '20px',
		fontSize: '26px',
		height: '90px',
		lineHeight: '150px',
		display: 'block',
		cursor: 'pointer',
		boxSizing: 'border-box',
		borderRadius: '10px',
		border: '2px solid #bdccde',
	},
	titleText: {
		fontSize: '14px'
	},
	tipText: {
		maxWidth: '250px',
		width: '250px',
		margin: '0 auto',
		fontSize: '12px',
		lineHeight: '20px'
	},
	optionText: {
		margin: '20px 75px 0px',
		fontSize: '14px',
		lineHeight: '20px'
	},
	dateOptionText: {
		margin: '20px 0px 0px',
		fontSize: '14px',
		lineHeight: '20px'
	},
	title: {
		margin: '20px 75px 0px',
		fontSize: '20px',
		lineHeight: '20px',
		fontWeight: 600
	},
	rootButton: {
		visibility: 'hidden',
		width: '0px',
		padding: '0px',
		border: '0px',
		cursor: 'default'
	},
	rootLabel: {
		cursor: 'pointer',
		display: 'inline-flex',
		alignItems: 'center',
		marginRight: '26px',
		marginBottom: '15px',
		verticalAlign: 'middle'
	},
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		marginLeft: '5px',
		marginRight: '5px'
	},
	checkBox: {
		visibility: 'hidden',
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
	},
	checkedButton: {
		'& + $radioButtonLabel': {
			backgroundColor: '#313541',
			boxShadow: '0px 0px 15px grey',
			border: '2px solid #313541',
			borderRadius: '10px',
			'&, $tipText,$titleText': {
				color: '#ffffff'
			},
			'&::after': {
				fontFamily: 'FontAwesome',
				content: '\'\\f00c\'',
				width: '20px',
				height: '20px',
				lineHeight: '10px',
				borderRadius: '100%',
				fontSize: '15px',
				border: '2px solid #333',
				backgroundColor: '#ffffff',
				color: '#E9691D',
				zIndex: 999,
				position: 'absolute',
				top: '10px',
				right: '10px',
				paddingTop: '3px',
			}
		},
		'& + $checkboxPill': {
			backgroundColor: '#313541',
			boxShadow: '0px 0px 5px grey',
			border: '2px solid #313541',
			borderRadius: '10px',
			color: '#ffffff',
		}
	},
	checkboxPill: {
		width: '145px',
		textAlign: 'center',
		borderRadius: '10px',
		lineHeight: 1.2,
		fontSize: '12px',
		border: '2px solid #bdccde',
		backgroundColor: 'white',
		boxSizing: 'border-box',
		color: 'black',
		minHeight: '35px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	disabledButton: {
		'& + $checkboxPill': {
			backgroundColor: 'rgba(0, 0, 0, 0.38)',
			border: '2px solid grey',
			borderRadius: '10px',
			color: '#ffffff',
		}
	}
});

