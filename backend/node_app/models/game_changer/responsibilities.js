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
			documentTitle: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			organizationPersonnel: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			responsibilityText: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			otherOrganizationPersonnel: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			documentsReferenced: {
				type: DataTypes.ARRAY(DataTypes.TEXT),
				allowNull: true
			},
			status: {
				type: DataTypes.TEXT,
				defaultValue: 'active'
			},
		},
		{
			freezeTableName: true,
			tableName: 'responsibilities',
			timestamps: false
		}
	);

	RESPONSIBILITIES.associate = (models) => {
		RESPONSIBILITIES.hasMany(models.responsibility_report, { 
			foreignKey: 'responsibility_id'
		})
	}

	return RESPONSIBILITIES;
};
