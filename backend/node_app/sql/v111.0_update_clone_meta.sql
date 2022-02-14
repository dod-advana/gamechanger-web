UPDATE clone_meta SET data_module = 'simple/simpleDataHandler' where id >= 0;
UPDATE clone_meta SET data_module = 'budgetSearch/budgetSearchDataHandler' where clone_name = 'jbook';
