update review
set budget_activity = LPAD(budget_activity, 2, '0')
where budget_activity is not null AND (Length(budget_activity) < 2);