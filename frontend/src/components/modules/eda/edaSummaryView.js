
import React, {useState} from "react";
import {
	MuiPickersUtilsProvider,
	KeyboardDatePicker
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';


import {
    Link,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
} from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import {
    backgroundGreyLight
} from '../../common/gc-colors';
import CloseIcon from "@material-ui/icons/Close";
import ReactTable from "react-table";
import {setState} from "../../../sharedFunctions";



const _ = require('lodash');


const styles = {
    titleText: {
		fontWeight: 900,
		fontSize: '14px',
        marginBottom: 0
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
        width: 1220,
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
        color: 'white',
    },
    tableColumn: {
        textAlign: 'left',
        margin: '4px 0'
    }
}


export const EDASummaryView = (props) => {
    const {
        edaSearchSettings,
        searchResults,
        loading,
        dispatch
    } = props;

    const [showDialog, setShowDialog] = useState(false);
    const [summaryDetailData, setSummaryDetailData] = useState([]);


    const setEDASearchSetting = (field, value, isStartDate) => {
		const edaSettings = _.cloneDeep(edaSearchSettings);
        let doSearch = false;

		if (field === 'aggregations') {
            edaSettings.aggregations[value] = !edaSettings.aggregations[value];
		}
        else if (field === 'issueDateRange') {
            if(Object.prototype.toString.call(value) === '[object Date]'){
                value.setDate(value.getDate()+1)
            }

            if (isStartDate) {
                edaSettings.startDate = new moment(value).format('YYYY-MM-DD');
            }
            else {
                edaSettings.endDate = new moment(value).format('YYYY-MM-DD');
            }

            if (value && value.toString() !== 'Invalid Date') {
                doSearch = true;
            }
        }
        else if (field === 'contractIssueAgency'){
            doSearch = true;
            edaSettings.issueAgency = value;
        }


		setState(dispatch, { edaSearchSettings: edaSettings, runSearch: doSearch });
    }


    const renderDetailTable = () => {
        console.log(summaryDetailData)
        return (
            <ReactTable
                data={summaryDetailData}
                className={'striped'}
                noDataText={"No rows found"}
                // loading={loadingTable}
                columns={getSummaryColumns(true)}
                editable={false}
                filterable={false}
                minRows={1}
                multiSort={false}
                showPageSizeOptions={false}
                showPagination={false}
                getTbodyProps={(state, rowInfo, column) => {
                    return {
                        style: {
                            overflow: 'auto'
                        }
                    };
                }}
                getTdProps={(state, rowInfo, column) => ({
                    style: {
                        whiteSpace: 'unset'
                    },
                })}
                getTrGroupProps={(state, rowInfo) => {
                    return {
                        style: { maxHeight: 72 }
                    };
                }}
                getTheadTrProps={(state, rowInfo, column) => {
                    return { style: styles.tableHeaderRow };
                }}
                getTheadThProps={(state, rowInfo, column) => {
                    return { style: { fontSize: 15, fontWeight: 'bold', whiteSpace: 'unset' } };
                }}
                style={{
                    height: "90%",
                    borderTopRightRadius: 5,
                    borderTopLeftRadius: 5,
                }}
                getTableProps={(state, rowInfo, column) => {
                    return { style: { 
                        borderTopRightRadius: 5,
                        borderTopLeftRadius: 5,
                    }}
                }}
            />
        )
    }

    const getSummaryColumns = (isDetailColumns = false) => {


        let summaryColumns = [
            {
                Header: () => <p style={styles.tableColumn}>Office Agency</p>,
                filterable: false,
                accessor: 'contract_issue_name_eda_ext',
                width: 250,
                Cell: row => (
                    <div style={{ textAlign: 'left' }}>
                        <p>{row.value}</p>
                    </div>
                ),
                aggregate: vals => [...new Set(vals)],
                id: 'officeAgency',
                Aggregated: row => {
                    return <span>{row.value} </span>
                }
            },
            {
                Header: () => <p style={styles.tableColumn}>Office DoDAAC</p>,
                filterable: false,
                accessor: 'contract_issue_dodaac_eda_ext',
                width: 250,
                Cell: row => (
                    <div style={{ textAlign: 'left' }}>
                        <p>{row.value}</p>
                    </div>
                ),
                aggregate: vals => [...new Set(vals)].join(','),
                Aggregated: row => {
                    return <span>{row.value} </span>
                },
                id: 'office_dodaac'
            },
            {
                Header: () => <p style={styles.tableColumn}>Office Command</p>,
                filterable: false,
                accessor: 'issuing_organization_eda_ext',
                width: 200,
                Cell: row => (
                    <div style={{ textAlign: 'left' }}>
                        <p>{row.value}</p>
                    </div>
                ),
                aggregate: vals => [...new Set(vals)],
                Aggregated: row => {
                    return <span>{row.value} </span>
                },
                id: 'officeCommand'
            },
            {
                Header: () => <p style={styles.tableColumn}>Vendor</p>,
                filterable: false,
                accessor: 'vendor_name_eda_ext',
                width: 250,
                Cell: row => (
                    <div style={{ textAlign: 'left' }}>
                        <p>{row.value}</p>
                    </div>
                ),
                aggregate: vals => [...new Set(vals)],
                Aggregated: row => {
                    return <span>{row.value} </span>
                },
                id: 'vendor'
            },
            {
                Header: () => <p style={styles.tableColumn}>Parent IDV</p>,
                filterable: false,
                accessor: 'reference_idv_eda_ext',
                width: 200,
                Cell: row => (
                    <div style={{ textAlign: 'left' }}>
                        <p>{row.value}</p>
                    </div>
                ),
                aggregate: vals => [...new Set(vals)],
                Aggregated: row => {
                    return <span>{row.value} </span>
                },
                id: 'parentIDV'
            }

        ];

        if (!isDetailColumns) {
            summaryColumns = summaryColumns.concat(
                [
                    {
                        Header: () => <p style={styles.tableColumn}>Total Procurement Instruments</p>,
                        filterable: false,
                        accessor: 'procurement',
                        width: 150,
                        Cell: row => (
                            <div style={{ textAlign: 'left' }}>
                                <p>1</p>
                            </div>
                        ),
                        aggregate: (vals, rows) => {
                            return rows.length;
                        },
                        Aggregated: (row, item) => {
                            return <span>{row.value}</span>
                        },
                        id: 'totalProcurementInstruments'
                    },
                    // {
                    //     Header: () => <p style={styles.tableColumn}>Total Open</p>,
                    //     filterable: false,
                    //     accessor: 'totalOpen',
                    //     Cell: row => (
                    //         <div style={{ textAlign: 'left' }}>
                    //             <p>{row.value}</p>
                    //         </div>
                    //     ),
                    //     aggregate: vals => _.round(_.mean(vals)),
                    //     Aggregated: row => {
                    //         return <span>{row.value} (avg)</span>
                    //     }
                    // },
                    // {
                    //     Header: () => <p style={styles.tableColumn}>Total Closed</p>,
                    //     filterable: false,
                    //     accessor: 'totalClosed',
                    //     Cell: row => (
                    //         <div style={{ textAlign: 'left' }}>
                    //             <p>{row.value}</p>
                    //         </div>
                    //     ),
                    //     aggregate: vals => _.round(_.mean(vals)),
                    //     Aggregated: row => {
                    //         return <span>{row.value} (avg)</span>
                    //     }
                    // },
                    // {
                    //     Header: () => <p style={styles.tableColumn}>% Closed</p>,
                    //     filterable: false,
                    //     accessor: 'percentClosed',
                    //     Cell: row => (
                    //         <div style={{ textAlign: 'left' }}>
                    //             <p>{row.value}</p>
                    //         </div>
                    //     ),
                    //     aggregate: vals => _.round(_.mean(vals)),
                    //     Aggregated: row => {
                    //         return <span>{row.value} (avg)</span>
                    //     }
                    // },
                    // {
                    //     Header: () => <p style={styles.tableColumn}>Cumulative Obligated Amount ($)</p>,
                    //     filterable: false,
                    //     accessor: 'coa',
                    //     width: 250,
                    //     Cell: row => (
                    //         <div style={{ textAlign: 'left' }}>
                    //             <p>{row.value}</p> 
                    //         </div>
                    //     ),
                    //     aggregate: vals => _.round(_.mean(vals)),
                    //     Aggregated: row => {
                    //         return <span>{row.value} (avg)</span>
                    //     },
                    //     id: 'cumulativeObligatedAmount'
                    // },
                ]
            );
            for (const agg of Object.keys(edaSearchSettings.aggregations)) {
                if (edaSearchSettings.aggregations[agg] === true) {
                    summaryColumns.push(            
                    {
                        Header: () => <p style={styles.tableColumn}>Procurement Instrument List</p>,
                        filterable: false,
                        accessor: 'procurementList',
                        width: 250,
                        Cell: row => 
                        (
                            <div style={{ textAlign: 'left' }}>
                                <p>{row.value}</p> 
                            </div>
                        ),
                        aggregate: vals => vals,
                        Aggregated: row => {
                            let subRows = row?.row?._subRows;
                            subRows = subRows.map(row => row._original);
                            console.log(subRows);
                            return (
                                <Link onClick={(event)=> {
                                    setShowDialog(true);
                                    setSummaryDetailData(subRows);
                                }}
                                style={{ color: '#386F94', cursor: 'pointer'}}
                                >
                                    <div style={{ textAlign: 'left' }}>
                                        <p>Open</p>
                                    </div>
                                </Link>
                            )
                        }
                    });
                    break;
                }
            }
        }
        else {
            summaryColumns = summaryColumns.concat([
                // {
                //     Header: () => <p style={styles.tableColumn}>PIID</p>,
                //     filterable: false,
                //     accessor: 'piid',
                //     Cell: row => (
                //         <div style={{ textAlign: 'left' }}>
                //             <p>{row.value}</p>
                //         </div>
                //     )
                // },
                {
                    Header: () => <p style={styles.tableColumn}>Vendor Cage</p>,
                    filterable: false,
                    accessor: 'vendor_duns_eda_ext',
                    width: 200,
                    Cell: row => (
                        <div style={{ textAlign: 'left' }}>
                            <p>{row.value}</p>
                        </div>
                    )
                },
                {
                    Header: () => <p style={styles.tableColumn}>Vendor Name</p>,
                    filterable: false,
                    accessor: 'vendor_name_eda_ext',
                    width: 200,
                    Cell: row => (
                        <div style={{ textAlign: 'left' }}>
                            <p>{row.value}</p>
                        </div>
                    )
                },
                {
                    Header: () => <p style={styles.tableColumn}>Obligated Amount ($)</p>,
                    filterable: false,
                    accessor: 'obligated_amounts_eda_ext',
                    width: 250,
                    Cell: row => (
                        <div style={{ textAlign: 'left' }}>
                            <p>{row.value}</p>
                        </div>
                    )
                },
                {
                    Header: () => <p style={styles.tableColumn}>Contract Card</p>,
                    filterable: false,
                    accessor: 'contractCard',
                    width: 200,
                    Cell: row => (
                        <Link href={"#"} onClick={(event)=> {
                            event.preventDefault();
                            // 
                        }}
                        style={{ color: '#386F94' }}
                        >
                            <div style={{ textAlign: 'left' }}>
                                <p>{row.value}</p>
                            </div>
                        </Link>
                    )
                }
            ]
            )
        }

        return summaryColumns;
    }

    // const renderAggregationPills = () => {
    //     const pills = [];

    //     const varToName={
    //         officeAgency: 'Issue Office Agency',
    //         vendor: 'Vendor',
    //         parentIDV: 'Parent IDV'
    //     };

    //     for (const agg of Object.keys(edaSearchSettings.aggregations)) {
    //         if (edaSearchSettings.aggregations[agg]) {
    //             pills.push(<div style={styles.pill}>{varToName[agg]}</div>);
    //         }
    //     }
    //     return pills;
    // }

    // const renderDateRange = () => {
    //     const start = edaSearchSettings.startDate;
    //     const end = edaSearchSettings.endDate;

    //     const startDate = start ? `${start.getMonth()}/${start.getDate()}/${start.getFullYear()}` : 'None';
    //     const endDate = end ? `${end.getMonth()}/${end.getDate()}/${end.getFullYear()}` : 'None';

    //     return <p style={{display: 'inline-block', margin: '0 0 0 10px'}}>{startDate} - {endDate} </p>;
    // }

    // const filtersPresent = () => {

    //     // this needs to be edaSearchSettings in GameChangerPage.startingState
    //     const noFilters = {
    //         aggregations: {
    //             officeAgency: false,
    //             vendor: false,
    //             parentIDV: false
    //         },
    //         startDate: null,
    //         endDate: null,
    //         contractIssueAgency: null
    //     };

    //     return !_.isEqual(noFilters,edaSearchSettings);
    // }

    const summaryColumnNames = [
        'officeAgency', 
        'vendor',
        'parentIDV'
    ];


    return (
        <div>
            <Dialog
                open={showDialog}
                maxWidth="lg"
                onClose={() => setShowDialog(false)}
                style={styles.dialog}
            >
                <DialogTitle>
                    <div style={{display: 'flex', width: '100%'}}>
                        <Typography variant="h3" display="inline" style={{ fontWeight: 700 }}>Summary Details</Typography>
                    </div>
                    <IconButton aria-label="close" style={{ 
						position: 'absolute',
						right: '0px',
						top: '0px',
						height: 60,
						width: 60,
						color: 'black',
						backgroundColor: backgroundGreyLight,
						borderRadius: 0
					}} onClick={() => setShowDialog(false)}>
						<CloseIcon style={{ fontSize: 30 }} />
					</IconButton>
                </DialogTitle>
                <DialogContent style={styles.dialogContent}>
                    {renderDetailTable()}
                </DialogContent>
                <DialogActions>
                    
                </DialogActions>
            </Dialog>

            {/* {summaryView ?  */}
            <div>
                
                {/* <div style={{ margin: '0 0 5px 0'}}>
                    {filtersPresent() ? <>
                    <div style={{ margin: '15px 0', display: 'flex', alignItems: 'center'}}>
                        {aggregationPills.length > 0 && <div style={{...styles.filterDiv, padding: '0 10px 0 0'}}>
                            <Typography style={styles.filterTitle}> Aggregations: </Typography>
                            {aggregationPills}
                        </div>}
                        {(edaSearchSettings.startDate || edaSearchSettings.endDate) && <div style={{...styles.filterDiv, padding: '0 10px', borderLeft: aggregationPills.length > 0 ? 'solid 1px lightgray' : '', borderRight: edaSearchSettings.contractIssueAgency ? 'solid 1px lightgray' : ''}}>
                            <Typography style={styles.filterTitle}> PIID Issue Date Range: </Typography>
                            {renderDateRange()}
                        </div>}
                        {edaSearchSettings.contractIssueAgency && <div style={{...styles.filterDiv, padding: '0 10px'}}>
                            <Typography style={{ ...styles.filterTitle, margin: '0 15px 0 0'}}> Contract Issue Agency: </Typography>
                            {edaSearchSettings.contractIssueAgency}
                        </div>}
                    </div></>
                     : <div style={{ margin: '15px 0'}}>No filters applied</div> }
                </div> */}
                <div style={{ margin: '0 0 5px 0'}}>
                    <div style={{ padding: '0 15px 0 0', margin: '10px 0 0 0', display: 'flex', alignItems: 'center'}}>
                        <div style={{display: 'flex'}}>
                            <Typography 
                                style={styles.filterTitle}
                            > Aggregations: </Typography>
                            <FormControl style={styles.filterInput}>
                                <FormGroup row>
                                    <FormControlLabel
                                        name='Issue Office Agency'
                                        value='Issue Office Agency'
                                        style={styles.titleText}
                                        control={<Checkbox
                                            style={styles.filterBox}
                                            onClick={() => setEDASearchSetting('aggregations', 'officeAgency')}
                                            icon={<CheckBoxOutlineBlankIcon style={{visibility:'hidden'}}/>}
                                            checked={edaSearchSettings && edaSearchSettings.aggregations && edaSearchSettings.aggregations.officeAgency}
                                            checkedIcon={<i style={{color:'#E9691D'}}className="fa fa-check"/>}
                                            name='Issue Office Agency'
                                            />}
                                        label='Issue Office Agency'
                                        labelPlacement="end"
                                    />
                                    <FormControlLabel
                                        name='Vendor'
                                        value='Vendor'
                                        style={styles.titleText}
                                        control={<Checkbox											
                                            style={styles.filterBox}
                                            onClick={() => setEDASearchSetting('aggregations', 'vendor')} // need a handle
                                            icon={<CheckBoxOutlineBlankIcon style={{visibility:'hidden'}}/>}
                                            checked={edaSearchSettings && edaSearchSettings.aggregations && edaSearchSettings.aggregations.vendor} // need a selected
                                            checkedIcon={<i style={{color:'#E9691D'}} className="fa fa-check"/>}
                                            name='Vendor'
                                            />}
                                        label='Vendor'
                                        labelPlacement="end"
                                    />
                                    <FormControlLabel
                                        name='Parent IDV'
                                        value='Parent IDV'
                                        style={styles.titleText}
                                        control={<Checkbox
                                            style={styles.filterBox}
                                            onClick={() => setEDASearchSetting('aggregations', 'parentIDV')} // need a handle
                                            icon={<CheckBoxOutlineBlankIcon style={{visibility:'hidden'}}/>}
                                            checked={edaSearchSettings && edaSearchSettings.aggregations && edaSearchSettings.aggregations.parentIDV} // need a selected
                                            checkedIcon={<i style={{color:'#E9691D'}}className="fa fa-check"/>}
                                            name='Parent IDV'
                                            />}
                                        label='Parent IDV'
                                        labelPlacement="end"
                                    />
                                </FormGroup>
                            </FormControl>
                        </div>
                        <div style={{display: 'flex'}}>
                            <Typography style={{ ...styles.filterTitle, margin: '0 15px 0 0'}}> Contract Issue Agency: </Typography>
                            <div style={{ display: 'inline-block', margin: '0 0 0 15px' }}>
                                <Autocomplete
                                    options={['Dept of Army', 'Dept of Navy', 'Dept of Air Force', 'DARPA', 'DLA']}
                                    renderInput={(params) => <TextField {...params} label="Choose an agency" variant="outlined" />}
                                    clearOnEscape
                                    clearOnBlur
                                    blurOnSelect
                                    openOnFocus
                                    style={{ backgroundColor: 'white', width: 300 }}
                                    value={edaSearchSettings && edaSearchSettings.issueAgency}
                                    default
                                    onChange={(event, value) => setEDASearchSetting('contractIssueAgency', value)}
                                />
                            </div>
                        </div>

                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 15px 0'}}>
                        <Typography style={styles.filterTitle}> PIID Issue Date Range: </Typography>
                        <div style={{...styles.filterInput, display: 'inline-block'}}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    margin="normal"
                                    style={{margin:'0 15px 0 0'}}
                                    label="Start Date"
                                    format="MM/dd/yyyy"
                                    InputProps={{ style:{backgroundColor: 'white'}}}
                                    value={edaSearchSettings && edaSearchSettings.startDate}
                                    onChange={date => setEDASearchSetting('issueDateRange', date, true)}
                                />
                                <KeyboardDatePicker
                                    margin="normal"
                                    style={{margin:'0 15px 0 0'}}
                                    label="End Date"
                                    format="MM/dd/yyyy"
                                    InputProps={{ style:{backgroundColor: 'white'}}}
                                    value={edaSearchSettings && edaSearchSettings.endDate}
                                    onChange={date => setEDASearchSetting('issueDateRange', date, false)}
                                />
                            </MuiPickersUtilsProvider>
                        </div>
                    </div>
                </div>


                <ReactTable
                    data={searchResults}
                    className={'striped'}
                    noDataText={"No rows found"}
                    loading={loading}
                    columns={getSummaryColumns(false)}
                    pivotBy={searchResults ? Object.keys(edaSearchSettings.aggregations).filter(key => edaSearchSettings.aggregations[key] && summaryColumnNames.includes(key)) : []}
                    editable={false}
                    filterable={false}
                    minRows={1}
                    multiSort={false}
                    showPageSizeOptions={false}
                    showPagination={false}
                    getTbodyProps={(state, rowInfo, column) => {
                        return {
                            style: {
                                overflow: 'auto'
                            }
                        };
                    }}
                    getTdProps={(state, rowInfo, column) => ({
                        style: {
                            whiteSpace: 'unset'
                        },
                    })}
                    getTheadTrProps={(state, rowInfo, column) => {
                        return { style: styles.tableHeaderRow };
                    }}
                    getTheadThProps={(state, rowInfo, column) => {
                        return { style: { fontSize: 15, fontWeight: 'bold', whiteSpace: 'unset' } };
                    }}
                    style={{
                        height: "calc(100vh - 395px)",
                        borderTopRightRadius: 5,
                        borderTopLeftRadius: 5,
                        marginBottom: 10
                    }}
                    getTableProps={(state, rowInfo, column) => {
                        return { style: { 
                            borderTopRightRadius: 5,
                            borderTopLeftRadius: 5
                        }}
                    }}
                />
            </div> 

        </div>
    );
}

export default EDASummaryView;