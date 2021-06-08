import React from "react";
import GCAccordion from "../../common/GCAccordion";
import SimpleTable from "../../common/SimpleTable";
import {
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
    TextField
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
    checkboxes: {
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
            case 'issueOffice':
                edaSettings.issueOffice = value;
                break;
            case 'allYears':
                edaSettings.allYearsSelected = true;
                break;
            case 'specYears':
                edaSettings.allYearsSelected = false;
                break;
            case 'fiscalYear':
                const index = edaSettings.fiscalYears.indexOf(value);
                if (index !== -1) {
                    edaSettings.fiscalYears.splice(index, 1);
                }
                else {
                    edaSettings.fiscalYears.push(value);
                }
                break;
            case 'allData':
                edaSettings.allDataSelected = true;
                break;
            case 'specData':
                edaSettings.allDataSelected = false;
                break;
            case 'contractData':
                edaSettings.contractData[value] = !edaSettings.contractData[value];
                break;
            case 'minObligatedAmount':
                edaSettings.minObligatedAmount = value;
                break;
            case 'maxObligatedAmount':
                edaSettings.maxObligatedAmount = value;
                break;
            default:
                break;
        }

		setState(dispatch, { edaSearchSettings: edaSettings });
    }

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
                                name='All organizations'
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
                    <FormGroup style={styles.checkboxes}>
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

    const renderIssueOfficeFilter = () => {
        return (
            <TextField
                placeholder="Issue Office DoDAAC"
                variant="outlined"
                defaultValue={edaSearchSettings.issueOffice}
                style={{ backgroundColor: 'white', width: '100%' }}
                fullWidth={true}
                onBlur={(event) => setEDASearchSetting('issueOffice', event.target.value)}
                inputProps={{
                    style: {
                        height: 19,
                        width: '100%'
                    }
                }}
            />
        )
    }

    const renderFiscalYearFilter = () => {
        const now = new Date();
        const yearCheckboxes = [];

        const start = 2000;
        const end = now.getFullYear();

        for (let i = end; i >= start; i--) {
            yearCheckboxes.push(
                <FormControlLabel
                    name={i.toString()}
                    value={i.toString()}
                    style={styles.titleText}
                    control={<Checkbox
                        style={styles.filterBox}
                        onClick={() => setEDASearchSetting('fiscalYear', i.toString())}
                        icon={<CheckBoxOutlineBlankIcon style={{visibility:'hidden'}}/>}
                        checked={edaSearchSettings && edaSearchSettings.fiscalYears && edaSearchSettings.fiscalYears.indexOf(i.toString()) !== -1}
                        checkedIcon={<i style={{color:'#E9691D'}}className="fa fa-check"/>}
                        name={i.toString()}
                    />}
                    label={i.toString()}
                    labelPlacement="end"                        
                />
            )
        }

        return (
            <div style={styles.container}>
            <FormControl>
                <FormGroup>
                    <FormControlLabel
                        name='All years'
                        value='All years'
                        control={<Checkbox
                            onClick={() => setEDASearchSetting('allYears', '')}
                            icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
                            checked={edaSearchSettings.allYearsSelected}
                            checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
                            name='All years'
                            style={styles.filterBox}
                        />}
                        label='All fiscal years'
                        labelPlacement="end"
                        style={styles.titleText}
                    />
                    <FormControlLabel
                        name='Specific fiscal year(s)'
                        value='Specific fiscal year(s)'
                        control={<Checkbox
                            onClick={() => setEDASearchSetting('specYears', '')}
                            icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
                            checked={!edaSearchSettings.allYearsSelected}
                            checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
                            name='Specific fiscal year(s)'
                            style={styles.filterBox}
                        />}    
                        label='Specific fiscal year(s)'
                        labelPlacement="end"
                        style={styles.titleText}
                    />
                </FormGroup>

                {!edaSearchSettings.allYearsSelected && 
                <FormGroup style={styles.checkboxes}>
                    {yearCheckboxes}
                </FormGroup>}
            </FormControl>
        </div>
        )
    }

    const renderContractDataFilter = () => {
        return (
            <div style={styles.container}>
            <FormControl>
                <FormGroup>
                    <FormControlLabel
                        name='All data sources'
                        value='All data sources'
                        control={<Checkbox
                            onClick={() => setEDASearchSetting('allData', '')}
                            icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
                            checked={edaSearchSettings.allDataSelected}
                            checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
                            name='All data sources'
                            style={styles.filterBox}
                        />}
                        label='All data sources'
                        labelPlacement="end"
                        style={styles.titleText}
                    />
                    <FormControlLabel
                        name='Specific data source(s)'
                        value='Specific data source(s)'
                        control={<Checkbox
                            onClick={() => setEDASearchSetting('specData', '')}
                            icon={<CheckBoxOutlineBlankIcon style={{ visibility: 'hidden' }} />}
                            checked={!edaSearchSettings.allDataSelected}
                            checkedIcon={<i style={{ color: '#E9691D' }} className="fa fa-check" />}
                            name='Specific data source(s)'
                            style={styles.filterBox}
                        />}
                        label='Specific data source(s)'
                        labelPlacement="end"
                        style={styles.titleText}
                    />
                </FormGroup>

                {!edaSearchSettings.allDataSelected && 
                <FormGroup style={styles.checkboxes}>
                    <FormControlLabel
                        name='PDS'
                        value='PDS'
                        style={styles.titleText}
                        control={<Checkbox
                            style={styles.filterBox}
                            onClick={() => setEDASearchSetting('contractData', 'pds')}
                            icon={<CheckBoxOutlineBlankIcon style={{visibility:'hidden'}}/>}
                            checked={edaSearchSettings && edaSearchSettings.contractData && edaSearchSettings.contractData.pds}
                            checkedIcon={<i style={{color:'#E9691D'}} className="fa fa-check"/>}
                            name='PDS'
                        />}
                        label='PDS'
                        labelPlacement="end"                        
                    />
                    <FormControlLabel
                        name='SYN'
                        value='SYN'
                        style={styles.titleText}
                        control={<Checkbox
                            style={styles.filterBox}
                            onClick={() => setEDASearchSetting('contractData', 'syn')}
                            icon={<CheckBoxOutlineBlankIcon style={{visibility:'hidden'}}/>}
                            checked={edaSearchSettings && edaSearchSettings.contractData && edaSearchSettings.contractData.syn}
                            checkedIcon={<i style={{color:'#E9691D'}} className="fa fa-check"/>}
                            name='SYN'
                        />}    
                        label='SYN'
                        labelPlacement="end"                    
                    />
                    <FormControlLabel
                        name='None'
                        value='None'
                        style={styles.titleText}
                        control={<Checkbox
                            style={styles.filterBox}
                            onClick={() => setEDASearchSetting('contractData', 'none')}
                            icon={<CheckBoxOutlineBlankIcon style={{visibility:'hidden'}}/>}
                            checked={edaSearchSettings && edaSearchSettings.contractData && edaSearchSettings.contractData.none}
                            checkedIcon={<i style={{color:'#E9691D'}}className="fa fa-check"/>}
                            name='None'
                        />}        
                        label='None'
                        labelPlacement="end"                
                    />
                </FormGroup>}
            </FormControl>
        </div>
        )
    }

    const renderObligatedAmountFilter = () => {
        return (
            <div style={styles.container}>
                <TextField
                    placeholder="Min"
                    variant="outlined"
                    type="number"
                    defaultValue={edaSearchSettings && edaSearchSettings.minObligatedAmount}
                    style={{ backgroundColor: 'white', width: '100%', margin: '0 0 15px 0' }}
                    fullWidth={true}
                    onBlur={(event) => setEDASearchSetting('minObligatedAmount', event.target.value)}
                    inputProps={{
                        style: {
                            height: 19,
                            width: '100%'
                        }
                    }}
                />
                <TextField
                    placeholder="Max"
                    variant="outlined"
                    type="number"
                    defaultValue={edaSearchSettings && edaSearchSettings.maxObligatedAmount}
                    style={{ backgroundColor: 'white', width: '100%' }}
                    fullWidth={true}
                    onBlur={(event) => setEDASearchSetting('maxObligatedAmount', event.target.value)}
                    inputProps={{
                        style: {
                            height: 19,
                            width: '100%'
                        }
                    }}
                />
            </div>
        )
    }



    return (
        <div>
			<div className={'filters-container sidebar-section-title'} style={{ marginBottom: 15 }}>FILTERS</div>
            <GCAccordion contentPadding={0} expanded={false} header={'ISSUE ORGANIZATION'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
                { renderOrganizationFilters() }
            </GCAccordion>

            <GCAccordion contentPadding={15} expanded={false} header={'ISSUE OFFICE DODAAC'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
                { renderIssueOfficeFilter() }
            </GCAccordion>

            <GCAccordion contentPadding={15} expanded={false} header={'FISCAL YEAR'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
                { renderFiscalYearFilter() }
            </GCAccordion>

            <GCAccordion contentPadding={15} expanded={false} header={'EDA CONTRACT DATA'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
                { renderContractDataFilter() }
            </GCAccordion>

            <GCAccordion contentPadding={15} expanded={false} header={'OBLIGATED AMOUNT'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
                { renderObligatedAmountFilter() }
            </GCAccordion>

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