INSERT INTO clone_meta (id,clone_name,search_module,export_module,display_name,title_bar_module,
navigation_module,card_module,is_live,url,permissions_required,clone_to_advana,clone_to_gamechanger,clone_to_sipr,
show_graph,clone_to_jupiter,show_tutorial,show_crowd_source,show_feedback,config,graph_module,main_view_module)
VALUES (6,'gamechanger-test','policy/policySearchHandler','policy/policyExportHandler','GAMECHANGER','policy/policyTitleBarHandler',
'policy/policyTestNavigationHandler','policy/policyCardHandler',TRUE,'gamechanger-test',TRUE,TRUE,TRUE,FALSE,
TRUE,FALSE,FALSE,TRUE,TRUE,'{"esindex": "gamechanger"}', 'policy/policyGraphHandler','policy/policyTestMainViewHandler');