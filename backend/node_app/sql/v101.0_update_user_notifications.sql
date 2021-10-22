-- the notifications weren't being used previously so just clear them 
-- out for new per clone structure
UPDATE gc_users
SET notifications = '{}'
;
