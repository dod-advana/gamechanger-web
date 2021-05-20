import React, {useEffect, useState} from 'react';
import {withStyles} from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import {gcBlue} from "../../components/common/gc-colors";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import {Typography} from "@material-ui/core";
import RemoveIcon from "@material-ui/icons/Remove";
import AddIcon from "@material-ui/icons/Add";

const StyledAccordion = withStyles({
	root: {
		border: '1px solid rgba(0, 0, 0, .125)',
		boxShadow: 'none',
		borderTopLeftRadius: 6,
		borderTopRightRadius: 6,
		'&:not(:last-child)': {
			marginBottom: '10px !important',
		},
		'&:before': {
			display: 'none',
		},
		'&$expanded': {
			margin: 'auto',
		},
	},
	expanded: {},
})(Accordion);

const StyledAccordionSummary = withStyles({
	root: {
		backgroundColor: gcBlue,
		borderRadius: 6,
		borderBottom: '1px solid rgba(0, 0, 0, .125)',
		marginBottom: -1,
		minHeight: 'unset',
		height: '44px',
		'&$expanded': {
			minHeight: 'unset',
			height: '44px',
			borderBottomLeftRadius: '0px !important',
			borderBottomRightRadius: '0px !important'
		},
	},
	content: {
		'&$expanded': {
			margin: '12px 0'
		},
	},
	expanded: {},
})(AccordionSummary);

const StyledAccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
	textAlign: 'center',
	height: 'fit-content !important'
  },
}))(AccordionDetails);

const PanelHeader = withStyles({
	root: {
		color: '#FFFFFF',
  		fontFamily: 'Montserrat',
  		fontSize: 16,
  		fontWeight: 'bold',
  		letterSpacing: 0,
		marginLeft: 10,
		marginTop: 3
	}
})(Typography);

const CollapseIcon = withStyles({
	root: {
		color: '#ffffff',
		fontSize: 22
	}
})(RemoveIcon);

const ExpandIcon = withStyles({
	root: {
		color: '#ffffff',
		fontSize: 22
	}
})(AddIcon);

const GCAccordion = (props) => {
	
	const {
		expanded,
		children,
		header,
		backgroundColor,
		itemCount,
		headerBackground,
		headerTextColor,
		headerTextWeight,
		contentPadding,
		contentAlign,
		contentHeight,
		notBordered
	} = props;
	
	const [isExpanded, setIsExpanded] = useState(false);
	
	useEffect(() => {
		
		setIsExpanded(expanded);
		
	}, [expanded])
	
	const handleExpandAccordion = (expanded) => {
		setIsExpanded(expanded);
	}

	const borderString = notBordered ? '0px' : '1px solid rgba(0, 0, 0, .125)';
	
	return (
		<StyledAccordion style={{border: borderString}} expanded={isExpanded} onChange={(event, newExpanded) => handleExpandAccordion(newExpanded)}>
			<StyledAccordionSummary style= {{ backgroundColor: headerBackground }} aria-controls="accordion-content" id="accordion-header"
							  expandIcon={isExpanded ? <CollapseIcon style={{ color: headerTextColor }}/> : <ExpandIcon style={{ color: headerTextColor }} />}>
				<PanelHeader style = {{ color: headerTextColor, fontWeight: headerTextWeight }}>{header}</PanelHeader>
				{itemCount >= 0 &&
				<Typography 
					style={{color:'white', marginTop:'3px', marginLeft:'6px', fontSize:'14px', fontWeight:'900'}}>
						({itemCount})
				</Typography>}
			</StyledAccordionSummary>
			<StyledAccordionDetails style={{ backgroundColor, padding: contentPadding, textAlign: contentAlign, height: contentHeight }}>
				{children}
			</StyledAccordionDetails>
		</StyledAccordion>
	)
}

export default GCAccordion;
