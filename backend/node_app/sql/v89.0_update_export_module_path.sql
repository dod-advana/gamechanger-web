UPDATE clone_meta as c set
    export_module = t.export_module
from (values
    ('eda/edaExportHandler', 'eda'),
    ('policy/policyExportHandler', 'gamechanger')  
) as t(export_module, clone_name) 
where t.clone_name = c.clone_name;