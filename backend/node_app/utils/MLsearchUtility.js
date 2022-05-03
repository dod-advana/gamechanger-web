const LOGGER = require('@dod-advana/advana-logger');
const sparkMD5Lib = require('spark-md5');
const constantsFile = require('../config/constants');
const { MLApiClient } = require('../lib/mlApiClient');
const { DataLibrary } = require('../lib/dataLibrary');
const neo4jLib = require('neo4j-driver');
const fs = require('fs');
const { include } = require('underscore');
const { performance } = require('perf_hooks');
const { esTopLevelFields, esInnerHitFields } = require('../modules/jbook/jbookDataMapping');
const SearchUtility = require('../utils/searchUtility');

const TRANSFORM_ERRORED = 'TRANSFORM_ERRORED';

class MLSearchUtility {
	constructor(opts = {}) {
		const {
			logger = LOGGER,
			sparkMD5 = sparkMD5Lib,
			constants = constantsFile,
			mlApi = new MLApiClient(opts),
			dataApi = new DataLibrary(opts),
			searchUtility = new SearchUtility(opts),
		} = opts;

		this.logger = logger;
		this.sparkMD5 = sparkMD5;
		this.constants = constants;
		this.mlApi = mlApi;
		this.dataLibrary = dataApi;
		this.searchUtility = searchUtility;

		this.intelligentSearchHandler = this.intelligentSearchHandler.bind(this);
		this.getBigramQueries = this.getBigramQueries.bind(this);
		this.getPhraseQAQuery = this.getPhraseQAQuery.bind(this);
		this.getQAContext = this.getQAContext.bind(this);
		this.cleanQAResults = this.cleanQAResults.bind(this);
		this.getRelatedSearches = this.getRelatedSearches.bind(this);
		this.getRecDocs = this.getRecDocs.bind(this);
	}
	/********** QUESTION ANSWER FUNCTIONS **********/

	async queryOneDocQA(docId, esClientName, esIndex, userId) {
		// query entire docs to expand short paragraphs/get beginning of doc
		try {
			let newQuery = this.searchUtility.getESQueryOneDoc(docId, userId); // query ES for single doc
			let singleResult = await this.dataLibrary.queryElasticSearch(esClientName, esIndex, newQuery, userId);
			return singleResult.body.hits.hits[0];
		} catch (e) {
			LOGGER.error(e.message, 'COP4546JN', userId);
		}
	}

	async formatQAquery(searchText, entityLimit, esClientName, entitiesIndex, userId) {
		try {
			let text = searchText.toLowerCase().replace('?', ''); // lowercase/ remove ? from query
			let display = text + '?';
			let list = text.split(/\s+/); // get list of query terms
			let alias = await this.searchUtility.findAliases(list, entityLimit, esClientName, entitiesIndex, userId);
			if (alias._source) {
				text = text.replace(alias.match.toLowerCase(), alias._source.name);
			}
			let qaQueries = { text: text, display: display, list: list, alias: alias };
			return qaQueries;
		} catch (e) {
			LOGGER.error(e.message, 'SRUVBNX', '');
		}
	}

	async getQAEntities(entities, qaQueries, bigramQueries, qaParams, esClientName, entitiesIndex, userId) {
		try {
			if (qaQueries.alias._source) {
				entities.QAResults = qaQueries.alias;
			} else {
				let queryType = 'entities';
				let qaEntityQuery = this.getPhraseQAQuery(
					bigramQueries,
					queryType,
					qaParams.entityLimit,
					qaParams.maxLength,
					userId
				);
				entities.allResults = await this.dataLibrary.queryElasticSearch(
					esClientName,
					entitiesIndex,
					qaEntityQuery,
					userId
				);
			}
			if (entities.allResults.body && entities.allResults.body.hits.total.value > 0) {
				entities.QAResults = entities.allResults.body.hits.hits[0];
			}
			return entities;
		} catch (e) {
			this.logger.error(e.message, 'I9XPQL2W');
		}
	}

