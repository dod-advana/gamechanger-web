import { numberWithCommas } from '../../../utils/gamechangerUtils';

export const getEDAMetadataForPropertyTable = (edaFieldJSONMap, edaFields, item, edaFPDSMap) => {
	const rows = [];

	if (edaFields) {
		for (const fieldName of edaFields) {
			const displayName = edaFieldJSONMap?.[fieldName] ?? fieldName;

			const row = {};
			row['Key'] = displayName;

			let fpdsFieldName = edaFPDSMap[fieldName];
			if (fpdsFieldName && item[fpdsFieldName]) {
				row['Value'] =
					fieldName.indexOf('amount') === -1 ? item[fpdsFieldName] : numberWithCommas(item[fpdsFieldName]);
			} else {
				if (item[fieldName]) {
					row['Value'] =
						fieldName.indexOf('amount') === -1 ? item[fieldName] : numberWithCommas(item[fieldName]);
				} else {
					row['Value'] = 'Data Not Available';
				}
			}

			rows.push(row);
		}
	}
	return rows;
};

export const getEDAMetadataForCard = (edaFieldJSONMap, edaFields, item, edaFPDSMap, edaNumberFields) => {
	const rows = [];

	// need to use numberWithCommas only on fields that are costs

	if (edaFields) {
		for (const fieldName of edaFields) {
			let name = edaFieldJSONMap[fieldName] ?? '';
			let fpds = item?.[edaFPDSMap[fieldName]] ?? 'Data Not Available';
			let eda = item[fieldName] ?? 'Data Not Available';

			// add commas if it's a number
			if (edaNumberFields.indexOf(name) !== -1) {
				fpds = numberWithCommas(fpds);
				eda = numberWithCommas(eda);
			}

			if (fieldName.slice(0, 5) === 'fpds_') {
				fpds = eda;
				eda = 'Data Not Available';
			}
			rows.push({
				name,
				fpds,
				eda,
			});
		}
	}

	return rows;
};

export const getDisplayTitle = (item) => {
	if (item.title && item.title !== 'NA') {
		return item.title.replaceAll('-empty', '').replaceAll('empty-', '');
	} else {
		try {
			const rootfile = item.filename.substr(item.filename.lastIndexOf('/') + 1);
			const pieces = rootfile.split('-');
			const first = pieces[7];
			if (first === 'empty' || !first) {
				throw new Error('parsing failed');
			}
			const second = pieces[8] === 'empty' ? '' : `-${pieces[8]}`;
			const mod = pieces[9] === 'empty' ? '' : `-${pieces[9]}`;
			const mod2 = pieces[10] === 'empty' ? '' : `-${pieces[10]}`;

			return `${first}${second}${mod}${mod2}`;
		} catch (e) {
			return `${item?.filename?.substr(item.filename.lastIndexOf('/') + 1) ?? 'Not Available'}`;
		}
	}
};

// TREE FUNCTIONS (helpers for hierarchical filters)

/**
 * Insert children for a specific node in a tree (do nothing if node not present).
 *
 * @param {Object} root - The root node of the tree.
 * @param {Object} parentOfChildren - The node that is the parent for the inserted children.
 * @param {Array} newChildren - The children nodes to be inserted.
 *
 * @return {Object} - returns root node of unmodified tree or returns node that was modified.
 */
export const insertChildrenBF = (root, parentOfChildren, newChildren) => {
	let nodesToVisit = [root];
	while (nodesToVisit.length > 0) {
		// get current node in breadth first traversal
		const currNode = nodesToVisit[0];

		if (currNode.code === parentOfChildren.code) {
			currNode.children = newChildren;
			return currNode;
		}

		// remove current node from array of nodes to visit
		nodesToVisit = nodesToVisit.slice(1);

		// if current node has children, add them to the end of array of nodes to visit
		if (currNode.children && currNode.children.length > 0) {
			nodesToVisit = nodesToVisit.concat(currNode.children);
		}
	}
	return root;
};

/**
 * Navigate a tree of filter options to find the parents (including grandparents and so on) of a given node
 *
 * @param {Object} root - The root node of the tree.
 * @param {Object} childNode - The child node whose parents we are searching for.
 *
 * @return {Array} - of nodes of parents of childNode
 *
 * example: tree structured like this:
 * 								A
 * 						B				C
 * 					D		E				F
 * root = A, childNode = B, returns [A]
 * root = A, childNode = F, returns [A, C]
 */
export const getParentsOfChild = (root, childNode) => {
	let nodesToVisit = [root];
	let parentCodes = [];

	while (nodesToVisit.length > 0) {
		// get current node in depth first traversal
		const currNode = nodesToVisit[0];

		if (parentCodes.length > 1 && parentCodes[parentCodes.length - 1].parent === currNode.parent) {
			parentCodes = parentCodes.slice(0, -1);
		}
		parentCodes.push(currNode);

		// if we found the child our traversal is done
		if (currNode.code === childNode.code) {
			// don't include the childNode in the parentCodes
			return parentCodes.slice(0, -1);
		}

		// remove current node from array of nodes to visit
		nodesToVisit = nodesToVisit.slice(1);

		// if current node has children, add them to the beginning of array of nodes to visit
		if (currNode.children && currNode.children.length > 0) {
			nodesToVisit = currNode.children.concat(nodesToVisit);
		} else {
			parentCodes = parentCodes.slice(0, -1);
		}
	}
	return [];
};

/**
 * Do a breadth-first traversal of a tree of and apply a function to each node
 *
 * @param {Object} root - The root node of the tree.
 * @param {Function} func - The function to apply to each node
 *
 * @return {undefined} - no return value, just applies the function to each node
 */
export const applyFunctionBF = (root, func) => {
	let nodesToVisit = [root];
	while (nodesToVisit.length > 0) {
		// get current node in breadth first traversal
		const currNode = nodesToVisit[0];

		// apply func to current node
		func(currNode);

		// remove current node from array of nodes to visit
		nodesToVisit = nodesToVisit.slice(1);

		// if current node has children, add them to the end of array of nodes to visit
		if (currNode.children && currNode.children.length > 0) {
			nodesToVisit = nodesToVisit.concat(currNode.children);
		}
	}
};
