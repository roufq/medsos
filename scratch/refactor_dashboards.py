import os
import re

files = [
    "c:/laragon/www/medsos/resources/views/backend/dashboard_admin_ikhtisar_v3_new_brand.go",
    "c:/laragon/www/medsos/resources/views/backend/dashboard_admin_manajemen_pengguna_v2.go",
    "c:/laragon/www/medsos/resources/views/backend/dashboard_admin_moderasi_konten_new_brand.go",
    "c:/laragon/www/medsos/resources/views/backend/dashboard_admin_pengaturan_sistem_new_brand.go"
]

menu_map = {
    "dashboard_admin_ikhtisar_v3_new_brand.go": "Overview",
    "dashboard_admin_manajemen_pengguna_v2.go": "Users",
    "dashboard_admin_moderasi_konten_new_brand.go": "Reports",
    "dashboard_admin_pengaturan_sistem_new_brand.go": "Settings",
}

def extract_balanced(text, start_idx):
    open_count = 1
    idx = start_idx + 1
    while idx < len(text) and open_count > 0:
        if text[idx] == '(':
            open_count += 1
        elif text[idx] == ')':
            open_count -= 1
        idx += 1
    return text[start_idx:idx], idx

for filepath in files:
    if not os.path.exists(filepath):
        continue
        
    filename = os.path.basename(filepath)
    menu_name = menu_map.get(filename, "Overview")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    func_match = re.search(r'func\s+Render[A-Za-z0-9_]+\s*\([^)]+\)\s*error\s*\{', content)
    if not func_match:
        continue
    
    main_idx = content.find('dom.Main(')
    if main_idx == -1:
        continue
        
    main_content, end_main_idx = extract_balanced(content, main_idx + len('dom.Main') )
    main_full = 'dom.Main' + main_content
    
    div_idx = main_full.find('dom.Div(')
    if div_idx == -1:
        continue
        
    inner_content = main_full[div_idx:-1]
    
    # Strip any trailing commas and whitespaces
    inner_content = inner_content.rstrip(', \t\n\r')
    
    sig = content[:func_match.end()]
    
    new_content = sig + f"""
	page := LayoutAdmin("Connect Modern - Admin Dashboard", "{menu_name}",
		{inner_content},
	)
	return dom.Render(w, page)
}}
"""

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"Successfully refactored {filename}")