	async processQASentenceResults(sentenceResults, context, esClientName, esIndex, userId, qaParams) {
		for (var i = 0; i < sentenceResults.length; i++) {
			try {
				let [docId, parIdx] = sentenceResults[i].id.split('_');
				docId = docId + '_0';
				let resultDoc = await this.queryOneDocQA(docId, esClientName, esIndex, userId); // this adds the beginning of the doc
				let contextPara = {
					filename: resultDoc._source.display_title_s,
					docId: resultDoc._source.id,
					docScore: resultDoc._score,
					docTypeDisplay: resultDoc._source.display_doc_type_s,
					pubDate: resultDoc._source.publication_date_dt,
					pageCount: resultDoc._source.page_count,
					docType: resultDoc._source.doc_type,
					org: resultDoc._source.display_org_s,
					cac_only: resultDoc._source.cac_login_required_b,
					resultType: 'document',
					source: 'intelligent search',
					parIdx: parIdx,
				};
				let paraHit = resultDoc._source.paragraphs[parIdx];
				let para = this.cleanParagraph(paraHit.par_raw_text_t);
				if (para.length > qaParams.maxLength) {
					// if paragraph is too long, take beginning
					contextPara.text = para.substring(0, qaParams.maxLength);
				} else if (para.length > 200) {
					// only keep actual paragraphs not empty strings/titles/headers
					contextPara.text = para;
				} else {
					let qaSubset = await this.expandParagraphs(resultDoc, parIdx, qaParams.minLength); // get only text around the hit paragraph up to the max length
					contextPara.text = this.cleanParagraph(qaSubset.join(' '));
				}
				if (sentenceResults[i].score >= 0.95) {
					// if sentence result scores hidh, push to top of context
					context.unshift(contextPara);
				} else {
					context.push(contextPara);
				}
				return context;
			} catch (e) {
				LOGGER.error(e.message, 'LOQXIPY', userId);
			}
		}
	}

	async processQADocumentResults(docResults, context, esClientName, esIndex, userId, qaParams) {
		let filterLength = 15;
		let docs = docResults.body.hits.hits;
		let filteredResults = this.filterEmptyDocs(docs, filterLength);
		let docLimit = Math.min(qaParams.maxDocContext, filteredResults.length);
		//let orgList = [];
		//let legitCount = 0;
		try {
			for (var i = 0; i < docLimit; i++) {
				let resultDoc = filteredResults[i];
				//let resultOrg = resultDoc._source.display_org_s;
				//orgList.push(resultOrg);
				//if (orgList.filter(x => x===resultOrg).length > 2) {
				//	continue;
				//} else {
				//legitCount++;
				if (resultDoc._score > qaParams.scoreThreshold) {
					// if doc scores high, retrieve paragraphs
					let paraHits = resultDoc.inner_hits.paragraphs.hits.hits;
					let paraLimits = Math.min(qaParams.maxParaContext, paraHits.length);
					for (var x = 0; x < paraLimits; x++) {
						// for each doc, add the paragraph hits
						if (paraHits[x]) {
							let contextPara = {
								filename: resultDoc._source.display_title_s,
								docId: resultDoc._source.id,
								docScore: resultDoc._score,
								docTypeDisplay: resultDoc._source.display_doc_type_s,
								pubDate: resultDoc._source.publication_date_dt,
								pageCount: resultDoc._source.page_count,
								docType: resultDoc._source.doc_type,
								org: resultDoc._source.display_org_s,
								cac_only: resultDoc._source.cac_login_required_b,
								resultType: 'document',
								source: 'context search',
								parIdx: paraHits[x]._nested.offset,
							};
							let para = this.cleanParagraph(this.getInnerHitParagraph(paraHits[x]));
							if (para.length > qaParams.maxLength) {
								// if paragraph is too long, take highlight
								contextPara.text = this.cleanParagraph(this.getInnerHitHighlight(paraHits[x]));
							} else if (para.length > 200) {
								// only keep actual paragraphs not empty strings/titles/headers
								contextPara.text = para;
							}
							context.push(contextPara);
						}
					}
				} else {
					// if doc doesn't score high, retrieve the intro
					let contextPara = {
						filename: resultDoc._source.display_title_s,
						docId: resultDoc._source.id,
						docScore: resultDoc._score,
						docTypeDisplay: resultDoc._source.display_doc_type_s,
						pubDate: resultDoc._source.publication_date_dt,
						pageCount: resultDoc._source.page_count,
						docType: resultDoc._source.doc_type,
						org: resultDoc._source.display_org_s,
						cac_only: resultDoc._source.cac_login_required_b,
						resultType: 'document',
						source: 'context search',
						parIdx: 0,
					};
					let singleResult = await this.queryOneDocQA(resultDoc._source.id, esClientName, esIndex, userId); // this adds the beginning of the doc
					let qaSubset = await this.expandParagraphs(singleResult, contextPara.parIdx, qaParams.minLength); // get only text around the hit paragraph up to the max length
					let text = this.cleanParagraph(qaSubset.join(' '));
					if (text.length > 200) {
						contextPara.text = text;
						context.push(contextPara); // only keep actual paragraphs not empty strings/titles/headers
					}
				}
			}
			return context;
		} catch (e) {
			LOGGER.error(e.message, 'QAPTFJN', userId);
		}
	}

