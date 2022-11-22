const tutorialObject = {
	backButtonID: undefined,
	buttonID: undefined,
	clickBack: undefined,
	clickButton: undefined,
	content: undefined,
	disableBeacon: true,
	disableScrolling: undefined,
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
		disableScrolling: true,
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-2',
		title: 'Results',
		disableScrolling: true,
		content:
			'The results section displays documents and responsibilities relevant to the selected filters. It is organized into a hierarchy of expandable sections with documents at the top level, followed by entities, and finally by responsibilities.',
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-3',
		title: 'Report Data Issue',
		disableScrolling: true,
		content:
			'Machine learning models are used to extract responsibilities from documents. In case something was not extracted correctly, click here to report any issues with the data.',
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-4',
		title: 'Document Viewer',
		disableScrolling: true,
		content:
			"The document for the currently selected responsibility can be viewed in the center of the screen. The selected responsiblity's text and corresponding entity will be highlighted in the document.",
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-5',
		title: 'Export Results',
		disableScrolling: true,
		content: 'Export results to CSV by selecting the export icon.',
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-6',
		title: 'Change the View',
		disableScrolling: true,
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

export { reTutorialSteps };
