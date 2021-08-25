import React, {useState, useEffect} from 'react';
import styled from 'styled-components';

const StyledNavBar = styled.div`
	width: 100%;
	display: flex;
	height: 60px;
	background-color: #EFF2F6;
	align-items: center;
	justify-content: center;
`;

const StyledNavContainer = styled.div`
    width: 70%;
    display: flex;
    flex-direction: row;
`;

const StyledNavButton = styled.div`
    background-color: ${({selected}) => selected ? '#1C2D64' : ''};
    color: ${({selected}) => selected ? 'white' : '#8A9AAD'};
    padding: 0 12px 0;
    font-weight: 600;
    border-left: ${({ first }) => first ? '' : '2px solid white'}
    border-right: ${({ last }) => last ? '' : '2px solid white'}
    text-align: center;
`;


const BudgetSearchProfilePage = (props) => {

    const renderNavButtons = () => {
        const buttonNames = ['The Basics', 'Accomplishment', 'Contracts', 'JAIC Reviewer Section', 'Service / DoD Component Reviewer Section', 'POC Reviewer Section', 'Secondary Reviewer Section'];
        const navButtons = [];
        for (const name of buttonNames) {
            navButtons.push(
                <StyledNavButton>
                    {name}
                </StyledNavButton>
            );
        }

        return navButtons;
    }

    return (
        <div>
            <StyledNavBar>
                <StyledNavContainer>
                    {renderNavButtons()}
                </StyledNavContainer>
            </StyledNavBar>
        </div>
    )
}

export default BudgetSearchProfilePage;