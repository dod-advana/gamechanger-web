UPDATE clone_meta SET elasticsearch_index = config->>'esIndex';

ALTER TABLE clone_meta
DROP COLUMN config
;




