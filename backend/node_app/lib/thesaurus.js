const fs = require('fs');
const path = require('path');
const readline = require('readline');
const _ = require('lodash');

const data = {};
let lineReader = readline.createInterface({
	input: fs.createReadStream(path.join(__dirname, '../resources/thesaurus.jsonl'))
});

let isLoaded = false;

lineReader.on('line', (line) => {
	let parsed = JSON.parse(line);
	let cleaned = [];

	if(parsed && parsed.synonyms && Array.isArray(parsed.synonyms)) {
		parsed.synonyms.forEach((syn) => {
			if(syn.indexOf(' ') > -1) {
				cleaned.push(`"${syn}"`);
			} else {
				cleaned.push(syn);
			}
		});

		if(!data[parsed.word]) {
			data[parsed.word] = cleaned;
		} else if(data[parsed.word] && Array.isArray(data[parsed.word])) {
			data[parsed.word] = _.uniqBy(data[parsed.word].concat(cleaned));
		}
	}
});

lineReader.on('close', () => {
	isLoaded = true;
});

class Thesaurus {
	lookUp(word) {
		let result = data[word];
		let cleaned = [];
		if(result && result.length && result.length > 0) {
			result.forEach((syn) => {
				if(syn.toLowerCase() !== word.toLowerCase()) {
					cleaned.push(syn);
				}
			});
			result = cleaned;
		}
		if(result && !result.length) {
			result = undefined;
		}
		return result;
	}

	isLoaded() {
		return isLoaded;
	}

	async waitForLoad() {
		return new Promise((resolve, reject) => {
			if(isLoaded) {
				resolve(true);
			} else {
				let interval = setInterval(() => {
					if(isLoaded) {
						clearInterval(interval);
						resolve(true);
					}
				}, 1000);
			}
		});
	}
}

module.exports.Thesaurus = Thesaurus;