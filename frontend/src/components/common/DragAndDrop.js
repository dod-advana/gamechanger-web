import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const StyledDropArea = styled.div`
	border: dashed 2px #b6c6d8;
	margin: 15px 0px;
	width: 100%;
	max-width: none;
	border-radius: 5px;
	background-color: white;
	text-align: center;
	height: 200px;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
`;

const StyledContainer = styled.div`
	width: 100%;
	cursor: pointer;
`;

// component for dragging and dropping files for upload/input
// text = the description that goes in the drag and drop
// acceptedFileTypes = list of string, expects the file MIME type
// handleFileDrop = function for handling when files are uploaded
const DragAndDrop = ({ text = '', acceptedFileTypes = null, handleFileDrop = () => {} }) => {
	// file validator function
	const validateFile = useCallback(
		(file) => {
			if (!acceptedFileTypes || acceptedFileTypes.includes(file.type)) {
				return null;
			} else {
				return {
					code: 'unaccepted-file-type',
					message: 'File type not accepted',
				};
			}
		},
		[acceptedFileTypes]
	);

	// create dropzone component props
	const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
		multiple: false,
		validator: validateFile,
		onDrop: handleFileDrop,
	});

	// console.log(acceptedFiles);

	return (
		<StyledContainer>
			<StyledDropArea {...getRootProps({ className: 'dropzone' })}>
				<input {...getInputProps()} />
				<UploadFileIcon style={{ height: 65, width: 65, color: '#121F44' }} />
				<p>{text}</p>
			</StyledDropArea>
		</StyledContainer>
	);
};

export default DragAndDrop;
