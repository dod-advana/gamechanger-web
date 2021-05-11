// dev and prod use the same hash keys for ids
module.exports = {
	assets: {
		uot_agency: {
			path: 'relations',
			sourceId: '0c8c7a02-54bf-448e-b1f5-75c77ac9c67d',
		},
		dataSource: {
			path: 'assets',
			domainId: '1c9c2d34-c0f9-4653-ab16-0a75befabe96', // Advana Data Source Overview
			typeId: 'bd82b60c-7abc-4ece-a75b-c43f45857f24' // Data Source
		},
		portfolio: {
			path: 'assets',
			domainId: '59bb7f8c-7769-4094-bc04-b06756be27c3', // Advana Analytical Line Organizational Structure
			typeId: '2a997b58-d72d-41d9-a812-fdc189c4ab6c', // Advana Analytical Line
		},
		product: {
			path: 'assets',
			domainId: '59bb7f8c-7769-4094-bc04-b06756be27c3', // Advana Analytical Line Organizational Structure
			typeId: '197937ce-0475-4d21-88a3-1ed44cd5ca2a', // Advana Analytical Product
		}
	},
	//TODO: verify these guids match in prod. If not, this config should be moved to dynamic constants
	//this should fetch the list of Asset Types:  http://<API_BASE_URL>/assetTypes?offset=0&limit=0&nameMatchMode=ANYWHERE&excludeMeta=true&topLevel=false
	assetTypes: {
		databases: '00000000-0000-0000-0001-000400000002',
		columns: '00000000-0000-0000-0000-000000031008',
		tables: '00000000-0000-0000-0000-000000031007',
		dataSources: 'bd82b60c-7abc-4ece-a75b-c43f45857f24',
		applications: 'deb21586-7602-4519-abc9-3f9a644f5b0d'
	},
	relations: {
		dataSourceByPortfolio: {
			path: 'relations',
			typeId: 'f28bbb93-1e66-4a5c-a19c-d683b2a511ec',
			// role: requires data from Data Source, coRole: provides data for Analytical Line
			// sourceType: Advana Analytical Line (Portfolio), targetType: Data Source
		},
		dataSourceByProduct: {
			path: 'relations',
			typeId: '197937ce-0475-4d21-88a3-1ed44cd5ca2a',
			// role: requires data from Data Source, coRole: provides data for Analytical Line
			// sourceType: Advana Analytical Line (Portfolio), targetType: Data Source
		},
		dataSourceWithAuditDev: { // DEV
			path: 'relations',
			typeId: '1c6a9446-1f22-4e9a-92df-7bd575cbda77'
		},
		dataSourceWithAuditProd: { // PROD
			path: 'relations',
			typeId: 'bfef12a6-94f2-4e26-b954-8e5536dae8fc'
		},
		dataSourceWithAuditAndTarget: {
			path: 'relations',
			typeId: '00000000-0000-0000-0000-000000007018', // relation type between policy and asset
			targetId: 'd0f7e2c6-77fe-440b-ac40-03fd73a8fd52' // assetId for SSAE18 auditMapping
		}
	},
	complexRelations: {
		auditDataByAssetId: {
			path: 'complexRelations',
			assetId: 'd0f7e2c6-77fe-440b-ac40-03fd73a8fd52', 
		}
	},
	attributes: {
		dataSourceAcronym: {
			path: 'attributes',
			typeId: '3c5a16e5-d5e4-4b1a-9d8c-bc039124fe05',
		}
	},
	queryableStatuses: [
		'6d5d8a5e-b926-4332-90d2-9917895aabd9', //providing data to the platform
		'f708efb7-2cbd-4475-bc73-a38d0a772c57', //available for query
		'f93358a2-0c9d-4068-b167-55d058e119fe', //data acquisition pending
	]

};
