import React from 'react';
import { Tooltip} from '@material-ui/core'
import ReactTable from 'react-table';

import ProgressBar from './util/ProgressBar';
import {TableRow, StatusCircle, BorderDiv} from './util/styledDivs';
import styles from '../GCAdminStyles';

import "react-table/react-table.css";
import './index.scss';
const status = ['ok', 'loading', 'error'];

const currentColumns = [
    {
        Header: 'Process',
        accessor: 'process',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Progress',
        accessor: 'progress',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Percentage',
        accessor: 'date',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    }
]

const completedColumns = [
    {
        Header: 'Process',
        accessor: 'process',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Total',
        accessor: 'total',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Date Completed',
        accessor: 'date',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    }
]

/**
 * This class queries the ml api information and provides controls 
 * for the different endpoints
 * @class Process
 */
const Process = (props) => {
    /**
     * Get the general information for the API
     * @method getAPIInformation
     */
     const getProcessData = () =>{
        const processList = [];
        if(props.processes.process_status && props.processes.process_status.flags){
            
        }
        return processList;
    } 
    /**
     * @method getProcessStatus
     * @returns 
     */
    const getProcessStatus = () =>{
        if(props.processes.process_status && props.processes.process_status.flags){
            const flags = props.processes.process_status.flags
            for(const key in flags){
                if(flags[key]){
                    // if a flag is true a process is running
                    return 1;
                }
            }
        }
        // 0 is a good status that nothing is running
        return 0;
    }

    return (			
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
                <p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>General Information</p>
                <Tooltip title={"Connection " + status[getProcessStatus()].toUpperCase()} placement="right" arrow><StatusCircle className = {status[getProcessStatus()]}/></Tooltip>
            </div>
            <div className='info'>
                <BorderDiv className='half'>
                    <div style={{width:'100%', display:'inline-block', paddingBottom:'5px', marginTop:'10px'}}>
                        <div style={{display:'inline-block'}}>Processes In Progress:</div>
                    </div>
                    <fieldset className={'field'}>
                        <div className='info-container'>
                            <ReactTable
                                data={getProcessData()}
                                columns={currentColumns}
                                className='striped -highlight'
                                defaultPageSize={5}
                            />
                        </div>           
                    </fieldset>
                </BorderDiv>
                <BorderDiv className='half' style={{float:'right'}}>
                    <div style={{width:'100%', display:'inline-block', paddingBottom:'5px', marginTop:'10px'}}>
                        <div style={{display:'inline-block'}}>Completed Processes:</div>
                    </div>
                    <fieldset className={'field'}>
                        <div className='info-container'>
                            <ReactTable
                                data={props.processes.completed_process?props.processes.completed_process:[]}
                                columns={completedColumns}
                                className='striped -highlight'
                                defaultSorted = {[ { id: "date", desc: true } ]}
                                defaultPageSize={5}
                            />
                        </div>           
                    </fieldset>
                </BorderDiv>
            </div>
        </div>
    )
}

export default Process