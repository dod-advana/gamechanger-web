

export const getEDAMetadataForPropertyTable = (edaFieldJSONMap, edaFields, item) => {

	const rows = [];
    
	if (edaFields){
		for (const fieldName of edaFields) {
			const displayName = edaFieldJSONMap?.[fieldName] ?? fieldName;

			const row = {};
			row["Key"] = displayName;


            if (item[fieldName]) {
                row["Value"] = item[fieldName];
            }
			else {
				row["Value"] = "Data Not Available";
            }

            
			rows.push(row);

		}
	}
	return rows;
}