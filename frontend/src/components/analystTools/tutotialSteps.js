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
			'Provide up to 5 paragraphs of text in the open text field—this can be draft policy, existing policy, or other documentation.',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-2',
		title: 'Submit',
		content: 'Click “submit” to find documents in the GAMECHANGER repository with similarity to your text inputs.',
		clickButton: true,
		buttonID: 'compare-button',
		placement: 'top',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-3',
		title: 'Filter Results',
		content: 'Apply filters to streamline results.',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-4',
		title: 'Paragraph Input',
		content:
			'View text inputs here. By default, individual paragraph inputs are assessed separately. Click on different paragraph inputs to view their respective results.',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-5',
		title: 'Combine Paragraph Input',
		content:
			'Paragraph inputs can be combined to be assessed as a whole. Combine paragraphs by selecting the check mark next to each paragraph. Click “combine” to merge the selected paragraphs and reinitiate the comparison search with combined text.',
		clickButton: true,
		buttonID: 'first-dct-result',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-6',
		title: 'Results',
		content: 'View document results below the paragraph input pane.',
		placement: 'left-start',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-7',
		title: 'Select a Document',
		content:
			'Select a document from the results panel to display the individual sections or paragraphs with text similarity. This view also displays the page number and similarity score of the similar text. Results of each document can be exported or the document can be saved to favorites from here.',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-8',
		title: 'Document',
		content:
			'View a PDF of the selected document result in the middle display. The tool automatically jumps to the relevant page for more convenient comparison review.',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-9',
		title: 'Sort',
		content:
			'Sort results by similarity score, alphabetically, or date published by selecting an option from the drop-down menu.',
	},
	{
		...tutorialObject,
		target: '.dct-tutorial-step-10',
		title: 'Export',
		content: 'Export the full results of the search by selecting the orange export icon.',
	},
];

export { reTutorialSteps, dctTutorialSteps };
