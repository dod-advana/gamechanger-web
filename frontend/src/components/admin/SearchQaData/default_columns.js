import 'react-table/react-table.css';
import { TableRow } from '../util/GCAdminStyles';
import moment from 'moment';

const DEFAULT_COLUMNS = [
	{
		Header: 'Test ID',
		accessor: 'test_id',
		Cell: (row) => (
			<TableRow
				className="test-id"
				style={{
					cursor: 'pointer',
					backgroundColor: 'rgba(223, 230, 238, 0.5)',
					textAlign: 'center',
					borderRadius: '3px',
				}}
			>
				{row.value && row.value !== null ? row.value : 0}
			</TableRow>
		),
	},
	{
		Header: 'GC version',
		accessor: 'gc_version',
		Cell: (row) => <TableRow>{row.value && row.value !== null ? row.value : '00.00'}</TableRow>,
	},
	{
		Header: 'Timestamp',
		accessor: 'timestamp',
		Cell: (row) => (
			<TableRow>
				{row.value && row.value !== null ? moment(row.value).format('MMM Do YY, h:mm:ss a') : 'last friday'}
			</TableRow>
		),
	},
	{
		Header: 'Total Documents Missed',
		accessor: 'total_number_of_documents_not_found',
		Cell: (row) => <TableRow style={{ textAlign: 'center' }}>{row.value}</TableRow>,
	},
	{
		Header: 'Total Average',
		accessor: 'total_average',
		Cell: (row) => <TableRow style={{ textAlign: 'center' }}>{Math.floor(row.value)}</TableRow>,
	},
];

export default DEFAULT_COLUMNS;
