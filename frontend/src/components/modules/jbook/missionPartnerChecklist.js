import { FormControlLabel, Checkbox, FormControl, FormGroup } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';


export const renderMissionPartnersCheckboxes = (setMP, mpOptions, finished, agree = false) => {
	const checkboxes = [];
	let entries = Object.entries(mpOptions);
	entries.sort((a, b) => {
		if (a < b) {
			return -1;
		}
		if (a > b) {
			return 1;
		}
		return 0;
	});
	for (const [key, value] of entries) {
		checkboxes.push(
			<FormControlLabel
				key={key}
				name={key}
				value={key}
				style={{ width: '100%', margin: '10px 0' }}
				control={<Checkbox
					style={{
						backgroundColor: '#ffffff',
						borderRadius: '5px',
						padding: '2px',
						border: '2px solid #bdccde',
						pointerEvents: 'none',
						margin: '0px 10px 0px 5px',
					}}
					onClick={() => {
						const newMap = { ...mpOptions };
						newMap[key] = !value;
						setMP(newMap);
					}
					}
					icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
					checked={value}
					checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
					name={key}
				/>}
				label={<span style={{ fontSize: 13, lineHeight: '5px' }}><b>{key}</b></span>}
				labelPlacement="end"
				disabled={finished || agree} //|| roleDisabled}
			/>
		);
	}
	return (
		<FormControl style={{ margin: '15px 0 15px 10px', flexDirection: 'row', color: 'gray' }}>
			<FormGroup>
				{checkboxes}
			</FormGroup>
		</FormControl>);
};