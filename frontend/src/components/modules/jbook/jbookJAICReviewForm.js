import React, { useContext } from 'react';
import styled from 'styled-components';
import SimpleTable from '../../common/SimpleTable';
import { JBookContext } from './jbookContext';
import {
	ReviewersValue,
	CoreAIAnalysisKey,
	CoreAIAnalysisValue,
	ServiceComponentReviewerValue,
	PlannedTransitionPartnerKey,
	PlannedTransitionPartnerValue,
	CurrentMissionPartnersValue,
	ReviewStatus,
	ButtonFooter,
} from './jbookJAICHelper';

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
};

const boldKeys = (data) => {
	return data.map((pair) => {
		pair.Key = <strong>{pair.Key}</strong>;
		return pair;
	});
};

const JBookJAICReviewForm = React.memo((props) => {
	const { submitReviewForm, dropdownData, setReviewData, reviewStatus, finished, renderReenableModal, roleDisabled } =
		props;

	const context = useContext(JBookContext);
	const { state, dispatch } = context;
	const { reviewData, primaryReviewLoading } = state;

	const getPrimaryReviewData = () => {
		const primaryReviewData = [
			{
				// this is a column in pdoc/rdoc, but not review
				Key: 'Reviewers',
				Value: (
					<ReviewersValue
						primaryReviewer={reviewData.primaryReviewer}
						finished={finished}
						dropdownData={dropdownData}
						setReviewData={setReviewData}
					/>
				),
			},
			{
				Key: <CoreAIAnalysisKey />,
				Value: (
					<CoreAIAnalysisValue
						dropdownData={dropdownData}
						setReviewData={setReviewData}
						primaryClassLabel={reviewData.primaryClassLabel}
						finished={finished}
					/>
				),
			},
			{
				Key: 'Service/DoD Component Reviewer',
				Value: (
					<ServiceComponentReviewerValue
						serviceReviewer={reviewData.serviceReviewer}
						finished={finished}
						dropdownData={dropdownData}
						setReviewData={setReviewData}
					/>
				),
			},
			{
				Key: <PlannedTransitionPartnerKey />,
				Value: (
					<PlannedTransitionPartnerValue
						dropdownData={dropdownData}
						setReviewData={setReviewData}
						primaryPlannedTransitionPartner={reviewData.primaryPlannedTransitionPartner}
						finished={finished}
					/>
				),
			},
			{
				Key: 'Current Mission Partners (Academia, Industry, or Other)',
				Value: (
					<CurrentMissionPartnersValue
						dropdownData={dropdownData}
						setReviewData={setReviewData}
						serviceAdditionalMissionPartners={reviewData.serviceAdditionalMissionPartners}
						finished={finished}
						primaryReviewNotes={reviewData.primaryReviewNotes}
					/>
				),
			},
		];
		return primaryReviewData;
	};

	return (
		<StyledTableContainer>
			{renderReenableModal('JAIC')}

			<ReviewStatus reviewStatus={reviewStatus} finished={finished} />

			<SimpleTable
				tableClass={'magellan-table'}
				zoom={1}
				rows={boldKeys(getPrimaryReviewData())}
				height={'auto'}
				dontScroll={true}
				disableWrap={true}
				title={''}
				headerExtraStyle={{
					backgroundColor: '#313541',
					color: 'white',
				}}
				hideHeader={true}
				firstColWidth={firstColWidth}
			/>

			<ButtonFooter
				finished={finished}
				roleDisabled={roleDisabled}
				dispatch={dispatch}
				setReviewData={setReviewData}
				submitReviewForm={submitReviewForm}
				primaryReviewLoading={primaryReviewLoading}
			/>
		</StyledTableContainer>
	);
});

export default JBookJAICReviewForm;
