import styled from 'styled-components';

const TableRow = styled.div`
	text-align: center;
`;

const StatusCircle = styled.div`
	height: 25px;
	width: 25px;
	border-radius: 50%;
	display: inline-block;
	float: right;
	padding: 15px;
`;

const BorderDiv = styled.div`
	border: 2px solid grey;
	border-radius: 8px;
`;

export { TableRow, StatusCircle, BorderDiv };
