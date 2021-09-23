export const getEDAMetadataForPropertyTable = (
	edaFieldJSONMap,
	edaFields,
	item
) => {
	const rows = [];

	if (edaFields) {
		for (const fieldName of edaFields) {
			const displayName = edaFieldJSONMap?.[fieldName] ?? fieldName;

			const row = {};
			row['Key'] = displayName;

			if (item[fieldName]) {
				row['Value'] = item[fieldName];
			} else {
				row['Value'] = 'Data Not Available';
			}

			rows.push(row);
		}
	}
	return rows;
};

export const getDisplayTitle = (item) => {
	if (item.title && item.title !== 'NA') {
		return item.title.replaceAll('-empty', '').replaceAll('empty-', '');
	} else {
		try {
			const rootfile = item.filename.substr(item.filename.lastIndexOf('/') + 1);
			const pieces = rootfile.split('-');
			const first = pieces[7];
			if (first === 'empty' || !first) {
				throw new Error('parsing failed');
			}
			const second = pieces[8] === 'empty' ? '' : `-${pieces[8]}`;
			const mod = pieces[9] === 'empty' ? '' : `-${pieces[9]}`;
			const mod2 = pieces[10] === 'empty' ? '' : `-${pieces[10]}`;

			return `${first}${second}${mod}${mod2}`;
		} catch (e) {
			return `${
				item?.filename?.substr(item.filename.lastIndexOf('/') + 1) ??
				'Not Available'
			}`;
		}
	}
};
