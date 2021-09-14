const assert = require('assert');
const { DocumentController } = require('../../node_app/controllers/documentController');
const { constructorOptionsMock, resMock, reqMock } = require('../resources/testUtility');

describe('DocumentController', function () {

	describe('#cleanDocumentForCrowdAssist', () => {
		it('should clean up the document pulled and format for crowd assist use', (done) => {
			const fakeDoc = {
				type: 'document',
				id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_0',
				filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
				page_count: 8,
				par_count_i: 8,
				doc_type: 'SEC',
				doc_num: 'Memo',
				ref_list: [],
				summary_30: 'which includes EW, I run establishing an EMSO CFT, overseen by the SDO, to take bold action The CFT will identify EMSO gaps in capability, capacity, personnel, training,',
				init_date: 'NA',
				change_date: 'NA',
				entities: [
					'NA_1',
					'NA_2'
				],
				author: 'NA',
				signature: 'NA',
				subject: 'NA',
				title: 'NA',
				word_count: 2565,
				classification: 'NA',
				group_s: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_0',
				keyw_5: [
					[
						'emso capabilities',
						'emso cft',
						'electromagnetic spectrum',
						'temporary access',
						'stated blu',
						'spectrum management',
						'special programs',
						'service training',
						'senior official',
						'routine updates'
					]
				],
				text: '.·� SECRETARY OF DEFENSE 1000 DEFENSE PENTAGON WASHINGTON DC 20301·1000 FEB O 2 2019 MEMORANDUM FOR ClUEF MA.iJAGEMENT OFFICER OF THE DEPARTMENT OF DEFENSE SECRETARIES OF THE MILITARY DEPARTMENTS CHAIRMAN OF THE JOINT CHJEFS OF STAFF UNDER SECRET ARIES OF DEFENSE COMMANDERS OF THE COMBATANT COMMANDS CHIEF OF THE NATIONAL GUARD BUREAU GENERAL COUNSEL OF THE DEPARTMENT OF DEFENSE DfRECTOR OF COST ASSESSMENT AND PROGRAM EVALUATION INSPECTOR GENERAL OF THE DEPARTMENT OF DEFENSE DIRECTOR OF OPERATIONAL TEST AND EVALUATION CHIEF INFORlvlA TION OFFICER OF THE DEPARTMENT OF DEFENSE ASSISTANT SECRETARY OF DEFENSE FOR LEGISLATIVE AFFAIRS ASSIST ANT TO THE SECRETARY OF DEFENSE FOR PUBLIC AFFAIRS DIRECTOR OF NET ASSESSMENT DIRECTORS OF THE DEFENSE AGENCIES DIRECTORS OF THE DOD FIELD ACTTVITIES SUBJECT Establishmeni of the Electromagnetic Spectrum Operations Cross Functional Team In accordance with sections 918 and I 053 of the National Defense Authorization Act NDAA for FY 2019 Public Law 115232 I am appointing the Vice Chairman of the Joint Chiefs of Staff as the Senior Designated Official SDO to oversee implementation of the Department of Defenses strategy ·for the conduct and execution of the electronic warfare EW mission area and joint electromagnetic spectrum operations EMSO. The SDO will be a member of the EW Executive Committee EXCOM and will propose EMSO governance management organization and operational reforms to me after review and comment by the EW EXCOM. The NOAA for FY 2019 tasks me to establish a Cross Functional Terun CFT on EW. To ensure we are addressing all tl1e requirements necessary to successfully conduct EMSO which includes EW I run establishing an EMSO CFT overseen by the SDO to take bold action across the department to regain U.S. dominance in the electromagnetic spectrum. As defined by the attached Terms of Reference ToR the CFT shall have insight into Service budgets and programs and shall recommend related Judget and readiness requirements to build a more lethal force. The CFT will identify EMSO gaps in capability capacity personnel training experimentation and resourcing and identify requirements and plans across doctrine organization training materiel leadership. personnel. facilities and policy to address these gaps. The CFT will provide recommendations to the SDO update the EW Strategy and develop a II rn�i liU 11 OS0000026t9CMCXJ00039· 19 roadmap that provides plans to address EMSO gaps. Additionally the SDO will assess the sufficiency of funds in each Presidents budget needed for the development ofan Electromagnetic Battle Management capability and Joint EMSO cell operations. The ToR for the CFT are attached. The SDO will report to me on CFT progress recommendations and needs by March I 2019 with routine updates thereafter. Attachment As stated blU..... ...... Patrick M. Shanahan Acting 2 ATIACHMENT I TERMS OF REFERENCE FOR THE ELECTROMAGNETIC SPECTRUM OPERA TIO NS CROSS FVNCTIONAL TEAM REFERENCES. a. John S. McCain National Defense Authorization Act for Fiscal Year 2019 Sections 918 and 1053 b. National Defense Authorization Act for Fiscal Year 2017 Section 911 c. Electronic Warfare EW Executive Committee EXCOM Charter PURPOSE. The Electromagnetic Spectrum Operations EMSO Cross Functional Team CFT is established to • Provide for effective and efficient collaboration and integration across organizational and functional boundaries in the Department of Defense DoD • Identify gaps in EMSO comprised of Electronic Warfare EW and Spectrum Management SM manpower technologies and processes for creating multidomain EMS advantage • Provide comprehensive and tiilly integrated policies strategies plans and requirements to address EMSO gaps to include all Directed Energy DE weapon investments and programs • Make decisions on crossfunctional issues to the extent authorii.ed by the Secretary and within parameters established by the Secretary • Provide oversight for and as directed by the Secretary supervise the implementation of approved policies strategies plans and resourcing decisions approved by the Secretary . BACKGROUND. The National Defense Authorization Act NDAA for Fiscal Year 2019 requires the Secretary of Defense SecDef to • Designate a senior official hereby referred to as the Senior Designated Official SDO who shall establish and oversee processes and procedures to develop integrate and enhance the electronic warfare EW mission area and the conduct of Joint Electromagnetic Spectrum Operations JEMSO in all domains across the DoD and ensure that such processes and procedures provide for integrated defensewide strategy planning and budgeting with respect to the conduct of such operations by the DoD including activities conducted to counter and deter such operations by malign actors. • Establish a CFT on EW which will be overseen by the SDO. The EI CFT will identify gaps in EW and JEMSO capabilities and capacities across personnel procedural and equipment areas and shall provide recommendations to the SDO to address gaps. In order to ensure we are addressing all the requirements necessary to successfully conduct EMSO which includes EW I am establishing an EMSO CFT overseen by the SDO to take bold action across the department to regain US dominance in the electromagnetic spectrum. PROBLEM STATEMENT. The Deprutment of Defense must take action to address an erosion in EMSO capabilities relative to the pacing threats identified in the 2018 National Defense Strategy. Overcoming this problem will require comprehensive actions spanning EMSO Doctrine Organization Training Materiel Leadership Personnel Facilities and Policy DOTMLPFP. MISSION STATEMENT. The EMSO CFT will develop requirements and specific plans to evaluate recommend and implement improvements to EMSO capabilities across the Department necessary to achieve operational superiority within the Electromagnetic Spectrnm EMS. CONCEPT OF OPERA TIO NS. This is a DoDwide and multiyear effort involving multiple DoD organizational entities in both the core EMSO CFT membership and including reach­ back to subject matter expertise and support from both DoD and other external organizations such as Director of National Intelligence Department of Commerce Department of State and other organizations as appropriate. The EMSO CFT will have five overlapping phases and six Lines of Effort LO Es. The EMSO CFT will develop metrics to evaluate progress in identifying and addressing EMSO gaps. Phase l • Establish the EMSO CFT. Contributing organizations will identify full­ time EMSO CFT members within 30 days of this memorandum and those personnel shall be in place and colocated with the EMSO CFT workspaces NLT January 15 2019. The Chief Management Office CMO of the DoD will secure working spaces and equipment no later than January 2 2019 and provide CFT training to all EMSO CFT personnel. Phase U Shaping. During this phase the EMSO Crr will conduct fact finding including review of documentation communications with subject matter experts in and out of the Department and site visits necessary to gain an understanding of the requirements and gaps in EMSO. The Military Departments MilDepsCombatant Commands CCMDs and Intelligence Community will provide information to fully describe the required EMSO capabilities to effectively operate in the current and future EMS operational environment. The EMSO CFT will help key DoD leaders conununicate their efforts to audiences within and outside the DoD. This phase runs concurrent with all other phases. Phase III  Decisive Acti.on. In coordination with the MiDeps and CCMDs the EMSO CFT will provide recommendations to the Senior Designated Official for materiel and nonmateriel solutions to address the EMSO gaps identified across the DOTMLPFP spectrum. The recommendations will be documented in a roadmap which will identify tbe Office of Primary Responsibility OPR milestones and resource requirements for the actions. Phase IV  Exploitation. Through an iterative process designed to identify and 2 disseminate best practices the EMSO CFT will continually evaluate Mi1Dep and CCMD efforts. Additionally the EMSO CFT will continue to leverage the EW Community of Interest and academia to identify technologies and methods to improve EMSO capabilities. The EMSO CFT will assess progress in its roadmap through evaluation again.st defined metrics. Phase V  Transition. The EMSO CFT will identify systemic problems and pursue policies and mechanisms for enduring outcomes that continue in the Department throng� and beyond fiscal planning horizons. The EMSO CFT will stand down after the plans are transitioned to the MiDeps and CCMDs no earlier than Fiscal Year 2022. The SDO will recommend to SECDEF when to disestablish the CFT and turnover responsibilities and plans lo the appropriate organizations. LINES OF EFFORT. The following are the initial Lines of Efforts LOEs. The EMSO CFT will execute the LOEs concurrently. The EMSO CFTwill recommend to the SDO the addition deletion or consolidation of LOEs as warranted. a. Joint Force Capability to Conduct Electromagnetic Spectrum Operations. The Joint Force must be able to train and conduct operations in an increasingly complex congested and contested electromagnetic environment. This LOE will examine existing organizational capability operational and process shortfalls and provide plans to address gaps in EMSO including establishment and manning of CCMD organizational constructs frequency planning and deconfliction and processes for obtaining requisite national and host nation approvals to test train and operate in the spectrum. b. DoD Organization for EMSO. This LOE will recommend a path to efficiently and effectively organize the DoD to deliver superior EMSO capabilities to the warfighter. This LOE ·will leverage ongoing studies examining options for optimizing the DoD EMSO organizational construct. c. EMSO Capabilities and Gaps. U.S. competitors have invested in EW as a way of neutralizing our advantage affecting our command control and communications and attempting to weaken our ability to project decisive military power in contested environments. This LOE will examine the threat inventory U.S. capability shortfalls and recommend plans to address gaps including timelines for delivering key EMSO capabilities. This LOE will develop plans to field superior technology and will recommend common materiel solutions across multiple progran1s that can be affordably modified to meet funire needs. d. DoD EW Strategy and Investment. This LOE will perform an analysis of personnel resources capabilities authorities and otbe.r mechanisms required to achieve the strategic objectives of the Department and address EMSO capability gaps. This LOE will identify roadblocks recommend plans to address impediments and identify 3 required resources where funding shortfalls are known or discovered. e. EMSO Experimentation. Test Training Ranges. Key to delivering superior EMSO capabilities to the warfighter is the ability to perform testing experimentation and training in an operationally representative electromagnetic environment. This LOE will examine current EMSO deve.lopIDent and operational test and training infrastrncture determine sufficiency and develop resource recommendations for knovn shortfalls. In addition this LOE will develop plans to improve JEMSO training at all echelons of command and will recommend improvements to Service training across all mission areas. f. EMSO Modeling Simulation. and Wargaming. This LOE will address needed EMSO modeling and simulation capabilities iJJcluding virtual training high fidelity and campaign focused simulation environments and improvements in modeling and simulation for electromagnetic threats. AUTHORITIES a. Generate readiness for EMSO. The EMSO CFT can modify training objectives and metrics for any joint training event to improve EMSO readiness. The EMSO CFT can directly recommend training objectives and metrics for Service training events to improve EMSO readiness. b. Optimize the budget. The EMSO CFT can directly recommend topline growth or zerosum funding alignment to the Strategic Portfolio Review and Program and Budget Review Process. The SDO can submit on behalf of the EMSO CFT and after review by the Office of the Under Secretary of Defense Comptroller and the Chief Management Officer both funded and unfunded priority lists to Congressional committees as part of the annual sufficiency of funds certification. c. Build a more lethal EMSO force. The EMSO CFT will establish processes and procedures to develop integrate and enhance the use ofEMSO capabilities in all mission areas and domains. The CFT shall propose changes in doctrine and policy directly to Sec Def. The CFT shall recommend architectures for crossdomain effects the development and fielding of capabilities across the joint force and provide for the development of a professional force by proposing training education and career paths for EMSO across military and civilian personnel. SENIOR.DESIGNATED OFFICIAL. The SDO designated by the SecDef will have the following responsibilities and duties a . Serve as the leader of the EMSO CFT. b. Serve as a member the EW EX COM. 4 c. Develop an integrated resource strategy for EMSO investment to the EW EXCOM. d. Oversee the DoD EW Strategy implementation. e . Propose EMSO governance management organization and operational reforms to the SecDef after review ru1d comment by the EW EXCOM. f. Provide status reports to Congress every 180 days for three years on EMSO CFT efforts initiatives progress and results pursuant to section 1053d4 of the NDAA for FY2019. g. Provide an assessment of the sufficiency of funds in each Presidents Future Years Defense Program from FY2020 through FY2024 for an Electromagnetic Battle Management capability and for JEMSO cell establishment and operations. h. Recommend directly to SecDef any action required to address identified gaps. ELECTROMAGNETIC SPECTRUM OPERATIONS CROSS FUNCTIONAL TEAM. The CFT will be comprised of core fulltime level .ll and level III personnelorganizations. a. Membership of the EMSO CFT shall consist of fulltime representatives from the organizations below. Members shou.ld be at the 056 or GS14l 5 level. The CFT deputy shall be a IStarSESI level who will be selected by the SDO. The organizations shall nominate CFT members to the SDO for approval. The SDO shall have the authority to modify core CFT organization and personnel membership as required. CFT members shall be assigned to the CFT for a minimum of 12 months. I. CFT Deputy IStarSESI 2. Army 3. Navy 4. Air Force 5. Air Force Space 6. Marine Corps 7. Joint Staff 8. OUSDRE 9. OUSDAS 10. OVSDI 11. DoD CIO 12. VSSTRA TCOM 13. USCYBERCOM b. The CFT level II will be comprised of subject matter expert reachback personnel under the authority of SecDef. The CFT shall have authority to task subject matter experts in other DoD organizations on an asneeded basis. c. The CFT level III will be comprised of organizations not under the authority of 5 SecDef who have an expertise deemed appropriate by the CFT. The CFT shall have liaison authority agreed to by the Level III organization not under DoD authority. RESOURCES Al�D SUPPORT a . The CMO of the DoD will administratively support the CFT to include providing Sensitive Compartmented Information Facility and Special Access Program Facility office space and fT equipment contracting hwnan resources security CF T training and other services as appropriate. The CMO of the DoD will provide other assistance and support as requested by the SDO. b . The EMSO CFT will work in concert with the CMO of the DoD in order to develop resource requirements for CFT operations. Initial FY2019 and FY2020 resource requirements shall be coordinated as soon as possible with the CMO to ensure adequate resources are immediately available. c. The CFT shall work in concert with the CMO in order to develop financial mechanisms including development and validation of source appropriation resource requirements to support the CFT activities and ensure inclusion of any requirements in future budget justification material as required. d. The Director of Special Programs DSP under USDAS shall ensure proper secu1ity oversight is applied to all DoD Special Access Programs SAPs in support of the EMSO CFT. The DSP will establish and maintain a SAP portfolio to include all SAPs relating to weapons application of EMSO capabilities or relating to technologies that may be exploited for EMSO and synergistic cyberspace operations capabilities. The portfolio will include permanent billets sufficient to support the EMSO CFT and temporary access necessary for operation of specialized mission area working groups. 6 ',
				raw_text: '.·� \nSECRETARY OF DEFENSE \n1000 DEFENSE PENTAGON \nWASHINGTON, DC 20301·1000 \nFEB O 2 2019 \nMEMORANDUM FOR Cl-UEF MA.i\'\\JAGEMENT OFFICER OF THE DEPARTMENT OF \nDEFENSE \nSECRETARIES OF THE MILITARY DEPARTMENTS \nCHAIRMAN OF THE JOINT CHJEFS OF STAFF \nUNDER SECRET ARIES OF DEFENSE \nCOMMANDERS OF THE COMBATANT COMMANDS \nCHIEF OF THE NATIONAL GUARD BUREAU \nGENERAL COUNSEL OF THE DEPARTMENT OF DEFENSE \nDfRECTOR OF COST ASSESSMENT AND PROGRAM \nEVALUATION \nINSPECTOR GENERAL OF THE DEPARTMENT OF DEFENSE \nDIRECTOR OF OPERATIONAL TEST AND EVALUATION \nCHIEF INFORl\'vlA TION OFFICER OF THE DEPARTMENT OF \nDEFENSE \nASSISTANT SECRETARY OF DEFENSE FOR LEGISLATIVE \nAFFAIRS \nASSIST ANT TO THE SECRETARY OF DEFENSE FOR PUBLIC \nAFFAIRS \nDIRECTOR OF NET ASSESSMENT \nDIRECTORS OF THE DEFENSE AGENCIES \nDIRECTORS OF THE DOD FIELD ACTTVITIES \nSUBJECT: Establishmeni of the Electromagnetic Spectrum Operations Cross Functional Team \nIn accordance with sections 918 and I 053 of the National Defense Authorization Act \n(NDAA) for FY 2019 (Public Law 115-232), I am appointing the Vice Chairman of the Joint \nChiefs of Staff as the Senior Designated Official (SDO) to oversee implementation of the \nDepartment of Defense\'s strategy ·\'for the conduct and execution of the electronic warfare (EW) \nmission area and joint electromagnetic spectrum operations (EMSO)." The SDO will be a \nmember of the EW Executive Committee (EXCOM) and will propose EMSO governance, \nmanagement, organization, and operational reforms to me, after review and comment by the EW \nEXCOM. \nThe NOAA for FY 2019 tasks me to establish a Cross Functional Terun (CFT) on EW. \nTo ensure we are addressing all tl1e requirements necessary to successfully conduct EMSO, \nwhich includes EW, I run establishing an EMSO CFT, overseen by the SDO, to take bold action \nacross the department to regain U.S. dominance in the electromagnetic spectrum. As defined by \nthe attached Terms of Reference (ToR), the CFT shall have insight into Service budgets and \nprograms, and shall recommend related J:>udget and readiness requirements to build a more lethal \nforce. The CFT will identify EMSO gaps in capability, capacity, personnel, training, \nexperimentation, and resourcing; and identify requirements and plans across doctrine, \norganization, training, materiel, leadership. personnel. facilities, and policy to address these gaps. \nThe CFT will provide recommendations to the SDO, update the EW Strategy, and develop a \nII rn�i liU 11 \nOS0000026-t9/CMCXJ00039· 19 \nroadmap that provides plans to address EMSO gaps. Additionally, the SDO will assess the \nsufficiency of funds in each President\'s budget needed for the development ofan \nElectromagnetic Battle Management capability and Joint EMSO cell operations. \nThe ToR for the CFT are attached. The SDO will report to me on CFT progress, \nrecommendations, and needs by March I, 2019, with routine updates thereafter. \nAttachment: \nAs stated \nblU,.....__ _...... \nPatrick M. Shanahan \nActing \n2 \nATIACHMENT I \nTERMS OF REFERENCE FOR \nTHE ELECTROMAGNETIC SPECTRUM OPERA TIO NS CROSS FVNCTIONAL \nTEAM \nREFERENCES. \na. John S. McCain National Defense Authorization Act for Fiscal Year 2019 Sections \n918 and 1053 \nb. National Defense Authorization Act for Fiscal Year 2017 Section 911 \nc. Electronic Warfare (EW) Executive Committee (EXCOM) Charter \nPURPOSE. The Electromagnetic Spectrum Operations (EMSO) Cross Functional Team (CFT) \nis established to: \n• Provide for effective and efficient collaboration and integration across \norganizational and functional boundaries in the Department of Defense (DoD); \n• Identify gaps in EMSO (comprised of Electronic Warfare (EW) and Spectrum Management \n(SM)) manpower, technologies and processes for creating multi-domain EMS advantage; \n• Provide comprehensive and tiilly integrated policies, strategies, plans and requirements to \naddress EMSO gaps, to include all Directed Energy (DE) weapon investments and \nprograms; \n• Make decisions on cross-functional issues to the extent authorii.ed by the Secretary and \nwithin parameters established by the Secretary; \n• Provide oversight for, and as directed by the Secretary, supervise the implementation of \napproved policies, strategies, plans, and resourcing decisions approved by the Secretary .  \nBACKGROUND. The National Defense Authorization Act (NDAA) for Fiscal Year 2019 \nrequires the Secretary of Defense (SecDef) to: \n• Designate a senior official (hereby referred to as the Senior Designated Official (SDO)), who \nshall establish and oversee processes and procedures to develop, integrate, and enhance the \nelectronic warfare (EW) mission area and the conduct of Joint Electromagnetic Spectrum \nOperations (JEMSO) in all domains across the DoD; and ensure that such processes and \nprocedures provide for integrated defense-wide strategy, planning, and budgeting with \nrespect to the conduct of such operations by the DoD, including activities conducted to \ncounter and deter such operations by malign actors. \n• Establish a CFT on EW, which will be overseen by the SDO. The E,\'I CFT will \nidentify gaps in EW and JEMSO capabilities and capacities, across personnel, \nprocedural, and equipment areas, and shall provide recommendations to the SDO to \naddress gaps. \nIn order to ensure we are addressing all the requirements necessary to successfully conduct \nEMSO, which includes EW, I am establishing an EMSO CFT, overseen by the SDO, to take bold \naction across the department to regain US dominance in the electromagnetic spectrum. \nPROBLEM STATEMENT. The Depru:tment of Defense must take action to address an \nerosion in EMSO capabilities relative to the pacing threats identified in the 2018 National \nDefense Strategy. Overcoming this problem will require comprehensive actions spanning \nEMSO Doctrine, Organization, Training, Materiel, Leadership, Personnel, Facilities, and \nPolicy (DOTMLPF-P). \nMISSION STATEMENT. The EMSO CFT will develop requirements and specific plans to \nevaluate, recommend, and implement improvements to EMSO capabilities across the \nDepartment necessary to achieve operational superiority within the Electromagnetic \nSpectrnm (EMS). \nCONCEPT OF OPERA TIO NS. This is a DoD-wide and multi-year effort involving multiple \nDoD organizational entities in both the core EMSO CFT membership and including reach­\nback to subject matter expertise and support from both DoD and other external \norganizations such as Director of National Intelligence, Department of Commerce, \nDepartment of State, and other organizations as appropriate. The EMSO CFT will have \nfive overlapping phases and six Lines of Effort (LO Es). The EMSO CFT will develop \nmetrics to evaluate progress in identifying and addressing EMSO gaps. \nPhase l • Establish the EMSO CFT. Contributing organizations will identify full­\ntime EMSO CFT members within 30 days of this memorandum, and those personnel \nshall be in place and co-located with the EMSO CFT workspaces NLT January 15, \n2019. The Chief Management Office (CMO) of the DoD will secure working spaces \nand equipment no later than January 2, 2019, and provide CFT training to all \nEMSO CFT personnel. \nPhase U -Shaping. During this phase, the EMSO Crr will conduct fact finding, \nincluding review of documentation, communications with subject matter experts in \nand out of the Department, and site visits necessary to gain an understanding of the \nrequirements and gaps in EMSO. The Military Departments (MilDeps),Combatant \nCommands (CCMDs), and Intelligence Community will provide information to fully \ndescribe the required EMSO capabilities to effectively operate in the current and \nfuture EMS operational environment. The EMSO CFT will help key DoD leaders \nconununicate their efforts to audiences within and outside the DoD. This phase runs \nconcurrent with all other phases. \nPhase III - Decisive Acti.on. In coordination with the Mi!Deps and CCMDs, the \nEMSO CFT will provide recommendations to the Senior Designated Official for \nmateriel and non-materiel solutions to address the EMSO gaps identified across the \nDOTMLPF-P spectrum. The recommendations will be documented in a roadmap \nwhich will identify tbe Office of Primary Responsibility (OPR), milestones and \nresource requirements for the actions. \nPhase IV - Exploitation. Through an iterative process, designed to identify and \n2 \ndisseminate best practices, the EMSO CFT will continually evaluate Mi1Dep and CCMD \nefforts. Additionally, the EMSO CFT will continue to leverage the EW Community of \nInterest and academia to identify technologies and methods to improve EMSO \ncapabilities. The EMSO CFT will assess progress in its roadmap through evaluation \nagain.st defined metrics. \nPhase V - Transition. The EMSO CFT will identify systemic problems and pursue \npolicies and mechanisms for enduring outcomes that continue in the Department throng� \nand beyond fiscal planning horizons. The EMSO CFT will stand down after the plans are \ntransitioned to the Mi!Deps and CCMDs; no earlier than Fiscal Year 2022. The SDO \nwill recommend to SECDEF when to disestablish the CFT and turnover \nresponsibilities and plans lo the appropriate organization(s). \nLINES OF EFFORT. The following are the initial Lines of Efforts (LOEs). The EMSO \nCFT will execute the LOEs concurrently. The EMSO CFTwill recommend to the SDO the \naddition, deletion, or consolidation of LOEs as warranted. \na. Joint Force Capability to Conduct Electromagnetic Spectrum Operations. The Joint \nForce must be able to train and conduct operations in an increasingly complex, \ncongested, and contested electromagnetic environment. This LOE will examine \nexisting organizational, capability, operational, and process shortfalls and provide \nplans to address gaps in EMSO, including establishment and manning of CCMD \norganizational constructs, frequency planning and deconfliction, and processes for \nobtaining requisite national and host nation approvals to test, train and operate in the \nspectrum. \nb. DoD Organization for EMSO. This LOE will recommend a path to efficiently and \neffectively organize the DoD to deliver superior EMSO capabilities to the warfighter. \nThis LOE ·will leverage ongoing studies examining options for optimizing the DoD \nEMSO organizational construct. \nc. EMSO Capabilities and Gaps. U.S. competitors have invested in EW as a way of \nneutralizing our advantage, affecting our command, control and communications, and \nattempting to weaken our ability to project decisive military power in contested \nenvironments. This LOE will examine the threat, inventory U.S. capability shortfalls, \nand recommend plans to address gaps, including timelines for delivering key EMSO \ncapabilities. This LOE will develop plans to field superior technology and will \nrecommend common materiel solutions across multiple progran1s that can be \naffordably modified to meet funire needs. \nd. DoD EW Strategy and Investment. This LOE will perform an analysis of personnel, \nresources, capabilities, authorities, and otbe.r mechanisms required to achieve the \nstrategic objectives of the Department and address EMSO capability gaps. This LOE \nwill identify roadblocks, recommend plans to address impediments, and identify \n3 \nrequired resources where funding shortfalls are known or discovered. \ne. EMSO Experimentation. Test, Training, Ranges. Key to delivering superior EMSO \ncapabilities to the warfighter is the ability to perform testing, experimentation and \ntraining in an operationally representative electromagnetic environment. This LOE \nwill examine current EMSO deve.lopIDent and operational test and training \ninfrastrncture, determine sufficiency, and develop resource recommendations for \nkno\\vn shortfalls. In addition, this LOE will develop plans to improve JEMSO \ntraining at all echelons of command and will recommend improvements to Service \ntraining across all mission areas. \nf. EMSO Modeling, Simulation. and Wargaming. This LOE will address needed EMSO \nmodeling and simulation capabilities, iJJcluding virtual training, high fidelity and \ncampaign focused simulation environments, and improvements in modeling and \nsimulation for electromagnetic threats. \nAUTHORITIES \na. Generate readiness for EMSO. The EMSO CFT can modify training objectives and \nmetrics for any joint training event to improve EMSO readiness. The EMSO CFT can \ndirectly recommend training objectives and metrics for Service training events to \nimprove EMSO readiness. \nb. Optimize the budget. The EMSO CFT can directly recommend top-line growth or \nzero-sum funding alignment to the Strategic Portfolio Review and Program and \nBudget Review Process. The SDO can submit, on behalf of the EMSO CFT, and \nafter review by the Office of the Under Secretary of Defense (Comptroller) and the \nChief Management Officer, both funded and unfunded priority lists to Congressional \ncommittees as part of the annual sufficiency of funds certification. \nc. Build a more lethal EMSO force. The EMSO CFT will establish processes and \nprocedures to develop, integrate and enhance the use ofEMSO capabilities in all \nmission areas and domains. The CFT shall propose changes in doctrine and policy \ndirectly to Sec Def. The CFT shall recommend architectures for cross-domain effects, \nthe development and fielding of capabilities across the joint force, and provide for the \ndevelopment of a professional force by proposing training, education, and career paths \nfor EMSO across military and civilian personnel. \nSENIOR.DESIGNATED OFFICIAL. The SDO, designated by the SecDef will have the \nfollowing responsibilities and duties: \na .  Serve as the leader of the EMSO CFT. \nb. Serve as a member the EW EX COM. \n4 \nc. Develop an integrated resource strategy for EMSO investment to the EW EXCOM. \nd. Oversee the DoD EW Strategy implementation. \ne .  Propose EMSO governance, management, organization, and operational reforms to \nthe SecDef, after review ru1d comment by the EW EXCOM. \nf. Provide status reports to Congress every 180 days for three years on EMSO CFT \nefforts, initiatives, progress, and results, pursuant to section 1053(d)(4) of the NDAA \nfor FY2019. \ng. Provide an assessment of the sufficiency of funds in each President\'s Future Years \nDefense Program from FY2020 through FY2024 for an Electromagnetic Battle \nManagement capability and for JEMSO cell establishment and operations. \nh. Recommend directly to SecDef any action required to address identified gaps. \nELECTROMAGNETIC SPECTRUM OPERATIONS CROSS FUNCTIONAL TEAM. The \nCFT will be comprised of core (full-time), level .ll, and level III personnel/organizations. \na. Membership of the EMSO CFT shall consist of full-time representatives from the \norganizations below. Members shou.ld be at the 0-5/6 or GS-14/l 5 level. The CFT \ndeputy shall be a I-Star/SES-I level, who will be selected by the SDO. The \norganizations shall nominate CFT members to the SDO for approval. The SDO shall \nhave the authority to modify core CFT organization and personnel membership as \nrequired. CFT members shall be assigned to the CFT for a minimum of 12 months. \nI. CFT Deputy (I-Star/SES-I) \n2. Army \n3. Navy \n4. Air Force \n5. Air Force (Space) \n6. Marine Corps \n7. Joint Staff \n8. OUSD(R&E) \n9. OUSD(A&S) \n10. OVSD(I) \n11. DoD CIO \n12. VSSTRA TCOM \n13. USCYBERCOM \nb. The CFT level II will be comprised of subject matter expert reachback personnel \nunder the authority of SecDef. The CFT shall have authority to task subject matter \nexperts in other DoD organizations on an as-needed basis. \nc. The CFT level III will be comprised of organizations not under the authority of \n5 \nSecDef who have an expertise deemed appropriate by the CFT. The CFT shall have \nliaison authority agreed to by the Level III organization not under DoD authority. \nRESOURCES Al�D SUPPORT \na .  The CMO of the DoD will administratively support the CFT, to include providing \nSensitive Compartmented Information Facility and Special Access Program Facility \noffice space and fT equipment, contracting, hwnan resources, security, CF\nT training, and \nother services, as appropriate. The CMO of the DoD will provide other assistance and \nsupport as requested by the SDO. \nb .  The EMSO CFT will work in concert with the CMO of the DoD in order to develop \nresource requirements for CFT operations. Initial FY2019 and FY2020 resource \nrequirements shall be coordinated as soon as possible with the CMO to ensure adequate \nresources are immediately available. \nc. The CFT shall work in concert with the CMO in order to develop financial mechanisms, \nincluding development and validation of source appropriation resource requirements to \nsupport the CFT activities and ensure inclusion of any requirements in future budget \njustification material, as required. \nd. The Director of Special Programs (DSP), under USD(A&S), shall ensure proper secu1ity \noversight is applied to all DoD Special Access Programs (SAPs) in support of the EMSO \nCFT. The DSP will establish and maintain a SAP portfolio to include all SAPs relating \nto weapons application of EMSO capabilities or relating to technologies that may be \nexploited for EMSO and synergistic cyberspace operations capabilities. The portfolio \nwill include permanent billets sufficient to support the EMSO CFT and temporary access \nnecessary for operation of specialized mission area working groups. \n6 \n',
				pages: [
					{
						type: 'page',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						p_page: 0,
						p_text: '.·� SECRETARY OF DEFENSE 1000 DEFENSE PENTAGON WASHINGTON DC 20301·1000 FEB O 2 2019 MEMORANDUM FOR ClUEF MA.iJAGEMENT OFFICER OF THE DEPARTMENT OF DEFENSE SECRETARIES OF THE MILITARY DEPARTMENTS CHAIRMAN OF THE JOINT CHJEFS OF STAFF UNDER SECRET ARIES OF DEFENSE COMMANDERS OF THE COMBATANT COMMANDS CHIEF OF THE NATIONAL GUARD BUREAU GENERAL COUNSEL OF THE DEPARTMENT OF DEFENSE DfRECTOR OF COST ASSESSMENT AND PROGRAM EVALUATION INSPECTOR GENERAL OF THE DEPARTMENT OF DEFENSE DIRECTOR OF OPERATIONAL TEST AND EVALUATION CHIEF INFORlvlA TION OFFICER OF THE DEPARTMENT OF DEFENSE ASSISTANT SECRETARY OF DEFENSE FOR LEGISLATIVE AFFAIRS ASSIST ANT TO THE SECRETARY OF DEFENSE FOR PUBLIC AFFAIRS DIRECTOR OF NET ASSESSMENT DIRECTORS OF THE DEFENSE AGENCIES DIRECTORS OF THE DOD FIELD ACTTVITIES SUBJECT Establishmeni of the Electromagnetic Spectrum Operations Cross Functional Team In accordance with sections 918 and I 053 of the National Defense Authorization Act NDAA for FY 2019 Public Law 115232 I am appointing the Vice Chairman of the Joint Chiefs of Staff as the Senior Designated Official SDO to oversee implementation of the Department of Defenses strategy ·for the conduct and execution of the electronic warfare EW mission area and joint electromagnetic spectrum operations EMSO. The SDO will be a member of the EW Executive Committee EXCOM and will propose EMSO governance management organization and operational reforms to me after review and comment by the EW EXCOM. The NOAA for FY 2019 tasks me to establish a Cross Functional Terun CFT on EW. To ensure we are addressing all tl1e requirements necessary to successfully conduct EMSO which includes EW I run establishing an EMSO CFT overseen by the SDO to take bold action across the department to regain U.S. dominance in the electromagnetic spectrum. As defined by the attached Terms of Reference ToR the CFT shall have insight into Service budgets and programs and shall recommend related Judget and readiness requirements to build a more lethal force. The CFT will identify EMSO gaps in capability capacity personnel training experimentation and resourcing and identify requirements and plans across doctrine organization training materiel leadership. personnel. facilities and policy to address these gaps. The CFT will provide recommendations to the SDO update the EW Strategy and develop a II rn�i liU 11 OS0000026t9CMCXJ00039· 19 ',
						p_raw_text: '.·� \nSECRETARY OF DEFENSE \n1000 DEFENSE PENTAGON \nWASHINGTON, DC 20301·1000 \nFEB O 2 2019 \nMEMORANDUM FOR Cl-UEF MA.i\'\\JAGEMENT OFFICER OF THE DEPARTMENT OF \nDEFENSE \nSECRETARIES OF THE MILITARY DEPARTMENTS \nCHAIRMAN OF THE JOINT CHJEFS OF STAFF \nUNDER SECRET ARIES OF DEFENSE \nCOMMANDERS OF THE COMBATANT COMMANDS \nCHIEF OF THE NATIONAL GUARD BUREAU \nGENERAL COUNSEL OF THE DEPARTMENT OF DEFENSE \nDfRECTOR OF COST ASSESSMENT AND PROGRAM \nEVALUATION \nINSPECTOR GENERAL OF THE DEPARTMENT OF DEFENSE \nDIRECTOR OF OPERATIONAL TEST AND EVALUATION \nCHIEF INFORl\'vlA TION OFFICER OF THE DEPARTMENT OF \nDEFENSE \nASSISTANT SECRETARY OF DEFENSE FOR LEGISLATIVE \nAFFAIRS \nASSIST ANT TO THE SECRETARY OF DEFENSE FOR PUBLIC \nAFFAIRS \nDIRECTOR OF NET ASSESSMENT \nDIRECTORS OF THE DEFENSE AGENCIES \nDIRECTORS OF THE DOD FIELD ACTTVITIES \nSUBJECT: Establishmeni of the Electromagnetic Spectrum Operations Cross Functional Team \nIn accordance with sections 918 and I 053 of the National Defense Authorization Act \n(NDAA) for FY 2019 (Public Law 115-232), I am appointing the Vice Chairman of the Joint \nChiefs of Staff as the Senior Designated Official (SDO) to oversee implementation of the \nDepartment of Defense\'s strategy ·\'for the conduct and execution of the electronic warfare (EW) \nmission area and joint electromagnetic spectrum operations (EMSO)." The SDO will be a \nmember of the EW Executive Committee (EXCOM) and will propose EMSO governance, \nmanagement, organization, and operational reforms to me, after review and comment by the EW \nEXCOM. \nThe NOAA for FY 2019 tasks me to establish a Cross Functional Terun (CFT) on EW. \nTo ensure we are addressing all tl1e requirements necessary to successfully conduct EMSO, \nwhich includes EW, I run establishing an EMSO CFT, overseen by the SDO, to take bold action \nacross the department to regain U.S. dominance in the electromagnetic spectrum. As defined by \nthe attached Terms of Reference (ToR), the CFT shall have insight into Service budgets and \nprograms, and shall recommend related J:>udget and readiness requirements to build a more lethal \nforce. The CFT will identify EMSO gaps in capability, capacity, personnel, training, \nexperimentation, and resourcing; and identify requirements and plans across doctrine, \norganization, training, materiel, leadership. personnel. facilities, and policy to address these gaps. \nThe CFT will provide recommendations to the SDO, update the EW Strategy, and develop a \nII rn�i liU 11 \nOS0000026-t9/CMCXJ00039· 19 \n'
					},
					{
						type: 'page',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_1',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						p_page: 1,
						p_text: 'roadmap that provides plans to address EMSO gaps. Additionally the SDO will assess the sufficiency of funds in each Presidents budget needed for the development ofan Electromagnetic Battle Management capability and Joint EMSO cell operations. The ToR for the CFT are attached. The SDO will report to me on CFT progress recommendations and needs by March I 2019 with routine updates thereafter. Attachment As stated blU..... ...... Patrick M. Shanahan Acting 2 ',
						p_raw_text: 'roadmap that provides plans to address EMSO gaps. Additionally, the SDO will assess the \nsufficiency of funds in each President\'s budget needed for the development ofan \nElectromagnetic Battle Management capability and Joint EMSO cell operations. \nThe ToR for the CFT are attached. The SDO will report to me on CFT progress, \nrecommendations, and needs by March I, 2019, with routine updates thereafter. \nAttachment: \nAs stated \nblU,.....__ _...... \nPatrick M. Shanahan \nActing \n2 \n'
					},
					{
						type: 'page',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_2',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						p_page: 2,
						p_text: 'ATIACHMENT I TERMS OF REFERENCE FOR THE ELECTROMAGNETIC SPECTRUM OPERA TIO NS CROSS FVNCTIONAL TEAM REFERENCES. a. John S. McCain National Defense Authorization Act for Fiscal Year 2019 Sections 918 and 1053 b. National Defense Authorization Act for Fiscal Year 2017 Section 911 c. Electronic Warfare EW Executive Committee EXCOM Charter PURPOSE. The Electromagnetic Spectrum Operations EMSO Cross Functional Team CFT is established to • Provide for effective and efficient collaboration and integration across organizational and functional boundaries in the Department of Defense DoD • Identify gaps in EMSO comprised of Electronic Warfare EW and Spectrum Management SM manpower technologies and processes for creating multidomain EMS advantage • Provide comprehensive and tiilly integrated policies strategies plans and requirements to address EMSO gaps to include all Directed Energy DE weapon investments and programs • Make decisions on crossfunctional issues to the extent authorii.ed by the Secretary and within parameters established by the Secretary • Provide oversight for and as directed by the Secretary supervise the implementation of approved policies strategies plans and resourcing decisions approved by the Secretary . BACKGROUND. The National Defense Authorization Act NDAA for Fiscal Year 2019 requires the Secretary of Defense SecDef to • Designate a senior official hereby referred to as the Senior Designated Official SDO who shall establish and oversee processes and procedures to develop integrate and enhance the electronic warfare EW mission area and the conduct of Joint Electromagnetic Spectrum Operations JEMSO in all domains across the DoD and ensure that such processes and procedures provide for integrated defensewide strategy planning and budgeting with respect to the conduct of such operations by the DoD including activities conducted to counter and deter such operations by malign actors. • Establish a CFT on EW which will be overseen by the SDO. The EI CFT will identify gaps in EW and JEMSO capabilities and capacities across personnel procedural and equipment areas and shall provide recommendations to the SDO to address gaps. In order to ensure we are addressing all the requirements necessary to successfully conduct EMSO which includes EW I am establishing an EMSO CFT overseen by the SDO to take bold action across the department to regain US dominance in the electromagnetic spectrum. ',
						p_raw_text: 'ATIACHMENT I \nTERMS OF REFERENCE FOR \nTHE ELECTROMAGNETIC SPECTRUM OPERA TIO NS CROSS FVNCTIONAL \nTEAM \nREFERENCES. \na. John S. McCain National Defense Authorization Act for Fiscal Year 2019 Sections \n918 and 1053 \nb. National Defense Authorization Act for Fiscal Year 2017 Section 911 \nc. Electronic Warfare (EW) Executive Committee (EXCOM) Charter \nPURPOSE. The Electromagnetic Spectrum Operations (EMSO) Cross Functional Team (CFT) \nis established to: \n• Provide for effective and efficient collaboration and integration across \norganizational and functional boundaries in the Department of Defense (DoD); \n• Identify gaps in EMSO (comprised of Electronic Warfare (EW) and Spectrum Management \n(SM)) manpower, technologies and processes for creating multi-domain EMS advantage; \n• Provide comprehensive and tiilly integrated policies, strategies, plans and requirements to \naddress EMSO gaps, to include all Directed Energy (DE) weapon investments and \nprograms; \n• Make decisions on cross-functional issues to the extent authorii.ed by the Secretary and \nwithin parameters established by the Secretary; \n• Provide oversight for, and as directed by the Secretary, supervise the implementation of \napproved policies, strategies, plans, and resourcing decisions approved by the Secretary .  \nBACKGROUND. The National Defense Authorization Act (NDAA) for Fiscal Year 2019 \nrequires the Secretary of Defense (SecDef) to: \n• Designate a senior official (hereby referred to as the Senior Designated Official (SDO)), who \nshall establish and oversee processes and procedures to develop, integrate, and enhance the \nelectronic warfare (EW) mission area and the conduct of Joint Electromagnetic Spectrum \nOperations (JEMSO) in all domains across the DoD; and ensure that such processes and \nprocedures provide for integrated defense-wide strategy, planning, and budgeting with \nrespect to the conduct of such operations by the DoD, including activities conducted to \ncounter and deter such operations by malign actors. \n• Establish a CFT on EW, which will be overseen by the SDO. The E,\'I CFT will \nidentify gaps in EW and JEMSO capabilities and capacities, across personnel, \nprocedural, and equipment areas, and shall provide recommendations to the SDO to \naddress gaps. \nIn order to ensure we are addressing all the requirements necessary to successfully conduct \nEMSO, which includes EW, I am establishing an EMSO CFT, overseen by the SDO, to take bold \naction across the department to regain US dominance in the electromagnetic spectrum. \n'
					},
					{
						type: 'page',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_3',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						p_page: 3,
						p_text: 'PROBLEM STATEMENT. The Deprutment of Defense must take action to address an erosion in EMSO capabilities relative to the pacing threats identified in the 2018 National Defense Strategy. Overcoming this problem will require comprehensive actions spanning EMSO Doctrine Organization Training Materiel Leadership Personnel Facilities and Policy DOTMLPFP. MISSION STATEMENT. The EMSO CFT will develop requirements and specific plans to evaluate recommend and implement improvements to EMSO capabilities across the Department necessary to achieve operational superiority within the Electromagnetic Spectrnm EMS. CONCEPT OF OPERA TIO NS. This is a DoDwide and multiyear effort involving multiple DoD organizational entities in both the core EMSO CFT membership and including reach­ back to subject matter expertise and support from both DoD and other external organizations such as Director of National Intelligence Department of Commerce Department of State and other organizations as appropriate. The EMSO CFT will have five overlapping phases and six Lines of Effort LO Es. The EMSO CFT will develop metrics to evaluate progress in identifying and addressing EMSO gaps. Phase l • Establish the EMSO CFT. Contributing organizations will identify full­ time EMSO CFT members within 30 days of this memorandum and those personnel shall be in place and colocated with the EMSO CFT workspaces NLT January 15 2019. The Chief Management Office CMO of the DoD will secure working spaces and equipment no later than January 2 2019 and provide CFT training to all EMSO CFT personnel. Phase U Shaping. During this phase the EMSO Crr will conduct fact finding including review of documentation communications with subject matter experts in and out of the Department and site visits necessary to gain an understanding of the requirements and gaps in EMSO. The Military Departments MilDepsCombatant Commands CCMDs and Intelligence Community will provide information to fully describe the required EMSO capabilities to effectively operate in the current and future EMS operational environment. The EMSO CFT will help key DoD leaders conununicate their efforts to audiences within and outside the DoD. This phase runs concurrent with all other phases. Phase III  Decisive Acti.on. In coordination with the MiDeps and CCMDs the EMSO CFT will provide recommendations to the Senior Designated Official for materiel and nonmateriel solutions to address the EMSO gaps identified across the DOTMLPFP spectrum. The recommendations will be documented in a roadmap which will identify tbe Office of Primary Responsibility OPR milestones and resource requirements for the actions. Phase IV  Exploitation. Through an iterative process designed to identify and 2 ',
						p_raw_text: 'PROBLEM STATEMENT. The Depru:tment of Defense must take action to address an \nerosion in EMSO capabilities relative to the pacing threats identified in the 2018 National \nDefense Strategy. Overcoming this problem will require comprehensive actions spanning \nEMSO Doctrine, Organization, Training, Materiel, Leadership, Personnel, Facilities, and \nPolicy (DOTMLPF-P). \nMISSION STATEMENT. The EMSO CFT will develop requirements and specific plans to \nevaluate, recommend, and implement improvements to EMSO capabilities across the \nDepartment necessary to achieve operational superiority within the Electromagnetic \nSpectrnm (EMS). \nCONCEPT OF OPERA TIO NS. This is a DoD-wide and multi-year effort involving multiple \nDoD organizational entities in both the core EMSO CFT membership and including reach­\nback to subject matter expertise and support from both DoD and other external \norganizations such as Director of National Intelligence, Department of Commerce, \nDepartment of State, and other organizations as appropriate. The EMSO CFT will have \nfive overlapping phases and six Lines of Effort (LO Es). The EMSO CFT will develop \nmetrics to evaluate progress in identifying and addressing EMSO gaps. \nPhase l • Establish the EMSO CFT. Contributing organizations will identify full­\ntime EMSO CFT members within 30 days of this memorandum, and those personnel \nshall be in place and co-located with the EMSO CFT workspaces NLT January 15, \n2019. The Chief Management Office (CMO) of the DoD will secure working spaces \nand equipment no later than January 2, 2019, and provide CFT training to all \nEMSO CFT personnel. \nPhase U -Shaping. During this phase, the EMSO Crr will conduct fact finding, \nincluding review of documentation, communications with subject matter experts in \nand out of the Department, and site visits necessary to gain an understanding of the \nrequirements and gaps in EMSO. The Military Departments (MilDeps),Combatant \nCommands (CCMDs), and Intelligence Community will provide information to fully \ndescribe the required EMSO capabilities to effectively operate in the current and \nfuture EMS operational environment. The EMSO CFT will help key DoD leaders \nconununicate their efforts to audiences within and outside the DoD. This phase runs \nconcurrent with all other phases. \nPhase III - Decisive Acti.on. In coordination with the Mi!Deps and CCMDs, the \nEMSO CFT will provide recommendations to the Senior Designated Official for \nmateriel and non-materiel solutions to address the EMSO gaps identified across the \nDOTMLPF-P spectrum. The recommendations will be documented in a roadmap \nwhich will identify tbe Office of Primary Responsibility (OPR), milestones and \nresource requirements for the actions. \nPhase IV - Exploitation. Through an iterative process, designed to identify and \n2 \n'
					},
					{
						type: 'page',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_4',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						p_page: 4,
						p_text: 'disseminate best practices the EMSO CFT will continually evaluate Mi1Dep and CCMD efforts. Additionally the EMSO CFT will continue to leverage the EW Community of Interest and academia to identify technologies and methods to improve EMSO capabilities. The EMSO CFT will assess progress in its roadmap through evaluation again.st defined metrics. Phase V  Transition. The EMSO CFT will identify systemic problems and pursue policies and mechanisms for enduring outcomes that continue in the Department throng� and beyond fiscal planning horizons. The EMSO CFT will stand down after the plans are transitioned to the MiDeps and CCMDs no earlier than Fiscal Year 2022. The SDO will recommend to SECDEF when to disestablish the CFT and turnover responsibilities and plans lo the appropriate organizations. LINES OF EFFORT. The following are the initial Lines of Efforts LOEs. The EMSO CFT will execute the LOEs concurrently. The EMSO CFTwill recommend to the SDO the addition deletion or consolidation of LOEs as warranted. a. Joint Force Capability to Conduct Electromagnetic Spectrum Operations. The Joint Force must be able to train and conduct operations in an increasingly complex congested and contested electromagnetic environment. This LOE will examine existing organizational capability operational and process shortfalls and provide plans to address gaps in EMSO including establishment and manning of CCMD organizational constructs frequency planning and deconfliction and processes for obtaining requisite national and host nation approvals to test train and operate in the spectrum. b. DoD Organization for EMSO. This LOE will recommend a path to efficiently and effectively organize the DoD to deliver superior EMSO capabilities to the warfighter. This LOE ·will leverage ongoing studies examining options for optimizing the DoD EMSO organizational construct. c. EMSO Capabilities and Gaps. U.S. competitors have invested in EW as a way of neutralizing our advantage affecting our command control and communications and attempting to weaken our ability to project decisive military power in contested environments. This LOE will examine the threat inventory U.S. capability shortfalls and recommend plans to address gaps including timelines for delivering key EMSO capabilities. This LOE will develop plans to field superior technology and will recommend common materiel solutions across multiple progran1s that can be affordably modified to meet funire needs. d. DoD EW Strategy and Investment. This LOE will perform an analysis of personnel resources capabilities authorities and otbe.r mechanisms required to achieve the strategic objectives of the Department and address EMSO capability gaps. This LOE will identify roadblocks recommend plans to address impediments and identify 3 ',
						p_raw_text: 'disseminate best practices, the EMSO CFT will continually evaluate Mi1Dep and CCMD \nefforts. Additionally, the EMSO CFT will continue to leverage the EW Community of \nInterest and academia to identify technologies and methods to improve EMSO \ncapabilities. The EMSO CFT will assess progress in its roadmap through evaluation \nagain.st defined metrics. \nPhase V - Transition. The EMSO CFT will identify systemic problems and pursue \npolicies and mechanisms for enduring outcomes that continue in the Department throng� \nand beyond fiscal planning horizons. The EMSO CFT will stand down after the plans are \ntransitioned to the Mi!Deps and CCMDs; no earlier than Fiscal Year 2022. The SDO \nwill recommend to SECDEF when to disestablish the CFT and turnover \nresponsibilities and plans lo the appropriate organization(s). \nLINES OF EFFORT. The following are the initial Lines of Efforts (LOEs). The EMSO \nCFT will execute the LOEs concurrently. The EMSO CFTwill recommend to the SDO the \naddition, deletion, or consolidation of LOEs as warranted. \na. Joint Force Capability to Conduct Electromagnetic Spectrum Operations. The Joint \nForce must be able to train and conduct operations in an increasingly complex, \ncongested, and contested electromagnetic environment. This LOE will examine \nexisting organizational, capability, operational, and process shortfalls and provide \nplans to address gaps in EMSO, including establishment and manning of CCMD \norganizational constructs, frequency planning and deconfliction, and processes for \nobtaining requisite national and host nation approvals to test, train and operate in the \nspectrum. \nb. DoD Organization for EMSO. This LOE will recommend a path to efficiently and \neffectively organize the DoD to deliver superior EMSO capabilities to the warfighter. \nThis LOE ·will leverage ongoing studies examining options for optimizing the DoD \nEMSO organizational construct. \nc. EMSO Capabilities and Gaps. U.S. competitors have invested in EW as a way of \nneutralizing our advantage, affecting our command, control and communications, and \nattempting to weaken our ability to project decisive military power in contested \nenvironments. This LOE will examine the threat, inventory U.S. capability shortfalls, \nand recommend plans to address gaps, including timelines for delivering key EMSO \ncapabilities. This LOE will develop plans to field superior technology and will \nrecommend common materiel solutions across multiple progran1s that can be \naffordably modified to meet funire needs. \nd. DoD EW Strategy and Investment. This LOE will perform an analysis of personnel, \nresources, capabilities, authorities, and otbe.r mechanisms required to achieve the \nstrategic objectives of the Department and address EMSO capability gaps. This LOE \nwill identify roadblocks, recommend plans to address impediments, and identify \n3 \n'
					},
					{
						type: 'page',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_5',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						p_page: 5,
						p_text: 'required resources where funding shortfalls are known or discovered. e. EMSO Experimentation. Test Training Ranges. Key to delivering superior EMSO capabilities to the warfighter is the ability to perform testing experimentation and training in an operationally representative electromagnetic environment. This LOE will examine current EMSO deve.lopIDent and operational test and training infrastrncture determine sufficiency and develop resource recommendations for knovn shortfalls. In addition this LOE will develop plans to improve JEMSO training at all echelons of command and will recommend improvements to Service training across all mission areas. f. EMSO Modeling Simulation. and Wargaming. This LOE will address needed EMSO modeling and simulation capabilities iJJcluding virtual training high fidelity and campaign focused simulation environments and improvements in modeling and simulation for electromagnetic threats. AUTHORITIES a. Generate readiness for EMSO. The EMSO CFT can modify training objectives and metrics for any joint training event to improve EMSO readiness. The EMSO CFT can directly recommend training objectives and metrics for Service training events to improve EMSO readiness. b. Optimize the budget. The EMSO CFT can directly recommend topline growth or zerosum funding alignment to the Strategic Portfolio Review and Program and Budget Review Process. The SDO can submit on behalf of the EMSO CFT and after review by the Office of the Under Secretary of Defense Comptroller and the Chief Management Officer both funded and unfunded priority lists to Congressional committees as part of the annual sufficiency of funds certification. c. Build a more lethal EMSO force. The EMSO CFT will establish processes and procedures to develop integrate and enhance the use ofEMSO capabilities in all mission areas and domains. The CFT shall propose changes in doctrine and policy directly to Sec Def. The CFT shall recommend architectures for crossdomain effects the development and fielding of capabilities across the joint force and provide for the development of a professional force by proposing training education and career paths for EMSO across military and civilian personnel. SENIOR.DESIGNATED OFFICIAL. The SDO designated by the SecDef will have the following responsibilities and duties a . Serve as the leader of the EMSO CFT. b. Serve as a member the EW EX COM. 4 ',
						p_raw_text: 'required resources where funding shortfalls are known or discovered. \ne. EMSO Experimentation. Test, Training, Ranges. Key to delivering superior EMSO \ncapabilities to the warfighter is the ability to perform testing, experimentation and \ntraining in an operationally representative electromagnetic environment. This LOE \nwill examine current EMSO deve.lopIDent and operational test and training \ninfrastrncture, determine sufficiency, and develop resource recommendations for \nkno\\vn shortfalls. In addition, this LOE will develop plans to improve JEMSO \ntraining at all echelons of command and will recommend improvements to Service \ntraining across all mission areas. \nf. EMSO Modeling, Simulation. and Wargaming. This LOE will address needed EMSO \nmodeling and simulation capabilities, iJJcluding virtual training, high fidelity and \ncampaign focused simulation environments, and improvements in modeling and \nsimulation for electromagnetic threats. \nAUTHORITIES \na. Generate readiness for EMSO. The EMSO CFT can modify training objectives and \nmetrics for any joint training event to improve EMSO readiness. The EMSO CFT can \ndirectly recommend training objectives and metrics for Service training events to \nimprove EMSO readiness. \nb. Optimize the budget. The EMSO CFT can directly recommend top-line growth or \nzero-sum funding alignment to the Strategic Portfolio Review and Program and \nBudget Review Process. The SDO can submit, on behalf of the EMSO CFT, and \nafter review by the Office of the Under Secretary of Defense (Comptroller) and the \nChief Management Officer, both funded and unfunded priority lists to Congressional \ncommittees as part of the annual sufficiency of funds certification. \nc. Build a more lethal EMSO force. The EMSO CFT will establish processes and \nprocedures to develop, integrate and enhance the use ofEMSO capabilities in all \nmission areas and domains. The CFT shall propose changes in doctrine and policy \ndirectly to Sec Def. The CFT shall recommend architectures for cross-domain effects, \nthe development and fielding of capabilities across the joint force, and provide for the \ndevelopment of a professional force by proposing training, education, and career paths \nfor EMSO across military and civilian personnel. \nSENIOR.DESIGNATED OFFICIAL. The SDO, designated by the SecDef will have the \nfollowing responsibilities and duties: \na .  Serve as the leader of the EMSO CFT. \nb. Serve as a member the EW EX COM. \n4 \n'
					},
					{
						type: 'page',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_6',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						p_page: 6,
						p_text: 'c. Develop an integrated resource strategy for EMSO investment to the EW EXCOM. d. Oversee the DoD EW Strategy implementation. e . Propose EMSO governance management organization and operational reforms to the SecDef after review ru1d comment by the EW EXCOM. f. Provide status reports to Congress every 180 days for three years on EMSO CFT efforts initiatives progress and results pursuant to section 1053d4 of the NDAA for FY2019. g. Provide an assessment of the sufficiency of funds in each Presidents Future Years Defense Program from FY2020 through FY2024 for an Electromagnetic Battle Management capability and for JEMSO cell establishment and operations. h. Recommend directly to SecDef any action required to address identified gaps. ELECTROMAGNETIC SPECTRUM OPERATIONS CROSS FUNCTIONAL TEAM. The CFT will be comprised of core fulltime level .ll and level III personnelorganizations. a. Membership of the EMSO CFT shall consist of fulltime representatives from the organizations below. Members shou.ld be at the 056 or GS14l 5 level. The CFT deputy shall be a IStarSESI level who will be selected by the SDO. The organizations shall nominate CFT members to the SDO for approval. The SDO shall have the authority to modify core CFT organization and personnel membership as required. CFT members shall be assigned to the CFT for a minimum of 12 months. I. CFT Deputy IStarSESI 2. Army 3. Navy 4. Air Force 5. Air Force Space 6. Marine Corps 7. Joint Staff 8. OUSDRE 9. OUSDAS 10. OVSDI 11. DoD CIO 12. VSSTRA TCOM 13. USCYBERCOM b. The CFT level II will be comprised of subject matter expert reachback personnel under the authority of SecDef. The CFT shall have authority to task subject matter experts in other DoD organizations on an asneeded basis. c. The CFT level III will be comprised of organizations not under the authority of 5 ',
						p_raw_text: 'c. Develop an integrated resource strategy for EMSO investment to the EW EXCOM. \nd. Oversee the DoD EW Strategy implementation. \ne .  Propose EMSO governance, management, organization, and operational reforms to \nthe SecDef, after review ru1d comment by the EW EXCOM. \nf. Provide status reports to Congress every 180 days for three years on EMSO CFT \nefforts, initiatives, progress, and results, pursuant to section 1053(d)(4) of the NDAA \nfor FY2019. \ng. Provide an assessment of the sufficiency of funds in each President\'s Future Years \nDefense Program from FY2020 through FY2024 for an Electromagnetic Battle \nManagement capability and for JEMSO cell establishment and operations. \nh. Recommend directly to SecDef any action required to address identified gaps. \nELECTROMAGNETIC SPECTRUM OPERATIONS CROSS FUNCTIONAL TEAM. The \nCFT will be comprised of core (full-time), level .ll, and level III personnel/organizations. \na. Membership of the EMSO CFT shall consist of full-time representatives from the \norganizations below. Members shou.ld be at the 0-5/6 or GS-14/l 5 level. The CFT \ndeputy shall be a I-Star/SES-I level, who will be selected by the SDO. The \norganizations shall nominate CFT members to the SDO for approval. The SDO shall \nhave the authority to modify core CFT organization and personnel membership as \nrequired. CFT members shall be assigned to the CFT for a minimum of 12 months. \nI. CFT Deputy (I-Star/SES-I) \n2. Army \n3. Navy \n4. Air Force \n5. Air Force (Space) \n6. Marine Corps \n7. Joint Staff \n8. OUSD(R&E) \n9. OUSD(A&S) \n10. OVSD(I) \n11. DoD CIO \n12. VSSTRA TCOM \n13. USCYBERCOM \nb. The CFT level II will be comprised of subject matter expert reachback personnel \nunder the authority of SecDef. The CFT shall have authority to task subject matter \nexperts in other DoD organizations on an as-needed basis. \nc. The CFT level III will be comprised of organizations not under the authority of \n5 \n'
					},
					{
						type: 'page',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_7',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						p_page: 7,
						p_text: 'SecDef who have an expertise deemed appropriate by the CFT. The CFT shall have liaison authority agreed to by the Level III organization not under DoD authority. RESOURCES Al�D SUPPORT a . The CMO of the DoD will administratively support the CFT to include providing Sensitive Compartmented Information Facility and Special Access Program Facility office space and fT equipment contracting hwnan resources security CF T training and other services as appropriate. The CMO of the DoD will provide other assistance and support as requested by the SDO. b . The EMSO CFT will work in concert with the CMO of the DoD in order to develop resource requirements for CFT operations. Initial FY2019 and FY2020 resource requirements shall be coordinated as soon as possible with the CMO to ensure adequate resources are immediately available. c. The CFT shall work in concert with the CMO in order to develop financial mechanisms including development and validation of source appropriation resource requirements to support the CFT activities and ensure inclusion of any requirements in future budget justification material as required. d. The Director of Special Programs DSP under USDAS shall ensure proper secu1ity oversight is applied to all DoD Special Access Programs SAPs in support of the EMSO CFT. The DSP will establish and maintain a SAP portfolio to include all SAPs relating to weapons application of EMSO capabilities or relating to technologies that may be exploited for EMSO and synergistic cyberspace operations capabilities. The portfolio will include permanent billets sufficient to support the EMSO CFT and temporary access necessary for operation of specialized mission area working groups. 6 ',
						p_raw_text: 'SecDef who have an expertise deemed appropriate by the CFT. The CFT shall have \nliaison authority agreed to by the Level III organization not under DoD authority. \nRESOURCES Al�D SUPPORT \na .  The CMO of the DoD will administratively support the CFT, to include providing \nSensitive Compartmented Information Facility and Special Access Program Facility \noffice space and fT equipment, contracting, hwnan resources, security, CF\nT training, and \nother services, as appropriate. The CMO of the DoD will provide other assistance and \nsupport as requested by the SDO. \nb .  The EMSO CFT will work in concert with the CMO of the DoD in order to develop \nresource requirements for CFT operations. Initial FY2019 and FY2020 resource \nrequirements shall be coordinated as soon as possible with the CMO to ensure adequate \nresources are immediately available. \nc. The CFT shall work in concert with the CMO in order to develop financial mechanisms, \nincluding development and validation of source appropriation resource requirements to \nsupport the CFT activities and ensure inclusion of any requirements in future budget \njustification material, as required. \nd. The Director of Special Programs (DSP), under USD(A&S), shall ensure proper secu1ity \noversight is applied to all DoD Special Access Programs (SAPs) in support of the EMSO \nCFT. The DSP will establish and maintain a SAP portfolio to include all SAPs relating \nto weapons application of EMSO capabilities or relating to technologies that may be \nexploited for EMSO and synergistic cyberspace operations capabilities. The portfolio \nwill include permanent billets sufficient to support the EMSO CFT and temporary access \nnecessary for operation of specialized mission area working groups. \n6 \n'
					}
				],
				paragraphs: [
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_0_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 0,
						par_raw_text_t: '.·� SECRETARY OF DEFENSE 1000 DEFENSE PENTAGON WASHINGTON , DC 20301·1000 FEB O 2 2019 MEMORANDUM FOR Cl UEF MA.i\'\\JAGEMENT OFFICER OF THE DEPARTMENT OF DEFENSE SECRETARIES OF THE MILITARY DEPARTMENTS CHAIRMAN OF THE JOINT CHJEFS OF STAFF UNDER SECRET ARIES OF DEFENSE COMMANDERS OF THE COMBATANT COMMANDS CHIEF OF THE NATIONAL GUARD BUREAU GENERAL COUNSEL OF THE DEPARTMENT OF DEFENSE Df RECTOR OF COST ASSESSMENT AND PROGRAM EVALUATION INSPECTOR GENERAL OF THE DEPARTMENT OF DEFENSE DIRECTOR OF OPERATIONAL TEST AND EVALUATION CHIEF INFORl \'vlA TION OFFICER OF THE DEPARTMENT OF DEFENSE ASSISTANT SECRETARY OF DEFENSE FOR LEGISLATIVE AFFAIRS ASSIST ANT TO THE SECRETARY OF DEFENSE FOR PUBLIC AFFAIRS DIRECTOR OF NET ASSESSMENT DIRECTORS OF THE DEFENSE AGENCIES DIRECTORS OF THE DOD FIELD ACTTVITIES SUBJECT : Establishmeni of the Electromagnetic Spectrum Operations Cross Functional Team In accordance with sections 918 and I 053 of the National Defense Authorization Act ( NDAA ) for FY 2019 ( Public Law 115-232 ) , I am appointing the Vice Chairman of the Joint Chiefs of Staff as the Senior Designated Official ( SDO ) to oversee implementation of the Department of Defense \'s strategy · \' for the conduct and execution of the electronic warfare ( EW ) mission area and joint electromagnetic spectrum operations ( EMSO ) . "The SDO will be a member of the EW Executive Committee ( EXCOM ) and will propose EMSO governance , management , organization , and operational reforms to me , after review and comment by the EW EXCOM .The NOAA for FY 2019 tasks me to establish a Cross Functional Terun ( CFT ) on EW .To ensure we are addressing all tl1e requirements necessary to successfully conduct EMSO , which includes EW , I run establishing an EMSO CFT , overseen by the SDO , to take bold action across the department to regain U.S . dominance in the electromagnetic spectrum .As defined by the attached Terms of Reference ( To R ) , the CFT shall have insight into Service budgets and programs , and shall recommend related J:>udget and readiness requirements to build a more lethal force .The CFT will identify EMSO gaps in capability , capacity , personnel , training , experimentation , and resourcing ; and identify requirements and plans across doctrine , organization , training , materiel , leadership . personnel . facilities , and policy to address these gaps .The CFT will provide recommendations to the SDO , update the EW Strategy , and develop a II rn�i li U 11 OS0000026 t9/CMCXJ00039 · 19 ',
						par_count_i: 0,
						par_inc_count: 0,
						par_text_t: '.·� SECRETARY OF DEFENSE 1000 DEFENSE PENTAGON WASHINGTON  DC 20301·1000 FEB O 2 2019 MEMORANDUM FOR Cl UEF MA.iJAGEMENT OFFICER OF THE DEPARTMENT OF DEFENSE SECRETARIES OF THE MILITARY DEPARTMENTS CHAIRMAN OF THE JOINT CHJEFS OF STAFF UNDER SECRET ARIES OF DEFENSE COMMANDERS OF THE COMBATANT COMMANDS CHIEF OF THE NATIONAL GUARD BUREAU GENERAL COUNSEL OF THE DEPARTMENT OF DEFENSE Df RECTOR OF COST ASSESSMENT AND PROGRAM EVALUATION INSPECTOR GENERAL OF THE DEPARTMENT OF DEFENSE DIRECTOR OF OPERATIONAL TEST AND EVALUATION CHIEF INFORl vlA TION OFFICER OF THE DEPARTMENT OF DEFENSE ASSISTANT SECRETARY OF DEFENSE FOR LEGISLATIVE AFFAIRS ASSIST ANT TO THE SECRETARY OF DEFENSE FOR PUBLIC AFFAIRS DIRECTOR OF NET ASSESSMENT DIRECTORS OF THE DEFENSE AGENCIES DIRECTORS OF THE DOD FIELD ACTTVITIES SUBJECT  Establishmeni of the Electromagnetic Spectrum Operations Cross Functional Team In accordance with sections 918 and I 053 of the National Defense Authorization Act  NDAA  for FY 2019  Public Law 115232   I am appointing the Vice Chairman of the Joint Chiefs of Staff as the Senior Designated Official  SDO  to oversee implementation of the Department of Defense s strategy ·  for the conduct and execution of the electronic warfare  EW  mission area and joint electromagnetic spectrum operations  EMSO  . The SDO will be a member of the EW Executive Committee  EXCOM  and will propose EMSO governance  management  organization  and operational reforms to me  after review and comment by the EW EXCOM .The NOAA for FY 2019 tasks me to establish a Cross Functional Terun  CFT  on EW .To ensure we are addressing all tl1e requirements necessary to successfully conduct EMSO  which includes EW  I run establishing an EMSO CFT  overseen by the SDO  to take bold action across the department to regain U.S . dominance in the electromagnetic spectrum .As defined by the attached Terms of Reference  To R   the CFT shall have insight into Service budgets and programs  and shall recommend related Judget and readiness requirements to build a more lethal force .The CFT will identify EMSO gaps in capability  capacity  personnel  training  experimentation  and resourcing  and identify requirements and plans across doctrine  organization  training  materiel  leadership . personnel . facilities  and policy to address these gaps .The CFT will provide recommendations to the SDO  update the EW Strategy  and develop a II rn�i li U 11 OS0000026 t9CMCXJ00039 · 19 ',
						entities: {
							ORG: [
								'NOAA',
								'PENTAGON',
								'EMSO',
								'EW',
								'the EW Executive Committee',
								'the Senior Designated Official',
								'EMSO CFT',
								'Cl UEF',
								'CFT',
								'NDAA',
								'DEFENSE 1000',
								'SDO',
								'the Joint Chiefs of Staff',
								'the Department of Defense \'s',
								'THE DEPARTMENT OF DEFENSE SECRETARIES',
								'THE NATIONAL GUARD BUREAU',
								'DEFENSE',
								'DOD',
								'FY',
								'EXCOM',
								'THE DEPARTMENT OF DEFENSE'
							],
							GPE: [
								'U.S',
								'WASHINGTON'
							],
							NORP: [],
							LAW: [],
							LOC: [],
							PERSON: []
						}
					},
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_1_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 1,
						par_raw_text_t: 'roadmap that provides plans to address EMSO gaps .Additionally , the SDO will assess the sufficiency of funds in each President \'s budget needed for the development ofan Electromagnetic Battle Management capability and Joint EMSO cell operations .The To R for the CFT are attached .The SDO will report to me on CFT progress , recommendations , and needs by March I , 2019 , with routine updates thereafter .Attachment : As stated bl U , . . . . . _ _ _...... Patrick M . Shanahan Acting 2 ',
						par_count_i: 0,
						par_inc_count: 1,
						par_text_t: 'roadmap that provides plans to address EMSO gaps .Additionally  the SDO will assess the sufficiency of funds in each President s budget needed for the development ofan Electromagnetic Battle Management capability and Joint EMSO cell operations .The To R for the CFT are attached .The SDO will report to me on CFT progress  recommendations  and needs by March I  2019  with routine updates thereafter .Attachment  As stated bl U  . . . . .   ...... Patrick M . Shanahan Acting 2 ',
						entities: {
							ORG: [
								'EMSO',
								'Shanahan',
								'SDO',
								'CFT'
							],
							GPE: [],
							NORP: [],
							LAW: [],
							LOC: [],
							PERSON: [
								'bl U',
								'Patrick M'
							]
						}
					},
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_2_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 2,
						par_raw_text_t: 'ATIACHMENT I TERMS OF REFERENCE FOR THE ELECTROMAGNETIC SPECTRUM OPERA TIO NS CROSS FVNCTIONAL TEAM REFERENCES . a .John S . Mc Cain National Defense Authorization Act for Fiscal Year 2019 Sections 918 and 1053 b .National Defense Authorization Act for Fiscal Year 2017 Section 911 c .Electronic Warfare ( EW ) Executive Committee ( EXCOM ) Charter PURPOSE .The Electromagnetic Spectrum Operations ( EMSO ) Cross Functional Team ( CFT ) is established to : • Provide for effective and efficient collaboration and integration across organizational and functional boundaries in the Department of Defense ( Do D ) ;• Identify gaps in EMSO ( comprised of Electronic Warfare ( EW ) and Spectrum Management ( SM ) ) manpower , technologies and processes for creating multi domain EMS advantage ;• Provide comprehensive and tiilly integrated policies , strategies , plans and requirements to address EMSO gaps , to include all Directed Energy ( DE ) weapon investments and programs ;• Make decisions on cross functional issues to the extent authorii.ed by the Secretary and within parameters established by the Secretary ;• Provide oversight for , and as directed by the Secretary , supervise the implementation of approved policies , strategies , plans , and resourcing decisions approved by the Secretary .BACKGROUND .The National Defense Authorization Act ( NDAA ) for Fiscal Year 2019 requires the Secretary of Defense ( Sec Def ) to : • Designate a senior official ( hereby referred to as the Senior Designated Official ( SDO ) ) , who shall establish and oversee processes and procedures to develop , integrate , and enhance the electronic warfare ( EW ) mission area and the conduct of Joint Electromagnetic Spectrum Operations ( JEMSO ) in all domains across the Do D ; and ensure that such processes and procedures provide for integrated defense wide strategy , planning , and budgeting with respect to the conduct of such operations by the Do D , including activities conducted to counter and deter such operations by malign actors .• Establish a CFT on EW , which will be overseen by the SDO .The E, \'I CFT will identify gaps in EW and JEMSO capabilities and capacities , across personnel , procedural , and equipment areas , and shall provide recommendations to the SDO to address gaps .In order to ensure we are addressing all the requirements necessary to successfully conduct EMSO , which includes EW , I am establishing an EMSO CFT , overseen by the SDO , to take bold action across the department to regain US dominance in the electromagnetic spectrum .',
						par_count_i: 0,
						par_inc_count: 2,
						par_text_t: 'ATIACHMENT I TERMS OF REFERENCE FOR THE ELECTROMAGNETIC SPECTRUM OPERA TIO NS CROSS FVNCTIONAL TEAM REFERENCES . a .John S . Mc Cain National Defense Authorization Act for Fiscal Year 2019 Sections 918 and 1053 b .National Defense Authorization Act for Fiscal Year 2017 Section 911 c .Electronic Warfare  EW  Executive Committee  EXCOM  Charter PURPOSE .The Electromagnetic Spectrum Operations  EMSO  Cross Functional Team  CFT  is established to  • Provide for effective and efficient collaboration and integration across organizational and functional boundaries in the Department of Defense  Do D  • Identify gaps in EMSO  comprised of Electronic Warfare  EW  and Spectrum Management  SM   manpower  technologies and processes for creating multi domain EMS advantage • Provide comprehensive and tiilly integrated policies  strategies  plans and requirements to address EMSO gaps  to include all Directed Energy  DE  weapon investments and programs • Make decisions on cross functional issues to the extent authorii.ed by the Secretary and within parameters established by the Secretary • Provide oversight for  and as directed by the Secretary  supervise the implementation of approved policies  strategies  plans  and resourcing decisions approved by the Secretary .BACKGROUND .The National Defense Authorization Act  NDAA  for Fiscal Year 2019 requires the Secretary of Defense  Sec Def  to  • Designate a senior official  hereby referred to as the Senior Designated Official  SDO    who shall establish and oversee processes and procedures to develop  integrate  and enhance the electronic warfare  EW  mission area and the conduct of Joint Electromagnetic Spectrum Operations  JEMSO  in all domains across the Do D  and ensure that such processes and procedures provide for integrated defense wide strategy  planning  and budgeting with respect to the conduct of such operations by the Do D  including activities conducted to counter and deter such operations by malign actors .• Establish a CFT on EW  which will be overseen by the SDO .The E I CFT will identify gaps in EW and JEMSO capabilities and capacities  across personnel  procedural  and equipment areas  and shall provide recommendations to the SDO to address gaps .In order to ensure we are addressing all the requirements necessary to successfully conduct EMSO  which includes EW  I am establishing an EMSO CFT  overseen by the SDO  to take bold action across the department to regain US dominance in the electromagnetic spectrum .',
						entities: {
							ORG: [
								'DE',
								'EMS',
								'Sec',
								'EMSO',
								'Spectrum Management',
								'EW',
								'EMSO CFT',
								'CFT',
								'NDAA',
								'Mc Cain National Defense Authorization Act',
								'SDO',
								'Joint Electromagnetic Spectrum Operations',
								'EMSO Cross Functional Team',
								'JEMSO',
								'the Department of Defense',
								'Directed Energy',
								'NS CROSS FVNCTIONAL',
								'EXCOM',
								'EW Executive Committee',
								'Defense'
							],
							GPE: [
								'US'
							],
							NORP: [],
							LAW: [],
							LOC: [],
							PERSON: []
						}
					},
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_3_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 3,
						par_raw_text_t: 'PROBLEM STATEMENT .The Depru:tment of Defense must take action to address an erosion in EMSO capabilities relative to the pacing threats identified in the 2018 National Defense Strategy .Overcoming this problem will require comprehensive actions spanning EMSO Doctrine , Organization , Training , Materiel , Leadership , Personnel , Facilities , and Policy ( DOTMLPF P ) .MISSION STATEMENT .The EMSO CFT will develop requirements and specific plans to evaluate , recommend , and implement improvements to EMSO capabilities across the Department necessary to achieve operational superiority within the Electromagnetic Spectrnm ( EMS ) .CONCEPT OF OPERA TIO NS .This is a Do D wide and multi year effort involving multiple Do D organizational entities in both the core EMSO CFT membership and including reachback to subject matter expertise and support from both Do D and other external organizations such as Director of National Intelligence , Department of Commerce , Department of State , and other organizations as appropriate .The EMSO CFT will have five overlapping phases and six Lines of Effort ( LO Es ) .The EMSO CFT will develop metrics to evaluate progress in identifying and addressing EMSO gaps .Phase l • Establish the EMSO CFT .Contributing organizations will identify fulltime EMSO CFT members within 30 days of this memorandum , and those personnel shall be in place and co located with the EMSO CFT workspaces NLT January 15 , 2019 .The Chief Management Office ( CMO ) of the Do D will secure working spaces and equipment no later than January 2 , 2019 , and provide CFT training to all EMSO CFT personnel .Phase U - Shaping .During this phase , the EMSO Crr will conduct fact finding , including review of documentation , communications with subject matter experts in and out of the Department , and site visits necessary to gain an understanding of the requirements and gaps in EMSO .The Military Departments ( Mil Deps ) ,Combatant Commands ( CCMDs ) , and Intelligence Community will provide information to fully describe the required EMSO capabilities to effectively operate in the current and future EMS operational environment .The EMSO CFT will help key Do D leaders conununicate their efforts to audiences within and outside the Do D .This phase runs concurrent with all other phases .Phase III - Decisive Acti.on .In coordination with the Mi !Deps and CCMDs , the EMSO CFT will provide recommendations to the Senior Designated Official for materiel and non materiel solutions to address the EMSO gaps identified across the DOTMLPF P spectrum .The recommendations will be documented in a roadmap which will identify tbe Office of Primary Responsibility ( OPR ) , milestones and resource requirements for the actions .Phase IV - Exploitation .Through an iterative process , designed to identify and 2 ',
						par_count_i: 0,
						par_inc_count: 3,
						par_text_t: 'PROBLEM STATEMENT .The Deprutment of Defense must take action to address an erosion in EMSO capabilities relative to the pacing threats identified in the 2018 National Defense Strategy .Overcoming this problem will require comprehensive actions spanning EMSO Doctrine  Organization  Training  Materiel  Leadership  Personnel  Facilities  and Policy  DOTMLPF P  .MISSION STATEMENT .The EMSO CFT will develop requirements and specific plans to evaluate  recommend  and implement improvements to EMSO capabilities across the Department necessary to achieve operational superiority within the Electromagnetic Spectrnm  EMS  .CONCEPT OF OPERA TIO NS .This is a Do D wide and multi year effort involving multiple Do D organizational entities in both the core EMSO CFT membership and including reachback to subject matter expertise and support from both Do D and other external organizations such as Director of National Intelligence  Department of Commerce  Department of State  and other organizations as appropriate .The EMSO CFT will have five overlapping phases and six Lines of Effort  LO Es  .The EMSO CFT will develop metrics to evaluate progress in identifying and addressing EMSO gaps .Phase l • Establish the EMSO CFT .Contributing organizations will identify fulltime EMSO CFT members within 30 days of this memorandum  and those personnel shall be in place and co located with the EMSO CFT workspaces NLT January 15  2019 .The Chief Management Office  CMO  of the Do D will secure working spaces and equipment no later than January 2  2019  and provide CFT training to all EMSO CFT personnel .Phase U  Shaping .During this phase  the EMSO Crr will conduct fact finding  including review of documentation  communications with subject matter experts in and out of the Department  and site visits necessary to gain an understanding of the requirements and gaps in EMSO .The Military Departments  Mil Deps  Combatant Commands  CCMDs   and Intelligence Community will provide information to fully describe the required EMSO capabilities to effectively operate in the current and future EMS operational environment .The EMSO CFT will help key Do D leaders conununicate their efforts to audiences within and outside the Do D .This phase runs concurrent with all other phases .Phase III  Decisive Acti.on .In coordination with the Mi Deps and CCMDs  the EMSO CFT will provide recommendations to the Senior Designated Official for materiel and non materiel solutions to address the EMSO gaps identified across the DOTMLPF P spectrum .The recommendations will be documented in a roadmap which will identify tbe Office of Primary Responsibility  OPR   milestones and resource requirements for the actions .Phase IV  Exploitation .Through an iterative process  designed to identify and 2 ',
						entities: {
							ORG: [
								'EMS',
								'EMSO',
								'the EMSO Crr',
								'the Senior Designated Official',
								'Facilities',
								'EMSO CFT',
								'U - Shaping .During',
								'Leadership , Personnel',
								'Chief Management Office',
								'tbe Office of Primary Responsibility',
								'NLT January 15 , 2019',
								'Department of State',
								'Intelligence Community',
								'the EMSO CFT',
								'Department',
								'CMO',
								'EMSO Doctrine , Organization',
								'Defense',
								'National Intelligence , Department of Commerce'
							],
							GPE: [],
							NORP: [],
							LAW: [],
							LOC: [],
							PERSON: [
								'Depru',
								'tment'
							]
						}
					},
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_4_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 4,
						par_raw_text_t: 'disseminate best practices , the EMSO CFT will continually evaluate Mi1Dep and CCMD efforts .Additionally , the EMSO CFT will continue to leverage the EW Community of Interest and academia to identify technologies and methods to improve EMSO capabilities .The EMSO CFT will assess progress in its roadmap through evaluation again.st defined metrics .Phase V - Transition .The EMSO CFT will identify systemic problems and pursue policies and mechanisms for enduring outcomes that continue in the Department throng � and beyond fiscal planning horizons .The EMSO CFT will stand down after the plans are transitioned to the Mi !Deps and CCMDs ; no earlier than Fiscal Year 2022 .The SDO will recommend to SECDEF when to disestablish the CFT and turnover responsibilities and plans lo the appropriate organization ( s ) .LINES OF EFFORT .The following are the initial Lines of Efforts ( LOEs ) .The EMSO CFT will execute the LOEs concurrently .The EMSO CFTwill recommend to the SDO the addition , deletion , or consolidation of LOEs as warranted . a .Joint Force Capability to Conduct Electromagnetic Spectrum Operations .The Joint Force must be able to train and conduct operations in an increasingly complex , congested , and contested electromagnetic environment .This LOE will examine existing organizational , capability , operational , and process shortfalls and provide plans to address gaps in EMSO , including establishment and manning of CCMD organizational constructs , frequency planning and deconfliction , and processes for obtaining requisite national and host nation approvals to test , train and operate in the spectrum . b .Do D Organization for EMSO .This LOE will recommend a path to efficiently and effectively organize the Do D to deliver superior EMSO capabilities to the warfighter .This LOE · will leverage ongoing studies examining options for optimizing the Do D EMSO organizational construct . c .EMSO Capabilities and Gaps .U.S . competitors have invested in EW as a way of neutralizing our advantage , affecting our command , control and communications , and attempting to weaken our ability to project decisive military power in contested environments .This LOE will examine the threat , inventory U.S . capability shortfalls , and recommend plans to address gaps , including timelines for delivering key EMSO capabilities .This LOE will develop plans to field superior technology and will recommend common materiel solutions across multiple progran1s that can be affordably modified to meet funire needs . d .Do D EW Strategy and Investment .This LOE will perform an analysis of personnel , resources , capabilities , authorities , and otbe.r mechanisms required to achieve the strategic objectives of the Department and address EMSO capability gaps .This LOE will identify roadblocks , recommend plans to address impediments , and identify 3 ',
						par_count_i: 0,
						par_inc_count: 4,
						par_text_t: 'disseminate best practices  the EMSO CFT will continually evaluate Mi1Dep and CCMD efforts .Additionally  the EMSO CFT will continue to leverage the EW Community of Interest and academia to identify technologies and methods to improve EMSO capabilities .The EMSO CFT will assess progress in its roadmap through evaluation again.st defined metrics .Phase V  Transition .The EMSO CFT will identify systemic problems and pursue policies and mechanisms for enduring outcomes that continue in the Department throng � and beyond fiscal planning horizons .The EMSO CFT will stand down after the plans are transitioned to the Mi Deps and CCMDs  no earlier than Fiscal Year 2022 .The SDO will recommend to SECDEF when to disestablish the CFT and turnover responsibilities and plans lo the appropriate organization  s  .LINES OF EFFORT .The following are the initial Lines of Efforts  LOEs  .The EMSO CFT will execute the LOEs concurrently .The EMSO CFTwill recommend to the SDO the addition  deletion  or consolidation of LOEs as warranted . a .Joint Force Capability to Conduct Electromagnetic Spectrum Operations .The Joint Force must be able to train and conduct operations in an increasingly complex  congested  and contested electromagnetic environment .This LOE will examine existing organizational  capability  operational  and process shortfalls and provide plans to address gaps in EMSO  including establishment and manning of CCMD organizational constructs  frequency planning and deconfliction  and processes for obtaining requisite national and host nation approvals to test  train and operate in the spectrum . b .Do D Organization for EMSO .This LOE will recommend a path to efficiently and effectively organize the Do D to deliver superior EMSO capabilities to the warfighter .This LOE · will leverage ongoing studies examining options for optimizing the Do D EMSO organizational construct . c .EMSO Capabilities and Gaps .U.S . competitors have invested in EW as a way of neutralizing our advantage  affecting our command  control and communications  and attempting to weaken our ability to project decisive military power in contested environments .This LOE will examine the threat  inventory U.S . capability shortfalls  and recommend plans to address gaps  including timelines for delivering key EMSO capabilities .This LOE will develop plans to field superior technology and will recommend common materiel solutions across multiple progran1s that can be affordably modified to meet funire needs . d .Do D EW Strategy and Investment .This LOE will perform an analysis of personnel  resources  capabilities  authorities  and otbe.r mechanisms required to achieve the strategic objectives of the Department and address EMSO capability gaps .This LOE will identify roadblocks  recommend plans to address impediments  and identify 3 ',
						entities: {
							ORG: [
								'the EMSO CFT',
								'EMSO',
								'Department',
								'EW',
								'CCMD',
								'CFT',
								'SDO',
								'EMSO CFT',
								'Mi1Dep',
								'Lines of Efforts',
								'the EW Community of Interest',
								'SECDEF'
							],
							GPE: [
								'U.S'
							],
							NORP: [],
							LAW: [],
							LOC: [],
							PERSON: []
						}
					},
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_5_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 5,
						par_raw_text_t: 'required resources where funding shortfalls are known or discovered . e .EMSO Experimentation .Test , Training , Ranges .Key to delivering superior EMSO capabilities to the warfighter is the ability to perform testing , experimentation and training in an operationally representative electromagnetic environment .This LOE will examine current EMSO deve.lop IDent and operational test and training infrastrncture , determine sufficiency , and develop resource recommendations for kno\\vn shortfalls .In addition , this LOE will develop plans to improve JEMSO training at all echelons of command and will recommend improvements to Service training across all mission areas . f .EMSO Modeling , Simulation . and Wargaming .This LOE will address needed EMSO modeling and simulation capabilities , i JJcluding virtual training , high fidelity and campaign focused simulation environments , and improvements in modeling and simulation for electromagnetic threats .AUTHORITIES a .Generate readiness for EMSO .The EMSO CFT can modify training objectives and metrics for any joint training event to improve EMSO readiness .The EMSO CFT can directly recommend training objectives and metrics for Service training events to improve EMSO readiness . b .Optimize the budget .The EMSO CFT can directly recommend top line growth or zero sum funding alignment to the Strategic Portfolio Review and Program and Budget Review Process .The SDO can submit , on behalf of the EMSO CFT , and after review by the Office of the Under Secretary of Defense ( Comptroller ) and the Chief Management Officer , both funded and unfunded priority lists to Congressional committees as part of the annual sufficiency of funds certification . c .Build a more lethal EMSO force .The EMSO CFT will establish processes and procedures to develop , integrate and enhance the use of EMSO capabilities in all mission areas and domains .The CFT shall propose changes in doctrine and policy directly to Sec Def .The CFT shall recommend architectures for cross domain effects , the development and fielding of capabilities across the joint force , and provide for the development of a professional force by proposing training , education , and career paths for EMSO across military and civilian personnel .SENIOR.DESIGNATED OFFICIAL .The SDO , designated by the Sec Def will have the following responsibilities and duties : a .Serve as the leader of the EMSO CFT . b .Serve as a member the EW EX COM .4 ',
						par_count_i: 0,
						par_inc_count: 5,
						par_text_t: 'required resources where funding shortfalls are known or discovered . e .EMSO Experimentation .Test  Training  Ranges .Key to delivering superior EMSO capabilities to the warfighter is the ability to perform testing  experimentation and training in an operationally representative electromagnetic environment .This LOE will examine current EMSO deve.lop IDent and operational test and training infrastrncture  determine sufficiency  and develop resource recommendations for knovn shortfalls .In addition  this LOE will develop plans to improve JEMSO training at all echelons of command and will recommend improvements to Service training across all mission areas . f .EMSO Modeling  Simulation . and Wargaming .This LOE will address needed EMSO modeling and simulation capabilities  i JJcluding virtual training  high fidelity and campaign focused simulation environments  and improvements in modeling and simulation for electromagnetic threats .AUTHORITIES a .Generate readiness for EMSO .The EMSO CFT can modify training objectives and metrics for any joint training event to improve EMSO readiness .The EMSO CFT can directly recommend training objectives and metrics for Service training events to improve EMSO readiness . b .Optimize the budget .The EMSO CFT can directly recommend top line growth or zero sum funding alignment to the Strategic Portfolio Review and Program and Budget Review Process .The SDO can submit  on behalf of the EMSO CFT  and after review by the Office of the Under Secretary of Defense  Comptroller  and the Chief Management Officer  both funded and unfunded priority lists to Congressional committees as part of the annual sufficiency of funds certification . c .Build a more lethal EMSO force .The EMSO CFT will establish processes and procedures to develop  integrate and enhance the use of EMSO capabilities in all mission areas and domains .The CFT shall propose changes in doctrine and policy directly to Sec Def .The CFT shall recommend architectures for cross domain effects  the development and fielding of capabilities across the joint force  and provide for the development of a professional force by proposing training  education  and career paths for EMSO across military and civilian personnel .SENIOR.DESIGNATED OFFICIAL .The SDO  designated by the Sec Def will have the following responsibilities and duties  a .Serve as the leader of the EMSO CFT . b .Serve as a member the EW EX COM .4 ',
						entities: {
							ORG: [
								'Sec',
								'EMSO',
								'the EMSO CFT',
								'Congressional',
								'SDO',
								'the Strategic Portfolio Review',
								'the EW EX',
								'EMSO CFT',
								'LOE',
								'the Chief Management Officer',
								'the Office of the Under Secretary of Defense ( Comptroller'
							],
							GPE: [],
							NORP: [],
							LAW: [],
							LOC: [],
							PERSON: []
						}
					},
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_6_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 6,
						par_raw_text_t: 'c . Develop an integrated resource strategy for EMSO investment to the EW EXCOM . d .Oversee the Do D EW Strategy implementation . e .Propose EMSO governance , management , organization , and operational reforms to the Sec Def , after review ru1d comment by the EW EXCOM . f .Provide status reports to Congress every 180 days for three years on EMSO CFT efforts , initiatives , progress , and results , pursuant to section 1053 ( d ) ( 4 ) of the NDAA for FY2019 . g .Provide an assessment of the sufficiency of funds in each President \'s Future Years Defense Program from FY2020 through FY2024 for an Electromagnetic Battle Management capability and for JEMSO cell establishment and operations . h .Recommend directly to Sec Def any action required to address identified gaps .ELECTROMAGNETIC SPECTRUM OPERATIONS CROSS FUNCTIONAL TEAM .The CFT will be comprised of core ( full time ) , level . ll , and level III personnel/organizations . a .Membership of the EMSO CFT shall consist of full time representatives from the organizations below .Members shou.ld be at the 0-5/6 or GS 14/l 5 level .The CFT deputy shall be a I Star/SES I level , who will be selected by the SDO .The organizations shall nominate CFT members to the SDO for approval .The SDO shall have the authority to modify core CFT organization and personnel membership as required .CFT members shall be assigned to the CFT for a minimum of 12 months .I . CFT Deputy ( I Star/SES I ) 2 .Army 3 .Navy 4 .Air Force 5 .Air Force ( Space ) 6 .Marine Corps 7 .Joint Staff 8 .OUSD ( R&E )9 . OUSD ( A&S )10 .OVSD ( I )11 .Do D CIO 12 .VSSTRA TCOM 13 .USCYBERCOM b .The CFT level II will be comprised of subject matter expert reachback personnel under the authority of Sec Def .The CFT shall have authority to task subject matter experts in other Do D organizations on an as needed basis . c .The CFT level III will be comprised of organizations not under the authority of 5 ',
						par_count_i: 0,
						par_inc_count: 6,
						par_text_t: 'c . Develop an integrated resource strategy for EMSO investment to the EW EXCOM . d .Oversee the Do D EW Strategy implementation . e .Propose EMSO governance  management  organization  and operational reforms to the Sec Def  after review ru1d comment by the EW EXCOM . f .Provide status reports to Congress every 180 days for three years on EMSO CFT efforts  initiatives  progress  and results  pursuant to section 1053  d   4  of the NDAA for FY2019 . g .Provide an assessment of the sufficiency of funds in each President s Future Years Defense Program from FY2020 through FY2024 for an Electromagnetic Battle Management capability and for JEMSO cell establishment and operations . h .Recommend directly to Sec Def any action required to address identified gaps .ELECTROMAGNETIC SPECTRUM OPERATIONS CROSS FUNCTIONAL TEAM .The CFT will be comprised of core  full time   level . ll  and level III personnelorganizations . a .Membership of the EMSO CFT shall consist of full time representatives from the organizations below .Members shou.ld be at the 056 or GS 14l 5 level .The CFT deputy shall be a I StarSES I level  who will be selected by the SDO .The organizations shall nominate CFT members to the SDO for approval .The SDO shall have the authority to modify core CFT organization and personnel membership as required .CFT members shall be assigned to the CFT for a minimum of 12 months .I . CFT Deputy  I StarSES I  2 .Army 3 .Navy 4 .Air Force 5 .Air Force  Space  6 .Marine Corps 7 .Joint Staff 8 .OUSD  RE 9 . OUSD  AS 10 .OVSD  I 11 .Do D CIO 12 .VSSTRA TCOM 13 .USCYBERCOM b .The CFT level II will be comprised of subject matter expert reachback personnel under the authority of Sec Def .The CFT shall have authority to task subject matter experts in other Do D organizations on an as needed basis . c .The CFT level III will be comprised of organizations not under the authority of 5 ',
						entities: {
							ORG: [
								'NDAA',
								'Force (',
								'OUSD',
								'Sec',
								'JEMSO',
								'Congress',
								'EMSO',
								'EW EXCOM',
								'FY2020',
								'SDO',
								'EMSO CFT',
								'Future Years Defense Program',
								'CFT'
							],
							GPE: [],
							NORP: [],
							LAW: [
								'section 1053'
							],
							LOC: [],
							PERSON: [
								'TCOM'
							]
						}
					},
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_7_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 7,
						par_raw_text_t: 'Sec Def who have an expertise deemed appropriate by the CFT .The CFT shall have liaison authority agreed to by the Level III organization not under Do D authority .RESOURCES Al�D SUPPORT a .The CMO of the Do D will administratively support the CFT , to include providing Sensitive Compartmented Information Facility and Special Access Program Facility office space and f T equipment , contracting , hwnan resources , security , CF T training , and other services , as appropriate .The CMO of the Do D will provide other assistance and support as requested by the SDO . b .The EMSO CFT will work in concert with the CMO of the Do D in order to develop resource requirements for CFT operations .Initial FY2019 and FY2020 resource requirements shall be coordinated as soon as possible with the CMO to ensure adequate resources are immediately available . c .The CFT shall work in concert with the CMO in order to develop financial mechanisms , including development and validation of source appropriation resource requirements to support the CFT activities and ensure inclusion of any requirements in future budget justification material , as required . d .The Director of Special Programs ( DSP ) , under USD ( A&S ) , shall ensure proper secu1ity oversight is applied to all Do D Special Access Programs ( SAPs ) in support of the EMSO CFT .The DSP will establish and maintain a SAP portfolio to include all SAPs relating to weapons application of EMSO capabilities or relating to technologies that may be exploited for EMSO and synergistic cyberspace operations capabilities .The portfolio will include permanent billets sufficient to support the EMSO CFT and temporary access necessary for operation of specialized mission area working groups .6 ',
						par_count_i: 0,
						par_inc_count: 7,
						par_text_t: 'Sec Def who have an expertise deemed appropriate by the CFT .The CFT shall have liaison authority agreed to by the Level III organization not under Do D authority .RESOURCES Al�D SUPPORT a .The CMO of the Do D will administratively support the CFT  to include providing Sensitive Compartmented Information Facility and Special Access Program Facility office space and f T equipment  contracting  hwnan resources  security  CF T training  and other services  as appropriate .The CMO of the Do D will provide other assistance and support as requested by the SDO . b .The EMSO CFT will work in concert with the CMO of the Do D in order to develop resource requirements for CFT operations .Initial FY2019 and FY2020 resource requirements shall be coordinated as soon as possible with the CMO to ensure adequate resources are immediately available . c .The CFT shall work in concert with the CMO in order to develop financial mechanisms  including development and validation of source appropriation resource requirements to support the CFT activities and ensure inclusion of any requirements in future budget justification material  as required . d .The Director of Special Programs  DSP   under USD  AS   shall ensure proper secu1ity oversight is applied to all Do D Special Access Programs  SAPs  in support of the EMSO CFT .The DSP will establish and maintain a SAP portfolio to include all SAPs relating to weapons application of EMSO capabilities or relating to technologies that may be exploited for EMSO and synergistic cyberspace operations capabilities .The portfolio will include permanent billets sufficient to support the EMSO CFT and temporary access necessary for operation of specialized mission area working groups .6 ',
						entities: {
							ORG: [
								'liaison authority',
								'Sensitive Compartmented Information Facility and Special Access Program Facility',
								'Special Programs',
								'Sec',
								'the EMSO CFT',
								'SAP',
								'EMSO',
								'USD',
								'SDO',
								'CMO',
								'EMSO CFT',
								'DSP',
								'CFT'
							],
							GPE: [],
							NORP: [],
							LAW: [],
							LOC: [],
							PERSON: []
						}
					}
				]
			};
			const fakeResult = {
				doc_id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_0',
				doc_num: 'Memo',
				doc_type: 'SEC',
				type: 'document',
				paragraphs: [
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_0_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 0,
						par_raw_text_t: '.·� SECRETARY OF DEFENSE 1000 DEFENSE PENTAGON WASHINGTON , DC 20301·1000 FEB O 2 2019 MEMORANDUM FOR Cl UEF MA.i\'\\JAGEMENT OFFICER OF THE DEPARTMENT OF DEFENSE SECRETARIES OF THE MILITARY DEPARTMENTS CHAIRMAN OF THE JOINT CHJEFS OF STAFF UNDER SECRET ARIES OF DEFENSE COMMANDERS OF THE COMBATANT COMMANDS CHIEF OF THE NATIONAL GUARD BUREAU GENERAL COUNSEL OF THE DEPARTMENT OF DEFENSE Df RECTOR OF COST ASSESSMENT AND PROGRAM EVALUATION INSPECTOR GENERAL OF THE DEPARTMENT OF DEFENSE DIRECTOR OF OPERATIONAL TEST AND EVALUATION CHIEF INFORl \'vlA TION OFFICER OF THE DEPARTMENT OF DEFENSE ASSISTANT SECRETARY OF DEFENSE FOR LEGISLATIVE AFFAIRS ASSIST ANT TO THE SECRETARY OF DEFENSE FOR PUBLIC AFFAIRS DIRECTOR OF NET ASSESSMENT DIRECTORS OF THE DEFENSE AGENCIES DIRECTORS OF THE DOD FIELD ACTTVITIES SUBJECT : Establishmeni of the Electromagnetic Spectrum Operations Cross Functional Team In accordance with sections 918 and I 053 of the National Defense Authorization Act ( NDAA ) for FY 2019 ( Public Law 115-232 ) , I am appointing the Vice Chairman of the Joint Chiefs of Staff as the Senior Designated Official ( SDO ) to oversee implementation of the Department of Defense \'s strategy · \' for the conduct and execution of the electronic warfare ( EW ) mission area and joint electromagnetic spectrum operations ( EMSO ) . "The SDO will be a member of the EW Executive Committee ( EXCOM ) and will propose EMSO governance , management , organization , and operational reforms to me , after review and comment by the EW EXCOM .The NOAA for FY 2019 tasks me to establish a Cross Functional Terun ( CFT ) on EW .To ensure we are addressing all tl1e requirements necessary to successfully conduct EMSO , which includes EW , I run establishing an EMSO CFT , overseen by the SDO , to take bold action across the department to regain U.S . dominance in the electromagnetic spectrum .As defined by the attached Terms of Reference ( To R ) , the CFT shall have insight into Service budgets and programs , and shall recommend related J:>udget and readiness requirements to build a more lethal force .The CFT will identify EMSO gaps in capability , capacity , personnel , training , experimentation , and resourcing ; and identify requirements and plans across doctrine , organization , training , materiel , leadership . personnel . facilities , and policy to address these gaps .The CFT will provide recommendations to the SDO , update the EW Strategy , and develop a II rn�i li U 11 OS0000026 t9/CMCXJ00039 · 19 ',
						par_count_i: 0,
						par_inc_count: 0,
						par_text_t: '.·� SECRETARY OF DEFENSE 1000 DEFENSE PENTAGON WASHINGTON  DC 20301·1000 FEB O 2 2019 MEMORANDUM FOR Cl UEF MA.iJAGEMENT OFFICER OF THE DEPARTMENT OF DEFENSE SECRETARIES OF THE MILITARY DEPARTMENTS CHAIRMAN OF THE JOINT CHJEFS OF STAFF UNDER SECRET ARIES OF DEFENSE COMMANDERS OF THE COMBATANT COMMANDS CHIEF OF THE NATIONAL GUARD BUREAU GENERAL COUNSEL OF THE DEPARTMENT OF DEFENSE Df RECTOR OF COST ASSESSMENT AND PROGRAM EVALUATION INSPECTOR GENERAL OF THE DEPARTMENT OF DEFENSE DIRECTOR OF OPERATIONAL TEST AND EVALUATION CHIEF INFORl vlA TION OFFICER OF THE DEPARTMENT OF DEFENSE ASSISTANT SECRETARY OF DEFENSE FOR LEGISLATIVE AFFAIRS ASSIST ANT TO THE SECRETARY OF DEFENSE FOR PUBLIC AFFAIRS DIRECTOR OF NET ASSESSMENT DIRECTORS OF THE DEFENSE AGENCIES DIRECTORS OF THE DOD FIELD ACTTVITIES SUBJECT  Establishmeni of the Electromagnetic Spectrum Operations Cross Functional Team In accordance with sections 918 and I 053 of the National Defense Authorization Act  NDAA  for FY 2019  Public Law 115232   I am appointing the Vice Chairman of the Joint Chiefs of Staff as the Senior Designated Official  SDO  to oversee implementation of the Department of Defense s strategy ·  for the conduct and execution of the electronic warfare  EW  mission area and joint electromagnetic spectrum operations  EMSO  . The SDO will be a member of the EW Executive Committee  EXCOM  and will propose EMSO governance  management  organization  and operational reforms to me  after review and comment by the EW EXCOM .The NOAA for FY 2019 tasks me to establish a Cross Functional Terun  CFT  on EW .To ensure we are addressing all tl1e requirements necessary to successfully conduct EMSO  which includes EW  I run establishing an EMSO CFT  overseen by the SDO  to take bold action across the department to regain U.S . dominance in the electromagnetic spectrum .As defined by the attached Terms of Reference  To R   the CFT shall have insight into Service budgets and programs  and shall recommend related Judget and readiness requirements to build a more lethal force .The CFT will identify EMSO gaps in capability  capacity  personnel  training  experimentation  and resourcing  and identify requirements and plans across doctrine  organization  training  materiel  leadership . personnel . facilities  and policy to address these gaps .The CFT will provide recommendations to the SDO  update the EW Strategy  and develop a II rn�i li U 11 OS0000026 t9CMCXJ00039 · 19 ',
						entities: {
							ORG: [
								'NOAA',
								'PENTAGON',
								'EMSO',
								'EW',
								'the EW Executive Committee',
								'the Senior Designated Official',
								'EMSO CFT',
								'Cl UEF',
								'CFT',
								'NDAA',
								'DEFENSE 1000',
								'SDO',
								'the Joint Chiefs of Staff',
								'the Department of Defense \'s',
								'THE DEPARTMENT OF DEFENSE SECRETARIES',
								'THE NATIONAL GUARD BUREAU',
								'DEFENSE',
								'DOD',
								'FY',
								'EXCOM',
								'THE DEPARTMENT OF DEFENSE'
							],
							GPE: [
								'U.S',
								'WASHINGTON'
							],
							NORP: [],
							LAW: [],
							LOC: [],
							PERSON: []
						}
					},
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_1_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 1,
						par_raw_text_t: 'roadmap that provides plans to address EMSO gaps .Additionally , the SDO will assess the sufficiency of funds in each President \'s budget needed for the development ofan Electromagnetic Battle Management capability and Joint EMSO cell operations .The To R for the CFT are attached .The SDO will report to me on CFT progress , recommendations , and needs by March I , 2019 , with routine updates thereafter .Attachment : As stated bl U , . . . . . _ _ _...... Patrick M . Shanahan Acting 2 ',
						par_count_i: 0,
						par_inc_count: 1,
						par_text_t: 'roadmap that provides plans to address EMSO gaps .Additionally  the SDO will assess the sufficiency of funds in each President s budget needed for the development ofan Electromagnetic Battle Management capability and Joint EMSO cell operations .The To R for the CFT are attached .The SDO will report to me on CFT progress  recommendations  and needs by March I  2019  with routine updates thereafter .Attachment  As stated bl U  . . . . .   ...... Patrick M . Shanahan Acting 2 ',
						entities: {
							ORG: [
								'EMSO',
								'Shanahan',
								'SDO',
								'CFT'
							],
							GPE: [],
							NORP: [],
							LAW: [],
							LOC: [],
							PERSON: [
								'bl U',
								'Patrick M'
							]
						}
					},
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_2_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 2,
						par_raw_text_t: 'ATIACHMENT I TERMS OF REFERENCE FOR THE ELECTROMAGNETIC SPECTRUM OPERA TIO NS CROSS FVNCTIONAL TEAM REFERENCES . a .John S . Mc Cain National Defense Authorization Act for Fiscal Year 2019 Sections 918 and 1053 b .National Defense Authorization Act for Fiscal Year 2017 Section 911 c .Electronic Warfare ( EW ) Executive Committee ( EXCOM ) Charter PURPOSE .The Electromagnetic Spectrum Operations ( EMSO ) Cross Functional Team ( CFT ) is established to : • Provide for effective and efficient collaboration and integration across organizational and functional boundaries in the Department of Defense ( Do D ) ;• Identify gaps in EMSO ( comprised of Electronic Warfare ( EW ) and Spectrum Management ( SM ) ) manpower , technologies and processes for creating multi domain EMS advantage ;• Provide comprehensive and tiilly integrated policies , strategies , plans and requirements to address EMSO gaps , to include all Directed Energy ( DE ) weapon investments and programs ;• Make decisions on cross functional issues to the extent authorii.ed by the Secretary and within parameters established by the Secretary ;• Provide oversight for , and as directed by the Secretary , supervise the implementation of approved policies , strategies , plans , and resourcing decisions approved by the Secretary .BACKGROUND .The National Defense Authorization Act ( NDAA ) for Fiscal Year 2019 requires the Secretary of Defense ( Sec Def ) to : • Designate a senior official ( hereby referred to as the Senior Designated Official ( SDO ) ) , who shall establish and oversee processes and procedures to develop , integrate , and enhance the electronic warfare ( EW ) mission area and the conduct of Joint Electromagnetic Spectrum Operations ( JEMSO ) in all domains across the Do D ; and ensure that such processes and procedures provide for integrated defense wide strategy , planning , and budgeting with respect to the conduct of such operations by the Do D , including activities conducted to counter and deter such operations by malign actors .• Establish a CFT on EW , which will be overseen by the SDO .The E, \'I CFT will identify gaps in EW and JEMSO capabilities and capacities , across personnel , procedural , and equipment areas , and shall provide recommendations to the SDO to address gaps .In order to ensure we are addressing all the requirements necessary to successfully conduct EMSO , which includes EW , I am establishing an EMSO CFT , overseen by the SDO , to take bold action across the department to regain US dominance in the electromagnetic spectrum .',
						par_count_i: 0,
						par_inc_count: 2,
						par_text_t: 'ATIACHMENT I TERMS OF REFERENCE FOR THE ELECTROMAGNETIC SPECTRUM OPERA TIO NS CROSS FVNCTIONAL TEAM REFERENCES . a .John S . Mc Cain National Defense Authorization Act for Fiscal Year 2019 Sections 918 and 1053 b .National Defense Authorization Act for Fiscal Year 2017 Section 911 c .Electronic Warfare  EW  Executive Committee  EXCOM  Charter PURPOSE .The Electromagnetic Spectrum Operations  EMSO  Cross Functional Team  CFT  is established to  • Provide for effective and efficient collaboration and integration across organizational and functional boundaries in the Department of Defense  Do D  • Identify gaps in EMSO  comprised of Electronic Warfare  EW  and Spectrum Management  SM   manpower  technologies and processes for creating multi domain EMS advantage • Provide comprehensive and tiilly integrated policies  strategies  plans and requirements to address EMSO gaps  to include all Directed Energy  DE  weapon investments and programs • Make decisions on cross functional issues to the extent authorii.ed by the Secretary and within parameters established by the Secretary • Provide oversight for  and as directed by the Secretary  supervise the implementation of approved policies  strategies  plans  and resourcing decisions approved by the Secretary .BACKGROUND .The National Defense Authorization Act  NDAA  for Fiscal Year 2019 requires the Secretary of Defense  Sec Def  to  • Designate a senior official  hereby referred to as the Senior Designated Official  SDO    who shall establish and oversee processes and procedures to develop  integrate  and enhance the electronic warfare  EW  mission area and the conduct of Joint Electromagnetic Spectrum Operations  JEMSO  in all domains across the Do D  and ensure that such processes and procedures provide for integrated defense wide strategy  planning  and budgeting with respect to the conduct of such operations by the Do D  including activities conducted to counter and deter such operations by malign actors .• Establish a CFT on EW  which will be overseen by the SDO .The E I CFT will identify gaps in EW and JEMSO capabilities and capacities  across personnel  procedural  and equipment areas  and shall provide recommendations to the SDO to address gaps .In order to ensure we are addressing all the requirements necessary to successfully conduct EMSO  which includes EW  I am establishing an EMSO CFT  overseen by the SDO  to take bold action across the department to regain US dominance in the electromagnetic spectrum .',
						entities: {
							ORG: [
								'DE',
								'EMS',
								'Sec',
								'EMSO',
								'Spectrum Management',
								'EW',
								'EMSO CFT',
								'CFT',
								'NDAA',
								'Mc Cain National Defense Authorization Act',
								'SDO',
								'Joint Electromagnetic Spectrum Operations',
								'EMSO Cross Functional Team',
								'JEMSO',
								'the Department of Defense',
								'Directed Energy',
								'NS CROSS FVNCTIONAL',
								'EXCOM',
								'EW Executive Committee',
								'Defense'
							],
							GPE: [
								'US'
							],
							NORP: [],
							LAW: [],
							LOC: [],
							PERSON: []
						}
					},
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_3_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 3,
						par_raw_text_t: 'PROBLEM STATEMENT .The Depru:tment of Defense must take action to address an erosion in EMSO capabilities relative to the pacing threats identified in the 2018 National Defense Strategy .Overcoming this problem will require comprehensive actions spanning EMSO Doctrine , Organization , Training , Materiel , Leadership , Personnel , Facilities , and Policy ( DOTMLPF P ) .MISSION STATEMENT .The EMSO CFT will develop requirements and specific plans to evaluate , recommend , and implement improvements to EMSO capabilities across the Department necessary to achieve operational superiority within the Electromagnetic Spectrnm ( EMS ) .CONCEPT OF OPERA TIO NS .This is a Do D wide and multi year effort involving multiple Do D organizational entities in both the core EMSO CFT membership and including reachback to subject matter expertise and support from both Do D and other external organizations such as Director of National Intelligence , Department of Commerce , Department of State , and other organizations as appropriate .The EMSO CFT will have five overlapping phases and six Lines of Effort ( LO Es ) .The EMSO CFT will develop metrics to evaluate progress in identifying and addressing EMSO gaps .Phase l • Establish the EMSO CFT .Contributing organizations will identify fulltime EMSO CFT members within 30 days of this memorandum , and those personnel shall be in place and co located with the EMSO CFT workspaces NLT January 15 , 2019 .The Chief Management Office ( CMO ) of the Do D will secure working spaces and equipment no later than January 2 , 2019 , and provide CFT training to all EMSO CFT personnel .Phase U - Shaping .During this phase , the EMSO Crr will conduct fact finding , including review of documentation , communications with subject matter experts in and out of the Department , and site visits necessary to gain an understanding of the requirements and gaps in EMSO .The Military Departments ( Mil Deps ) ,Combatant Commands ( CCMDs ) , and Intelligence Community will provide information to fully describe the required EMSO capabilities to effectively operate in the current and future EMS operational environment .The EMSO CFT will help key Do D leaders conununicate their efforts to audiences within and outside the Do D .This phase runs concurrent with all other phases .Phase III - Decisive Acti.on .In coordination with the Mi !Deps and CCMDs , the EMSO CFT will provide recommendations to the Senior Designated Official for materiel and non materiel solutions to address the EMSO gaps identified across the DOTMLPF P spectrum .The recommendations will be documented in a roadmap which will identify tbe Office of Primary Responsibility ( OPR ) , milestones and resource requirements for the actions .Phase IV - Exploitation .Through an iterative process , designed to identify and 2 ',
						par_count_i: 0,
						par_inc_count: 3,
						par_text_t: 'PROBLEM STATEMENT .The Deprutment of Defense must take action to address an erosion in EMSO capabilities relative to the pacing threats identified in the 2018 National Defense Strategy .Overcoming this problem will require comprehensive actions spanning EMSO Doctrine  Organization  Training  Materiel  Leadership  Personnel  Facilities  and Policy  DOTMLPF P  .MISSION STATEMENT .The EMSO CFT will develop requirements and specific plans to evaluate  recommend  and implement improvements to EMSO capabilities across the Department necessary to achieve operational superiority within the Electromagnetic Spectrnm  EMS  .CONCEPT OF OPERA TIO NS .This is a Do D wide and multi year effort involving multiple Do D organizational entities in both the core EMSO CFT membership and including reachback to subject matter expertise and support from both Do D and other external organizations such as Director of National Intelligence  Department of Commerce  Department of State  and other organizations as appropriate .The EMSO CFT will have five overlapping phases and six Lines of Effort  LO Es  .The EMSO CFT will develop metrics to evaluate progress in identifying and addressing EMSO gaps .Phase l • Establish the EMSO CFT .Contributing organizations will identify fulltime EMSO CFT members within 30 days of this memorandum  and those personnel shall be in place and co located with the EMSO CFT workspaces NLT January 15  2019 .The Chief Management Office  CMO  of the Do D will secure working spaces and equipment no later than January 2  2019  and provide CFT training to all EMSO CFT personnel .Phase U  Shaping .During this phase  the EMSO Crr will conduct fact finding  including review of documentation  communications with subject matter experts in and out of the Department  and site visits necessary to gain an understanding of the requirements and gaps in EMSO .The Military Departments  Mil Deps  Combatant Commands  CCMDs   and Intelligence Community will provide information to fully describe the required EMSO capabilities to effectively operate in the current and future EMS operational environment .The EMSO CFT will help key Do D leaders conununicate their efforts to audiences within and outside the Do D .This phase runs concurrent with all other phases .Phase III  Decisive Acti.on .In coordination with the Mi Deps and CCMDs  the EMSO CFT will provide recommendations to the Senior Designated Official for materiel and non materiel solutions to address the EMSO gaps identified across the DOTMLPF P spectrum .The recommendations will be documented in a roadmap which will identify tbe Office of Primary Responsibility  OPR   milestones and resource requirements for the actions .Phase IV  Exploitation .Through an iterative process  designed to identify and 2 ',
						entities: {
							ORG: [
								'EMS',
								'EMSO',
								'the EMSO Crr',
								'the Senior Designated Official',
								'Facilities',
								'EMSO CFT',
								'U - Shaping .During',
								'Leadership , Personnel',
								'Chief Management Office',
								'tbe Office of Primary Responsibility',
								'NLT January 15 , 2019',
								'Department of State',
								'Intelligence Community',
								'the EMSO CFT',
								'Department',
								'CMO',
								'EMSO Doctrine , Organization',
								'Defense',
								'National Intelligence , Department of Commerce'
							],
							GPE: [],
							NORP: [],
							LAW: [],
							LOC: [],
							PERSON: [
								'Depru',
								'tment'
							]
						}
					},
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_4_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 4,
						par_raw_text_t: 'disseminate best practices , the EMSO CFT will continually evaluate Mi1Dep and CCMD efforts .Additionally , the EMSO CFT will continue to leverage the EW Community of Interest and academia to identify technologies and methods to improve EMSO capabilities .The EMSO CFT will assess progress in its roadmap through evaluation again.st defined metrics .Phase V - Transition .The EMSO CFT will identify systemic problems and pursue policies and mechanisms for enduring outcomes that continue in the Department throng � and beyond fiscal planning horizons .The EMSO CFT will stand down after the plans are transitioned to the Mi !Deps and CCMDs ; no earlier than Fiscal Year 2022 .The SDO will recommend to SECDEF when to disestablish the CFT and turnover responsibilities and plans lo the appropriate organization ( s ) .LINES OF EFFORT .The following are the initial Lines of Efforts ( LOEs ) .The EMSO CFT will execute the LOEs concurrently .The EMSO CFTwill recommend to the SDO the addition , deletion , or consolidation of LOEs as warranted . a .Joint Force Capability to Conduct Electromagnetic Spectrum Operations .The Joint Force must be able to train and conduct operations in an increasingly complex , congested , and contested electromagnetic environment .This LOE will examine existing organizational , capability , operational , and process shortfalls and provide plans to address gaps in EMSO , including establishment and manning of CCMD organizational constructs , frequency planning and deconfliction , and processes for obtaining requisite national and host nation approvals to test , train and operate in the spectrum . b .Do D Organization for EMSO .This LOE will recommend a path to efficiently and effectively organize the Do D to deliver superior EMSO capabilities to the warfighter .This LOE · will leverage ongoing studies examining options for optimizing the Do D EMSO organizational construct . c .EMSO Capabilities and Gaps .U.S . competitors have invested in EW as a way of neutralizing our advantage , affecting our command , control and communications , and attempting to weaken our ability to project decisive military power in contested environments .This LOE will examine the threat , inventory U.S . capability shortfalls , and recommend plans to address gaps , including timelines for delivering key EMSO capabilities .This LOE will develop plans to field superior technology and will recommend common materiel solutions across multiple progran1s that can be affordably modified to meet funire needs . d .Do D EW Strategy and Investment .This LOE will perform an analysis of personnel , resources , capabilities , authorities , and otbe.r mechanisms required to achieve the strategic objectives of the Department and address EMSO capability gaps .This LOE will identify roadblocks , recommend plans to address impediments , and identify 3 ',
						par_count_i: 0,
						par_inc_count: 4,
						par_text_t: 'disseminate best practices  the EMSO CFT will continually evaluate Mi1Dep and CCMD efforts .Additionally  the EMSO CFT will continue to leverage the EW Community of Interest and academia to identify technologies and methods to improve EMSO capabilities .The EMSO CFT will assess progress in its roadmap through evaluation again.st defined metrics .Phase V  Transition .The EMSO CFT will identify systemic problems and pursue policies and mechanisms for enduring outcomes that continue in the Department throng � and beyond fiscal planning horizons .The EMSO CFT will stand down after the plans are transitioned to the Mi Deps and CCMDs  no earlier than Fiscal Year 2022 .The SDO will recommend to SECDEF when to disestablish the CFT and turnover responsibilities and plans lo the appropriate organization  s  .LINES OF EFFORT .The following are the initial Lines of Efforts  LOEs  .The EMSO CFT will execute the LOEs concurrently .The EMSO CFTwill recommend to the SDO the addition  deletion  or consolidation of LOEs as warranted . a .Joint Force Capability to Conduct Electromagnetic Spectrum Operations .The Joint Force must be able to train and conduct operations in an increasingly complex  congested  and contested electromagnetic environment .This LOE will examine existing organizational  capability  operational  and process shortfalls and provide plans to address gaps in EMSO  including establishment and manning of CCMD organizational constructs  frequency planning and deconfliction  and processes for obtaining requisite national and host nation approvals to test  train and operate in the spectrum . b .Do D Organization for EMSO .This LOE will recommend a path to efficiently and effectively organize the Do D to deliver superior EMSO capabilities to the warfighter .This LOE · will leverage ongoing studies examining options for optimizing the Do D EMSO organizational construct . c .EMSO Capabilities and Gaps .U.S . competitors have invested in EW as a way of neutralizing our advantage  affecting our command  control and communications  and attempting to weaken our ability to project decisive military power in contested environments .This LOE will examine the threat  inventory U.S . capability shortfalls  and recommend plans to address gaps  including timelines for delivering key EMSO capabilities .This LOE will develop plans to field superior technology and will recommend common materiel solutions across multiple progran1s that can be affordably modified to meet funire needs . d .Do D EW Strategy and Investment .This LOE will perform an analysis of personnel  resources  capabilities  authorities  and otbe.r mechanisms required to achieve the strategic objectives of the Department and address EMSO capability gaps .This LOE will identify roadblocks  recommend plans to address impediments  and identify 3 ',
						entities: {
							ORG: [
								'the EMSO CFT',
								'EMSO',
								'Department',
								'EW',
								'CCMD',
								'CFT',
								'SDO',
								'EMSO CFT',
								'Mi1Dep',
								'Lines of Efforts',
								'the EW Community of Interest',
								'SECDEF'
							],
							GPE: [
								'U.S'
							],
							NORP: [],
							LAW: [],
							LOC: [],
							PERSON: []
						}
					},
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_5_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 5,
						par_raw_text_t: 'required resources where funding shortfalls are known or discovered . e .EMSO Experimentation .Test , Training , Ranges .Key to delivering superior EMSO capabilities to the warfighter is the ability to perform testing , experimentation and training in an operationally representative electromagnetic environment .This LOE will examine current EMSO deve.lop IDent and operational test and training infrastrncture , determine sufficiency , and develop resource recommendations for kno\\vn shortfalls .In addition , this LOE will develop plans to improve JEMSO training at all echelons of command and will recommend improvements to Service training across all mission areas . f .EMSO Modeling , Simulation . and Wargaming .This LOE will address needed EMSO modeling and simulation capabilities , i JJcluding virtual training , high fidelity and campaign focused simulation environments , and improvements in modeling and simulation for electromagnetic threats .AUTHORITIES a .Generate readiness for EMSO .The EMSO CFT can modify training objectives and metrics for any joint training event to improve EMSO readiness .The EMSO CFT can directly recommend training objectives and metrics for Service training events to improve EMSO readiness . b .Optimize the budget .The EMSO CFT can directly recommend top line growth or zero sum funding alignment to the Strategic Portfolio Review and Program and Budget Review Process .The SDO can submit , on behalf of the EMSO CFT , and after review by the Office of the Under Secretary of Defense ( Comptroller ) and the Chief Management Officer , both funded and unfunded priority lists to Congressional committees as part of the annual sufficiency of funds certification . c .Build a more lethal EMSO force .The EMSO CFT will establish processes and procedures to develop , integrate and enhance the use of EMSO capabilities in all mission areas and domains .The CFT shall propose changes in doctrine and policy directly to Sec Def .The CFT shall recommend architectures for cross domain effects , the development and fielding of capabilities across the joint force , and provide for the development of a professional force by proposing training , education , and career paths for EMSO across military and civilian personnel .SENIOR.DESIGNATED OFFICIAL .The SDO , designated by the Sec Def will have the following responsibilities and duties : a .Serve as the leader of the EMSO CFT . b .Serve as a member the EW EX COM .4 ',
						par_count_i: 0,
						par_inc_count: 5,
						par_text_t: 'required resources where funding shortfalls are known or discovered . e .EMSO Experimentation .Test  Training  Ranges .Key to delivering superior EMSO capabilities to the warfighter is the ability to perform testing  experimentation and training in an operationally representative electromagnetic environment .This LOE will examine current EMSO deve.lop IDent and operational test and training infrastrncture  determine sufficiency  and develop resource recommendations for knovn shortfalls .In addition  this LOE will develop plans to improve JEMSO training at all echelons of command and will recommend improvements to Service training across all mission areas . f .EMSO Modeling  Simulation . and Wargaming .This LOE will address needed EMSO modeling and simulation capabilities  i JJcluding virtual training  high fidelity and campaign focused simulation environments  and improvements in modeling and simulation for electromagnetic threats .AUTHORITIES a .Generate readiness for EMSO .The EMSO CFT can modify training objectives and metrics for any joint training event to improve EMSO readiness .The EMSO CFT can directly recommend training objectives and metrics for Service training events to improve EMSO readiness . b .Optimize the budget .The EMSO CFT can directly recommend top line growth or zero sum funding alignment to the Strategic Portfolio Review and Program and Budget Review Process .The SDO can submit  on behalf of the EMSO CFT  and after review by the Office of the Under Secretary of Defense  Comptroller  and the Chief Management Officer  both funded and unfunded priority lists to Congressional committees as part of the annual sufficiency of funds certification . c .Build a more lethal EMSO force .The EMSO CFT will establish processes and procedures to develop  integrate and enhance the use of EMSO capabilities in all mission areas and domains .The CFT shall propose changes in doctrine and policy directly to Sec Def .The CFT shall recommend architectures for cross domain effects  the development and fielding of capabilities across the joint force  and provide for the development of a professional force by proposing training  education  and career paths for EMSO across military and civilian personnel .SENIOR.DESIGNATED OFFICIAL .The SDO  designated by the Sec Def will have the following responsibilities and duties  a .Serve as the leader of the EMSO CFT . b .Serve as a member the EW EX COM .4 ',
						entities: {
							ORG: [
								'Sec',
								'EMSO',
								'the EMSO CFT',
								'Congressional',
								'SDO',
								'the Strategic Portfolio Review',
								'the EW EX',
								'EMSO CFT',
								'LOE',
								'the Chief Management Officer',
								'the Office of the Under Secretary of Defense ( Comptroller'
							],
							GPE: [],
							NORP: [],
							LAW: [],
							LOC: [],
							PERSON: []
						}
					},
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_6_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 6,
						par_raw_text_t: 'c . Develop an integrated resource strategy for EMSO investment to the EW EXCOM . d .Oversee the Do D EW Strategy implementation . e .Propose EMSO governance , management , organization , and operational reforms to the Sec Def , after review ru1d comment by the EW EXCOM . f .Provide status reports to Congress every 180 days for three years on EMSO CFT efforts , initiatives , progress , and results , pursuant to section 1053 ( d ) ( 4 ) of the NDAA for FY2019 . g .Provide an assessment of the sufficiency of funds in each President \'s Future Years Defense Program from FY2020 through FY2024 for an Electromagnetic Battle Management capability and for JEMSO cell establishment and operations . h .Recommend directly to Sec Def any action required to address identified gaps .ELECTROMAGNETIC SPECTRUM OPERATIONS CROSS FUNCTIONAL TEAM .The CFT will be comprised of core ( full time ) , level . ll , and level III personnel/organizations . a .Membership of the EMSO CFT shall consist of full time representatives from the organizations below .Members shou.ld be at the 0-5/6 or GS 14/l 5 level .The CFT deputy shall be a I Star/SES I level , who will be selected by the SDO .The organizations shall nominate CFT members to the SDO for approval .The SDO shall have the authority to modify core CFT organization and personnel membership as required .CFT members shall be assigned to the CFT for a minimum of 12 months .I . CFT Deputy ( I Star/SES I ) 2 .Army 3 .Navy 4 .Air Force 5 .Air Force ( Space ) 6 .Marine Corps 7 .Joint Staff 8 .OUSD ( R&E )9 . OUSD ( A&S )10 .OVSD ( I )11 .Do D CIO 12 .VSSTRA TCOM 13 .USCYBERCOM b .The CFT level II will be comprised of subject matter expert reachback personnel under the authority of Sec Def .The CFT shall have authority to task subject matter experts in other Do D organizations on an as needed basis . c .The CFT level III will be comprised of organizations not under the authority of 5 ',
						par_count_i: 0,
						par_inc_count: 6,
						par_text_t: 'c . Develop an integrated resource strategy for EMSO investment to the EW EXCOM . d .Oversee the Do D EW Strategy implementation . e .Propose EMSO governance  management  organization  and operational reforms to the Sec Def  after review ru1d comment by the EW EXCOM . f .Provide status reports to Congress every 180 days for three years on EMSO CFT efforts  initiatives  progress  and results  pursuant to section 1053  d   4  of the NDAA for FY2019 . g .Provide an assessment of the sufficiency of funds in each President s Future Years Defense Program from FY2020 through FY2024 for an Electromagnetic Battle Management capability and for JEMSO cell establishment and operations . h .Recommend directly to Sec Def any action required to address identified gaps .ELECTROMAGNETIC SPECTRUM OPERATIONS CROSS FUNCTIONAL TEAM .The CFT will be comprised of core  full time   level . ll  and level III personnelorganizations . a .Membership of the EMSO CFT shall consist of full time representatives from the organizations below .Members shou.ld be at the 056 or GS 14l 5 level .The CFT deputy shall be a I StarSES I level  who will be selected by the SDO .The organizations shall nominate CFT members to the SDO for approval .The SDO shall have the authority to modify core CFT organization and personnel membership as required .CFT members shall be assigned to the CFT for a minimum of 12 months .I . CFT Deputy  I StarSES I  2 .Army 3 .Navy 4 .Air Force 5 .Air Force  Space  6 .Marine Corps 7 .Joint Staff 8 .OUSD  RE 9 . OUSD  AS 10 .OVSD  I 11 .Do D CIO 12 .VSSTRA TCOM 13 .USCYBERCOM b .The CFT level II will be comprised of subject matter expert reachback personnel under the authority of Sec Def .The CFT shall have authority to task subject matter experts in other Do D organizations on an as needed basis . c .The CFT level III will be comprised of organizations not under the authority of 5 ',
						entities: {
							ORG: [
								'NDAA',
								'Force (',
								'OUSD',
								'Sec',
								'JEMSO',
								'Congress',
								'EMSO',
								'EW EXCOM',
								'FY2020',
								'SDO',
								'EMSO CFT',
								'Future Years Defense Program',
								'CFT'
							],
							GPE: [],
							NORP: [],
							LAW: [
								'section 1053'
							],
							LOC: [],
							PERSON: [
								'TCOM'
							]
						}
					},
					{
						type: 'paragraph',
						id: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf_7_0',
						filename: 'SEC DEF Memo, Establishment of the Electromagnetic Spectrum Operations Cross Functional Team, 2 2 2019 OCR.pdf',
						page_num_i: 7,
						par_raw_text_t: 'Sec Def who have an expertise deemed appropriate by the CFT .The CFT shall have liaison authority agreed to by the Level III organization not under Do D authority .RESOURCES Al�D SUPPORT a .The CMO of the Do D will administratively support the CFT , to include providing Sensitive Compartmented Information Facility and Special Access Program Facility office space and f T equipment , contracting , hwnan resources , security , CF T training , and other services , as appropriate .The CMO of the Do D will provide other assistance and support as requested by the SDO . b .The EMSO CFT will work in concert with the CMO of the Do D in order to develop resource requirements for CFT operations .Initial FY2019 and FY2020 resource requirements shall be coordinated as soon as possible with the CMO to ensure adequate resources are immediately available . c .The CFT shall work in concert with the CMO in order to develop financial mechanisms , including development and validation of source appropriation resource requirements to support the CFT activities and ensure inclusion of any requirements in future budget justification material , as required . d .The Director of Special Programs ( DSP ) , under USD ( A&S ) , shall ensure proper secu1ity oversight is applied to all Do D Special Access Programs ( SAPs ) in support of the EMSO CFT .The DSP will establish and maintain a SAP portfolio to include all SAPs relating to weapons application of EMSO capabilities or relating to technologies that may be exploited for EMSO and synergistic cyberspace operations capabilities .The portfolio will include permanent billets sufficient to support the EMSO CFT and temporary access necessary for operation of specialized mission area working groups .6 ',
						par_count_i: 0,
						par_inc_count: 7,
						par_text_t: 'Sec Def who have an expertise deemed appropriate by the CFT .The CFT shall have liaison authority agreed to by the Level III organization not under Do D authority .RESOURCES Al�D SUPPORT a .The CMO of the Do D will administratively support the CFT  to include providing Sensitive Compartmented Information Facility and Special Access Program Facility office space and f T equipment  contracting  hwnan resources  security  CF T training  and other services  as appropriate .The CMO of the Do D will provide other assistance and support as requested by the SDO . b .The EMSO CFT will work in concert with the CMO of the Do D in order to develop resource requirements for CFT operations .Initial FY2019 and FY2020 resource requirements shall be coordinated as soon as possible with the CMO to ensure adequate resources are immediately available . c .The CFT shall work in concert with the CMO in order to develop financial mechanisms  including development and validation of source appropriation resource requirements to support the CFT activities and ensure inclusion of any requirements in future budget justification material  as required . d .The Director of Special Programs  DSP   under USD  AS   shall ensure proper secu1ity oversight is applied to all Do D Special Access Programs  SAPs  in support of the EMSO CFT .The DSP will establish and maintain a SAP portfolio to include all SAPs relating to weapons application of EMSO capabilities or relating to technologies that may be exploited for EMSO and synergistic cyberspace operations capabilities .The portfolio will include permanent billets sufficient to support the EMSO CFT and temporary access necessary for operation of specialized mission area working groups .6 ',
						entities: {
							ORG: [
								'liaison authority',
								'Sensitive Compartmented Information Facility and Special Access Program Facility',
								'Special Programs',
								'Sec',
								'the EMSO CFT',
								'SAP',
								'EMSO',
								'USD',
								'SDO',
								'CMO',
								'EMSO CFT',
								'DSP',
								'CFT'
							],
							GPE: [],
							NORP: [],
							LAW: [],
							LOC: [],
							PERSON: []
						}
					}
				],
				tagsList: [
					'PERSON',
					'NORP',
					'ORG',
					'GPE',
					'LOC',
					'LAW'
				],
				tagDescriptions: {
					PERSON: 'People',
					NORP: 'Nationalities, Religious or Political Groups',
					ORG: ' Companies, Agencies, Institutions, Etc.',
					GPE: 'Countries, Cities, States',
					LOC: 'Non-GPE locations, Mountain ranges, Bodies of water',
					LAW: 'Named Documents made into Laws'
				}
			};

			const constants = {
				GAME_CHANGER_OPTS: {
					version: 'version'
				}
			};

			const opts = {
				...constructorOptionsMock,
				constants,
			};

			const target = new DocumentController(opts);

			const cleanResult = target.cleanDocumentForCrowdAssist(fakeDoc, 'Test');

			assert.deepEqual(cleanResult, fakeResult);
			done();

		});
	});

	describe('#getDocumentsToAnnotate', () => {
		it('should get documents to annotate', async (done) => {

			const apiResMock = {body: {
				took: 11,
				timed_out: false,
				_shards: {
					total: 3,
					successful: 3,
					skipped: 0,
					failed: 0
				},
				hits: {
					total: {
						value: 10000,
						relation: 'gte'
					},
					max_score: 1,
					hits: [
						{
							_index: 'gamechanger_20210211_reparsed',
							_type: '_doc',
							_id: '2f650c2db79e1b386efcc9fee204ce3ee51cea7ee112273ac42ead11d0d1de93',
							_score: 1,
							_source: {
								filename: 'DoDD 5205.75 CH 1.pdf',
								doc_num: '5205.75',
								doc_type: 'DoDD',
								id: 'DoDD 5205.75 CH 1.pdf_0',
								type: 'document',
								paragraphs: [
									{
										filename: 'DoDD 5205.75 CH 1.pdf',
										entities: {
											ORG_s: [],
											LOC_s: [],
											PERSON_s: [],
											NORP_s: [],
											LAW_s: [
												'United States Code',
												'Title 22'
											],
											GPE_s: [
												'U.S.'
											]
										},
										par_raw_text_t: 'a . Reissues Do D Directive ( Do DD ) 5105.75 ( Reference ( a ) ) as Do DD 5205.75 to establish policy and assign responsibilities for the operation of Do D elements at U.S . embassies pursuant to sections 2321i and 3927 ( a ) and ( b ) of Title 22 , United States Code ( U.S.C . ) ( Reference ( b ) ) and section 113 ( b ) of Title 10 , U.S.C . ( Reference ( c ) ) , and consistent with the President ’s letter of instruction to Chiefs of Mission ( Reference ( d ) ) .',
										par_count_i: 6,
										par_inc_count: 6,
										id: 'DoDD 5205.75 CH 1.pdf_6',
										type: 'paragraph',
										page_num_i: 0
									},
								]
							}
						}
					]
				}
			}};
			const constants = {
				GAME_CHANGER_OPTS: {
					index: 'version'
				}
			};

			const dataApi = {
				queryElasticSearch() {
					return Promise.resolve(apiResMock);
				},
				getESRequestConfig() {
					return {};
				}
			};

			const opts = {
				...constructorOptionsMock,
				constants,
				dataApi,
			};

			const target = new DocumentController(opts);

			const req = {
				...reqMock,
				body: {
					isClone: false,
					cloneData: {clone_data: {esCluster: 'test'}}
				}
			};

			let resData;
			const res = {
				...resMock,
				send: (data) => {
					resData = data;
					return data;
				}
			};

			await target.getDocumentsToAnnotate(req, res);

			const expected = {doc_id: 'DoDD 5205.75 CH 1.pdf_0', doc_num: '5205.75', doc_type: 'DoDD', paragraphs: [{entities: {GPE_s: ['U.S.'], LAW_s: ['United States Code', 'Title 22'], LOC_s: [], NORP_s: [], ORG_s: [], PERSON_s: []}, filename: 'DoDD 5205.75 CH 1.pdf', id: 'DoDD 5205.75 CH 1.pdf_6', page_num_i: 0, par_count_i: 6, par_inc_count: 6, par_raw_text_t: 'a . Reissues Do D Directive ( Do DD ) 5105.75 ( Reference ( a ) ) as Do DD 5205.75 to establish policy and assign responsibilities for the operation of Do D elements at U.S . embassies pursuant to sections 2321i and 3927 ( a ) and ( b ) of Title 22 , United States Code ( U.S.C . ) ( Reference ( b ) ) and section 113 ( b ) of Title 10 , U.S.C . ( Reference ( c ) ) , and consistent with the President ’s letter of instruction to Chiefs of Mission ( Reference ( d ) ) .', type: 'paragraph'}], tagDescriptions: {GPE: 'Countries, Cities, States', LAW: 'Named Documents made into Laws', LOC: 'Non-GPE locations, Mountain ranges, Bodies of water', NORP: 'Nationalities, Religious or Political Groups', ORG: ' Companies, Agencies, Institutions, Etc.', PERSON: 'People'}, tagsList: ['PERSON', 'NORP', 'ORG', 'GPE', 'LOC', 'LAW'], type: 'document'};
			assert.deepStrictEqual(resData, expected);

			done();

		});
	});

	describe('#getDocumentProperties', () => {

		const req = {
			headers: {
				SSL_CLIENT_S_DN_CN: 'john'
			},
			body: {},
			get(key) {
				return this.headers[key];
			}
		};

		const apiResMock = [
			{
				name: 'abbreviations_n',
				searchField: false
			},
			{
				name: 'author',
				searchField: false
			},
			{
				name: 'category_1',
				searchField: false
			},
			{
				name: 'category_2',
				searchField: false
			},
			{
				name: 'change_date',
				searchField: false
			},
			{
				name: 'classification',
				searchField: false
			},
			{
				name: 'display_doc_type_s',
				searchField: false
			},
			{
				name: 'display_org_s',
				searchField: false
			},
			{
				name: 'display_title_s',
				searchField: false
			},
			{
				name: 'doc_num',
				searchField: false
			},
			{
				name: 'doc_type',
				searchField: true
			},
			{
				name: 'entities',
				searchField: false
			},
			{
				name: 'filename',
				searchField: true
			},
			{
				name: 'group_s',
				searchField: false
			},
			{
				name: 'id',
				searchField: false
			},
			{
				name: 'init_date',
				searchField: false
			},
			{
				name: 'keyw_5',
				searchField: false
			},
			{
				name: 'kw_doc_score',
				searchField: false
			},
			{
				name: 'orgs',
				searchField: false
			},
			{
				name: 'orgs_rs',
				searchField: false
			},
			{
				name: 'page_count',
				searchField: false
			},
			{
				name: 'pagerank',
				searchField: false
			},
			{
				name: 'pagerank_r',
				searchField: false
			},
			{
				name: 'par_count_i',
				searchField: false
			},
			{
				name: 'paragraphs',
				searchField: false
			},
			{
				name: 'ref_list',
				searchField: false
			},
			{
				name: 'signature',
				searchField: false
			},
			{
				name: 'subject',
				searchField: false
			},
			{
				name: 'summary_30',
				searchField: false
			},
			{
				name: 'text_length_r',
				searchField: false
			},
			{
				name: 'title',
				searchField: true
			},
			{
				name: 'type',
				searchField: false
			},
			{
				name: 'word_count',
				searchField: false
			}
		];


		let resData;
		const res = {
			...resMock,
			send: (data) => {
				resData = data;
				return data;
			}
		};

		const dataApi = {
			getDocumentProperties(userId) {
				return Promise.resolve(apiResMock);
			},
		};

		const opts = {
			...constructorOptionsMock,
			dataApi,
			constants: {
				GAME_CHANGER_OPTS: {
					index: 'version'
				}
			}
		};

		it('should test document properties', (done) => {
			const target = new DocumentController(opts);

			target.getDocumentProperties(req, res).then(() => {
				assert.deepEqual(resData, apiResMock);
				done();
			});
		});
	});

	describe('#getOrgImageOverrideURLs', () => {
		it('should get image override URLs', async (done) => {			
			const constants = {
				GAME_CHANGER_OPTS: {
					index: 'version'
				}
			};

			const organizationURLs = {
				findAll() {
					return Promise.resolve(
						[{
							'id': 1,
							'org_name': 'Test Organization',
							'image_url': 'testURL'
						}]
					);
				}
			};

			const opts = {
				...constructorOptionsMock,
				constants,
				organizationURLs
			};

			const target = new DocumentController(opts);

			const req = {
				...reqMock,
				body: {},
				query: {}
			};

			let resData;
			const res = {
				...resMock,
				send: (data) => {
					resData = data;
					return data;
				}
			};

			await target.getOrgImageOverrideURLs(req, res);

			const expected = {'Test Organization': 'testURL'};
			assert.deepStrictEqual(resData, expected);

			done();
		});
	});
	describe('#getHomepageThumbnail', () => {
		it('should get array of thumbnails', async (done) => {
			const dataApi = {
				getFileThumbnail: (data, userId) => {
					let { dest, folder, filename, clone_name } = data;
					const key = `${clone_name}/${folder}/${filename}`;
					return new Promise(async (resolve, reject) => { resolve(key)});
				}
			};
			
			const opts = {
				...constructorOptionsMock,
				dataApi,
				constants: {
					GAME_CHANGER_OPTS: {
						index: 'version'
					}
				}
			};

			const target = new DocumentController(opts);

			const req	= {
				headers: {
					SSL_CLIENT_S_DN_CN: 'john'
				},
				body: {
					filenames: [{img_filename: 'test1'}, {img_filename: 'test2'}],
					folder: 'test',
					dest: 'gamechanger',
					clone_name: 'gamechanger'
				},
				get(key) {
					return this.headers[key];
				}
			};
	
			let resData;
			const res = {
				...resMock,
				status(msg){
					return this;
				},
				send: (data) => {
					resData = data;
					return data;
				}
			};
			const apiResMock = [
				{ status: 'fulfilled', value: 'gamechanger/test/test1' },
				{ status: 'fulfilled', value: 'gamechanger/test/test2' }
			];

			target.getHomepageThumbnail(req, res).then( () => {
				assert.deepEqual(resData, apiResMock);
				done();
			});
		});
	});
});
