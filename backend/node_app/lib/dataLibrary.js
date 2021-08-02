const LOGGER = require('../lib/logger');
const constantsFile = require('../config/constants');
const axiosLib = require('axios');
const https = require('https');
const fs = require('fs');
const AWS = require('aws-sdk');
const neo4jLib = require('neo4j-driver');
const { ESSearchLib } = require('./ESSearchLib');

const SAMPLING_BYTES = 4096;

class DataLibrary {

	constructor(opts = {}) {
		const {
			constants = constantsFile,
			logger = LOGGER,
			axios = axiosLib,
			neo4j = neo4jLib,
			esSearchLib,
			s3Opt = {},
		} = opts;

		this.logger = logger;
		this.constants = constants;
		this.axios = axios;
		this.neo4j = neo4j;
		this.esRequestConfig = this.getESRequestConfig(this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS);
		this.esEDARequestConfig = this.getESRequestConfig(this.constants.EDA_ELASTIC_SEARCH_OPTS);
		this.esSearchLib = esSearchLib;

		if (!esSearchLib) {
			try {
				const gamechangerConfig = this.getESClientConfig(this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS);
				const edaConfig = this.getESClientConfig(this.constants.EDA_ELASTIC_SEARCH_OPTS);

				this.esSearchLib = new ESSearchLib();

				this.esSearchLib.addClient('gamechanger', gamechangerConfig, 'DataLibrary constructor');
				this.esSearchLib.addClient('eda', edaConfig, 'DataLibrary constructor');
			} catch (e) {
				this.logger.error(`CONSTRUCTOR ERROR: ${e.message}`, 'SEAFUUV', 'DataLibrary');
			}
		}

		if (this.constants.S3_REGION) {
			s3Opt.region = this.constants.S3_REGION;
		}

		if(process.env.S3_IS_MINIO === 'true') {
			s3Opt.accessKeyId = process.env.S3_ACCESS_KEY;
			s3Opt.secretAccessKey = process.env.S3_SECRET_KEY;
			s3Opt.endpoint = process.env.S3_ENDPOINT;
			s3Opt.s3ForcePathStyle = true;
			s3Opt.signatureVersion = 'v4';
		}

		try {
			this.awsS3Client = new AWS.S3(s3Opt);
		} catch (err) {
			this.awsS3Client = null;
		}

		const clientOptions = {
			s3Client: this.awsS3Client,
			maxAsyncS3: 20, // this is the default
			s3RetryCount: 3, // this is the default
			s3RetryDelay: 1000, // this is the default
			multipartUploadThreshold: 20971520, // this is the default (20 MB)
			multipartUploadSize: 15728640, // this is the default (15 MB)
		};

		this.queryElasticSearch = this.queryElasticSearch.bind(this);
		this.getESRequestConfig = this.getESRequestConfig.bind(this);
		this.getElasticsearchSearchUrl = this.getElasticsearchSearchUrl.bind(this);
		this.getElasticSearchFields = this.getElasticSearchFields.bind(this);
		this.getFilePDF = this.getFilePDF.bind(this);
		this.queryGraph = this.queryGraph.bind(this);
		this.putDocument = this.putDocument.bind(this);

	}

	// async queryElasticSearch(esQuery, esIndex, userId, options, isClone = false, cloneData = {}, multiSearch = false) {
	// 	try {
	// 		const esUrl = this.getElasticsearchSearchUrl(userId, esIndex, isClone, cloneData, multiSearch);
	//
	// 		let configOpts = options || this.esRequestConfig;
	//
	// 		return await this.axios.post(esUrl, esQuery, configOpts);
	//
	// 	} catch (err) {
	// 		const msg = (err && err.message) ? `${err.message}` : `${err}`;
	// 		this.logger.error(msg, '9VAHLY9', userId);
	// 		throw msg;
	// 	}
	// }

	async queryElasticSearch(clientName, index, queryBody, user) {
		try {
			return await this.esSearchLib.queryElasticsearch(clientName, index, queryBody, user);
		} catch (err) {
			const msg = (err && err.message) ? `${err.message}` : `${err}`;
			this.logger.error(msg, '9ZJ4HRN', user);
			throw err;
		}

	}

	async mulitqueryElasticSearch(clientName, index, queryBodiesArray, user) {
		try {
			return await this.esSearchLib.multiqueryElasticsearch(clientName, index, queryBodiesArray, user);
		} catch (err) {
			const msg = (err && err.message) ? `${err.message}` : `${err}`;
			this.logger.error(msg, 'P8JKHRN', user);
			throw err;
		}

	}
	async putDocument(clientName, index, searchLog) {
		try {
			return await this.esSearchLib.addDocument(clientName, index, searchLog);
		} catch (err) {
			const msg = (err && err.message) ? `${err.message}` : `${err}`;
			this.logger.error(msg, 'P8JKARM');
			throw err;
		}

	}
	async getElasticSearchFields(esIndex, userId) {
		try {
			let opts = Object.assign({}, this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS);

			const esUrl = `${opts.protocol}://${opts.host}:${opts.port}/${esIndex}/_mapping`;

			return await this.axios.get(esUrl, this.esRequestConfig);

		} catch (err) {
			const msg = (err && err.message) ? `${err.message}` : `${err}`;
			this.logger.error(msg, 'SNX3AII', userId);
			throw msg;
		}
	}

