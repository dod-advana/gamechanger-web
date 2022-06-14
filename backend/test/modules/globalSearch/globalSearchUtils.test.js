const assert = require('assert');
const rewire = require('rewire');
const globalSearchUtils = rewire('../../../node_app/modules/globalSearch/globalSearchUtils');

const processQlikApps = globalSearchUtils.__get__('processQlikApps');

globalSearchUtils.__set__({
	QLIK_EXCLUDE_CUST_PROP_NAME: 'excludeName',
	QLIK_EXCLUDE_CUST_PROP_VAL: 'boop',
	QLIK_BUSINESS_DOMAIN_PROP_NAME: 'businessDomain',
});

const APP_TO_BE_EXCLUDED = {
	id: '7ef0bc64-40bf-41ad-a046-c58a84504bf9',
	createdDate: '2021-01-13T18:49:44.861Z',
	modifiedDate: '2021-02-01T20:36:51.219Z',
	modifiedByUserName: 'RAUL ALFARO\\raul alfaro',
	customProperties: [
		{
			id: '3b6b4218-2f02-4b45-a4d3-f648af2c23e7',
			createdDate: '2021-01-15T17:51:16.789Z',
			modifiedDate: '2021-02-01T20:36:51.219Z',
			modifiedByUserName: 'RAUL ALFARO\\raul alfaro',
			value: 'boop',
			definition: {
				id: '5bdb404a-a45b-4732-8762-247b705cec00',
				name: 'excludeName',
				valueType: 'Text',
				choiceValues: ['test', 'apple', 'pen', 'pltr'],
				privileges: null,
			},
			schemaPath: 'CustomPropertyValue',
		},
		{
			id: '3b6b4218-2f02-4b45-a4d3-f648af2c23e7',
			createdDate: '2021-01-15T17:51:16.789Z',
			modifiedDate: '2021-02-01T20:36:51.219Z',
			modifiedByUserName: 'RAUL ALFARO\\raul alfaro',
			value: 'should not be in business domains',
			definition: {
				id: '5bdb404a-a45b-4732-8762-247b705cec00',
				name: 'businessDomain',
				valueType: 'Text',
				choiceValues: ['test', 'apple', 'pen', 'pltr'],
				privileges: null,
			},
			schemaPath: 'CustomPropertyValue',
		},
	],
	owner: {
		id: '4854e87f-465e-445e-95bf-988a95d045b0',
		userId: 'raul alfaro',
		userDirectory: 'RAUL ALFARO',
		name: 'raul alfaro',
		privileges: null,
	},
	name: 'will be excluded',
	appId: '',
	sourceAppId: '00000000-0000-0000-0000-000000000000',
	targetAppId: 'd8810ec3-986e-4e68-8bed-022cdb11b652',
	publishTime: '2021-01-13T18:59:46.338Z',
	published: true,
	tags: [],
	description:
		'This application has been developed from demo data taken from patient records, finance and operational healthcare systems. The app enables us to see physicians cost profiles and drill down to individual patient level and the resources which were used to treat those patients.  The behavior tab allows us to select individual procedures (by DRG) and see the cost and length of stay variation between clinicians.',
	stream: {
		id: 'fc83e5fd-02cc-416e-be35-1470209d7e3f',
		name: 'Qlik stream 1 - Will be Excluded',
		privileges: null,
	},
	fileSize: 3075944,
	lastReloadTime: '2015-09-23T19:23:57.000Z',
	thumbnail: '/appcontent/7ef0bc64-40bf-41ad-a046-c58a84504bf9/PatientCosting3.png',
	savedInProductVersion: '12.170.2',
	migrationHash: '98d482c3f964dccf69cbfb9a00e0c048ea6eb221',
	dynamicColor: '',
	availabilityStatus: 5,
	privileges: null,
	schemaPath: 'App',
};