	async getQAContext(docResults, entity, sentenceResults, esClientName, esIndex, userId, qaParams) {
		let context = [];
		try {
			if (docResults.body) {
				context = await this.processQADocumentResults(
					docResults,
					context,
					esClientName,
					esIndex,
					userId,
					qaParams
				);
			}
			if (sentenceResults && sentenceResults.length > 0) {
				// if sentence results, add them to context
				context = await this.processQASentenceResults(
					sentenceResults,
					context,
					esClientName,
					esIndex,
					userId,
					qaParams
				);
			}
			if (entity._source) {
				// if entity, add to context
				context = this.processQAEntity(entity, context, userId);
			}
			return context;
		} catch (e) {
			LOGGER.error(e.message, 'CPQ4FFJN', userId);
		}
	}

	getPhraseQAQuery(bigramQueries, queryType, entityLimit, maxLength, user) {
		// make ES query for QA documents/entities/aliases

		let query;
		try {
			if (queryType === 'alias_only') {
				query = {
					from: 0,
					size: entityLimit,
					query: {
						bool: {
							should: bigramQueries.aliasQuery,
						},
					},
				};
			} else if (queryType === 'entities') {
				query = {
					from: 0,
					size: entityLimit,
					query: {
						bool: {
							should: bigramQueries.entityShouldQueries,
						},
					},
				};
			} else if (queryType === 'documents') {
				query = {
					query: {
						bool: {
							must: [
								{
									nested: {
										path: 'paragraphs',
										inner_hits: {
											_source: false,
											stored_fields: [
												'paragraphs.page_num_i',
												'paragraphs.filename',
												'paragraphs.par_raw_text_t',
											],
											from: 0,
											size: 100,
											highlight: {
												fields: {
													'paragraphs.filename.search': {
														number_of_fragments: 0,
													},
													'paragraphs.par_raw_text_t': {
														fragment_size: maxLength,
														number_of_fragments: 1,
													},
												},
												fragmenter: 'span',
											},
										},
										query: {
											bool: {
												should: bigramQueries.docMustQueries,
											},
										},
									},
								},
							],
							should: bigramQueries.docShouldQueries,
						},
					},
				};
			}
			return query;
		} catch (e) {
			this.logger.error(e, 'TJDDKH5F', user);
		}
	}

	processQAEntity(entity, context, userId) {
		try {
			let docId = '';
			let resultType = '';
			if (entity._source.entity_type === 'topic') {
				docId = entity._source.name.toLowerCase();
				resultType = 'topic';
			} else {
				docId = entity._source.name;
				resultType = 'entity';
			}
			let entityObj = {
				filename: entity._source.name,
				docId: docId,
				docScore: entity._score,
				retrievedDate: entity._source.information_retrieved,
				type: entity._source.entity_type,
				resultType: resultType,
				source: 'entity search',
				text: entity._source.information,
			};
			context.unshift(entityObj);
			return context;
		} catch (e) {
			LOGGER.error(e.message, 'PQXUOSDF9', userId);
		}
	}

