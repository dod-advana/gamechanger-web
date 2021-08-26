import React, {useState, useEffect, useContext} from 'react';
import styled from 'styled-components';
import SearchBar from "../components/searchBar/SearchBar";
import {getContext} from "../components/factories/contextFactory";
import GCAccordion from "../components/common/GCAccordion";
import { PieChart, Pie, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
import { TextField, Typography } from '@material-ui/core';
import SimpleTable from "../components/common/SimpleTable";

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

const StyledContainer = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
`;

const StyledLeftContainer = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 20px 10px 20px 25px;
`;

const StyledMainContainer = styled.div`
    display: flex;
    flex: 2;
    flex-direction: column;
    padding: 20px;
`;

const StyledRightContainer = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 20px;
`;

const StyledAccordionDiv = styled.div`
    padding: ${({ padding }) => padding ?? '0'}
`;

const StyledAIText = styled.div`
    padding: 10px 30px;
`;

const StyledReviewContainer = styled.div`
    display: flex;
`;

const StyledReviewLeftContainer = styled.div`
    display: flex;
    flex: 3;
    flex-direction: column;
    padding: 20px;
`;

const StyledReviewRightContainer = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 20px;
`;

const StyledAccomplishments = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: left;
`;

const StyledAccordionContainer = styled.div`
    width: 100%;
    margin: 0 0 15px 0;
`;

const samplePieData = [
    {
        "type": "AI-Enabled",
        "value": 54,
        "color": "#1C2D64"
    },
    {
        "type": "AI-Enabling",
        "value": 30,
        "color": "#59C5CA"
    },
    {
        "type": "Core-AI",
        "value": 26,
        "color": "#7CB458"
    }
];

const sampleMetadata = [
    {
        Key: 'Program POC',
        Value: 'First Name, Last Name, Position, Agency',
    },
    {
        Key: 'Project',
        Value: '000000',
    },
    {
        Key: 'Program POC',
        Value: 'First Name, Last Name, Position, Agency',
    },
    {
        Key: 'Program POC',
        Value: 'First Name, Last Name, Position, Agency',
    },
    {
        Key: 'Program POC',
        Value: 'First Name, Last Name, Position, Agency',
    },
    {
        Key: 'Program POC',
        Value: 'First Name, Last Name, Position, Agency',
    },
    {
        Key: 'Program POC',
        Value: 'First Name, Last Name, Position, Agency',
    },
    {
        Key: 'Program POC',
        Value: 'First Name, Last Name, Position, Agency',
    },
    {
        Key: 'Program POC',
        Value: 'First Name, Last Name, Position, Agency',
    },
    {
        Key: 'Program POC',
        Value: 'First Name, Last Name, Position, Agency',
    },
    {
        Key: 'Program POC',
        Value: 'First Name, Last Name, Position, Agency',
    },
    {
        Key: 'Program POC',
        Value: 'First Name, Last Name, Position, Agency',
    },
    {
        Key: 'Program POC',
        Value: 'First Name, Last Name, Position, Agency',
    }
];

const sampleAccomplishmentData = [
    {
        Key: 'Description',
        Value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra blandit est, hendrerit luctus tortor sollicitudin ut. Donec vulputate quam in elit hendrerit, vitae iaculis est tristique. Sed condimentum enim at enim venenatis, non suscipit urna lobortis. Sed quis risus vulputate, porta orci eget, cursus sem. Mauris non sodales nunc.'
    },
    {
        Key: 'Budget',
        Value: '00,000 $M'
    }
];

const renderAICategory = () => {

    return (
        <StyledAccordionDiv>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart width={300} height={300}>
                    <Pie
                        innerRadius={60}
                        outerRadius={80}
                        data={samplePieData}
                        cx="50%"
                        cy="50%"
                        dataKey="value"
                        nameKey="type"
                        label
                    >
                        <text x={"50%"} y={"50%"} dy={8} textAnchor="middle">
                            76$M
                        </text>
                        {
                            samplePieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={samplePieData[index].color}/>
                            ))
                        }
                    </Pie>
                    <Legend />
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            <hr style={{margin: '10px auto', width: '85%'}}/>
            <StyledAIText>
                <p align="left">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra blandit est, hendrerit luctus tortor sollicitudin ut. Donec vulputate quam in elit hendrerit, vitae iaculis est tristique. Sed condimentum enim at enim venenatis, non suscipit urna lobortis. Sed quis risus vulputate, porta orci eget, cursus sem. Mauris non sodales nunc.
                </p>
            </StyledAIText>

        </StyledAccordionDiv>
    );
}

const renderUserSummaryInput = () => {
    return (
        <StyledAccordionDiv padding="15px">
            <TextField
                placeholder="AI Summary from User"
                variant="outlined"
                defaultValue={''}
                style={{ backgroundColor: 'white', width: '100%' }}
                onBlur={() => {}}
                inputProps={{
                    style: {
                        width: '100%'
                    }
                }}
                rows={10}
                multiline
            />
        </StyledAccordionDiv>
    );
}

const renderClassifier = () => {
    return (
        <StyledAccordionDiv>

        </StyledAccordionDiv>
    )
}

const renderOtherProjects = () => {
    return (
        <StyledAccordionDiv>

        </StyledAccordionDiv>
    )
}

const renderAccomplishments = () => {
    return (
        <StyledAccomplishments>
            <SimpleTable tableClass={'magellan-table'}
                zoom={1}
                rows={sampleAccomplishmentData}
                height={'auto'}
                dontScroll={true}
                disableWrap={true}
                title={'Accomplishment Name/Title'}
                hideHeader={true}
                headerExtraStyle={{
                    backgroundColor: '#1C2D64',
                    color: 'white'
                }}
            />
            <SimpleTable tableClass={'magellan-table'}
                zoom={1}
                rows={sampleAccomplishmentData}
                height={'auto'}
                dontScroll={true}
                disableWrap={true}
                title={'Accomplishment Name/Title'}
                hideHeader={true}
                headerExtraStyle={{
                    backgroundColor: '#1C2D64',
                    color: 'white'
                }}
            />
            <SimpleTable tableClass={'magellan-table'}
                zoom={1}
                rows={sampleAccomplishmentData}
                height={'auto'}
                dontScroll={true}
                disableWrap={true}
                title={'Accomplishment Name/Title'}
                hideHeader={true}
                headerExtraStyle={{
                    backgroundColor: '#1C2D64',
                    color: 'white'
                }}
            />
            <SimpleTable tableClass={'magellan-table'}
                zoom={1}
                rows={sampleAccomplishmentData}
                height={'auto'}
                dontScroll={true}
                disableWrap={true}
                title={'Accomplishment Name/Title'}
                hideHeader={true}
                headerExtraStyle={{
                    backgroundColor: '#1C2D64',
                    color: 'white'
                }}
            />
        </StyledAccomplishments>
    );
}

const BudgetSearchProfilePage = (props) => {

    const [currentNav, setCurrentNav] = useState('The Basics');
	const context = useContext(getContext('budgetSearch'));

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
            <StyledContainer>
                <StyledLeftContainer>
                    <StyledAccordionContainer>
                        <GCAccordion contentPadding={0} expanded={true} header={'AI Category'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
                            {renderAICategory()}
                        </GCAccordion>
                    </StyledAccordionContainer>
                    <StyledAccordionContainer>
                        <GCAccordion contentPadding={0} expanded={false} header={'Classifier'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'} style={{ width: '100%' }}>
                            {renderClassifier()}
                        </GCAccordion>
                    </StyledAccordionContainer>
                    <StyledAccordionContainer>
                        <GCAccordion contentPadding={0} expanded={true} header={'User Summary on AI'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
                            {renderUserSummaryInput()}
                        </GCAccordion>
                    </StyledAccordionContainer>
                    <StyledAccordionContainer>
                        <GCAccordion contentPadding={0} expanded={true} header={'Other Projects'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
                            {renderOtherProjects()}
                        </GCAccordion>
                    </StyledAccordionContainer>
                </StyledLeftContainer>
                <StyledMainContainer>
                    <Typography variant="h2" style={{ width: '100%', margin: '0 0 15px 0', fontWeight: 'bold' }}>187 0904759A Major T&E Investment</Typography>
                    <Typography variant="subtitle1" style={{ fontSize: '16px' }}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra blandit est, hendrerit luctus tortor sollicitudin ut. Donec vulputate quam in elit hendrerit, vitae iaculis est tristique. Sed condimentum enim at enim venenatis, non suscipit urna lobortis. Sed quis risus vulputate, porta orci eget, cursus sem. Mauris non sodales nunc.
                    </Typography>
                    <Typography variant="subtitle1" style={{ fontSize: '16px' }}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra blandit est, hendrerit luctus tortor sollicitudin ut. Donec vulputate quam in elit hendrerit, vitae iaculis est tristique. Sed condimentum enim at enim venenatis, non suscipit urna lobortis. Sed quis risus vulputate, porta orci eget, cursus sem. Mauris non sodales nunc.
                    </Typography>
                    <Typography variant="subtitle1" style={{ fontSize: '16px' }}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra blandit est, hendrerit luctus tortor sollicitudin ut. Donec vulputate quam in elit hendrerit, vitae iaculis est tristique. Sed condimentum enim at enim venenatis, non suscipit urna lobortis. Sed quis risus vulputate, porta orci eget, cursus sem. Mauris non sodales nunc.
                    </Typography>
                    <Typography variant="subtitle1" style={{ fontSize: '16px' }}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra blandit est, hendrerit luctus tortor sollicitudin ut. Donec vulputate quam in elit hendrerit, vitae iaculis est tristique. Sed condimentum enim at enim venenatis, non suscipit urna lobortis. Sed quis risus vulputate, porta orci eget, cursus sem. Mauris non sodales nunc.
                    </Typography>
                    <Typography variant="subtitle1" style={{ fontSize: '16px' }}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra blandit est, hendrerit luctus tortor sollicitudin ut. Donec vulputate quam in elit hendrerit, vitae iaculis est tristique. Sed condimentum enim at enim venenatis, non suscipit urna lobortis. Sed quis risus vulputate, porta orci eget, cursus sem. Mauris non sodales nunc.
                    </Typography>
                </StyledMainContainer>
                <StyledRightContainer>
                <SimpleTable tableClass={'magellan-table'}
                    zoom={1}
                    rows={sampleMetadata}
                    height={'auto'}
                    dontScroll={true}
                    disableWrap={true}
                    title={'Metadata'}
                    headerExtraStyle={{
                        backgroundColor: '#313541',
                        color: 'white'
                    }}
                />
                </StyledRightContainer>
            </StyledContainer>
            <StyledReviewContainer>
                <StyledReviewLeftContainer>
                    <StyledAccordionContainer>
                        <GCAccordion contentPadding={0} expanded={true} header={'ACCOMPLISHMENTS (#)'} headerBackground={'rgb(238,241,242)'} headerTextColor={'black'} headerTextWeight={'normal'}>
                            {renderAccomplishments()}
                        </GCAccordion>
                    </StyledAccordionContainer>
                </StyledReviewLeftContainer>
                <StyledReviewRightContainer>

                </StyledReviewRightContainer>
            </StyledReviewContainer>
        </div>
    )
}

export default BudgetSearchProfilePage;