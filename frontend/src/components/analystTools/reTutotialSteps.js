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
			'Filters allow you to narrow down your search by either document title, entity, or responsibility text.',
		disableScrolling: true,
		clickButton: true,
		buttonID: 'update-search',
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-2',
		title: 'Results',
		disableScrolling: true,
		content:
			'The results section displays documents and responsibilities relevant to your filters. It is organized into a hierarchy of expandable sections with documents at the top level, followed by entities, and then by responsibilities listed for the entity.',
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-3',
		title: 'Report Data Issue',
		disableScrolling: true,
		content:
			'Machine learning models are used to extract responsibilities from documents. In case something was not extracted correctly, you can click here to report the issue you see with this piece of data.',
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-4',
		title: 'Document Viewer',
		content:
			"The document for the currently selected responsibility can be viewed here. The selected responsiblity's text and corresponding entity will be highlight in the document.",
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-5',
		title: 'Export Results',
		content: 'Export the results of your search to CSV by selecting the orange export icon',
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-6',
		title: 'Change the View',
		content:
			"The view dropdown allows you to switch between viewing the results in the default 'Document View' and viewing the results in a table format in the 'Chart View'.",

		clickButton: true,
		buttonID: 'set-re-view',
	},
	{
		...tutorialObject,
		target: '.re-tutorial-step-7',
		title: 'Chart View',
		content: 'In the chart view, you can see results displayed in a simplified table format.',
	},
];

export { reTutorialSteps };
