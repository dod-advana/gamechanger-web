'use strict';
module.exports = (sequelize, DataTypes) => {
	const GL = sequelize.define(
		'gl',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			uot_aai: {
				type: DataTypes.TEXT,
			},
			uot_absamount: {
				type: DataTypes.DOUBLE,
			},
			uot_acctgperiod_calendar: {
				type: DataTypes.INTEGER,
			},
			uot_acrn: {
				type: DataTypes.TEXT,
			},
			uot_agency: {
				type: DataTypes.TEXT,
			},
			uot_assessableunit: {
				type: DataTypes.TEXT,
			},
			uot_budgetactivity: {
				type: DataTypes.TEXT,
			},
			uot_budgetlineitem: {
				type: DataTypes.TEXT,
			},
			uot_budgetsubactivity: {
				type: DataTypes.TEXT,
			},
			uot_clin: {
				type: DataTypes.TEXT,
			},
			uot_commitmentnumber: {
				type: DataTypes.TEXT,
			},
			uot_costcenter: {
				type: DataTypes.TEXT,
			},
			uot_dcas_id: {
				type: DataTypes.TEXT,
			},
			uot_department: {
				type: DataTypes.TEXT,
			},
			uot_departmenttransfer: {
				type: DataTypes.TEXT,
			},
			uot_dssn: {
				type: DataTypes.TEXT,
			},
			uot_endfy: {
				type: DataTypes.TEXT,
			},
			uot_fednonfedind: {
				type: DataTypes.TEXT,
			},
			uot_fiscalperiod: {
				type: DataTypes.INTEGER,
			},
			uot_fiscalyear: {
				type: DataTypes.INTEGER,
			},
			uot_fundscenter: {
				type: DataTypes.TEXT,
			},
			uot_invoicenumber: {
				type: DataTypes.TEXT,
			},
			uot_mainaccount: {
				type: DataTypes.TEXT,
			},
			uot_objectclass: {
				type: DataTypes.TEXT,
			},
			uot_obligationnumber: {
				type: DataTypes.TEXT,
			},
			uot_periodname: {
				type: DataTypes.TEXT,
			},
			uot_piin: {
				type: DataTypes.TEXT,
			},
			uot_receivingreport: {
				type: DataTypes.TEXT,
			},
			uot_reimbbillnumber: {
				type: DataTypes.TEXT,
			},
			uot_reimbcustorder: {
				type: DataTypes.TEXT,
			},
			uot_reimbursableflag: {
				type: DataTypes.TEXT,
			},
			uot_sglprefix: {
				type: DataTypes.TEXT,
			},
			uot_sglsuffix: {
				type: DataTypes.TEXT,
			},
			uot_signedamount: {
				type: DataTypes.DOUBLE,
			},
			uot_slin: {
				type: DataTypes.TEXT,
			},
			uot_source_system: {
				type: DataTypes.TEXT,
			},
			uot_spiin: {
				type: DataTypes.TEXT,
			},
			uot_subhead: {
				type: DataTypes.TEXT,
			},
			uot_system: {
				type: DataTypes.TEXT,
			},
			uot_tradingpartnerentity: {
				type: DataTypes.TEXT,
			},
			uot_tradingpartnerind: {
				type: DataTypes.TEXT,
			},
			uot_tradingpartnermainacct: {
				type: DataTypes.TEXT,
			},
			uot_transeffdate: {
				type: DataTypes.TEXT,
			},
			uot_transid: {
				type: DataTypes.TEXT,
			},
			uot_transpostdate: {
				type: DataTypes.TEXT,
			},
			uot_user: {
				type: DataTypes.TEXT,
			},
			uot_voucher: {
				type: DataTypes.TEXT,
			},
			uot_activity: {
				type: DataTypes.TEXT,
			},
			uot_apportcategory: {
				type: DataTypes.TEXT,
			},
			uot_authoritytype: {
				type: DataTypes.TEXT,
			},
			uot_availabilitytype: {
				type: DataTypes.TEXT,
			},
			uot_bali: {
				type: DataTypes.TEXT,
			},
			uot_betc: {
				type: DataTypes.TEXT,
			},
			uot_bpn: {
				type: DataTypes.TEXT,
			},
			uot_costelementcode: {
				type: DataTypes.TEXT,
			},
			uot_debitcreditindicator: {
				type: DataTypes.TEXT,
			},
			uot_fiscalmonth: {
				type: DataTypes.TEXT,
			},
			uot_fiscalquarter: {
				type: DataTypes.TEXT,
			},
			uot_fundsstatus: {
				type: DataTypes.TEXT,
			},
			uot_ledger: {
				type: DataTypes.TEXT,
			},
			uot_programelement: {
				type: DataTypes.TEXT,
			},
			uot_programyear: {
				type: DataTypes.TEXT,
			},
			uot_project: {
				type: DataTypes.TEXT,
			},
			uot_psc: {
				type: DataTypes.TEXT,
			},
			uot_sces_agency: {
				type: DataTypes.TEXT,
			},
			uot_sces_case: {
				type: DataTypes.TEXT,
			},
			uot_sces_case_line: {
				type: DataTypes.TEXT,
			},
			uot_sces_customer: {
				type: DataTypes.TEXT,
			},
			uot_subaccount: {
				type: DataTypes.TEXT,
			},
			uot_suballottee: {
				type: DataTypes.TEXT,
			},
			uot_disasteremergencyfundcode: {
				type: DataTypes.TEXT,
			},
			uot_contingencycode: {
				type: DataTypes.TEXT,
			},
			uot_begfy: {
				type: DataTypes.TEXT,
			},
		},
		{
			freezeTableName: true,
			timestamps: false,
			tableName: 'gl',
		}
	);
	return GL;
};
