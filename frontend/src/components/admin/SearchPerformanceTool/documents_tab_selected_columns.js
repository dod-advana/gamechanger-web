import 'react-table/react-table.css';
import { TableRow } from '../util/GCAdminStyles';

const RESULT_SELECTED_COLUMNS = [
	{
		Header: 'Document',
		accessor: 'document',
		Cell: (row) => (
			<TableRow style={{ overflowX: 'scroll', overflowY: 'hidden' }}>
				{row.value && row.value !== null ? row.value : 'no doc'}
			</TableRow>
		),
	},
	{
		Header: 'Title',
		accessor: 'title',
		Cell: (row) => (
			<TableRow style={{ textAlign: 'center', overflowY: 'hidden' }}>
				{row.value && row.value !== null ? row.value : 'Not Found'}
			</TableRow>
		),
	},
	{
		Header: 'Doc Number',
		accessor: 'doc_num',
		Cell: (row) => (
			<TableRow style={{ textAlign: 'center', overflowY: 'hidden' }}>
				{row.value && row.value !== null ? row.value : 'Not Found'}
			</TableRow>
		),
	},
	{
		Header: 'Filename',
		accessor: 'filename',
		Cell: (row) => (
			<TableRow style={{ textAlign: 'center', overflowY: 'hidden' }}>
				{row.value && row.value !== null ? row.value : 'Not Found'}
			</TableRow>
		),
	},
	{
		Header: 'Display Title S',
		accessor: 'display_title_s',
		Cell: (row) => (
			<TableRow style={{ textAlign: 'center', overflowY: 'hidden' }}>
				{row.value && row.value !== null ? row.value : 'Not Found'}
			</TableRow>
		),
	},
];

export default RESULT_SELECTED_COLUMNS;
