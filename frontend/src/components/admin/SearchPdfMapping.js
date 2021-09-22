import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ReactTable from 'react-table';
import XLSX from 'xlsx';
import GameChangerAPI from '../api//gameChanger-service-api';
import GCPrimaryButton from "../common/GCButton";
import { trackEvent } from '../telemetry/Matomo';
import {styles} from './util/GCAdminStyles';

const gameChangerAPI = new GameChangerAPI();

const CreateWrapper = styled.div`
	display: flex;
	align-items: center;
    float: right;
`
const LabelStack = styled.div`
    display: flex
	margin-left: 24px;
`

const TableRow = styled.div`
	text-align: center;
`
const columns = [
    {
        Header: 'Visit ID',
        accessor: 'idvisit',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Search Time',
        accessor: 'searchtime',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Search',
        accessor: 'search',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Document Opened',
        accessor: 'document',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Document Time',
        accessor: 'documenttime',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
]

const feedbackColumns = [
    {
        Header: 'Feedback Event',
        accessor: 'event_name',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'User ID',
        accessor: 'user_id',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Feedback Time',
        accessor: 'createdAt',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Search',
        accessor: 'value_1',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Returned',
        accessor: 'value_2',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
];

const documentUsageColumns = [
    {
        Header: 'Document',
        accessor: 'document',
        width: 500,
        headerStyle: {textAlign: 'left', paddingLeft: '15px'},
        Cell: row => (
            <TableRow style={{textAlign: 'left' , paddingLeft: '15px'}} >{row.value.substring(12)}</TableRow>
        )
    },
    {
        Header: 'Visit Count',
        accessor: 'visit_count',
        width: 140,
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Unique Viewers',
        accessor: 'user_count',
        width: 140,
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'User List',
        accessor: 'user_list',
        headerStyle: {textAlign: 'left' , paddingLeft: '15px'},
        Cell: row => (
            <TableRow style={{textAlign: 'left' , paddingLeft: '15px'}}>{row.value}</TableRow>
        )
    },
];

/**
 * This method queries Matomo for documents based on search.
 * The query is handled in gamechanger-api.
 * @method getSearchPdfMapping
 */
const getSearchPdfMapping = async (daysBack, setMappingData) => {
	try {
		// daysBack, offset, filters, sorting, pageSize
		const params = {daysBack}
		const { data = {} } = await gameChangerAPI.getSearchPdfMapping(params);
		setMappingData(data.data);
	} catch (e) {
		console.error(e);
	}
}

/**
 * This method queries postgres for feedback data.
 * The query is handled in gamechanger-api.
 * @method getFeedbackData
 */
 const getFeedbackData = async (setFeedbackData) => {
	try {
		// daysBack, offset, filters, sorting, pageSize
		const data = await gameChangerAPI.getFeedbackData();
        setFeedbackData(data.data.results);
	} catch (e) {
		console.error(e);
	}
}

/**
 * This method queries postgres for feedback data.
 * The query is handled in gamechanger-api.
 * @method getDocumentData
 */
 const getDocumentData = async (daysBack, setDocumentData) => {
	try {
		// daysBack, offset, filters, sorting, pageSize
        const params = {daysBack}
		const {data = {} } = await gameChangerAPI.getDocumentUsage(params);
        setDocumentData(data.data);
	} catch (e) {
		console.error(e);
	}
}

/**
 * This class queries a search to pdf mapping from matomo
 * and visualizes it as a tabel as well as provide the option
 * to download as a csv
 * @class SearchPdfMapping
 */
export default () => {

	// Set state variables
	const [mappingData, setMappingData] = useState([]);
    const [feedbackData, setFeedbackData] = useState([]);
    const [documentData, setDocumentData] = useState([]);
    const [daysBack, setDaysBack] = useState(3);

    // flags that parameters have been changed and on 
    // blur or enter press we should update the query
    const [shouldUpdate, setShouldUpdate] = useState(false);
    /**
     * Handles text change in input
     * @method handleDaysBackChange
     * @param {*} event 
     */
    const handleDaysBackChange = (event) => {
        const value = event.target.value;
        const parsed = parseInt(value);
        if (!isNaN(parsed) && parsed > 0) {
            setShouldUpdate(true);
            setDaysBack(parsed)
        }
        else if( parsed===0 || value===''){
            setDaysBack(value)
        }
	}
    /**
     * When an input is deselected check if the inputs are valid and a 
     * change was made. If so then query the data with new values.
     * @method handleBlur
     * @param {*} event 
     */
    const handleBlur = (event) => {
        if(!daysBack){
            setShouldUpdate(false);
            setDaysBack(3)
        }
        if (shouldUpdate) {
            setShouldUpdate(false);
            getSearchPdfMapping(daysBack, setMappingData);
        }
	}
    /**
     * If the enter key is pressed while in an input trigger handleBlur
     * @method handlePositionEnter
     * @param {*} event 
     */
    const handlePositionEnter = (event) => {
        if (event.key === 'Enter') {
            handleBlur();
        }
    }
    
    /**
     * This method takes the current data loaded in mappingData 
     * and saves it to the users downloads as a csv.
     * @method exportMapping
     */
    const exportMapping = () => {
        const name = 'SearchPdfMapping';
        var ws = XLSX.utils.json_to_sheet(mappingData);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, name);
        XLSX.writeFile(wb, name + ".csv");
    }

    const exportFeedback = () => {
        const name = 'Feedback';
        var ws = XLSX.utils.json_to_sheet(feedbackData);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, name);
        XLSX.writeFile(wb, name + ".csv");
    }

	useEffect(() => {
		getSearchPdfMapping(daysBack, setMappingData);
        getFeedbackData(setFeedbackData);
        getDocumentData(daysBack, setDocumentData);
	}, [daysBack]);
    

    return (			
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
                <p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>Search PDF Mapping: Document Opened Given Search</p>
                
                <CreateWrapper>
					<LabelStack >
						<label htmlFor="daysBack" style={{ marginRight: '10px', marginTop:'4px'}}>Days Back:</label>
						<input name="daysBack" value={daysBack} onChange={handleDaysBackChange} onBlur={handleBlur} onKeyPress={handlePositionEnter} />
					</LabelStack>
                </CreateWrapper>
                <GCPrimaryButton
						onClick={() => {
							trackEvent('GAMECHANGER', "ExportSearchPDFMapping", "onClick");
							exportMapping();
						}}
						style={{minWidth: 'unset'}}
					>Export Mapping</GCPrimaryButton>
            </div>

            <ReactTable
                data={mappingData}
                columns={columns}
                style={{margin: '0 80px 20px 80px', height: 700}}
                defaultSorted = {[ { id: "searchtime", desc: true } ]}
            />
            <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
                <p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>Feedback Data</p>
                <GCPrimaryButton
						onClick={() => {
							trackEvent('GAMECHANGER', "ExportFeedback", "onClick");
							exportFeedback();
						}}
						style={{minWidth: 'unset'}}
					>Export Feedback</GCPrimaryButton>
            </div>
            <ReactTable
                data={feedbackData}
                columns={feedbackColumns}
                style={{margin: '0 80px 20px 80px', height: 700}}
                defaultSorted = {[ { id: "event_name", desc: false } ]}
            />

            <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
                <p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>Document Usage Data</p>
                <GCPrimaryButton
						onClick={() => {
							trackEvent('GAMECHANGER', "ExportDocumentUsage", "onClick");
							
						}}
						style={{minWidth: 'unset'}}
					>Export Document Usage</GCPrimaryButton>
            </div>
            <ReactTable
                data={documentData}
                columns={documentUsageColumns}
                style={{margin: '0 80px 20px 80px', height: 700}}
                defaultSorted = {[ { id: "visit_count", desc: true } ]}
            />
        </div>
    )
}
