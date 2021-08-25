import React, {useState, useEffect, useContext} from 'react';
import styled from 'styled-components';
import SearchBar from "../components/searchBar/SearchBar";
import {getContext} from "../components/factories/contextFactory";

const StyledNavBar = styled.div`
	width: 100%;
	display: flex;
	height: 65px;
	background-color: #EFF2F6;
	align-items: center;
	justify-content: center;
`;

const StyledNavContainer = styled.div`
    width: 75%;
    display: flex;
    flex-direction: row;
    height: 97%;
`;

const StyledNavButton = styled.div`
    background-color: ${({selected}) => selected ? '#1C2D64' : ''};
    color: ${({selected}) => selected ? 'white' : '#8A9AAD'};
    padding: 5px 18px
    font-weight: 600;
    border-left: ${({ first }) => first ? '' : '2px solid white'}
    border-right: ${({ last }) => last ? '' : '2px solid white'}
    text-align: center;
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 13px;
`;


const BudgetSearchProfilePage = (props) => {

    const [currentNav, setCurrentNav] = useState('The Basics');
	const context = useContext(getContext('budgetSearch'));
    console.log(context);

    const renderNavButtons = () => {
        const buttonNames = ['The Basics', 'Accomplishment', 'Contracts', 'JAIC Reviewer Section', 'Service / DoD Component Reviewer Section', 'POC Reviewer Section', 'Secondary Reviewer Section'];
        const navButtons = [];
        buttonNames.forEach((name, index) => {
            navButtons.push(
                <StyledNavButton 
                    first={index === 0} 
                    last={index === navButtons.length - 1} 
                    selected={currentNav === name}
                    onClick={() => setCurrentNav(name)}
                >   
                    {name}
                </StyledNavButton>
            );
        })

        return navButtons;
    }

    return (
        <div>
            <SearchBar context={context}/>
            <StyledNavBar>
                <StyledNavContainer>
                    {renderNavButtons()}
                </StyledNavContainer>
            </StyledNavBar>
        </div>
    )
}

export default BudgetSearchProfilePage;