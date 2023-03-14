class PolicyFieldDefinition {
	#name;
	#nested;
	#hasSearchSubField;
	#hasGCEnglishAnalyzer;

	/**
	 * Define/create a representation of an Elasticsearch field for GAMECHANGER
	 * Policy.
	 *
	 * @param {string} name - The name of the field.
	 * @param {{hasSearchSubField: boolean|undefined, hasGCEnglishAnalyzer: boolean|undefined, parentFieldName: string|undefined}} opts -
	 * 		Field metadata. Defaults to {}.
	 * 		- hasSearchSubField: True if the field has a `search` subfield
	 * 			(defined in the Elasticsearch index mapping), false otherwise.
	 * 			Defaults to False.
	 * 		- hasGCEnglishAnalyzer: True if the field uses the
	 *	 		'gc_english' analyzer (as defined in the Elasticsearch index
	 *			mapping), false otherwise. Defaults to false.
	 *		- parentFieldName: If the field is a nested field (as defined in the
	 *			Elasticsearch index mapping), this is the name of its parent
	 *			field. Otherwise, undefined. Defaults to undefined.
	 */
	constructor(name, opts = {}) {
		const { hasSearchSubField = false, hasGCEnglishAnalyzer = false, parentFieldName = undefined } = opts;

		this.#name = name;
		this.#hasSearchSubField = hasSearchSubField;
		this.#hasGCEnglishAnalyzer = hasGCEnglishAnalyzer;

		let nestedField = undefined;
		if (parentFieldName) {
			nestedField = new PolicyFieldDefinition(parentFieldName + '.' + name, {
				...opts,
				parentFieldName: undefined,
			});
		}

		this.#nested = nestedField;
	}

	/**
	 * The field name.
	 *
	 * @return {string}
	 */
	get name() {
		return this.#name;
	}

	/**
	 * The field name + '.search'.
	 *
	 * @throws {Error} If hasSearchSubField is not set to true at initialization.
	 * @returns {string}
	 */
	get search() {
		if (this.#hasSearchSubField) {
			return this.#name + '.search';
		} else {
			throw new Error(`Policy Field ${this.#name} does not have search subfield.`);
		}
	}

	/**
	 * The field name + '.gc_english'.
	 *
	 * @throws {Error} If hasGcEnglishAnalyzer is not set to true at initialization.
	 * @returns {string}
	 */
	get gcEnglish() {
		if (this.#hasGCEnglishAnalyzer) {
			return this.#name + '.gc_english';
		} else {
			throw new Error(`Policy Field ${this.#name} does not have gc_english analyzer.`);
		}
	}

	/**
	 * The field such that its name is the full nested path.
	 *
	 * @throws {Error} If parentFieldName is not set at initialization.
	 * @returns {PolicyFieldDefinition}
	 */
	get nested() {
		if (this.#nested === undefined) {
			throw new Error(
				`Policy Field '${
					this.#name
				}' does not have 'nested' attribute because it does not have a parent field name.`
			);
		}
		return this.#nested;
	}
}

module.exports = { PolicyFieldDefinition };
