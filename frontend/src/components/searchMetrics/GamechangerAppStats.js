import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import GameChangerAPI from '../api/gameChanger-service-api';

const gameChangerAPI = new GameChangerAPI();

const PageWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 30px;
`;

const Heading = styled.div`
	font-size: 30px;
	margin: 16px;
`;

const ListWrapper = styled.div`
	display: flex;
	flex-direction: column;
	border: 2px solid grey;
	border-radius: 8px;
	width: 100%;
	padding: 20px;
`;

const ListItem = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;

	& > div {
		margin: 8px;
	}
`;

export default () => {
	const styles = {
		pageWrapper: {
			alignItems: 'center',
			textAlign: 'center',
		},
		contentDiv: {
			alignItems: 'center',
		},
	};

	const [data, setData] = useState([]);

	const getAppStats = async () => {
		try {
			const { data = {} } = await gameChangerAPI.getAppStats({
				cloneData: { clone_name: 'gamechanger' },
			});
			setData(data);
		} catch (e) {
			console.error(e);
		}
	};

	const decodeHtml = (html) => {
		var txt = document.createElement('textarea');
		txt.innerHTML = html;
		return txt.value;
	};

	useEffect(() => {
		getAppStats();
	}, []);

	return (
		<PageWrapper style={styles.pageWrapper}>
			<Heading>App Stats</Heading>
			{data.data && (
				<div style={styles.contentDiv}>
					<div>
						<Heading>Days back</Heading>
						<div>{data.daysBack}</div>
					</div>
					<div>
						<Heading>Searches per session</Heading>
						<div>{data.data.avgSearchesPerSession}</div>
					</div>
					{/* <div>
					<Heading>Top 10 Searches</Heading>
					<div>{JSON.stringify(data.data.topSearches.data)}</div>
				</div> */}
					<div>
						<Heading>Top 10 Searches</Heading>
						<ListWrapper>
							<ListItem key="header">
								<div>Search</div>
								<div style={{ marginLeft: '50px' }}>Count</div>
							</ListItem>
							{data.data.topSearches.data.map(({ search, count }) => {
								return (
									<ListItem key={search}>
										<div>{decodeHtml(search)}</div>
										<div>{count}</div>
									</ListItem>
								);
							})}
						</ListWrapper>
					</div>
				</div>
			)}
		</PageWrapper>
	);
};
