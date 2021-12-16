import React, { useEffect } from 'react'
import {
	PdfLoader,
	PdfHighlighter,
	Highlight,
	Popup,
	AreaHighlight,
} from 'react-pdf-highlighter';
import Tip from './Tip';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';

export default function PDFHighlighter({ 
	highlights,
	scrollId,
	handleSave,
	saveActive,
	documentLink
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
		return highlights.find((highlight) => `${highlight.id}` === id);
	}

	return (
		<PdfLoader url={documentLink} beforeLoad={<LoadingIndicator customColor={'#E9691D'} />}>
			{(pdfDocument) => (
				<PdfHighlighter
					pdfDocument={pdfDocument}
					enableAreaSelection={(event) => event.altKey}
					onScrollChange={() => {}}
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
						return (
							<>
								{saveActive && <Tip
									onOpen={transformSelection}
									onConfirm={() => {
										handleSave(content.text.trim(), position);
										hideTipAndSelection();
									}}
								/>}
							</>
						)
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
