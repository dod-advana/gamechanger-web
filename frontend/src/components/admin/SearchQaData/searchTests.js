import GameChangerAPI from '../../api/gameChanger-service-api';

let gameChanger = new GameChangerAPI();
function searchTests(term) {
	let position = -1;
	gameChanger
		.testSearch(term)
		.then((data) => {
			if (data.data === '') {
				position = 404;
			} else {
				position = resultsPositionLocator(data.data.docs, term.searchText, 'title');
			}
			console.log(data.data.docs);
			return { position: position, results: data.data.docs };
		})
		.catch((e) => {
			console.log('This is bad', e);
		});

	return 'Something Broke';
}

function resultsPositionLocator(results, expectedResult, metaDataSearched) {
	let position = results.findIndex((el) => el[metaDataSearched] === expectedResult);
	return position >= 0 ? position + 1 : 404;
}

export default searchTests;
