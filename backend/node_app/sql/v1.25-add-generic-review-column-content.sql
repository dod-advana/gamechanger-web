-- UPDATE review_kb k
-- SET organization = apd."P40-06_Organization"
-- from ((select id, kb.id as newid, "P40-01_LI_Number", "P40-04_BudgetYear","P40-06_Organization" from pdoc p
-- 	inner join review_kb kb
-- 	on kb.budget_type = 'pdoc' and kb.budget_line_item = p."P40-01_LI_Number"
-- 	and kb.budget_year = p."P40-04_BudgetYear") as pd

--   WHERE id NOT IN
--     (SELECT id
--       FROM
--           (SELECT id,
--           ROW_NUMBER() OVER( PARTITION BY newid,
--           "P40-01_LI_Number",
--           "P40-04_BudgetYear",
--           "P40-06_Organization"
--           ORDER BY  id ) AS row_num
--           FROM pd
--           ) t
--         WHERE t.row_num > 1
--       )
-- ) apd
-- where k.id = apd.newid and k.budget_type = 'pdoc' and k.budget_line_item = apd."P40-01_LI_Number"
-- 	and k.budget_year = apd."P40-04_BudgetYear";


-- Feb 26
--PDOC update
UPDATE review kb
SET agency = p."P40-06_Organization",
appn_num = p."P40-08_Appn_Number",
budget_activity = p."P40-10_BA_Number"
from pdoc p
WHERE kb.budget_line_item = p."P40-01_LI_Number"
and kb.budget_year = p."P40-04_BudgetYear"
and kb.budget_type = 'pdoc';

--RDOC Update

UPDATE review kb
SET agency = r."Organization",
appn_num = r."Appn_Num",
budget_activity = r."BA_Number"
from rdoc r
WHERE kb.program_element = r."PE_Num"
and kb.budget_line_item = r."Proj_Number"
and kb.budget_year = r."BudgetYear"
and kb.budget_type = 'rdoc';

--ODOC Update

UPDATE review kb
SET agency = o.organization,
appn_num = o.account,
budget_activity = o.budget_activity,
program_element = o.sag_bli
from om o
WHERE kb.budget_line_item = o.line_number
--Important Distinction Here!!!
and kb.program_element = o.account
and kb.budget_activity = o.budget_activity
and kb.budget_type = 'odoc';

--Insert Missing 30 BAs/AppNs ** INSERT 3 times

INSERT INTO review (program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity)
SELECT program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity
FROM review
WHERE budget_line_item = '30'
and budget_type = 'pdoc'
and budget_year = '2022'
LIMIT 1;

INSERT INTO review (program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity)
SELECT program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity
FROM review
WHERE budget_line_item = '30'
and budget_type = 'pdoc'
and budget_year = '2022'
LIMIT 1;

INSERT INTO review (program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity)
SELECT program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity
FROM review
WHERE budget_line_item = '30'
and budget_type = 'pdoc'
and budget_year = '2022'
LIMIT 1;

INSERT INTO review (program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity)
SELECT program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity
FROM review
WHERE budget_line_item = '30'
and budget_type = 'pdoc'
and budget_year = '2021'
LIMIT 1;

INSERT INTO review (program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity)
SELECT program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity
FROM review
WHERE budget_line_item = '30'
and budget_type = 'pdoc'
and budget_year = '2021'
LIMIT 1;

INSERT INTO review (program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity)
SELECT program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity
FROM review
WHERE budget_line_item = '30'
and budget_type = 'pdoc'
and budget_year = '2021'
LIMIT 1;


--Insert missing 4217 BAs/Appns

INSERT INTO review (program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity)
SELECT program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity
FROM review
WHERE budget_line_item = '4217'
and budget_type = 'pdoc'
and budget_year = '2022';

INSERT INTO review (program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity)
SELECT program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity
FROM review
WHERE budget_line_item = '4217'
and budget_type = 'pdoc'
and budget_year = '2021';


