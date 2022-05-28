CREATE FUNCTION conditional_update() returns void as
$$
BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='clone_meta' AND column_name='view_header_module') THEN
   	UPDATE clone_meta
		SET view_header_module = 'policy/policyViewHeaderHandler'
		WHERE clone_name = 'gamechanger'


		UPDATE clone_meta
		SET view_header_module = 'eda/edaViewHeaderHandler'
		WHERE clone_name = 'eda'


		UPDATE clone_meta
		SET view_header_module = 'jbook/jbookViewHeaderHandler'
		WHERE clone_name = 'jbook'
  END IF;
end;
$$ language plpgsql;
select conditional_update();
drop function conditional_update();




