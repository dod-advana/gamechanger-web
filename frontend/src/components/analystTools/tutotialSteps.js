const tutorialObject = {
	backButtonID: undefined,
	buttonID: undefined,
	clickBack: undefined,
	clickButton: undefined,
	content: undefined,
	disableBeacon: true,
	disableScrolling: true,
	input: undefined,
	inputID: undefined,
	inputText: undefined,
	placement: 'auto',
	target: undefined,
	testA: undefined,
	testB: undefined,
	title: undefined,
};

const reTutorialSteps = [
	{
		...tutorialObject,
		target: '.re-tutorial-step-1',
		title: 'Filter the Results',
		content:
			'Filters allow users to narrow down search results by either document title, entity, or responsibility text.',
		clickButton: true,
		buttonID: 'update-search',
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-2',
		title: 'Results',
		content:
			'The results section displays documents and responsibilities relevant to the selected filters. It is organized into a hierarchy of expandable sections with documents at the top level, followed by entities, and finally by responsibilities.',
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-3',
		title: 'Report Data Issue',
		content:
			'Machine learning models are used to extract responsibilities from documents. In case something was not extracted correctly, click here to report any issues with the data.',
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-4',
		title: 'Document Viewer',
		content:
			"The document for the currently selected responsibility can be viewed in the center of the screen. The selected responsiblity's text and corresponding entity will be highlighted in the document.",
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-5',
		title: 'Export Results',
		content: 'Export results to CSV by selecting the export icon.',
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-6',
		title: 'Change the View',
		content:
			'The view dropdown allows users to switch from the default "Document View" to a table format in the "Chart View"',
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-7',
		title: 'Chart View',
		content: "In the 'Chart View', results are displayed in a simplified table format.",
	},
];

const dctTutorialSteps = [
	{
		...tutorialObject,
		target: '.dct-tutorial-step-1',
		title: 'Paragraph Input',
		content:
			'Provide the body of text (up to 5 paragraphs) in the main text field, where it will be utilized to find similar documents.',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-2',
		title: 'Filter the Results',
		content:
			'Select filters to view only documents that meet specific criteria. Filters can also be updated after input is submitted.',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-3',
		title: 'Submit',
		content: 'Click submit to find documents with similarity to the paragraph inputs.',
		clickButton: true,
		buttonID: 'compare-button',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-4',
		title: 'Paragraph Input',
		content:
			"Continue to view the the text used for the query in the paragraph input pane.​ If more than one paragraph is entered in the query each paragraph will be assessed separately. Click on a different input to view it's results",
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-5',
		title: 'Combine Paragraph Input',
		content:
			'Paragraph inputs can be combined to re-compare as a whole paragraph. First, select paragraphs by click the check mark next to the inputs to combine. Then, press the combine button to merge the selected paragraphs and reinitiate the comparison search with the combined text.',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-6',
		title: 'Results',
		content: 'View results from the similar document query below the paragraph input section.',
		placement: 'left-start',
		clickButton: true,
		buttonID: 'first-dct-result',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-7',
		title: 'Select a Document',
		content:
			'Select a document from the results to display the section of the document that is  similar to your query text. In addition, view the page number it was found on and its’ similarity score. The results of the document can also be exported here, or the document can be saved to favorites.',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-8',
		title: 'Document',
		content: 'View the PDF of the selected document result in the middle display.',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-9',
		title: 'Sort',
		content: 'Sort results by selecting and option from the drop-down menu.',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-10',
		title: 'Export',
		content: 'Export the results of the search by selecting the orange export icon',
	},
];

export { reTutorialSteps, dctTutorialSteps };
