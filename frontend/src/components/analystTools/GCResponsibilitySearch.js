import React, { useEffect, useState } from 'react'
import { TextField, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import GCButton from '../common/GCButton';
import Autocomplete from '@material-ui/lab/Autocomplete';

const styles = {
	formField: {
		minWidth: 500,
		display: 'block',
		margin: '10px 0'
	}
}

const useStyles = makeStyles({
	root: {
		width: '500px'
	}
})

export default function GCResponsibilitySearch({ 
	setPreSearch, 
	setReloadResponsibilities, 
	setFilters, 
	docTitle, 
	setDocTitle,
	organziation, 
	setOrganization,
	responsibilityText, 
	setResponsibilityText
}) {

	const classes = useStyles();

	const handleDocChange = event => {
		setDocTitle(
			event.target.type === 'checkbox'
            	? event.target.checked
            	: event.target.value
		);
	};

	const handleOrgChange = event => {
		setOrganization(
			event.target.type === 'checkbox'
            	? event.target.checked
            	: event.target.value
		);
	};
	const top100Films = [
		{ title: 'DoDD 1000.20', year: 1994 },
		{ title: 'DoDD 1000.21E', year: 1972 },
		{ title: 'DoDD 1332.41', year: 1974 },
		{ title: 'DoDI 3115.15', year: 2008 },
		{ title: 'DoDI 1225.08', year: 1957 },
	]

	return (
		<div>
			<div style={styles.formField}>
				<Autocomplete
					multiple
					id="tags-standard"
					options={top100Films}
					getOptionLabel={(option) => option.title}
					defaultValue={[]}
					renderInput={(params) => (
						<TextField
							{...params}
							classes={{ root: classes.root }}
							variant="outlined"
							label="Document Titles"
							// placeholder="Document Titles"
						/>
					)}
				/>
			</div>
			<div style={styles.formField}>
				<Autocomplete
					multiple
					id="tags-standard"
					options={top100Films}
					getOptionLabel={(option) => option.title}
					defaultValue={[]}
					renderInput={(params) => (
						<TextField
							{...params}
							classes={{ root: classes.root }}
							variant="outlined"
							label="Organizations"
							// placeholder="Organization"
						/>
					)}
				/>
			</div>
			{/* <div style={styles.formField}>
				<TextField
					classes={{ root: classes.root }}
					select
					name="docTitle"
					id="docTitle"
					variant="outlined"
					label="Document Title"
					SelectProps={{
						multiple: true,
						value: docTitle,
						onChange: handleDocChange
					}}
				>
					<MenuItem value="admin">Admin</MenuItem>
					<MenuItem value="user1">User1</MenuItem>
					<MenuItem value="user2">User2</MenuItem>
				</TextField>
			</div>
			<div style={styles.formField}>
				<TextField
					classes={{ root: classes.root }}
					select
					name="organziation"
					id="organziation"
					variant="outlined"
					label="Organziation"
					SelectProps={{
						multiple: true,
						value: organziation,
						onChange: handleOrgChange
					}}
				>
					<MenuItem value="admin">Admin</MenuItem>
					<MenuItem value="user1">User1</MenuItem>
					<MenuItem value="user2">User2</MenuItem>
				</TextField>
			</div> */}
			<div style={styles.formField}>
				<TextField
					classes={{ root: classes.root }}
					variant="outlined"
					placeholder='Responsibility Text'
					value={responsibilityText?.value || ''}
					onChange={(e) => setResponsibilityText({id: 'responsibilityText', value: e.target.value})}
				/>
			</div>
			<div style={{
				width: 500,
				display: 'flex',
				justifyContent: 'right'
			}}>
				<GCButton 
					onClick={() => {
						setResponsibilityText({});
						setOrganization([]);
						setDocTitle([]);
					}}
					style={{margin: 0}}
					isSecondaryBtn
				>
					Clear Filters
				</GCButton>
				<GCButton 
					onClick={() => {
						const filters = [];
						if(Object.keys(responsibilityText).length) filters.push(responsibilityText);
						if(organziation.length) filters.push(organziation);
						if(docTitle.docTitle) filters.push(docTitle);
						setFilters(filters);
						setReloadResponsibilities(true);
						setPreSearch(false);
					}}
					style={{marginLeft: 10}}
				>
					Search
				</GCButton>
			</div>
		</div>
	)
}

// Doc Title – User should select 0+ from a prepopulated list of options (typing should filter the list for easier selection, see “Study Section” or “Organization” fields of https://reporter.nih.gov/advanced-search)
// Org/Personnel – User should enter 0+ options view a free text field that enters separate entries when “Enter” is pressed on the keyboard.  Similar to “Organization” section of https://reporter.nih.gov/advanced-search but without the autocomplete.
// Resp text – User should be able to enter a free text search that will do exact keyword match.

