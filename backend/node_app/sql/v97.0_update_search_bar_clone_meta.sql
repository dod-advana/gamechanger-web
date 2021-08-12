UPDATE clone_meta
SET search_bar_module = 'default/defaultSearchBarHandler'
WHERE clone_name = 'hermes' 
OR clone_name = 'covid19'
OR clone_name = 'globalSearch';

UPDATE clone_meta
SET search_bar_module = 'eda/edaSearchBarHandler'
WHERE clone_name = 'eda';

UPDATE clone_meta
SET search_bar_module = 'policy/policySearchBarHandler'
WHERE clone_name = 'gamechanger'; 