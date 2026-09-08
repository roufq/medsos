import os

files = [
    "c:/laragon/www/medsos/resources/views/backend/dashboard_admin_ikhtisar_v3_new_brand.go",
    "c:/laragon/www/medsos/resources/views/backend/dashboard_admin_manajemen_pengguna_v2.go",
    "c:/laragon/www/medsos/resources/views/backend/dashboard_admin_moderasi_konten_new_brand.go",
    "c:/laragon/www/medsos/resources/views/backend/dashboard_admin_pengaturan_sistem_new_brand.go"
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace("return dom.Render(w, page)", "return page.Render(w)")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
