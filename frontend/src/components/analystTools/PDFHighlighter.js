import React, { useState } from 'react'
import {
	PdfLoader,
	PdfHighlighter,
	Tip,
	Highlight,
	Popup,
	AreaHighlight,
} from 'react-pdf-highlighter';
import LoadingIndicator from '@dod-advana/advana-platform-ui/dist/loading/LoadingIndicator';
import testpdf from './zztest.pdf';

export default function PDFHighlighter() {

	const [highlights, setHighlights] = useState([]);

	const getNextId = () => String(Math.random()).slice(2);

	const addHighlight = (highlight) => {
		setHighlights(
			[{ ...highlight, id: getNextId() }, ...highlights],
		);
	}

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
							onConfirm={(comment) => {
								addHighlight({ content, position, comment });

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
