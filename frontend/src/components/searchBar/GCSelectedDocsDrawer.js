
import React from 'react';
import styled from 'styled-components';
import { List, ListItem, Drawer, ListSubheader, Table, TableBody, TableRow, TableCell } from "@material-ui/core";
import { backgroundGreyDark } from '../../components/common/gc-colors';
import GCButton from '../common/GCButton';
import ExportIcon from '../../images/icon/Export.svg';


const SelectedDocumentList = styled(List)`
    width: 500px;
`;

const DrawerTitle = styled(ListItem)`
    flex-direction: column;
    align-items: baseline !important;
`;

const DrawerTable = styled(Table)`
    border: 1px solid ${backgroundGreyDark};
    margin: 0 16px;
    width: 93% !important;
`;

const DrawerTableRow = styled(TableRow)`
    background-color: ${({ index }) => index % 2 === 0 ? 'white' : 'transparent'};
`;

const ButtonRow = styled.div`
    display: flex;
    justify-content: flex-end;
    margin: 16px;
`;

const DrawerTableCell = styled(TableCell)`
    display: flex !important;
    justify-content: space-between !important;
`;

export const SelectedDocsDrawer = (props) => {
    const {
        selectedDocuments,
        docsDrawerOpen,
        setDrawer,
        clearSelections, 
        openExport,
        // removeSelection,
        componentStepNumbers,
        isDrawerReady,
        setDrawerReady,
        setShowTutorial,
        setStepIndex,
        showTutorial,
        rawSearchResults,
        checkUserInfo
    } = props;

    // const handleRemoveSelection = (key) => {
    //     removeSelection(key);

    //     if (selectedDocuments.size === 0) {
    //         setDrawer(false);
    //     }
    // }

    const renderSelectedDocuments = () => {
		const rowJSX = [];

        const sortedTitles = new Map ([...selectedDocuments.entries()].sort());

        let index = 0;
        
		sortedTitles.forEach((value, key) => {
			rowJSX.push(
				<DrawerTableRow key={key} hover={true} style={{ backgroundColor: index % 2 === 0 ? 'white' : 'transparent'}}>
					<DrawerTableCell>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            justifyContent: 'space-between'
                        }}>
                            <span style={{ fontSize: 16 }}>{value}</span>
                            {/* <i className="fa fa-times-circle fa-fw" style={{ cursor: 'pointer', height: 17 }} onClick={() => handleRemoveSelection(key)} /> */}
                        </div>
                    </DrawerTableCell>
				</DrawerTableRow>
            );
            index += 1;
		});
        
        if (!isDrawerReady) {
            setTimeout(() => {
                setDrawerReady(true);
                console.log('ready')
            }, 600);
        }
        
		return rowJSX;
    }

    const handleExportButtonClick = () => {
        if (checkUserInfo()) {
            return;
        }

        if (selectedDocuments.size === 0) {
            openExport();
        }
        else {
            setDrawer(true);
            setDrawerReady(false);
        }
    }
    
    return (
        <>
        	<GCButton
                id='gcOpenSelectedDocsDrawer'
                className={`tutorial-step-${componentStepNumbers["Open Selected Documents Drawer"]}`}
                onClick={() => handleExportButtonClick()}
                style={{minWidth: 0, padding: '0px 9px', margin: '16px 0px 0px 10px', height: 50}}
                disabled={!rawSearchResults || rawSearchResults.length <= 0 ? true : false}
            >
                Export
                <img src={ExportIcon} style={{ width: 15, opacity: !rawSearchResults || rawSearchResults.length <= 0 ? .6 : 1 }} alt="export"/>
        	</GCButton>

            <Drawer open={docsDrawerOpen} anchor='right' onClose={() => setDrawer(false)} PaperProps={{ style: { backgroundColor: 'rgb(244, 249, 255)'}, className: `tutorial-step-${componentStepNumbers['Selected Documents Drawer']}` }}>
                <SelectedDocumentList style={{ margin: '30px 0 0 0'}}>
                    <DrawerTitle component="div">
                        <span style={{ fontFamily: 'Montserrat', fontWeight: 650, fontSize: 18 }}>SELECTED DOCUMENTS</span>
                        <ListSubheader style={{fontSize: 14, padding: 0}}>Export the documents you have currently selected.</ListSubheader>
                    </DrawerTitle>
                    <DrawerTable size="small">
                        <TableBody>
                            {docsDrawerOpen && renderSelectedDocuments()}
                        </TableBody>
                    </DrawerTable>
                </SelectedDocumentList>
                <ButtonRow>
                    <GCButton
                        id='gcCloseSelectedDocs'
                        onClick={() => setDrawer(false)}
                        style={{ visibility: 'hidden' }}
                        buttonColor={'#8091A5'}
                    >
                        Close
                    </GCButton>
                    <GCButton
                        onClick={() => {
                                setDrawer(false);
                                clearSelections();
                                if (showTutorial) {
                                    setShowTutorial(false);
                                    setStepIndex(0);
                                }
                            }
                        }
                        buttonColor={'#8091A5'}
                    >
                        Clear
                    </GCButton>
                    <GCButton
                        onClick={() => {
                                setDrawer(false);
                                openExport();
                                if (showTutorial) {
                                    setShowTutorial(false);
                                    setStepIndex(0);
                                }
                            }
                        }
                        disabled={selectedDocuments.size === 0}
                        className={`tutorial-step-${componentStepNumbers['Export Selected Documents']}`}
                        id='gcExportSelectedDocs'
                    >
                        Export Selected
                    </GCButton>
                </ButtonRow>
            </Drawer>
        </>
    )
}
