import React, {useState, useEffect} from 'react';
import ReactTable from "react-table";
import _ from "underscore";

import GameChangerAPI from '../../api/gameChanger-service-api';
import GCButton from "../../common/GCButton";
import UOTToggleSwitch from "../../common/GCToggleSwitch";
import { trackEvent } from '../../telemetry/Matomo';
import {styles, TableRow} from '../util/GCAdminStyles';
import CloneModal from './CloneModal';

const gameChangerAPI = new GameChangerAPI();

const CLONE_MUST_BE_FILLED_KEYS = ['clone_name', 'url', 'display_name', 'config'];

const DEFAULT_MODULE = {
	clone_name: '',
	card_module: 'default/defaultCardHandler',
	display_name: '',
	export_module: 'simple/simpleExportHandler',
	graph_module: 'simple/simpleGraphHandler',
	main_view_module: 'default/defaultMainViewHandler',
	navigation_module: 'default/defaultNavigationHandler',
	search_module: 'simple/simpleSearchHandler',
	title_bar_module: 'default/defaultTitleBarHandler',
	s3_bucket: 'advana-raw-zone/bronze'
}

/**
 * 
 * @class CloneList
 */
export default () => {
    // Component Properties
    const [gcCloneTableData, setGCCloneTableData] = useState([]);
    const [cloneTableMetaData, setCloneTableMetaData] = useState({stringFields: [], booleanFields: [], jsonFields: []});
    const [showCreateEditCloneModal, setShowCreateEditCloneModal] = useState(false);
    const [cloneToEdit, setCloneToEdit] = useState({});
    const [editCloneDataErrors, setEditCloneDataErrors] = useState({});
    // Component Methods
    const openCloneModal = (num=-99) =>{
        if (num >= 0) {
			const filteredClones = _.filter(gcCloneTableData, clone => {
				return clone.id === num;
			});
			const cloneEdit = {...filteredClones[0] };
			setCloneToEdit(cloneEdit);
		} else {
			setCloneToEdit({});
		}
	
        setShowCreateEditCloneModal(true);
	}
    const defaultModuleGivenKey = (key) => {
		return DEFAULT_MODULE[key] || '';
	}
    const storeCloneData = (editCloneData = null) => {
		
		if (!editCloneData) {
			editCloneData = cloneToEdit;
		}
		
		const cloneDataToStore = {...editCloneData};
		
		delete cloneDataToStore.id;
		delete cloneDataToStore.createdAt;
		delete cloneDataToStore.updatedAt;
		
        cloneTableMetaData.jsonFields.forEach(field => {
			if (typeof cloneDataToStore[field.key] === 'string') {
				cloneDataToStore[field.key] = JSON.parse(cloneDataToStore[field.key]);
			}
		})
		Object.keys(DEFAULT_MODULE).forEach(key => {
			if (!cloneDataToStore[key] || cloneDataToStore[key] === '') {
				cloneDataToStore[key] = defaultModuleGivenKey(key);
			}
		})
		
		let error = false;
		const cloneErrors = {...editCloneDataErrors};
		CLONE_MUST_BE_FILLED_KEYS.forEach(fieldKey => {
			if ( !cloneDataToStore[fieldKey] || cloneDataToStore[fieldKey] === '') {
				error = true;
				cloneErrors[fieldKey] = true;
			} else {
				cloneErrors[fieldKey] = false;
			}
		});
		setEditCloneDataErrors(cloneErrors);
		
		if (!error) {
			gameChangerAPI.storeCloneData(cloneDataToStore).then(data => {
				if (data.status === 200) {
					setEditCloneDataErrors({});
					setShowCreateEditCloneModal(false);
				    getCloneData();
				}
			});
		}
	}
    const getCloneData = async () => {
        const tableData = [];
    
        const data = await gameChangerAPI.getCloneData();
    
        _.forEach(data.data, result => {
            tableData.push(result);
        });
        // Set the main clone table
        setGCCloneTableData(tableData);
        const tableMetaData = await gameChangerAPI.getCloneTableData();
        
        const booleanFields = [];
        const stringFields = [];
        const jsonFields = [];
        
        tableMetaData.data[0].forEach(meta => {
            if (meta.column_name !== 'createdAt' && meta.column_name !== 'updatedAt' && meta.column_name !== 'id') {
                let i, frags = meta.column_name.split('_');
                for (i=0; i<frags.length; i++) {
                    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
                }
                const display_name = frags.join(' ');
                switch (meta.data_type) {
                    case 'integer':
                        stringFields.push({key: meta.column_name, display_name});
                        break;
                    case 'boolean':
                        booleanFields.push({key: meta.column_name, display_name});
                        break;
                    case 'jsonb':
                        jsonFields.push({key: meta.column_name, display_name});
                        break;
                    case 'character varying':
                    default:
                        stringFields.push({key: meta.column_name, display_name});
                        break;
                }
            }
        });
        // Set the metadata
        setCloneTableMetaData({stringFields, booleanFields, jsonFields})
    }
    const deleteCloneData = async (id) => {
		await gameChangerAPI.deleteCloneData(id);
	}
    useEffect(()=>{
        getCloneData();
        // eslint-disable-next-line
    },[]);
    
    // The table columns
    const columns = [
        {
            Header: 'Name',
            accessor: 'display_name',
            Cell: row => (
                <TableRow>{row.value}</TableRow>
            )
        },
        {
            Header: 'Url',
            accessor: 'url',
            Cell: row => (
                <TableRow><a href={`#/${row.value}`}>{`#/${row.value}`}</a></TableRow>
            )
        },
        {
            Header: 'Live',
            accessor: 'is_live',
            width: 200,
            Cell: row => (
                <TableRow>
                    <UOTToggleSwitch
                         leftLabel={'Off'}
                         rightLabel={'Live'}
                         rightActive={row.value}
                         onClick={ () => {
                             if (!row.row._original.can_edit) return;
                             const filteredClones = _.filter(gcCloneTableData, clone => {
                                return clone.id ===  row.row.id;
                            });

                            const cloneEdit = {...filteredClones[0]};

                            cloneEdit.is_live = !row.value;
                             trackEvent('GAMECHANGER_Admin', "ToggleCloneIsLive", cloneEdit.name, cloneEdit.is_live ? 1 : 0);
                             storeCloneData(cloneEdit);
                        }}
                         customColor={'#E9691D'}
                     />
                </TableRow>
            )
        },
        {
            Header: ' ',
            accessor: 'id',
            width: 150,
            Cell: row => (
                <TableRow>
                    {row.row._original.can_edit &&
                        <GCButton
                            onClick={() => {
                                trackEvent('GAMECHANGER_Admin', "EditClone", "onClick", row.value);
                                openCloneModal(row.value);
                            }}
                            style={{minWidth: 'unset'}}
                        >Edit</GCButton>
                    }
                </TableRow>
            )
        },
        {
            Header: ' ',
            accessor: 'id',
            width: 150,
            Cell: row => (
                <TableRow>
                    {row.row._original.can_edit &&
                        <GCButton
                            onClick={() => {
                                trackEvent('GAMECHANGER_Admin', "DeleteClone", "onClick", row.value);
                                deleteCloneData(row.value).then(() => {
                                    getCloneData();
                                });
                            }}
                            style={{minWidth: 'unset', backgroundColor: 'red', borderColor: 'red'}}
                        >Delete</GCButton>
                    }
                </TableRow>
            )
        }
    ];

    return (
        <>
            <div>
                <div style={{display: 'flex', justifyContent: 'space-between', margin: '10px 80px'}}>
                    <p style={{...styles.sectionHeader, marginLeft: 0, marginTop: 10}}>Gamechanger Clones</p>
                    <GCButton
                        onClick={() => {
                            trackEvent('GAMECHANGER_Admin', "CreateClone", "onClick");
                            openCloneModal()
                        }}
                        style={{minWidth: 'unset'}}
                    >Create Clone</GCButton>
                </div>

                <ReactTable
                    data={gcCloneTableData}
                    columns={columns}
                    style={{margin: '0 80px 20px 80px', height: 700}}
                    pageSize={10}
                />
            </div>
            <CloneModal 
                storeCloneData = {storeCloneData}
                cloneToEdit = {cloneToEdit}
                defaultModuleGivenKey={defaultModuleGivenKey}
                cloneTableMetaData = {cloneTableMetaData}
                showCreateEditCloneModal={showCreateEditCloneModal}
                setShowCreateEditCloneModal={setShowCreateEditCloneModal}
            />
        </>
    )
}