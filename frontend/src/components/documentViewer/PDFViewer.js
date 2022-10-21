import React, { useCallback, useEffect } from 'react';
import GameChangerAPI from '../api/gameChanger-service-api';
import { encode, handlePdfOnLoad } from '../../utils/gamechangerUtils';
import { ContactSupportOutlined } from '@material-ui/icons';

const gameChangerAPI = new GameChangerAPI();

function useQuery(location) {
	console.log('Do I hit this??', location.search);
	return new URLSearchParams(location.search);
}

export default function PDFViewer({ location }) {
	const [filename, setFilename] = React.useState(null);
	const [prevSearchText, setPrevSearchText] = React.useState(null);
	const [pageNumber, setPageNumber] = React.useState(null);
	const [isClone, setIsClone] = React.useState(false);
	const [cloneIndex, setCloneIndex] = React.useState(null);
	const [fileUrl, setFileUrl] = React.useState(null);

	let query = useQuery(location);
	console.log('here is query', query);
	console.log('here is the cloneIndex', cloneIndex);
	console.log('here is the fileUrl', fileUrl);
	console.log('here is the filename', filename);
	console.log('here is isClone', isClone);

	const measuredRef = useCallback(
		(node) => {
			if (node !== null && filename) {
				gameChangerAPI.getCloneMeta({ cloneName: cloneIndex }).then((data) => {
					console.log('Am i hitting this data', data);
					console.log('is my filURL being updated???', fileUrl);
					let isDLA = false;
					if (fileUrl?.split('.').includes('dla')) isDLA = true;
					if (filename) {
						const encoded = encode(filename);
						console.log('What is encoded', encoded);
						gameChangerAPI
							.dataStorageDownloadGET(encoded, prevSearchText, pageNumber, isClone, data.data, isDLA)
							.then((url) => {
								console.log('here is the url', url);
								node.src = url;
							})
							.catch((err) => {
								console.error('YOU HAVE FAILED', err);
							});
					}
				});
			}
		},
		[filename, prevSearchText, isClone, cloneIndex, pageNumber, fileUrl]
	);

	useEffect(() => {
		setFilename(query.get('filename'));
		setPrevSearchText(query.get('prevSearchText'));
		setPageNumber(query.get('pageNumber'));
		if (query.get('cloneIndex') !== 'gamechanger') {
			setIsClone(true);
		}
		setFileUrl(query.get('sourceURL'));
		setCloneIndex(query.get('cloneIndex'));
	}, [query, filename]);

	useEffect(() => {
		if (isClone) {
			document.title = `ADVANA | ${cloneIndex.toUpperCase()} SEARCH`;
		}
	}, [isClone, cloneIndex]);

	return (
		<iframe
			title={'PDFViewer'}
			className="aref"
			id={'pdfViewer'}
			ref={measuredRef}
			onLoad={() =>
				handlePdfOnLoad('pdfViewer', 'viewerContainer', filename, 'PDF Viewer', cloneIndex, gameChangerAPI)
			}
			style={{ width: '100%', height: '100%' }}
		/>
	);
}
