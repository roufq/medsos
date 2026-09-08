import os
import re

controller_path = "c:/laragon/www/medsos/app/http/controllers/user_controller.go"
view_path = "c:/laragon/www/medsos/resources/views/backend/dashboard_admin_manajemen_pengguna_v2.go"

# 1. Update the Controller
with open(controller_path, 'r', encoding='utf-8') as f:
    ctrl_content = f.read()

ctrl_content = ctrl_content.replace(
    "	var buf bytes.Buffer\n	_ = backend.RenderDashboardAdminManajemenPenggunaV2(&buf)\n	return c.Response().Data(http.StatusOK, \"text/html; charset=utf-8\", buf.Bytes())",
    """	allUsers, _ := h.userService.ListAll()
	var buf bytes.Buffer
	_ = backend.RenderDashboardAdminManajemenPenggunaV2(&buf, allUsers)
	return c.Response().Data(http.StatusOK, "text/html; charset=utf-8", buf.Bytes())"""
)

with open(controller_path, 'w', encoding='utf-8') as f:
    f.write(ctrl_content)

# 2. Update the View
with open(view_path, 'r', encoding='utf-8') as f:
    view_content = f.read()

import_repl = """import (
	"goravel/app/models"
	"goravel/resources/views/backend/dom"
	"io"
	"strings"
)"""
view_content = re.sub(r'import\s*\(\s*"goravel/resources/views/backend/dom"\s*"io"\s*\)', import_repl, view_content)

view_content = view_content.replace(
    "func RenderDashboardAdminManajemenPenggunaV2(w io.Writer) error {",
    """func RenderDashboardAdminManajemenPenggunaV2(w io.Writer, users []models.User) error {
	var userRows []dom.Node
	for _, u := range users {
		initials := ""
		if len(u.Name) > 0 {
			parts := strings.Split(u.Name, " ")
			if len(parts) >= 2 {
				if len(parts[0]) > 0 && len(parts[1]) > 0 {
					initials = string(parts[0][0]) + string(parts[1][0])
				}
			} else if len(parts) == 1 && len(parts[0]) > 0 {
				initials = string(parts[0][0])
			}
			initials = strings.ToUpper(initials)
		}

		avatarNode := dom.Div(
			[]dom.Attr{
				dom.Class("w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold"),
			},
			dom.Text(initials),
		)
		if u.AvatarURL != nil && *u.AvatarURL != "" {
			avatarNode = dom.Div(
				[]dom.Attr{
					dom.Class("w-10 h-10 rounded-full bg-cover bg-center"),
					dom.Style("background-image: url('" + *u.AvatarURL + "')"),
				},
			)
		}

		roleText := "User"
		if u.Role != "" {
			roleText = u.Role
		}
        
        teamText := "-"
        if u.Company != nil && *u.Company != "" {
            teamText = *u.Company
        }

		userRows = append(userRows, dom.Tr(
			[]dom.Attr{
				dom.Class("hover:bg-surface-container-low/50 transition-colors group"),
			},
			dom.Td(
				[]dom.Attr{dom.Class("px-6 py-4")},
				dom.Input([]dom.Attr{dom.Class("rounded border-border-subtle text-primary focus:ring-primary"), dom.Type("checkbox")}),
			),
			dom.Td(
				[]dom.Attr{dom.Class("px-6 py-4")},
				dom.Div(
					[]dom.Attr{dom.Class("flex items-center gap-3")},
					avatarNode,
					dom.Div(
						[]dom.Attr{dom.Class("flex flex-col")},
						dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md text-text-primary")}, dom.Text(u.Name)),
						dom.Span([]dom.Attr{dom.Class("text-[12px] text-text-secondary")}, dom.Text(u.Email)),
					),
				),
			),
			dom.Td(
				[]dom.Attr{dom.Class("px-6 py-4")},
				dom.Span([]dom.Attr{dom.Class("px-2 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-text-primary")}, dom.Text(roleText)),
			),
			dom.Td(
				[]dom.Attr{dom.Class("px-6 py-4")},
				dom.Div(
					[]dom.Attr{dom.Class("flex items-center gap-2 px-2 py-1 bg-success/10 rounded-full w-fit")},
					dom.Div([]dom.Attr{dom.Class("w-1.5 h-1.5 rounded-full bg-success")}),
					dom.Span([]dom.Attr{dom.Class("font-label-sm text-label-sm text-success")}, dom.Text("Active")),
				),
			),
			dom.Td(
				[]dom.Attr{dom.Class("px-6 py-4 font-body-md text-body-md text-text-primary")},
				dom.Text(teamText),
			),
			dom.Td(
				[]dom.Attr{dom.Class("px-6 py-4 font-body-md text-body-md text-text-secondary")},
				dom.Text("Active Now"),
			),
			dom.Td(
				[]dom.Attr{dom.Class("px-6 py-4 text-right")},
				dom.Button(
					[]dom.Attr{dom.Class("p-2 text-text-secondary hover:text-primary transition-colors")},
					dom.Span([]dom.Attr{dom.Class("material-symbols-outlined")}, dom.Text("more_vert")),
				),
			),
		))
	}
"""
)

tbody_start_idx = view_content.find('dom.Tbody(')
if tbody_start_idx != -1:
    open_count = 1
    idx = tbody_start_idx + len('dom.Tbody(')
    while idx < len(view_content) and open_count > 0:
        if view_content[idx] == '(':
            open_count += 1
        elif view_content[idx] == ')':
            open_count -= 1
        idx += 1
    
    tbody_full = view_content[tbody_start_idx:idx]
    
    new_tbody = """dom.Tbody(
									[]dom.Attr{
										dom.Class("divide-y divide-border-subtle"),
									},
									userRows...,
								)"""
    
    view_content = view_content.replace(tbody_full, new_tbody)

# Since we use `userRows...`, it's passing multiple dom.Node items. This is perfectly valid in Go variadic functions.
with open(view_path, 'w', encoding='utf-8') as f:
    f.write(view_content)
    
print("Successfully refactored user management dashboard!")
