import React, { useEffect, useState } from 'react';
import JBookAPI from '../../api/jbook-service-api';
import './jbook.css';
import { Link } from 'react-router-dom';
import { Typography } from '@material-ui/core';

const jbookAPI = new JBookAPI();

const QueryExp = (props) => {
	const { searchText } = props;
	const [listItems, setlistItems] = useState([]);

	useEffect(() => {

		const fetchData = async () => {
			const { data } = await jbookAPI.queryExp(searchText);
			if (data['qexp']) {
				const qexp = data['qexp'];
				const values = Object.values(qexp).flat();
				const clean_values = values.map(values => values.replaceAll('"', ''));
				const tempList = clean_values.map((clean_values) => <Link
					style={{ margin: '0px 6px', textDecoration: 'underline' }}
					to={`jbook/checklist?q=${clean_values}`}> {clean_values} </Link>);
				setlistItems(tempList);
			} else {
				setlistItems([]);
			}
		}
		fetchData();

	}, [searchText]);

	return (
		<>
			{listItems && listItems.length > 0 &&
				<div className="additionalTerms" style={{ display: 'flex', margin: '15px 0 0' }}>
					<Typography style={{ fontSize: '22px', fontWeight: 500, color: 'rgb(19, 30, 67)', minWidth: '180px', fontFamily: 'Montserrat' }}>Related Terms</Typography>
					<div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
						{listItems}
					</div>
				</div>
			}
		</>
	);
}


export default QueryExp;
