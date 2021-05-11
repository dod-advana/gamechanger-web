'use strict';
module.exports = (sequelize, DataTypes) => {
	const RESPONSIBILITIES = sequelize.define('responsibilities',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			filename: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			responsibilityLevel1: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			responsibilityLevel2: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			responsibilityLevel3: {
				type: DataTypes.BOOLEAN,
				allowNull: false
			},
			primaryEntity: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			entitiesFound: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			references: {
				type: DataTypes.TEXT,
				allowNull: true
			},

		},
		{
			freezeTableName: true,
			tableName: 'responsibilities',
			timestamps: true
		}
	);
	return RESPONSIBILITIES;
};
