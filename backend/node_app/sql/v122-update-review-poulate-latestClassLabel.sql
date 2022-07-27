UPDATE review
	SET latest_class_label =
		CASE
			WHEN (portfolio_name != 'AI Inventory') THEN primary_class_label
			WHEN (poc_agree_label = 'No') THEN poc_class_label
			WHEN (service_agree_label = 'No') THEN service_class_label
			ELSE primary_class_label
		END;