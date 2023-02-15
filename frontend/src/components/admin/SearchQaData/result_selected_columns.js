import 'react-table/react-table.css';
import { TableRow } from '../util/GCAdminStyles';

const RESULT_SELECTED_COLUMNS = [
	{
		Header: 'Source',
		accessor: 'source',
		Cell: (row) => <TableRow>{row.value && row.value !== null ? row.value : 'no source'}</TableRow>,
	},
	{
		Header: 'Documents Tested',
		accessor: 'number_of_documents_tested',
		Cell: (row) => <TableRow>{row.value && row.value !== null ? row.value : 0}</TableRow>,
	},
	{
		Header: 'Documents Missed',
		accessor: 'number_of_documents_not_found',
		Cell: (row) => <TableRow>{row.value && row.value !== null ? row.value : 0}</TableRow>,
	},
	{
		Header: 'Documents Found',
		accessor: 'number_of_documents_found',
		Cell: (row) => <TableRow>{row.value && row.value !== null ? row.value : 0}</TableRow>,
	},
	{
		Header: 'Average Position of Found Documents',
		accessor: 'average_position',
		Cell: (row) => <TableRow>{row.value && row.value !== null ? row.value : 0}</TableRow>,
	},
];

export default RESULT_SELECTED_COLUMNS;
