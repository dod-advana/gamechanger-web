'use strict';
const tablename = 'portfolio';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.describeTable(tablename).then(() => {
			let queries = [];
			queries.push(queryInterface.renameColumn(tablename, 'private', 'isPrivate'));
			queries.push(
				queryInterface.addColumn(tablename, 'creator', {
					type: Sequelize.INTEGER,
				})
			);
			queries.push(
				queryInterface.addColumn(tablename, 'admins', {
					type: Sequelize.ARRAY(Sequelize.INTEGER),
					defaultValue: [],
				})
			);
			return queryInterface.sequelize.transaction(function () {
				Promise.all(queries);
			});
		});
	},

	down: (queryInterface, Sequelize) => {
		let queries = [];
		queries.push(queryInterface.renameColumn(tablename, 'isPrivate', 'private'));
		queries.push(
			queryInterface.removeColumn(tablename, 'creator', {
				type: Sequelize.INTEGER,
			})
		);
		queries.push(
			queryInterface.removeColumn(tablename, 'admins', {
				type: Sequelize.ARRAY(Sequelize.INTEGER),
			})
		);
		return queryInterface.sequelize.transaction(function () {
			Promise.all(queries);
		});
	},
};
