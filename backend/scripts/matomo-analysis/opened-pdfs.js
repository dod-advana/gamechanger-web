const fs = require('fs');
const parse = require('csv-parse');

const csvData = [];
fs.createReadStream('./files/myFile8.csv')
	.pipe(parse({ delimiter: ',' }))
	.on('data', function (csvrow) {
		csvData.push(csvrow);
	})
	.on('end', function () {
		//do something with csvData
		//console.log(csvData);
		handleData(csvData);
	});

const handleData = (data) => {
	let currentSession = null;
	let firstEvent = true;
	let totalSearches = 0;
	let pdfsOpened = 0;
	let searchesWithPdfOpens = 0;
	let searchesWithoutPdfOpens = 0;
	let ranSearch = false;
	data.forEach((event) => {
		const session = event[0];
		const searchType = event[1];
		const value = event[2];
		const time = event[3];

		if(session !== currentSession) {
			currentSession = session;
			if(!firstEvent && ranSearch) {
				searchesWithoutPdfOpens++;
				ranSearch = false;
			}
		}

		if(searchType !== '\\N') {
			totalSearches++;
			if(ranSearch) {
				searchesWithoutPdfOpens++;
			}
			ranSearch = true;
		} else if (searchType === '\\N' && value === 'PDFOpen'){
			pdfsOpened++;
			if(ranSearch) {
				searchesWithPdfOpens++;
			}
			ranSearch = false;
		}

		firstEvent = false;
	});
	console.log(`Total searches ${totalSearches}`);
	console.log(`Total pdfs opened ${pdfsOpened}`);
	console.log(`Searches with pdf opens ${searchesWithPdfOpens}`);
	console.log(`Searches without pdf opens ${searchesWithoutPdfOpens}`);
	console.log(`Percentage of searches with pdf opens ${(searchesWithPdfOpens / totalSearches) * 100}`);
};