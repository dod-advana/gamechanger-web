import React, { useState, useEffect } from 'react'
import {
	PdfLoader,
	PdfHighlighter,
	Highlight,
	Popup,
	AreaHighlight,
} from 'react-pdf-highlighter';
import GameChangerAPI from '../api/gameChanger-service-api';
import Tip from './Tip';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';

const gameChangerAPI = new GameChangerAPI();

export default function PDFHighlighter({ 
	selectedResponsibility, 
	setIsEditingEntity, 
	isEditingEntity, 
	isEditingResp, 
	setIsEditingResp, 
	onConfirmSubmit,
	highlights,
	scrollId,
	setScrollId,
	setReloadResponsibilities 
}) {
	useEffect(() => {
		scrollToHighlight();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[scrollId])

	const scrollToHighlight = () => {
		const highlight = getHighlightById(scrollId);

		if (highlight) {
			scrollViewerTo(highlight);
		}
	};

	let scrollViewerTo = (highlight) => {};

	const getHighlightById = (id) => {
		return highlights.find((highlight) => highlight.id === id);
	}

	const resetScroll = () => {
		setScrollId('');
	  };

	const updateResponsibility = (updatedResp, textPosition) => {
		const { id } = selectedResponsibility;
		let updatedColumn = '';
		if(isEditingResp){
			updatedColumn = 'responsibilityText';
		}else if(isEditingEntity){
			updatedColumn = 'organizationPersonnel';
		}
		gameChangerAPI.storeResponsibilityReportData({
			id, 
			issue_description: 'review',
			updatedColumn,
			updatedText: updatedResp,
			textPosition
		}).then(() => {
			setIsEditingEntity(false);
			setIsEditingResp(false);
			onConfirmSubmit(
				'Update Successful',
				'success',
				'Thank you for the help. Your update will now be reviewed before the responsiblity is updated.'
			);
		}).catch(() => {
			onConfirmSubmit(
				'Update error',
				'error',
				'There was an error sending your responsibility update. Please try againg later.'
			);
		})
	}

	return (
		<PdfLoader url={'https://arxiv.org/pdf/1708.08021.pdf'} beforeLoad={<LoadingIndicator customColor={'#E9691D'} />}>
			{(pdfDocument) => (
				<PdfHighlighter
					pdfDocument={pdfDocument}
					enableAreaSelection={(event) => event.altKey}
					onScrollChange={() => {
						// resetScroll();
					}}
					// pdfScaleValue="page-width"
					scrollRef={(scrollTo) => {
						scrollViewerTo = scrollTo;

						scrollToHighlight();
					}}
					onSelectionFinished={(
						position,
						content,
						hideTipAndSelection,
						transformSelection
					) => {
						return <Tip
							onOpen={transformSelection}
							onConfirm={() => {
								updateResponsibility(content.text.trim(), position);
								hideTipAndSelection();
							}}
						/>
					}}
					highlightTransform={(
						highlight,
						index,
						setTip,
						hideTip,
						viewportToScaled,
						screenshot,
						isScrolledTo
					) => {
						const isTextHighlight = !Boolean(
							highlight.content && highlight.content.image
						);

						const component = isTextHighlight ? (
							<Highlight
								isScrolledTo={isScrolledTo}
								position={highlight.position}
								comment={highlight.comment}
							/>
						) : (
							<AreaHighlight
								isScrolledTo={isScrolledTo}
								highlight={highlight}
								onChange={(boundingRect) => {
									this.updateHighlight(
										highlight.id,
										{ boundingRect: viewportToScaled(boundingRect) },
										{ image: screenshot(boundingRect) }
									);
								}}
							/>
						);

						return (
							<Popup
								popupContent={<></>}
								onMouseOver={(popupContent) =>
									setTip(highlight, (highlight) => popupContent)
								}
								onMouseOut={hideTip}
								key={index}
								children={component}
							/>
						);
					}}
					highlights={highlights}
				/>
			)}
		</PdfLoader>
	)
}
