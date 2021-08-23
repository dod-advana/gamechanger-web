INSERT INTO clone_meta (clone_name,search_module,export_module,display_name,title_bar_module,
navigation_module,card_module,is_live,url,permissions_required,clone_to_advana,clone_to_gamechanger,clone_to_sipr,
show_graph,clone_to_jupiter,show_tutorial,show_crowd_source,show_feedback,config,graph_module,main_view_module,search_bar_module)
VALUES ('budgetSearch','budgetSearch/budgetSearchSearchHandler','simple/simpleExportHandler','AI Inventory Portfolio Tool','budgetSearch/budgetSearchTitleBarHandler',
'budgetSearch/budgetSearchNavigationHandler','budgetSearch/budgetSearchCardHandler',TRUE,'budgetsearch',TRUE,TRUE,TRUE,FALSE,
FALSE,FALSE,FALSE,TRUE,TRUE,'{"esindex": "gc_budgetsearch"}', 'simple/simpleGraphHandler', 'budgetSearch/budgetSearchMainViewHandler', 'default/defaultSearchBarHandler');