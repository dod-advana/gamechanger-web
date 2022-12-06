/** Custom Dimensions for Matomo.*/

/**
 * Create custom dimensions for Matomo.
 *
 * Null values are ignored.
 *
 * Reference: https://developer.matomo.org/guides/tracking-javascript-guide
 *
 * @param {str|null} text - Some text associated with the event (filename, card
 * 		title, suggested search value, button text, etc).
 * @param {int|null} pageNumber - Optional. Page number of a document that is
 * 		associated with the event.
 * @param {int|null} indexNumber - Optional. Index number that is associated
 * 		with the event.
 * @param {bool} isForOneActionOnly - Optional. True if the dimensions will only
 * 		be tracked for a single trackEvent call, false if the dimensions will be
 * 		set for all the following events. Default is true.
 * @returns {CustomDimensionForMultipleEvents[]|Object}
 */
export function makeCustomDimensions(text = null, pageNumber = null, indexNumber = null, isForOneActionOnly = true) {
	let dimensions;

	if (isForOneActionOnly) {
		dimensions = {};
		if (text !== null) {
			Object.assign(dimensions, customDimensionForSingleEvent(CUSTOM_DIMENSION_ID_MAP.TEXT, text));
		}
		if (pageNumber !== null) {
			Object.assign(dimensions, customDimensionForSingleEvent(CUSTOM_DIMENSION_ID_MAP.PAGE_NUMBER, pageNumber));
		}
		if (indexNumber !== null) {
			Object.assign(dimensions, customDimensionForSingleEvent(CUSTOM_DIMENSION_ID_MAP.INDEX_NUMBER, indexNumber));
		}
	} else {
		dimensions = [];
		if (text != null) {
			dimensions.push(new CustomDimensionForMultipleEvents(CUSTOM_DIMENSION_ID_MAP.TEXT, text));
		}
		if (pageNumber != null) {
			dimensions.push(new CustomDimensionForMultipleEvents(CUSTOM_DIMENSION_ID_MAP.PAGE_NUMBER, pageNumber));
		}
		if (indexNumber != null) {
			dimensions.push(new CustomDimensionForMultipleEvents(CUSTOM_DIMENSION_ID_MAP.INDEX_NUMBER, indexNumber));
		}
	}
	return dimensions;
}

/** Map of Matomo custom dimension IDs. */
const CUSTOM_DIMENSION_ID_MAP = Object.freeze({
	TEXT: 1,
	PAGE_NUMBER: 2,
	INDEX_NUMBER: 3,
});

/**
 * This class defines the data structure of a Matomo custom dimension that will
 * be tracked across multiple requests.
 *
 * Reference: https://developer.matomo.org/guides/tracking-javascript-guide#tracking-a-custom-dimension-across-tracking-requests
 *
 * @param {int} id - ID of the custom dimension. For example, to access
 * `custom_dimension_5`, use `5`.
 * @param {any} value - Value to assign the custom dimension.
 */
class CustomDimensionForMultipleEvents {
	constructor(id, value) {
		this.id = id;
		this.value = value;
	}
}

/**
 * Create a Matomo custom dimension that will be tracked for only one event.
 *
 * Reference: https://developer.matomo.org/guides/tracking-javascript-guide#tracking-a-custom-dimension-for-one-specific-action-only
 *
 * @param {int} id - ID of the custom dimension. For example, to access
 * `custom_dimension_5`, use `5`.
 * @param {any} value - Value to assign the custom dimension for a single event.
 */
function customDimensionForSingleEvent(id, value) {
	id = 'dimension' + id;
	const dimension = { id: value };
	return dimension;
}
