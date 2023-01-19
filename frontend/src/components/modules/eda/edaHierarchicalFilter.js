import React, { useEffect, useState } from 'react';

import { FormGroup, FormControlLabel, Checkbox, Button } from '@material-ui/core';
import CheveronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';

const styles = {
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		marginLeft: '5px',
		marginRight: '5px',
	},
	filterTitle: {
		display: 'inline-block',
		fontSize: 14,
		fontWeight: 600,
	},
	hierarchicalFilterText: {
		fontSize: '16 !important',
		fontWeight: 'normal',
		marginBottom: 0,
	},
	hierarchicalFilterButton: {
		height: 'fit-content',
		alignSelf: 'center',
		padding: '2px',
		margin: '0px 20px 0px 0px',
		minWidth: 'fit-content',
	},
	width100: {
		width: '100%',
	},
};

const applyFunctionBF = (root, func) => {
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

const EdaHierarchicalFilter = ({ options, getChildOptions, state }) => {
	// holds boolean for each node to represent whether that nodes children are expanded
	const [optionsExpanded, setOptionsExpanded] = useState({});
	// holds boolean for each node to represent whether we are currently fetching its children from server
	const [fetchingChildrenFor, setFetchingChildrenFor] = useState({});
	// false before mounting, true after mounting
	const [didMount, setDidMount] = useState(false);

	useEffect(() => {
		// only update this initially
		if (!didMount) {
			const newOptionsExpanded = {};
			const newFetchingChildrenFor = {};
			options.forEach((root) => {
				// for each root, want to navigate the tree of & determine whether each level is expanded
				applyFunctionBF(root, (node) => {
					newOptionsExpanded[node.code] = false;
					newFetchingChildrenFor[node.code] = false;
				});
			});
			console.log('newOptionsExpanded', newOptionsExpanded);
			setOptionsExpanded(newOptionsExpanded);
			setFetchingChildrenFor(newFetchingChildrenFor);
			setDidMount(true);
		}
	}, [options, didMount]);

	return options.map((root) => {
		const currentlyExpanded = optionsExpanded[root.code];
		return (
			<FormGroup key={root.code}>
				<div style={{ display: 'flex', width: '100%' }}>
					<Button
						variant="text"
						style={styles.hierarchicalFilterButton}
						onClick={() => {
							//kick off query?
							if (root.children?.length === 0) {
								const newFetchingChildrenFor = { ...fetchingChildrenFor };
								newFetchingChildrenFor[root.code] = true;
								setFetchingChildrenFor(newFetchingChildrenFor);
							}

							// expand section
							const newOptionsExpanded = { ...optionsExpanded };
							newOptionsExpanded[root.code] = !currentlyExpanded;
							setOptionsExpanded(newOptionsExpanded);
						}}
					>
						{currentlyExpanded ? (
							<ExpandMoreIcon style={styles.icon} />
						) : (
							<CheveronRightIcon style={styles.icon} />
						)}
					</Button>
					<FormControlLabel
						name={root.name}
						value={root.code}
						style={styles.hierarchicalFilterText}
						control={
							<Checkbox
								style={styles.filterBox}
								onClick={() => {
									console.log('clicked this one: ', root);
								}}
								icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
								// checked={
								// 	state.edaSearchSettings &&
								// 	state.edaSearchSettings.organizations &&
								// 	state.edaSearchSettings.organizations.indexOf('air force') !== -1
								// }
								checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
								name={root.name}
							/>
						}
						label={root.name}
						labelPlacement="end"
						id={`${root.code}-checkbox`}
					/>
				</div>
				{currentlyExpanded && (
					<div
						style={{
							width: '100%',
							borderLeft: '1px solid rgba(0, 0, 0, 0.125)',
							paddingLeft: '10px',
							marginTop: '5px',
							marginBottom: '10px',
						}}
					>
						{root.children.length === 0 ? (
							<div>fetching rn</div>
						) : (
							root.children.map((child) => {
								return (
									<EdaHierarchicalFilter
										options={[child]}
										getChildOptions={getChildOptions}
										state={state}
									/>
								);
							})
						)}
					</div>
				)}
			</FormGroup>
		);
	});
};

export default EdaHierarchicalFilter;
