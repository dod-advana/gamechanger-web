'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('gl', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			"uot_aai": {
        type: Sequelize.TEXT
      },
			"uot_absamount": {
        type: Sequelize.DOUBLE
      },
      "uot_acctgperiod_calendar": {
        type: Sequelize.INTEGER
      },
      "uot_acrn": {
        type: Sequelize.TEXT
      },
      "uot_agency": {
        type: Sequelize.TEXT
      },
      "uot_assessableunit": {
        type: Sequelize.TEXT
      },
      "uot_budgetactivity": {
        type: Sequelize.TEXT
      },
      "uot_budgetlineitem": {
        type: Sequelize.TEXT
      },
      "uot_budgetsubactivity": {
        type: Sequelize.TEXT
      },
      "uot_clin": {
        type: Sequelize.TEXT
      },
      "uot_commitmentnumber": {
        type: Sequelize.TEXT
      },
      "uot_costcenter": {
        type: Sequelize.TEXT
      },
      "uot_dcas_id": {
        type: Sequelize.TEXT
      },
      "uot_department": {
        type: Sequelize.TEXT
      },
      "uot_departmenttransfer": {
        type: Sequelize.TEXT
      },
      "uot_dssn": {
        type: Sequelize.TEXT
      },
      "uot_endfy": {
        type: Sequelize.TEXT
      },
      "uot_fednonfedind": {
        type: Sequelize.TEXT
      },
      "uot_fiscalperiod": {
        type: Sequelize.INTEGER
      },
      "uot_fiscalyear": {
        type: Sequelize.INTEGER
      },
      "uot_fundscenter": {
        type: Sequelize.TEXT
      },
      "uot_invoicenumber": {
        type: Sequelize.TEXT
      },
      "uot_mainaccount": {
        type: Sequelize.TEXT
      },
      "uot_objectclass": {
        type: Sequelize.TEXT
      },
      "uot_obligationnumber": {
        type: Sequelize.TEXT
      },
      "uot_periodname": {
        type: Sequelize.TEXT
      },
      "uot_piin": {
        type: Sequelize.TEXT
      },
      "uot_receivingreport": {
        type: Sequelize.TEXT
      },
      "uot_reimbbillnumber": {
        type: Sequelize.TEXT
      },
      "uot_reimbcustorder": {
        type: Sequelize.TEXT
      },
      "uot_reimbursableflag": {
        type: Sequelize.TEXT
      },
      "uot_sglprefix": {
        type: Sequelize.TEXT
      },
      "uot_sglsuffix": {
        type: Sequelize.TEXT
      },
      "uot_signedamount": {
        type: Sequelize.DOUBLE
      },
      "uot_slin": {
        type: Sequelize.TEXT
      },
      "uot_source_system": {
        type: Sequelize.TEXT
      },
      "uot_spiin": {
        type: Sequelize.TEXT
      },
      "uot_subhead": {
        type: Sequelize.TEXT
      },
      "uot_system": {
        type: Sequelize.TEXT
      },
      "uot_tradingpartnerentity": {
        type: Sequelize.TEXT
      },
      "uot_tradingpartnerind": {
        type: Sequelize.TEXT
      },
      "uot_tradingpartnermainacct": {
        type: Sequelize.TEXT
      },
      "uot_transeffdate": {
        type: Sequelize.TEXT
      },
      "uot_transid": {
        type: Sequelize.TEXT
      },
      "uot_transpostdate": {
        type: Sequelize.TEXT
      },
      "uot_user": {
        type: Sequelize.TEXT
      },
      "uot_voucher": {
        type: Sequelize.TEXT
      },
      "uot_activity": {
        type: Sequelize.TEXT
      },
      "uot_apportcategory": {
        type: Sequelize.TEXT
      },
      "uot_authoritytype": {
        type: Sequelize.TEXT
      },
      "uot_availabilitytype": {
        type: Sequelize.TEXT
      },
      "uot_bali": {
        type: Sequelize.TEXT
      },
      "uot_betc": {
        type: Sequelize.TEXT
      },
      "uot_bpn": {
        type: Sequelize.TEXT
      },
      "uot_costelementcode": {
        type: Sequelize.TEXT
      },
      "uot_debitcreditindicator": {
        type: Sequelize.TEXT
      },
      "uot_fiscalmonth": {
        type: Sequelize.TEXT
      },
      "uot_fiscalquarter": {
        type: Sequelize.TEXT
      },
      "uot_fundsstatus": {
        type: Sequelize.TEXT
      },
      "uot_ledger": {
        type: Sequelize.TEXT
      },
      "uot_programelement": {
        type: Sequelize.TEXT
      },
      "uot_programyear": {
        type: Sequelize.TEXT
      },
      "uot_project": {
        type: Sequelize.TEXT
      },
      "uot_psc": {
        type: Sequelize.TEXT
      },
      "uot_sces_agency": {
        type: Sequelize.TEXT
      },
      "uot_sces_case": {
        type: Sequelize.TEXT
      },
      "uot_sces_case_line": {
        type: Sequelize.TEXT
      },
      "uot_sces_customer": {
        type: Sequelize.TEXT
      },
      "uot_subaccount": {
        type: Sequelize.TEXT
      },
      "uot_suballottee": {
        type: Sequelize.TEXT
      },
      "uot_disasteremergencyfundcode": {
        type: Sequelize.TEXT
      },
      "uot_contingencycode": {
        type: Sequelize.TEXT
      },
      "uot_begfy": {
        type: Sequelize.TEXT
      }
		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('gl');
	}
};