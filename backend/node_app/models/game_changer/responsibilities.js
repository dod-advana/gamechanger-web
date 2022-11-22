'use strict';
module.exports = (sequelize, DataTypes) => {
	const RESPONSIBILITIES = sequelize.define(
		'responsibilities',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			filename: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			documentTitle: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			organizationPersonnelNumbering: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			organizationPersonnelText: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			organizationPersonnelEntities: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			responsibilityNumbering: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			responsibilityText: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			responsibilityEntities: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			status: {
				type: DataTypes.TEXT,
				defaultValue: 'active',
			},
		},
		{
			freezeTableName: true,
			tableName: 'responsibilities',
			timestamps: false,
		}
	);

	RESPONSIBILITIES.associate = (models) => {
		RESPONSIBILITIES.hasMany(models.responsibility_report, {
			foreignKey: 'responsibility_id',
		});
	};

	return RESPONSIBILITIES;
};
