import React from "react";
import GCAccordion from "../../common/GCAccordion";
import SimpleTable from "../../common/SimpleTable";
import {
    getColumnValue
} from "./edaUtils";

export const EDASidePanel = (props) => {
    const {
        searchResults
    } = props;

    const getContractData = () => {
        const agencyContracts = {};

        for (const result of searchResults) {
            const agency = result.metadata_type_eda_ext === 'pds' ? getColumnValue(result, 'address_eda_ext_n', 'org_name_eda_ext') : getColumnValue(result, '', '')

            if (agency) {
                if (agencyContracts[agency]) {
                    agencyContracts[agency] += 1;
                }
                else {
                    agencyContracts[agency] = 1;
                }
            }
        }

        const data = Object.keys(agencyContracts).map(agency => ({ "Key": agency, "Value": agencyContracts[agency]}));
        data.push({"Key": "Total Amount $", "Value": "Data Not Available"});
        data.sort((a, b) => (a.Value > b.Value) ? -1 : 1 )
        return data;
    }

    const renderStats = () => {
        return (
            <SimpleTable tableClass={'magellan-table'}
                zoom={1}
                // headerExtraStyle={{ backgroundColor: '#313541', color: 'white' }}
                rows={getContractData()}
                height={'auto'}
                dontScroll={true}
                // colWidth={colWidth}
                disableWrap={true}
                // title={'Metadata'}
                hideHeader={true}
            />
        );
    }

    return (
        <div>
			<div className={'filters-container sidebar-section-title'} style={{ marginBottom: 15 }}>STATISTICS</div>
            <GCAccordion contentPadding={0} expanded={false} header={'CONTRACTS PER AGENCY'} headerBackground={'rgb(56,63,64)'} headerTextColor={'white'} headerTextWeight={'normal'}>
                { renderStats() }
            </GCAccordion>
        </div>
    )
}

export default EDASidePanel;