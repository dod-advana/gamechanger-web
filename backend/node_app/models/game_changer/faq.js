'use strict';
module.exports = (sequelize, DataTypes) => {
	const faq = sequelize.define('faq',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			question: {
				type: DataTypes.STRING,
				allowNull: false
			},
			answer: {
				type: DataTypes.STRING,
				allowNull: false
			},
			category: {
				type: DataTypes.STRING
			},
		},
		{
			freezeTableName: true,
			tableName: 'faq',
			timestamps: true
		}
	);
	return faq;
};
