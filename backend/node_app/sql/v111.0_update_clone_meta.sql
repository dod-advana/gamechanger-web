UPDATE clone_meta SET data_module = 'simple/simpleDataHandler' where id >= 0;
UPDATE clone_meta SET data_module = 'jbook/jbookDataHandler' where clone_name = 'jbook';
