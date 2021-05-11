import React, {useCallback, useEffect} from 'react';
import GameChangerAPI from "../api/gameChanger-service-api";
import {handlePdfOnLoad} from "../../gamechangerUtils";

const gameChangerAPI = new GameChangerAPI()

function useQuery(location) {
  return new URLSearchParams(location.search);
}

export default function PDFViewer({location}) {

	const [filename, setFilename] = React.useState(null);
	const [prevSearchText, setPrevSearchText] = React.useState(null);
	const [pageNumber, setPageNumber] = React.useState(null);
	const [isClone, setIsClone] = React.useState(false);
	const [cloneIndex, setCloneIndex] = React.useState(null);

	let query = useQuery(location);

	const measuredRef = useCallback(node => {
		if (node !== null && filename) {
			const cloneData = {
				clone_name: cloneIndex
			}
			
			if (filename) {
				gameChangerAPI.dataStorageDownloadGET(filename, prevSearchText, pageNumber, isClone, cloneData).then(url => {
					node.src = url;
				});
			}
		}
	}, [filename, prevSearchText, isClone, cloneIndex, pageNumber]);

	useEffect(() => {
		setFilename(query.get('filename'));
		setPrevSearchText(query.get('prevSearchText'));
		setPageNumber(query.get('pageNumber'));
		setIsClone(true);
		setCloneIndex(query.get('cloneIndex'));
	}, [query, filename]);

	return (
		<iframe title={'PDFViewer'} className="aref" id={'pdfViewer'} ref={measuredRef} onLoad={() => handlePdfOnLoad('pdfViewer', 'viewerContainer', filename, 'PDF Viewer')} style={{width: "100%", height: "100%"}} />
	);

}
