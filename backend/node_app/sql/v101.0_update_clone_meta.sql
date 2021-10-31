UPDATE clone_meta SET available_at = '{"https://search.advana.data.mil/", "localhost"}' where id >= 0;
UPDATE clone_meta SET available_at = '{"all", "localhost"}' where clone_name = 'gamechanger';
