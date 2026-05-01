-- Test with one row to confirm fix works before going to all 71
SELECT * FROM public.import_trucking_accounts('[
  {"ext": 1000, "name": "Amwins (Amwins Group, Inc.)", "address_1": "4725 Piedmont Row Drive, Suite 600", "city": "Charlotte", "state": "NC", "postal_code": "28210", "country": "USA", "phone": "704-749-2700", "web": "https://www.amwins.com/", "email": "info@amwins.com (inferred)", "linkedin": null, "account_type_code": "WHOLESALER"}
]'::jsonb);