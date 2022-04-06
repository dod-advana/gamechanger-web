UPDATE review
SET portfolio_id = subquery.id
FROM 
  (SELECT id FROM portfolio where name = 'jaic') AS subquery;