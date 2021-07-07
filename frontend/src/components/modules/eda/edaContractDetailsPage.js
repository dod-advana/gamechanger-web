import React, {useEffect, useState} from 'react';
import {MainContainer} from "../../../containers/GameChangerDetailsPage";
import Paper from "material-ui/Paper/Paper";
import GCAccordion from "../../common/GCAccordion";
import SimpleTable from "../../common/SimpleTable";
import GameChangerAPI from "../../api/gameChanger-service-api";
import {
    EDA_FIELD_JSON_MAP,
    EDA_FIELDS
} from "./edaCardHandler";
import LoadingIndicator from "advana-platform-ui/dist/loading/LoadingIndicator";
import {gcOrange} from "../../common/gc-colors";
import {Card} from "../../cards/GCCard";
import {numberWithCommas} from "../../../gamechangerUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


import {
	getEDAMetadataForPropertyTable,
} from "./edaUtils";

const gameChangerAPI = new GameChangerAPI();

const styles = {
	resultsCount: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#131E43',
		paddingTop: '10px',
        margin: '0 0 10px 0'
	}
}

const CustomTooltip = ({ active, payload, label }) => {
    console.log(payload);
    console.log(label);
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label} : ${payload}`}</p>
          <p className="desc">Anything you want can be displayed here.</p>
        </div>
      );
}

const EDAContractDetailsPage = (props) => {

    const {
        awardID,
        cloneData
    } = props;

    // left column metadata
    const [contractAwardData, setContractAwardData] = useState(null);
    const [awardLoading, setAwardLoading] = useState(false);

    // timeline view data
    const [timelineViewData, setTimelineViewData] = useState(null);

    // contract mod data
    const [contractModData, setContractModData] = useState(null);
    const [modLoading, setModLoading] = useState(false);
    const [timeFound, setTimeFound] = useState(null);

    useEffect(() => {
        if (!awardID || !cloneData || !cloneData.clone_name) return;
        
        async function getContractAwardData() {
            setAwardLoading(true);
            const contractAward = await gameChangerAPI.callSearchFunction({
                functionName: 'queryBaseAwardContract',
                cloneName: cloneData.clone_name,
                options: {
                    awardID
                }
            });
            setAwardLoading(false);
            setContractAwardData(contractAward.data);
        }

        async function getContractModData() {
            setModLoading(true);
            const t0 = new Date().getTime();
            const contractMods = await gameChangerAPI.callSearchFunction({
                functionName: 'queryContractMods',
                cloneName: cloneData.clone_name,
                options: {
                    awardID,
                    isSearch: true
                }
            });
            const t1 = new Date().getTime();
            setModLoading(false);
            setTimeFound(((t1 - t0) / 1000).toFixed(2));
            const contractModData = contractMods?.data?.docs;

            // for the contract modifications section
            contractModData.sort((first, second) => {

                if (first.modification_eda_ext && first.modification_eda_ext === 'Award') {
                    return -1;
                }
                if (second.modification_eda_ext && second.modification_eda_ext === 'Award') {
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
                }
                else {
                    return 1;
                }
            });
            setContractModData(contractModData);

            // data points on the timeline view section
            let timelineData = contractModData.map(doc => {
                let date = doc.signature_date_eda_ext;
                if (!date) {
                    if (doc.effective_date_eda_ext) {
                        date = doc.effective_date_eda_ext;
                    }
                    else {
                        date = "";
                    }
                }

                const modData = {
                    "Mod Number": doc.modification_eda_ext,
                    "Obligated Amount": doc.obligated_amounts_eda_ext ?? "",
                    "Date": date
                };
                return modData;
            });

            timelineData = timelineData.filter(doc => doc["Date"] !== "" && doc["Obligated Amount"] !== "");
            setTimelineViewData(timelineData);
        }

        try {
            getContractAwardData();
            getContractModData();
        } catch(err) {
            console.log(err);
        }
    }, [awardID, cloneData]);

    const renderTimeline = () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%'}}>
                <p style={{ width: '100%' }}>Contract Obligated Amount over Time</p>
                <div style={{ width: "100%", height: 500 }}>
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
                            <YAxis dataKey="Obligated Amount"/>
                            <Tooltip /> 
                            <Legend />
                            <Line type="monotone" dataKey="Obligated Amount" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p style={{ width: '100%' }}>*contract mods with missing data have been removed</p>
            </div>
        );
    }

    const renderContractMods = () => {
        return contractModData.map((item, idx) => {
            return (
                <Card key={idx}
                    item={item}
                    idx={idx}
                    state={{cloneData, selectedDocuments: new Map(), componentStepNumbers: {}, listView: true, showSideFilters: false}}
                    dispatch={() => {}}
                    detailPage={true}
                />
            )
        })
    }

    return (
        <MainContainer>
            <div className={'details'} style={{borderTopLeftRadius: 5, borderTopRightRadius: 5}}>
                <Paper>
                    <div className={'details-header'} style={{ margin: '0' }}>
                        <span>{'BASE AWARD METADATA'}</span>
                    </div>
                    <div className={'details-table'} style={{ margin: '0' }}>
                        <div>
                            {contractAwardData && !awardLoading &&
                                <SimpleTable tableClass={'magellan-table'}
                                    zoom={1}
                                    headerExtraStyle={{
                                        backgroundColor: '#313541',
                                        color: 'white'
                                    }}
                                    rows={getEDAMetadataForPropertyTable(EDA_FIELD_JSON_MAP, EDA_FIELDS, contractAwardData)}
                                    height={'auto'}
                                    dontScroll={true}
                                    disableWrap={true}
                                    title={'Metadata'}
                                    hideHeader={true}
                                />  
                            }
                            {awardLoading && <LoadingIndicator customColor={gcOrange} />}
                        </div>
                    </div>
                </Paper>
            </div>
            <div className={'graph-top-docs'}>
                <div className={'section'}>
                    <GCAccordion expanded={true} header={'TIMELINE VIEW'} backgroundColor={'rgb(238, 241, 242'}>
                        {timelineViewData && renderTimeline()}
                    </GCAccordion>
                </div>
                <div className={'section'}>
                    <GCAccordion expanded={true} header={'CONTRACT MODIFICATIONS'} itemCount={contractModData ? contractModData.length : 0} backgroundColor={'rgb(238,241,242)'}>
                        <div style={{ width: '100%'}}>
                            <div className="row" style={{margin: 'auto 0'}}>
                                <div style={styles.resultsCount}>
                                    {modLoading ? 'Searching for documents...' :
                                    !modLoading && contractModData && `${numberWithCommas(contractModData.length)} results found in ${timeFound} seconds`}
                                </div>
                                {contractModData && contractModData.length && !modLoading &&
                                    renderContractMods()
                                }
                                {!modLoading && (!contractModData || contractModData.length === 0) && <div style={{fontSize: 22, fontWeight: 'bold', color: '#131E43'}}>No Documents Found</div>}
                            </div>
                        </div>

                    </GCAccordion>
                </div>
            </div>
        </MainContainer>
    )
}

export default EDAContractDetailsPage;
