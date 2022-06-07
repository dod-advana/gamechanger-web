select
    hex(a.idvisitor) as idvisitor,
    SUM(IF(c.name LIKE 'PDFViewer%', 1, 0)) as docs_opened,
    SUM(IF(search_cat LIKE '%_combined', 1, 0)) as searches_made,
    max(server_time) as last_search,
    date_format(max(server_time),'%Y-%m-%d %H:%i') as last_search_formatted
from 
    matomo_log_link_visit_action a,
    matomo_log_action b,
    matomo_log_action c
where 
    a.idaction_event_action = b.idaction
    AND a.idaction_name = c.idaction
    AND a.idaction_event_category = 1396