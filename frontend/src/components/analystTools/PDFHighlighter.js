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
import testpdf from './zztest.pdf';

const gameChangerAPI = new GameChangerAPI();

export default function PDFHighlighter({ selectedResponsibility, setIsEditing }) {

	const highlights = [];

	let scrollViewerTo = (highlight) => {};

	const scrollToHighlightFromHash = () => {
		const highlight = getHighlightById(parseIdFromHash());

		if (highlight) {
			scrollViewerTo(highlight);
		}
	};

	const getHighlightById = (id) => {
		return highlights.find((highlight) => highlight.id === id);
	}

	const parseIdFromHash = () => document.location.hash.slice('#highlight-'.length);

	const updateResponsibility = (updatedResp) => {
		const { id } = selectedResponsibility;
		const updateProps = {
			responsibilityText: updatedResp
		}
		gameChangerAPI.updateResponsibility({id, updateProps}).then(() => {
			setIsEditing(false)
		});
	}

	return (
		<PdfLoader url={'https://arxiv.org/pdf/1708.08021.pdf'} beforeLoad={<LoadingIndicator customColor={'#E9691D'} />}>
			{(pdfDocument) => (
				<PdfHighlighter
					pdfDocument={pdfDocument}
					enableAreaSelection={(event) => event.altKey}
					onScrollChange={() => {
						document.location.hash = '';
											  }
					}
					// pdfScaleValue="page-width"
					scrollRef={(scrollTo) => {
						scrollViewerTo = scrollTo;

						scrollToHighlightFromHash();
					}}
					onSelectionFinished={(
						position,
						content,
						hideTipAndSelection,
						transformSelection
					) => (
						<Tip
							onOpen={transformSelection}
							onConfirm={() => {
								updateResponsibility(content.text);
								hideTipAndSelection();
							}}
						/>
					)}
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
