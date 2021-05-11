const GC_CLONES = require('../models').gc_clones;
const LOGGER = require('../lib/logger');

class CloneController {

	constructor(opts = {}) {
		const {
			logger = LOGGER,
			gcClones = GC_CLONES,
		} = opts;

		this.logger = logger;
		this.gcClones = gcClones;

		this.getGCCloneData = this.getGCCloneData.bind(this);
		this.storeGCCloneData = this.storeGCCloneData.bind(this);
		this.deleteGCCloneData = this.deleteGCCloneData.bind(this);
	}

	async getGCCloneData(req, res) {
		let userId = 'webapp_unknown';
		try {
			// const { searchQuery, docTitle } = req.body;
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const clones = await this.gcClones.findAll({ raw: true });

			clones.push(
				{
					clone_name: 'GAMECHANGER',
					is_live: true,
					can_edit: false,
					clone_data:
						{
							url: 'gamechanger',
							gcIndex: 'gamechanger',
							s3Bucket: 'advana-raw-zone',
							tutorial: true,
							esCluster: 'gamechanger',
							graphView: true,
							cloneToSipr: false,
							crowdSource: true,
							project_name: 'policy',
							userFeedback: true,
							cloneToAdvana: true,
							model_version: '',
							cloneToJupiter: true,
							intelligentSearch: true,
							cloneToGamechanger: true,
							permissionsRequired: false
						}
				}
			);

			res.status(200).send({ clones, timeStamp: new Date().toISOString() });

		} catch (err) {
			this.logger.error(err, 'NIF29YV', userId);
			res.status(500).send(err);
		}
	}

	async storeGCCloneData(req, res) {
		let userId = 'webapp_unknown';
		try {
			const { cloneData } = req.body;
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const [clone, created] = await this.gcClones.findOrCreate(
				{
					where: { clone_name: cloneData.name },
					defaults: {
						clone_name: cloneData.name,
						is_live: false,
						clone_data: {
							project_name: cloneData.project_name,
							url: cloneData.url,
							edl_service: cloneData.edl_service,
							model_version: cloneData.model_version,
							intelligentSearch: cloneData.intelligentSearch,
							tutorial: cloneData.tutorial,
							crowdSource: cloneData.crowdSource,
							userFeedback: cloneData.userFeedback,
							graphView: cloneData.graphView,
							cloneToGamechanger: cloneData.cloneToGamechanger,
							cloneToAdvana: cloneData.cloneToAdvana,
							cloneToSipr: cloneData.cloneToSipr,
							cloneToJupiter: cloneData.cloneToJupiter,
							esCluster: cloneData.esCluster,
							s3Bucket: cloneData.s3Bucket,
							permissionsRequired: cloneData.permissionsRequired,
							gcIndex: cloneData.gcIndex,
							extSearchFields: cloneData.extSearchFields,
							extRetrieveFields: cloneData.extRetrieveFields,
							auxDisplayBackFields: cloneData.auxDisplayBackFields,
							auxDisplayFrontFields: cloneData.auxDisplayFrontFields,
							auxDisplayTitleField: cloneData.auxDisplayTitleField,
							auxDisplayLeftSubtitleText: cloneData.auxDisplayLeftSubtitleText,
							auxDisplayRightSubtitleField: cloneData.auxDisplayRightSubtitleField,
							auxIndex: cloneData.auxIndex,
							auxRetrieveFields: cloneData.auxRetrieveFields,
							auxSearchFields: cloneData.auxSearchFields,
							auxDisplayFieldJSONMap: cloneData.auxDisplayFieldJSONMap
						}
					}
				}
			);

			if (!created) {
				clone.is_live = cloneData.is_live;
				clone.clone_data = {
					project_name: cloneData.project_name,
					url: cloneData.url,
					edl_service: cloneData.edl_service,
					model_version: cloneData.model_version,
					intelligentSearch: cloneData.intelligentSearch,
					tutorial: cloneData.tutorial,
					crowdSource: cloneData.crowdSource,
					userFeedback: cloneData.userFeedback,
					graphView: cloneData.graphView,
					cloneToGamechanger: cloneData.cloneToGamechanger,
					cloneToAdvana: cloneData.cloneToAdvana,
					cloneToSipr: cloneData.cloneToSipr,
					cloneToJupiter: cloneData.cloneToJupiter,
					esCluster: cloneData.esCluster,
					s3Bucket: cloneData.s3Bucket,
					permissionsRequired: cloneData.permissionsRequired,
					gcIndex: cloneData.gcIndex,
					extSearchFields: cloneData.extSearchFields,
					extRetrieveFields: cloneData.extRetrieveFields,
					auxDisplayBackFields: cloneData.auxDisplayBackFields,
					auxDisplayFrontFields: cloneData.auxDisplayFrontFields,
					auxDisplayTitleField: cloneData.auxDisplayTitleField,
					auxDisplayLeftSubtitleText: cloneData.auxDisplayLeftSubtitleText,
					auxDisplayRightSubtitleField: cloneData.auxDisplayRightSubtitleField,
					auxIndex: cloneData.auxIndex,
					auxRetrieveFields: cloneData.auxRetrieveFields,
					auxSearchFields: cloneData.auxSearchFields,
					auxDisplayFieldJSONMap: cloneData.auxDisplayFieldJSONMap
				};
				await clone.save();
			}

			res.status(200).send({ created: created, updated: !created });

		} catch (err) {
			this.logger.error(err, 'BSMH6OC', userId);
			res.status(500).send(err);
		}
	}

	async deleteGCCloneData(req, res) {
		let userId = 'webapp_unknown';
		try {
			const { id } = req.body;
			userId = req.get('SSL_CLIENT_S_DN_CN');

			const clone = await this.gcClones.findOne({ where: { id: id } });
			await clone.destroy();

			res.status(200).send({ deleted: true });

		} catch (err) {
			this.logger.error(err, 'XLLT5M5', userId);
			res.status(500).send(err);
		}
	}
}

module.exports.CloneController = CloneController;
