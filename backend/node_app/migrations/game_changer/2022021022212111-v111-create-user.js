'use strict';

const tableName = 'users';

module.exports = {
	up: (queryInterface, Sequelize) =>
		queryInterface.createTable(tableName, {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			user_id: {
				type: Sequelize.TEXT,
				unique: true,
			},
			cn: {
				type: Sequelize.TEXT,
			},
			first_name: {
				type: Sequelize.TEXT,
			},
			last_name: {
				type: Sequelize.TEXT,
			},
			organization: {
				type: Sequelize.TEXT,
			},
			email: {
				type: Sequelize.TEXT,
			},
			phone_number: {
				type: Sequelize.TEXT,
			},
			sub_office: {
				type: Sequelize.TEXT,
			},
			country: {
				type: Sequelize.TEXT,
			},
			state: {
				type: Sequelize.TEXT,
			},
			city: {
				type: Sequelize.TEXT,
			},
			job_title: {
				type: Sequelize.TEXT,
			},
			preferred_name: {
				type: Sequelize.TEXT,
			},
			extra_fields: {
				type: Sequelize.JSONB,
			},
			is_super_admin: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
		}),

	down: (queryInterface, Sequelize) => queryInterface.dropTable(tableName),
};
