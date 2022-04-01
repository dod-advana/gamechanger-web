import React, { useContext } from 'react';
import SimpleTable from '../../common/SimpleTable';
import { StyledTableContainer } from './profilePage/profilePageStyles';
import { JBookContext } from './jbookContext';
import {
	SecondaryReviewerKey,
	SecondaryReviewerValue,
	LabelingValidationKey,
	LabelingValidationValue,
	TransitionPartnersKey,
	TransitionPartnersValue,
	MissionPartnersKey,
	MissionPartnersValue,
	AIPOCKey,
	AIPOCValue,
	ReviewerNotesKey,
	ReviewerNotesValue,
	ServiceDescriptionText,
	boldKeys,
	firstColWidth,
	ReviewStatus,
	ButtonFooter,
} from './jbookServiceHelper';

const JBookServiceReviewForm = React.memo((props) => {
	const {
		setReviewData,
		dropdownData,
		submitReviewForm,
		reviewStatus,
		finished,
		renderReenableModal,
		roleDisabled,
		vendorData,
	} = props;

	const context = useContext(JBookContext);
	const { state, dispatch } = context;
	const { serviceValidated, serviceValidation, reviewData, primaryReviewLoading } = state;

	const serviceReviewData = [
		{
			Key: <SecondaryReviewerKey />,
			Value: (
				<SecondaryReviewerValue
					dropdownData={dropdownData}
					serviceSecondaryReviewer={reviewData.serviceSecondaryReviewer}
					setReviewData={setReviewData}
					finished={finished}
				/>
			),
		},
		{
			Key: <LabelingValidationKey />,
			Value: (
				<LabelingValidationValue
					serviceAgreeLabel={reviewData.serviceAgreeLabel}
					setReviewData={setReviewData}
					dropdownData={dropdownData}
					primaryClassLabel={reviewData.primaryClassLabel}
					serviceClassLabel={reviewData.serviceClassLabel}
					finished={finished}
					serviceValidated={serviceValidated}
					serviceValidation={serviceValidation}
				/>
			),
		},
		{
			Key: <TransitionPartnersKey />,
			Value: (
				<TransitionPartnersValue
					finished={finished}
					setReviewData={setReviewData}
					servicePTPAgreeLabel={reviewData.servicePTPAgreeLabel}
					dropdownData={dropdownData}
					servicePlannedTransitionPartner={reviewData.servicePlannedTransitionPartner}
					primaryPlannedTransitionPartner={reviewData.primaryPlannedTransitionPartner}
					serviceValidated={serviceValidated}
					serviceValidation={serviceValidation}
				/>
			),
		},
		{
			Key: <MissionPartnersKey />,
			Value: (
				<MissionPartnersValue
					setReviewData={setReviewData}
					vendorData={vendorData}
					finished={finished}
					serviceMissionPartners={reviewData.serviceMissionPartnersList}
					serviceMissionPartnersChecklist={reviewData.serviceMissionPartnersChecklist}
				/>
			),
		},
		{
			Key: <AIPOCKey />,
			Value: (
				<AIPOCValue
					setReviewData={setReviewData}
					finished={finished}
					serviceValidated={serviceValidated}
					serviceValidation={serviceValidation}
					servicePOCTitle={reviewData.servicePOCTitle}
					servicePOCName={reviewData.servicePOCName}
					servicePOCEmail={reviewData.servicePOCEmail}
					servicePOCOrg={reviewData.servicePOCOrg}
					servicePOCPhoneNumber={reviewData.servicePOCPhoneNumber}
				/>
			),
		},
		{
			Key: <ReviewerNotesKey />,
			Value: (
				<ReviewerNotesValue
					finished={finished}
					serviceReviewerNotes={reviewData.serviceReviewerNotes}
					setReviewData={setReviewData}
				/>
			),
		},
		{
			Key: <></>,
			Value: <ServiceDescriptionText />,
		},
	];

	return (
		<StyledTableContainer>
			{renderReenableModal('Service')}

			<ReviewStatus reviewStatus={reviewStatus} finished={finished} />

			<SimpleTable
				tableClass={'magellan-table'}
				zoom={1}
				rows={boldKeys(serviceReviewData)}
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
				serviceValidated={serviceValidated}
				finished={finished}
				roleDisabled={roleDisabled}
				setReviewData={setReviewData}
				primaryReviewLoading={primaryReviewLoading}
				submitReviewForm={submitReviewForm}
				dispatch={dispatch}
			/>
		</StyledTableContainer>
	);
});

export default JBookServiceReviewForm;
