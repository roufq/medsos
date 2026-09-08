import os

filepath = "c:/laragon/www/medsos/resources/views/backend/dashboard_admin_pengaturan_sistem_new_brand.go"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("				,\n	)\n	return dom.Render(w page)\n}", "	)\n	return dom.Render(w, page)\n}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"Fixed {filepath}")
