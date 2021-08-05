import React, {useState, useEffect} from 'react';
import ReactTable from "react-table";
import {Snackbar} from "@material-ui/core";
import GameChangerAPI from '../../api/gameChanger-service-api';
import GCAccordion from "../../common/GCAccordion";
import GCButton from "../../common/GCButton";
import {styles, TableRow} from '../util/GCAdminStyles';
import AddEditorTermDialog from './AddEditorTermDialog';


const gameChangerAPI = new GameChangerAPI();

/**
 * 
 * @class HomepageEditor
 */
export default () => {
    // State Variables
    const [editorTableData, setEditorTableData] = useState({topics:[],major_pubs:[]});
	const [showAddEditorTermDialog, setShowAddEditorTermDialog] = useState(false);
	const [editorAddTerm, setEditorAddTerm] = useState({value:'', section:'topic'});
	const [showSavedSnackbar, setShowSavedSnackbar] = useState(false);
    
    // Component methods
    /**
     * This updates the table data for the editor table.
     * Is only used in the child modal
     * @method handleAddRow
     * @param {*} key 
     * @param {*} value 
     */
    const handleAddRow = (key, value) => {
		const tmp = {...editorTableData};
		tmp[key].push({name:value});
		setEditorTableData(tmp);
	}
    /**
     * 
     */
    const getHomepageEditorData = async () => {
        const tableData = {};
        const { data } = await gameChangerAPI.getHomepageEditorData();
        data.forEach(obj => {
            obj.key = obj.key.replace('homepage_','');
            tableData[obj.key] = JSON.parse(obj.value)
        });
    
        setEditorTableData(tableData);
    }
    /**
     * 
     * @param {*} key 
     * @param {*} index 
     */
    const handleShiftRowDown = (key, index) => {
		const curr = editorTableData[key][index];
		const next = editorTableData[key][index+1];
		const tmp = {...editorTableData}
		tmp[key][index] = next;
		tmp[key][index+1] = curr;
		setEditorTableData(tmp);
	}
    /**
     * 
     */
	const handleShiftRowUp = (key, index) => {
		const curr = editorTableData[key][index];
		const prev = editorTableData[key][index-1];
		const tmp = {...editorTableData}
		tmp[key][index] = prev;
		tmp[key][index-1] = curr;
		setEditorTableData(tmp);
	}
    /**
     * 
     * @param {*} key 
     */
    const saveHomepageEditor = async (key) => {
		try{
			await gameChangerAPI.setHomepageEditorData({key, tableData:editorTableData[key]});
		} catch(e) {
			console.log(e)
			console.log('failed to save');
		}
	}
    useEffect(()=>{
        getHomepageEditorData();
    },[]);

    // Columns for tables
    const topicColumns = [
        {
            Header: 'Name',
            accessor: 'name',
            Cell: row => (
                <TableRow>{row.value}</TableRow>
            )
        },
        {
            Header: ' ',
            accessor: 'id',
            Cell: row => (
                <TableRow>
                    <GCButton
                        onClick={() => {
                            handleShiftRowUp('topics', row.index)
                        }}
                        disabled={row.index===0}
                        style={{minWidth: 'unset', backgroundColor: 'green', borderColor: 'green', height: 35}}
                    >Up</GCButton>
                    <GCButton
                        onClick={() => {
                            handleShiftRowDown('topics', row.index)
                        }}
                        disabled={row.index===editorTableData['topics'].length-1}
                        style={{minWidth: 'unset', backgroundColor: 'red', borderColor: 'red', height: 35}}
                    >Down</GCButton>
                    <GCButton
                        onClick={() => {
                            editorTableData['topics'].splice(row.index,1)
                            setEditorTableData({...editorTableData,topics:editorTableData['topics']})
                        }}
                        style={{minWidth: 'unset', backgroundColor: 'red', borderColor: 'red', height: 35}}
                    >Remove</GCButton>
                </TableRow>
            )
        }
    ]
    
    const majorPubColumns = [
        {
            Header: 'Name',
            accessor: 'name',
            width: 200,
            Cell: row => (
                <TableRow>{row.value}</TableRow>
            )
        },
        {
            Header: 'Reason',
            accessor: 'reason',
            Cell: row => (
                <TableRow>{row.value}</TableRow>
            )
        },
        {
            Header: ' ',
            accessor: 'id',
            width: 230,
            Cell: row => (
                <TableRow>
                    <GCButton
                        onClick={() => {
                            handleShiftRowUp('major_pubs', row.index)
                        }}
                        disabled={row.index===0}
                        style={{minWidth: 'unset', backgroundColor: 'green', borderColor: 'green', height: 35}}
                    >Up</GCButton>
                    <GCButton
                        onClick={() => {
                            handleShiftRowDown('major_pubs', row.index)
                        }}
                        disabled={row.index===editorTableData['major_pubs'].length-1}
                        style={{minWidth: 'unset', backgroundColor: 'red', borderColor: 'red', height: 35}}
                    >Down</GCButton>
                    <GCButton
                        onClick={() => {
                            editorTableData['major_pubs'].splice(row.index,1)
                            setEditorTableData({...editorTableData,major_pubs:editorTableData['major_pubs']})
                        }}
                        style={{minWidth: 'unset', backgroundColor: 'red', borderColor: 'red', height: 35}}
                    >Remove</GCButton>
                </TableRow>
            )
        }
    ]

    return (
        <>
            <div style={{height: '100%'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
                    <p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>Homepage Editor</p>
                </div>
                
                <div style={{margin: '10px 80px'}}>
                    <GCAccordion expanded={true} header={'Topics'}>
                        <div style={{display:"flex", flexDirection: 'column', width: "100%"}}>
                            <ReactTable
                                data={editorTableData.topics}
                                columns={topicColumns}
                                pageSize={10}
                                style={{width: '100%'}}
                                getTheadTrProps={() => {
                                    return { style: { height: 'fit-content', textAlign: 'left', fontWeight: 'bold' } };
                                }}
                                getTheadThProps={() => {
                                    return { style: { fontSize: 15, fontWeight: 'bold' } };
                                }}
                            />
                            <div style={{display:'flex'}}>
                                <GCButton
                                    id={'addTopic'}
                                    onClick={()=>{
                                        setEditorAddTerm({...editorAddTerm, section:'topics'})
                                        setShowAddEditorTermDialog(true)
                                    }}
                                    style={{ width:200, margin:'10px'}}
                                >
                                    Add Term
                                </GCButton>
                                <GCButton
                                    id={'saveTopic'}
                                    onClick={()=>{
                                        saveHomepageEditor('topics');
                                        setShowSavedSnackbar(true);
                                    }}
                                    style={{ width:200, margin:'10px'}}
                                >
                                    Save
                                </GCButton>
                            </div>
                        </div>
                    </GCAccordion>
                    <GCAccordion expanded={true} header={'Major Publications'}>
                        <div style={{display:"flex", flexDirection: 'column', width: "100%"}}>
                            <ReactTable
                                data={editorTableData.major_pubs}
                                columns={majorPubColumns}
                                pageSize={10}
                                style={{width: '100%'}}
                                getTheadTrProps={() => {
                                    return { style: { height: 'fit-content', textAlign: 'left', fontWeight: 'bold' } };
                                }}
                                getTheadThProps={() => {
                                    return { style: { fontSize: 15, fontWeight: 'bold' } };
                                }}
                            />
                            <div style={{display:'flex'}}>
                                <GCButton
                                    id={'addMajorPub'}
                                    onClick={()=>{
                                        setEditorAddTerm({...editorAddTerm, section:'major_pubs'})
                                        setShowAddEditorTermDialog(true)
                                    }}
                                    style={{ width:200, margin:'10px'}}
                                >
                                    Add Term
                                </GCButton>
                                <GCButton
                                    id={'saveMajorPub'}
                                    onClick={()=>{
                                        saveHomepageEditor('major_pubs');
                                        setShowSavedSnackbar(true);
                                    }}
                                    style={{ width:200, margin:'10px'}}
                                >
                                    Save
                                </GCButton>
                            </div>
                        </div>
                    </GCAccordion>
                </div>
            </div>
            <AddEditorTermDialog showAddEditorTermDialog={showAddEditorTermDialog} setShowAddEditorTermDialog={setShowAddEditorTermDialog} handleAddRow={handleAddRow} />
            <Snackbar
				style={{marginTop: 20}}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				open={showSavedSnackbar}
				autoHideDuration={3000}
				onClose={() => setShowSavedSnackbar(false)}
				message={`Saved`}
			/>
        </>
    )
}