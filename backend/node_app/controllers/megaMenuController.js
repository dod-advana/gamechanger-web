const MODEL = require('../models').megamenu_links;
const LOGGER = require('../lib/logger');
const Sequelize = require('sequelize');
const _ = require('underscore');

class MegaMenuController {
	constructor(opts = {}) {
		const {
			model = MODEL,
			logger = LOGGER
		} = opts;

		this.model = model;
		this.logger = logger;

		this.getLinks = this.getLinks.bind(this);
		this.getMegamenuConfigFromDb = this.getMegamenuConfigFromDb.bind(this);
		this.getOverviewLink = this.getOverviewLink.bind(this);
		this.generateLinkLabels = this.generateLinkLabels.bind(this);
		this.generateLink = this.generateLink.bind(this);
		this.generateTwoLevelConfig = this.generateTwoLevelConfig.bind(this);
		this.generateThreeLevelConfig = this.generateThreeLevelConfig.bind(this);
	}

	async getLinks(req, res) {
		const links = await this.getMegamenuConfigFromDb();
		res.status(200).send({links});
	}

	async getMegamenuConfigFromDb() {
		const findAllOptions = {
			raw: true,
			order: [
				['row_number', 'asc'],
				['section', 'asc']
			],
		};

		const config = {
			model: this.model,
			xlsxFileName: 'sitemap.xlsx',
			oneLevelSections: ['About', 'Applications', 'Learn', 'Support'],
			twoLevelSections: ['Initiatives', 'Tools'],
			threeLevelSections: ['Analytics'],
			redisKey: 'megamenu_config',
		};

		let links = await this.model.findAll(findAllOptions);
		const linksIndexed = _.groupBy(links, 'section');
		return this.convertDbRowsToJSON(linksIndexed, config);
	}

	generateLink(row, label) {
		let link = {
			label: label || row['link_label'],
			link: row['href'] || '#',
			chip: row.chip || null,
			description: row.description,
			newTab: row['new_tab'],
			permission: row['permission'] || null,
			link_identifier: row['link_identifier'] || null,
			notAvailable: _.isEmpty(row['href'])
		};
		if (row['hide_without_permission']) {
			link.hideWithoutPermission = true;
		}
		return link;
	}

	generateLinkLabels(data) {
		return _.map(data, (row) => this.generateLink(row));
	}

    getOverviewLink(sectionData, section) {
		let link = { link: '#', description: '' };
		const overviewLabel = `${section} Overview`;
		const lookup = _.find(sectionData, x => x['subsection1_label'] === overviewLabel || x['link_label'] === overviewLabel);
		if (lookup && lookup['href']) link = { link: lookup['href'], description: lookup.description };
		return link;
	}

	generateTwoLevelConfig(data) {
		const sections = _.chain(data).uniq('subsection1_label').pluck('subsection1_label').value();
		return _.map(sections, label => {
			const filteredSectionData = _.filter(data, row => row['subsection1_label'] === label);
			if (filteredSectionData.length === 1) return this.generateLink(filteredSectionData[0], filteredSectionData[0]['subsection1_label']);
			return {
				label,
				links: this.generateLinkLabels(filteredSectionData),
			}
		});
	}
	
	generateThreeLevelConfig(data) {
		const sections = _.chain(data).uniq('subsection1_label').pluck('subsection1_label').value();
		return _.map(sections, sectionLabel => {
			const subsections = _.chain(data)
				.filter(row => row['subsection1_label'] === sectionLabel)
				.uniq('subsection2_label')
				.pluck('subsection2_label')
				.value();
	
			const links = _.map(subsections, label => {
				const filteredSectionData = _.filter(data, row => row['subsection2_label'] === label && row['subsection1_label'] === sectionLabel);
				if (filteredSectionData.length === 1) {
					return this.generateLink(filteredSectionData[0], filteredSectionData[0]['subsection2_label'] || filteredSectionData[0]['subsection1_label']);
				}
				const thirdLevelLinks = this.generateTwoLevelConfig(filteredSectionData);
				return {
					label,
					links: thirdLevelLinks[0].links,
					permission: null
				}
			})
			if (links.length === 1) return links[0];
			return {
				label: sectionLabel,
				links
			}
	
		});
	}

	convertDbRowsToJSON(data, config) {
		const { oneLevelSections, twoLevelSections, threeLevelSections } = config;
	
		const data1 = _.map(oneLevelSections, section => {
			const sectionData = data[section];
			const {link, description} = this.getOverviewLink(sectionData, section);
			return {
				title: section,
				description,
				link,
				links: this.generateLinkLabels(sectionData)
			}
		});
	
		const data2 = _.map(twoLevelSections, section => {
			const sectionData = data[section];
			const {link, description} = this.getOverviewLink(sectionData, section);
			return {
				title: section,
				description,
				link,
				links: this.generateTwoLevelConfig(sectionData)
			}
		});
	
		const data3 = _.map(threeLevelSections, section => {
			const sectionData = data[section];
			const {link, description} = this.getOverviewLink(sectionData, section);
			return {
				title: section,
				description,
				link,
				links: this.generateThreeLevelConfig(sectionData)
			}
		});
		return _.indexBy([...data1, ...data2, ...data3], 'title');
	}
}

module.exports.MegaMenuController = MegaMenuController;