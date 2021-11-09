import React, { useEffect, useState } from 'react'
import { TextField, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import GCButton from '../common/GCButton';

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

export default function GCResponsibilitySearch({ setPreSearch, setReloadResponsibilities, setFilters }) {

	const classes = useStyles();

	const [docTitle, setDocTitle] = useState([]);
	const [organziation, setOrganization] = useState([]);
	const [responsibilityText, setResponsibilityText] = useState({});

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

	const handleRespChange = (text) => {
		setResponsibilityText({id: 'responsibilityText', value: text});
	}

	return (
		<div>
			<div style={styles.formField}>
				<TextField
					classes={{ root: classes.root }}
					select
					name="docTitle"
					id="docTitle"
					variant="outlined"
					label="docTitle"
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
					label="organziation"
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
			</div>
			<div style={styles.formField}>
				<TextField
					classes={{ root: classes.root }}
					variant="outlined"
					placeholder='Responsibility Text'
					value={responsibilityText?.value || ''}
					onChange={(e) => handleRespChange(e.target.value)}
				/>
			</div>
			<GCButton 
				onClick={() => {
					const filters = [];
					if(responsibilityText) filters.push(responsibilityText);
					if(organziation.length) filters.push(organziation);
					if(docTitle.docTitle) filters.push(docTitle);
					setFilters(filters);
					setReloadResponsibilities(true);
					setPreSearch(false);
				}}
				style={{margin: 0}}
			>
                Search
			</GCButton>
		</div>
	)
}

// Doc Title – User should select 0+ from a prepopulated list of options (typing should filter the list for easier selection, see “Study Section” or “Organization” fields of https://reporter.nih.gov/advanced-search)
// Org/Personnel – User should enter 0+ options view a free text field that enters separate entries when “Enter” is pressed on the keyboard.  Similar to “Organization” section of https://reporter.nih.gov/advanced-search but without the autocomplete.
// Resp text – User should be able to enter a free text search that will do exact keyword match.

