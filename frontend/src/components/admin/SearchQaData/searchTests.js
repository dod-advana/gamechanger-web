import GameChangerAPI from '../../api/gameChanger-service-api';
import documents from './testDocuments';

let gameChanger = new GameChangerAPI();
let term = { searchText: 'law' };
function searchTests() {
	gameChanger.testSearch(term).then((data) => {
		console.log('results', data.data.docs);
	});
}

export default searchTests;