--Insert missing Rdoc 0303150K/CC01
INSERT INTO review (program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity)
SELECT program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity
FROM review
WHERE program_element = '0303150K'
and budget_line_item = 'CC01'
and budget_type = 'rdoc'
and budget_year = '2022';

--Insert missing Rdoc 0305208K/NF1
INSERT INTO review (program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity)
SELECT program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity
FROM review
WHERE program_element = '0305208K'
and budget_line_item = 'NF1'
and budget_type = 'rdoc'
and budget_year = '2022';

INSERT INTO review (program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity)
SELECT program_element, budget_line_item, service_agree_label,
primary_class_label, service_trans_known, service_trans_type,
service_ptp, primary_mp_list, service_mp_add, review_status,
service_poc_title, service_poc_name, service_poc_email,
primary_review_notes, budget_type, budget_year, primary_review_status,
service_review_status, poc_review_status, primary_reviewer,
service_reviewer, poc_reviewer, other_mission_partners,
service_review_notes, poc_dollars_attributed_category,
poc_dollars_attributed, poc_percentage_attributed_category,
poc_percentage_attributed, poc_ai_type, poc_joint_capability_area,
poc_ai_role_description, poc_ai_type_description, rev_trans_agree,
service_ptp_agree_label, doc_id, secondary_reviewer, service_poc_org,
poc_phone_number, source_tag, primary_service_reviewer,
reviewer, primary_ptp, service_mp_list, service_class_label,
poc_review_notes, "deletedAt", "createdAt", "updatedAt",
service_secondary_reviewer, service_poc_phone_number,
domain_task, domain_task_secondary, alternate_poc_title,
alternate_poc_name, alternate_poc_email, alternate_poc_phone_number,
alternate_poc_org, robotics_system_agree, poc_agree_label,
poc_class_label, poc_ptp, poc_ptp_agree_label, poc_mp_list,
poc_mp_agree_label, intelligent_systems_agree, poc_joint_capability_area2,
poc_joint_capability_area3, poc_mp_checklist, service_mp_checklist,
agency,appn_num, budget_activity
FROM review
WHERE program_element = '0305208K'
and budget_line_item = 'NF1'
and budget_type = 'rdoc'
and budget_year = '2021';

--Fix Pdoc Dupes
CREATE OR REPLACE FUNCTION fixPdocReviewDupes(bli TEXT, byear TEXT, appn TEXT, ba TEXT, org TEXT)
  RETURNS VOID AS
$$
BEGIN
  UPDATE review kb
  SET appn_num = appn,
    budget_activity = ba,
    agency = org
  WHERE budget_line_item = bli
  AND budget_type = 'pdoc'
  AND budget_year = byear
  AND id IN
      (SELECT id
      FROM
          (SELECT id,
          ROW_NUMBER()
      OVER( PARTITION BY budget_line_item,
          budget_type,
          budget_year,
          appn_num,
          budget_activity,
          agency
          ORDER BY  id ) AS row_num
          FROM review ) t
          WHERE t.row_num > 1 )
  AND NOT EXISTS (
      SELECT 1
      FROM review
      WHERE budget_line_item = bli
  AND budget_type = 'pdoc'
  AND budget_year = byear
  AND appn_num = appn
  AND budget_activity = ba
  AND agency = org
  );
END
$$ LANGUAGE plpgsql;

SELECT p."P40-01_LI_Number", p."P40-04_BudgetYear", p."P40-08_Appn_Number", p."P40-10_BA_Number",p."P40-06_Organization"
FROM pdoc p,
     LATERAL fixPdocReviewDupes(p."P40-01_LI_Number", p."P40-04_BudgetYear", p."P40-08_Appn_Number", p."P40-10_BA_Number",p."P40-06_Organization") f;

--Fix Rdoc BAs for '0305208K/NF1' and 0303150K/CC01
UPDATE review kb
SET appn_num = '0400',
  budget_activity = '7',
  agency = 'Defense Information Systems Agency (DISA)'
