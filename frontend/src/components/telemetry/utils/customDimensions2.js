/** Custom Dimensions for Matomo.*/

/** Map of Matomo custom dimension IDs. */
const CUSTOM_DIMENSION_ID_MAP = Object.freeze({
	TEXT: 'dimension1',
	PAGE_NUMBER: 'dimension2',
	INDEX_NUMBER: 'dimension3',
});

/**
 * This class defines the data structure of a custom dimension in Matomo.
 *
 * @param {int} id - ID of the custom dimension. For example, to access
 * `custom_dimension_5`, use `5`.
 * @param {any} value - Value to assign the custom dimension for an event.
 */
export class CustomDimension {
	constructor(id, value) {
		this.id = id;
		this.value = value;
	}
}

/**
 * Create an array of Matomo custom dimensions to include in a tracked event.
 * Null values will are ignored.
 *
 * @param {str|null} text - Some text associated with the event (filename, card
 * 		title, suggested search value, button text, etc).
 * @param {int|null} pageNumber - Optional. Page number of a document that is
 * 		associated with the event.
 * @param {int|null} indexNumber - Optional. Index number that is associated
 * 		with the event.
 * @returns {CustomDimension[]}
 */
export function makeCustomDimensions(text = null, pageNumber = null, indexNumber = null) {
	let dimensions = {};

	if (text != null) {
		// dimensions.push({ CUSTOM_DIMENSION_ID_MAP.TEXT: text });
		// dimensions.push({ dimension1: text });
		dimensions['dimension1'] = text;
	}

	if (pageNumber != null) {
		// dimensions.push({ dimension2: pageNumber });
		// dimensions.push(new CustomDimension(CUSTOM_DIMENSION_ID_MAP.PAGE_NUMBER, pageNumber));
		dimensions['dimension2'] = pageNumber;
	}

	if (indexNumber != null) {
		// dimensions.push(new CustomDimension(CUSTOM_DIMENSION_ID_MAP.INDEX_NUMBER, indexNumber));
		// dimensions.push({ dimension3: indexNumber });
		dimensions['dimension3'] = indexNumber;
	}

	return dimensions;
}
