import React from 'react';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			'& > * + *': {
				marginTop: theme.spacing(3),
			},
		},
		fullWidth: {
			minWidth: '100%',
		},
	})
);

const MultiSelectAutocomplete = (props) => {
	const { value, setValue, options, optionsDisplayKey, placeholder, label, inputId } = props;
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<Autocomplete
				value={value}
				onChange={(_event, newValue) => {
					setValue(newValue);
				}}
				multiple
				id={inputId}
				options={optionsDisplayKey ? options.map((option) => option.name) : options}
				freeSolo
				renderTags={(value, getTagProps) =>
					value.map((option, index) => (
						<Chip variant="outlined" key={option} label={option} {...getTagProps({ index })} />
					))
				}
				renderInput={(params) => (
					<div className={classes.fullWidth}>
						<TextField {...params} label={label} placeholder={placeholder} />
					</div>
				)}
			/>
		</div>
	);
};

MultiSelectAutocomplete.defaultProps = {
	optionsDisplayKey: '',
	placeholder: 'Search',
	inputId: 'tags-filled',
};

MultiSelectAutocomplete.propTypes = {
	value: PropTypes.arrayOf(PropTypes.string).isRequired,
	setValue: PropTypes.func.isRequired,
	options: PropTypes.arrayOf(PropTypes.oneOfType(PropTypes.object, PropTypes.string)).isRequired,
	label: PropTypes.string.isRequired,
	optionsDisplayKey: PropTypes.string,
	placeholder: PropTypes.string,
	inputId: PropTypes.string,
};

export default MultiSelectAutocomplete;