WHERE program_element = '0303150K'
AND budget_line_item = 'CC01'
AND budget_type = 'rdoc'
AND budget_year = '2022'
AND id IN
    (SELECT id
    FROM
        (SELECT id,
        ROW_NUMBER()
    OVER( PARTITION BY program_element,
        budget_line_item,
        budget_type,
        budget_year,
        appn_num,
        budget_activity,
        agency
        ORDER BY  id ) AS row_num
        FROM review ) t
        WHERE t.row_num > 1 )
AND NOT EXISTS (
    SELECT 1
    FROM review
    WHERE program_element = '0303150K'
AND budget_line_item = 'CC01'
AND budget_type = 'rdoc'
AND appn_num = '0400'
AND budget_activity = '7'
AND agency = 'Defense Information Systems Agency (DISA)'
AND budget_year = '2022'
);

UPDATE review kb
SET appn_num = '0400',
  budget_activity = '7',
  agency = 'Defense Information Systems Agency (DISA)'
WHERE program_element = '0303150K'
AND budget_line_item = 'CC01'
AND budget_type = 'rdoc'
AND budget_year = '2021'
AND id IN
    (SELECT id
    FROM
        (SELECT id,
        ROW_NUMBER()
    OVER( PARTITION BY program_element,
        budget_line_item,
        budget_type,
        budget_year,
        appn_num,
        budget_activity,
        agency
        ORDER BY  id ) AS row_num
        FROM review ) t
        WHERE t.row_num > 1 )
AND NOT EXISTS (
    SELECT 1
    FROM review
    WHERE program_element = '0303150K'
AND budget_line_item = 'CC01'
AND budget_type = 'rdoc'
AND appn_num = '0400'
AND budget_activity = '7'
AND agency = 'Defense Information Systems Agency (DISA)'
AND budget_year = '2021'
);

UPDATE review kb
SET appn_num = '0400',
  budget_activity = '8',
  agency = 'Defense Information Systems Agency (DISA)'
WHERE program_element = '0303150K'
AND budget_line_item = 'CC01'
AND budget_type = 'rdoc'
AND budget_year = '2022'
AND id IN
    (SELECT id
    FROM
        (SELECT id,
        ROW_NUMBER()
    OVER( PARTITION BY program_element,
        budget_line_item,
        budget_type,
        budget_year,
        appn_num,
        budget_activity,
        agency
        ORDER BY  id ) AS row_num
        FROM review ) t
        WHERE t.row_num > 1 )
AND NOT EXISTS (
    SELECT 1
    FROM review
    WHERE program_element = '0303150K'
AND budget_line_item = 'CC01'
AND budget_type = 'rdoc'
AND appn_num = '0400'
AND budget_activity = '8'
AND agency = 'Defense Information Systems Agency (DISA)'
AND budget_year = '2022'
);

UPDATE review kb
SET appn_num = '0400',
  budget_activity = '8',
  agency = 'Defense Information Systems Agency (DISA)'
WHERE program_element = '0303150K'
AND budget_line_item = 'CC01'
AND budget_type = 'rdoc'
AND budget_year = '2021'
AND id IN
    (SELECT id
    FROM
        (SELECT id,
        ROW_NUMBER()
    OVER( PARTITION BY program_element,
        budget_line_item,
        budget_type,
        budget_year,
        appn_num,
        budget_activity,
        agency
        ORDER BY  id ) AS row_num
        FROM review ) t
        WHERE t.row_num > 1 )
AND NOT EXISTS (
    SELECT 1
    FROM review
    WHERE program_element = '0303150K'
AND budget_line_item = 'CC01'
AND budget_type = 'rdoc'
AND appn_num = '0400'
AND budget_activity = '8'
AND agency = 'Defense Information Systems Agency (DISA)'
AND budget_year = '2021'
);

UPDATE review kb
SET appn_num = '0400',
  budget_activity = '7',
  agency = 'Defense Information Systems Agency (DISA)'
WHERE program_element = '0305208K'
AND budget_line_item = 'NF1'
AND budget_type = 'rdoc'
AND budget_year = '2022'
AND id IN
    (SELECT id
    FROM
        (SELECT id,
        ROW_NUMBER()
    OVER( PARTITION BY program_element,
        budget_line_item,
        budget_type,
        budget_year,
        appn_num,
        budget_activity,
        agency
        ORDER BY  id ) AS row_num
        FROM review ) t
        WHERE t.row_num > 1 )
