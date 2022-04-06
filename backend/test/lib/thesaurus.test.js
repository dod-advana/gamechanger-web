const assert = require('assert');
const { Thesaurus } = require('../../node_app/lib/thesaurus');

describe('Thesaurus', function () {

	describe('#waitForLoad', () => {
		it('should indicate when it is done loading the thesaurus into memory', async (done) => {
			const target = new Thesaurus();
			assert.equal(target.isLoaded(), false);
			await target.waitForLoad();
			assert.equal(target.isLoaded(), true);
			done();
		});
	});

	describe('#lookUp()', () => {
		it('should produce synonyms for a word in the thesaurus', async (done) => {
			const target = new Thesaurus();
			await target.waitForLoad();
			assert.equal(target.isLoaded(), true);
			const result = target.lookUp('defense');
			assert.equal(result.length, 20);
			assert.equal(result[0], '"defending team"');
			done();
		});

		it('should produce synonyms for a word with a space in the thesaurus', async (done) => {
			const target = new Thesaurus();
			await target.waitForLoad();
			assert.equal(target.isLoaded(), true);
			const result = target.lookUp('sewer line');
			assert.equal(result.length, 1);
			assert.equal(result[0], '"sewer main"');
			done();
		});

		it('should produce undefined for a word not in the thesaurus', async (done) => {
			const target = new Thesaurus();
			await target.waitForLoad();
			assert.equal(target.isLoaded(), true);
			const result = target.lookUp('jared');
			assert.equal(result, undefined);
			done();
		});

		it('should remove synonyms that are just different case', async (done) => {
			const target = new Thesaurus();
			await target.waitForLoad();
			assert.equal(target.isLoaded(), true);
			const result = target.lookUp('pentagon');
			// Thesaurus contains Pentagon as a match
			assert.equal(result, undefined);
			done();
		});

	});
});