const APP_WITH_BUSINESS_DOMAIN_ON_APP_AND_OTHER_CUSTOM_PROP_ON_STREAM = {
	id: '7ef0bc64-40bf-41ad-a046-c58a84504bf9',
	createdDate: '2021-01-13T18:49:44.861Z',
	modifiedDate: '2021-02-01T20:36:51.219Z',
	modifiedByUserName: 'RAUL ALFARO\\raul alfaro',
	customProperties: [
		{
			id: '3b6b4218-2f02-4b45-a4d3-f648af2c23e7',
			createdDate: '2021-01-15T17:51:16.789Z',
			modifiedDate: '2021-02-01T20:36:51.219Z',
			modifiedByUserName: 'RAUL ALFARO\\raul alfaro',
			value: "Business domain from app's custom prop",
			definition: {
				id: '5bdb404a-a45b-4732-8762-247b705cec00',
				name: 'businessDomain',
				valueType: 'Text',
				choiceValues: ['test', 'apple', 'pen', 'pltr'],
				privileges: null,
			},
			schemaPath: 'CustomPropertyValue',
		},
	],
	owner: {
		id: '4854e87f-465e-445e-95bf-988a95d045b0',
		userId: 'raul alfaro',
		userDirectory: 'RAUL ALFARO',
		name: 'raul alfaro',
		privileges: null,
	},
	name: 'Qlik app 2 - has business domain custom prop on app',
	appId: '',
	sourceAppId: '00000000-0000-0000-0000-000000000000',
	targetAppId: 'd8810ec3-986e-4e68-8bed-022cdb11b652',
	publishTime: '2021-01-13T18:59:46.338Z',
	published: true,
	tags: [],
	description:
		'This application has been developed from demo data taken from patient records, finance and operational healthcare systems. The app enables us to see physicians cost profiles and drill down to individual patient level and the resources which were used to treat those patients.  The behavior tab allows us to select individual procedures (by DRG) and see the cost and length of stay variation between clinicians.',
	stream: {
		id: 'a70ca8a5-1d59-4cc9-b5fa-6e207978dcaf',
		name: 'Monitoring apps',
		privileges: null,
	},
	fileSize: 3075944,
	lastReloadTime: '2015-09-23T19:23:57.000Z',
	thumbnail: '/appcontent/7ef0bc64-40bf-41ad-a046-c58a84504bf9/PatientCosting3.png',
	savedInProductVersion: '12.170.2',
	migrationHash: '98d482c3f964dccf69cbfb9a00e0c048ea6eb221',
	dynamicColor: '',
	availabilityStatus: 5,
	privileges: null,
	schemaPath: 'App',
};

const APP_WITH_OTHER_CUSTOM_PROP_ON_APP_AND_BUSINESS_DOMAIN_ON_STREAM = {
	id: '7ef0bc64-40bf-41ad-a046-c58a84504bf9',
	createdDate: '2021-01-13T18:49:44.861Z',
	modifiedDate: '2021-02-01T20:36:51.219Z',
	modifiedByUserName: 'RAUL ALFARO\\raul alfaro',
	customProperties: [
		{
			id: '3b6b4218-2f02-4b45-a4d3-f648af2c23e7',
			createdDate: '2021-01-15T17:51:16.789Z',
			modifiedDate: '2021-02-01T20:36:51.219Z',
			modifiedByUserName: 'RAUL ALFARO\\raul alfaro',
			value: 'test app custom prop 1',
			definition: {
				id: '5bdb404a-a45b-4732-8762-247b705cec00',
				name: 'defition name zddgwh,d - should not appear',
				valueType: 'Text',
				choiceValues: ['test', 'apple', 'pen', 'pltr'],
				privileges: null,
			},
			schemaPath: 'CustomPropertyValue',
		},
		{
			id: '3b6b4218-2f02-4b45-a4d3-f648af2c23e7',
			createdDate: '2021-01-15T17:51:16.789Z',
			modifiedDate: '2021-02-01T20:36:51.219Z',
			modifiedByUserName: 'RAUL ALFARO\\raul alfaro',
			value: 'test app custom prop 2',
			definition: {
				id: '5bdb404a-a45b-4732-8762-247b705cec00',
				name: 'defition name xdndnls - should not appear',
				valueType: 'Text',
				choiceValues: ['test', 'apple', 'pen', 'pltr'],
				privileges: null,
			},
			schemaPath: 'CustomPropertyValue',
		},
	],
	owner: {
		id: '4854e87f-465e-445e-95bf-988a95d045b0',
		userId: 'raul alfaro',
		userDirectory: 'RAUL ALFARO',
		name: 'raul alfaro',
		privileges: null,
	},
	name: 'Best City for You',
	appId: '',
	sourceAppId: '00000000-0000-0000-0000-000000000000',
	targetAppId: 'd8810ec3-986e-4e68-8bed-022cdb11b652',
	publishTime: '2021-01-13T18:59:46.338Z',
	published: true,
	tags: [],
	description:
		'This application has been developed from demo data taken from patient records, finance and operational healthcare systems. The app enables us to see physicians cost profiles and drill down to individual patient level and the resources which were used to treat those patients.  The behavior tab allows us to select individual procedures (by DRG) and see the cost and length of stay variation between clinicians.',
	stream: {
		id: 'aaec8d41-5201-43ab-809f-3063750dfafd',
		name: 'Qlik stream 3',
		privileges: null,
	},
	fileSize: 3075944,
	lastReloadTime: '2015-09-23T19:23:57.000Z',
	thumbnail: '/appcontent/7ef0bc64-40bf-41ad-a046-c58a84504bf9/PatientCosting3.png',
	savedInProductVersion: '12.170.2',
	migrationHash: '98d482c3f964dccf69cbfb9a00e0c048ea6eb221',
	dynamicColor: '',
	availabilityStatus: 5,
	privileges: null,
	schemaPath: 'App',
};

