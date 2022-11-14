TRUNCATE responsibilities; 
TRUNCATE responsibility_reports;
\COPY responsibilities(filename, "documentTitle", "organizationPersonnelNumbering", "organizationPersonnelText", "organizationPersonnelEntities", "responsibilityNumbering", "responsibilityText", "responsibilityEntities", status) FROM './node_app/sql/responsibility_data.csv' DELIMITER ',' CSV HEADER;