	cleanQAResults(QA, shortenedResults, context) {
		// formats QA results
		try {
			if (shortenedResults.answers.length > 0 && shortenedResults.answers[0].status) {
				shortenedResults.answers = shortenedResults.answers.filter(function (i) {
					return i['status'] == 'passed' && i['text'] !== '';
				});
			} else {
				shortenedResults.answers = shortenedResults.answers.filter(function (i) {
					return i['text'] !== '';
				});
			}
			let matchedResults = [];
			for (var i = 0; i < shortenedResults.answers.length; i++) {
				let ix = shortenedResults.answers[i].context;
				let matchedAnswer = {
					answer: shortenedResults.answers[i].text,
					null_score_diff: shortenedResults.answers[i].null_score_diff,
					filename: context[ix].filename,
					docId: context[ix].docId,
					resultType: context[ix].resultType,
					cac_only: context[ix].cac_only,
					pub_date: context[ix].pubDate,
					displaySource:
						'Source: ' +
						context[ix].filename.toUpperCase() +
						' (' +
						context[ix].resultType.toUpperCase() +
						')',
				};
				matchedResults.push(matchedAnswer);
			}
			QA.answers = matchedResults;
		} catch (e) {
			LOGGER.error(e.message, 'AJEPRUTY', '');
		}
		return QA;
	}

	isQuestion(searchText) {
		const questionWords = [
			'who',
			'what',
			'where',
			'when',
			'how',
			'why',
			'can',
			'may',
			'will',
			"won't",
			'does',
			"doesn't",
		];
		const searchTextList = searchText.toLowerCase().trim().split(/\s|\b/);
		const question =
			questionWords.find((item) => item === searchTextList[0]) !== undefined ||
			searchTextList[searchTextList.length - 1] === '?';
		return question;
	}
	/********** QUESTION ANSWER FUNCTIONS END **********/

	/********** RELATED SEARCH FUNCTIONS **********/

