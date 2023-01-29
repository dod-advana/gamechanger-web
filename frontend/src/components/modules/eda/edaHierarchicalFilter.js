import React, { useEffect, useState } from 'react';

import { FormGroup, FormControlLabel, Checkbox, Button, Typography } from '@material-ui/core';
import CheveronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';

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
		fontSize: '14 !important',
		fontWeight: 'normal',
		marginBottom: 0,
		textAlign: 'left',
	},
	hierarchicalFilterButton: {
		height: 'fit-content',
		alignSelf: 'center',
		padding: '2px',
		margin: '0px 10px 0px 0px',
		minWidth: 'fit-content',
	},
	expandedChildren: {
		width: '100%',
		borderLeft: '1px solid rgba(0, 0, 0, 0.125)',
		borderBottom: '1px solid rgba(0, 0, 0, 0.125)',
		paddingLeft: '15px',
		marginTop: '5px',
		marginBottom: '15px',
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

const EdaHierarchicalFilter = ({ options, fetchChildren, onOptionClick, optionsSelected }) => {
	// holds boolean for each node to represent whether that nodes children are expanded
	const [optionsExpanded, setOptionsExpanded] = useState({});
	// holds boolean for each node to represent whether we are currently fetching its children from server
	const [fetchingChildrenFor, setFetchingChildrenFor] = useState({});
	// false before mounting, true after mounting
	const [didMount, setDidMount] = useState(false);

	console.log('options selected: ', optionsSelected);

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
		const fetchingChildren = fetchingChildrenFor[root.code];
		const childrenFetched = root.children && !(root.children.length <= 0);
		const displayName = root.name === root.code ? root.name : `${root.name} - ${root.code}`;

		const expandedSection = fetchingChildren ? (
			<div style={styles.expandedChildren}>
				<LoadingIndicator
					inline
					containerStyle={{
						height: '40px',
						textAlign: 'center',
						paddingTop: '5px',
						paddingBottom: '5px',
					}}
				/>
			</div>
		) : childrenFetched ? (
			<div style={styles.expandedChildren}>
				{root.children.map((child) => {
					return (
						<EdaHierarchicalFilter
							key={child.code}
							options={[child]}
							fetchChildren={fetchChildren}
							onOptionClick={onOptionClick}
							optionsSelected={optionsSelected}
						/>
					);
				})}
			</div>
		) : (
			<></>
		);

		return (
			<FormGroup key={root.code}>
				<div style={{ display: 'flex', width: '100%', marginBottom: '10px' }}>
					<Button
						variant="text"
						style={styles.hierarchicalFilterButton}
						onClick={() => {
							// if we are currently expanding this section and
							//    we are not currently fetching its children and
							//    we have not already fetched its children
							if (!currentlyExpanded && !fetchingChildren && !childrenFetched) {
								const newFetchingChildrenFor = { ...fetchingChildrenFor };
								newFetchingChildrenFor[root.code] = true;
								setFetchingChildrenFor(newFetchingChildrenFor);
								fetchChildren(root)
									.then(() => {
										console.log('fetched children');
										const newFetchingChildrenFor = { ...fetchingChildrenFor };
										newFetchingChildrenFor[root.code] = false;
										setFetchingChildrenFor(newFetchingChildrenFor);
									})
									.catch((err) => console.log('error fetching children'));
							}

							// handle toggling the section open/closed
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
								onClick={(e) => {
									console.log(e);
									onOptionClick(root.code);
								}}
								icon={
									<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden', width: 15, height: 15 }} />
								}
								checked={optionsSelected.indexOf(root.code) !== -1}
								checkedIcon={
									<i
										style={{
											color: '#E9691D',
											width: 15,
											height: '15px',
											fontSize: 15,
										}}
										className="fa fa-check"
									/>
								}
								name={root.name}
							/>
						}
						label={
							<Typography variant="body2" color="textSecondary">
								{displayName}
							</Typography>
						}
						labelPlacement="end"
						id={`${root.code}-checkbox`}
					/>
				</div>
				{currentlyExpanded && <div style={styles.width100}>{expandedSection}</div>}
			</FormGroup>
		);
	});
};

export default EdaHierarchicalFilter;
