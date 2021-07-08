import React, {useEffect, useState, useRef} from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import { trackEvent } from '../telemetry/Matomo';
import {getTrackingNameForFactory, exactMatch} from '../../gamechangerUtils';
import {setState} from "../../sharedFunctions";
import { AdvDropdownWrapper } from './SearchBarStyledComponents';
import SearchMatrixFactory from "../factories/searchMatrixFactory";

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
		fontWeight: 900,
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
				content: "'\\f00c'",
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
		marginBottom: '5px',
		marginRight: '5px',
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

const AdvancedDropdown = (props) => {
  // import context, add matrix handler stuff in here
	const {
		context,
    open,
    handleSubmit,
    close
	} = props;
  const ref = useRef();
  const {state, dispatch} = context;
  const classes = useStyles();

  const [matrixHandler, setMatrixHandler] = useState();
	const [loaded, setLoaded] = useState(false);

  const [expansionTerms, setExpansionTerms] = React.useState([]);
	const comparableExpansion = JSON.stringify(state.expansionDict);

  useEffect(() => {
		// Create the factory
		if (state.cloneDataSet && !loaded) {
			const factory = new SearchMatrixFactory(state.cloneData.main_view_module);
			const handler = factory.createHandler();
			
			setMatrixHandler(handler);
			setLoaded(true);
		}
	}, [state, loaded]);

  useEffect(() => {
		// nested arrays of expanded terms from each searchTerm
		let expansion = {};
		if(comparableExpansion) {
			expansion = JSON.parse(comparableExpansion)
		}
		let expandedTerms = Object.values(expansion || {});
		const keys = Object.keys(expansion || {});
		const quotedKeys = keys.map((term) => `"${term}"`);
		const exclude = new Set([...keys, ...quotedKeys]);
		let topFive = new Set();

		while(topFive.size < 7){
			if(expandedTerms.length === 0){
				break;
			}
			const frontArr = expandedTerms[0];
			const term = frontArr.shift();
			const [a, ...rest] = expandedTerms;
			if(!term){
				expandedTerms = [...rest];
			} else {
				if(!exclude.has(term)){
					topFive.add(term);
				}
				expandedTerms = [...rest, a];
			}
		}
		let topFiveArr = Array.from(topFive)
		topFiveArr = topFiveArr.map(term => {return {...term, checked:exactMatch(state.searchText, term.phrase)}})
		setExpansionTerms(topFiveArr);

	}, [state, comparableExpansion]);

  useEffect(() => {
    const handleClick = e => {
      console.log(e.target.id)
      if (ref.current && !ref.current.contains(e.target) && !e.target.id.includes('option')) {
        close();
      }
    }; 
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);
  
	return (
		<AdvDropdownWrapper ref={ref} id="advanced-filters" style={{display: (open ? 'block' : 'none') }}>
      {matrixHandler && matrixHandler.getAdvancedOptions({state, dispatch, classes, handleSubmit})}
    </AdvDropdownWrapper>
	)
}


export default AdvancedDropdown;
