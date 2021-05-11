CREATE TABLE gc_history_backup AS TABLE gc_history;
UPDATE gc_history
SET user_id = MD5(user_id);