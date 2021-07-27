import React from 'react';
import ReactTable from 'react-table';

import ProgressBar from './util/ProgressBar';
import {TableRow, BorderDiv} from './util/styledDivs';
import styles from '../GCAdminStyles';

import "react-table/react-table.css";
import './index.scss';

const currentColumns = [
    {
        Header: 'Category',
        accessor: 'category',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Process',
        accessor: 'process',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
    {
        Header: 'Progress',
        id: 'progress',
        Cell: row => (
            <TableRow>{row.original.progress} of {row.original.total}</TableRow>
        )
    },
    {
        Header: 'Percentage',
        accessor: 'date',
        Cell: row => (
            <TableRow><ProgressBar progress={100*row.original.progress/row.original.total}/></TableRow>
        )
    }
]

const completedColumns = [
    {
        Header: 'Category',
        accessor: 'category',
        Cell: row => (
            <TableRow>{row.value}</TableRow>
        )
    },
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
     * @method getProcessData
     */
     const getProcessData = () =>{
        const processList = [];
        if(props.processes.process_status){
            for(const key in props.processes.process_status){
                if(key !== 'flags'){
                    const status = key.split(': ')
                    processList.push({
                        ...props.processes.process_status[key],
                        process:status[1],
                        category:status[0]
                    })
                }
            } 
        }
        return processList;
    } 
    /**
     * Get the general information for the API
     * @method getCompletedData
     */
     const getCompletedData = () =>{
        const processList = [];
        if(props.processes && props.processes.completed_process){
            for(const completed of props.processes.completed_process){
                const completed_process = completed.process.split(': ')
                processList.push({
                    ...completed,
                    process:completed_process[1],
                    category:completed_process[0]
                })
            } 
        }
        
        return processList;
    } 

    return (			
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
                <p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>General Information</p>
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
                                defaultPageSize={10}
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
                                data={getCompletedData()}
                                columns={completedColumns}
                                className='striped -highlight'
                                defaultSorted = {[ { id: "date", desc: true } ]}
                                defaultPageSize={10}
                            />
                        </div>           
                    </fieldset>
                </BorderDiv>
            </div>
        </div>
    )
}

export default Process