	async getRelatedSearches(searchText, expansionDict, esClientName, userId, maxSearches = 5) {
		// need to caps all search text for ID and Title since it's stored like that in ES
		const searchHistoryIndex = this.constants.GAME_CHANGER_OPTS.historyIndex;
		let relatedSearches = [];
		let simWordList = [];
		try {
			if (expansionDict['wordsim']) {
				let similarWords = expansionDict['wordsim'];
				simWordList = Object.keys(expansionDict['wordsim']);
				for (var key in similarWords) {
					simWordList = simWordList.concat(similarWords[key]);
				}
			}
			if (expansionDict['qexp']) {
				let similarWords = expansionDict['qexp'];
				simWordList = Object.keys(expansionDict['qexp']);
				for (var key in similarWords) {
					simWordList = simWordList.concat(similarWords[key]);
				}
			}
			if (simWordList.length < 1) {
				simWordList = [searchText];
			}
			for (var key in simWordList) {
				simWordList[key] = simWordList[key].replace(/["']/g, '');
			}

			let similarWordsQuery = simWordList.join('* OR *');
			const query = {
				size: 1,
				query: {
					query_string: {
						default_field: 'search_query',
						query: `*${similarWordsQuery}*`,
						fuzziness: 5,
					},
				},
				aggs: {
					related: {
						terms: {
							field: 'search_query',
							min_doc_count: 10,
						},
						aggs: {
							user: { terms: { field: 'user_id', size: 2 } },
						},
					},
				},
			};
			let results = await this.dataLibrary.queryElasticSearch(esClientName, searchHistoryIndex, query, userId);

			if (results.body.aggregations) {
				let aggs = results.body.aggregations.related.buckets;
				let maxCount = 0;
				if (aggs.length > 0) {
					for (let term in aggs) {
						let words = aggs[term].key.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
						if (words !== searchText && aggs[term].user.buckets.length > 1) {
							words = words.replace(/\s{2,}/g, ' ');
							if (!relatedSearches.includes(words) && maxCount < maxSearches) {
								relatedSearches.push(words);
								maxCount += 1;
							}
						}
					}
				}
			}
		} catch (err) {
			this.logger.error(err.message, 'ALS01AZ', userId);
		}

		return relatedSearches;
	}
	/********** RELATED SEARCH FUNCTIONS END **********/

	/********** INTELLIGENT SEARCH FUNCTIONS **********/

	async getSentResults(searchText, userId) {
		let sentResults = [];
		try {
			searchText = searchText.replace(/\?/g, '');
			sentResults = await this.mlApi.getSentenceTransformerResults(searchText, userId);
		} catch (e) {
			this.logger.error(e, 'PQKLW5XN', userId);
		}
		return sentResults;
	}

	async intelligentSearchHandler(sentenceResults, userId, req, clientObj) {
		let filename;
		let result;
		//let sentenceResults = await this.mlApi.getSentenceTransformerResults(searchText, userId);
		if (sentenceResults[0] !== undefined && sentenceResults[0].passing_result == 1) {
			filename = sentenceResults[0].id;
			const sentenceSearchRes = await this.searchUtility.documentSearchOneID(
				req,
				{ ...req.body, id: filename },
				clientObj,
				userId
			);
			sentenceSearchRes.docs[0].search_mode = 'Intelligent Search';
			result = sentenceSearchRes.docs[0];
			return result;
		}
		return {};
	}
	/********** INTELLIGENT SEARCH FUNCTIONS END **********/

	/********** RECOMMENDATIONS FUNCTIONS **********/
	async getRecDocs(docs = [], userId = '') {
		let recDocs = [];
		let recommendations = {};
		try {
			recDocs = await this.mlApi.recommender(docs, userId);
			if (recDocs.results && recDocs.results.length > 0) {
				recommendations = recDocs;
				recommendations.method = 'MLAPI search history';
			} else {
				recommendations = await this.getAllGraphRecs(docs, userId);
				recommendations.method = 'Neo4j graph';
			}
			recommendations.results = this.filterRecommendations(recommendations.results);
		} catch (e) {
			this.logger.error(e, 'LLLZ12P', userId);
		}
		return recommendations;
	}

	async getAllGraphRecs(docList, userId, max_results = 10) {
		let graphRecs = {};
		let graphResults = [];
		let usedDocs = [];
		try {
			for (let i = 0; i < docList.length; i++) {
				if (graphResults.length >= max_results) {
					break;
				} else {
					const results = await this.getGraphRecs(docList[i], userId);
					results.forEach((d) => graphResults.push(d));
					usedDocs.push(docList[i]);
				}
			}
			graphRecs.filenames = usedDocs;
			graphRecs.results = graphResults;
		} catch (e) {
			this.logger.error(e, 'ADFAD90', userId);
		}
		return graphRecs;
	}

	async getGraphRecs(doc, userId, algo = 'louvain') {
		let suggested = [];
		let name = doc + '.pdf';
		let comm_resp = {};
		let resp = {};
		try {
			// first try getting docs by similarity
			resp = await this.dataLibrary.queryGraph(
				`
				MATCH (d:Document {filename: $file})-[:SIMILAR_TO]-(n) 
				RETURN n.filename, n.louvain_community, n.lp_community, n.betweenness 
				ORDER BY n.betweenness 
				LIMIT 5;`,
				{ file: name },
				userId
			);
			if (resp.result.records.length == 0) {
				// if no results, try group algo
				comm_resp = await this.dataLibrary.queryGraph(
					`
				MATCH (d:Document {filename: $filename})
				RETURN d.filename, d.louvain_community, d.lp_community;`,
					{ filename: name },
					userId
				);
				if (comm_resp.result.records.length > 0) {
					const singleRecord = comm_resp.result.records[0];
					let louvain = singleRecord._fields[1]['low'];
					let label = singleRecord._fields[2]['low'];
					if (label && algo === 'label_propagation') {
						resp = await this.dataLibrary.queryGraph(
							`
							MATCH (d:Document)
							WHERE d.lp_community = $lp
							RETURN d.filename, d.louvain_community, d.lp_community, d.betweenness
							ORDER BY d.betweenness DESC
							LIMIT 5;`,
							{ lp: label },
							userId
						);
					} else if (louvain && algo == 'louvain') {
						resp = await this.dataLibrary.queryGraph(
							`
							MATCH (d:Document)
							WHERE d.louvain_community = $louv
							RETURN d.filename, d.louvain_community, d.lp_community, d.betweenness
							ORDER BY d.betweenness DESC
							LIMIT 5;`,
							{ louv: louvain },
							userId
						);
					}
				}
			}
			if (resp !== {}) {
				resp.result.records.forEach((r) => {
					let doc = {};
					doc.filename = r._fields[0];
					doc.louvain = r._fields[1]['low'];
					doc.label_prop = r._fields[2]['low'];
					doc.betweenness = r._fields[3];
					suggested.push(doc);
				});
				suggested = suggested.map((item) => item.filename.split('.pdf')[0]);
			}
		} catch (e) {
			this.logger.error(e, 'WQPX84H', userId);
		}
		return suggested;
	}

	filterRecommendations(docList) {
		try {
			const docCount = {};

			for (const doc of docList) {
				docCount[doc] = docCount[doc] ? docCount[doc] + 1 : 1;
			}
			let docListSorted = Object.keys(docCount)
				.sort(function (a, b) {
					return docCount[a] - docCount[b];
				})
				.reverse();

			return docListSorted;
		} catch (e) {
			this.logger.error(e, 'LLLZ12P', '');
			return docList;
		}
	}

	/********** RECOMMENDATIONS FUNCTIONS END **********/

	/********** MISC FUNCTIONS **********/

	getBigramQueries(searchTextList, alias) {
		// makes phrases to add to ES queries for entities or gamechanger indices

		try {
			let bigrams = [];
			let searchText = searchTextList.join(' ');
			let length = searchTextList.length - 2;
			for (let i = 0; i <= length; i++) {
				bigrams.push(searchTextList.slice(i, i + 2).join(' '));
			}

			// if alias search came back with a result, this adds the full unabbreviated name
			try {
				if (alias._source) {
					bigrams.push(alias._source.name);
				}
			} catch (e) {
				this.logger.error(e, 'DYWPQMCSW', '');
			}

			// make one object for all queries
			const bigramQueries = {
				entityShouldQueries: [],
				docMustQueries: [],
				docShouldQueries: [
					{
						multi_match: {
							query: searchText,
							fields: ['keyw_5^2', 'id^2', 'summary_30', 'paragraphs.par_raw_text_t'],
							operator: 'or',
						},
					},
				],
			};

			// make phrase queries for each bigram
			for (const element of bigrams) {
				// documents
				const wildcard = {
					wildcard: {
						'display_title_s.search': {
							value: element,
							boost: 6,
						},
					},
				};
				bigramQueries.docMustQueries.push(wildcard);

				const qs = {
					query_string: {
						query: element,
						default_field: 'paragraphs.par_raw_text_t',
						default_operator: 'AND',
						fuzzy_max_expansions: 100,
						fuzziness: 'AUTO',
					},
				};
				bigramQueries.docMustQueries.push(qs);

				const mm = {
					multi_match: {
						query: element,
						fields: ['summary_30', 'keyw_5'],
						type: 'phrase',
						boost: 3,
					},
				};
				bigramQueries.docShouldQueries.push(mm);

				// entities
				const nameEntityQuery = {
					match_phrase: {
						name: {
							query: element,
							slop: 2,
							boost: 0.5,
						},
					},
				};
				bigramQueries.entityShouldQueries.push(nameEntityQuery);

				const multiEntityQuery = {
					multi_match: {
						fields: ['name', 'aliases.name'], // 'information'
						query: element,
						type: 'phrase_prefix',
					},
				};
				bigramQueries.entityShouldQueries.push(multiEntityQuery);
			}
			return bigramQueries;
		} catch (e) {
			this.logger.error(e, 'LWPOT5F', '');
		}
	}

	filterEmptyDocs(docs, filterLength) {
		// filters out results that have no text or very short amount of text in the paragraphs
		try {
			let filteredResults = [];
			for (let i = 0; i < docs.length; i++) {
				let paragraphs = docs[i]._source.paragraphs;
				let parText = paragraphs.map((item) => item.par_raw_text_t).join(' ');
				if (parText.trim() !== '' && parText.trim().split(/\s+/).length > filterLength) {
					filteredResults.push(docs[i]);
				} else {
					// pass
					//console.log("REMOVING DOC: ", docs[i])
				}
			}
			return filteredResults;
		} catch (e) {
			this.logger.error(e, 'SPW29NTY', '');
		}
	}

	expandParagraphs(singleResult, parIdx, minLength) {
		// adds context around short paragraphs to make them longer
		let qaResults = singleResult._source.paragraphs; // get just the paragraph text into list
		let qaTextList = qaResults.map((item) => item.par_raw_text_t);
		let start = parIdx;
		let end = +start + +1;
		let text = qaTextList[start];
		let total_pars = qaTextList.length;
		let context = [];
		let arr = text.split(/\s+/);
		try {
			for (start, end; start >= 0, end <= total_pars; --start, ++end) {
				if (start <= 1) {
					start = 1;
				}
				if (end >= total_pars) {
					end = total_pars;
				}
				context = qaTextList.slice(start, end);
				text = context.join(' ');
				arr = text.split(/\s+/);
				if (arr.length > minLength) {
					break;
				}
			}
			return context;
		} catch (e) {
			LOGGER.error(e.message, 'BVD4546JN', '');
		}
	}

	cleanParagraph(paragraph) {
		// remove extra punctuation/weird characters
		try {
			paragraph = paragraph.replace(/((\.)(\s)?(?=\.))/g, ''); // remove TOC periods
			paragraph = paragraph.replace(/([xX](\s)?(?=[xX]))/g, ''); // remove TOC periods
			paragraph = paragraph.replace(/[^a-zA-Z0-9 \(\)\/-:;,"?!\.]/g, ' '); // ascii
			paragraph = paragraph.replace(/(\s\s+)/g, ' '); // replace multiple spaces with one space
		} catch (e) {
			LOGGER.error(e.message, 'NQODF78X', '');
		}
		return paragraph;
	}

	getInnerHitHighlight(paragraph) {
		// gets just the highlight from an inner hit
		try {
			return paragraph.highlight['paragraphs.par_raw_text_t'][0];
		} catch (e) {
			LOGGER.error(e.message, 'NPLWDQCX', '');
		}
	}

	getInnerHitParagraph(paragraph) {
		// get the paragraph text from an inner hit
		try {
			return paragraph.fields['paragraphs.par_raw_text_t'][0];
		} catch (e) {
			LOGGER.error(e.message, 'NQCPQBX', '');
		}
	}

	addSearchReport(query, params, saveResults, userId) {
		try {
			var today = new Date();
			var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
			let dir = './scripts/search-testing/' + date + '/';
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, {
					recursive: true,
				});
			}
			let filedir =
				dir + date + '_' + query.replace(/[^ 0-9a-z]/gi, '').replace(/ /g, '_') + '_search_reports.txt';
			let report = { query: query, userId: userId, date: today, params: params, saveResults: saveResults };
			fs.writeFile(filedir, JSON.stringify(report), (err) => {
				if (err) {
					LOGGER.error(err, 'CPQ4KSLN', userId);
				}
			});
		} catch (e) {
			LOGGER.error(e.message, 'WWKLNQPN', userId);
		}
	}
}

module.exports = MLSearchUtility;