const STREAM_TO_BE_EXCLUDED = {
	id: 'fc83e5fd-02cc-416e-be35-1470209d7e3f',
	createdDate: '2021-07-26T16:58:07.527Z',
	modifiedDate: '2021-07-26T16:59:31.119Z',
	modifiedByUserName: 'YOUNG.KEVIN.1596615216\\young.kevin.1596615216',
	customProperties: [
		{
			id: '561e39b1-b966-46de-a410-3e24ab6c2ce5',
			createdDate: '2021-07-26T16:59:31.119Z',
			modifiedDate: '2021-07-26T16:59:31.119Z',
			modifiedByUserName: 'YOUNG.KEVIN.1596615216\\young.kevin.1596615216',
			value: 'first qlik stream - should not be included',
			definition: {
				id: 'b0eec1cc-f65a-4a91-bfd2-a0d20d9c035f',
				name: 'businessDomain',
				valueType: 'Text',
				choiceValues: ['Development', 'Production', 'jupiter - production'],
				privileges: null,
			},
			schemaPath: 'CustomPropertyValue',
		},
	],
	owner: {
		id: '60e598d5-2495-4c82-81c5-5eb3d1e49a3c',
		userId: 'young.kevin.1596615216',
		userDirectory: 'YOUNG.KEVIN.1596615216',
		name: 'young.kevin.1596615216',
		privileges: null,
	},
	name: 'Qlik stream 1 - Will be Excluded',
	tags: [],
	privileges: null,
	schemaPath: 'Stream',
};

const STREAM_WITH_OTHER_CUSTOM_PROP = {
	id: 'a70ca8a5-1d59-4cc9-b5fa-6e207978dcaf',
	createdDate: '2020-10-13T22:37:27.240Z',
	modifiedDate: '2021-01-13T18:26:26.738Z',
	modifiedByUserName: 'RAUL ALFARO\\raul alfaro',
	customProperties: [
		{
			id: '561e39b1-b966-46de-a410-3e24ab6c2ce5',
			createdDate: '2021-07-26T16:59:31.119Z',
			modifiedDate: '2021-07-26T16:59:31.119Z',
			modifiedByUserName: 'YOUNG.KEVIN.1596615216\\young.kevin.1596615216',
			value: '2nd qlik stream - should be included',
			definition: {
				id: 'b0eec1cc-f65a-4a91-bfd2-a0d20d9c035f',
				name: 'other custom prop from stream',
				valueType: 'Text',
				choiceValues: ['Development', 'Production', 'jupiter - production'],
				privileges: null,
			},
			schemaPath: 'CustomPropertyValue',
		},
	],
	owner: {
		id: '3e7804e1-c0e7-4059-a734-d3bda445746b',
		userId: 'sa_repository',
		userDirectory: 'INTERNAL',
		name: 'sa_repository',
		privileges: null,
	},
	name: 'Qlik stream 2',
	tags: [],
	privileges: null,
	schemaPath: 'Stream',
};

