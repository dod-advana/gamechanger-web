import React from 'react';
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
const DragAndDrop = ({ text }) => {
	const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

	return (
		<StyledContainer>
			<StyledDropArea {...getRootProps({ className: 'dropzone' })}>
				<input {...getInputProps()} />
				<UploadFileIcon style={{ height: 65, width: 65, color: '#121F44' }} />
				<p>{text ?? 'Drag and drop a file here, or click to select a file'}</p>
			</StyledDropArea>
		</StyledContainer>
	);
};

export default DragAndDrop;
