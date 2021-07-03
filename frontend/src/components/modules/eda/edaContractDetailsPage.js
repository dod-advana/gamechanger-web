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
import {makeStyles, withStyles} from "@material-ui/core/styles";

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

const DetailPaper = withStyles((theme) => ({
    root: {
        borderTopRadius: 5
    }
})) ((props) => <Paper {...props} />);

const EDAContractDetailsPage = (props) => {

    const {
        awardID,
        cloneData
    } = props;

    const [contractAwardData, setContractAwardData] = useState(null);
    const [awardLoading, setAwardLoading] = useState(false);

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
            setTimeFound(((t1 - t0) / 1000).toFixed(2))
            setContractModData(contractMods?.data?.docs);
        }

        try {
            getContractAwardData();
            getContractModData();
        } catch(err) {
            console.log(err);
        }
    }, [awardID, cloneData]);

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
                <DetailPaper>
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
                </DetailPaper>
            </div>
            <div className={'graph-top-docs'}>
                <div className={'section'}>
                    <GCAccordion expanded={true} header={'TIMELINE VIEW'} backgroundColor={'rgb(238, 241, 242'}>
                        line graph goes here
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
