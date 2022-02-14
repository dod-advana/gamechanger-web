import React, { useContext } from 'react';
import { CircularProgress } from '@material-ui/core';
import SimpleTable from '../../common/SimpleTable';
import GCPrimaryButton from '../../common/GCButton';
import { StyledTableContainer, StyledFooterDiv } from './profilePage/profilePageStyles';
import { BudgetSearchContext } from './budgetSearchContext';
import './budgetsearch.css';
import { setState } from '../../../utils/sharedFunctions';
import { boldKeys, firstColWidth } from './profilePage/budgetSearchProfilePageHelper';
import {
	AltAIPOCKey,
	AltAIPOCValue,
	LabelingValidationKey,
	LabelingValidationValue,
	TransitionPartnerKey,
	TransitionPartnerValue,
	MissionPartnersKey,
	MissionPartnersValue,
	JCAKey,
	JCAValue,
	AIDomainKey,
	AIDomainValue,
	DataTypeKey,
	DataTypeValue,
	SliderKey,
	SliderValue,
	FooterValue
} from './budgetSearchPOCHelper';



const errorColor = '#F44336';

const BudgetSearchPOCReviewForm = React.memo((props) => {

	const {
		submitReviewForm,
		setReviewData,
		roleDisabled,
		finished,
		dropdownData,
		vendorData,
		renderReenableModal,
		totalBudget
	} = props;

	const context = useContext(BudgetSearchContext);
	const { state, dispatch } = context;
	const { pocValidated, primaryReviewLoading, reviewData, domainTasks } = state;

	const pocReviewerData = () => {
		const pocReviewerData = [
			{
				Key: <AltAIPOCKey />,
				Value:
					<AltAIPOCValue setReviewData={setReviewData} />
			},
			{
				Key: <LabelingValidationKey />,
				Value: <LabelingValidationValue setReviewData={setReviewData} dropdownData={dropdownData} />
			},
			{
				Key: <TransitionPartnerKey />,
				Value: <TransitionPartnerValue setReviewData={setReviewData} dropdownData={dropdownData} />
			},
			{
				Key: <MissionPartnersKey />,
				Value: <MissionPartnersValue setReviewData={setReviewData} vendorData={vendorData} />
			},
			{
				Key: <JCAKey />,
				Value: <JCAValue setReviewData={setReviewData} />
			},
			{
				Key: <AIDomainKey />,
				Value: <AIDomainValue setReviewData={setReviewData} domainTasks={domainTasks} />
			},
			{
				Key: <DataTypeKey />,
				Value: <DataTypeValue setReviewData={setReviewData} />
			}
		]

		let showSlider = true;

		if (reviewData.pocClassLabel && reviewData.pocClassLabel === 'Not AI') showSlider = false;
		else if (!reviewData.pocClassLabel && reviewData.serviceClassLabel && reviewData.serviceClassLabel === 'Not AI') showSlider = false
		else if (!reviewData.pocClassLabel && !reviewData.serviceClassLabel && reviewData.primaryClassLabel === 'Not AI') showSlider = false

		if (showSlider) {
			pocReviewerData.push({
				Key: <SliderKey />,
				Value: <SliderValue totalBudget={totalBudget} setReviewData={setReviewData} />
			});
		}

		pocReviewerData.push(
			{
				Key: <></>,
				Value: <FooterValue />
			}
		);

		return pocReviewerData;
	}

	return (
		<StyledTableContainer>
			{renderReenableModal('POC')}
			<SimpleTable tableClass={'magellan-table'}
				zoom={1}
				rows={boldKeys(pocReviewerData())}
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
				{!pocValidated && <span style={{ color: errorColor }}>Please fill out the highlighted fields</span>}
				{finished && !roleDisabled &&
					<GCPrimaryButton
						style={{ color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0', height: '35px' }}
						onClick={() => setState(dispatch, { POCModalOpen: true })}
					>
						Re-Enable (Partial Review)
					</GCPrimaryButton>
				}
				<GCPrimaryButton
					style={{ color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0', height: '35px' }}
					onClick={() => {
						setReviewData('pocForm');
					}}
					disabled={finished || roleDisabled}
				>
					{!primaryReviewLoading ?
						'Reset Form'
						:
						<CircularProgress color="#515151" size={25} style={{ margin: '3px' }} />
					}
				</GCPrimaryButton>
				<GCPrimaryButton
					style={{ color: '#515151', backgroundColor: '#E0E0E0', borderColor: '#E0E0E0', height: '35px' }}
					onClick={() => submitReviewForm('primaryReviewLoading', false, 'poc')}
					disabled={finished || roleDisabled}
				>
					{!primaryReviewLoading ?
						'Save (Partial Review)'
						:
						<CircularProgress color="#515151" size={25} style={{ margin: '3px' }} />
					}
				</GCPrimaryButton>
				<GCPrimaryButton
					style={{ color: 'white', backgroundColor: '#1C2D64', borderColor: '#1C2D64', height: '35px' }}
					onClick={() => submitReviewForm('primaryReviewLoading', true, 'poc')}
					disabled={finished || roleDisabled}
				>
					{!primaryReviewLoading ?
						'Submit (Finished Review)'
						:
						<CircularProgress color="#FFFFFF" size={25} style={{ margin: '3px' }} />
					}
				</GCPrimaryButton>
			</StyledFooterDiv>
		</StyledTableContainer>
	);
});


export default BudgetSearchPOCReviewForm;
