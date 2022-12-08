/** Custom Dimensions for Matomo.*/

export class CustomDimensions {
	/** Map of Matomo custom dimension IDs. */
	ID_MAP = Object.freeze({
		TEXT: 1,
		PAGE_NUMBER: 2,
		INDEX_NUMBER: 3,
	});

	constructor(isForOneActionOnly) {
		this.isForOneActionOnly = isForOneActionOnly;
		if (this.isForOneActionOnly) {
			this.values = {};
		} else {
			this.values = [];
		}
	}

	/**
	 * Create custom dimensions for Matomo event(s).
	 *
	 * Null and undefined values are ignored.
	 *
	 * Reference: https://developer.matomo.org/guides/tracking-javascript-guide
	 *
	 * @param {boolean} isForOneActionOnly - True if the dimensions will only be
	 * 	tracked for a single trackEvent call, false if the dimensions will be
	 * 	tracked for all following trackEvent calls.
	 * @param {string?} text - Optional text associated with the event(s)
	 * 	(filename, card title, suggested search value, button text, etc).
	 * 	Default is null.
	 * @param {(string|number)?} pageNumber - Optional document page number
	 * 	associated with the event(s). Default is null.
	 * @param {(string|number)?} indexNumber - Optional index number associated
	 *	with the event(s). Default is null.
	 * @returns {{id: number, value: any }[]|{dimension1?: string, dimension2?: string|number, dimension3?: string|number}}
	 */
	static create(isForOneActionOnly, text = null, pageNumber = null, indexNumber = null) {
		let dimensions = new CustomDimensions(isForOneActionOnly);
		dimensions.#add(dimensions.ID_MAP.TEXT, text);
		dimensions.#add(dimensions.ID_MAP.PAGE_NUMBER, pageNumber);
		dimensions.#add(dimensions.ID_MAP.INDEX_NUMBER, indexNumber);

		return dimensions.values;
	}

	#add(id, value) {
		if (value === null || value === undefined) return;

		if (this.isForOneActionOnly) {
			this.values['dimension' + id] = value;
		} else {
			this.values.push({
				id: id,
				value: value,
			});
		}
	}
}
