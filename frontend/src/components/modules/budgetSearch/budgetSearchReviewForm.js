import React, {useState, useContext} from 'react';
import styled from 'styled-components';

import {getContext} from "../../factories/contextFactory";
import { TextField, Typography } from '@material-ui/core';
import SimpleTable from "../../common/SimpleTable";
import Autocomplete from '@material-ui/lab/Autocomplete';
import GCPrimaryButton from "../../common/GCButton";
import GameChangerAPI from "../../api/gameChanger-service-api";
const gameChangerAPI = new GameChangerAPI();

// import './budgetsearch.css';

const StyledTableContainer = styled.div`
    padding: 20px;
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: left;
`;

const firstColWidth = {
    maxWidth: 100,
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
}

const StyledFooterDiv = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
`;

const boldKeys = (data) => {
    return data.map(pair => {
        pair.Key = <strong>{pair.Key}</strong>;
        return pair
    });
}




// const renderServiceReviewer = () => {
//     return (
//     <StyledTableContainer>
//         <div style={{ margin: '0 0 15px 0'}}>
//             <Typography variant="subtitle1" style={{ color: 'green', fontSize: '18px', textAlign: 'right' }}>Finished Review</Typography>
//         </div>
//         <SimpleTable tableClass={'magellan-table'}
//             zoom={1}
//             rows={boldKeys(serviceReviewData)}
//             height={'auto'}
//             dontScroll={true}
//             disableWrap={true}
//             title={''}
//             headerExtraStyle={{
//                 backgroundColor: '#313541',
//                 color: 'white'
//             }}
//             hideHeader={true}
//             firstColWidth={firstColWidth}
//         />
//         <StyledFooterDiv>
//             <GCPrimaryButton
//                 style={{ color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0', height: '35px' }}
//             >
//                 Save (Partial Review)
//             </GCPrimaryButton>
//             <GCPrimaryButton
//                 style={{ color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0', height: '35px' }}
//             >
//                 Submit and Go to Home (Finished Review)
//             </GCPrimaryButton>
//             <GCPrimaryButton
//                 style={{ color: 'white', backgroundColor: '#1C2D64', borderColor: '#1C2D64', height: '35px' }}
//             >
//                 Submit
//             </GCPrimaryButton>
//         </StyledFooterDiv>
//     </StyledTableContainer>
//     );
// }

// const renderPOCReviewer = () => {
//     return (
//         <StyledTableContainer>
//             <SimpleTable tableClass={'magellan-table'}
//                 zoom={1}
//                 rows={boldKeys(pocReviewerData)}
//                 height={'auto'}
//                 dontScroll={true}
//                 disableWrap={true}
//                 title={''}
//                 headerExtraStyle={{
//                     backgroundColor: '#313541',
//                     color: 'white'
//                 }}
//                 hideHeader={true}
//                 firstColWidth={firstColWidth}
//             />
//         </StyledTableContainer>
//     );
// }

const BudgetSearchReviewForm = (props) =>{

	const { budget_type,
		program_element,
		budget_line_item,
		budget_year} = props;
	const context = useContext(getContext('budgetSearch'));

	const [rev_core_ai_label, setRev_core_ai_label] = useState(null);
	const [rev_review_stat, setRev_review_stat] = useState(null);
	const [rev_agree_label, setRev_agree_label] = useState(null);
	const [rev_trans_known, setRev_trans_known] = useState(null);
	const [rev_trans_type, setRev_trans_type] = useState(null);
	const [rev_ptp, setRev_ptp] = useState(null);//Transition Partner
	const [rev_mp_list, setRev_mp_list] = useState(null);//Mission Partner
	const [rev_mp_add, setRev_mp_add] = useState(null);

	const [secrev_agree_label, setSecrev_agree_label] = useState(null);
	const [secrev_notes, setSecrev_notes] = useState(null);
	const [secrev_review_stat, setSecrev_review_stat] = useState(null);
	const [poc_title, setPoc_title] = useState(null);
	const [poc_name, setPoc_name] = useState(null);
	const [poc_email, setPoc_email] = useState(null);
	const [review_notes, setReview_notes] = useState(null);
	

	const getJaicReviewData = () =>{

		const {reviewers, categories, serviceReviewers, reviewStatus} = context.state;
		const jaicReviewData = [
			{
				Key: 'Reviewers',
				Value: <Autocomplete
							size="small"
							options={reviewers}
							getOptionLabel={(option) => option}
							style={{ width: 300 }}
							renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
						/>
			},
			{
				Key: 'Core AI Analysis',
				Value: <Autocomplete
							size="small"
							options={categories}
							getOptionLabel={(option) => option}
							style={{ width: 300, backgroundColor: 'white' }}
							onChange={(event, value)=>{setRev_core_ai_label(value)}}
							renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
						/>
			},
			{
				Key: 'Service/DoD Component Reviewer',
				Value: <Autocomplete
							size="small"
							options={serviceReviewers}
							getOptionLabel={(option) => option}
							style={{ width: 300, backgroundColor: 'white' }}
							renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
						/>
			},
			{
				Key: 'Review Status',
				Value: <Autocomplete
							size="small"
							freeSolo={true}
							options={reviewStatus}
							getOptionLabel={(option) => option}
							style={{ width: 300, backgroundColor: 'white' }}
							onChange={(event, value)=>{setRev_review_stat(value)}}
							renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
						/>
			},
			{
				Key: 'Planned Transition Partner',
				Value: <Autocomplete
							size="small"
							freeSolo={true}
							options={[]}
							getOptionLabel={(option) => option.title}
							style={{ width: 300, backgroundColor: 'white' }}
							onChange={(event, value)=>{setRev_ptp(value)}}
							renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
						/>
			},
			{
				Key: 'Current Mission Partners (Academia, Industry, or Other)',
				Value: 
				<> 
					<Autocomplete
						size="small"
						options={[]}
						freeSolo={true}
						getOptionLabel={(option) => option.title}
						style={{ width: 300, backgroundColor: 'white' }}
						onChange={(event, value)=>{setRev_mp_add(value)}}
						renderInput={(params) => <TextField {...params} label="Select" variant="outlined" />}
					/>
					<TextField
						placeholder="Reviewer Notes"
						variant="outlined"
						defaultValue={''}
						style={{ backgroundColor: 'white', width: '100%', margin: '15px 0 0 0' }}
						onBlur={() => {}}
						inputProps={{
							style: {
								width: '100%'
							}
						}}
						rows={10}
						multiline
					/>
				</>
			}
		];
		return (jaicReviewData);
	}
	

	const submitStay = () =>{
		const reviewData = {
			budget_type: budget_type,
			program_element: program_element,
			budget_line_item: budget_line_item,
			rev_agree_label: rev_agree_label,
			rev_core_ai_label: rev_core_ai_label,
			rev_trans_known: rev_trans_known,
			rev_trans_type: rev_trans_type,
			rev_ptp: rev_ptp,
			rev_mp_list: rev_mp_list,
			rev_mp_add: rev_mp_add,
			rev_review_stat: rev_review_stat,
			secrev_agree_label: secrev_agree_label,
			secrev_notes: secrev_notes,
			secrev_review_stat:secrev_review_stat,
			poc_title: poc_title,
			poc_name: poc_name,
			poc_email: poc_email,
			review_notes: review_notes,
			budget_year: budget_year
		}
		gameChangerAPI.storeBudgetReview(reviewData);
	}

    return (
        <StyledTableContainer>
            <div style={{ margin: '0 0 15px 0'}}>
                <Typography variant="subtitle1" style={{ color: 'green', fontSize: '18px', textAlign: 'right' }}>{rev_review_stat}</Typography>
            </div>
            <SimpleTable tableClass={'magellan-table'}
                zoom={1}
                rows={boldKeys(getJaicReviewData())}
                height={'auto'}
                dontScroll={true}
                disableWrap={true}
                title={''}
                headerExtraStyle={{
                    backgroundColor: '#313541',
                    color: 'white'
                }}
                hideHeader={true}
                firstColWidth={firstColWidth}
            />
            <StyledFooterDiv>
                <GCPrimaryButton 
					style={{ color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0', height: '35px' }}
					onClick={submitStay}
                >
                    Submit and Go to Home
                </GCPrimaryButton>
                <GCPrimaryButton
                    style={{ color: 'white', backgroundColor: '#1C2D64', borderColor: '#1C2D64', height: '35px' }}
                >
                    Submit
                </GCPrimaryButton>
            </StyledFooterDiv>
        </StyledTableContainer>
    );
}


export default BudgetSearchReviewForm;
