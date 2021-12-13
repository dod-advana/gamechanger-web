import React, { useEffect, useState } from 'react';
import GameChangerAPI from '../api/gameChanger-service-api';
import { gcColors } from '../../containers/GameChangerPage';
import {Paper} from '@material-ui/core';
import SimpleTable from '../common/SimpleTable';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import GCAccordion from '../common/GCAccordion';
import { Card } from '../cards/GCCard';
import { MainContainer } from '../../containers/GameChangerDetailsPage';
import Pagination from 'react-js-pagination';
import { numberWithCommas, invertedCrawlerMappingFunc } from '../../utils/gamechangerUtils';

const gameChangerAPI = new GameChangerAPI();

const colWidth = {
	maxWidth: '900px',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
};

const getSourceData = async (source, cloneName, page) => {
	const { data } = await gameChangerAPI.callSearchFunction({
		functionName: 'getDocumentsBySourceFromESHelper',
		cloneName,
		options: {
			searchText: invertedCrawlerMappingFunc(source),
			offset: (page - 1) * 18,
		},
	});

	return data;
};

const SourceDetailsPage = ({ source, cloneData, initialSourceData, userData, rawSearchResults }) => {
	const upperSource = source
		.split(' ')
		.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
		.join(' ');
	const [runningQuery, setRunningQuery] = useState(false);
	const [docs, setDocs] = useState(initialSourceData.docs);
	const [page, setPage] = useState(1);

	useEffect(() => {
		setRunningQuery(true);
		getSourceData(source, cloneData.clone_name, page).then((data) => {
			setDocs(data.docs);
			setRunningQuery(false);
		});
	}, [page, cloneData.clone_name, source]);

	const renderDocs = () => {
		return docs.map((item, idx) => {
			return (
				<Card
					key={idx}
					item={item}
					idx={idx}
					state={{
						cloneData,
						selectedDocuments: new Map(),
						componentStepNumbers: {},
						listView: true,
						showSideFilters: false,
						userData,
						rawSearchResults
					}}
					dispatch={() => {}}
				/>
			);
		});
	};

	return (
		<div>
			<p style={{ margin: '10px 4%', fontSize: 18 }}>
				Welcome to our new (Beta version) Source Details page! As you look
				around, you may note some technical issues below; please bear with us
				while we continue making improvements here and check back often for a
				more stable version.
			</p>
			<MainContainer>
				<div className={'details'}>
					<Paper>
						<div className={'name'}>{upperSource}</div>

						<div className={'details-header'}>
							<span>{'SOURCE DETAILS'}</span>
						</div>

						<div className={'details-table'}>
							<div>
								{source ? (
									<>
										<SimpleTable
											tableClass={'magellan-table'}
											zoom={1}
											headerExtraStyle={{
												backgroundColor: '#313541',
												color: 'white',
											}}
											rows={
												[
													{
														key: 'Total Documents',
														value: initialSourceData.totalCount,
													},
												] || []
											}
											height={'auto'}
											dontScroll={true}
											colWidth={colWidth}
											disableWrap={true}
											title={'Metadata'}
											hideHeader={true}
										/>
									</>
								) : (
									<div style={{ margin: '0 auto' }}>
										<LoadingIndicator customColor={gcColors.buttonColor2} />
									</div>
								)}
							</div>
						</div>
					</Paper>
				</div>
				<div className={'graph-top-docs'}>
					<div className={'section'}>
						<GCAccordion
							expanded={true}
							header={'DOCUMENTS FROM SOURCE'}
							backgroundColor={'rgb(238,241,242)'}
						>
							<div style={{ width: '100%' }}>
								<div
									style={{ display: 'flex', justifyContent: 'space-between' }}
								>
									<div style={styles.resultsCount}>
										{initialSourceData.totalCount > 0
											? `${numberWithCommas(
												initialSourceData.totalCount
											  )} results found in ${
												initialSourceData.timeFound
											  } seconds`
											: ''}
									</div>
									<div
										style={{ marginTop: '-14px', display: 'flex' }}
										className={'gcPagination'}
									>
										<Pagination
											activePage={page}
											itemsCountPerPage={10}
											totalItemsCount={initialSourceData.totalCount}
											pageRangeDisplayed={8}
											onChange={(page) => setPage(page)}
										/>
									</div>
								</div>
								{runningQuery ? (
									<div style={{ margin: '0 auto' }}>
										<LoadingIndicator customColor={gcColors.buttonColor2} />
									</div>
								) : (
									renderDocs()
								)}
							</div>
						</GCAccordion>
					</div>
				</div>
			</MainContainer>
		</div>
	);
};

const styles = {
	resultsCount: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#131E43',
		paddingTop: '10px',
	},
};

export default SourceDetailsPage;
