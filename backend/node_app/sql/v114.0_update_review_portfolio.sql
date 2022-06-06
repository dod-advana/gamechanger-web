UPDATE review
SET portfolio_name = 'AI Inventory'
WHERE budget_year = '2022' AND review.portfolio_name IS NULL;