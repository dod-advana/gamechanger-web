import React, { useState, useEffect } from 'react';
import ReactTable from 'react-table';
import { Snackbar } from '@material-ui/core';
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCAccordion from '../../common/GCAccordion';
import GCButton from '../../common/GCButton';
import { styles, TableRow } from '../util/GCAdminStyles';
import AddEditorTermDialog from './AddEditorTermDialog';
import _ from 'lodash';

const gameChangerAPI = new GameChangerAPI();

/**
 *
 * @class HomepageEditor
 */
export default () => {
	// State Variables
	const [editorTableData, setEditorTableData] = useState({
		topics: [],
		major_pubs: [],
		popular_docs: [],
	});
	const [showAddEditorTermDialog, setShowAddEditorTermDialog] = useState(false);
	const [section, setSection] = useState('topic');
	const [showSavedSnackbar, setShowSavedSnackbar] = useState(false);

	// Component methods
	/**
	 * This updates the table data for the editor table.
	 * Is only used in the child modal
	 * @method handleAddRow
	 * @param {*} value
	 */
	const handleAddRow = (value) => {
		const tmp = { ...editorTableData };
		tmp[section].push(value);
		setEditorTableData(tmp);
	};
	/**
	 *
	 */
	const getHomepageEditorData = async () => {
		const tableData = {
			topics: [],
			major_pubs: [],
			popular_docs: [],
			popular_docs_inactive: [],
		};
		const { data } = await gameChangerAPI.getHomepageEditorData();
		data.forEach((obj) => {
			if (obj.key === 'homepage_topics') {
				tableData.topics = JSON.parse(obj.value);
			} else if (obj.key === 'homepage_major_pubs') {
				tableData.major_pubs = JSON.parse(obj.value);
			} else if (obj.key === 'popular_docs') {
				tableData.popular_docs = obj.value;
			} else if (obj.key === 'homepage_popular_docs_inactive') {
				tableData.popular_docs_inactive = JSON.parse(obj.value);
			}
		});
		setEditorTableData(tableData);
	};
	/**
	 *
	 * @param {*} key
	 * @param {*} index
	 */
	const handleShiftRowDown = (key, index) => {
		const curr = editorTableData[key][index];
		const next = editorTableData[key][index + 1];
		const tmp = { ...editorTableData };
		tmp[key][index] = next;
		tmp[key][index + 1] = curr;
		setEditorTableData(tmp);
	};
	/**
	 *
	 */
	const handleShiftRowUp = (key, index) => {
		const curr = editorTableData[key][index];
		const prev = editorTableData[key][index - 1];
		const tmp = { ...editorTableData };
		tmp[key][index] = prev;
		tmp[key][index - 1] = curr;
		setEditorTableData(tmp);
	};
	/**
	 *
	 * @param {*} key
	 */
	const saveHomepageEditor = async (key) => {
		try {
			await gameChangerAPI.setHomepageEditorData({
				key,
				tableData: editorTableData[key],
			});
		} catch (e) {
			console.log(e);
			console.log('failed to save');
		}
	};
	useEffect(() => {
		getHomepageEditorData();
		// eslint-disable-next-line
	}, []);

	// Columns for tables
	const topicColumns = [
		{
			Header: 'Name',
			accessor: 'name',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: ' ',
			accessor: 'id',
			Cell: (row) => (
				<TableRow>
					<GCButton
						onClick={() => {
							handleShiftRowUp('topics', row.index);
						}}
						disabled={row.index === 0}
						style={{
							minWidth: 'unset',
							backgroundColor: 'green',
							borderColor: 'green',
							height: 35,
						}}
					>
						Up
					</GCButton>
					<GCButton
						onClick={() => {
							handleShiftRowDown('topics', row.index);
						}}
						disabled={row.index === editorTableData['topics'].length - 1}
						style={{
							minWidth: 'unset',
							backgroundColor: 'red',
							borderColor: 'red',
							height: 35,
						}}
					>
						Down
					</GCButton>
					<GCButton
						onClick={() => {
							editorTableData['topics'].splice(row.index, 1);
							setEditorTableData({
								...editorTableData,
								topics: editorTableData['topics'],
							});
						}}
						style={{
							minWidth: 'unset',
							backgroundColor: 'red',
							borderColor: 'red',
							height: 35,
						}}
					>
						Remove
					</GCButton>
				</TableRow>
			),
		},
	];

	const popPubColumns = [
		{
			Header: 'Name',
			accessor: 'name',
			width: 300,
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: 'ID',
			accessor: 'id',
			Cell: (row) => <TableRow>{row.value}</TableRow>,
		},
		{
			Header: ' ',
			accessor: 'id',
			width: 400,
			Cell: (row) => (
				<TableRow>
					<GCButton
						onClick={() => {
							const index = _.findIndex(
								editorTableData.popular_docs_inactive,
								(item) => item === row.value
							);
							editorTableData.popular_docs_inactive.splice(index, 1);
							setEditorTableData({
								...editorTableData,
								popular_docs_inactive: editorTableData.popular_docs_inactive,
							});
						}}
						disabled={
							_.find(
								editorTableData.popular_docs_inactive,
								(item) => item === row.value
							) === undefined
						}
						style={{
							minWidth: 'unset',
							backgroundColor: 'green',
							borderColor: 'green',
							height: 35,
						}}
					>
						Enable
					</GCButton>
					<GCButton
						onClick={() => {
							editorTableData.popular_docs_inactive.push(row.value);
							setEditorTableData({
								...editorTableData,
								popular_docs_inactive: editorTableData.popular_docs_inactive,
							});
						}}
						disabled={
							_.find(
								editorTableData.popular_docs_inactive,
								(item) => item === row.value
							) !== undefined
						}
						style={{
							minWidth: 'unset',
							backgroundColor: 'red',
							borderColor: 'red',
							height: 35,
						}}
					>
						Disable
					</GCButton>
				</TableRow>
			),
		},
	];

	return (
		<>
			<div style={{ height: '100%' }}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						margin: '10px 80px',
					}}
				>
					<p style={{ ...styles.sectionHeader, marginLeft: 0, marginTop: 10 }}>
						Homepage Editor
					</p>
				</div>

				<div style={{ margin: '10px 80px' }}>
					<GCAccordion expanded={true} header={'Topics'}>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								width: '100%',
							}}
						>
							<ReactTable
								data={editorTableData.topics}
								columns={topicColumns}
								pageSize={10}
								style={{ width: '100%' }}
								getTheadTrProps={() => {
									return {
										style: {
											height: 'fit-content',
											textAlign: 'left',
											fontWeight: 'bold',
										},
									};
								}}
								getTheadThProps={() => {
									return { style: { fontSize: 15, fontWeight: 'bold' } };
								}}
							/>
							<div style={{ display: 'flex' }}>
								<GCButton
									id={'addTopic'}
									onClick={() => {
										setSection('topics');
										setShowAddEditorTermDialog(true);
									}}
									style={{ width: 200, margin: '10px' }}
								>
									Add Term
								</GCButton>
								<GCButton
									id={'saveTopic'}
									onClick={() => {
										saveHomepageEditor('topics');
										setShowSavedSnackbar(true);
									}}
									style={{ width: 200, margin: '10px' }}
								>
									Save
								</GCButton>
							</div>
						</div>
					</GCAccordion>
					<GCAccordion expanded={true} header={'Popular Publications'}>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								width: '100%',
							}}
						>
							<ReactTable
								data={editorTableData.popular_docs}
								columns={popPubColumns}
								pageSize={10}
								style={{ width: '100%' }}
								getTheadTrProps={() => {
									return {
										style: {
											height: 'fit-content',
											textAlign: 'left',
											fontWeight: 'bold',
										},
									};
								}}
								getTheadThProps={() => {
									return { style: { fontSize: 15, fontWeight: 'bold' } };
								}}
							/>
							<div style={{ display: 'flex' }}>
								<GCButton
									id={'saveMajorPub'}
									onClick={() => {
										saveHomepageEditor('popular_docs_inactive');
										setShowSavedSnackbar(true);
									}}
									style={{ width: 200, margin: '10px' }}
								>
									Save
								</GCButton>
							</div>
						</div>
					</GCAccordion>
				</div>
			</div>
			<AddEditorTermDialog
				showAddEditorTermDialog={showAddEditorTermDialog}
				setShowAddEditorTermDialog={setShowAddEditorTermDialog}
				handleAddRow={handleAddRow}
				section={section}
			/>
			<Snackbar
				style={{ marginTop: 20 }}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				open={showSavedSnackbar}
				autoHideDuration={3000}
				onClose={() => setShowSavedSnackbar(false)}
				message={`Saved`}
			/>
		</>
	);
};
