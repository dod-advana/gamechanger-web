import React, {useEffect, useState} from 'react';
import propTypes from 'prop-types';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import {Grid} from '@material-ui/core';
import Dropzone from 'react-dropzone';
import GameChangerSearchMatrix from '../searchMetrics/GCSearchMatrix';
import GCAnalystToolsSideBar from './GCAnalystToolsSideBar';

const useStyles = makeStyles((theme) => ({
	inputBoxRoot: {
		backgroundColor: '#FFFFFF',
	},
	outlinedInput: {
		color: '#0000008A',
		fontFamily: 'Montserrat',
		fontSize: 14,
		height: 247,
		padding: '10px 0px 10px 10px',
		'&focused $notchedOutline': {
			border: `2px solid ${'#B6C6D8'} !important`,
			borderRadius: 6
		}
	},
	focused: {},
	notchedOutline: {
		border: `2px solid ${'#B6C6D8'} !important`,
		borderRadius: 6
	},
}));

const DocumentInputContainer = styled.div`
	border: 1px dashed ${'#707070'};
	background-color: ${'#F6F8FA'};
	
	.input-container-grid {
		margin: 30px;
	}
	
	.input-drop-zone {
		border: 2px solid ${'#B6C6D8'} !important;
		border-radius: 6px;
		background-color: ${'#ffffff'};
	}
	
	.instruction-box {
		font-size: 14px;
		font-family: Noto Sans;
		margin: 0px 30px 60px 30px;
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
		font-family: Noto Sans;
	}
`;

const GCDocumentsComparisonTool = (props) => {
	
	const classes = useStyles();
	
	const { context } = props;
	
	const handleFilesDropped = (files) => {
	
	}
	
	return (
		<Grid container style={{marginTop: 20}} spacing={4}>
			<Grid item xs={2}>
				<GCAnalystToolsSideBar context={context} />
			</Grid>
			<Grid item xs={10}>
				<DocumentInputContainer>
					<Grid container className={'input-container-grid'}>
						<Grid item xs={3} className={'input-drop-zone'}>
							<Dropzone
								accept='.doc, .docx, .txt'
								multiple={false}
								onDrop={files => {
									handleFilesDropped(files);
								}}
								style={{
									border: 'unset',
									borderRadius: 6,
									width: '100%',
									height: '100%'
								}}
							>
								<div style={{height: '100%'}}>
								
								</div>
							</Dropzone>
						</Grid>
						<Grid item xs={8}>
							<Grid container style={{display: 'flex', flexDirection: 'column'}}>
								<Grid item xs={12}>
									<div className={'instruction-box'}>
										Copy a paragraph into the box below, then click search to find any paragraphs in documents that match
									</div>
								</Grid>
								
								<Grid container>
									<Grid item xs={2}>
										<div className={'or-use-text'}>
											<span>Or use text field</span>
										</div>
									</Grid>
									<Grid item xs={10}>
										<div className={'input-box'}>
											<TextField
												id="input-box"
												multiline
												rows={12}
												variant="outlined"
												className={classes.inputBoxRoot}
												InputProps={{
													classes: {
														root: classes.outlinedInput,
														focused: classes.focused,
														notchedOutline: classes.notchedOutline,
													},
												}}
												defaultValue={'Text Content Here'}
												fullWidth={true}
									        />
										</div>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</DocumentInputContainer>
			</Grid>
		</Grid>
	)
};

GCDocumentsComparisonTool.propTypes = {
	context: propTypes.objectOf( {})
};

export default GCDocumentsComparisonTool;