const STREAM_WITH_BUSINESS_DOMAIN = {
	id: 'aaec8d41-5201-43ab-809f-3063750dfafd',
	createdDate: '2020-10-13T22:37:27.240Z',
	modifiedDate: '2021-01-13T18:32:05.019Z',
	modifiedByUserName: 'RAUL ALFARO\\raul alfaro',
	customProperties: [
		{
			id: '561e39b1-b966-46de-a410-3e24ab6c2ce5',
			createdDate: '2021-07-26T16:59:31.119Z',
			modifiedDate: '2021-07-26T16:59:31.119Z',
			modifiedByUserName: 'YOUNG.KEVIN.1596615216\\young.kevin.1596615216',
			value: 'business domain from 3rd qlik stream',
			definition: {
				id: 'b0eec1cc-f65a-4a91-bfd2-a0d20d9c035f',
				name: 'businessDomain',
				valueType: 'Text',
				choiceValues: ['Development', 'Production', 'jupiter - production'],
				privileges: null,
			},
			schemaPath: 'CustomPropertyValue',
		},
	],
	owner: {
		id: '3e7804e1-c0e7-4059-a734-d3bda445746b',
		userId: 'sa_repository',
		userDirectory: 'INTERNAL',
		name: 'sa_repository',
		privileges: null,
	},
	name: 'Qlik stream 3',
	tags: [],
	privileges: null,
	schemaPath: 'Stream',
};

const qlikAppRes = [
	APP_TO_BE_EXCLUDED,
	APP_WITH_BUSINESS_DOMAIN_ON_APP_AND_OTHER_CUSTOM_PROP_ON_STREAM,
	APP_WITH_OTHER_CUSTOM_PROP_ON_APP_AND_BUSINESS_DOMAIN_ON_STREAM,
];

const qlikStreamRes = [STREAM_TO_BE_EXCLUDED, STREAM_WITH_OTHER_CUSTOM_PROP, STREAM_WITH_BUSINESS_DOMAIN];

describe('GlobalSearchUtils', function () {
	describe('#processQlikApps', () => {
		const processedApps = processQlikApps(qlikAppRes, qlikStreamRes);

		it(`excludes apps based on app's business domain`, async () => {
			const hasAppWithExcludedProperties = processedApps.some(
				(app) =>
					app.customProperties.includes('boop') ||
					app.businessDomains.includes('boop') ||
					app.businessDomains.includes('first qlik stream - should not be included')
			);
			expect(hasAppWithExcludedProperties).toBe(false);
			expect(processedApps.length).toEqual(qlikAppRes.length - 1);
			// `expected apps with custom property of 'excludeName' set to 'boop' to be excluded from results`
		});
		it("should add businessDomains from app's custom properties", async () => {
			expect(processedApps[0].customProperties.includes(`Business domain from app's custom prop`));
		});
		it("should add businessDomains from stream's custom properties", async () => {
			expect(processedApps[1].customProperties.includes(`business domain from 3rd qlik stream`));
		});

		it("should add other custom property values from app's custom properties", async () => {
			expect(processedApps[1].customProperties.includes(`test app custom prop 1`));
		});
		it("should add other custom property values from stream's custom properties", async () => {
			expect(processedApps[1].customProperties.includes(`business domain from 3rd qlik stream`));
			expect(processedApps[1].customProperties.includes(`test app custom prop 2`));
		});

		it("should not add names from custom properties from app's custom properties", async () => {
			expect(!processedApps[1].customProperties.includes(`defition name zddgwh,d - should not appear`));
			expect(!processedApps[1].customProperties.includes(`defition name xdndnls - should not appear`));
		});
	});
});
