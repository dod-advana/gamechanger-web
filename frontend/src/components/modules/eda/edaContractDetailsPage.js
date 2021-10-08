import React, { useEffect, useState } from 'react';
import { MainContainer } from '../../../containers/GameChangerDetailsPage';
import {Paper} from '@material-ui/core';
import GCAccordion from '../../common/GCAccordion';
import SimpleTable from '../../common/SimpleTable';
import GameChangerAPI from '../../api/gameChanger-service-api';
import { EDA_FIELD_JSON_MAP, EDA_FIELDS } from './edaCardHandler';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { gcOrange } from '../../common/gc-colors';
import { Card } from '../../cards/GCCard';
import { numberWithCommas } from '../../../utils/gamechangerUtils';
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';

import { getEDAMetadataForPropertyTable } from './edaUtils';

const gameChangerAPI = new GameChangerAPI();

const styles = {
	resultsCount: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#131E43',
		paddingTop: '10px',
		margin: '0 0 10px 0',
	},
};

const EDAContractDetailsPage = (props) => {
	const { awardID, cloneData } = props;

	// left column metadata
	const [contractAwardData, setContractAwardData] = useState(null);
	const [awardLoading, setAwardLoading] = useState(false);

	// timeline view data
	const [timelineViewData, setTimelineViewData] = useState(null);

	// bar graph data
	const [barGraphData, setBarGraphData] = useState(null);

	// contract mod data
	const [contractModData, setContractModData] = useState(null);
	const [modLoading, setModLoading] = useState(false);
	const [timeFound, setTimeFound] = useState(null);

	// similar docs data
	const [similarDocsData, setSimilarDocsData] = useState(null);
	const [similarDocsLoading, setSimilarDocsLoading] = useState(false);
	const [timeFoundSimilar, setTimeFoundSimilar] = useState(null);

	useEffect(() => {
		if (!awardID || !cloneData || !cloneData.clone_name) return;

		async function getContractAwardAndSimilarDocsData() {
			setAwardLoading(true);
			setSimilarDocsLoading(true);
			const contractAward = await gameChangerAPI.callSearchFunction({
				functionName: 'queryBaseAwardContract',
				cloneName: cloneData.clone_name,
				options: {
					awardID,
				},
			});
			setAwardLoading(false);
			await setContractAwardData(contractAward.data);

			const t0 = new Date().getTime();

			if (contractAward.data.contract_issue_dodaac_eda_ext) {
				const similarDocs = await gameChangerAPI.callSearchFunction({
					functionName: 'querySimilarDocs',
					cloneName: cloneData.clone_name,
					options: {
						issueOfficeDoDAAC: contractAward.data.contract_issue_dodaac_eda_ext,
						issueOfficeName: contractAward.data.contract_issue_name_eda_ext,
					},
				});
				setSimilarDocsData(similarDocs.data);
			}

			const t1 = new Date().getTime();

			setTimeFoundSimilar(((t1 - t0) / 1000).toFixed(2));
			setSimilarDocsLoading(false);
		}

		async function getContractModData() {
			setModLoading(true);
			const t0 = new Date().getTime();
			const contractMods = await gameChangerAPI.callSearchFunction({
				functionName: 'queryContractMods',
				cloneName: cloneData.clone_name,
				options: {
					awardID,
					isSearch: true,
				},
			});
			const t1 = new Date().getTime();
			setModLoading(false);
			setTimeFound(((t1 - t0) / 1000).toFixed(2));
			const contractModData = contractMods?.data;

			if (contractModData) {
				// for the contract modifications section
				contractModData.docs.sort((first, second) => {
					if (
						first.modification_eda_ext &&
						first.modification_eda_ext === 'Award'
					) {
						return -1;
					}
					if (
						second.modification_eda_ext &&
						second.modification_eda_ext === 'Award'
					) {
						return 1;
					}
					if (!first.modification_eda_ext) {
						return -1;
					}
					if (!second.modification_eda_ext) {
						return 1;
					}
					if (first.modification_eda_ext < second.modification_eda_ext) {
						return -1;
					} else {
						return 1;
					}
				});

				setContractModData(contractModData);

				let barGraphData = contractModData.docs.map((doc) => {
					const modData = {
						'Mod Number': doc.modification_eda_ext,
						'Obligated Amount': doc.obligated_amounts_eda_ext
							? Math.ceil(doc.obligated_amounts_eda_ext * 100) / 100
							: '',
					};

					return modData;
				});
				barGraphData = barGraphData.filter(
					(doc) => doc['Obligated Amount'] !== ''
				);
				setBarGraphData(barGraphData);

				let currentAmount = 0;
				// data points on the timeline view section
				let timelineData = contractModData.docs.map((doc) => {
					let date = doc.signature_date_eda_ext;
					if (!date) {
						if (doc.effective_date_eda_ext) {
							date = doc.effective_date_eda_ext;
						} else {
							date = '';
						}
					}

					let amount = doc.obligated_amounts_eda_ext ?? null;

					currentAmount += amount;

					const modData = {
						'Mod Number': doc.modification_eda_ext ?? '',
						'Obligated Amount': amount
							? Math.ceil(currentAmount * 100) / 100
							: '',
						Date: date,
					};
					return modData;
				});

				timelineData = timelineData.filter(
					(doc) =>
						doc['Date'] !== '' &&
						doc['Obligated Amount'] !== '' &&
						doc['Mod Number'] !== ''
				);
				setTimelineViewData(timelineData);
			} else {
				setContractModData(null);
				setBarGraphData(null);
				setTimelineViewData(null);
			}
		}

		try {
			getContractAwardAndSimilarDocsData();
			getContractModData();
		} catch (err) {
			console.log(err);
		}
	}, [awardID, cloneData]);

	const renderBarGraph = () => {
		return (
			<div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
				<p style={{ width: '100%' }}>
					Contract Obligated Amount per Contract Mod
				</p>
				<div style={{ width: '100%', height: 500 }}>
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							width={500}
							height={300}
							data={barGraphData}
							margin={{
								top: 5,
								right: 30,
								left: 20,
								bottom: 5,
							}}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="Mod Number" />
							<YAxis />
							<Tooltip />
							<Legend />
							<Bar
								dataKey="Obligated Amount"
								fill="rgb(0, 131, 143)"
								barSize={30}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
				<p style={{ width: '100%' }}></p>
			</div>
		);
	};

	const renderTimeline = () => {
		return (
			<div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
				<p style={{ width: '100%' }}>Contract Obligated Amount over Time</p>
				<div style={{ width: '100%', height: 500 }}>
					<ResponsiveContainer width="100%" height="100%">
						<LineChart
							width={500}
							height={300}
							data={timelineViewData}
							margin={{
								top: 5,
								right: 30,
								left: 20,
								bottom: 5,
							}}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="Signature Date" />
							<YAxis />
							<Tooltip />
							<Legend />
							<Line
								type="monotone"
								dataKey="Obligated Amount"
								stroke="rgb(0, 131, 143)"
								activeDot={{ r: 8 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
				<p style={{ width: '100%' }}></p>
			</div>
		);
	};

	const renderContractMods = () => {
		return contractModData.docs.map((item, idx) => {
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
					}}
					dispatch={() => {}}
					detailPage={true}
				/>
			);
		});
	};

	const renderSimilarDocs = () => {
		return similarDocsData.docs.map((item, idx) => {
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
					}}
					dispatch={() => {}}
					detailPage={true}
				/>
			);
		});
	};

	return (
		<MainContainer>
			<div
				className={'details'}
				style={{ borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
			>
				<Paper>
					<div className={'details-header'} style={{ margin: '0' }}>
						<span>{'BASE AWARD METADATA'}</span>
					</div>
					<div className={'details-table'} style={{ margin: '0' }}>
						<div>
							{contractAwardData && !awardLoading && (
								<SimpleTable
									tableClass={'magellan-table'}
									zoom={1}
									headerExtraStyle={{
										backgroundColor: '#313541',
										color: 'white',
									}}
									rows={getEDAMetadataForPropertyTable(
										EDA_FIELD_JSON_MAP,
										EDA_FIELDS,
										contractAwardData
									)}
									height={'auto'}
									dontScroll={true}
									disableWrap={true}
									title={'Metadata'}
									hideHeader={true}
								/>
							)}
							{awardLoading && <LoadingIndicator customColor={gcOrange} />}
						</div>
					</div>
				</Paper>
			</div>
			<div className={'graph-top-docs'}>
				<div className={'section'}>
					<GCAccordion
						expanded={false}
						header={'CONTRACT AMOUNT OVER TIME'}
						backgroundColor={'rgb(238, 241, 242)'}
					>
						{timelineViewData && timelineViewData.length > 0
							? renderTimeline()
							: modLoading
								? 'Searching for data...'
								: 'Data Not Available'}
					</GCAccordion>
				</div>
				<div className={'section'}>
					<GCAccordion
						expanded={true}
						header={'CONTRACT MOD AMOUNTS'}
						backgroundColor={'rgb(238, 241, 242)'}
					>
						{barGraphData && barGraphData.length > 0
							? renderBarGraph()
							: modLoading
								? 'Searching for data...'
								: 'Data Not Available'}
					</GCAccordion>
				</div>
				<div className={'section'}>
					<GCAccordion
						expanded={false}
						header={'SIMILAR DOCUMENTS'}
						backgroundColor={'rgb(238, 241, 242)'}
					>
						<div style={{ width: '100%' }}>
							<div className="row" style={{ margin: 'auto 0' }}>
								<div style={styles.resultsCount}>
									{similarDocsLoading
										? 'Searching for documents...'
										: !similarDocsLoading &&
										  similarDocsData &&
										  similarDocsData.docs &&
										  similarDocsData.docs.length
											? `${numberWithCommas(
												similarDocsData.totalCount
										  )} results found in ${timeFoundSimilar} seconds`
											: ''}
								</div>
								{similarDocsData &&
								similarDocsData.docs &&
								similarDocsData.docs.length &&
								!similarDocsLoading
									? renderSimilarDocs()
									: ''}
								{!similarDocsLoading &&
									(!similarDocsData ||
										!similarDocsData.docs ||
										similarDocsData.docs.length === 0) && (
									<div
										style={{
											fontSize: 22,
											fontWeight: 'bold',
											color: '#131E43',
										}}
									>
											No Documents Found
									</div>
								)}
							</div>
						</div>
					</GCAccordion>
				</div>
				<div className={'section'}>
					<GCAccordion
						expanded={true}
						header={'CONTRACT MODIFICATIONS'}
						itemCount={
							contractModData && contractModData.docs
								? contractModData.docs.length
								: 0
						}
						backgroundColor={'rgb(238,241,242)'}
					>
						<div style={{ width: '100%' }}>
							<div className="row" style={{ margin: 'auto 0' }}>
								<div style={styles.resultsCount}>
									{modLoading
										? 'Searching for documents...'
										: !modLoading &&
										  contractModData &&
										  contractModData.docs &&
										  contractModData.docs.length
											? `${numberWithCommas(
												contractModData.totalCount
										  )} results found in ${timeFound} seconds`
											: ''}
								</div>
								{contractModData &&
								contractModData.docs &&
								contractModData.docs.length &&
								!modLoading
									? renderContractMods()
									: ''}
								{!modLoading &&
									(!contractModData ||
										!contractModData.docs ||
										contractModData.docs.length === 0) && (
									<div
										style={{
											fontSize: 22,
											fontWeight: 'bold',
											color: '#131E43',
										}}
									>
											No Documents Found
									</div>
								)}
							</div>
						</div>
					</GCAccordion>
				</div>
			</div>
		</MainContainer>
	);
};

export default EDAContractDetailsPage;
