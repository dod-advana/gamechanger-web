const ExcelJS = require('exceljs');
const LOGGER = require('@dod-advana/advana-logger');

const sendExcelFile = async (res, sheetName, columns, data) => {
	try {
		const workbook = new ExcelJS.Workbook();
		let worksheet = workbook.addWorksheet(sheetName);
		worksheet.columns = columns;
		worksheet.addRows(data);
		res.status(200);
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', `attachment; filename=${sheetName}.xlsx`);
		await workbook.xlsx.write(res);
		res.end();
	} catch (err) {
		LOGGER.error(err, '11MLULU');
		res.status(500).send(err);
	}
};

module.exports = {
	sendExcelFile,
};
