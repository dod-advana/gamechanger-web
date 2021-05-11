

export const getColumnValue = (row, item, column) => {

    if (item) {
        if (row[item]) {
            if (Array.isArray(row[item])) {
                for (const obj of row[item]) {
                    if (obj[column]) {
                        return obj[column]
                    }
                }
            }
            else if (typeof row[item] && row[item] !== null) {
                return row[item][column]
            }
            else {
                return row[item];
            }
        }
    }

    return '';
}

export const getEDAMetadataForPropertyTable = (edaFieldJSONMap, edaFields, item) => {

	const rows = [];

	if (edaFields){
		for (const fieldName of edaFields) {
			let cleanFieldNames = fieldName.replace(/_1|_2/g, '').split('.');
			const displayName = edaFieldJSONMap?.[fieldName] ?? fieldName;

			const row = {};
			row["Key"] = displayName;

            if (cleanFieldNames && cleanFieldNames.length === 2) {
                row["Value"] = getColumnValue(item, cleanFieldNames[0], cleanFieldNames[1]);
            }
			
			if(!row["Value"] || row["Value"] === '') {
				row["Value"] = "Data Not Available";
			}
			rows.push(row);

		}
	}
	return rows;
}