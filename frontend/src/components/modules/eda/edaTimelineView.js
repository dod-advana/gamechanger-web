import React, {useState, useEffect } from "react";
import ViewHeader from "../../mainView/ViewHeader";
import  {
    FormControl,
    FormGroup,
    FormControlLabel,
    Paper,
    
} from "@material-ui/core";
import {setState} from "../../../sharedFunctions";
import styled from "styled-components";

export const EDATimelineView = (props) => {
    const {
        context
    } = props;

    return (
        <div>
            <div className={'left-container'}>
                <div className={'filters-container sidebar-section-title'} style={{ marginBottom: 15 }}>CONTRACT AWARDS</div>
            </div>
            <div className={'right-container'}>
                <ViewHeader {...props} />
                <div className={'card-container'}>

                </div>
                RIGHT CONTAINER
            </div>
        </div>
    );
}

export default EDATimelineView;