AND NOT EXISTS (
    SELECT 1
    FROM review
    WHERE program_element = '0305208K'
AND budget_line_item = 'NF1'
AND budget_type = 'rdoc'
AND budget_year = '2022'
AND appn_num = '0400'
AND budget_activity = '7'
AND agency = 'Defense Information Systems Agency (DISA)'
);

UPDATE review kb
SET appn_num = '0400',
  budget_activity = '7',
  agency = 'Defense Information Systems Agency (DISA)'
WHERE program_element = '0305208K'
AND budget_line_item = 'NF1'
AND budget_type = 'rdoc'
AND budget_year = '2021'
AND id IN
    (SELECT id
    FROM
        (SELECT id,
        ROW_NUMBER()
    OVER( PARTITION BY program_element,
        budget_line_item,
        budget_type,
        budget_year,
        appn_num,
        budget_activity,
        agency
        ORDER BY  id ) AS row_num
        FROM review ) t
        WHERE t.row_num > 1 )
AND NOT EXISTS (
    SELECT 1
    FROM review
    WHERE program_element = '0305208K'
AND budget_line_item = 'NF1'
AND budget_type = 'rdoc'
AND budget_year = '2021'
AND appn_num = '0400'
AND budget_activity = '7'
AND agency = 'Defense Information Systems Agency (DISA)'
);

UPDATE review kb
SET appn_num = '0400',
  budget_activity = '6',
  agency = 'Defense Information Systems Agency (DISA)'
WHERE program_element = '0305208K'
AND budget_line_item = 'NF1'
AND budget_type = 'rdoc'
AND budget_year = '2022'
AND id IN
    (SELECT id
    FROM
        (SELECT id,
        ROW_NUMBER()
    OVER( PARTITION BY program_element,
        budget_line_item,
        budget_type,
        budget_year,
        appn_num,
        budget_activity,
        agency
        ORDER BY  id ) AS row_num
        FROM review ) t
        WHERE t.row_num > 1 )
AND NOT EXISTS (
    SELECT 1
    FROM review
    WHERE program_element = '0305208K'
    AND budget_line_item = 'NF1'
    AND budget_type = 'rdoc'
    AND appn_num = '0400'
    AND budget_activity = '6'
    AND agency = 'Defense Information Systems Agency (DISA)'
    AND budget_year = '2022'
);

UPDATE review kb
SET appn_num = '0400',
  budget_activity = '6',
  agency = 'Defense Information Systems Agency (DISA)'
WHERE program_element = '0305208K'
AND budget_line_item = 'NF1'
AND budget_type = 'rdoc'
AND budget_year = '2021'
AND id IN
    (SELECT id
    FROM
        (SELECT id,
        ROW_NUMBER()
    OVER( PARTITION BY program_element,
        budget_line_item,
        budget_type,
        budget_year,
        appn_num,
        budget_activity,
        agency
        ORDER BY  id ) AS row_num
        FROM review ) t
        WHERE t.row_num > 1 )
AND NOT EXISTS (
    SELECT 1
    FROM review
    WHERE program_element = '0305208K'
    AND budget_line_item = 'NF1'
    AND budget_type = 'rdoc'
    AND appn_num = '0400'
    AND budget_activity = '6'
    AND agency = 'Defense Information Systems Agency (DISA)'
    AND budget_year = '2021'
);

--Remove Duplicates (if different between dev and prod)
DELETE FROM review
WHERE id IN
    (SELECT id
    FROM
        (SELECT id,
         ROW_NUMBER() OVER( PARTITION BY program_element,
		  budget_line_item,
          budget_type,
          budget_year,
          appn_num,
          budget_activity,
          agency
        ORDER BY  id ) AS row_num
        FROM review ) t
        WHERE t.row_num > 1 );

-- CREATE TABLE review_kb
-- AS TABLE review

-- ALTER TABLE review_kb
-- ADD COLUMN agency TEXT;

-- ALTER TABLE review_kb
-- ADD COLUMN appn_num TEXT;
