import React from "react";
import GCAccordion from "../../common/GCAccordion";
import SimpleTable from "../../common/SimpleTable";
import {
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
} from "@material-ui/core";
import {setState} from "../../../sharedFunctions";
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import LoadingIndicator from "advana-platform-ui/dist/loading/LoadingIndicator";
import {gcOrange} from "../../common/gc-colors";
import GCButton from "../../common/GCButton";


const _ = require('lodash');

const styles = {
    titleText: {
		fontWeight: 900,
		fontSize: '14px',
        marginBottom: 5
	},
	filterBox: {
		backgroundColor: '#ffffff',
		borderRadius: '5px',
		padding: '2px',
		border: '2px solid #bdccde',
		pointerEvents: 'none',
		marginLeft: '5px',
		marginRight: '5px'
	},
    filterDiv: {
        display: 'inline-block'
    },
	filterTitle: {
        display: 'inline-block',
        fontSize: 14,
        fontWeight: 600
	},
    filterInput: {
        padding: '0px 25px'
    },
    dialog: {
    },
    dialogContent: {
        width: 1000,
        height: 600,
        padding: '30px 30px'
    },
    detailDiv: {
        margin: '5px auto'
    },
    pill: {
        fontSize: 11,
        fontWeight: 600,
        border: 'none',
        height: 25,
        borderRadius: 15,
        backgroundColor: 'rgba(223, 230, 238, 0.5)',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        display: 'inline-block',
        padding: '0 15px',
        margin: '0 0 0 15px'
    },
    tableHeaderRow: {
        backgroundColor: '#131E43',
        color: 'white'
    },
    tableColumn: {
        textAlign: 'left',
        margin: '4px 0'
    },
    container: {
        padding: 15,
    },
    orgs: {
        margin: '0 0 0 25px'
    }
}

