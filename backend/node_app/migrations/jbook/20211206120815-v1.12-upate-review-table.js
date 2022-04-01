'use strict';
const tablename = 'review';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then((tableDefinition) => {
			const queries = [];

			if (!tableDefinition['alternate_poc_title'])
				queries.push(
					queryInterface.addColumn(tablename, 'alternate_poc_title', { type: Sequelize.TEXT, unique: false })
				);
			if (!tableDefinition['alternate_poc_name'])
				queries.push(
					queryInterface.addColumn(tablename, 'alternate_poc_name', { type: Sequelize.TEXT, unique: false })
				);
			if (!tableDefinition['alternate_poc_email'])
				queries.push(
					queryInterface.addColumn(tablename, 'alternate_poc_email', { type: Sequelize.TEXT, unique: false })
				);
			if (!tableDefinition['alternate_poc_org'])
				queries.push(
					queryInterface.addColumn(tablename, 'alternate_poc_org', { type: Sequelize.TEXT, unique: false })
				);
			if (!tableDefinition['alternate_poc_phone_number'])
				queries.push(
					queryInterface.addColumn(tablename, 'alternate_poc_phone_number', {
						type: Sequelize.TEXT,
						unique: false,
					})
				);

			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(function () {
			Promise.all([
				queryInterface.removeColumn(tablename, 'alternate_poc_title', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'alternate_poc_name', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'alternate_poc_email', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'alternate_poc_org', Sequelize.TEXT),
				queryInterface.removeColumn(tablename, 'alternate_poc_phone_number', Sequelize.TEXT),
			]);
		});
	},
};
