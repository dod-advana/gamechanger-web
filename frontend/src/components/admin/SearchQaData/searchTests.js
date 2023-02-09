import GameChangerAPI from '../../api/gameChanger-service-api';
import documents from './testDocuments';

let gameChanger = new GameChangerAPI();
function searchTests() {
	for (const element of documents) {
		let term = { searchText: element.searchText };
		gameChanger.testSearch(term).then((data) => {
			if (data.data === '') {
				console.log('no results found');
			} else {
				console.log('results', data.data.docs);
			}
		});
	}
}

export default searchTests;