export const EDASidePanel = (props) => {
    const {
        dispatch,
        edaSearchSettings,
        issuingOrgs,
        statsLoading,
        totalObligatedAmount
    } = props;

    const setEDASearchSetting = (field, value) => {
		const edaSettings = _.cloneDeep(edaSearchSettings);

        switch(field) {
            case 'allOrgs':
                edaSettings.allOrgsSelected = true;
                break;
            case 'specOrgs':
                edaSettings.allOrgsSelected = false;
                break;
            case 'aggregations':
                edaSettings.aggregations[value] = !edaSettings.aggregations[value];
                break;
            case 'issueDateRangeStart':
                edaSettings.startDate = value;
                break;
            case 'issueDateRangeEnd':
                edaSettings.endDate = value;
                break;
            case 'contractIssueAgency':
                edaSettings.issueAgency = value;
                break;
            case 'organizations':
                edaSettings.organizations[value] = !edaSettings.organizations[value];
                break;
            default:
                break;
        }

		setState(dispatch, { edaSearchSettings: edaSettings });
    }

    // const getContractData = () => {
    //     const agencyContracts = {};

    //     for (const result of searchResults) {
    //         const agency = result.contract_issue_name_eda_ext;

    //         if (agency) {
    //             if (agencyContracts[agency]) {
    //                 agencyContracts[agency] += 1;
    //             }
    //             else {
    //                 agencyContracts[agency] = 1;
    //             }
    //         }
    //     }

    //     const data = Object.keys(agencyContracts).map(agency => ({ "Key": agency, "Value": agencyContracts[agency]}));
    //     data.push({"Key": "Total Amount $", "Value": "Data Not Available"});
    //     data.sort((a, b) => (a.Value > b.Value) ? -1 : 1 )
    //     return data;
    // }

    const getIssuingOrgData = () => {
        return Object.keys(issuingOrgs).map(org => ({ "Key": org, "Value": issuingOrgs[org] }))
    }

    const getStatsData = () => {
        const issuingOrgData = getIssuingOrgData();
        const totalObligation = [{Key: "Total Obligated Amount", Value: "$" + totalObligatedAmount.toLocaleString()}];

        return issuingOrgData.concat(totalObligation);
    }

    const renderStats = () => {
        return (
            <SimpleTable tableClass={'magellan-table'}
                zoom={1}
                // headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
                rows={getStatsData()}
                height={'auto'}
                dontScroll={true}
                // colWidth={colWidth}
                disableWrap={true}
                // title={'Metadata'}
                hideHeader={true}
            />
        );
    }

    const renderOrganizationFilters = () => {

        return (
            <div style={styles.container}>
                <FormControl>
                    <FormGroup>
                        <FormControlLabel
                            name='All organizations'
                            value='All organizations'
                            control={<Checkbox
                                onClick={() => setEDASearchSetting('allOrgs', '')}
                                icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
                                checked={edaSearchSettings.allOrgsSelected}
                                checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
                                name='All sources'
                                style={styles.filterBox}
                            />}
                            label='All organizations'
                            labelPlacement="end"
                            style={styles.titleText}
                        />
                        <FormControlLabel
                            name='Specific organization(s)'
                            value='Specific organization(s)'
                            control={<Checkbox
                                onClick={() => setEDASearchSetting('specOrgs', '')}
                                icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
                                checked={!edaSearchSettings.allOrgsSelected}
                                checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
                                name='Specific organization(s)'
                                style={styles.filterBox}
                            />}
                            label='Specific organization(s)'
                            labelPlacement="end"
                            style={styles.titleText}
                        />
                    </FormGroup>

                    {!edaSearchSettings.allOrgsSelected && 
                    <FormGroup style={styles.orgs}>
                        <FormControlLabel
                            name='Air Force'
                            value='Air Force'
                            style={styles.titleText}
                            control={<Checkbox
                                style={styles.filterBox}
                                onClick={() => setEDASearchSetting('organizations', 'airForce')}
                                icon={<CheckBoxOutlineBlankIcon style={{visibility:'hidden'}}/>}
                                checked={edaSearchSettings && edaSearchSettings.organizations && edaSearchSettings.organizations.airForce}
                                checkedIcon={<i style={{color:'#E9691D'}}className="fa fa-check"/>}
                                name='Air Force'
                            />}
                            label='Air Force'
                            labelPlacement="end"                        
                        />
                        <FormControlLabel
                            name='Army'
                            value='Army'
                            style={styles.titleText}
                            control={<Checkbox
                                style={styles.filterBox}
                                onClick={() => setEDASearchSetting('organizations', 'army')}
                                icon={<CheckBoxOutlineBlankIcon style={{visibility:'hidden'}}/>}
                                checked={edaSearchSettings && edaSearchSettings.organizations && edaSearchSettings.organizations.army}
                                checkedIcon={<i style={{color:'#E9691D'}}className="fa fa-check"/>}
                                name='Army'
                            />}    
                            label='Army'
                            labelPlacement="end"                    
                        />
                        <FormControlLabel
                            name='DLA'
                            value='DLA'
                            style={styles.titleText}
                            control={<Checkbox
                                style={styles.filterBox}
                                onClick={() => setEDASearchSetting('organizations', 'dla')}
                                icon={<CheckBoxOutlineBlankIcon style={{visibility:'hidden'}}/>}
                                checked={edaSearchSettings && edaSearchSettings.organizations && edaSearchSettings.organizations.dla}
                                checkedIcon={<i style={{color:'#E9691D'}}className="fa fa-check"/>}
                                name='DLA'
                            />}        
                            label='DLA'
                            labelPlacement="end"                
                        />
                        <FormControlLabel
                            name='Marine Corps'
                            value='Marine Corps'
                            style={styles.titleText}
                            control={<Checkbox
                                style={styles.filterBox}
                                onClick={() => setEDASearchSetting('organizations', 'marineCorps')}
                                icon={<CheckBoxOutlineBlankIcon style={{visibility:'hidden'}}/>}
                                checked={edaSearchSettings && edaSearchSettings.organizations && edaSearchSettings.organizations.marineCorps}
                                checkedIcon={<i style={{color:'#E9691D'}} className="fa fa-check"/>}
                                name='Marine Corps'
                            />}  
                            label='Marine Corps'
                            labelPlacement="end"                      
                        />
                        <FormControlLabel
                            name='Navy'
                            value='Navy'
                            style={styles.titleText}
                            control={<Checkbox
                                style={styles.filterBox}
                                onClick={() => setEDASearchSetting('organizations', 'navy')}
                                icon={<CheckBoxOutlineBlankIcon style={{visibility:'hidden'}}/>}
                                checked={edaSearchSettings && edaSearchSettings.organizations && edaSearchSettings.organizations.navy}
                                checkedIcon={<i style={{color:'#E9691D'}} className="fa fa-check"/>}
                                name='Navy'
                            />}     
                            label='Navy'
                            labelPlacement="end"                   
                        />
                        <FormControlLabel
                            name='4th Estate'
                            value='4th Estate'
                            style={styles.titleText}
                            control={<Checkbox
                                style={styles.filterBox}
                                onClick={() => setEDASearchSetting('organizations', 'estate')}
                                icon={<CheckBoxOutlineBlankIcon style={{visibility:'hidden'}}/>}
                                checked={edaSearchSettings && edaSearchSettings.organizations && edaSearchSettings.organizations.estate}
                                checkedIcon={<i style={{color:'#E9691D'}} className="fa fa-check"/>}
                                name='4th Estate'
                            />}     
                            label='4th Estate'
                            labelPlacement="end"                   
                        />
                    </FormGroup>}
                </FormControl>
            </div>
        )
    }

    return (
        <div>
			<div className={'filters-container sidebar-section-title'} style={{ marginBottom: 15 }}>FILTERS</div>
            <GCAccordion contentPadding={0} expanded={false} header={'ISSUE ORGANIZATION'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
                { renderOrganizationFilters() }
            </GCAccordion>

            {/* <GCAccordion contentPadding={0} expanded={false} header={'ISSUE ORGANIZATION'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
                { renderOrganizationFilters() }
            </GCAccordion> */}

            <GCButton style={{width: '100%', marginBottom: '10px', marginLeft: '-1px' }} onClick={() => { setState(dispatch, { runSearch: true })}}>Update Search</GCButton>

			<div className={'filters-container sidebar-section-title'} style={{ marginBottom: 5 }}>STATISTICS</div>
            <GCAccordion contentPadding={0} expanded={false} header={'CONTRACT TOTALS'} headerBackground={'rgb(56,63,64)'} headerTextColor={'white'} headerTextWeight={'normal'}>
                {statsLoading &&
                    <div style={{ margin: '0 auto' }}>
                        <LoadingIndicator customColor={gcOrange} />
                    </div>
                }
                {!statsLoading &&
                    renderStats() 
                }
            </GCAccordion>


        </div>
    )
}

export default EDASidePanel;