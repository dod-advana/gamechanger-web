const assert = require('assert');
const JBookDataHandler = require('../../../node_app/modules/jbook/jbookDataHandler');
const { constructorOptionsMock } = require('../../resources/testUtility');
// const { it } = require('date-fns/locale');

const {
	profileData,
	keywordData,
	reviewData,
	esData,
	portfolioData,
} = require('../../resources/mockResponses/jbookMockData');

describe('JBookDataHandler', function () {
	describe('#getProjectData', () => {
		const docs = profileData;
		let keywords = keywordData['pdoc'];
		let review = reviewData['pdoc'];
		let esReturn = esData['pdoc'];
		let portfolios = portfolioData;

		const findOneFromDocs = (id, type) => {
			return docs[type][id];
		};

		const opts = {
			...constructorOptionsMock,
			constants: {
				GAME_CHANGER_OPTS: { downloadLimit: 1000, allow_daterange: true },
				GAMECHANGER_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
				EDA_ELASTIC_SEARCH_OPTS: { index: 'Test', assist_index: 'Test' },
			},
			pdoc: {
				findOne(where) {
					return Promise.resolve({ dataValues: findOneFromDocs(where.where.id, 'pdoc') });
				},
			},
			rdoc: {
				findOne(where) {
					return Promise.resolve({ dataValues: findOneFromDocs(where.where.id, 'rdoc') });
				},
			},
			om: {
				findOne(where) {
					return Promise.resolve({ dataValues: findOneFromDocs(where.where.id, 'odoc') });
				},
			},
			gl_contracts: {
				findAll() {
					return Promise.resolve([]);
				},
			},
			obligations: {
				findAll() {
					return Promise.resolve([]);
				},
			},
			accomp: {
				findAll() {
					return Promise.resolve([]);
				},
			},
			db: {
				jbook: {
					query() {
						return Promise.resolve(keywords);
					},
				},
			},
			review: {
				findOne() {
					return Promise.resolve({ dataValues: review });
				},
			},
			reviewer: {
				findOne() {
					return Promise.resolve([]);
				},
			},
			vendors: {
				findAll() {
					return Promise.resolve([]);
				},
			},
			keyword: {
				findAll() {
					return Promise.resolve([]);
				},
			},
			dataLibrary: {
				queryElasticSearch(name, index, query, userId) {
					return Promise.resolve(esReturn);
				},
			},
			portfolio: {
				findOne() {
					return Promise.resolve(portfolios[0]);
				},
				findAll() {
					return Promise.resolve(portfolios);
				},
				update() {
					return Promise.resolve([1]);
				},
			},
		};

		it('should get the pdoc project data for different types PG', async (done) => {
			keywords = keywordData['pdoc'];
			review = reviewData['pdoc'];

			const req = {
				body: {
					useElasticSearch: false,
					type: 'Procurement',
					id: 0,
				},
			};

			const target = new JBookDataHandler(opts);

			const expected = {
				id: 8177,
				composite_key:
					'P40-01_LI_Number:000073::P40-03_P1_LineNumber:83::P40-08_Appn_Number:3010F::P40-04_BudgetYear:2022::P40-05_BudgetCycle:PB::P40-10_BA_Number:7::P40_12_BSA_Number:3',
				budgetLineItem: '000073',
				projectTitle: 'Industrial Responsiveness',
				p1LineNumber: '83',
				budgetYear: '2022',
				budgetCycle: 'PB',
				serviceAgency: 'Air Force (AF)',
				'P40-07_Org_Code': 'AF',
				appropriationNumber: '3010F',
				appropriationTitle: 'Aircraft Procurement, Air Force',
				budgetActivityNumber: '07',
				budgetActivityTitle: 'Aircraft Supt Equipment & Facilities',
				'P40-12_BSA_Number': 3,
				'P40-13_BSA_Title': 'Industrial Preparedness',
				'P40-14_IDCode': 'A',
				'P40-77_TOA_PY': 17.705,
				priorYearAmount: 18.215,
				currentYearAmount: 18.11,
				by1BaseYear: 18.11,
				'P40a-16_Title': 'Industrial Responsiveness',
				'P40a-74_TotCost_PY': 17.705,
				'P40a-75_TotCost_CY': 18.215,
				'P40a-76_TotCost_BY1Base': 18.11,
				projectMissionDescription:
					"1.  The Air Force Industrial Preparedness program element combines the resources of several appropriations (Aircraft Procurement, Missile Procurement, and Operation and Maintenance) to create a comprehensive program that aids in ensuring the defense industry can supply reliable, safe, affordable systems to operational commanders.  The Aircraft Procurement part of Industrial Preparedness support 1) management and upkeep of government-owned industrial plants; 2) management of industrial base assessments; 3) environmental compliance and pollution prevention at government-owned industrial plants.\n\n2. Four basic activities are funded in this appropriation: Industrial Facilities (3000), Industrial Base Assessments (6000), Environmental Compliance (7000), and Pollution Prevention (6044).\n\nIndustrial Facility Capital Type Rehabilitation cost element (MPC 3000) provides for repair and expansion, major capital rehabilitation, construction, demolition, equipment, real property directives (appraisals, easements, physical condition reports, etc.) and energy conservation to ensure government-owned, contractor-operated industrial facilities remain operationally safe, suitable and effective to meet the nation's weapon system industry needs.  These plants are the backbone of defense weapon system assembly and maintenance for the B-2, U-2, F-16, P-3 C-130, C-5B, RQ-4 Global Hawk, F-35 Joint Strike Fighter & classified programs and it is the intent of Congress (10USC 2535) to provide an essential nucleus of government owned industrial plants.\n\nIndustrial Base Assessment cost element (MPC 6000) provides for the identification, analysis and assessment of industrial base concerns dealing with aircraft research and development, production, and sustainment.  These assessments provide timely and accurate industrial base information to support Air Force decisions on 1) aircraft weapon system acquisition risks; 2) budget allocation investments; 3) weapon system sustainment and logistics support; and 4) defense industry mergers, acquisitions, and divestitures.  Supports Joint & Service industrial base planning on shared commodities, technologies, and facilities.\n\nEnvironmental Compliance cost element (MPC 7000) provides for the efforts needed to maintain environmental compliance with federal, state, and local regulatory requirements regarding operation of the government-owned contractor-operated industrial facilities. The environmental compliance program includes efforts to enhance compliance through pollution prevention reducing controlled emissions and use of hazardous materials.  Environmentally compliant industrial facilities enable production to continue and grow to meet our nation's weapon system needs and avoid the risk of cleanup costs and penalties from Federal, State and Local regulators.\n\nPollution Prevention (P2) cost element (MPC 6044) at AF government-owned, contractor-operated (GOCO) facilities implements the Pollution Prevention program that reduces emissions to air, land, and water, reduces AF cost as facility owner.  Implements Environmental Safety and Occupational Health (ESOH) risk management that reduces weapon systems' risk impacts and life cycle costs.  Includes qualification of improved processes, materials and equipment; energy conservation initiatives; P2 opportunity assessments; and recovery/recycling to minimize hazardous waste.  Program results can be shared to benefit others.  Activities support AF goals under P2 Act, EO 13834, Efficient Fed Ops, AF/CV and SAF/IE Policy on P2 and Waste Elimination, USD (AT&L) hexavalent chromium reduction policy, and Resource Conservation and Recovery Act. Prior to FY15, funds provided through PE 078054F.  FY19 moved from BP19 to BP14.",
				'P40-15_Justification':
					'FY2022 requirements are for MPC 3000 Capital Type Rehabilitation, MPC 6000 Industrial Base Assessment, MPC 7000 Environmental Compliance and MPC 6044 Pollution Prevention.  Funding for this exhibit is contained in PE 0708011F.',
				'P40-14_Description_Search':
					"'-130':183 '-16':179 '-2':175,177 '-3':181 '-35':192 '-4':188 '078054f':507 '1':1,52,259 '10usc':205 '13834':474 '2':62,80,265 '2535':206 '3':68,269 '3000':91,111 '4':277 '5b':186 '6000':95,223 '6044':102,389 '7000':98,301 'accur':249 'acquisit':263,281 'act':472,499 'activ':83,466 'af':391,414,468 'af/cv':478 'afford':39 'aid':29 'air':3,255,409 'aircraft':15,45,237,260 'alloc':267 'analysi':228 'apprais':126 'appropri':14,88 'assembl':169 'assess':67,94,219,230,245,451 'avoid':369 'b':174 'backbon':164 'base':66,93,218,233,251,288 'basic':82 'benefit':464 'bp14':513 'bp19':511 'budget':266 'c':182,185 'c-5b':184 'capit':105,118 'chromium':491 'classifi':196 'cleanup':373 'combin':9 'command':43 'commod':292 'complianc':70,97,297,310,332,338 'compliant':351 'comprehens':26 'concern':234 'condit':129 'congress':204 'conserv':134,447,496 'construct':120 'continu':357 'contractor':141,326,396 'contractor-oper':140,325,395 'control':343 'cost':108,220,298,374,386,415,437 'creat':24 'cycl':436 'deal':235 'decis':257 'defens':33,166,278 'demolit':121 'develop':240 'direct':125 'divestitur':283 'easement':127 'effect':150 'effici':475 'effort':305,335 'element':8,109,221,299,387 'elimin':486 'emiss':344,407 'enabl':354 'energi':133,446 'enhanc':337 'ensur':31,136 'environment':69,96,296,309,331,350,420 'eo':473 'equip':122,445 'esoh':425 'essenti':210 'etc':131 'expans':116 'f':178,191 'facil':90,104,144,295,329,353,399,417 'fed':476 'feder':312,378 'fighter':195 'forc':4,256 'four':81 'fund':85,503 'fy15':502 'fy19':508 'global':189 'goal':469 'goco':398 'govern':58,76,138,213,323,393 'government-own':57,75,137,322,392 'grow':359 'hawk':190 'hazard':348,456 'health':424 'hexaval':490 'identif':227 'impact':433 'implement':400,419 'improv':441 'includ':334,438 'industri':5,34,49,60,65,78,89,92,103,143,158,215,217,232,250,279,287,328,352 'inform':252 'initi':448 'intent':202 'invest':268 'joint':193,285 'l':489 'land':410 'life':435 'local':315,381 'logist':274 'maintain':308 'mainten':22,171 'major':117 'manag':53,63,427 'materi':349,443 'meet':152,361 'merger':280 'minim':455 'missil':17 'move':509 'mpc':110,222,300,388 'nation':154,363 'need':159,306,367 'nucleus':211 'occup':423 'op':477 'oper':20,42,142,146,319,327,397 'opportun':450 'other':465 'own':59,77,139,214,324,394 'owner':418 'p':180 'p2':385,449,471,483 'part':47 'pe':506 'penalti':376 'physic':128 'plan':289 'plant':61,79,161,216 'polici':481,493 'pollut':72,100,340,383,402 'prepared':6,50 'prevent':73,101,341,384,403 'prior':500 'process':442 'procur':16,18,46 'product':241,355 'program':7,27,197,333,404,458 'properti':124 'provid':112,208,224,246,302,504 'qualif':439 'real':123 'recoveri':498 'recovery/recycling':453 'reduc':342,406,413,429 'reduct':492 'regard':318 'regul':382 'regulatori':316 'rehabilit':107,119 'reliabl':37 'remain':145 'repair':114 'report':130 'requir':317 'research':238 'resourc':11,495 'result':459 'risk':264,371,426,432 'rq':187 'saf/ie':480 'safe':38,147 'safeti':421 'servic':286 'sever':13 'share':291,462 'state':313,379 'strike':194 'suitabl':148 'suppli':36 'support':51,254,275,284,467 'sustain':243,272 'system':40,157,168,262,271,366,431 'technolog':293 'time':247 'type':106 'u':176 'upkeep':55 'usd':487 'use':346 'wast':457,485 'water':412 'weapon':156,167,261,270,365,430",
				'P40-15_Justification_Search':
					"'0708011f':32 '3000':6 '6000':11 '6044':21 '7000':16 'assess':14 'base':13 'capit':7 'complianc':18 'contain':29 'environment':17 'exhibit':27 'fund':24 'fy2022':1 'industri':12 'mpc':5,10,15,20 'pe':31 'pollut':22 'prevent':23 'rehabilit':9 'requir':2 'type':8",
				contracts: [],
				obligations: [],
				keywords: [],
				review: {
					id: 233170,
					revBudgetLineItems: '000073',
					serviceAgreeLabel: 'Yes',
					primaryClassLabel: 'Not AI',
					primaryPlannedTransitionPartner: 'Air Force',
					servicePTPAgreeLabel: 'Yes',
					serviceAdditionalMissionPartners: 'Unknown',
					reviewStatus: 'Partial Review (POC)',
					servicePOCTitle: 'Superwoman',
					servicePOCName: 'Elizabeth',
					servicePOCEmail: 'hedrick_elizabeth@bah.com',
					primaryReviewNotes: 'Test Automation Primary Reviewer Notes',
					budgetYear: '2022',
					budgetType: 'pdoc',
					primaryReviewStatus: 'Finished Review',
					serviceReviewStatus: 'Partial Review',
					pocReviewStatus: 'Partial Review',
					primaryReviewer: 'Allen, Gregory',
					serviceReviewer: 'Chapa, Joseph (Air Force)',
					servicePOCOrg: 'Advana',
					servicePOCPhoneNumber: '867-5309',
					createdAt: '2021-11-10T13:59:27.983Z',
					updatedAt: '2022-03-08T03:33:44.950Z',
					budgetActivityNumber: '07',
					pocAgreeLabel: 'No',
					pocClassLabel: 'Not AI',
					pocPTPAgreeLabel: 'Yes',
					pocMPAgreeLabel: 'Yes',
					pocMissionPartnersChecklist: '{}',
					serviceMissionPartnersChecklist: '{}',
					appropriationNumber: '3010F',
					serviceAgency: 'Air Force (AF)',
					totalBudget: 0,
					primaryReviewerEmail: null,
					serviceReviewerEmail: null,
					serviceSecondaryReviewerEmail: null,
				},
				vendors: [],
			};
			const actual = await target.getProjectData(req, 'Test');
			assert.deepStrictEqual(actual, expected);
			done();
		});

		it('should get the rdoc project data for different types PG', async (done) => {
			keywords = keywordData['rdoc'];
			review = reviewData['rdoc'];

			const req = {
				body: {
					useElasticSearch: false,
					type: 'RDT&E',
					id: 0,
				},
			};

			const target = new JBookDataHandler(opts);

			const expected = {
				id: 19272,
				composite_key:
					'Budget_Year:2022::Budget_Cycle:PB::BA_Number:7PE_Num:0101122F::Proj_Number:674797::Appn_Num:3600::Proj_Number:674797',
				appropriationNumber: '3600',
				appropriationTitle: 'Research, Development, Test & Evaluation, Air Force',
				submissionDate: '2021-06',
				AwardDate_PY: '2020-01',
				budgetActivityNumber: '07',
				budgetActivityTitle: 'Operational Systems Development',
				budgetCycle: 'PB',
				budgetYear: '2022',
				toComplete: 'September 2021',
				EndQuarter: '3',
				EndYear: '2021',
				Event_Title: 'INE CCA Development',
				serviceAgency: 'Air Force (AF)',
				OrganizationCode: 'AF',
				OthProgFund_Title: 'ALCM, Missile Modifications',
				programElement: '0101122F',
				programElementTitle: 'Air-Launched Cruise Missile (ALCM)',
				currentYearAmount: 0.453,
				priorYearAmount: 1.43,
				Proj_Fund_PY: 10.116,
				projectNum: '674797',
				projectTitle: 'ALCM Upgrades',
				StartDate: 'March 2020',
				StartQuarter: '1',
				StartYear: '2020',
				SubProj_Title: 'INE Sustainment',
				projectMissionDescription:
					"The AGM-86B, Air Launched Cruise Missile (ALCM), is a subsonic, air-to-surface strategic nuclear missile, operational since 1982.  Armed with a W-80 warhead, it is designed to evade air and ground-based defenses in order to strike targets at any location within any enemy's territory.  The ALCM is designed for B-52H internal and external carriage. \n\nRDT&E funds support development of new tests and evaluation procedures, software, and equipment.  RDT&E funds also provide sustainment solutions for Line Replaceable Units (LRU) and technology insertion to ensure ALCM sustainability supports Air Force strategic nuclear deterrence and Global Strike mission requirements through 2030.  Additionally, RDT&E funds support aging and surveillance analysis to pro-actively identify components which will degrade system reliability.\n\nThe ALCM Test Plan Development and Evaluation program develops plans and procedures for testing nuclear systems, and implements those procedures as directed by the Chairman, Joint Chiefs of Staff (CJCS) and to satisfy the recurring requirements to test Chemical, Biological, Radiological, and Nuclear (CBRN) susceptibility.\n\nAn extensive Service Life Extension Program (SLEP) is in place to address age related issues and to ensure reliability and sustainability through 2030. Technology insertion is anticipated to address serviceability of components at or near end of life. \n\nThis program element may include necessary civilian pay expenses required to manage, execute, and deliver weapon system capability.  The use of such programs funds would be in addition to the civilian pay expenses budgeted in program element 0605831F.\n\nThis program is in Budget Activity 7, Operational System Development because this budget activity includes development efforts to upgrade systems that have been fielded or have received approval for full rate production and anticipate production funding in the current or subsequent fiscal year.",
				projectAquisitionStrategy:
					"Previously, the Air Launched Cruise Missile (ALCM) was assessed in the nuclear environment for Chemical, Biological, Radiological and Nuclear (CBRN) Survivability for High Altitude Electromagnetic Pulse (HEMP) and Total Ionizing Dose at White Sands Missile Range (WSMR). \n\nFollow-on test development will assess the neutron and gamma component in the nuclear environment for CBRN survivability. Test development and execution will utilize organic and contractor agencies. \n\nINE SLEP plans for a three phase reliability assessment with comprehensive plan to address short and long term supportability.\nPhase 1 - Short-term parts shortage mitigation analyses with Tomahawk Reference Measuring Unit and Computer\nPhase 2 - Definition of scope of efforts and establishing the manufacturing methodology\nPhase 3 - Delivery of working engineering samples, certification of production, and production of INE's equal to the function and reliability of 'like new' devices",
				Appn_Title_Search: "'air':5 'develop':2 'evalu':4 'forc':6 'research':1 'test':3",
				BA_Title_Search: "'develop':3 'oper':1 'system':2",
				Event_Title_Search: "'cca':2 'develop':3 'ine':1",
				OthProgFund_Title_Search: "'alcm':1 'missil':2 'modif':3",
				PE_Title_Search: "'air':2 'air-launch':1 'alcm':6 'cruis':4 'launch':3 'missil':5",
				Proj_Title_Search: "'alcm':1 'upgrad':2",
				SubProj_Title_Search: "'ine':1 'sustain':2",
				Proj_MSN_Desc_Search:
					"'-80':27 '0605831f':251 '1982':22 '2030':110,198 '52h':60 '7':258 '86b':4 'activ':123,257,265 'addit':111,241 'address':187,204 'age':116,188 'agm':3 'agm-86b':2 'air':5,14,34,99 'air-to-surfac':13 'alcm':9,54,96,132 'also':82 'analysi':119 'anticip':202,285 'approv':279 'arm':23 'b':59 'b-52h':58 'base':38 'biolog':170 'budget':247,256,264 'capabl':231 'carriag':64 'cbrn':174 'chairman':155 'chemic':169 'chief':157 'civilian':220,244 'cjcs':160 'compon':125,207 'cruis':7 'current':290 'defens':39 'degrad':128 'deliv':228 'design':31,56 'deterr':103 'develop':69,135,139,261,267 'direct':152 'e':66,80,113 'effort':268 'element':216,250 'end':211 'enemi':50 'ensur':95,193 'equip':78 'evad':33 'evalu':74,137 'execut':226 'expens':222,246 'extens':177,180 'extern':63 'field':275 'fiscal':293 'forc':100 'full':281 'fund':67,81,114,237,287 'global':105 'ground':37 'ground-bas':36 'identifi':124 'implement':148 'includ':218,266 'insert':93,200 'intern':61 'issu':190 'joint':156 'launch':6 'life':179,213 'line':87 'locat':47 'lru':90 'manag':225 'may':217 'missil':8,19 'mission':107 'near':210 'necessari':219 'new':71 'nuclear':18,102,145,173 'oper':20,259 'order':41 'pay':221,245 'place':185 'plan':134,140 'pro':122 'pro-act':121 'procedur':75,142,150 'product':283,286 'program':138,181,215,236,249,253 'provid':83 'radiolog':171 'rate':282 'rdt':65,79,112 'receiv':278 'recur':165 'relat':189 'reliabl':130,194 'replac':88 'requir':108,166,223 'satisfi':163 'servic':178,205 'sinc':21 'slep':182 'softwar':76 'solut':85 'staff':159 'strateg':17,101 'strike':43,106 'subsequ':292 'subson':12 'support':68,98,115 'surfac':16 'surveil':118 'suscept':175 'sustain':84,97,196 'system':129,146,230,260,271 'target':44 'technolog':92,199 'territori':52 'test':72,133,144,168 'unit':89 'upgrad':270 'use':233 'w':26 'warhead':28 'weapon':229 'within':48 'would':238 'year':294",
				Proj_Aquisition_Startegy_Search:
					"'1':87 '2':103 '3':115 'address':80 'agenc':66 'air':3 'alcm':7 'altitud':24 'analys':94 'assess':9,44,75 'biolog':16 'cbrn':20,55 'certif':121 'chemic':15 'compon':49 'comprehens':77 'comput':101 'contractor':65 'cruis':5 'definit':104 'deliveri':116 'develop':42,58 'devic':138 'dose':31 'effort':108 'electromagnet':25 'engin':119 'environ':13,53 'equal':129 'establish':110 'execut':60 'follow':39 'follow-on':38 'function':132 'gamma':48 'hemp':27 'high':23 'ine':67,127 'ioniz':30 'launch':4 'like':136 'long':83 'manufactur':112 'measur':98 'methodolog':113 'missil':6,35 'mitig':93 'neutron':46 'new':137 'nuclear':12,19,52 'organ':63 'part':91 'phase':73,86,102,114 'plan':69,78 'previous':1 'product':123,125 'puls':26 'radiolog':17 'rang':36 'refer':97 'reliabl':74,134 'sampl':120 'sand':34 'scope':106 'short':81,89 'short-term':88 'shortag':92 'slep':68 'support':85 'surviv':21,56 'term':84,90 'test':41,57 'three':72 'tomahawk':96 'total':29 'unit':99 'util':62 'white':33 'work':118 'wsmr':37",
				contracts: [],
				obligations: [],
				keywords: [],
				review: {
					id: 239868,
					revProgramElement: '0101122F',
					revBudgetLineItems: '674797',
					serviceAgreeLabel: 'No',
					primaryClassLabel: 'Core AI',
					primaryPlannedTransitionPartner: 'Army',
					servicePTPAgreeLabel: 'Yes',
					reviewStatus: 'Partial Review (Service)',
					servicePOCTitle: 'John',
					servicePOCName: 'Doe',
					servicePOCEmail: 'jdoe@yahoo.com',
					budgetYear: '2022',
					budgetType: 'rdoc',
					primaryReviewStatus: 'Finished Review',
					serviceReviewStatus: 'Partial Review',
					primaryReviewer: 'Allen, Gregory',
					serviceReviewer: 'Chapa, Joseph (Air Force)',
					pocDollarsAttributed: '0.54',
					servicePOCOrg: 'TIAA',
					servicePOCPhoneNumber: '8888675309',
					serviceClassLabel: 'AI Enabled',
					createdAt: '2021-11-10T13:59:28.506Z',
					updatedAt: '2021-12-22T15:45:08.507Z',
					budgetActivityNumber: '07',
					pocAgreeLabel: 'Yes',
					pocPTPAgreeLabel: 'Yes',
					pocMPAgreeLabel: 'Yes',
					appropriationNumber: '3600',
					serviceAgency: 'Air Force (AF)',
					totalBudget: 0,
					primaryReviewerEmail: null,
					serviceReviewerEmail: null,
					serviceSecondaryReviewerEmail: null,
				},
				vendors: [],
			};
			const actual = await target.getProjectData(req, 'Test');
			assert.deepStrictEqual(actual, expected);
			done();
		});

		it('should get the odoc project data for different types PG', async (done) => {
			keywords = keywordData['odoc'];
			review = reviewData['odoc'];

			const req = {
				body: {
					useElasticSearch: false,
					type: 'O&M',
					id: 0,
				},
			};

			const target = new JBookDataHandler(opts);

			const expected = {
				id: 222,
				appropriationNumber: '3400F',
				accountTitle: 'Operation & Maintenance, Air Force',
				serviceAgency: 'Air Force (AF)',
				budgetActivityNumber: '01',
				budgetActivityTitle: 'Operating Forces',
				projectNum: '1F',
				projectTitle: 'Air Operations',
				budgetLineItem: '010',
				programElement: '011A',
				budgetLineItemTitle: 'Primary Combat Forces',
				include_in_toa: 'Y',
				fy_2020_actual: '820,962',
				priorYearAmount: '709,228',
				fy_2021_request: '706,860',
				classification: 'U',
				budgetYear: '2022',
				sag_budget_line_item_title_search: "'combat':2 'forc':3 'primari':1",
				contracts: [],
				obligations: [],
				keywords: [],
				review: {
					id: 259162,
					revProgramElement: '011A',
					revBudgetLineItems: '010',
					primaryClassLabel: 'Unknown',
					primaryPlannedTransitionPartner: 'Unknown',
					serviceAdditionalMissionPartners: 'Unknown',
					reviewStatus: 'Partial Review (Service)',
					budgetYear: '2022',
					budgetType: 'odoc',
					primaryReviewStatus: 'Finished Review',
					serviceReviewStatus: 'Partial Review',
					primaryReviewer: 'Srinivasan, Sridhar',
					serviceReviewer: 'Chapa, Joseph (Air Force)',
					createdAt: '2021-11-10T13:59:29.065Z',
					updatedAt: '2021-11-10T13:59:29.065Z',
					budgetActivityNumber: '01',
					appropriationNumber: '3400F',
					serviceAgency: 'Air Force (AF)',
					totalBudget: 0,
					primaryReviewerEmail: null,
					serviceReviewerEmail: null,
					serviceSecondaryReviewerEmail: null,
				},
				vendors: [],
			};
			const actual = await target.getProjectData(req, 'Test');
			assert.deepStrictEqual(actual, expected);
			done();
		});

		it('should get the pdoc project data for ES', async (done) => {
			review = reviewData['pdoc'];

			const req = {
				body: {
					useElasticSearch: true,
					type: 'Procurement',
					id: 'pdoc#000075#2022#3010#07#Air%20Force%20(AF)',
				},
			};

			const target = new JBookDataHandler(opts);

			const expected = {
				budgetType: 'pdoc',
				key_s: 'pdoc#2022#PB#07#000075#57#N/A#3010',
				currentYearAmount: '979.388',
				priorYearAmount: '1372.337',
				'P40-77_TOA_PY': '1173.314',
				by1BaseYear: '979.388',
				budgetYear: '2022',
				appropriationNumber: '3010',
				appropriationTitle: 'Aircraft Procurement, Air Force',
				budgetActivityNumber: '07',
				budgetActivityTitle: 'Aircraft Supt Equipment & Facilities',
				budgetLineItem: '000075',
				projectTitle: 'Other Production Charges',
				p1LineNumber: '85',
				projectMissionDescription:
					'The Miscellaneous Production Charges program provides for items which are not directly related to other procurement line items in this appropriation, cannot be reasonably allocated and charged to other procurement line items in this appropriation, can be managed as separate end items, may contain certain classified programs, and may be alternate mission equipment, not considered a modification, for out of production systems.\n\nThe major efforts supported in FY 2022 include funding for Electronic Attack pods, towed decoys and associated test equipment; B-2, F-15E, F-15 EPAWSS and F-22 Depot Core Activation, Aerial Targets, Maintenance Support Vehicles or Equipment and the required U.S. contribution for projects defined by the NATO Airborne Early Warning and Control (NAEWC) Board of Directors and approved by the U.S. government.  \n\nThe program has associated Research Development Test and Evaluation funding in PEs 0101113F, 0101127F, 0207040F, 0207171F, 0207134F, 0207138F, 0205219F, 0207249F, 0305116F, 0305220F, 0401119F, 0604735F, 0701212F and 1203001F.',
				'P40-15_Justification':
					'This program, Other Production Charges P-40A Category Uncategorized Item Bomber Armament Tester (BAT), is a new start.\n\nThe major efforts supported in FY 2022 include funding for Electronic Attack pods, towed decoys and associated test equipment; B-2, F-15E and F-22 Depot Core Activation; RQ-4, and Aerial Targets.',
				serviceAgency: 'Air Force (AF)',
				uot_department_s: '57',
				uot_agency_s: 'N/A',
				'P40-13_BSA_Title': 'Other Production Charges',
				org_jbook_desc_s: 'Air Force (AF)',
				org_code_s: 'AF',
				id: 'pdoc#000075#2022#3010#07#Air Force (AF)',
				p40a_aggregated_items_n: [
					{ 'P40a-16_Title_t': 'F-22A' },
					{ 'P40a-16_Title_t': 'F-15E Squadrons' },
					{ 'P40a-16_Title_t': 'RQ-4 UAV' },
					{ 'P40a-16_Title_t': 'Maintenance Support Vehicles or Equipment' },
					{ 'P40a-16_Title_t': 'F-15A/B/C/D Squadrons' },
					{ 'P40a-16_Title_t': 'Supply Depot Operations (Non-IF)' },
					{ 'P40a-16_Title_t': 'PRECISION ATTACK SYSTEMS PROCUREMENT' },
					{ 'P40a-16_Title_t': 'EWIR' },
					{ 'P40a-16_Title_t': 'TRGT' },
					{ 'P40a-16_Title_t': 'MQ-9' },
					{ 'P40a-16_Title_t': 'EW POD' },
					{ 'P40a-16_Title_t': 'CTRE' },
					{ 'P40a-16_Title_t': 'F-15 EPAWSS' },
					{ 'P40a-16_Title_t': 'Service Support to NATO AEWC Program' },
					{ 'P40a-16_Title_t': 'Classified Mods' },
					{ 'P40a-16_Title_t': 'B-2' },
					{ 'P40a-16_Title_t': 'FBLOST' },
					{ 'P40a-16_Title_t': 'C-5 Airlift Squadrons (IF)' },
				],
				keywords: [],
				hasKeywords: false,
				pageHits: [],
				review: {
					id: 233170,
					revBudgetLineItems: '000073',
					serviceAgreeLabel: 'Yes',
					primaryClassLabel: 'Not AI',
					primaryPlannedTransitionPartner: 'Air Force',
					servicePTPAgreeLabel: 'Yes',
					serviceAdditionalMissionPartners: 'Unknown',
					reviewStatus: 'Partial Review (POC)',
					servicePOCTitle: 'Superwoman',
					servicePOCName: 'Elizabeth',
					servicePOCEmail: 'hedrick_elizabeth@bah.com',
					primaryReviewNotes: 'Test Automation Primary Reviewer Notes',
					budgetYear: '2022',
					budgetType: 'pdoc',
					primaryReviewStatus: 'Finished Review',
					serviceReviewStatus: 'Partial Review',
					pocReviewStatus: 'Partial Review',
					primaryReviewer: 'Allen, Gregory',
					serviceReviewer: 'Chapa, Joseph (Air Force)',
					servicePOCOrg: 'Advana',
					servicePOCPhoneNumber: '867-5309',
					createdAt: '2021-11-10T13:59:27.983Z',
					updatedAt: '2022-03-08T03:33:44.950Z',
					budgetActivityNumber: '07',
					pocAgreeLabel: 'No',
					pocClassLabel: 'Not AI',
					pocPTPAgreeLabel: 'Yes',
					pocMPAgreeLabel: 'Yes',
					pocMissionPartnersChecklist: '{}',
					serviceMissionPartnersChecklist: '{}',
					appropriationNumber: '3010F',
					serviceAgency: 'Air Force (AF)',
					totalBudget: 0,
					primaryReviewerEmail: null,
					serviceReviewerEmail: null,
					serviceSecondaryReviewerEmail: null,
				},
			};
			const actual = await target.getProjectData(req, 'Test');
			assert.deepStrictEqual(actual, expected);
			done();
		});

		it('should get the rdoc project data for ES', async (done) => {
			review = reviewData['rdoc'];

			const req = {
				body: {
					useElasticSearch: true,
					type: 'RDT&E',
					id: 'rdoc#0101122F#674797#2022#3600#07#Air%20Force%20(AF)',
				},
			};

			const target = new JBookDataHandler(opts);

			const expected = {
				budgetType: 'pdoc',
				key_s: 'pdoc#2022#PB#07#000075#57#N/A#3010',
				currentYearAmount: '979.388',
				priorYearAmount: '1372.337',
				'P40-77_TOA_PY': '1173.314',
				by1BaseYear: '979.388',
				budgetYear: '2022',
				appropriationNumber: '3010',
				appropriationTitle: 'Aircraft Procurement, Air Force',
				budgetActivityNumber: '07',
				budgetActivityTitle: 'Aircraft Supt Equipment & Facilities',
				budgetLineItem: '000075',
				projectTitle: 'Other Production Charges',
				p1LineNumber: '85',
				projectMissionDescription:
					'The Miscellaneous Production Charges program provides for items which are not directly related to other procurement line items in this appropriation, cannot be reasonably allocated and charged to other procurement line items in this appropriation, can be managed as separate end items, may contain certain classified programs, and may be alternate mission equipment, not considered a modification, for out of production systems.\n\nThe major efforts supported in FY 2022 include funding for Electronic Attack pods, towed decoys and associated test equipment; B-2, F-15E, F-15 EPAWSS and F-22 Depot Core Activation, Aerial Targets, Maintenance Support Vehicles or Equipment and the required U.S. contribution for projects defined by the NATO Airborne Early Warning and Control (NAEWC) Board of Directors and approved by the U.S. government.  \n\nThe program has associated Research Development Test and Evaluation funding in PEs 0101113F, 0101127F, 0207040F, 0207171F, 0207134F, 0207138F, 0205219F, 0207249F, 0305116F, 0305220F, 0401119F, 0604735F, 0701212F and 1203001F.',
				'P40-15_Justification':
					'This program, Other Production Charges P-40A Category Uncategorized Item Bomber Armament Tester (BAT), is a new start.\n\nThe major efforts supported in FY 2022 include funding for Electronic Attack pods, towed decoys and associated test equipment; B-2, F-15E and F-22 Depot Core Activation; RQ-4, and Aerial Targets.',
				serviceAgency: 'Air Force (AF)',
				uot_department_s: '57',
				uot_agency_s: 'N/A',
				'P40-13_BSA_Title': 'Other Production Charges',
				org_jbook_desc_s: 'Air Force (AF)',
				org_code_s: 'AF',
				id: 'pdoc#000075#2022#3010#07#Air Force (AF)',
				p40a_aggregated_items_n: [
					{ 'P40a-16_Title_t': 'F-22A' },
					{ 'P40a-16_Title_t': 'F-15E Squadrons' },
					{ 'P40a-16_Title_t': 'RQ-4 UAV' },
					{ 'P40a-16_Title_t': 'Maintenance Support Vehicles or Equipment' },
					{ 'P40a-16_Title_t': 'F-15A/B/C/D Squadrons' },
					{ 'P40a-16_Title_t': 'Supply Depot Operations (Non-IF)' },
					{ 'P40a-16_Title_t': 'PRECISION ATTACK SYSTEMS PROCUREMENT' },
					{ 'P40a-16_Title_t': 'EWIR' },
					{ 'P40a-16_Title_t': 'TRGT' },
					{ 'P40a-16_Title_t': 'MQ-9' },
					{ 'P40a-16_Title_t': 'EW POD' },
					{ 'P40a-16_Title_t': 'CTRE' },
					{ 'P40a-16_Title_t': 'F-15 EPAWSS' },
					{ 'P40a-16_Title_t': 'Service Support to NATO AEWC Program' },
					{ 'P40a-16_Title_t': 'Classified Mods' },
					{ 'P40a-16_Title_t': 'B-2' },
					{ 'P40a-16_Title_t': 'FBLOST' },
					{ 'P40a-16_Title_t': 'C-5 Airlift Squadrons (IF)' },
				],
				keywords: [],
				hasKeywords: false,
				pageHits: [],
				review: {
					id: 239868,
					revProgramElement: '0101122F',
					revBudgetLineItems: '674797',
					serviceAgreeLabel: 'No',
					primaryClassLabel: 'Core AI',
					primaryPlannedTransitionPartner: 'Army',
					servicePTPAgreeLabel: 'Yes',
					reviewStatus: 'Partial Review (Service)',
					servicePOCTitle: 'John',
					servicePOCName: 'Doe',
					servicePOCEmail: 'jdoe@yahoo.com',
					budgetYear: '2022',
					budgetType: 'rdoc',
					primaryReviewStatus: 'Finished Review',
					serviceReviewStatus: 'Partial Review',
					primaryReviewer: 'Allen, Gregory',
					serviceReviewer: 'Chapa, Joseph (Air Force)',
					pocDollarsAttributed: '0.54',
					servicePOCOrg: 'TIAA',
					servicePOCPhoneNumber: '8888675309',
					serviceClassLabel: 'AI Enabled',
					createdAt: '2021-11-10T13:59:28.506Z',
					updatedAt: '2021-12-22T15:45:08.507Z',
					budgetActivityNumber: '07',
					pocAgreeLabel: 'Yes',
					pocPTPAgreeLabel: 'Yes',
					pocMPAgreeLabel: 'Yes',
					appropriationNumber: '3600',
					serviceAgency: 'Air Force (AF)',
					totalBudget: 0,
					primaryReviewerEmail: null,
					serviceReviewerEmail: null,
					serviceSecondaryReviewerEmail: null,
				},
			};
			const actual = await target.getProjectData(req, 'Test');
			assert.deepStrictEqual(actual, expected);
			done();
		});

		it('should get the odoc project data for ES', async (done) => {
			review = reviewData['odoc'];

			const req = {
				body: {
					useElasticSearch: true,
					type: 'O&M',
					id: 'odoc#120#132#2022#2020A#01Army',
				},
			};

			const target = new JBookDataHandler(opts);

			const expected = {
				budgetType: 'pdoc',
				key_s: 'pdoc#2022#PB#07#000075#57#N/A#3010',
				currentYearAmount: '979.388',
				priorYearAmount: '1372.337',
				'P40-77_TOA_PY': '1173.314',
				by1BaseYear: '979.388',
				budgetYear: '2022',
				appropriationNumber: '3010',
				appropriationTitle: 'Aircraft Procurement, Air Force',
				budgetActivityNumber: '07',
				budgetActivityTitle: 'Aircraft Supt Equipment & Facilities',
				budgetLineItem: '000075',
				projectTitle: 'Other Production Charges',
				p1LineNumber: '85',
				projectMissionDescription:
					'The Miscellaneous Production Charges program provides for items which are not directly related to other procurement line items in this appropriation, cannot be reasonably allocated and charged to other procurement line items in this appropriation, can be managed as separate end items, may contain certain classified programs, and may be alternate mission equipment, not considered a modification, for out of production systems.\n\nThe major efforts supported in FY 2022 include funding for Electronic Attack pods, towed decoys and associated test equipment; B-2, F-15E, F-15 EPAWSS and F-22 Depot Core Activation, Aerial Targets, Maintenance Support Vehicles or Equipment and the required U.S. contribution for projects defined by the NATO Airborne Early Warning and Control (NAEWC) Board of Directors and approved by the U.S. government.  \n\nThe program has associated Research Development Test and Evaluation funding in PEs 0101113F, 0101127F, 0207040F, 0207171F, 0207134F, 0207138F, 0205219F, 0207249F, 0305116F, 0305220F, 0401119F, 0604735F, 0701212F and 1203001F.',
				'P40-15_Justification':
					'This program, Other Production Charges P-40A Category Uncategorized Item Bomber Armament Tester (BAT), is a new start.\n\nThe major efforts supported in FY 2022 include funding for Electronic Attack pods, towed decoys and associated test equipment; B-2, F-15E and F-22 Depot Core Activation; RQ-4, and Aerial Targets.',
				serviceAgency: 'Air Force (AF)',
				uot_department_s: '57',
				uot_agency_s: 'N/A',
				'P40-13_BSA_Title': 'Other Production Charges',
				org_jbook_desc_s: 'Air Force (AF)',
				org_code_s: 'AF',
				id: 'pdoc#000075#2022#3010#07#Air Force (AF)',
				p40a_aggregated_items_n: [
					{ 'P40a-16_Title_t': 'F-22A' },
					{ 'P40a-16_Title_t': 'F-15E Squadrons' },
					{ 'P40a-16_Title_t': 'RQ-4 UAV' },
					{ 'P40a-16_Title_t': 'Maintenance Support Vehicles or Equipment' },
					{ 'P40a-16_Title_t': 'F-15A/B/C/D Squadrons' },
					{ 'P40a-16_Title_t': 'Supply Depot Operations (Non-IF)' },
					{ 'P40a-16_Title_t': 'PRECISION ATTACK SYSTEMS PROCUREMENT' },
					{ 'P40a-16_Title_t': 'EWIR' },
					{ 'P40a-16_Title_t': 'TRGT' },
					{ 'P40a-16_Title_t': 'MQ-9' },
					{ 'P40a-16_Title_t': 'EW POD' },
					{ 'P40a-16_Title_t': 'CTRE' },
					{ 'P40a-16_Title_t': 'F-15 EPAWSS' },
					{ 'P40a-16_Title_t': 'Service Support to NATO AEWC Program' },
					{ 'P40a-16_Title_t': 'Classified Mods' },
					{ 'P40a-16_Title_t': 'B-2' },
					{ 'P40a-16_Title_t': 'FBLOST' },
					{ 'P40a-16_Title_t': 'C-5 Airlift Squadrons (IF)' },
				],
				keywords: [],
				hasKeywords: false,
				pageHits: [],
				review: {
					id: 259162,
					revProgramElement: '011A',
					revBudgetLineItems: '010',
					primaryClassLabel: 'Unknown',
					primaryPlannedTransitionPartner: 'Unknown',
					serviceAdditionalMissionPartners: 'Unknown',
					reviewStatus: 'Partial Review (Service)',
					budgetYear: '2022',
					budgetType: 'odoc',
					primaryReviewStatus: 'Finished Review',
					serviceReviewStatus: 'Partial Review',
					primaryReviewer: 'Srinivasan, Sridhar',
					serviceReviewer: 'Chapa, Joseph (Air Force)',
					createdAt: '2021-11-10T13:59:29.065Z',
					updatedAt: '2021-11-10T13:59:29.065Z',
					budgetActivityNumber: '01',
					appropriationNumber: '3400F',
					serviceAgency: 'Air Force (AF)',
					totalBudget: 0,
					primaryReviewerEmail: null,
					serviceReviewerEmail: null,
					serviceSecondaryReviewerEmail: null,
				},
			};
			const actual = await target.getProjectData(req, 'Test');
			assert.deepStrictEqual(actual, expected);
			done();
		});

		it('should utilize the portfolio APIs (create, delete, get all, get one, restore', async (done) => {
			const req = {
				body: {
					name: 'AI',
					id: 1,
				},
			};

			const target = new JBookDataHandler(opts);

			const expectedGetOne = {
				id: 1,
				name: 'AI Inventory',
				description: 'AI Inventory portfolio description',
				user_ids: [],
				tags: [],
				deleted: false,
			};

			const expectedGetAll = [
				{
					id: 1,
					name: 'AI Inventory',
					description: 'AI Inventory portfolio description',
					user_ids: [],
					tags: [],
					deleted: false,
				},
			];

			const expectedDelete = {
				deleted: true,
			};

			const expectedRestored = {
				deleted: false,
			};

			const expectedEdit = {
				name: 'AI',
				description: undefined,
				user_ids: undefined,
				tags: undefined,
			};

			const actualGetOne = await target.getPortfolio(req, 'Test');
			const actualGetAll = await target.getPortfolios(req, 'Test');
			const actualDelete = await target.deletePortfolio(req, 'Test');
			const actualRestored = await target.restorePortfolio(req, 'Test');
			const actualEdit = await target.editPortfolio(req, 'Test');

			assert.deepStrictEqual(actualGetOne, expectedGetOne);
			assert.deepStrictEqual(actualGetAll, expectedGetAll);
			assert.deepStrictEqual(actualDelete, expectedDelete);
			assert.deepStrictEqual(actualRestored, expectedRestored);
			assert.deepStrictEqual(actualEdit, expectedEdit);

			done();
		});
	});
});