	getESRequestConfig({user, password, port, ca, index}) {
		let reqConfig = {};
		if (port === '443' && user) {
			reqConfig.httpsAgent = new https.Agent({
				rejectUnauthorized: false,
				keepAlive: true,
				ca,
			});
			reqConfig.auth = {
				username: user,
				password
			};
		} else if (port === '443') {
			reqConfig.httpsAgent = new https.Agent({
				rejectUnauthorized: false,
				keepAlive: true,
				ca,
			});
		}
		return reqConfig;
	}

	getESClientConfig ({ user, password, ca, protocol, host, port, index }) {
		let config = {
			node: {}
		};
		if (port === '443') {
			config.node.agent = () => {
				return new https.Agent({
					rejectUnauthorized: false,
					keepAlive: true,
					ca,
				});
			};
			config.auth = {
				username: user,
				password
			};
		}
		if (user) {
			config.auth = {
				username: user,
				password
			};
		};
		config.node.url = new URL(`${protocol}://${host}:${port}`);

		return config;
	}

	getElasticsearchSearchUrl(user, index, isClone = false, cloneData = {}, multiSearch = false) {
		const {clone_data = {}} = cloneData;
		try {
			let opts = Object.assign({}, this.constants.GAMECHANGER_ELASTIC_SEARCH_OPTS);

			if (isClone && cloneData.clone_data.esCluster !== 'gamechanger') {
				switch (cloneData.clone_data.esCluster) {
					case 'eda':
						opts = Object.assign({}, this.constants.EDA_ELASTIC_SEARCH_OPTS);
						break;
				}
			}

			// generic search passes in auxIndex for index here
			if (index && clone_data.auxIndex === index) {
				opts.index = index;
			} else if (isClone && clone_data.gcIndex) {
				// if this is a clone and want to use different primary gc index
				opts.index = cloneData.clone_data.gcIndex;
			} else if (isClone && cloneData.clone_data.project_name) {
				// otherwise clone will default to project_name
				opts.index = cloneData.clone_data.project_name;
			} else {
				opts.index = index || opts.index;
			}

			let url;
			if (multiSearch === true) {
				url = `${opts.protocol}://${opts.host}:${opts.port}/${opts.index}/_msearch`;
			} else {
				url = `${opts.protocol}://${opts.host}:${opts.port}/${opts.index}/_search`;
			}

			return url;
		} catch (err) {
			this.logger.error(err, '155M3L7', user);
			throw err;
		}

	}

	getFilePDF(res, data, userId) {
		let { dest, filekey, samplingType } = data;
		const { req } = res;
		const { _parsedOriginalUrl: { query = undefined } } = req;
		const queryString = query ? `?${query}` : '';
		// console.log("getFilePDFn",req)
		
		try {
			
			if((req.permissions.includes('Webapp Super Admin') || req.permissions.includes('View EDA')) && req.query.isClone && req.query.clone_name === 'eda'){

				const edaUrl = this.constants.GAMECHANGER_BACKEND_EDA_URL+ req.baseUrl + req.path + queryString;

				this.axios({
					method: 'get',
					url: edaUrl,
					responseType:'stream'
				})
					.then(response => {
						response.data.pipe(res);
					})
					.catch(err=>{
						this.logger.error(err, 'N4BAC3N', userId);
						throw err;
					});
			}
			else{
				const params = {
					Bucket: dest,
					Key: filekey
				};
	
				if (samplingType === 'head') {
					params.Range = 'bytes=0-' + SAMPLING_BYTES;
				} else if (samplingType === 'tail') {
					params.Range = 'bytes=-' + SAMPLING_BYTES;
				}
	
				try {
					res.setHeader(`Content-Disposition`, `attachment; filename=${filekey}`);
					this.awsS3Client.getObject(params).createReadStream().pipe(res);
				} catch (err) {
					this.logger.error(err, 'IPOQHZS', userId);
					throw err;
				}
			}
	
		} catch (err) {
			const msg = (err && err.message) ? `${err.message}` : `${err}`;
			this.logger.error(msg, 'PFXO7XD', userId);
			throw msg;
		}
	}

	getFileThumbnail(data, userId){
		let { dest, folder, filename } = data;
		let filetype = filename.split('.').pop();
		if (filetype === '.png'){
			filetype = 'image/png'
		} else if(filetype === 'svg'){
			filetype = 'svg+html'
		}
		const params = {
			Bucket: dest,
			Key: `gamechanger/${folder}/${filename}`,
			ResponseContentType: filetype
		};

		return new Promise((resolve,reject) => {
			this.awsS3Client.getObject(params, (err, data) => {
				if(err) {
					reject(err, err.stack);
				} else {
					try {
						resolve(data.Body.toString('base64'));
					} catch (e) {
						reject(e)
					}
				}
			})
		});
	}

	async queryGraph(query, parameters = {}, userId) {
		try {
			const driver = await this.getDriver();
			await driver.verifyConnectivity();
			const session = await this.getSession(driver);
			// console.log(body.query);
			const result = await session.run(query, parameters);
			await this.close(driver, session);
			return { result };

		} catch (err) {
			this.logger.error(err, 'LKRS7EO', userId);
			throw err;
		}
	}

	async close(driver, session) {
		await session.close();
		await driver.close();
	}

	async getDriver() {
		return this.neo4j.driver(
			this.constants.GRAPH_DB_CONFIG.url,
			this.neo4j.auth.basic(this.constants.GRAPH_DB_CONFIG.user, this.constants.GRAPH_DB_CONFIG.password)
		);
	}

	async getSession(driver) {
		return driver.session();
	}
}

module.exports.DataLibrary = DataLibrary;
