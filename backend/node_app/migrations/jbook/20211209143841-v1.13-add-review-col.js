'use strict';
const tablename = 'review';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];

			if (!tableDefinition['poc_agree_label'])
				queries.push(queryInterface.addColumn(tablename, 'poc_agree_label', Sequelize.TEXT));
			if (!tableDefinition['poc_class_label'])
				queries.push(queryInterface.addColumn(tablename, 'poc_class_label', Sequelize.TEXT));
			if (!tableDefinition['poc_ptp'])
				queries.push(queryInterface.addColumn(tablename, 'poc_ptp', Sequelize.TEXT));
			if (!tableDefinition['poc_ptp_agree_label'])
				queries.push(queryInterface.addColumn(tablename, 'poc_ptp_agree_label', Sequelize.TEXT));
			if (!tableDefinition['poc_mp_list'])
				queries.push(queryInterface.addColumn(tablename, 'poc_mp_list', Sequelize.TEXT));
			if (!tableDefinition['poc_mp_agree_label'])
				queries.push(queryInterface.addColumn(tablename, 'poc_mp_agree_label', Sequelize.TEXT));

			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.removeColumn(tablename, 'poc_agree_label', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'poc_class_label', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'poc_ptp', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'poc_ptp_agree_label', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'poc_mp_list', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'poc_mp_agree_label', Sequelize.TEXT),
			]);
		});
	},
};
