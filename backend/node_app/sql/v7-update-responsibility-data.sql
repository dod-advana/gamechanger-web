TRUNCATE responsibilities; 
TRUNCATE responsibility_reports;
\COPY responsibilities(filename, "documentTitle", "organizationPersonnelNumbering", "organizationPersonnelText", "organizationPersonnelEntities", "responsibilityNumbering", "responsibilityText", "responsibilityEntities", status) FROM './node_app/sql/responsibility_data_v7.csv' DELIMITER ',' CSV HEADER;