const assert = require('assert');
const PolicyGraphHandler = require('../../../node_app/modules/policy/policyGraphHandler');
const { constructorOptionsMock, reqMock } = require('../../resources/testUtility');

function generateFieldLookup (keys) {
	const lookup = {};
	keys.forEach((name, idx) => {
		lookup[name] = idx;
	});
	return lookup;
}

class Record {
	constructor (keys, fields, fieldLookup = null) {
		this.keys = keys;
		this.length = keys.length;
		this._fields = fields;
		this._fieldLookup = fieldLookup || generateFieldLookup(keys);
	}

	forEach (visitor) {
		for (const [key, value] of this.entries()) {
			visitor(value, key, this);
		}
	}

	toObject () {
		const object = {};

		for (const [key, value] of this.entries()) {
			object[key] = value;
		}

		return object;
	}

	* entries () {
		for (let i = 0; i < this.keys.length; i++) {
			yield [this.keys[i], this._fields[i]];
		}
	}

	* values () {
		for (let i = 0; i < this.keys.length; i++) {
			yield this._fields[i];
		}
	}
}

describe('PolicyGraphHandler', function () {
	let redisData = {gamechanger_f740af5d2e2819eeb0063eca402fcce8: JSON.stringify({test: ['test']})};

	const opts = {
		...constructorOptionsMock,
		constants: {
			GAME_CHANGER_OPTS: {downloadLimit: 1000, allow_daterange: true},
			GAMECHANGER_ELASTIC_SEARCH_OPTS: {index: 'Test', assist_index: 'Test'},
			GRAPH_CONFIG: {
				PULL_NODES_FROM_NEO4J_MAX_LIMIT: 500,
				GRAPH_VIEW_NODES_DISPLAYED_WARNING_LIMIT: 500,
				MAX_GRAPH_VIEW_NODES_DISPLAYED: 5000
			}
		},
		redisDB: {
			get(redisKey) {
				return Promise.resolve(redisData[redisKey]);
			},
			set(redisKey, data) {
				if (redisKey.includes('time')) {
					data = 'test';
				}
				redisData[redisKey] = data;
				return Promise.resolve(true);
			},
			select(id) {}
		},
		gc_history: {
			create(obj) {}
		}
	};

	describe('#searchHelper', () => {
		it('it should return graphData for a search', async (done) => {

			const docSearchResultsMock = {body: {took: 4, timed_out: false, _shards: {total: 3, successful: 3, skipped: 0, failed: 0}, hits: {total: {value: 1, relation: 'eq'}, max_score: 17.759283, hits: [{_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '8033fb3b824a0a020aab5fcb17d6fde36035086b288759bbfde790dcb0b48241', _score: 17.759283, fields: {doc_num: ['11-246V7'], id: ['AFMAN 11-246V7.pdf_0'], doc_type: ['AFMAN']}}]}}, statusCode: 200, headers: {date: 'Tue, 13 Apr 2021 17:11:08 GMT', 'content-type': 'application/json; charset=UTF-8', 'content-length': '398', connection: 'keep-alive', 'access-control-allow-origin': '*'}, meta: {context: null, request: {params: {method: 'POST', path: '/gamechanger/_search', body: '{"stored_fields":["id","doc_type","doc_num"],"from":0,"size":10000,"track_total_hits":true,"query":{"bool":{"must":[{"nested":{"path":"paragraphs","query":{"bool":{"should":[{"wildcard":{"paragraphs.filename.search":{"value":"\\"reverse shark\\"*","boost":15}}},{"query_string":{"query":"\\"reverse shark\\"","default_field":"paragraphs.par_raw_text_t","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"query_string":{"query":"is_revoked_b:false"}},{"query_string":{"query":"display_org_s:(*) AND display_doc_type_s:(*)"}}],"should":[{"multi_match":{"query":"\\"reverse shark\\"","fields":["keyw_5^2","id^2","summary_30","paragraphs.par_raw_text_t"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}]}}}', querystring: '', headers: {'user-agent': 'elasticsearch-js/7.11.0 (linux 4.19.121-linuxkit-x64; Node.js v10.9.0)', 'x-elastic-client-meta': 'es=7.11.0,js=10.9.0,t=7.11.0,hc=10.9.0', 'content-type': 'application/json', 'content-length': '803'}, timeout: 30000}, options: {}, id: 1}, name: 'elasticsearch-js', connection: {url: 'https://10.192.45.84/', id: 'https://10.192.45.84/', headers: {}, deadCount: 0, resurrectTimeout: 0, _openRequests: 0, status: 'alive', roles: {master: true, data: true, ingest: true, ml: false}}, attempts: 0, aborted: false}};
			const graphDataResultsMock = {result: {records: [{keys: ['pt2', 'pt'], length: 2, _fields: [{start: {identity: {low: 1123268, high: 0}, labels: ['Document'], properties: {kw_doc_score_r: {low: 0, high: 0}, display_org_s: 'Dept. of the Air Force', display_title_s: 'AFMAN 11-246V7 AIRCRAFT DEMONSTRATIONS (SAILPLANES)', signature: 'NA', subject: 'NA', change_date: 'NA', doc_num: '11-246V7', doc_type: 'AFMAN', version_hash_s: '3c441cba611ef5cd50a9c2ce7d9bf22bdc7e08bd498c11708861e9b61bb1d03b', type: 'document', title: 'AIRCRAFT DEMONSTRATIONS (SAILPLANES)', group_s: 'AFMAN 11-246V7.pdf_0', access_timestamp_dt: '2021-03-10T15:52:33', download_url_s: 'https://static.e-publishing.af.mil/production/1/af_a3/publication/afman11-246v7/afman11-246v7.pdf', display_doc_type_s: 'Document', ref_list: ['AFI 11-246V7', 'AFI 11-209', 'AFI 33-360', 'AFMAN 11-246', 'AFMAN 33-363', 'AFMAN 11-246V7', 'AFMAN 11-2Sailplane', 'AFMAN 11-2SailplaneV1', 'AFPD 1', 'AFM 11-24', 'AFM 33-36', 'AF 847'], page_count: {low: 17, high: 0}, init_date: 'NA', crawler_used_s: 'air_force_pubs', author: 'NA', summary_30: 'provide procedures for Air Force performance of sailplane aircraft demonstrations. Unit commanders may not authorize profile changes for actual demonstrations. demonstration pilots to practice and evaluate proposed profile changes prior to submitting a', topics: ['Demonstration', 'Afman', 'Aerobatic', 'Sailplane', 'Profile'], is_revoked_b: false, classification: 'NA', doc_id: 'AFMAN 11-246V7.pdf_0', source_page_url_s: 'https://www.e-publishing.af.mil/Product-Index/#/?view=pubs&orgID=10141&catID=1&series=-1&modID=449&tabID=131', keyw_5: ['profile includes', 'straight line', 'rolling turn', 'records created', 'quarter cloverleaves', 'pull-push-pull humpty', 'positive snap', 'mark kelly', 'major command-level', 'high-speed flyover'], filename: 'AFMAN 11-246V7.pdf', cac_login_required_b: 'False', name: 'AFMAN 11-246V7', source_fqdn_s: 'www.e-publishing.af.mil', publication_date_dt: '2020-03-27T00:00:00', pagerank_r: 0.00003509842455928412}}, end: {identity: {low: 1123269, high: 0}, labels: ['Publication'], properties: {name: 'AFMAN 11-246V7', display_org_s: 'Dept. of the Air Force', display_doc_type_s: 'Document', doc_type: 'AFMAN', doc_num: '11-246V7'}}, segments: [{start: {identity: {low: 1123268, high: 0}, labels: ['Document'], properties: {kw_doc_score_r: {low: 0, high: 0}, display_org_s: 'Dept. of the Air Force', display_title_s: 'AFMAN 11-246V7 AIRCRAFT DEMONSTRATIONS (SAILPLANES)', signature: 'NA', subject: 'NA', change_date: 'NA', doc_num: '11-246V7', doc_type: 'AFMAN', version_hash_s: '3c441cba611ef5cd50a9c2ce7d9bf22bdc7e08bd498c11708861e9b61bb1d03b', type: 'document', title: 'AIRCRAFT DEMONSTRATIONS (SAILPLANES)', group_s: 'AFMAN 11-246V7.pdf_0', access_timestamp_dt: '2021-03-10T15:52:33', download_url_s: 'https://static.e-publishing.af.mil/production/1/af_a3/publication/afman11-246v7/afman11-246v7.pdf', display_doc_type_s: 'Document', ref_list: ['AFI 11-246V7', 'AFI 11-209', 'AFI 33-360', 'AFMAN 11-246', 'AFMAN 33-363', 'AFMAN 11-246V7', 'AFMAN 11-2Sailplane', 'AFMAN 11-2SailplaneV1', 'AFPD 1', 'AFM 11-24', 'AFM 33-36', 'AF 847'], page_count: {low: 17, high: 0}, init_date: 'NA', crawler_used_s: 'air_force_pubs', author: 'NA', summary_30: 'provide procedures for Air Force performance of sailplane aircraft demonstrations. Unit commanders may not authorize profile changes for actual demonstrations. demonstration pilots to practice and evaluate proposed profile changes prior to submitting a', topics: ['Demonstration', 'Afman', 'Aerobatic', 'Sailplane', 'Profile'], is_revoked_b: false, classification: 'NA', doc_id: 'AFMAN 11-246V7.pdf_0', source_page_url_s: 'https://www.e-publishing.af.mil/Product-Index/#/?view=pubs&orgID=10141&catID=1&series=-1&modID=449&tabID=131', keyw_5: ['profile includes', 'straight line', 'rolling turn', 'records created', 'quarter cloverleaves', 'pull-push-pull humpty', 'positive snap', 'mark kelly', 'major command-level', 'high-speed flyover'], filename: 'AFMAN 11-246V7.pdf', cac_login_required_b: 'False', name: 'AFMAN 11-246V7', source_fqdn_s: 'www.e-publishing.af.mil', publication_date_dt: '2020-03-27T00:00:00', pagerank_r: 0.00003509842455928412}}, relationship: {identity: {low: 1359510, high: 0}, start: {low: 1123268, high: 0}, end: {low: 1123269, high: 0}, type: 'BELONGS_TO', properties: {}}, end: {identity: {low: 1123269, high: 0}, labels: ['Publication'], properties: {name: 'AFMAN 11-246V7', display_org_s: 'Dept. of the Air Force', display_doc_type_s: 'Document', doc_type: 'AFMAN', doc_num: '11-246V7'}}}, {start: {identity: {low: 1123269, high: 0}, labels: ['Publication'], properties: {name: 'AFMAN 11-246V7', display_org_s: 'Dept. of the Air Force', display_doc_type_s: 'Document', doc_type: 'AFMAN', doc_num: '11-246V7'}}, relationship: {identity: {low: 1536492, high: 0}, start: {low: 1123269, high: 0}, end: {low: 1123269, high: 0}, type: 'REFERENCES', properties: {}}, end: {identity: {low: 1123269, high: 0}, labels: ['Publication'], properties: {name: 'AFMAN 11-246V7', display_org_s: 'Dept. of the Air Force', display_doc_type_s: 'Document', doc_type: 'AFMAN', doc_num: '11-246V7'}}}], length: 2}, {start: {identity: {low: 1123268, high: 0}, labels: ['Document'], properties: {kw_doc_score_r: {low: 0, high: 0}, display_org_s: 'Dept. of the Air Force', display_title_s: 'AFMAN 11-246V7 AIRCRAFT DEMONSTRATIONS (SAILPLANES)', signature: 'NA', subject: 'NA', change_date: 'NA', doc_num: '11-246V7', doc_type: 'AFMAN', version_hash_s: '3c441cba611ef5cd50a9c2ce7d9bf22bdc7e08bd498c11708861e9b61bb1d03b', type: 'document', title: 'AIRCRAFT DEMONSTRATIONS (SAILPLANES)', group_s: 'AFMAN 11-246V7.pdf_0', access_timestamp_dt: '2021-03-10T15:52:33', download_url_s: 'https://static.e-publishing.af.mil/production/1/af_a3/publication/afman11-246v7/afman11-246v7.pdf', display_doc_type_s: 'Document', ref_list: ['AFI 11-246V7', 'AFI 11-209', 'AFI 33-360', 'AFMAN 11-246', 'AFMAN 33-363', 'AFMAN 11-246V7', 'AFMAN 11-2Sailplane', 'AFMAN 11-2SailplaneV1', 'AFPD 1', 'AFM 11-24', 'AFM 33-36', 'AF 847'], page_count: {low: 17, high: 0}, init_date: 'NA', crawler_used_s: 'air_force_pubs', author: 'NA', summary_30: 'provide procedures for Air Force performance of sailplane aircraft demonstrations. Unit commanders may not authorize profile changes for actual demonstrations. demonstration pilots to practice and evaluate proposed profile changes prior to submitting a', topics: ['Demonstration', 'Afman', 'Aerobatic', 'Sailplane', 'Profile'], is_revoked_b: false, classification: 'NA', doc_id: 'AFMAN 11-246V7.pdf_0', source_page_url_s: 'https://www.e-publishing.af.mil/Product-Index/#/?view=pubs&orgID=10141&catID=1&series=-1&modID=449&tabID=131', keyw_5: ['profile includes', 'straight line', 'rolling turn', 'records created', 'quarter cloverleaves', 'pull-push-pull humpty', 'positive snap', 'mark kelly', 'major command-level', 'high-speed flyover'], filename: 'AFMAN 11-246V7.pdf', cac_login_required_b: 'False', name: 'AFMAN 11-246V7', source_fqdn_s: 'www.e-publishing.af.mil', publication_date_dt: '2020-03-27T00:00:00', pagerank_r: 0.00003509842455928412}}, end: {identity: {low: 1123269, high: 0}, labels: ['Publication'], properties: {name: 'AFMAN 11-246V7', display_org_s: 'Dept. of the Air Force', display_doc_type_s: 'Document', doc_type: 'AFMAN', doc_num: '11-246V7'}}, segments: [{start: {identity: {low: 1123268, high: 0}, labels: ['Document'], properties: {kw_doc_score_r: {low: 0, high: 0}, display_org_s: 'Dept. of the Air Force', display_title_s: 'AFMAN 11-246V7 AIRCRAFT DEMONSTRATIONS (SAILPLANES)', signature: 'NA', subject: 'NA', change_date: 'NA', doc_num: '11-246V7', doc_type: 'AFMAN', version_hash_s: '3c441cba611ef5cd50a9c2ce7d9bf22bdc7e08bd498c11708861e9b61bb1d03b', type: 'document', title: 'AIRCRAFT DEMONSTRATIONS (SAILPLANES)', group_s: 'AFMAN 11-246V7.pdf_0', access_timestamp_dt: '2021-03-10T15:52:33', download_url_s: 'https://static.e-publishing.af.mil/production/1/af_a3/publication/afman11-246v7/afman11-246v7.pdf', display_doc_type_s: 'Document', ref_list: ['AFI 11-246V7', 'AFI 11-209', 'AFI 33-360', 'AFMAN 11-246', 'AFMAN 33-363', 'AFMAN 11-246V7', 'AFMAN 11-2Sailplane', 'AFMAN 11-2SailplaneV1', 'AFPD 1', 'AFM 11-24', 'AFM 33-36', 'AF 847'], page_count: {low: 17, high: 0}, init_date: 'NA', crawler_used_s: 'air_force_pubs', author: 'NA', summary_30: 'provide procedures for Air Force performance of sailplane aircraft demonstrations. Unit commanders may not authorize profile changes for actual demonstrations. demonstration pilots to practice and evaluate proposed profile changes prior to submitting a', topics: ['Demonstration', 'Afman', 'Aerobatic', 'Sailplane', 'Profile'], is_revoked_b: false, classification: 'NA', doc_id: 'AFMAN 11-246V7.pdf_0', source_page_url_s: 'https://www.e-publishing.af.mil/Product-Index/#/?view=pubs&orgID=10141&catID=1&series=-1&modID=449&tabID=131', keyw_5: ['profile includes', 'straight line', 'rolling turn', 'records created', 'quarter cloverleaves', 'pull-push-pull humpty', 'positive snap', 'mark kelly', 'major command-level', 'high-speed flyover'], filename: 'AFMAN 11-246V7.pdf', cac_login_required_b: 'False', name: 'AFMAN 11-246V7', source_fqdn_s: 'www.e-publishing.af.mil', publication_date_dt: '2020-03-27T00:00:00', pagerank_r: 0.00003509842455928412}}, relationship: {identity: {low: 1359510, high: 0}, start: {low: 1123268, high: 0}, end: {low: 1123269, high: 0}, type: 'BELONGS_TO', properties: {}}, end: {identity: {low: 1123269, high: 0}, labels: ['Publication'], properties: {name: 'AFMAN 11-246V7', display_org_s: 'Dept. of the Air Force', display_doc_type_s: 'Document', doc_type: 'AFMAN', doc_num: '11-246V7'}}}], length: 1}], _fieldLookup: {pt2: 0, pt: 1}}], summary: {query: {text: '\n\t\t\t\tWITH ["AFMAN 11-246V7.pdf_0"] AS ids\n\t\t\t\tMATCH (d:Document)-[bt:BELONGS_TO]->(p:Publication)\n\t\t\t\tWHERE d.doc_id in ids\n\t\t\t\tWITH collect(id(p)) as pub_ids, collect(id(d)) as doc_ids\n\t\t\t\tMATCH pt=(d:Document)-[:BELONGS_TO]->(p:Publication)\n\t\t\t\tWHERE id(d) in doc_ids AND id(p) in pub_ids\n\t\t\t\tOPTIONAL MATCH pt2=(d:Document)-[:BELONGS_TO]->(p:Publication)-[:REFERENCES]->(p2:Publication)\n\t\t\t\tWHERE id(d) in doc_ids AND id(p) in pub_ids AND id(p2) in pub_ids\n\t\t\t\tRETURN pt2, pt;', parameters: {}}, queryType: 'r', counters: {_stats: {nodesCreated: 0, nodesDeleted: 0, relationshipsCreated: 0, relationshipsDeleted: 0, propertiesSet: 0, labelsAdded: 0, labelsRemoved: 0, indexesAdded: 0, indexesRemoved: 0, constraintsAdded: 0, constraintsRemoved: 0}, _systemUpdates: 0}, updateStatistics: {_stats: {nodesCreated: 0, nodesDeleted: 0, relationshipsCreated: 0, relationshipsDeleted: 0, propertiesSet: 0, labelsAdded: 0, labelsRemoved: 0, indexesAdded: 0, indexesRemoved: 0, constraintsAdded: 0, constraintsRemoved: 0}, _systemUpdates: 0}, plan: false, profile: false, notifications: [], server: {address: '10.194.9.69:7687', version: 'Neo4j/4.2.3', protocolVersion: 4.2}, resultConsumedAfter: {low: 1, high: 0}, resultAvailableAfter: {low: 11, high: 0}, database: {name: 'neo4j'}}}};
			const records = [];
			graphDataResultsMock.result.records.forEach(rec => {
				records.push(new Record(rec.keys, rec._fields, rec._fieldLookup));
			});
			graphDataResultsMock.result.records = records;

			const graphResponse = {
				results: {
					edges: [], labels: ['Document'], nodeProperties: {Document: ['doc_id', 'doc_type', 'doc_num', 'display_title_s', 'display_org_s', 'display_doc_type_s', 'pagerank_r', 'ref_name']}, nodes: [{display_doc_type_s: undefined, display_org_s: undefined, display_title_s: undefined, doc_id: 'AFMAN 11-246V7.pdf_0', doc_num: '11-246V7', doc_type: 'AFMAN', id: 0, label: 'Document', pageRank: 0, pagerank_r: undefined, properties: ['doc_id', 'doc_type', 'doc_num', 'display_title_s', 'display_org_s', 'display_doc_type_s', 'pagerank_r', 'ref_name'], ref_name: 'AFMAN 11-246V7', value: 1}], relProperties: {}, relationships: []
				},
				query: 'Mocked from ES',
				params: []
			};

			const tmpOpts = {
				...opts,
				dataLibrary: {
					queryGraph() {
						return Promise.resolve(graphDataResultsMock);
					},
					queryElasticSearch() {
						return Promise.resolve(docSearchResultsMock);
					}
				}
			};

			const req = {
				...reqMock,
				body: {
					isTest: true,
					orgFilterString: '*',
					typeFilterString: '*',
					transformResults: false,
					cloneData: {
						id: 1,
						clone_name: 'gamechanger',
						display_name: 'GAMECHANGER',
						is_live: true,
						url: 'gamechanger',
						permissions_required: false,
						clone_to_advana: true,
						clone_to_gamechanger: true,
						clone_to_sipr: false,
						clone_to_jupiter: true,
						show_tutorial: true,
						show_graph: true,
						show_crowd_source: true,
						show_feedback: true,
						search_module: 'policy/policySearchHandler',
						export_module: 'simple/simpleExportHandler',
						title_bar_module: 'policy/policyTitleBarHandler',
						navigation_module: 'policy/policyNavigationHandler',
						card_module: 'policy/policyCardHandler',
						main_view_module: 'policy/policyMainViewHandler',
						graph_module: 'policy/policyGraphHandler',
						config: {esIndex: 'gamechanger'},
						createdAt: '2021-03-17T13:35:17.526Z',
						updatedAt: '2021-03-17T13:35:19.927Z'
					},
					index: '',
					orgFilter: {},
					typeFilter: {},
					useGCCache: false,
					searchFields: {initial: {field: null, input: ''}},
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					searchText: 'artificial intelligence',
					cloneName: 'gamechanger'
				}
			};

			const target = new PolicyGraphHandler(tmpOpts);

			try {
				const actual = await target.searchHelper(req, 'test');
				// const expected = {graphData: {edges: [], labels: ['Document'], nodeProperties: {Document: ['doc_id', 'doc_type', 'doc_num', 'display_title_s', 'display_org_s', 'display_doc_type_s', 'pagerank_r', 'ref_name']}, nodes: [{display_doc_type_s: undefined, display_org_s: undefined, display_title_s: undefined, doc_id: 'AFMAN 11-246V7.pdf_0', doc_num: '11-246V7', doc_type: 'AFMAN', id: 0, label: 'Document', pageRank: 0, pagerank_r: undefined, properties: ['doc_id', 'doc_type', 'doc_num', 'display_title_s', 'display_org_s', 'display_doc_type_s', 'pagerank_r', 'ref_name'], ref_name: 'AFMAN 11-246V7', value: 1}], relProperties: {}, relationships: []}, query: {params: [], query: 'Mocked from ES'}, searchTerms: ['artificial', 'intelligence']};
				const expected = {'graphData': {'edges': [{'curvature': 0, 'id': 1359510, 'label': 'BELONGS_TO', 'properties': [], 'rotation': 0, 'source': 1123268, 'target': 1123269, 'value': 1}, {'curvature': 0, 'id': 1536492, 'label': 'REFERENCES', 'properties': [], 'rotation': 0, 'source': 1123269, 'target': 1123269, 'value': 1}], 'labels': ['Document', 'Publication'], 'nodeProperties': {'Document': ['kw_doc_score_r', 'display_org_s', 'display_title_s', 'signature', 'subject', 'change_date', 'doc_num', 'doc_type', 'version_hash_s', 'type', 'title', 'group_s', 'access_timestamp_dt', 'download_url_s', 'display_doc_type_s', 'ref_list', 'page_count', 'init_date', 'crawler_used_s', 'author', 'summary_30', 'topics', 'is_revoked_b', 'classification', 'doc_id', 'source_page_url_s', 'keyw_5', 'filename', 'cac_login_required_b', 'name', 'source_fqdn_s', 'publication_date_dt', 'pagerank_r'], 'Publication': ['name', 'display_org_s', 'display_doc_type_s', 'doc_type', 'doc_num']}, 'nodes': [{'access_timestamp_dt': '2021-03-10T15:52:33', 'author': 'NA', 'cac_login_required_b': 'False', 'change_date': 'NA', 'classification': 'NA', 'crawler_used_s': 'air_force_pubs', 'display_doc_type_s': 'Document', 'display_org_s': 'Dept. of the Air Force', 'display_title_s': 'AFMAN 11-246V7 AIRCRAFT DEMONSTRATIONS (SAILPLANES)', 'doc_id': 'AFMAN 11-246V7.pdf_0', 'doc_num': '11-246V7', 'doc_type': 'AFMAN', 'download_url_s': 'https://static.e-publishing.af.mil/production/1/af_a3/publication/afman11-246v7/afman11-246v7.pdf', 'filename': 'AFMAN 11-246V7.pdf', 'group_s': 'AFMAN 11-246V7.pdf_0', 'id': 1123268, 'init_date': 'NA', 'is_revoked_b': false, 'keyw_5': ['profile includes', 'straight line', 'rolling turn', 'records created', 'quarter cloverleaves', 'pull-push-pull humpty', 'positive snap', 'mark kelly', 'major command-level', 'high-speed flyover'], 'kw_doc_score_r': 0, 'label': 
				'Document', 'name': 'AFMAN 11-246V7', 'pageRank': 0.07500000000000001, 'page_count': 17, 'pagerank_r': 0.00003509842455928412, 'properties': ['kw_doc_score_r', 'display_org_s', 'display_title_s', 'signature', 'subject', 'change_date', 'doc_num', 'doc_type', 'version_hash_s', 'type', 'title', 'group_s', 'access_timestamp_dt', 'download_url_s', 'display_doc_type_s', 'ref_list', 'page_count', 'init_date', 'crawler_used_s', 'author', 'summary_30', 'topics', 'is_revoked_b', 'classification', 'doc_id', 'source_page_url_s', 'keyw_5', 'filename', 'cac_login_required_b', 'name', 'source_fqdn_s', 'publication_date_dt', 'pagerank_r'], 'publication_date_dt': '2020-03-27T00:00:00', 'ref_list': ['AFI 11-246V7', 'AFI 11-209', 'AFI 33-360', 'AFMAN 11-246', 'AFMAN 33-363', 'AFMAN 11-246V7', 'AFMAN 11-2Sailplane', 'AFMAN 11-2SailplaneV1', 'AFPD 1', 'AFM 11-24', 'AFM 33-36', 'AF 847'], 'signature': 'NA', 'source_fqdn_s': 'www.e-publishing.af.mil', 'source_page_url_s': 'https://www.e-publishing.af.mil/Product-Index/#/?view=pubs&orgID=10141&catID=1&series=-1&modID=449&tabID=131', 'subject': 'NA', 'summary_30': 'provide procedures for Air Force performance of sailplane aircraft demonstrations. Unit commanders may not authorize profile changes for actual demonstrations. demonstration pilots to practice and evaluate proposed profile changes prior to submitting a', 'title': 'AIRCRAFT DEMONSTRATIONS (SAILPLANES)', 'topics': ['Demonstration', 'Afman', 'Aerobatic', 'Sailplane', 'Profile'], 'type': 'document', 'value': 1, 'version_hash_s': '3c441cba611ef5cd50a9c2ce7d9bf22bdc7e08bd498c11708861e9b61bb1d03b'}, {'display_doc_type_s': 'Document', 'display_org_s': 'Dept. of the Air Force', 'doc_num': '11-246V7', 'doc_type': 'AFMAN', 'id': 1123269, 'label': 'Publication', 'name': 'AFMAN 11-246V7', 'pageRank': 0.925, 'properties': ['name', 'display_org_s', 'display_doc_type_s', 'doc_type', 'doc_num'], 'value': 1}], 'relProperties': {'BELONGS_TO': [], 'REFERENCES': []}, 'relationships': ['BELONGS_TO', 'REFERENCES']}, 'query': {'limit': undefined, 'params': {'ids': ['AFMAN 11-246V7.pdf_0']}, 'query': 'MATCH (d:Document) WHERE d.doc_id in $ids\n\t\t\t\t\tOPTIONAL MATCH pt=(d)-[ref:REFERENCES]->(d2:Document)\n\t\t\t\t\tWHERE NOT d = d2 AND d2.doc_id in $ids\n\t\t\t\t\tRETURN d, pt;'}, 'searchTerms': ['artificial', 'intelligence']};
				assert.deepStrictEqual(actual, expected);
			} catch (e) {
				assert.fail(e);
			}
			done();
		});
	});

	describe('#queryHelper', () => {
		it('it should return graphData for a query', async (done) => {
			const graphDataResultsMock = {result: {records: [{
				keys: [
					'd'
				],
				length: 1,
				_fields: [
					{
						identity: {
							low: 499,
							high: 0
						},
						labels: [
							'Document'
						],
						properties: {
							kw_doc_score_r: 0.00001,
							display_title_s: 'AASSEP 4 TYRE VALVE COUPLINGS',
							display_org_s: 'NATO',
							signature: 'NA',
							subject: 'NA',
							change_date: 'NA',
							doc_num: '4',
							doc_type: 'AASSEP',
							version_hash_s: '9f3cbf1174a679f0ae170b820b2b74901d221b6fc2811552a99f46659fca4be6',
							title: 'TYRE VALVE COUPLINGS',
							type: 'document',
							group_s: 'AASSEP 4.pdf_0',
							download_url_s: 'https://nso.nato.int/nso/zPublic/ap/AASSEP-04%20EdA%20v1%20E.pdf',
							access_timestamp_dt: '2021-03-10T18:57:46',
							display_doc_type_s: 'Document',
							ref_list: [],
							page_count: {
								low: 30,
								high: 0
							},
							init_date: 'NA',
							crawler_used_s: 'nato_stanag',
							author: 'NA',
							summary_30: 'A valve sealing cap, as shown in Annex C, shall be used with all aircraft tyre the core chamber of the aircraft tyre valve as defined in Annex Figure',
							topics: [
								'Edition Version',
								'Valve',
								'Annex',
								'Intentionally Blank',
								'Coloured'
							],
							is_revoked_b: false,
							classification: 'NA',
							doc_id: 'AASSEP 4.pdf_0',
							source_page_url_s: 'https://nso.nato.int/nso/nsdd/ListPromulg.html',
							keyw_5: [
								'annex',
								'valve mouth',
								'pin head',
								'short core',
								'reservations listed',
								'intentionally blank',
								'aassep-04',
								' nato/otan',
								'valve core',
								'valve cap'
							],
							filename: 'AASSEP 4.pdf',
							cac_login_required_b: 'False',
							name: 'AASSEP 4',
							source_fqdn_s: 'nso.nato.int',
							publication_date_dt: '2014-10-21T00:00:00',
							pagerank_r: 0.00001
						}
					}
				],
				_fieldLookup: {
					d: 0
				}
			}]}};

			const records = [];
			graphDataResultsMock.result.records.forEach(rec => {
				records.push(new Record(rec.keys, rec._fields, rec._fieldLookup));
			});
			graphDataResultsMock.result.records = records;

			const tmpOpts = {
				...opts,
				dataLibrary: {
					queryGraph() {
						return Promise.resolve(graphDataResultsMock);
					},
				}
			};

			const req = {
				...reqMock,
				body: {
					isTest: true,
					code: 'test',
					query: 'MATCH (d:Document) RETURN d LIMIT 1;',
					cloneName: 'gamechanger',
					params: {}
				}
			};

			const target = new PolicyGraphHandler(tmpOpts);

			try {
				const actual = await target.queryHelper(req, 'test', 'test');
				const expected = {edges: [], labels: ['Document'], nodeProperties: {Document: ['kw_doc_score_r', 'display_title_s', 'display_org_s', 'signature', 'subject', 'change_date', 'doc_num', 'doc_type', 'version_hash_s', 'title', 'type', 'group_s', 'download_url_s', 'access_timestamp_dt', 'display_doc_type_s', 'ref_list', 'page_count', 'init_date', 'crawler_used_s', 'author', 'summary_30', 'topics', 'is_revoked_b', 'classification', 'doc_id', 'source_page_url_s', 'keyw_5', 'filename', 'cac_login_required_b', 'name', 'source_fqdn_s', 'publication_date_dt', 'pagerank_r']}, nodes: [{access_timestamp_dt: '2021-03-10T18:57:46', author: 'NA', cac_login_required_b: 'False', change_date: 'NA', classification: 'NA', crawler_used_s: 'nato_stanag', display_doc_type_s: 'Document', display_org_s: 'NATO', display_title_s: 'AASSEP 4 TYRE VALVE COUPLINGS', doc_id: 'AASSEP 4.pdf_0', doc_num: '4', doc_type: 'AASSEP', download_url_s: 'https://nso.nato.int/nso/zPublic/ap/AASSEP-04%20EdA%20v1%20E.pdf', filename: 'AASSEP 4.pdf', group_s: 'AASSEP 4.pdf_0', id: 499, init_date: 'NA', is_revoked_b: false, keyw_5: ['annex', 'valve mouth', 'pin head', 'short core', 'reservations listed', 'intentionally blank', 'aassep-04', ' nato/otan', 'valve core', 'valve cap'], kw_doc_score_r: 0.00001, label: 'Document', name: 'AASSEP 4', pageRank: 0, page_count: 30, pagerank_r: 0.00001, properties: ['kw_doc_score_r', 'display_title_s', 'display_org_s', 'signature', 'subject', 'change_date', 'doc_num', 'doc_type', 'version_hash_s', 'title', 'type', 'group_s', 'download_url_s', 'access_timestamp_dt', 'display_doc_type_s', 'ref_list', 'page_count', 'init_date', 'crawler_used_s', 'author', 'summary_30', 'topics', 'is_revoked_b', 'classification', 'doc_id', 'source_page_url_s', 'keyw_5', 'filename', 'cac_login_required_b', 'name', 'source_fqdn_s', 'publication_date_dt', 'pagerank_r'], publication_date_dt: '2014-10-21T00:00:00', ref_list: [], signature: 'NA', source_fqdn_s: 'nso.nato.int', source_page_url_s: 'https://nso.nato.int/nso/nsdd/ListPromulg.html', subject: 'NA', summary_30: 'A valve sealing cap, as shown in Annex C, shall be used with all aircraft tyre the core chamber of the aircraft tyre valve as defined in Annex Figure', title: 'TYRE VALVE COUPLINGS', topics: ['Edition Version', 'Valve', 'Annex', 'Intentionally Blank', 'Coloured'], type: 'document', value: 1, version_hash_s: '9f3cbf1174a679f0ae170b820b2b74901d221b6fc2811552a99f46659fca4be6'}], query: {params: {}, query: 'MATCH (d:Document) RETURN d LIMIT 1;'}, relProperties: {}, relationships: []};
				assert.deepStrictEqual(actual, expected);
			} catch (e) {
				assert.fail(e);
			}
			done();
		});
	});

	describe('#getDataForSearchHelper', () => {
		it('it should return sidebar data for a query', async (done) => {
			const graphDataResultsMock = [
				{result: {records: [{keys: ['node', 'entityScore', 'mentions'], length: 3, _fields: [{identity: {low: 124, high: 0}, labels: ['Entity'], properties: {Founded: '14June1775', aliases: 'USArmy; Army', Size: '480,893 Regular Army personnel 336,129 Army National Guard personnel 188,703 Army Reserve personnel 1,005,725 total uniformed personnel 252,747 civilian personnel 1,258,472 total4,406 manned aircraft', March: '\'The Army Goes Rolling Along\' Play', Website: 'Army.mil', Engagements: 'Revolutionary War War of 1812 MexicanAmerican War Civil War Indian Wars SpanishAmerican War China Relief Expedition PhilippineAmerican War Mexican Expedition World War I Russian Civil War Bonus Army suppression World War II Korean War 1958 Lebanon crisis Vietnam War Dominican Civil WarKorean DMZ Conflict Invasion of Grenada; Invasion of Panama Somali Civil War Persian Gulf War Kosovo War Global War on Terrorism War in Afghanistan Iraq War Operation Inherent Resolve Battle of Khasham', type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', Secretary_of_Defense: 'Lloyd Austin', Mascot: 'Army Mules', Motto: '\'This We\'ll Defend\'', Commander_in_Chief: 'President Joe Biden', Anniversaries: 'Army Birthday: 14 June', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Mark_of_the_United_States_Army.svg/1000px-Mark_of_the_United_States_Army.svg.png', website: 'https://www.army.mil/', address: 'The Pentagon \nWashington, DC 20310', Headquarters: 'The Pentagon Arlington County, Virginia, U.S.', Sergeant_Major_of_the_Army: 'SMA Michael A. Grinston', tollfree: '', Role: 'Combined arms maneuver and wide area security; Armored and mechanized operations; Airborne and air assault operations', Type: 'Army', Secretary_of_the_Army: 'John E. Whitley', Colors: 'Black, gold and white', Equipment: 'List of U.S. Army equipment', phone: '1-703-695-6518', Vice_Chief_of_Staff: 'GEN Joseph M. Martin', tty: '', name: 'United States Army', Country: 'United States', Chief_of_Staff: 'GEN James C. McConville', Partof: 'Department of the Army', Last_Retrieved: '2021/03/31-22:44:07 UTC'}}, 1.4829699300229549, {low: 433, high: 0}], _fieldLookup: {node: 0, entityScore: 1, mentions: 2}}, {keys: ['node', 'entityScore', 'mentions'], length: 3, _fields: [{identity: {low: 122, high: 0}, labels: ['Entity'], properties: {image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Seal_of_the_United_States_Department_of_the_Air_Force.svg/1024px-Seal_of_the_United_States_Department_of_the_Air_Force.svg.png', website: 'https://www.af.mil/', aliases: 'USAF;AF;Air Force', address: '1690 Air Force Pentagon \nWashington, DC 20330-1670', phone: '', tty: '', name: 'United States Air Force', type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', tollfree: '1-800-423-8723'}}, 1.120017509907484, {low: 1391, high: 0}], _fieldLookup: {node: 0, entityScore: 1, mentions: 2}}, {keys: ['node', 'entityScore', 'mentions'], length: 3, _fields: [{identity: {low: 296, high: 0}, labels: ['Entity'], properties: {image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Seal_of_the_United_States_Department_of_Transportation.svg/1000px-Seal_of_the_United_States_Department_of_Transportation.svg.png', website: 'https://www.faa.gov/', address: '800 Independence Ave., SW \nWashington, DC 20591', aliases: 'FAA', phone: '1-202-366-4000', tty: '', name: 'Federal Aviation Administration', type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', tollfree: '1-866-835-5322'}}, 0.7293032601475715, {low: 340, high: 0}], _fieldLookup: {node: 0, entityScore: 1, mentions: 2}}, {keys: ['node', 'entityScore', 'mentions'], length: 3, _fields: [{identity: {low: 171, high: 0}, labels: ['Entity'], properties: {image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/United_States_Department_of_Defense_Seal.svg/1200px-United_States_Department_of_Defense_Seal.svg.png', website: 'https://www.nsa.gov/', address: '9800 Savage Rd. \nSuite 6272 \nFort Meade, MD 20755-6000', aliases: 'NSA', phone: '1-301-688-6311', tty: '', name: 'National Security Agency', type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', tollfree: ''}}, 0.5695998930488713, {low: 282, high: 0}], _fieldLookup: {node: 0, entityScore: 1, mentions: 2}}, {keys: ['node', 'entityScore', 'mentions'], length: 3, _fields: [{identity: {low: 262, high: 0}, labels: ['Entity'], properties: {image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Seal_of_the_United_States_Department_of_Labor.svg/1000px-Seal_of_the_United_States_Department_of_Labor.svg.png', website: 'https://www.osha.gov/', address: '', aliases: 'OSHA', phone: '', tty: '1-877-889-5627', name: 'Occupational Safety and Health Administration', type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', tollfree: '1-800-321-6742'}}, 0.5023601417429746, {low: 242, high: 0}], _fieldLookup: {node: 0, entityScore: 1, mentions: 2}}, {keys: ['node', 'entityScore', 'mentions'], length: 3, _fields: [{identity: {low: 55, high: 0}, labels: ['Entity'], properties: {image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Seal_of_the_General_Services_Administration.svg/1000px-Seal_of_the_General_Services_Administration.svg.png', website: 'https://www.gsa.gov/', address: '1800 F St., NW \nWashington, DC 20405', aliases: 'GSA', phone: '', tty: '', name: 'General Services Administration', type: 'organization', branch: 'Independent Agency', tollfree: ''}}, 0.3419149370864034, {low: 735, high: 0}], _fieldLookup: {node: 0, entityScore: 1, mentions: 2}}, {keys: ['node', 'entityScore', 'mentions'], length: 3, _fields: [{identity: {low: 173, high: 0}, labels: ['Entity'], properties: {image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Seal_of_the_United_States_Marine_Corps.svg/256px-Seal_of_the_United_States_Marine_Corps.svg.png', website: 'https://www.marines.mil/', address: '', aliases: 'USMC', phone: '', tty: '', name: 'United States Marine Corps', type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', tollfree: '1-800-627-4637'}}, 0.3395379841327667, {low: 127, high: 0}], _fieldLookup: {node: 0, entityScore: 1, mentions: 2}}, {keys: ['node', 'entityScore', 'mentions'], length: 3, _fields: [{identity: {low: 462, high: 0}, labels: ['Entity'], properties: {image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Seal_of_the_President_of_the_United_States.svg/1024px-Seal_of_the_President_of_the_United_States.svg.png', website: 'https://www.whitehouse.gov/omb/', address: '725 17th St., NW \nWashington, DC 20503', aliases: 'OMB', phone: '1-202-395-3080', tty: '', name: 'Office of Management and Budget', type: 'organization', branch: 'Executive Office of the President', tollfree: ''}}, 0.33524993718601764, {low: 774, high: 0}], _fieldLookup: {node: 0, entityScore: 1, mentions: 2}}, {keys: ['node', 'entityScore', 'mentions'], length: 3, _fields: [{identity: {low: 244, high: 0}, labels: ['Entity'], properties: {image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Seal_of_the_United_States_Department_of_Justice.svg/1024px-Seal_of_the_United_States_Department_of_Justice.svg.png', website: 'https://www.fbi.gov/', address: '935 Pennsylvania Ave., NW \nWashington, DC 20535-0001', aliases: 'FBI', phone: '1-202-324-3000', tty: '', name: 'Federal Bureau of Investigation', type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', tollfree: '1-800-225-5324'}}, 0.3110626065114047, {low: 153, high: 0}], _fieldLookup: {node: 0, entityScore: 1, mentions: 2}}, {keys: ['node', 'entityScore', 'mentions'], length: 3, _fields: [{identity: {low: 225, high: 0}, labels: ['Entity'], properties: {image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Seal_of_the_United_States_Department_of_Homeland_Security.svg/1000px-Seal_of_the_United_States_Department_of_Homeland_Security.svg.png', website: 'https://www.ice.gov/', address: '500 12th St., SW \nWashington, DC 20024', aliases: 'ICE', phone: '1-802-872-6199', tty: '1-802-872-6196', name: 'Immigration and Customs Enforcement', type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', tollfree: '1-866-347-2423'}}, 0.3089203100651503, {low: 29, high: 0}], _fieldLookup: {node: 0, entityScore: 1, mentions: 2}}], summary: {query: {text: 'CALL gds.pageRank.stream({\n\t\t\t\t\t\tnodeQuery: \'WITH ["AFAP 01.pdf_0","TM 5-698-6.pdf_0","CJCSM 6510.01B.pdf_0","AEDP 07.pdf_0","CJCSM 3150.24E.pdf_0","STANAG 4607.pdf_0","DoDFMR V2BCH18.pdf_0","CJCSI 5501.01G.pdf_0","AFMAN 15-124.pdf_0","DoD 5240.01-R CH 2.pdf_0","TM 5-689.pdf_0","AFH 36-2235V5.pdf_0","AMedP 7.5.pdf_0","STANAG 7023.pdf_0","DoD 4145.26-M CH 2.pdf_0","DoDFMR V8CH6.pdf_0","AFMAN 91-201.pdf_0","AJMedP 4-5.pdf_0","AECTP 400.pdf_0","AEDP 19.pdf_0","STANAG 5066.pdf_0","AEP 84.1.pdf_0","AEDP 15-IDD.pdf_0","TM 5-803-5.pdf_0","AEDP 06.pdf_0","ATP 99.pdf_0","AR 608-10.pdf_0","AEDP 17.pdf_0","AFMAN 38-102.pdf_0","AMSP 04.pdf_0","AEP 84.2.pdf_0","DoD 4650.1-R-1.pdf_0","AFMAN 16-101.pdf_0","AOP 52.pdf_0","AOP 43.pdf_0","PAM 385-64.pdf_0","PAM 385-65.pdf_0","AFMAN 11-2B-1V2.pdf_0","SRD 1_to_AJMedP-3.pdf_0","Title 10.pdf_0","AR 725-50.pdf_0","PAM 5-11.pdf_0","AFMAN 11-2U-2V2.pdf_0","AASTP 01.pdf_0","ADatP 34.pdf_0","AFMAN 11-2B-2V2.pdf_0","AEP 84_VOLII.pdf_0","AEP 67.pdf_0","AFMAN 20-116.pdf_0","Title 37.pdf_0","ANEP 77_PART3.pdf_0","STANAG 4560.pdf_0","Title 15.pdf_0","FM 7-100.1.pdf_0","TC 3-09.81.pdf_0","AFMAN 11-2F-15V1.pdf_0","AFI 65-508.pdf_0","Title 32.pdf_0","TC 7-22.7.pdf_0","ATP 4-02.84.pdf_0","AR 350-10.pdf_0","AOP 20.pdf_0","Title 17.pdf_0","AR 710-1.pdf_0","AFTTP 3-2.46.pdf_0","Title 28 Appendix.pdf_0"] AS ids OPTIONAL MATCH (d:Document)-[:MENTIONS]->(e:Entity) WHERE d.doc_id IN ids AND e.type = "organization" AND NOT e.name = "" RETURN id(d) as id UNION WITH ["AFAP 01.pdf_0","TM 5-698-6.pdf_0","CJCSM 6510.01B.pdf_0","AEDP 07.pdf_0","CJCSM 3150.24E.pdf_0","STANAG 4607.pdf_0","DoDFMR V2BCH18.pdf_0","CJCSI 5501.01G.pdf_0","AFMAN 15-124.pdf_0","DoD 5240.01-R CH 2.pdf_0","TM 5-689.pdf_0","AFH 36-2235V5.pdf_0","AMedP 7.5.pdf_0","STANAG 7023.pdf_0","DoD 4145.26-M CH 2.pdf_0","DoDFMR V8CH6.pdf_0","AFMAN 91-201.pdf_0","AJMedP 4-5.pdf_0","AECTP 400.pdf_0","AEDP 19.pdf_0","STANAG 5066.pdf_0","AEP 84.1.pdf_0","AEDP 15-IDD.pdf_0","TM 5-803-5.pdf_0","AEDP 06.pdf_0","ATP 99.pdf_0","AR 608-10.pdf_0","AEDP 17.pdf_0","AFMAN 38-102.pdf_0","AMSP 04.pdf_0","AEP 84.2.pdf_0","DoD 4650.1-R-1.pdf_0","AFMAN 16-101.pdf_0","AOP 52.pdf_0","AOP 43.pdf_0","PAM 385-64.pdf_0","PAM 385-65.pdf_0","AFMAN 11-2B-1V2.pdf_0","SRD 1_to_AJMedP-3.pdf_0","Title 10.pdf_0","AR 725-50.pdf_0","PAM 5-11.pdf_0","AFMAN 11-2U-2V2.pdf_0","AASTP 01.pdf_0","ADatP 34.pdf_0","AFMAN 11-2B-2V2.pdf_0","AEP 84_VOLII.pdf_0","AEP 67.pdf_0","AFMAN 20-116.pdf_0","Title 37.pdf_0","ANEP 77_PART3.pdf_0","STANAG 4560.pdf_0","Title 15.pdf_0","FM 7-100.1.pdf_0","TC 3-09.81.pdf_0","AFMAN 11-2F-15V1.pdf_0","AFI 65-508.pdf_0","Title 32.pdf_0","TC 7-22.7.pdf_0","ATP 4-02.84.pdf_0","AR 350-10.pdf_0","AOP 20.pdf_0","Title 17.pdf_0","AR 710-1.pdf_0","AFTTP 3-2.46.pdf_0","Title 28 Appendix.pdf_0"] AS ids OPTIONAL MATCH (d:Document)-[:MENTIONS]->(e:Entity) WHERE d.doc_id IN ids AND NOT e.name = "" RETURN id(e) as id\',\n\t\t\t\t\t\trelationshipQuery: \'WITH ["AFAP 01.pdf_0","TM 5-698-6.pdf_0","CJCSM 6510.01B.pdf_0","AEDP 07.pdf_0","CJCSM 3150.24E.pdf_0","STANAG 4607.pdf_0","DoDFMR V2BCH18.pdf_0","CJCSI 5501.01G.pdf_0","AFMAN 15-124.pdf_0","DoD 5240.01-R CH 2.pdf_0","TM 5-689.pdf_0","AFH 36-2235V5.pdf_0","AMedP 7.5.pdf_0","STANAG 7023.pdf_0","DoD 4145.26-M CH 2.pdf_0","DoDFMR V8CH6.pdf_0","AFMAN 91-201.pdf_0","AJMedP 4-5.pdf_0","AECTP 400.pdf_0","AEDP 19.pdf_0","STANAG 5066.pdf_0","AEP 84.1.pdf_0","AEDP 15-IDD.pdf_0","TM 5-803-5.pdf_0","AEDP 06.pdf_0","ATP 99.pdf_0","AR 608-10.pdf_0","AEDP 17.pdf_0","AFMAN 38-102.pdf_0","AMSP 04.pdf_0","AEP 84.2.pdf_0","DoD 4650.1-R-1.pdf_0","AFMAN 16-101.pdf_0","AOP 52.pdf_0","AOP 43.pdf_0","PAM 385-64.pdf_0","PAM 385-65.pdf_0","AFMAN 11-2B-1V2.pdf_0","SRD 1_to_AJMedP-3.pdf_0","Title 10.pdf_0","AR 725-50.pdf_0","PAM 5-11.pdf_0","AFMAN 11-2U-2V2.pdf_0","AASTP 01.pdf_0","ADatP 34.pdf_0","AFMAN 11-2B-2V2.pdf_0","AEP 84_VOLII.pdf_0","AEP 67.pdf_0","AFMAN 20-116.pdf_0","Title 37.pdf_0","ANEP 77_PART3.pdf_0","STANAG 4560.pdf_0","Title 15.pdf_0","FM 7-100.1.pdf_0","TC 3-09.81.pdf_0","AFMAN 11-2F-15V1.pdf_0","AFI 65-508.pdf_0","Title 32.pdf_0","TC 7-22.7.pdf_0","ATP 4-02.84.pdf_0","AR 350-10.pdf_0","AOP 20.pdf_0","Title 17.pdf_0","AR 710-1.pdf_0","AFTTP 3-2.46.pdf_0","Title 28 Appendix.pdf_0"] AS ids OPTIONAL MATCH (d:Document)-[m:MENTIONS]->(e:Entity) WHERE d.doc_id IN ids AND e.type = "organization" AND NOT e.name = "" RETURN id(d) as source, id(e) as target, type(m) as type, m.count as weight\',\n\t\t\t\t\t\tmaxIterations: 20,\n\t\t\t\t\t\tdampingFactor: 0.85,\n\t\t\t\t\t\trelationshipWeightProperty: \'weight\'\n\t\t\t\t\t\t})\n\t\t\t\t\t\tYIELD nodeId, score\n\t\t\t\t\t\tWITH ["AFAP 01.pdf_0","TM 5-698-6.pdf_0","CJCSM 6510.01B.pdf_0","AEDP 07.pdf_0","CJCSM 3150.24E.pdf_0","STANAG 4607.pdf_0","DoDFMR V2BCH18.pdf_0","CJCSI 5501.01G.pdf_0","AFMAN 15-124.pdf_0","DoD 5240.01-R CH 2.pdf_0","TM 5-689.pdf_0","AFH 36-2235V5.pdf_0","AMedP 7.5.pdf_0","STANAG 7023.pdf_0","DoD 4145.26-M CH 2.pdf_0","DoDFMR V8CH6.pdf_0","AFMAN 91-201.pdf_0","AJMedP 4-5.pdf_0","AECTP 400.pdf_0","AEDP 19.pdf_0","STANAG 5066.pdf_0","AEP 84.1.pdf_0","AEDP 15-IDD.pdf_0","TM 5-803-5.pdf_0","AEDP 06.pdf_0","ATP 99.pdf_0","AR 608-10.pdf_0","AEDP 17.pdf_0","AFMAN 38-102.pdf_0","AMSP 04.pdf_0","AEP 84.2.pdf_0","DoD 4650.1-R-1.pdf_0","AFMAN 16-101.pdf_0","AOP 52.pdf_0","AOP 43.pdf_0","PAM 385-64.pdf_0","PAM 385-65.pdf_0","AFMAN 11-2B-1V2.pdf_0","SRD 1_to_AJMedP-3.pdf_0","Title 10.pdf_0","AR 725-50.pdf_0","PAM 5-11.pdf_0","AFMAN 11-2U-2V2.pdf_0","AASTP 01.pdf_0","ADatP 34.pdf_0","AFMAN 11-2B-2V2.pdf_0","AEP 84_VOLII.pdf_0","AEP 67.pdf_0","AFMAN 20-116.pdf_0","Title 37.pdf_0","ANEP 77_PART3.pdf_0","STANAG 4560.pdf_0","Title 15.pdf_0","FM 7-100.1.pdf_0","TC 3-09.81.pdf_0","AFMAN 11-2F-15V1.pdf_0","AFI 65-508.pdf_0","Title 32.pdf_0","TC 7-22.7.pdf_0","ATP 4-02.84.pdf_0","AR 350-10.pdf_0","AOP 20.pdf_0","Title 17.pdf_0","AR 710-1.pdf_0","AFTTP 3-2.46.pdf_0","Title 28 Appendix.pdf_0"] AS ids, nodeId, score\n\t\t\t\t\t\tOPTIONAL MATCH (d:Document)-[m:MENTIONS]->(e:Entity)\n\t\t\t\t\t\tWHERE id(e) = nodeId AND d.doc_id in ids\n\t\t\t\t\t\tRETURN DISTINCT gds.util.asNode(nodeId) as node, score as entityScore, sum(m.count) as mentions\n\t\t\t\t\t\tORDER BY entityScore DESC, mentions DESC LIMIT 10;', parameters: {}}, queryType: 'r', counters: {_stats: {nodesCreated: 0, nodesDeleted: 0, relationshipsCreated: 0, relationshipsDeleted: 0, propertiesSet: 0, labelsAdded: 0, labelsRemoved: 0, indexesAdded: 0, indexesRemoved: 0, constraintsAdded: 0, constraintsRemoved: 0}, _systemUpdates: 0}, updateStatistics: {_stats: {nodesCreated: 0, nodesDeleted: 0, relationshipsCreated: 0, relationshipsDeleted: 0, propertiesSet: 0, labelsAdded: 0, labelsRemoved: 0, indexesAdded: 0, indexesRemoved: 0, constraintsAdded: 0, constraintsRemoved: 0}, _systemUpdates: 0}, plan: false, profile: false, notifications: [], server: {address: '10.194.9.69:7687', version: 'Neo4j/4.2.3', protocolVersion: 4.2}, resultConsumedAfter: {low: 938, high: 0}, resultAvailableAfter: {low: 1, high: 0}, database: {name: 'neo4j'}}}},
				{result: {records: [{keys: ['node', 'topicScore'], length: 2, _fields: [{identity: {low: 514, high: 0}, labels: ['Topic'], properties: {name: 'Edition Version'}}, 0.7090060032904149], _fieldLookup: {node: 0, topicScore: 1}}, {keys: ['node', 'topicScore'], length: 2, _fields: [{identity: {low: 21202, high: 0}, labels: ['Topic'], properties: {name: 'Afman'}}, 0.4876853798516095], _fieldLookup: {node: 0, topicScore: 1}}, {keys: ['node', 'topicScore'], length: 2, _fields: [{identity: {low: 7920, high: 0}, labels: ['Topic'], properties: {name: 'Stanag'}}, 0.41504038870334625], _fieldLookup: {node: 0, topicScore: 1}}, {keys: ['node', 'topicScore'], length: 2, _fields: [{identity: {low: 93755, high: 0}, labels: ['Topic'], properties: {name: 'Subsec'}}, 0.34730036593973634], _fieldLookup: {node: 0, topicScore: 1}}, {keys: ['node', 'topicScore'], length: 2, _fields: [{identity: {low: 74245, high: 0}, labels: ['Topic'], properties: {name: 'Explosives'}}, 0.3136272979900241], _fieldLookup: {node: 0, topicScore: 1}}, {keys: ['node', 'topicScore'], length: 2, _fields: [{identity: {low: 845, high: 0}, labels: ['Topic'], properties: {name: 'Shall'}}, 0.2639428423717618], _fieldLookup: {node: 0, topicScore: 1}}, {keys: ['node', 'topicScore'], length: 2, _fields: [{identity: {low: 5012, high: 0}, labels: ['Topic'], properties: {name: 'Flight'}}, 0.24890241026878357], _fieldLookup: {node: 0, topicScore: 1}}, {keys: ['node', 'topicScore'], length: 2, _fields: [{identity: {low: 697606, high: 0}, labels: ['Topic'], properties: {name: 'Opfor'}}, 0.23442314155399802], _fieldLookup: {node: 0, topicScore: 1}}, {keys: ['node', 'topicScore'], length: 2, _fields: [{identity: {low: 310933, high: 0}, labels: ['Topic'], properties: {name: 'Message'}}, 0.2340165665373206], _fieldLookup: {node: 0, topicScore: 1}}, {keys: ['node', 'topicScore'], length: 2, _fields: [{identity: {low: 9273, high: 0}, labels: ['Topic'], properties: {name: 'Subsection'}}, 0.23277708729729057], _fieldLookup: {node: 0, topicScore: 1}}], summary: {query: {text: 'CALL gds.pageRank.stream({\n\t\t\t\t\t\t\tnodeQuery: \'WITH ["AFAP 01.pdf_0","TM 5-698-6.pdf_0","CJCSM 6510.01B.pdf_0","AEDP 07.pdf_0","CJCSM 3150.24E.pdf_0","STANAG 4607.pdf_0","DoDFMR V2BCH18.pdf_0","CJCSI 5501.01G.pdf_0","AFMAN 15-124.pdf_0","DoD 5240.01-R CH 2.pdf_0","TM 5-689.pdf_0","AFH 36-2235V5.pdf_0","AMedP 7.5.pdf_0","STANAG 7023.pdf_0","DoD 4145.26-M CH 2.pdf_0","DoDFMR V8CH6.pdf_0","AFMAN 91-201.pdf_0","AJMedP 4-5.pdf_0","AECTP 400.pdf_0","AEDP 19.pdf_0","STANAG 5066.pdf_0","AEP 84.1.pdf_0","AEDP 15-IDD.pdf_0","TM 5-803-5.pdf_0","AEDP 06.pdf_0","ATP 99.pdf_0","AR 608-10.pdf_0","AEDP 17.pdf_0","AFMAN 38-102.pdf_0","AMSP 04.pdf_0","AEP 84.2.pdf_0","DoD 4650.1-R-1.pdf_0","AFMAN 16-101.pdf_0","AOP 52.pdf_0","AOP 43.pdf_0","PAM 385-64.pdf_0","PAM 385-65.pdf_0","AFMAN 11-2B-1V2.pdf_0","SRD 1_to_AJMedP-3.pdf_0","Title 10.pdf_0","AR 725-50.pdf_0","PAM 5-11.pdf_0","AFMAN 11-2U-2V2.pdf_0","AASTP 01.pdf_0","ADatP 34.pdf_0","AFMAN 11-2B-2V2.pdf_0","AEP 84_VOLII.pdf_0","AEP 67.pdf_0","AFMAN 20-116.pdf_0","Title 37.pdf_0","ANEP 77_PART3.pdf_0","STANAG 4560.pdf_0","Title 15.pdf_0","FM 7-100.1.pdf_0","TC 3-09.81.pdf_0","AFMAN 11-2F-15V1.pdf_0","AFI 65-508.pdf_0","Title 32.pdf_0","TC 7-22.7.pdf_0","ATP 4-02.84.pdf_0","AR 350-10.pdf_0","AOP 20.pdf_0","Title 17.pdf_0","AR 710-1.pdf_0","AFTTP 3-2.46.pdf_0","Title 28 Appendix.pdf_0"] AS ids OPTIONAL MATCH (d:Document)-[:CONTAINS]->(t:Topic) WHERE d.doc_id IN ids RETURN id(d) as id UNION WITH ["AFAP 01.pdf_0","TM 5-698-6.pdf_0","CJCSM 6510.01B.pdf_0","AEDP 07.pdf_0","CJCSM 3150.24E.pdf_0","STANAG 4607.pdf_0","DoDFMR V2BCH18.pdf_0","CJCSI 5501.01G.pdf_0","AFMAN 15-124.pdf_0","DoD 5240.01-R CH 2.pdf_0","TM 5-689.pdf_0","AFH 36-2235V5.pdf_0","AMedP 7.5.pdf_0","STANAG 7023.pdf_0","DoD 4145.26-M CH 2.pdf_0","DoDFMR V8CH6.pdf_0","AFMAN 91-201.pdf_0","AJMedP 4-5.pdf_0","AECTP 400.pdf_0","AEDP 19.pdf_0","STANAG 5066.pdf_0","AEP 84.1.pdf_0","AEDP 15-IDD.pdf_0","TM 5-803-5.pdf_0","AEDP 06.pdf_0","ATP 99.pdf_0","AR 608-10.pdf_0","AEDP 17.pdf_0","AFMAN 38-102.pdf_0","AMSP 04.pdf_0","AEP 84.2.pdf_0","DoD 4650.1-R-1.pdf_0","AFMAN 16-101.pdf_0","AOP 52.pdf_0","AOP 43.pdf_0","PAM 385-64.pdf_0","PAM 385-65.pdf_0","AFMAN 11-2B-1V2.pdf_0","SRD 1_to_AJMedP-3.pdf_0","Title 10.pdf_0","AR 725-50.pdf_0","PAM 5-11.pdf_0","AFMAN 11-2U-2V2.pdf_0","AASTP 01.pdf_0","ADatP 34.pdf_0","AFMAN 11-2B-2V2.pdf_0","AEP 84_VOLII.pdf_0","AEP 67.pdf_0","AFMAN 20-116.pdf_0","Title 37.pdf_0","ANEP 77_PART3.pdf_0","STANAG 4560.pdf_0","Title 15.pdf_0","FM 7-100.1.pdf_0","TC 3-09.81.pdf_0","AFMAN 11-2F-15V1.pdf_0","AFI 65-508.pdf_0","Title 32.pdf_0","TC 7-22.7.pdf_0","ATP 4-02.84.pdf_0","AR 350-10.pdf_0","AOP 20.pdf_0","Title 17.pdf_0","AR 710-1.pdf_0","AFTTP 3-2.46.pdf_0","Title 28 Appendix.pdf_0"] AS ids OPTIONAL MATCH (d:Document)-[:CONTAINS]->(t:Topic) WHERE d.doc_id IN ids RETURN id(t) as id\',\n\t\t\t\t\t\t\trelationshipQuery: \'WITH ["AFAP 01.pdf_0","TM 5-698-6.pdf_0","CJCSM 6510.01B.pdf_0","AEDP 07.pdf_0","CJCSM 3150.24E.pdf_0","STANAG 4607.pdf_0","DoDFMR V2BCH18.pdf_0","CJCSI 5501.01G.pdf_0","AFMAN 15-124.pdf_0","DoD 5240.01-R CH 2.pdf_0","TM 5-689.pdf_0","AFH 36-2235V5.pdf_0","AMedP 7.5.pdf_0","STANAG 7023.pdf_0","DoD 4145.26-M CH 2.pdf_0","DoDFMR V8CH6.pdf_0","AFMAN 91-201.pdf_0","AJMedP 4-5.pdf_0","AECTP 400.pdf_0","AEDP 19.pdf_0","STANAG 5066.pdf_0","AEP 84.1.pdf_0","AEDP 15-IDD.pdf_0","TM 5-803-5.pdf_0","AEDP 06.pdf_0","ATP 99.pdf_0","AR 608-10.pdf_0","AEDP 17.pdf_0","AFMAN 38-102.pdf_0","AMSP 04.pdf_0","AEP 84.2.pdf_0","DoD 4650.1-R-1.pdf_0","AFMAN 16-101.pdf_0","AOP 52.pdf_0","AOP 43.pdf_0","PAM 385-64.pdf_0","PAM 385-65.pdf_0","AFMAN 11-2B-1V2.pdf_0","SRD 1_to_AJMedP-3.pdf_0","Title 10.pdf_0","AR 725-50.pdf_0","PAM 5-11.pdf_0","AFMAN 11-2U-2V2.pdf_0","AASTP 01.pdf_0","ADatP 34.pdf_0","AFMAN 11-2B-2V2.pdf_0","AEP 84_VOLII.pdf_0","AEP 67.pdf_0","AFMAN 20-116.pdf_0","Title 37.pdf_0","ANEP 77_PART3.pdf_0","STANAG 4560.pdf_0","Title 15.pdf_0","FM 7-100.1.pdf_0","TC 3-09.81.pdf_0","AFMAN 11-2F-15V1.pdf_0","AFI 65-508.pdf_0","Title 32.pdf_0","TC 7-22.7.pdf_0","ATP 4-02.84.pdf_0","AR 350-10.pdf_0","AOP 20.pdf_0","Title 17.pdf_0","AR 710-1.pdf_0","AFTTP 3-2.46.pdf_0","Title 28 Appendix.pdf_0"] AS ids OPTIONAL MATCH (d:Document)-[c:CONTAINS]->(t:Topic) WHERE d.doc_id IN ids RETURN id(d) as source, id(t) as target, type(c) as type, c.relevancy as weight\',\n\t\t\t\t\t\t\tmaxIterations: 20,\n\t\t\t\t\t\t\tdampingFactor: 0.85,\n\t\t\t\t\t\t\trelationshipWeightProperty: \'weight\'\n\t\t\t\t\t\t\t})\n\t\t\t\t\t\t\tYIELD nodeId, score\n\t\t\t\t\t\t\tWITH ["AFAP 01.pdf_0","TM 5-698-6.pdf_0","CJCSM 6510.01B.pdf_0","AEDP 07.pdf_0","CJCSM 3150.24E.pdf_0","STANAG 4607.pdf_0","DoDFMR V2BCH18.pdf_0","CJCSI 5501.01G.pdf_0","AFMAN 15-124.pdf_0","DoD 5240.01-R CH 2.pdf_0","TM 5-689.pdf_0","AFH 36-2235V5.pdf_0","AMedP 7.5.pdf_0","STANAG 7023.pdf_0","DoD 4145.26-M CH 2.pdf_0","DoDFMR V8CH6.pdf_0","AFMAN 91-201.pdf_0","AJMedP 4-5.pdf_0","AECTP 400.pdf_0","AEDP 19.pdf_0","STANAG 5066.pdf_0","AEP 84.1.pdf_0","AEDP 15-IDD.pdf_0","TM 5-803-5.pdf_0","AEDP 06.pdf_0","ATP 99.pdf_0","AR 608-10.pdf_0","AEDP 17.pdf_0","AFMAN 38-102.pdf_0","AMSP 04.pdf_0","AEP 84.2.pdf_0","DoD 4650.1-R-1.pdf_0","AFMAN 16-101.pdf_0","AOP 52.pdf_0","AOP 43.pdf_0","PAM 385-64.pdf_0","PAM 385-65.pdf_0","AFMAN 11-2B-1V2.pdf_0","SRD 1_to_AJMedP-3.pdf_0","Title 10.pdf_0","AR 725-50.pdf_0","PAM 5-11.pdf_0","AFMAN 11-2U-2V2.pdf_0","AASTP 01.pdf_0","ADatP 34.pdf_0","AFMAN 11-2B-2V2.pdf_0","AEP 84_VOLII.pdf_0","AEP 67.pdf_0","AFMAN 20-116.pdf_0","Title 37.pdf_0","ANEP 77_PART3.pdf_0","STANAG 4560.pdf_0","Title 15.pdf_0","FM 7-100.1.pdf_0","TC 3-09.81.pdf_0","AFMAN 11-2F-15V1.pdf_0","AFI 65-508.pdf_0","Title 32.pdf_0","TC 7-22.7.pdf_0","ATP 4-02.84.pdf_0","AR 350-10.pdf_0","AOP 20.pdf_0","Title 17.pdf_0","AR 710-1.pdf_0","AFTTP 3-2.46.pdf_0","Title 28 Appendix.pdf_0"] AS ids, nodeId, score\n\t\t\t\t\t\t\tOPTIONAL MATCH (d:Document)-[c:CONTAINS]->(t:Topic)\n\t\t\t\t\t\t\tWHERE id(t) = nodeId AND d.doc_id in ids\n\t\t\t\t\t\t\tRETURN DISTINCT gds.util.asNode(nodeId) as node, score as topicScore\n\t\t\t\t\t\t\tORDER BY topicScore DESC LIMIT 10;', parameters: {}}, queryType: 'r', counters: {_stats: {nodesCreated: 0, nodesDeleted: 0, relationshipsCreated: 0, relationshipsDeleted: 0, propertiesSet: 0, labelsAdded: 0, labelsRemoved: 0, indexesAdded: 0, indexesRemoved: 0, constraintsAdded: 0, constraintsRemoved: 0}, _systemUpdates: 0}, updateStatistics: {_stats: {nodesCreated: 0, nodesDeleted: 0, relationshipsCreated: 0, relationshipsDeleted: 0, propertiesSet: 0, labelsAdded: 0, labelsRemoved: 0, indexesAdded: 0, indexesRemoved: 0, constraintsAdded: 0, constraintsRemoved: 0}, _systemUpdates: 0}, plan: false, profile: false, notifications: [], server: {address: '10.194.9.69:7687', version: 'Neo4j/4.2.3', protocolVersion: 4.2}, resultConsumedAfter: {low: 330, high: 0}, resultAvailableAfter: {low: 0, high: 0}, database: {name: 'neo4j'}}}}
			];

			const esResultsMock = {body: {took: 217, timed_out: false, _shards: {total: 3, successful: 3, skipped: 0, failed: 0}, hits: {total: {value: 66, relation: 'eq'}, max_score: 17.558594, hits: [{_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '2772163d062f399636a14a11b854ac5f4efb1c58a822539aa8320389b6af6285', _score: 17.558594, fields: {id: ['AFAP 01.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'dd4514d240ff2a99a2d22e763f58f03a26f4d6fd6d87ef044900b1530cf01d8e', _score: 17.020994, fields: {id: ['TM 5-698-6.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '71c96e9e6a8d04ba25181c2a6b6d2a1bc7a90045b6a2a15a405de259ad32561c', _score: 16.780403, fields: {id: ['CJCSM 6510.01B.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '20207ab41c098194025db15e5210e9928205b9597f7c3e1b4ce8cf2d6fe50f6c', _score: 16.18494, fields: {id: ['AEDP 07.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '40a91e42cebea4510f3a1dd12924959fd01ee5fff11f11545925f8e8047f60df', _score: 16.047344, fields: {id: ['CJCSM 3150.24E.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '9abf699988d52dde8398e3c1cedc8f4d41c8167be17ae2c49fc367d76dff7de8', _score: 15.974639, fields: {id: ['STANAG 4607.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '432e47cff5f4891b69be7ec3e6ccf05651fa4d35b15a5bfcecdb46d6f32bda31', _score: 13.87324, fields: {id: ['CJCSI 5501.01G.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'b3fa252962b78ff50dec4b72a50a2c7dc7f47eb21437f619af2e8721c12bb806', _score: 13.868405, fields: {id: ['DoDFMR V2BCH18.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'f7fa41991a9f8df145cfbfd4d2d99c2e9bfc69ae443b6ff9f769099cd7b91df4', _score: 13.5843525, fields: {id: ['AFMAN 15-124.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '23aaa31ae619c45aa89d66e49b3316f7b87206c97ccb41b99b1fc01c22329d8d', _score: 12.950979, fields: {id: ['DoD 5240.01-R CH 2.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '3b8da91d8a1990d4ac394ca5979b9607bccff5931ce3f5f4a606d6e00d7e2f6c', _score: 12.921222, fields: {id: ['TM 5-689.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '2a10eab8cea75e3c68a9c22efbb2e8d128e3efc4af3b6af494d127e70f85a8f9', _score: 12.840764, fields: {id: ['AFH 36-2235V5.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'f14339a5b1c7e2d3356da4d8b1e306e5a74596e53b0fba4646a47b458bb06650', _score: 12.563835, fields: {id: ['AMedP 7.5.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '9d9da9d01baa2c849a394083c75c509c2b13fa2040780c70c2f244194ca2acec', _score: 12.516103, fields: {id: ['STANAG 7023.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'aa2e9bfabf6ef3251bc96cd1582df5777aa03cb9118021bd195b85f703ab2332', _score: 12.230325, fields: {id: ['DoD 4145.26-M CH 2.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '564f064f3a570e9ac630657547f5bc4ebcdf818c2d7bf52e772bc66fe185fb21', _score: 12.140279, fields: {id: ['DoDFMR V8CH6.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '854e9914202812da6a4579f1cc5dcd429d71b23ecf37d57008f24a5d575e4062', _score: 11.73031, fields: {id: ['AFMAN 91-201.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '912820368cb213bb8058e0b0261c2881fb1ad5b68198d9b8f7781fab18f7dd9a', _score: 11.71288, fields: {id: ['AJMedP 4-5.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '72c50469c8be702b475353c1d4e99ef39363a9e8b45498246b189980cb3accaf', _score: 11.491499, fields: {id: ['AECTP 400.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '04e446c81b40d497744d825ffa10874b3fc8f7c720659944335fd696b45559c0', _score: 10.335519, fields: {id: ['AEDP 19.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '9c053722c727b928a9b54ce7ad98e8e49e57cecaf8d1287c70cf15c83b896a23', _score: 10.161421, fields: {id: ['STANAG 5066.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'ad642eb69dacfed488e6a1df4f2f71ca78e56ab97450170f08ee57c821bdb6ad', _score: 9.569378, fields: {id: ['AEP 84.1.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'e475eed67e23a14b91fbcff3858ecde735d9ae05e690da79e344db32a199da53', _score: 9.343199, fields: {id: ['AEDP 15-IDD.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '76c86193ab95fc36a0df07941f2586987a019a8cb37dacfb40de36493bb3b752', _score: 9.298162, fields: {id: ['TM 5-803-5.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '577ff596f6e3608e00c7083c1963a61866d6d87930a8518483114790914344b8', _score: 8.868496, fields: {id: ['AEDP 06.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'c86247ac852004a961e56c6edddac4e80975f33a9f2b3e1125991f40c45e6f12', _score: 8.868496, fields: {id: ['ATP 99.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '2128714e0ff88476ad5990f196f0e50b9d01283643c9baf78642ada0cefd9e65', _score: 8.417196, fields: {id: ['AR 608-10.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'a9fb2ad2a28e5e62080a2f012938d6d94aad652a5457f5c1795fdcbaf1f7c4f9', _score: 8.0828495, fields: {id: ['AEDP 17.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'da53e5582d570d0363a029708d596066b2cd90d6cf345cfdc008f767b64ca68a', _score: 7.9501824, fields: {id: ['AFMAN 38-102.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '0dc84799b5ce6dc148a237849b76cee2adde44e4c3c545b5aa94b5bf01f56d10', _score: 7.7646465, fields: {id: ['AMSP 04.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'f1c41afa4e965bf3d83f0de752c8cd74a8e69d3001ef3abf395d285a6c168044', _score: 7.6525187, fields: {id: ['AEP 84.2.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '1aa0f9e6423d6df1e460282fc04fe87060c18f9c7dabf84524cdcd3c1961757f', _score: 7.4843545, fields: {id: ['DoD 4650.1-R-1.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '76d111822c6dfb41adf68f2ecf316164f3d4fd67fab0ccbdf0e967b0687dacd5', _score: 7.4552298, fields: {id: ['AFMAN 16-101.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'dc228447c95328a5f572f6068164cfeaa0edbe44356afbe909f5c4c24ae35ea8', _score: 7.3030577, fields: {id: ['AOP 52.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'f248eb49c49d4701b5ef17417b98d9bc427ce29ecd66de2272e579ba62d738f0', _score: 7.16927, fields: {id: ['AOP 43.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'b112334b3a890986d307c553d6af70df601fb1bd4aad210a8ff1ce72ac8ee8db', _score: 7.1209927, fields: {id: ['PAM 385-64.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '181915828794e38aa66a1cab32545afd071525c29dbe9b50115aa55f1b40a88e', _score: 7.0430384, fields: {id: ['PAM 385-65.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '5a2d1e8a84267601c2425aa461a24911fe99e897a1de66341f0dab88b206cc90', _score: 6.930506, fields: {id: ['AFMAN 11-2B-1V2.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '408e034676f0ff96c44c127a430b972737c893fc1e7411d026dbfa835ab6567b', _score: 6.833274, fields: {id: ['SRD 1_to_AJMedP-3.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '4cf98c3e541861ad75a929be635a08bd88a605425c52f7827578536911311185', _score: 6.644114, fields: {id: ['Title 10.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'a43da44409ac78731adb43d381efa72bb204daa652cf3d488cf3da44cd60ac47', _score: 6.4755006, fields: {id: ['AR 725-50.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '2f7ed3a48b96c03e50baa3abed17c21fbbe6f00eb34741dfefc8f7d234c71d2a', _score: 6.426085, fields: {id: ['PAM 5-11.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '0ca56b448f689d2538ed7735dd4a59c7977fb01681bb2dee9783624106c5223d', _score: 6.3017597, fields: {id: ['AFMAN 11-2U-2V2.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '79c18df88787bfc8c6254b9ff6338647da1a4ed63ce9ab45283b8ff090eac03c', _score: 6.2117414, fields: {id: ['ADatP 34.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '909037a83418c9501693455989a6a9a4d2742f32be3592ae1dbdef89b1134fa5', _score: 6.204473, fields: {id: ['AASTP 01.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'f99f93bd61fe8684d1347ff188e02184748c5219449424df1fb3509d974c5933', _score: 6.173989, fields: {id: ['AFMAN 11-2B-2V2.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'e4bbfcb77d178a5303abde3f6803dcb4647228389f37d1a68a7a4f95979bfceb', _score: 6.0767565, fields: {id: ['AEP 84_VOLII.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '3b3fa5d571e8bbbb090c0eb36f2d404eaf19a1fae5430241354187812659ee46', _score: 5.97734, fields: {id: ['AEP 67.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'afca25e7085f62ba9bac01cc25de8cfa619f608a7ea0864df7f2ddc8277cd4c0', _score: 5.933389, fields: {id: ['AFMAN 20-116.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '9e959d270c39faba2fb0bbbb696c279ee2e0cc6113794d0ec1c50ee46c19610b', _score: 5.903154, fields: {id: ['Title 37.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '443ea2488b68f3c91228aa98f535b14d9791ccf0d51fb63403ad6754a54acfeb', _score: 5.774547, fields: {id: ['STANAG 4560.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'ca78a0707d32a795466e9cbe386313d173e0f9e968f897f2dbeca8eafa1f0ffd', _score: 5.774547, fields: {id: ['ANEP 77_PART3.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '7c63ecaf96f17797722cbc12c1046dd8b93a30adae3395b591f31be2b705dc8c', _score: 5.709213, fields: {id: ['Title 15.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '2d0be2e415e80477b30eb88e43d73452917fcb99e1b6b27a646b5ab8a2673c20', _score: 5.689665, fields: {id: ['FM 7-100.1.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'a211a44d074fc367296678d0c85813630da11cca08111d0be0e62cd908d30ab9', _score: 5.6472383, fields: {id: ['TC 3-09.81.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '7f4fea56713b8ed1b0eed2490a4771dddbc4798707ac084c310b5b13510ebc3d', _score: 5.5251293, fields: {id: ['AFMAN 11-2F-15V1.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '40365f30d595a63c8b20ef15403f72942a4c13e019684a915d465169694b5dc2', _score: 5.375786, fields: {id: ['AFI 65-508.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '8c8ed4b0e793aba93dd71638cf71308cbf04afb6b0b4f30f0cb3cc9dcbaf78ff', _score: 5.1331277, fields: {id: ['TC 7-22.7.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '1cca0cf8eeafe267a6dfe73834a1e2c4c2c948e2d381405881792d56d9660dda', _score: 5.1331277, fields: {id: ['ATP 4-02.84.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '8d25fc8af6df957abd2bf2158f19a1e983c9f64bad3e708fe933fbd874631474', _score: 5.126054, fields: {id: ['Title 32.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'bd9ca3f49cc5b9b87fc001bc78ddb628e6c2b8f55fdb6a92e1c18679e6b706d1', _score: 5.1149654, fields: {id: ['AR 350-10.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '2e96e3fd5e4fcdd8a2ac77b60bb259ec32a045279562e255ba3190cd300f089b', _score: 5.0753736, fields: {id: ['AOP 20.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '6d36b33325cfcc6c577a9a1134ce0f09cd2164b570e39ecd45461b090e130058', _score: 4.9404974, fields: {id: ['Title 17.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'd2f72d1414b8a62bcd1e7bfa21c3926ee63f9bc0d701124d3e7604fccf136aa7', _score: 4.8947964, fields: {id: ['AFTTP 3-2.46.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: '9b9a93a5e87625bb9c1e42c86c6d83ba8905ce5b0ccd75b54a3eb9ff2e0167e1', _score: 4.8947964, fields: {id: ['AR 710-1.pdf_0']}}, {_index: 'gamechanger_20210402_reindex', _type: '_doc', _id: 'c682d6f254a9e204b32b08faa4e7310ea1c3b68aa1e86f83649997e704399bc5', _score: 4.448117, fields: {id: ['Title 28 Appendix.pdf_0']}}]}}, statusCode: 200, headers: {date: 'Tue, 13 Apr 2021 19:14:31 GMT', 'content-type': 'application/json; charset=UTF-8', 'content-length': '12446', connection: 'keep-alive', 'access-control-allow-origin': '*'}, meta: {context: null, request: {params: {method: 'POST', path: '/gamechanger/_search', body: '{"stored_fields":["id"],"from":0,"size":10000,"track_total_hits":true,"query":{"bool":{"must":[{"nested":{"path":"paragraphs","query":{"bool":{"should":[{"wildcard":{"paragraphs.filename.search":{"value":"undefined*","boost":15}}},{"query_string":{"query":"undefined","default_field":"paragraphs.par_raw_text_t","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO"}}]}}}},{"query_string":{"query":"is_revoked_b:false"}},{"query_string":{"query":"display_org_s:(*) AND display_doc_type_s:(*)"}}],"should":[{"multi_match":{"query":"undefined","fields":["keyw_5^2","id^2","summary_30","paragraphs.par_raw_text_t"],"operator":"or"}},{"rank_feature":{"field":"pagerank_r","boost":0.5}},{"rank_feature":{"field":"kw_doc_score_r","boost":0.1}}]}}}', querystring: '', headers: {'user-agent': 'elasticsearch-js/7.11.0 (linux 4.19.121-linuxkit-x64; Node.js v10.9.0)', 'x-elastic-client-meta': 'es=7.11.0,js=10.9.0,t=7.11.0,hc=10.9.0', 'content-type': 'application/json', 'content-length': '758'}, timeout: 30000}, options: {}, id: 1}, name: 'elasticsearch-js', connection: {url: 'https://10.192.45.84/', id: 'https://10.192.45.84/', headers: {}, deadCount: 0, resurrectTimeout: 0, _openRequests: 0, status: 'alive', roles: {master: true, data: true, ingest: true, ml: false}}, attempts: 0, aborted: false}};

			graphDataResultsMock.forEach(record => {
				const records = [];
				record.result.records.forEach(rec => {
					records.push(new Record(rec.keys, rec._fields, rec._fieldLookup));
				});
				record.result.records = records;
			});

			const tmpOpts = {
				...opts,
				dataLibrary: {
					queryGraph() {
						return Promise.resolve(graphDataResultsMock.shift());
					},

					queryElasticSearch() {
						return Promise.resolve(esResultsMock);
					}
				}
			};

			const req = {
				...reqMock,
				body: {
					isTest: true,
					orgFilterString: '*',
					typeFilterString: '*',
					transformResults: false,
					cloneData: {
						id: 1,
						clone_name: 'gamechanger',
						display_name: 'GAMECHANGER',
						is_live: true,
						url: 'gamechanger',
						permissions_required: false,
						clone_to_advana: true,
						clone_to_gamechanger: true,
						clone_to_sipr: false,
						clone_to_jupiter: true,
						show_tutorial: true,
						show_graph: true,
						show_crowd_source: true,
						show_feedback: true,
						search_module: 'policy/policySearchHandler',
						export_module: 'simple/simpleExportHandler',
						title_bar_module: 'policy/policyTitleBarHandler',
						navigation_module: 'policy/policyNavigationHandler',
						card_module: 'policy/policyCardHandler',
						main_view_module: 'policy/policyMainViewHandler',
						graph_module: 'policy/policyGraphHandler',
						config: {esIndex: 'gamechanger'},
						createdAt: '2021-03-17T13:35:17.526Z',
						updatedAt: '2021-03-17T13:35:19.927Z'
					},
					index: '',
					orgFilter: {},
					typeFilter: {},
					useGCCache: false,
					searchFields: {initial: {field: null, input: ''}},
					accessDateFilter: [null, null],
					publicationDateFilter: [null, null],
					publicationDateAllTime: true,
					includeRevoked: false,
					searchText: 'artificial intelligence',
					cloneName: 'gamechanger',
					functionName: 'getDataForSearch'
				}
			};

			const target = new PolicyGraphHandler(tmpOpts);

			try {
				const actual = await target.callFunctionHelper(req, 'test');
				const expected = {entities: [{id: 55, label: 'Entity', properties: ['image', 'website', 'address', 'aliases', 'phone', 'tty', 'name', 'type', 'branch', 'tollfree'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Seal_of_the_General_Services_Administration.svg/1000px-Seal_of_the_General_Services_Administration.svg.png', website: 'https://www.gsa.gov/', address: '1800 F St., NW \nWashington, DC 20405', aliases: 'GSA', phone: '', tty: '', name: 'General Services Administration', pageRank: 0, type: 'organization', branch: 'Independent Agency', tollfree: '', value: 1, entityScore: 0.3419149370864034, mentions: 735}, {id: 122, label: 'Entity', properties: ['image', 'website', 'aliases', 'address', 'phone', 'tty', 'name', 'type', 'branch', 'tollfree'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Seal_of_the_United_States_Department_of_the_Air_Force.svg/1024px-Seal_of_the_United_States_Department_of_the_Air_Force.svg.png', website: 'https://www.af.mil/', aliases: 'USAF;AF;Air Force', address: '1690 Air Force Pentagon \nWashington, DC 20330-1670', phone: '', tty: '', name: 'United States Air Force', pageRank: 0, type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', tollfree: '1-800-423-8723', value: 1, entityScore: 1.120017509907484, mentions: 1391}, {id: 124, label: 'Entity', properties: ['Founded', 'aliases', 'Size', 'March', 'Website', 'Engagements', 'type', 'branch', 'Secretary_of_Defense', 'Mascot', 'Motto', 'Commander_in_Chief', 'Anniversaries', 'image', 'website', 'address', 'Headquarters', 'Sergeant_Major_of_the_Army', 'tollfree', 'Role', 'Type', 'Secretary_of_the_Army', 'Colors', 'Equipment', 'phone', 'Vice_Chief_of_Staff', 'tty', 'name', 'Country', 'Chief_of_Staff', 'Partof', 'Last_Retrieved'], Founded: '14June1775', aliases: 'USArmy; Army', Size: '480,893 Regular Army personnel 336,129 Army National Guard personnel 188,703 Army Reserve personnel 1,005,725 total uniformed personnel 252,747 civilian personnel 1,258,472 total4,406 manned aircraft', March: '\'The Army Goes Rolling Along\' Play', Website: 'Army.mil', Engagements: 'Revolutionary War War of 1812 MexicanAmerican War Civil War Indian Wars SpanishAmerican War China Relief Expedition PhilippineAmerican War Mexican Expedition World War I Russian Civil War Bonus Army suppression World War II Korean War 1958 Lebanon crisis Vietnam War Dominican Civil WarKorean DMZ Conflict Invasion of Grenada; Invasion of Panama Somali Civil War Persian Gulf War Kosovo War Global War on Terrorism War in Afghanistan Iraq War Operation Inherent Resolve Battle of Khasham', type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', Secretary_of_Defense: 'Lloyd Austin', Mascot: 'Army Mules', Motto: '\'This We\'ll Defend\'', Commander_in_Chief: 'President Joe Biden', Anniversaries: 'Army Birthday: 14 June', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Mark_of_the_United_States_Army.svg/1000px-Mark_of_the_United_States_Army.svg.png', website: 'https://www.army.mil/', address: 'The Pentagon \nWashington, DC 20310', Headquarters: 'The Pentagon Arlington County, Virginia, U.S.', Sergeant_Major_of_the_Army: 'SMA Michael A. Grinston', tollfree: '', Role: 'Combined arms maneuver and wide area security; Armored and mechanized operations; Airborne and air assault operations', Type: 'Army', Secretary_of_the_Army: 'John E. Whitley', Colors: 'Black, gold and white', Equipment: 'List of U.S. Army equipment', phone: '1-703-695-6518', Vice_Chief_of_Staff: 'GEN Joseph M. Martin', tty: '', name: 'United States Army', pageRank: 0, Country: 'United States', Chief_of_Staff: 'GEN James C. McConville', Partof: 'Department of the Army', Last_Retrieved: '2021/03/31-22:44:07 UTC', value: 1, entityScore: 1.4829699300229549, mentions: 433}, {id: 171, label: 'Entity', properties: ['image', 'website', 'address', 'aliases', 'phone', 'tty', 'name', 'type', 'branch', 'tollfree'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/United_States_Department_of_Defense_Seal.svg/1200px-United_States_Department_of_Defense_Seal.svg.png', website: 'https://www.nsa.gov/', address: '9800 Savage Rd. \nSuite 6272 \nFort Meade, MD 20755-6000', aliases: 'NSA', phone: '1-301-688-6311', tty: '', name: 'National Security Agency', pageRank: 0, type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', tollfree: '', value: 1, entityScore: 0.5695998930488713, mentions: 282}, {id: 173, label: 'Entity', properties: ['image', 'website', 'address', 'aliases', 'phone', 'tty', 'name', 'type', 'branch', 'tollfree'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Seal_of_the_United_States_Marine_Corps.svg/256px-Seal_of_the_United_States_Marine_Corps.svg.png', website: 'https://www.marines.mil/', address: '', aliases: 'USMC', phone: '', tty: '', name: 'United States Marine Corps', pageRank: 0, type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', tollfree: '1-800-627-4637', value: 1, entityScore: 0.3395379841327667, mentions: 127}, {id: 225, label: 'Entity', properties: ['image', 'website', 'address', 'aliases', 'phone', 'tty', 'name', 'type', 'branch', 'tollfree'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Seal_of_the_United_States_Department_of_Homeland_Security.svg/1000px-Seal_of_the_United_States_Department_of_Homeland_Security.svg.png', website: 'https://www.ice.gov/', address: '500 12th St., SW \nWashington, DC 20024', aliases: 'ICE', phone: '1-802-872-6199', tty: '1-802-872-6196', name: 'Immigration and Customs Enforcement', pageRank: 0, type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', tollfree: '1-866-347-2423', value: 1, entityScore: 0.3089203100651503, mentions: 29}, {id: 244, label: 'Entity', properties: ['image', 'website', 'address', 'aliases', 'phone', 'tty', 'name', 'type', 'branch', 'tollfree'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Seal_of_the_United_States_Department_of_Justice.svg/1024px-Seal_of_the_United_States_Department_of_Justice.svg.png', website: 'https://www.fbi.gov/', address: '935 Pennsylvania Ave., NW \nWashington, DC 20535-0001', aliases: 'FBI', phone: '1-202-324-3000', tty: '', name: 'Federal Bureau of Investigation', pageRank: 0, type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', tollfree: '1-800-225-5324', value: 1, entityScore: 0.3110626065114047, mentions: 153}, {id: 262, label: 'Entity', properties: ['image', 'website', 'address', 'aliases', 'phone', 'tty', 'name', 'type', 'branch', 'tollfree'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Seal_of_the_United_States_Department_of_Labor.svg/1000px-Seal_of_the_United_States_Department_of_Labor.svg.png', website: 'https://www.osha.gov/', address: '', aliases: 'OSHA', phone: '', tty: '1-877-889-5627', name: 'Occupational Safety and Health Administration', pageRank: 0, type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', tollfree: '1-800-321-6742', value: 1, entityScore: 0.5023601417429746, mentions: 242}, {id: 296, label: 'Entity', properties: ['image', 'website', 'address', 'aliases', 'phone', 'tty', 'name', 'type', 'branch', 'tollfree'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Seal_of_the_United_States_Department_of_Transportation.svg/1000px-Seal_of_the_United_States_Department_of_Transportation.svg.png', website: 'https://www.faa.gov/', address: '800 Independence Ave., SW \nWashington, DC 20591', aliases: 'FAA', phone: '1-202-366-4000', tty: '', name: 'Federal Aviation Administration', pageRank: 0, type: 'organization', branch: 'Executive Department Sub-Office/Agency/Bureau', tollfree: '1-866-835-5322', value: 1, entityScore: 0.7293032601475715, mentions: 340}, {id: 462, label: 'Entity', properties: ['image', 'website', 'address', 'aliases', 'phone', 'tty', 'name', 'type', 'branch', 'tollfree'], image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Seal_of_the_President_of_the_United_States.svg/1024px-Seal_of_the_President_of_the_United_States.svg.png', website: 'https://www.whitehouse.gov/omb/', address: '725 17th St., NW \nWashington, DC 20503', aliases: 'OMB', phone: '1-202-395-3080', tty: '', name: 'Office of Management and Budget', pageRank: 0, type: 'organization', branch: 'Executive Office of the President', tollfree: '', value: 1, entityScore: 0.33524993718601764, mentions: 774}], topics: [{id: 514, label: 'Topic', properties: ['name'], name: 'Edition Version', pageRank: 0, value: 1, topicScore: 0.7090060032904149}, {id: 845, label: 'Topic', properties: ['name'], name: 'Shall', pageRank: 0, value: 1, topicScore: 0.2639428423717618}, {id: 5012, label: 'Topic', properties: ['name'], name: 'Flight', pageRank: 0, value: 1, topicScore: 0.24890241026878357}, {id: 7920, label: 'Topic', properties: ['name'], name: 'Stanag', pageRank: 0, value: 1, topicScore: 0.41504038870334625}, {id: 9273, label: 'Topic', properties: ['name'], name: 'Subsection', pageRank: 0, value: 1, topicScore: 0.23277708729729057}, {id: 21202, label: 'Topic', properties: ['name'], name: 'Afman', pageRank: 0, value: 1, topicScore: 0.4876853798516095}, {id: 74245, label: 'Topic', properties: ['name'], name: 'Explosives', pageRank: 0, value: 1, topicScore: 0.3136272979900241}, {id: 93755, label: 'Topic', properties: ['name'], name: 'Subsec', pageRank: 0, value: 1, topicScore: 0.34730036593973634}, {id: 310933, label: 'Topic', properties: ['name'], name: 'Message', pageRank: 0, value: 1, topicScore: 0.2340165665373206}, {id: 697606, label: 'Topic', properties: ['name'], name: 'Opfor', pageRank: 0, value: 1, topicScore: 0.23442314155399802}], entityQuery: {query: '\n\t\t\t\t\t\tMATCH (d:Document)-[m:MENTIONS]->(e:Entity)\n\t\t\t\t\t\tWHERE d.doc_id in $ids AND EXISTS(e.aliases)\n\t\t\t\t\t\tWITH e\n\t\t\t\t\t\tMATCH (e)<-[:MENTIONS]-(d:Document)\n\t\t\t\t\t\tWHERE d.doc_id in $ids\n\t\t\t\t\t\tRETURN e as node, count(d) as entityScore, count(e) as mentions\n\t\t\t\t\t\tORDER BY mentions DESC LIMIT 10;', params: {ids: ['AFAP 01.pdf_0', 'TM 5-698-6.pdf_0', 'CJCSM 6510.01B.pdf_0', 'AEDP 07.pdf_0', 'CJCSM 3150.24E.pdf_0', 'STANAG 4607.pdf_0', 'CJCSI 5501.01G.pdf_0', 'DoDFMR V2BCH18.pdf_0', 'AFMAN 15-124.pdf_0', 'DoD 5240.01-R CH 2.pdf_0', 'TM 5-689.pdf_0', 'AFH 36-2235V5.pdf_0', 'AMedP 7.5.pdf_0', 'STANAG 7023.pdf_0', 'DoD 4145.26-M CH 2.pdf_0', 'DoDFMR V8CH6.pdf_0', 'AFMAN 91-201.pdf_0', 'AJMedP 4-5.pdf_0', 'AECTP 400.pdf_0', 'AEDP 19.pdf_0', 'STANAG 5066.pdf_0', 'AEP 84.1.pdf_0', 'AEDP 15-IDD.pdf_0', 'TM 5-803-5.pdf_0', 'AEDP 06.pdf_0', 'ATP 99.pdf_0', 'AR 608-10.pdf_0', 'AEDP 17.pdf_0', 'AFMAN 38-102.pdf_0', 'AMSP 04.pdf_0', 'AEP 84.2.pdf_0', 'DoD 4650.1-R-1.pdf_0', 'AFMAN 16-101.pdf_0', 'AOP 52.pdf_0', 'AOP 43.pdf_0', 'PAM 385-64.pdf_0', 'PAM 385-65.pdf_0', 'AFMAN 11-2B-1V2.pdf_0', 'SRD 1_to_AJMedP-3.pdf_0', 'Title 10.pdf_0', 'AR 725-50.pdf_0', 'PAM 5-11.pdf_0', 'AFMAN 11-2U-2V2.pdf_0', 'ADatP 34.pdf_0', 'AASTP 01.pdf_0', 'AFMAN 11-2B-2V2.pdf_0', 'AEP 84_VOLII.pdf_0', 'AEP 67.pdf_0', 'AFMAN 20-116.pdf_0', 'Title 37.pdf_0', 'STANAG 4560.pdf_0', 'ANEP 77_PART3.pdf_0', 'Title 15.pdf_0', 'FM 7-100.1.pdf_0', 'TC 3-09.81.pdf_0', 'AFMAN 11-2F-15V1.pdf_0', 'AFI 65-508.pdf_0', 'TC 7-22.7.pdf_0', 'ATP 4-02.84.pdf_0', 'Title 32.pdf_0', 'AR 350-10.pdf_0', 'AOP 20.pdf_0', 'Title 17.pdf_0', 'AFTTP 3-2.46.pdf_0', 'AR 710-1.pdf_0', 'Title 28 Appendix.pdf_0']}}, topicQuery: {query: '\n\t\t\t\t\t\tMATCH (d:Document)-[m:CONTAINS]->(t:Topic)\n\t\t\t\t\t\tWHERE d.doc_id in $ids\n\t\t\t\t\t\tWITH t\n\t\t\t\t\t\tMATCH (t)<-[:CONTAINS]-(d:Document)\n\t\t\t\t\t\tWHERE d.doc_id in $ids\n\t\t\t\t\t\tRETURN t as node, count(d) as topicScore\n\t\t\t\t\t\tORDER BY topicScore DESC LIMIT 10;', params: {ids: ['AFAP 01.pdf_0', 'TM 5-698-6.pdf_0', 'CJCSM 6510.01B.pdf_0', 'AEDP 07.pdf_0', 'CJCSM 3150.24E.pdf_0', 'STANAG 4607.pdf_0', 'CJCSI 5501.01G.pdf_0', 'DoDFMR V2BCH18.pdf_0', 'AFMAN 15-124.pdf_0', 'DoD 5240.01-R CH 2.pdf_0', 'TM 5-689.pdf_0', 'AFH 36-2235V5.pdf_0', 'AMedP 7.5.pdf_0', 'STANAG 7023.pdf_0', 'DoD 4145.26-M CH 2.pdf_0', 'DoDFMR V8CH6.pdf_0', 'AFMAN 91-201.pdf_0', 'AJMedP 4-5.pdf_0', 'AECTP 400.pdf_0', 'AEDP 19.pdf_0', 'STANAG 5066.pdf_0', 'AEP 84.1.pdf_0', 'AEDP 15-IDD.pdf_0', 'TM 5-803-5.pdf_0', 'AEDP 06.pdf_0', 'ATP 99.pdf_0', 'AR 608-10.pdf_0', 'AEDP 17.pdf_0', 'AFMAN 38-102.pdf_0', 'AMSP 04.pdf_0', 'AEP 84.2.pdf_0', 'DoD 4650.1-R-1.pdf_0', 'AFMAN 16-101.pdf_0', 'AOP 52.pdf_0', 'AOP 43.pdf_0', 'PAM 385-64.pdf_0', 'PAM 385-65.pdf_0', 'AFMAN 11-2B-1V2.pdf_0', 'SRD 1_to_AJMedP-3.pdf_0', 'Title 10.pdf_0', 'AR 725-50.pdf_0', 'PAM 5-11.pdf_0', 'AFMAN 11-2U-2V2.pdf_0', 'ADatP 34.pdf_0', 'AASTP 01.pdf_0', 'AFMAN 11-2B-2V2.pdf_0', 'AEP 84_VOLII.pdf_0', 'AEP 67.pdf_0', 'AFMAN 20-116.pdf_0', 'Title 37.pdf_0', 'STANAG 4560.pdf_0', 'ANEP 77_PART3.pdf_0', 'Title 15.pdf_0', 'FM 7-100.1.pdf_0', 'TC 3-09.81.pdf_0', 'AFMAN 11-2F-15V1.pdf_0', 'AFI 65-508.pdf_0', 'TC 7-22.7.pdf_0', 'ATP 4-02.84.pdf_0', 'Title 32.pdf_0', 'AR 350-10.pdf_0', 'AOP 20.pdf_0', 'Title 17.pdf_0', 'AFTTP 3-2.46.pdf_0', 'AR 710-1.pdf_0', 'Title 28 Appendix.pdf_0']}}};
				assert.deepStrictEqual(actual, expected);
			} catch (e) {
				assert.fail(e);
			}
			done();
		});
	});

	describe('#getSingleDocumentHelper', () => {
		it('it should return document given a doc id', async (done) => {

			const esResultsMock =  {
				'body': {
					'took': 3,
					'timed_out': false,
					'_shards': {
						'total': 3,
						'successful': 3,
						'skipped': 0,
						'failed': 0
					},
					'hits': {
						'total': {
							'value': 1,
							'relation': 'eq'
						},
						'max_score': 1,
						'hits': [
							{
								'_index': 'gamechanger_test4',
								'_type': '_doc',
								'_id': '401cdb14f03e3243b57f324a66fef494dfe6986cf4d46572e7cc56fa71120a18',
								'_score': 1,
								'_source': {
									'kw_doc_score_r': 0.00001,
									'pagerank_r': 0.00001
								},
								'fields': {
									'display_title_s': [
										'DoDI 5000.02T Operation of the Defense Acquisition System'
									],
									'display_org_s': [
										'Dept. of Defense'
									],
									'crawler_used_s': [
										'dod_issuances'
									],
									'doc_num': [
										'5000.02T'
									],
									'summary_30': [
										''
									],
									'top_entities_t': [
										'DoD',
										'Program',
										'DoD Instruction',
										'HSI',
										'the Defense Acquisition System'
									],
									'topics_s': [
										'acquisition',
										'enclosure',
										'instruction',
										'cybersecurity',
										'change enclosure'
									],
									'doc_type': [
										'DoDI'
									],
									'title': [
										'Operation of the Defense Acquisition System'
									],
									'type': [
										'document'
									],
									'keyw_5': [
										'dodi 02t',
										'formal coordination',
										'information technology',
										'formal coordinatio',
										'acquisition programs',
										'usd pubs@osd',
										'training plans',
										'systems engineering',
										'qualification criteria',
										'national intelligence'
									],
									'filename': [
										'DoDI 5000.02T CH 10.pdf'
									],
									'access_timestamp_dt': [
										'2021-07-13T23:23:37'
									],
									'id': [
										'DoDI 5000.02T CH 10.pdf_0'
									],
									'display_doc_type_s': [
										'Instruction'
									],
									'ref_list': [
										'DoD 5000.04-M',
										'DoD 5015.02-STD',
										'DoD 5400.11-R',
										'DoDD 5000.01',
										'DoDD 5135.02',
										'DoDD 5105.84',
										'DoDD 5250.01',
										'DoDD 1322.18',
										'DoDD 5400.11',
										'DoDD 5000.71',
										'DoDD 5205.02E',
										'DoDI 5000.02',
										'DoDI 5025.01',
										'DoDI 5000.85',
										'DoDI 5010.44',
										'DoDI 5000.88',
										'DoDI 5000.89',
										'DoDI 5000.73',
										'DoDI 5000.82',
										'DoDI 5000.81',
										'DoDI 5000.83',
										'DoDI 5000.90',
										'DoDI 5000.74',
										'DoDI 8500.01',
										'DoDI 7041.03',
										'DoDI 8330.01',
										'DoDI 8320.02',
										'DoDI 8410.03',
										'DoDI 8320.04',
										'DoDI 5200.39',
										'DoDI 5200.44',
										'DoDI 4650.01',
										'DoDI O-5240.24',
										'DoDI 4630.09',
										'DoDI 5000.66',
										'DoDI 2040.02',
										'DoDI 2010.06',
										'DoDI 8510.01',
										'DoDI 5000.61',
										'DoDI 4151.22',
										'DoDI 5000.67',
										'DoDI 1100.22',
										'DoDI 7041.04',
										'DoDI 5400.16',
										'DoDI 3200.12',
										'DoDI 4140.67',
										'DoDI 5205.13',
										'DoDI 8530.01',
										'DoDI 5000.75',
										'DoDM 4160.28, Volume 1',
										'DoDM 8400.01',
										'Title 10',
										'Title 15',
										'Title 40',
										'Title 47',
										'Title 42',
										'Title 44',
										'Title 29',
										'Title 32',
										'EO 12114',
										'EO 13691',
										'OMBM M-04-08',
										'OMBM M-04-16',
										'OMBM M-05-25'
									],
									'publication_date_dt': [
										'2015-01-07T00:00:00'
									],
									'page_count': [
										27
									]
								}
							}
						]
					}
				}
			}
			 
			const tmpOpts = {
				...opts,
				dataLibrary: {
					queryElasticSearch() {
						return Promise.resolve(esResultsMock);
					}
				},
				dataTracker: {
					crawlerDateHelper(searchResults) {
						for (let searchIndex = 0; searchIndex < searchResults.docs.length; searchIndex++) {
							searchResults.docs[searchIndex].current_as_of = 'TEST';
						}
						return Promise.resolve(searchResults);
					}
				}
			};

			const req = {
				...reqMock,
				body: {
					searchText: 'artificial intelligence',
					cloneName: 'gamechanger',
					functionName: 'getSingleDocument',
					docIds: ['Test']
				}
			};

			const target = new PolicyGraphHandler(tmpOpts);

			try {
				const actual = await target.callFunctionHelper(req, 'test');

				const expected = {"query":{"_source":{"includes":["pagerank_r","kw_doc_score_r","orgs_rs","topics_s"]},"stored_fields":["filename","title","page_count","doc_type","doc_num","ref_list","id","summary_30","keyw_5","p_text","type","p_page","display_title_s","display_org_s","display_doc_type_s","is_revoked_b","access_timestamp_dt","publication_date_dt","crawler_used_s","download_url_s","source_page_url_s","source_fqdn_s","topics_s","top_entities_t"],"from":0,"size":20,"aggregations":{"doc_type_aggs":{"terms":{"field":"display_doc_type_s","size":10000}},"doc_org_aggs":{"terms":{"field":"display_org_s","size":10000}}},"track_total_hits":true,"query":{"bool":{"must":[{"terms":{"id":["Test"]}}],"should":[{"nested":{"path":"paragraphs","inner_hits":{"_source":false,"stored_fields":["paragraphs.page_num_i","paragraphs.par_raw_text_t"],"from":0,"size":5,"highlight":{"fields":{"paragraphs.par_raw_text_t":{"fragment_size":270,"number_of_fragments":1,"type":"plain"},"paragraphs.par_raw_text_t.gc_english":{"fragment_size":270,"number_of_fragments":1,"type":"plain"}},"fragmenter":"span"}},"query":{"bool":{"should":[{"query_string":{"query":"artificial intelligence","default_field":"paragraphs.par_raw_text_t.gc_english","default_operator":"and","fuzzy_max_expansions":100,"fuzziness":"AUTO","analyzer":"gc_english"}}]}}}},{"wildcard":{"keyw_5":{"value":"*artificial intelligence*","boost":4}}},{"wildcard":{"display_title_s.search":{"value":"*artificial intelligence*","boost":10}}},{"wildcard":{"filename.search":{"value":"*artificial intelligence*","boost":5}}},{"wildcard":{"display_source_s.search":{"value":"*artificial intelligence*","boost":4}}},{"wildcard":{"top_entities_t.search":{"value":"*artificial intelligence*","boost":4}}},{"query_string":{"fields":["display_title_s.search"],"query":"artificial* OR *intelligence*","type":"best_fields","boost":6,"analyzer":"gc_english"}}],"minimum_should_match":1,"filter":[{"term":{"is_revoked_b":"false"}}]}},"highlight":{"require_field_match":false,"fields":{"display_title_s.search":{},"keyw_5":{},"filename.search":{},"display_source_s.search":{},"top_entities_t":{},"topics_s":{}},"fragment_size":10,"fragmenter":"simple","type":"unified","boundary_scanner":"word"},"sort":[{"_score":{"order":"desc"}}]},"totalCount":1,"docs":[{"display_title_s":"DoDI 5000.02T Operation of the Defense Acquisition System","display_org_s":"Dept. of Defense","crawler_used_s":"dod_issuances","doc_num":"5000.02T","summary_30":"","top_entities_t":["DoD","Program","DoD Instruction","HSI","the Defense Acquisition System"],"topics_s":["acquisition","enclosure","instruction","cybersecurity","change enclosure"],"doc_type":"DoDI","title":"Operation of the Defense Acquisition System","type":"document","keyw_5":"dodi 02t, formal coordination, information technology, formal coordinatio, acquisition programs, usd pubs@osd, training plans, systems engineering, qualification criteria, national intelligence","filename":"DoDI 5000.02T CH 10.pdf","access_timestamp_dt":"2021-07-13T23:23:37","id":"DoDI 5000.02T CH 10.pdf_0","display_doc_type_s":"Instruction","ref_list":["DoD 5000.04-M","DoD 5015.02-STD","DoD 5400.11-R","DoDD 5000.01","DoDD 5135.02","DoDD 5105.84","DoDD 5250.01","DoDD 1322.18","DoDD 5400.11","DoDD 5000.71","DoDD 5205.02E","DoDI 5000.02","DoDI 5025.01","DoDI 5000.85","DoDI 5010.44","DoDI 5000.88","DoDI 5000.89","DoDI 5000.73","DoDI 5000.82","DoDI 5000.81","DoDI 5000.83","DoDI 5000.90","DoDI 5000.74","DoDI 8500.01","DoDI 7041.03","DoDI 8330.01","DoDI 8320.02","DoDI 8410.03","DoDI 8320.04","DoDI 5200.39","DoDI 5200.44","DoDI 4650.01","DoDI O-5240.24","DoDI 4630.09","DoDI 5000.66","DoDI 2040.02","DoDI 2010.06","DoDI 8510.01","DoDI 5000.61","DoDI 4151.22","DoDI 5000.67","DoDI 1100.22","DoDI 7041.04","DoDI 5400.16","DoDI 3200.12","DoDI 4140.67","DoDI 5205.13","DoDI 8530.01","DoDI 5000.75","DoDM 4160.28, Volume 1","DoDM 8400.01","Title 10","Title 15","Title 40","Title 47","Title 42","Title 44","Title 29","Title 32","EO 12114","EO 13691","OMBM M-04-08","OMBM M-04-16","OMBM M-05-25"],"publication_date_dt":"2015-01-07T00:00:00","page_count":27,"pageHits":[],"esIndex":["Test","Test"],"current_as_of":"TEST"}],"doc_types":[],"doc_orgs":[],"searchTerms":["artificial","intelligence"],"expansionDict":null}







				
				assert.deepStrictEqual(actual, expected);
			} catch (e) {
				assert.fail(e);
			}
			done();
		});
	});

});
