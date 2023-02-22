--MIGRATION TO UPDATE jbook_ref_id IN THE review TABLE

CREATE TEMP TABLE jbooklookup
(uot_department TEXT, uot_department_desc TEXT,uot_agency TEXT, org_code TEXT);

\copy jbooklookup (uot_department, uot_department_desc,uot_agency, org_code) FROM './jbook_dept_lookup.csv' DELIMITER ',' CSV HEADER;

UPDATE public.review rd
SET jbook_ref_id = CONCAT('rdoc#', rd.program_element, '#', rd.budget_line_item, '#', rd.budget_year, '#',  left(rd.appn_num, 4), '#', rd.budget_activity, '#', jd.uot_department)
FROM jbooklookup jd
WHERE rd.budget_type='rdoc' AND (lower(rd.agency) like CONCAT('%',lower(jd.uot_department_desc),'%') OR lower(rd.agency) like CONCAT('%',lower(jd.uot_agency),'%') OR lower(rd.agency) like CONCAT('%',lower(jd.org_code),'%'));

UPDATE public.review rd
SET jbook_ref_id = 'pdoc#' || rd.budget_line_item || '#' ||rd. budget_year|| '#' || left(rd.appn_num, 4) || '#' || rd.budget_activity || '#' || jd.uot_department
FROM jbooklookup jd
WHERE rd.budget_type='pdoc' AND (lower(rd.agency) like CONCAT('%',lower(jd.uot_department_desc),'%') OR lower(rd.agency) like CONCAT('%',lower(jd.uot_agency),'%') OR lower(rd.agency) like CONCAT('%',lower(jd.org_code),'%'));

UPDATE public.review rd
SET jbook_ref_id = 'odoc#' || rd.budget_line_item || '#' || rd.program_element || '#' || rd.budget_year || '#' || left(rd.appn_num, 4) || '#' || rd.budget_activity || '#' || jd.uot_department
FROM jbooklookup jd
WHERE rd.budget_type='odoc' AND (lower(rd.agency) like CONCAT('%',lower(jd.uot_department_desc),'%') OR lower(rd.agency) like CONCAT('%',lower(jd.uot_agency),'%') OR lower(rd.agency) like CONCAT('%',lower(jd.org_code),'%'));

--MIGRATION TO ADD DEPT CODE TO review TABLE

-- ALTER TABLE public.review ADD COLUMN IF NOT EXISTS department TEXT;

UPDATE public.review rd
SET jd.department = jd.uot_department
FROM jbooklookup jd
WHERE lower(rd.agency) like CONCAT('%',lower(jd.uot_department_desc),'%') OR lower(rd.agency) like CONCAT('%',lower(jd.uot_agency),'%') OR lower(rd.agency) like CONCAT('%',lower(jd.org_code),'%');

DROP TABLE jbooklookup;

