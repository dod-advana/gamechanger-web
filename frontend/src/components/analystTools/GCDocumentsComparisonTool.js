import React from 'react';
import propTypes from 'prop-types';
import LoadableVisibility from 'react-loadable-visibility/react-loadable';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import GameChangerAPI from '../api/gameChanger-service-api';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import { gcOrange } from '../common/gc-colors';

const gameChangerAPI = new GameChangerAPI();

const WrappedLoadingIndicator = (
	<div style={{ width: window.screen.width - 50 }}>
		<LoadingIndicator shaddedOverlay={true} />
	</div>
);

const PolicyDocumentsComparisonTool = LoadableVisibility({
	loader: () => import('../modules/policy/policyDocumentsComparisonTool'),
	loading: () => WrappedLoadingIndicator,
});

const EDADocumentsComparisonTool = LoadableVisibility({
	loader: () => import('../modules/eda/edaDocumentsComparisonTool'),
	loading: () => WrappedLoadingIndicator,
});

const GCDocumentsComparisonTool = ({ context }) => {
	const { state } = context;
	const { cloneData } = state;

	const classes = useStyles();

	const getComparisonToolComponent = (props) => {
		// there's only 2 clones that use this atm
		switch (cloneData.clone_name) {
			case 'eda':
				return <EDADocumentsComparisonTool {...props} />;
			case 'policy':
				return <PolicyDocumentsComparisonTool {...props} />;
			default:
				return <PolicyDocumentsComparisonTool {...props} />;
		}
	};

	return (
		<>
			{getComparisonToolComponent({
				context,
				gameChangerAPI,
				styles,
				DocumentInputContainer,
				resetAdvancedSettings,
				classes,
			})}
		</>
	);
};

const styles = {
	image: {
		display: 'flex',
		justifyContent: 'center',
		margin: 'auto',
		marginLeft: '10px',
		height: 30,
		color: '#939395',
		cursor: 'pointer',
	},
	checkbox: {
		padding: '9px',
	},
	collapsedInput: {
		margin: 'auto 0',
		display: '-webkit-box',
		WebkitLineClamp: 3,
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden',
	},
	resultsText: {
		fontSize: 24,
		fontFamily: 'Montserrat',
		borderBottom: '2px solid #BCCBDB',
		display: 'flex',
		placeContent: 'space-between',
		marginTop: 20,
		marginLeft: 20,
	},
};

const DocumentInputContainer = styled.div`
	border: 5px ${'#FFFFFF'};
	border-radius: 5px;
	background-color: ${'#F6F8FA'};
	padding: 20px;
	margin: ${(props) => (props.policy ? '20px 0px 0px 0px' : '20px 0px 0px 20px')};

	.input-container-grid {
		margin-top: 30px;
		margin-left: 80px;
	}

	.input-drop-zone {
		border: 2px solid ${'#B6C6D8'} !important;
		border-radius: 6px;
		background-color: ${'#ffffff'};
	}

	.instruction-box {
		font-size: 1.1em;
		font-style: initial;
		font-family: Noto Sans;
		font-color: ${'#2f3f4a'};
		margin-bottom: 10px;
	}

	.or-use-text {
		height: 100%;
		text-align: center;
		display: table;
		width: 100%;

		> span {
			display: table-cell;
			vertical-align: middle;
		}
	}

	.input-box {
		font-size: 14px;
		overflow: auto;
		font-family: Noto Sans;
	}

	fieldset {
		height: auto !important;
	}

	.document-imported-block {
		display: flex;

		& .document-text {
			border: 2px solid ${'#B6C6D8'} !important;
			border-radius: 6px;
			background-color: ${'rgb(239, 242, 246)'};
			margin: 30px 0px 30px 30px;
			width: 100%;
			overflow: scroll;
			height: 250px;

			& .text {
				padding: 5px;
			}
		}

		& .remove-document {
			padding-top: 16px;
		}
	}
`;

const useStyles = makeStyles((theme) => ({
	outlinedInput: {
		color: '#0000008A',
		backgroundColor: '#FFFFFF',
		fontFamily: 'Montserrat',
		fontSize: 14,
		height: 247,
		padding: '10px 0px 10px 10px',
		'&focused $notchedOutline': {
			border: `2px solid ${'#B6C6D8'} !important`,
			borderRadius: 6,
		},
		'& textarea': {
			height: '100%',
		},
	},
	root: {
		paddingTop: '16px',
		marginRight: '10px',
		'& .MuiInputBase-root': {
			height: '50px',
			fontSize: 20,
		},
		'& .MuiFormLabel-root': {
			fontSize: 20,
		},
		'&:hover .MuiInput-underline:before': {
			borderBottom: `3px solid ${gcOrange}`,
		},
		'& .MuiInput-underline:before': {
			borderBottom: `3px solid rgba(0, 0, 0, 0.42)`,
		},
		'& .MuiInput-underline:after': {
			borderBottom: `3px solid ${gcOrange}`,
		},
		'& .Mui-focused': {
			borderColor: `${gcOrange}`,
			color: `${gcOrange}`,
		},
	},
	focused: {},
	notchedOutline: {
		border: `2px solid ${'#B6C6D8'} !important`,
		borderRadius: 6,
		height: '100%',
	},
	dialogXl: {
		maxWidth: '1920px',
		minWidth: '1500px',
		backgroundColor: '#EFF1F6',
		height: 850,
	},
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		margin: 'auto 5px auto 0px',
		height: 19,
		width: 19,
	},
	feedback: {
		fontSize: 25,
		margin: 'auto 0 auto 10px',
		justifyContent: 'center',
		color: 'white',
		'-webkit-text-stroke': '1px #808080',
		'&:hover': {
			cursor: 'pointer',
			'-webkit-text-stroke': '1px black',
		},
	},
	selectIcon: {
		marginTop: '4px',
	},
	formlabel: {
		paddingTop: '16px',
	},
}));

const resetAdvancedSettings = (dispatch) => {
	dispatch({ type: 'RESET_ANALYST_TOOLS_SEARCH_SETTINGS' });
};

GCDocumentsComparisonTool.propTypes = {
	context: propTypes.objectOf({}),
};

export default GCDocumentsComparisonTool;
