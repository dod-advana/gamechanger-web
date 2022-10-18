'use strict';
const tablename = 'review';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];
			if (!tableDefinition['service_poc_phone_number']) {
				queries.push(queryInterface.addColumn(tablename, 'service_poc_phone_number', Sequelize.TEXT));
			}
			if (!tableDefinition['rev_stp']) {
				queries.push(queryInterface.renameColumn(tablename, 'rev_stp', 'service_ptp_agree_label'));
			}
			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, _Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.renameColumn(tablename, 'service_ptp_agree_label', 'rev_stp'),
				queryInterface.removeColumn(tablename, 'service_poc_phone_number'),
			]);
		});
	},
};
