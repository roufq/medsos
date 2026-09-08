import os

files = [
    "c:/laragon/www/medsos/resources/views/backend/dashboard_admin_manajemen_pengguna_v2.go",
    "c:/laragon/www/medsos/resources/views/backend/dashboard_admin_moderasi_konten_new_brand.go",
    "c:/laragon/www/medsos/resources/views/backend/dashboard_admin_pengaturan_sistem_new_brand.go"
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The trailing comma is right before \n\t)
    # Usually looks like:
    # 			,
    # 	)
    # Let's replace the last occurrence of ',' before ')'
    
    parts = content.rsplit(',', 1)
    if len(parts) == 2:
        new_content = parts[0] + parts[1]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")
