import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GameChangerAPI from '../api/gameChanger-service-api';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import { gcOrange } from '../common/gc-colors';
import StatPill from './StatPill';

const gameChangerAPI = new GameChangerAPI();

export default function IngestStats() {

	const [ingestData, setIngestData] = useState({});

	useEffect(() => {
		gameChangerAPI.getDocIngestionStats().then(res => {
			setIngestData(res.data);
		});
	}, []);

	const getDomain = () => {
		let highest = 0;
		if(ingestData.docsByMonth){
			ingestData.docsByMonth.forEach(data => {
				if(data.count > highest) {
					highest = data.count;
				};
			});
			const tens = String(highest).length - 1;
			const domain = Math.ceil(highest/(Math.pow(10, tens))) * Math.pow(10, tens);
			return domain;
		}
		return 10000;
	};

	return (
		<div style={{marginLeft: 20, width: '25%'}}>
			<div style={{background: '#F7F7F7', padding: 20, marginBottom: 20, minHeight: 300 }}>
				<div style={{font: 'normal normal 600 14px Noto Sans', color: '#666666', marginBottom: 10}}>DOCUMENTS INGESTED BY MONTH</div>
				<div style={{height: 250}}>
					<ResponsiveContainer width='100%' height='100%'>
						{Object.keys(ingestData).length ?
							<BarChart
								data={ingestData.docsByMonth}
								margin={{
									top: 15,
									right: 30,
									left: 20,
									bottom: 5,
								}}
							>
								<XAxis dataKey='month' />
								<YAxis allowDataOverflow={true} type="number" domain={[0, getDomain()]} width={35}/>
								<Tooltip />
								<Bar dataKey="count" fill={gcOrange} />
							</BarChart>
							:
							<LoadingIndicator customColor={gcOrange} />
						}
					</ResponsiveContainer>
				</div>
			</div>
			<div>
				<div style={{marginBottom: 10, font: 'normal normal 600 14px Noto Sans'}}>DOCUMENTS ANALYTICS</div>
				<StatPill stat={Number(ingestData.numberOfDocuments).toLocaleString()} descriptor={'NUMBER OF DOCUMENTS INGESTED'}/>
				<StatPill stat={ingestData.numberOfSources} descriptor={'NUMBER OF DOCUMENT SOURCES'}/>
			</div>		
		</div>
	);
}