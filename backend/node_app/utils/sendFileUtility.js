const LOGGER = require('@dod-advana/advana-logger');

const sendCSVFile = async (res, sheetName, columns, data) => {
	try {
		let csv = columns.map((col) => col.header).join(',') + '\n';
		const columnKeys = columns.map((col) => col.key);

		data.forEach((row) => {
			columnKeys.forEach((key) => {
				if (row[key] && row[key] !== null) {
					if (Array.isArray(row[key])) {
						csv += row[key].join('; ').replace(/,/g, ';');
					} else if (row[key] instanceof Date) {
						csv += row[key].toString();
					} else {
						csv += row[key].toString().replace(/,/g, ';');
					}
					csv += ',';
				} else {
					//empty
					csv += ',';
				}
			});
			csv += '\n';
		});

		res.status(200);
		res.setHeader('Content-Type', 'text/csv');
		res.attachment(`${sheetName}.csv`);
		res.send(csv);
	} catch (err) {
		LOGGER.error(err, '11MLULU');
		res.status(500).send(err);
	}
};

module.exports = {
	sendCSVFile,
};
