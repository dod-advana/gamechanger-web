const assert = require('assert');
const { SearchController } = require('../../node_app/controllers/searchController');
const { constructorOptionsMock, reqMock, resMock } = require('../resources/testUtility');

const documentSearchRes = require('../resources/mockResponses/documentSearchRes.js');
const documentSearchES = require('../resources/mockResponses/documentSearchES.json');
const documentSearchSentenceTransformer = require('../resources/mockResponses/documentSearchSentenceTransformer.js');
const docSearchOneID = require('../resources/mockResponses/documentSearchOneID.json');


describe('searchController', function () {

	describe('#documentSearch()', () => {
		it('should run a document search and return results', async (done) => {
			const apiResMock = {
				body: {
					took: 15,
					timed_out: false,
					_shards: {total: 3, successful: 3, skipped: 0, failed: 0},
					hits: {
						total: {value: 7, relation: 'eq'}, max_score: 21.728004, hits: [{
							_index: 'gamechanger_20210222_reparse',
							_type: '_doc',
							_id: 'bf167feb8487840cd3c09bfbabae7678ac5ecd63ecfbff6ba283bc930610f060',
							_score: 21.728004,
							_source: {
								kw_doc_score_r: 0.00001,
								topics_rs: {
									materiel: 0.3257879940901964,
									'radio frequency': 0.1354190539012385,
									product: 0.13086532897744582,
									'supply chain': 0.6074890500744484,
									'weapon system': 0.13747354009340412
								},
								orgs_rs: {},
								pagerank_r: 0.00001
							},
							fields: {
								display_title_s: ['DoDM 4140.01 DoD Supply Chain Materiel Management Procedures: Supporting Technologies'],
								display_org_s: ['Dept. of Defense'],
								crawler_used_s: ['dod_issuances'],
								doc_num: ['4140.01'],
								summary_30: ['procedures for the technologies supporting DoD supply chain materiel management. Develop and execute a supply chain data management strategy that promotes the use DoD SUPPLY CHAIN MATERIEL MANAGEMENT SYSTEMS .'],
								is_revoked_b: [false],
								doc_type: ['DoDM'],
								type: ['document'],
								title: ['DoD Supply Chain Materiel Management Procedures: Supporting Technologies'],
								keyw_5: ['dod components', 'weapon system', 'materiel readiness', 'dodm 01-v7', 'volumes 1-15', 'unique character', 'technology', 'technical data', 'supply management', 'standardized data'],
								filename: ['DoDM 4140.01 Volume 7 CH 2.pdf'],
								id: ['DoDM 4140.01 Volume 7 CH 2.pdf_0'],
								display_doc_type_s: ['Manual'],
								ref_list: ['DoD 4140.1-R', 'DoD 7000.14-R', 'DoDD 5134.12', 'DoDI 4140.01', 'DoDI 8500.01', 'DoDI 5200.44', 'DoDI 5000.02', 'DoDM 4140.01-V7'],
								page_count: [17]
							},
							inner_hits: {
								paragraphs: {
									hits: {
										total: {value: 1, relation: 'eq'},
										max_score: 17.864853,
										hits: [{
											_index: 'gamechanger_20210222_reparse',
											_type: '_doc',
											_id: 'bf167feb8487840cd3c09bfbabae7678ac5ecd63ecfbff6ba283bc930610f060',
											_nested: {field: 'paragraphs', offset: 131},
											_score: 17.864853,
											fields: {
												'paragraphs.page_num_i': [10],
												'paragraphs.filename': ['DoDM 4140.01 Volume 7 CH 2.pdf'],
												'paragraphs.par_raw_text_t': ['( 2 ) Train employees to use RBS tools , simulation models , mathematical algorithms , expert systems , artificial intelligence techniques , spreadsheets , statistical packages , and statistical sampling .']
											},
											highlight: {'paragraphs.par_raw_text_t': ['( 2 ) Train employees to use RBS tools , simulation models , mathematical algorithms , expert systems , <em>artificial</em> <em>intelligence</em> techniques , spreadsheets , statistical packages , and']}
										}]
									}
								}
							}
						}, {
							_index: 'gamechanger_20210222_reparse',
							_type: '_doc',
							_id: '94023c6ab4f5fe297d84c6b856c3ac2d11263d405199ac306dd647388edda54b',
							_score: 16.463419,
							_source: {
								kw_doc_score_r: null,
								topics_rs: {
									analyses: 0.18861515356230701,
									predictive: 0.19986354908576998,
									sustainment: 0.2939625669206762,
									cycle: 0.3954776108384908,
									maintenance: 0.24745320000296614
								},
								orgs_rs: {
									'Military Service': 4,
									'the Department of Defense': 3,
									'the Military Services': 4,
									'Defense for Research and Engineering': 2,
									'the Joint Chiefs of Staff': 1,
									'the Military Service': 1,
									'Defense for Acquisition and Sustainment': 3,
									'OSD the Military Departments': 1,
									'Department of Defense': 9
								},
								pagerank_r: 0.00008915588304913433
							},
							fields: {
								display_title_s: ['DoDI 4151.22 Condition-Based Maintenance Plus for Materiel Maintenance'],
								display_org_s: ['Dept. of Defense'],
								crawler_used_s: ['dod_issuances'],
								doc_num: ['4151.22'],
								summary_30: ['Achieve materiel availability, reliability, safety, and life-cycle sustainment cost goals set Life-cycle managers will accept and adopt CBM+ as the DoD strategy to sustain weapon achieve CBM+ policy objectives, Service-level organizations and life-cycle program managers'],
								is_revoked_b: [false],
								doc_type: ['DoDI'],
								type: ['document'],
								title: ['Condition-Based Maintenance Plus for Materiel Maintenance'],
								keyw_5: ['weapon system', 'sustainment operations', 'life-cycle managers', 'life cycle', 'dodi 22', 'weapon systems', 'technology programs', 'system based', 'sustainment effective', 'sustain cbm+'],
								filename: ['DoDI 4151.22.pdf'],
								id: ['DoDI 4151.22.pdf_0'],
								display_doc_type_s: ['Instruction'],
								ref_list: ['DoD 4151.22-M', 'DoDD 5135.02', 'DoDD 4151.18', 'DoDD 5010.42', 'DoDI 4151.22', 'DoDI 5000.02', 'DoDI 4151.19', 'DoDI 8320.04', 'DoDI 8500.01', 'DoDM 4151.22'],
								page_count: [16]
							},
							inner_hits: {
								paragraphs: {
									hits: {
										total: {value: 1, relation: 'eq'},
										max_score: 13.911304,
										hits: [{
											_index: 'gamechanger_20210222_reparse',
											_type: '_doc',
											_id: '94023c6ab4f5fe297d84c6b856c3ac2d11263d405199ac306dd647388edda54b',
											_nested: {field: 'paragraphs', offset: 40},
											_score: 13.911304,
											fields: {
												'paragraphs.page_num_i': [13],
												'paragraphs.filename': ['DoDI 4151.22.pdf'],
												'paragraphs.par_raw_text_t': ['CBM + tools and technologies .The complement of tools and technologies used as enabling capabilities needed to execute CBM + strategies and plans .Examples of these tools and technologies include but are not limited to : embedded sensors , data aggregation and storage capabilities , automatic identification technologies , portable maintenance aids , integrated information systems , artificial intelligence and machine learning , and automated test equipment .']
											},
											highlight: {'paragraphs.par_raw_text_t': ['<em>intelligence</em> and machine learning , and automated test equipment .']}
										}]
									}
								}
							}
						}, {
							_index: 'gamechanger_20210222_reparse',
							_type: '_doc',
							_id: 'f50f630bb7b822fef9ebf1bd18e4031b055ba64bb0de8b39c8406f01b4b59dba',
							_score: 15.811372,
							_source: {
								kw_doc_score_r: null,
								topics_rs: {
									'research engineering': 0.21326264000554895,
									defense: 0.23376850504283628,
									prototyping: 0.15739112231290311,
									coordinates: 0.15591491503068605,
									technology: 0.21462528454064458
								},
								orgs_rs: {
									'the Department of Defense': 32,
									Congress: 2,
									'Defense for Acquisition Technology and Logistics': 1,
									Congressional: 1,
									'U.S.C.': 12,
									'Defense for Acquisition and Sustainment': 1,
									'Military Department': 2,
									USDAS: 22,
									'the Office of Management and Budget': 2,
									Treasury: 1,
									'Department of Defense': 36,
									Defense: 36,
									Department: 7,
									Senate: 1,
									Navy: 1,
									'Defense for Research and Engineering': 2,
									State: 2,
									'the Federal Register': 3,
									'the Joint Chiefs of Staff': 6,
									'Marine Corps': 2
								},
								pagerank_r: 0.00003828706120020545
							},
							fields: {
								display_title_s: ['DoDD 5137.02 Under Secretary Of Defense For Research And Engineering (USD(R&E))'],
								display_org_s: ['Dept. of Defense'],
								crawler_used_s: ['test'],
								doc_num: ['5137.02'],
								summary_30: ['Defense, to promulgate DoD policy within the responsibilities, functions, and authorities assigned in this Leads the DoD, in coordination with the USD, in mission engineering policy,'],
								is_revoked_b: [false],
								doc_type: ['DoDD'],
								type: ['document'],
								title: ['Under Secretary Of Defense For Research And Engineering (USD(R&E))'],
								keyw_5: ['information technology', 'dod issuances', 'dod cio', 'transaction agreements', 'training considerations', 'training capabilities', 'technical risk', 'strategic guidance', 'strategic direction', 'public releas'],
								filename: ['DoDD 5137.02.pdf'],
								id: ['DoDD 5137.02.pdf_0'],
								display_doc_type_s: ['Directive'],
								ref_list: ['DoD 7000.14', 'DoD 7000.14-R', 'DoDD 5137.02', 'DoDD 5135.02', 'DoDD 5134.01', 'DoDD 5230.11', 'DoDD 5205.07', 'DoDD 5101.01', 'DoDD 5100.01', 'DoDI 3204.01', 'DoDI 3216.02', 'DoDI 1025.09', 'DoDI 5025.01', 'DoDI 8910.01', 'DoDI 4000.19', 'DoDI 5200.01', 'DoDM 5200.01', 'DoDM 5200.01, Volume 3', 'AI 102', 'Title 10', 'Title 5', 'Title 32', 'Title 45', 'Title 35', 'Executive Order 13891', 'Executive Order 13526', 'Executive Order 10789'],
								page_count: [25]
							},
							inner_hits: {
								paragraphs: {
									hits: {
										total: {value: 2, relation: 'eq'},
										max_score: 20.340439,
										hits: [{
											_index: 'gamechanger_20210222_reparse',
											_type: '_doc',
											_id: 'f50f630bb7b822fef9ebf1bd18e4031b055ba64bb0de8b39c8406f01b4b59dba',
											_nested: {field: 'paragraphs', offset: 32},
											_score: 20.340439,
											fields: {
												'paragraphs.page_num_i': [20],
												'paragraphs.filename': ['DoDD 5137.02.pdf'],
												'paragraphs.par_raw_text_t': ['ACAT Acquisition Category AI artificial intelligence ']
											},
											highlight: {'paragraphs.par_raw_text_t': ['ACAT Acquisition Category AI <em>artificial</em> <em>intelligence</em>']}
										}, {
											_index: 'gamechanger_20210222_reparse',
											_type: '_doc',
											_id: 'f50f630bb7b822fef9ebf1bd18e4031b055ba64bb0de8b39c8406f01b4b59dba',
											_nested: {field: 'paragraphs', offset: 13},
											_score: 4.2742863,
											fields: {
												'paragraphs.page_num_i': [3],
												'paragraphs.filename': ['DoDD 5137.02.pdf'],
												'paragraphs.par_raw_text_t': ['Do DD 5137.02 , July 15 , 2020 SECTION 2 : RESPONSIBILITIES AND FUNCTIONS 4 SECTION 2 : RESPONSIBILITIES AND FUNCTIONS The USD ( R&E ) is the PSA and advisor to the Secretary and Deputy Secretary of Defense for all matters regarding the Do D Research and Engineering ( R&E ) Enterprise , defense R&E , technology development , technology transition , developmental prototyping , experimentation , and developmental testing activities and programs , and unifying defense R&E efforts across the Do D .In the exercise of assigned responsibilities , the USD ( R&E ) : a .Serves as the Chief Technology Officer of the Do D with the mission of advancing technology and innovation .Advises the Secretary of Defense on all matters related to research ; engineering ; manufacturing ; developmental test and evaluation ; and technology development , innovation , and protection activities and programs in the Do D and occurring internationally .Establishes priorities across those matters to ensure conformance with Secretary of Defense policy and guidance . b .Provides technical leadership and oversight , establishes strategic priorities , issues guidance , and acts as the senior responsible official for the supervision of all programs and activities pertaining to the USD ( R&E ) whether derived from statute , or assigned at the discretion of the Secretary or Deputy Secretary of Defense .Ensures alignment of policies and priorities with Secretary of Defense policy and guidance . c .Establishes policies and strategic guidance and leads defense research ; engineering ; developmental prototyping and experimentation ; technology development , exploitation , transition , and transfer ; developmental test and evaluation ; and manufacturing technology activities , including operation of the Do D Manufacturing Innovation Institutes ; and microelectronics activities across the Do D Components .Initial areas of strategic leadership include the development or modernization of microelectronics , directed energy , hypersonics , fifth generation ( 5G ) and next generation wireless networks ( 5G to next generation ) , artificial intelligence ( AI ) /machine learning , biotechnology , space autonomy , fully networked command , control , and communications ( FNC3 ) , cyber , and quantum science .These areas may change over time at the discretion of the USD ( R&E ) . d .Leads prototyping initiatives to advance innovative or novel technology development , drive down technical and integration risk , and/or demonstrate new capability .Advises the USD ( A&S ) on prototypes that transition to or support acquisition pathways .This includes establishing Defense Program Planning guidance on the allocation of resources within areas of the USD ( R&E ) authorities . e .In coordination with other appropriate PSAs and Do D Component heads , leads the Department ’s strategy to address 5G challenges and opportunities . f .In coordination with the Secretary , and informed by the National Defense Strategy , identifies and defines the Department ’s modernization priorities .Establishes timelines for delivery of desired future capabilities , and develops Department wide roadmaps for research and engineering investments in these priority areas .Serves as the Department ’s primary representative and spokesperson for the modernization priority areas , both within the Department and to government , industrial , and academic stakeholders .Coordinates research ']
											},
											highlight: {'paragraphs.par_raw_text_t': ['<em>intelligence</em> ( AI ) /machine learning , biotechnology , space autonomy , fully networked command , control , and communications ( FNC3 ) , cyber , and quantum science .These areas']}
										}]
									}
								}
							}
						}, {
							_index: 'gamechanger_20210222_reparse',
							_type: '_doc',
							_id: '85ebc56f6fddf86fb2e35f343a3812a51e1d6612421cfaa781e0ef5188267fac',
							_score: 12.188069,
							_source: {
								kw_doc_score_r: null,
								topics_rs: {
									defense: 0.15920977488119237,
									'component heads': 0.1521435923715195,
									acquisition: 0.4475523147381988,
									cycle: 0.18981473911938093,
									cybersecurity: 0.14784016872545486
								},
								orgs_rs: {
									'the Department of Defense': 4,
									Congress: 1,
									Congressional: 2,
									'U.S.C.': 2,
									'Defense for Acquisition and Sustainment': 1,
									MDA: 7,
									'Military Department': 1,
									USDAS: 1,
									'Department of Defense': 10,
									USDATL: 4,
									Defense: 2,
									Department: 1,
									'Defense for Research and Engineering': 1,
									'the Joint Chiefs of Staff': 5
								},
								pagerank_r: 0.0011815126774833208
							},
							fields: {
								display_title_s: ['DoDD 5000.01 The Defense Acquisition System'],
								display_org_s: ['Dept. of Defense'],
								crawler_used_s: ['test'],
								doc_num: ['5000.01'],
								summary_30: ['Acquisition programs will be managed consistent with statute, the policy outlined in DoD Component heads, including the Directors of the Defense Agencies with acquisition DoD Directive 5135.02, Under Secretary of Defense for Acquisition and Sustainment'],
								is_revoked_b: [false],
								doc_type: ['DoDD'],
								type: ['document'],
								title: ['The Defense Acquisition System'],
								keyw_5: ['united states', 'support metrics', 'study guidance', 'september 9', 'responsibilities assigned', 'requirements management', 'realistic projections', 'program evaluation', 'product support', 'plans related'],
								filename: ['DoDD 5000.01.pdf'],
								id: ['DoDD 5000.01.pdf_0'],
								display_doc_type_s: ['Directive'],
								ref_list: ['DoDD 5000.01', 'DoDD 2060.01', 'DoDD 5135.02', 'DoDD 5137.02', 'DoDD 5143.01', 'DoDD 1322.18', 'DoDD 5124.02', 'DoDD 5105.82', 'DoDD 5144.02', 'DoDD 5141.02', 'DoDD 5105.84', 'DoDI 5015.02', 'DoDI 8500.01', 'Title 10', 'Title 44'],
								page_count: [16]
							},
							inner_hits: {
								paragraphs: {
									hits: {
										total: {value: 2, relation: 'eq'}, max_score: 9.591558, hits: [{
											_index: 'gamechanger_20210222_reparse',
											_type: '_doc',
											_id: '85ebc56f6fddf86fb2e35f343a3812a51e1d6612421cfaa781e0ef5188267fac',
											_nested: {field: 'paragraphs', offset: 25},
											_score: 9.591558,
											fields: {
												'paragraphs.page_num_i': [7],
												'paragraphs.filename': ['DoDD 5000.01.pdf'],
												'paragraphs.par_raw_text_t': ['SECTION 1 : GENERAL ISSUANCE INFORMATION 8 ( c ) Facilitate integration into fielded forces .( d ) Confirm performance against documented capability needs and adversary capabilities as described in the system threat assessment . p .Apply Human Systems Integration .Human systems integration planning will begin in the early stages of the program life cycle .The goal will be to optimize total system performance and total ownership costs , while ensuring that the system is designed , operated , and maintained consistent with mission requirements . q .Deploy Interoperable Systems .Joint concepts , standardization , and integrated architectures will be used to the maximum extent possible to characterize the exchange of data , information , materiel , and services to and from systems , units , and platforms to assure all systems effectively and securely interoperate with other U.S . forces and coalition partner systems . r .Plan for Corrosion Prevention and Mitigation .Acquisition managers will implement corrosion prevention and control procedures early in the program life cycle to prevent it from impacting the availability , cost , and safety of military equipment . s .Employ Artificial Intelligence , Machine Learning , Deep Learning , and Other Related Capabilities throughout Execution of the Acquisition Process .To ensure a culture of performance that yields a decisive and sustained U.S . military advantage , the acquisition system will leverage capabilities including artificial intelligence , machine learning , and deep learning to maximize efficiency and streamline the acquisition of goods and services . t .Plan for Coalition Partners .To enable allies and partners to enhance U.S . military capability , collaboration opportunities , potential partnerships , and international acquisition and exportability features and limitations will be considered in the early design and development phase of acquisition programs . u .Maintain a Professional Workforce .The acquisition workforce is a critical asset and essential to achieving the defense strategy .Consequently , the Do D must recruit , develop , and maintain a fully proficient military and civilian acquisition workforce that is highly skilled across a broad range of management , technical , and business disciplines .']
											},
											highlight: {'paragraphs.par_raw_text_t': ['and sustained U.S . military advantage , the acquisition system will leverage capabilities including <em>artificial</em> <em>intelligence</em> , machine learning , and deep learning to maximize efficiency']}
										}, {
											_index: 'gamechanger_20210222_reparse',
											_type: '_doc',
											_id: '85ebc56f6fddf86fb2e35f343a3812a51e1d6612421cfaa781e0ef5188267fac',
											_nested: {field: 'paragraphs', offset: 11},
											_score: 7.1795564,
											fields: {
												'paragraphs.page_num_i': [1],
												'paragraphs.filename': ['DoDD 5000.01.pdf'],
												'paragraphs.par_raw_text_t': ['SECTION 1 : GENERAL ISSUANCE INFORMATION .............................................................................. 4 1.1 . Applicability ..................................................................................................................... 4 1.2 . Policy ................................................................................................................................ 4 a .Deliver Performance at the Speed of Relevance ............................................................ 4 b .Conduct System of Systems ( So S ) Analysis ................................................................. 4 c .Develop a Culture of Innovation .................................................................................... 5 d .Develop and Deliver Secure Capabilities ...................................................................... 5 e .Emphasize Competition ................................................................................................. 5 f .Be Responsive ................................................................................................................ 5 g .Employ a Disciplined Approach .................................................................................... 5 h .Manage Efficiently and Effectively ............................................................................... 6 i .Focus on Affordability .................................................................................................... 6 j .Emphasize Environment , Safety , and Occupational Health ( ESOH ) and Requirements Management .................................................................................................................. 6 k .Employ Performance Based Acquisition Strategies ...................................................... 7 l .Plan for Product Support ... . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .7 m .Implement Effective Life Cycle Management ............................................................. 7 n .Implement Reliability and Maintainability by Design ................................................... 7 o .Conduct Integrated Test and Evaluation ........................................................................ 7 p .Apply Human Systems Integration ................................................................................ 8 q .Deploy Interoperable Systems ....................................................................................... 8 r .Plan for Corrosion Prevention and Mitigation ............................................................... 8 s .Employ Artificial Intelligence , Machine Learning , Deep Learning , and Other Related Capabilities throughout Execution of the Acquisition Process ... . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .8 t .Plan for Coalition Partners .............................................................................................. 8 u .Maintain a Professional Workforce ............................................................................... 8 v .Comply with Statute and International Agreements ...................................................... 9 w .Maintain Data Transparency ......................................................................................... 9 x .Manage Records Effectively .......................................................................................... 9 y .Employ a Collaborative Process .................................................................................... 9 SECTION 2 : RESPONSIBILITIES ....................................................................................................... 10 2.1 . Under Secretary of Defense for Acquisition and Sustainment ( USD ( A&S ) ) . . . . . . . . . . . . . . . . .10 2.2 . Under Secretary of Defense for Research and Engineering ( USD ( R&E ) ) ..................... 10 2.3 . Under Secretary of Defense for Intelligence and Security ( USD ( I&S ) ) ........................ 11 2.4 . Under Secretary of Defense for Personnel and Readiness ( USD ( P&R ) ) ....................... 11 2.5 . Chief Management Officer ( CMO ) of the Do D . ............................................................ 11 2.6 . Do D Chief Information Officer ...................................................................................... 12 2.7 . Director of Operational Test and Evaluation ( DOT&E ) ................................................. 12 2.8 . Director of Cost Assessment and Program Evaluation ................................................... 13 2.9 . Do D Component Heads .................................................................................................. 13 2.10 . CJCS ............................................................................................................................. 14 GLOSSARY ..................................................................................................................................... 15 G.1 . Acronyms ....................................................................................................................... 15 ']
											},
											highlight: {'paragraphs.par_raw_text_t': ['Under Secretary of Defense for <em>Intelligence</em> and Security ( USD ( I&S ) ) ........................ 11 2.4 .']}
										}]
									}
								}
							}
						}, {
							_index: 'gamechanger_20210222_reparse',
							_type: '_doc',
							_id: '1d1ba262679c79f43623166f80c8b0267261efdbb95255fe9b29489c9d8a03f5',
							_score: 10.615261,
							_source: {
								kw_doc_score_r: null,
								topics_rs: {
									instruction: 0.14632901438745843,
									pathways: 0.15141678750916907,
									information: 0.13839879235098432,
									acquisition: 0.4579656566656491,
									cybersecurity: 0.23212277113317983
								},
								orgs_rs: {
									'the Department of Defense': 22,
									Congressional: 1,
									'U.S.C.': 9,
									'Defense for Research and Engineering': 1,
									'the Joint Chiefs of Staff': 1,
									'the Federal Government': 1,
									'Defense for Intelligence': 1,
									MDA: 12,
									'OSD the Military Departments': 1,
									USDAS: 7,
									'Department of Defense': 16,
									Defense: 1
								},
								pagerank_r: 0.0000385929621105985
							},
							fields: {
								display_title_s: ['DoDI 5000.82 Acquisition of Information Technology'],
								display_org_s: ['Dept. of Defense'],
								crawler_used_s: ['dod_issuances'],
								doc_num: ['5000.82'],
								summary_30: ['PMs in Defense Intelligence Components ensure that IT acquisitions for systems that process DoD Instruction 5000.74, Defense Acquisition of Services, January 10, 2020, as amended DoD Instruction 8580.1, Information Assurance in the Defense Acquisition System,'],
								is_revoked_b: [false],
								doc_type: ['DoDI'],
								type: ['document'],
								title: ['Acquisition of Information Technology'],
								keyw_5: ['dod cio', 'information technology', 'dod component', '“defense acquisition', 'waveform management', 'urgent operational', 'united states', 'term reflects', 'solution architecture', 'records contained'],
								filename: ['DoDI 5000.82.pdf'],
								id: ['DoDI 5000.82.pdf_0'],
								display_doc_type_s: ['Instruction'],
								ref_list: ['DoD 5400.11-R', 'DoDD 5144.02', 'DoDD 5000.01', 'DoDD 4650.05', 'DoDD 8470.01E', 'DoDD 8000.01', 'DoDI 5000.82', 'DoDI 5000.02', 'DoDI 8310.01', 'DoDI 5000.74', 'DoDI 4151.20', 'DoDI 5000.81', 'DoDI 4630.09', 'DoDI 4650.01', 'DoDI 4650.08', 'DoDI 8500.01', 'DoDI 8510.01', 'DoDI 8580.1', 'DoDI 5200.44', 'DoDI 8582.01', 'DoDI 5200.01', 'DoDI 5400.11', 'DoDI 5400.16', 'DoDI 8170.01', 'DoDI 3200.12', 'DoDI 5015.02', 'DoDI 8330.01', 'DoDI 8320.02', 'DoDI 8410.03', 'DoDI 8530.01', 'DoDM 8400.01', 'DoDM 5240.01', 'Title 40', 'Title 44', 'Title 10', 'Title 36', 'Title 29', 'ICD 503', 'JP 3-14'],
								page_count: [21]
							},
							inner_hits: {
								paragraphs: {
									hits: {
										total: {value: 1, relation: 'eq'}, max_score: 4.345066, hits: [{
											_index: 'gamechanger_20210222_reparse',
											_type: '_doc',
											_id: '1d1ba262679c79f43623166f80c8b0267261efdbb95255fe9b29489c9d8a03f5',
											_nested: {field: 'paragraphs', offset: 21},
											_score: 4.345066,
											fields: {
												'paragraphs.page_num_i': [8],
												'paragraphs.filename': ['DoDI 5000.82.pdf'],
												'paragraphs.par_raw_text_t': ['Do DI 5000.82 , April 21 , 2020 SECTION 3 : PROCEDURES 9 ( 2 ) The post fielding assessment ( s ) , the disposition assessment , and the disposition decision for urgent operational needs , as described in Do DI 5000.81 , satisfies the requirement for a PIR . c .For software acquisitions , the software acquisition value assessment acquisition satisfies the PIR requirement .3.4 . DOD INFORMATION ENTERPRISE ARCHITECTURE ( IEA ) .The Do D IEA is considered the “ ITEA ” and provides the Do D ’s “ to be ” architecture to realize the overarching goals of the Digital Modernization Strategy through four priority technological areas : cloud ; artificial intelligence ; cybersecurity ; and command , control , and communications ( C3 ) . a .PMs must develop solution architectures that support the Do D IEA ( Increment 1 of Version 3.0 of the Do D IEA ) , applicable references , mission area and component architectures , and Do D Component architecture guidance .A program ’s solution architecture should define capability and interoperability requirements , establish and enforce standards , and guide security and cybersecurity requirements , in accordance with Do DIs 8500.01 and 8530.01 . b .The standards used to form the standard viewpoints of integrated architectures will be selected from those contained in the current approved version of the Do D IT Standards Registry within the Global Information Grid Technical Guidance Federation service .The standards selected must be sufficient to enable the interoperability and cybersecurity required for joint operations , in accordance with the National Security Strategy .The IT will be tested to measures of performance derived from the solution architecture . c .All milestone and decision point approvals will be designed and developed , to the maximum extent practicable , with a modular open system approach to enable incremental development and enhance competition , innovation , and interoperability , in accordance with Section 2446a of Title 10 , U.S.C . 3.5 . C3 .C3 systems are fundamental to all military operations , delivering critical information necessary to plan , coordinate , and control forces and operations across the full range of Do D missions . a .Waveform Management .Do D Components that acquire , develop , or modify IT NSS communications waveforms ( systems or services ) , to include wireless communications products and associated technologies , must comply with Do DI 4630.09 . ']
											},
											highlight: {'paragraphs.par_raw_text_t': ['<em>intelligence</em> ; cybersecurity ; and command , control , and communications ( C3 ) . a .PMs must develop solution architectures that support the Do D IEA ( Increment 1 of Version 3.0']}
										}]
									}
								}
							}
						}, {
							_index: 'gamechanger_20210222_reparse',
							_type: '_doc',
							_id: '17298e08e4df8eb7dfaf83a987c0f3d364968ce0011ef532cfcb9a9ea308ddee',
							_score: 8.726364,
							_source: {
								kw_doc_score_r: 0.00001,
								topics_rs: {
									'languages literatures': 0.211838950712867,
									'language literature': 0.22170050693238816,
									'change enclosure': 0.1689866280707509,
									'religious denomination': 0.47087953136254446,
									technician: 0.1789950957578231
								},
								orgs_rs: {},
								pagerank_r: 0.00001
							},
							fields: {
								display_title_s: ['DoDM 1336.05 Defense Manpower Data Center Domain Values for Military Personnel Data Extracts'],
								display_org_s: ['Dept. of Defense'],
								crawler_used_s: ['dod_issuances'],
								doc_num: ['1336.05'],
								summary_30: ['Defined as Cocos Islands prior to June 1974. program certificate, correspondence school diploma, home study A diploma or certificate of General Education Development Science teacher education, general science and technology, general Army Command and General Staff College Marine Corps Command and Staff College Marine Corps Command and Staff College Asian, Black or African American, Native Hawaiian or other Pacific Islander, White'],
								is_revoked_b: [false],
								doc_type: ['DoDM'],
								type: ['document'],
								title: ['Defense Manpower Data Center Domain Values for Military Personnel Data Extracts'],
								keyw_5: ['dodm 05', 'july 28', 'selected reserve', 'active duty', 'staff college', 'replaced', 'netherlands antilles', 'native hawaiian', 'march defined', 'high school'],
								filename: ['DoDM 1336.05 CH 2.pdf'],
								id: ['DoDM 1336.05 CH 2.pdf_0'],
								display_doc_type_s: ['Manual'],
								ref_list: ['DoDD 5124.02', 'DoDI 1336.05', 'DoDI 5025.01', 'DoDM 1336.05'],
								page_count: [73]
							},
							inner_hits: {
								paragraphs: {
									hits: {
										total: {value: 1, relation: 'eq'}, max_score: 4.6873045, hits: [{
											_index: 'gamechanger_20210222_reparse',
											_type: '_doc',
											_id: '17298e08e4df8eb7dfaf83a987c0f3d364968ce0011ef532cfcb9a9ea308ddee',
											_nested: {field: 'paragraphs', offset: 23},
											_score: 4.6873045,
											fields: {
												'paragraphs.page_num_i': [23],
												'paragraphs.filename': ['DoDM 1336.05 CH 2.pdf'],
												'paragraphs.par_raw_text_t': ['Do DM 1336.05 , July 28 , 2009 Change 2 , 05/17/2019 ENCLOSURE 4 24 050129 Polish studies 050130 Spanish and Iberian studies 050131 Tibetan studies 050132 Ukraine studies 050199 Area studies , other 050201 African American/Black studies 050202 American Indian/Native American studies 050203 Hispanic American , Puerto Rican and Mexican American/Chicano studies 050206 Asian American studies 050207 Women ’s studies 050208 Gay/lesbian studies 050299 Ethnic , cultural minority and gender studies , other 059999 Area , ethnic , cultural , and gender studies , other 090101 Communication studies/speech communication and rhetoric 090102 Mass communication/media studies 090199 Communication and media studies , other 090401 Journalism 090402 Broadcast journalism 090404 Photojournalism 090499 Journalism , other 090701 Radio and television 090702 Digital communication and media/multimedia 090799 Radio , television , and digital communication , other 090901 Organizational communication , general 090902 Public relations/image management ( was 090501 ) 090903 Advertising ( was 090201 ) 090904 Political communication 090905 Health communication 090999 Public relations , advertising and applied communication , other 091001 Publishing 099999 Communication , journalism and related programs , other 100105 Communications technology/technician 100201 Photographic and film/video technology/technician and assistant ( was 100103 ) 100202 Radio and television broadcasting technology/technician ( was 100104 ) 100203 Recording arts technology/technician 100299 Audiovisual communications technologies/technicians , other 100301 Graphic communications , general 100302 Printing management 100303 Prepress/desktop publishing and digital imaging design ( was 480212 ) 100304 Animation , interactive technology , video graphics and special effects 100305 Graphic and printing equipment operator , general production ( was 480201 ) 100306 Platemaker/imager ( was 480206 ) 100307 Printing press operator ( was 480208 ) 100308 Computer typography and composition equipment operator ( was 480211 ) 100399 Graphic communications , other ( was 480205/480299 ) 109999 Communications technologies / technicians and support services , other 110101 Computer and information sciences , general 110102 Artificial intelligence and robotics 110103 Information technology 110199 Computer and information sciences , other 110201 Computer programming / programmer , general 110202 Computer programming , specific applications ( was 521202 ) 110203 Computer programming , vendor/product certification 110299 Computer programming , other ']
											},
											highlight: {'paragraphs.par_raw_text_t': ['<em>intelligence</em> and robotics 110103 Information technology 110199 Computer and information sciences , other 110201 Computer programming / programmer , general 110202 Computer programming']}
										}]
									}
								}
							}
						}, {
							_index: 'gamechanger_20210222_reparse',
							_type: '_doc',
							_id: 'd161e6e71e463a21b6e3d944d50915c583beccb2260a1e4d461334321ad04b1f',
							_score: 8.641319,
							_source: {
								kw_doc_score_r: null,
								topics_rs: {
									materiel: 0.2544084395885199,
									provisioning: 0.21501337596856937,
									forecast: 0.20117068648270625,
									'weapon system': 0.19316751024406525,
									demand: 0.5157779355233912
								},
								orgs_rs: {
									'the Department of Defense': 26,
									'Military Service': 3,
									'the Department of Homeland Security': 1,
									Army: 1,
									'the Military Service': 1,
									'Defense for Acquisition and Sustainment': 1,
									USDAS: 2,
									'Department of Defense': 41,
									'the Coast Guard': 1,
									Defense: 1,
									'the U.S. Government': 1,
									Department: 1,
									Navy: 1,
									SSR: 3,
									'the Joint Chiefs of Staff': 1,
									'the Air Force': 1,
									'Military Services': 1
								},
								pagerank_r: 0.000432024511509805
							},
							fields: {
								display_title_s: ['DoDM 4140.01 DoD Supply Chain Materiel Management Procedures: Demand and Supply Planning'],
								display_org_s: ['Dept. of Defense'],
								crawler_used_s: ['test'],
								doc_num: ['4140.01'],
								summary_30: ['Establish support goals for all DoD secondary items to ensure the supply system uses For forecastable items, DoD Components will use quantitative models to forecast demand Materiel managers will calculate the ROP for a demand-based consumable item as Materiel managers may stock essential items with no failure or demand forecast as'],
								is_revoked_b: [false],
								doc_type: ['DoDM'],
								type: ['document'],
								title: ['DoD Supply Chain Materiel Management Procedures: Demand and Supply Planning'],
								keyw_5: ['weapon system', 'dod components', 'supply planning', 'naïve forecast', 'item classification', 'dodm 01-v2', 'demand intermittency', 'support items', 'support goals', 'supply support'],
								filename: ['DoDM 4140.01 Volume 2.pdf'],
								id: ['DoDM 4140.01 Volume 2.pdf_0'],
								display_doc_type_s: ['Manual'],
								ref_list: ['DoD 4160.28-M', 'DoD 4140.26-M', 'DoD 7000.14-R', 'DoDD 5134.12', 'DoDI 4140.01', 'DoDI 3110.06', 'DoDI 5200.39', 'DoDI 5200.44', 'DoDI 5000.64', 'DoDM 4140.01, VOLUME 2', 'DoDM 4140.01, Volume 2', 'DoDM 4140.01-V2', 'DoDM 4100.39', 'DoDM 4140.27', 'DoDM 4140.68', 'DoDM 4140.01, Volume 3', 'DoDM 4140.01, Volume 5', 'DoDM 4140.01, Volume 6', 'DoDM 4140.01, Volume 7', 'DoDM 4140.01, Volume 8', 'DoDM 4140.01, Volume 9', 'DoDM 4140.01, Volume 10', 'DoDM 4140.01, Volume 11', 'DoDM 4140.01, Volume 12', 'DoDM 4140.27, Volume 1', 'Title 10', 'Title 41', 'JP 4-0'],
								page_count: [78]
							},
							inner_hits: {
								paragraphs: {
									hits: {
										total: {value: 1, relation: 'eq'}, max_score: 4.3453293, hits: [{
											_index: 'gamechanger_20210222_reparse',
											_type: '_doc',
											_id: 'd161e6e71e463a21b6e3d944d50915c583beccb2260a1e4d461334321ad04b1f',
											_nested: {field: 'paragraphs', offset: 119},
											_score: 4.3453293,
											fields: {
												'paragraphs.page_num_i': [69],
												'paragraphs.filename': ['DoDM 4140.01 Volume 2.pdf'],
												'paragraphs.par_raw_text_t': ['Do DM 4140.01 V2 , November 9 , 2018 GLOSSARY 70 neural networks .Artificial intelligence technique that mimics the operation of the human brain ( nerves and neurons ) , and comprises of densely interconnected computer processors working simultaneously .A key feature of neural networks is that they are programmed to learn by sifting data repeatedly , looking for relationships to build mathematical models , and automatically correcting these models to refine them continuously . non consumable item materiel support codes .Alphanumeric codes assigned to nonconsumable items , which indicates the degree of materiel support ( numeric ) or repair responsibility ( alpha ) . non demand based requirement .A requirement resulting from a determination process that is not based on forecasted demand , but qualifies for stockage based on other criteria .Types of nondemand based stockage are insurance stockage and numeric stockage .For purposes of this issuance , LOT buy requirements and program based buys are considered non demand based requirements even though they are based on future predicted usage but that usage may not be determined from historical demand . non forecastable item .An item whose future demand cannot be accurately predicted using a quantitative model due to its intermittent or volatile demand pattern . not stocked .An item for which there is no established requirements objective .Inventory or usage data may be available ; however , stock replenishment would not be initiated .NSN .The 13 digit stock number replacing the 11 digit federal stock number .It consists of the 4 digit federal supply classification code and the 9 digit national item identification number .The national item identification number consists of a 2 digit National Codification Bureau number designating the central cataloging office ( whether North Atlantic Treaty Organization or other friendly country ) that assigned the number and a 7 digit ( xxx xxxx ) nonsignificant number .The number is arranged : 9999-00-999-9999 .OL .The quantities of materiel or operating stocks required to sustain operations in the interval between replenishment shipments . organic support .The capability of a Military Service or a Defense Agency to sustain logistics operations through U.S . Government organizational structures .OSTL .The quantities of materiel required to sustain operations during the interval between the initiation of a replenishment requisition and receipt of the requisitioned materiel . outliers .Data point that falls far from most other points .PBL .Logistics that delineate outcome performance goals of weapon systems , ensure that responsibilities are assigned , provide incentives for attaining these goals , and facilitate the overall life cycle management of system reliability , supportability , and total ownership costs . performance based agreement .A product support agreement that has performance tied to the system , the subsystem , or the component level that describes measurable service and performance level parameters based on customer requirements and expectations .']
											},
											highlight: {'paragraphs.par_raw_text_t': ['Do DM 4140.01 V2 , November 9 , 2018 GLOSSARY 70 neural networks .<em>Artificial</em> <em>intelligence</em> technique that mimics the operation of the human brain ( nerves and neurons ) , and comprises']}
										}]
									}
								}
							}
						}]
					},
					aggregations: {
						doc_type_aggs: {
							doc_count_error_upper_bound: 0,
							sum_other_doc_count: 0,
							buckets: [{key: 'DoDM', doc_count: 3}, {
								key: 'DoDD',
								doc_count: 2
							}, {key: 'DoDI', doc_count: 2}]
						}
					}
				}
			};
			const constants = {
				GAME_CHANGER_OPTS: {
					version: 'version'
				},
				DATA_API_BASE_URL: 'http://10.194.9.109:9346/v2/data'
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

			const target = new SearchController(opts);

			const req = {
				...reqMock,
				body: {searchType: 'Keyword', searchText: 'artificial intelligence', orgFilterQuery: 'DoD OR DoDM OR DoDI OR DoDD OR DEP OR SEC OR AI OR DTM OR (DoDI CPM) OR DoDP', transformResults: false, isClone: false, cloneData: {}, index: 'gamechanger', charsPadding: 90, orgFilter: {'Dept. of Defense': true, 'Joint Chiefs of Staff': false, 'Intelligence Community': false, 'United States Code': false, 'Executive Branch': false, 'Dept. of the Air Force': false, 'US Army': false, 'US Marine Corps': false, 'US Navy': false, 'US Navy Reserve': false, 'US Navy Medicine': false, OPM: false, 'Classification Guides': false, FMR: false, NATO: false}, showTutorial: false, useGCCache: false, tiny_url: 'gamechanger?tiny=255', searchFields: {initial: {field: null, input: ''}}, accessDateFilter: ['2021-02-20T06:33:06.343Z', '2021-02-20T06:33:06.343Z'], publicationDateFilter: ['2021-02-20T06:33:06.343Z', '2021-02-20T06:33:06.343Z'], limit: 10000, storedFields: ['doc_type'], searchVersion: 1}
			};

			const resData = await target.documentSearch(req, req.body, 'Test');
			const expected = {query: {_source: {includes: ['pagerank_r', 'kw_doc_score_r', 'orgs_rs', 'topics_rs']}, sort: [{_score: {order: 'desc'}}], stored_fields: ['doc_type'], from: 0, size: 10000, aggregations: {doc_type_aggs: {terms: {field: 'display_doc_type_s', size: 10000}}, doc_org_aggs: {terms: {field: 'display_org_s', size: 10000}}}, track_total_hits: true, query: {bool: {must: [], should: [{nested: {path: 'paragraphs', inner_hits: {_source: false, stored_fields: ['paragraphs.page_num_i', 'paragraphs.filename', 'paragraphs.par_raw_text_t'], from: 0, size: 5, highlight: {fields: {'paragraphs.filename.search': {number_of_fragments: 0}, 'paragraphs.par_raw_text_t': {fragment_size: 180, number_of_fragments: 1}, 'paragraphs.par_raw_text_t.gc_english': {fragment_size: 180, number_of_fragments: 1}}, fragmenter: 'span'}}, query: {bool: {should: [{wildcard: {'paragraphs.filename.search': {value: '*artificial intelligence*', boost: 50}}}, {query_string: {query: 'artificial intelligence', analyzer: 'gc_english', default_field: 'paragraphs.par_raw_text_t.gc_english', default_operator: 'and', fuzzy_max_expansions: 100, fuzziness: 'AUTO'}}], minimum_should_match: 1}}}}, {multi_match: {query: 'artificial intelligence', fields: ['id^5', 'title.search^15', 'keyw_5'], operator: 'AND', type: 'best_fields'}}], minimum_should_match: 1, filter: [{term: {is_revoked_b: 'false'}}]}}, highlight: {fields: {'title.search': {fragment_size: 180, number_of_fragments: 1}, keyw_5: {fragment_size: 180, number_of_fragments: 1}, id: {fragment_size: 180, number_of_fragments: 1}}, fragmenter: 'span'}}, totalCount: 7, docs: [{display_title_s: 'DoDM 4140.01 DoD Supply Chain Materiel Management Procedures: Supporting Technologies', display_org_s: 'Dept. of Defense', crawler_used_s: 'dod_issuances', doc_num: '4140.01', summary_30: 'procedures for the technologies supporting DoD supply chain materiel management. Develop and execute a supply chain data management strategy that promotes the use DoD SUPPLY CHAIN MATERIEL MANAGEMENT SYSTEMS .', is_revoked_b: false, doc_type: 'DoDM', type: 'document', title: 'DoD Supply Chain Materiel Management Procedures: Supporting Technologies', keyw_5: 'dod components, weapon system, materiel readiness, dodm 01-v7, volumes 1-15, unique character, technology, technical data, supply management, standardized data', filename: 'DoDM 4140.01 Volume 7 CH 2.pdf', id: 'DoDM 4140.01 Volume 7 CH 2.pdf_0', display_doc_type_s: 'Manual', ref_list: ['DoD 4140.1-R', 'DoD 7000.14-R', 'DoDD 5134.12', 'DoDI 4140.01', 'DoDI 8500.01', 'DoDI 5200.44', 'DoDI 5000.02', 'DoDM 4140.01-V7'], page_count: 17, topics_rs: ['materiel', 'radio frequency', 'product', 'supply chain', 'weapon system'], pageHits: [{snippet: '( 2 ) Train employees to use RBS tools , simulation models , mathematical algorithms , expert systems , <em>artificial</em> <em>intelligence</em> techniques , spreadsheets , statistical packages , and', pageNumber: 11}], pageHitCount: 1, esIndex: 'gamechanger'}, {display_title_s: 'DoDI 4151.22 Condition-Based Maintenance Plus for Materiel Maintenance', display_org_s: 'Dept. of Defense', crawler_used_s: 'dod_issuances', doc_num: '4151.22', summary_30: 'Achieve materiel availability, reliability, safety, and life-cycle sustainment cost goals set Life-cycle managers will accept and adopt CBM+ as the DoD strategy to sustain weapon achieve CBM+ policy objectives, Service-level organizations and life-cycle program managers', is_revoked_b: false, doc_type: 'DoDI', type: 'document', title: 'Condition-Based Maintenance Plus for Materiel Maintenance', keyw_5: 'weapon system, sustainment operations, life-cycle managers, life cycle, dodi 22, weapon systems, technology programs, system based, sustainment effective, sustain cbm+', filename: 'DoDI 4151.22.pdf', id: 'DoDI 4151.22.pdf_0', display_doc_type_s: 'Instruction', ref_list: ['DoD 4151.22-M', 'DoDD 5135.02', 'DoDD 4151.18', 'DoDD 5010.42', 'DoDI 4151.22', 'DoDI 5000.02', 'DoDI 4151.19', 'DoDI 8320.04', 'DoDI 8500.01', 'DoDM 4151.22'], page_count: 16, topics_rs: ['analyses', 'predictive', 'sustainment', 'cycle', 'maintenance'], pageHits: [{snippet: '<em>intelligence</em> and machine learning , and automated test equipment .', pageNumber: 14}], pageHitCount: 1, esIndex: 'gamechanger'}, {display_title_s: 'DoDD 5137.02 Under Secretary Of Defense For Research And Engineering (USD(R&E))', display_org_s: 'Dept. of Defense', crawler_used_s: 'test', doc_num: '5137.02', summary_30: 'Defense, to promulgate DoD policy within the responsibilities, functions, and authorities assigned in this Leads the DoD, in coordination with the USD, in mission engineering policy,', is_revoked_b: false, doc_type: 'DoDD', type: 'document', title: 'Under Secretary Of Defense For Research And Engineering (USD(R&E))', keyw_5: 'information technology, dod issuances, dod cio, transaction agreements, training considerations, training capabilities, technical risk, strategic guidance, strategic direction, public releas', filename: 'DoDD 5137.02.pdf', id: 'DoDD 5137.02.pdf_0', display_doc_type_s: 'Directive', ref_list: ['DoD 7000.14', 'DoD 7000.14-R', 'DoDD 5137.02', 'DoDD 5135.02', 'DoDD 5134.01', 'DoDD 5230.11', 'DoDD 5205.07', 'DoDD 5101.01', 'DoDD 5100.01', 'DoDI 3204.01', 'DoDI 3216.02', 'DoDI 1025.09', 'DoDI 5025.01', 'DoDI 8910.01', 'DoDI 4000.19', 'DoDI 5200.01', 'DoDM 5200.01', 'DoDM 5200.01, Volume 3', 'AI 102', 'Title 10', 'Title 5', 'Title 32', 'Title 45', 'Title 35', 'Executive Order 13891', 'Executive Order 13526', 'Executive Order 10789'], page_count: 25, topics_rs: ['research engineering', 'defense', 'prototyping', 'coordinates', 'technology'], pageHits: [{snippet: '<em>intelligence</em> ( AI ) /machine learning , biotechnology , space autonomy , fully networked command , control , and communications ( FNC3 ) , cyber , and quantum science .These areas', pageNumber: 4}, {snippet: 'ACAT Acquisition Category AI <em>artificial</em> <em>intelligence</em>', pageNumber: 21}], pageHitCount: 2, esIndex: 'gamechanger'}, {display_title_s: 'DoDD 5000.01 The Defense Acquisition System', display_org_s: 'Dept. of Defense', crawler_used_s: 'test', doc_num: '5000.01', summary_30: 'Acquisition programs will be managed consistent with statute, the policy outlined in DoD Component heads, including the Directors of the Defense Agencies with acquisition DoD Directive 5135.02, Under Secretary of Defense for Acquisition and Sustainment', is_revoked_b: false, doc_type: 'DoDD', type: 'document', title: 'The Defense Acquisition System', keyw_5: 'united states, support metrics, study guidance, september 9, responsibilities assigned, requirements management, realistic projections, program evaluation, product support, plans related', filename: 'DoDD 5000.01.pdf', id: 'DoDD 5000.01.pdf_0', display_doc_type_s: 'Directive', ref_list: ['DoDD 5000.01', 'DoDD 2060.01', 'DoDD 5135.02', 'DoDD 5137.02', 'DoDD 5143.01', 'DoDD 1322.18', 'DoDD 5124.02', 'DoDD 5105.82', 'DoDD 5144.02', 'DoDD 5141.02', 'DoDD 5105.84', 'DoDI 5015.02', 'DoDI 8500.01', 'Title 10', 'Title 44'], page_count: 16, topics_rs: ['defense', 'component heads', 'acquisition', 'cycle', 'cybersecurity'], pageHits: [{snippet: 'Under Secretary of Defense for <em>Intelligence</em> and Security ( USD ( I&S ) ) ........................ 11 2.4 .', pageNumber: 2}, {snippet: 'and sustained U.S . military advantage , the acquisition system will leverage capabilities including <em>artificial</em> <em>intelligence</em> , machine learning , and deep learning to maximize efficiency', pageNumber: 8}], pageHitCount: 2, esIndex: 'gamechanger'}, {display_title_s: 'DoDI 5000.82 Acquisition of Information Technology', display_org_s: 'Dept. of Defense', crawler_used_s: 'dod_issuances', doc_num: '5000.82', summary_30: 'PMs in Defense Intelligence Components ensure that IT acquisitions for systems that process DoD Instruction 5000.74, Defense Acquisition of Services, January 10, 2020, as amended DoD Instruction 8580.1, Information Assurance in the Defense Acquisition System,', is_revoked_b: false, doc_type: 'DoDI', type: 'document', title: 'Acquisition of Information Technology', keyw_5: 'dod cio, information technology, dod component, “defense acquisition, waveform management, urgent operational, united states, term reflects, solution architecture, records contained', filename: 'DoDI 5000.82.pdf', id: 'DoDI 5000.82.pdf_0', display_doc_type_s: 'Instruction', ref_list: ['DoD 5400.11-R', 'DoDD 5144.02', 'DoDD 5000.01', 'DoDD 4650.05', 'DoDD 8470.01E', 'DoDD 8000.01', 'DoDI 5000.82', 'DoDI 5000.02', 'DoDI 8310.01', 'DoDI 5000.74', 'DoDI 4151.20', 'DoDI 5000.81', 'DoDI 4630.09', 'DoDI 4650.01', 'DoDI 4650.08', 'DoDI 8500.01', 'DoDI 8510.01', 'DoDI 8580.1', 'DoDI 5200.44', 'DoDI 8582.01', 'DoDI 5200.01', 'DoDI 5400.11', 'DoDI 5400.16', 'DoDI 8170.01', 'DoDI 3200.12', 'DoDI 5015.02', 'DoDI 8330.01', 'DoDI 8320.02', 'DoDI 8410.03', 'DoDI 8530.01', 'DoDM 8400.01', 'DoDM 5240.01', 'Title 40', 'Title 44', 'Title 10', 'Title 36', 'Title 29', 'ICD 503', 'JP 3-14'], page_count: 21, topics_rs: ['instruction', 'pathways', 'information', 'acquisition', 'cybersecurity'], pageHits: [{snippet: '<em>intelligence</em> ; cybersecurity ; and command , control , and communications ( C3 ) . a .PMs must develop solution architectures that support the Do D IEA ( Increment 1 of Version 3.0', pageNumber: 9}], pageHitCount: 1, esIndex: 'gamechanger'}, {display_title_s: 'DoDM 1336.05 Defense Manpower Data Center Domain Values for Military Personnel Data Extracts', display_org_s: 'Dept. of Defense', crawler_used_s: 'dod_issuances', doc_num: '1336.05', summary_30: 'Defined as Cocos Islands prior to June 1974. program certificate, correspondence school diploma, home study A diploma or certificate of General Education Development Science teacher education, general science and technology, general Army Command and General Staff College Marine Corps Command and Staff College Marine Corps Command and Staff College Asian, Black or African American, Native Hawaiian or other Pacific Islander, White', is_revoked_b: false, doc_type: 'DoDM', type: 'document', title: 'Defense Manpower Data Center Domain Values for Military Personnel Data Extracts', keyw_5: 'dodm 05, july 28, selected reserve, active duty, staff college, replaced, netherlands antilles, native hawaiian, march defined, high school', filename: 'DoDM 1336.05 CH 2.pdf', id: 'DoDM 1336.05 CH 2.pdf_0', display_doc_type_s: 'Manual', ref_list: ['DoDD 5124.02', 'DoDI 1336.05', 'DoDI 5025.01', 'DoDM 1336.05'], page_count: 73, topics_rs: ['languages literatures', 'language literature', 'change enclosure', 'religious denomination', 'technician'], pageHits: [{snippet: '<em>intelligence</em> and robotics 110103 Information technology 110199 Computer and information sciences , other 110201 Computer programming / programmer , general 110202 Computer programming', pageNumber: 24}], pageHitCount: 1, esIndex: 'gamechanger'}, {display_title_s: 'DoDM 4140.01 DoD Supply Chain Materiel Management Procedures: Demand and Supply Planning', display_org_s: 'Dept. of Defense', crawler_used_s: 'test', doc_num: '4140.01', summary_30: 'Establish support goals for all DoD secondary items to ensure the supply system uses For forecastable items, DoD Components will use quantitative models to forecast demand Materiel managers will calculate the ROP for a demand-based consumable item as Materiel managers may stock essential items with no failure or demand forecast as', is_revoked_b: false, doc_type: 'DoDM', type: 'document', title: 'DoD Supply Chain Materiel Management Procedures: Demand and Supply Planning', keyw_5: 'weapon system, dod components, supply planning, naïve forecast, item classification, dodm 01-v2, demand intermittency, support items, support goals, supply support', filename: 'DoDM 4140.01 Volume 2.pdf', id: 'DoDM 4140.01 Volume 2.pdf_0', display_doc_type_s: 'Manual', ref_list: ['DoD 4160.28-M', 'DoD 4140.26-M', 'DoD 7000.14-R', 'DoDD 5134.12', 'DoDI 4140.01', 'DoDI 3110.06', 'DoDI 5200.39', 'DoDI 5200.44', 'DoDI 5000.64', 'DoDM 4140.01, VOLUME 2', 'DoDM 4140.01, Volume 2', 'DoDM 4140.01-V2', 'DoDM 4100.39', 'DoDM 4140.27', 'DoDM 4140.68', 'DoDM 4140.01, Volume 3', 'DoDM 4140.01, Volume 5', 'DoDM 4140.01, Volume 6', 'DoDM 4140.01, Volume 7', 'DoDM 4140.01, Volume 8', 'DoDM 4140.01, Volume 9', 'DoDM 4140.01, Volume 10', 'DoDM 4140.01, Volume 11', 'DoDM 4140.01, Volume 12', 'DoDM 4140.27, Volume 1', 'Title 10', 'Title 41', 'JP 4-0'], page_count: 78, topics_rs: ['materiel', 'provisioning', 'forecast', 'weapon system', 'demand'], pageHits: [{snippet: 'Do DM 4140.01 V2 , November 9 , 2018 GLOSSARY 70 neural networks .<em>Artificial</em> <em>intelligence</em> technique that mimics the operation of the human brain ( nerves and neurons ) , and comprises', pageNumber: 70}], pageHitCount: 1, esIndex: 'gamechanger'}], doc_types: [{key: 'DoDM', doc_count: 3}, {key: 'DoDD', doc_count: 2}, {key: 'DoDI', doc_count: 2}], doc_orgs: [], searchTerms: ['artificial', 'intelligence'], expansionDict: {}};
			assert.deepStrictEqual(resData, expected);

			done();

		});
	});

	describe('#convertTinyURL', () => {
		let searchUrls = [{
			id: 1,
			url: 'Test'
		}];
		const opts = {
			...constructorOptionsMock,
			dataApi: {},
			gcSearchURLs: {
				findOne(data) {
					let returnUrl = {};
					searchUrls.forEach(url => {
						if (url.id === data.where.id) {
							returnUrl = url;
						}
					});

					return Promise.resolve(returnUrl);
				}
			}
		};

		it('returns a url for the provided id', async () => {
			const target = new SearchController(opts);

			const req = {
				...reqMock,
				body: {
					url: '1'
				}
			};

			let resCode;
			let resMsg;

			const res = {
				status(code) {
					resCode = code;
					return this;
				},
				send(msg) {
					resMsg = msg;
					return this;
				}
			};

			try {
				await target.convertTinyURL(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = {url: 'Test'};
			assert.deepStrictEqual(resMsg, expected);
		});
	});

	describe('#shortenSearchURL', () => {
		let searchUrls = [];
		const opts = {
			...constructorOptionsMock,
			dataApi: {},
			gcSearchURLs: {
				findOrCreate(data) {
					let returnUrl = {
						id: 1,
						url: data.defaults.url
					};
					searchUrls.push(returnUrl);
					return Promise.resolve([returnUrl, true]);
				}
			}
		};

		it('save a tiny url', async () => {
			const target = new SearchController(opts);

			const req = {
				...reqMock,
				body: {
					url: '/testing'
				}
			};

			let resCode;
			let resMsg;

			const res = {
				status(code) {
					resCode = code;
					return this;
				},
				send(msg) {
					resMsg = msg;
					return this;
				}
			};

			try {
				await target.shortenSearchURL(req, res);
			} catch (e) {
				assert.fail(e);
			}
			const expected = {tinyURL: 1};
			assert.deepStrictEqual(resMsg, expected);
		});
	});
});
