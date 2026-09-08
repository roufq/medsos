package backend

import (
	"fmt"
	"io"

	"goravel/app/models"
	"goravel/resources/views/backend/dom"
)

func generateUserRows(users []models.User) []dom.Node {
	var rows []dom.Node
	for _, u := range users {
		var roleBadge dom.Node
		if u.Role == models.RoleAdmin {
			roleBadge = dom.Span(
				[]dom.Attr{
					dom.Class("px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full"),
				},
				dom.Text("Admin"),
			)
		} else {
			roleBadge = dom.Span(
				[]dom.Attr{
					dom.Class("px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs font-bold rounded-full"),
				},
				dom.Text("User"),
			)
		}

		avatarSrc := "https://lh3.googleusercontent.com/aida-public/AB6AXuBiFPuGKCFLIEayhRUHxWa_WzQLiih1ZAFtQD2TxISaMtad0i54pDuhhORftjUv4IcLPNjE3z-m6dkOkFkxZ8mrz9aDekEw4oR4xhqoK0g38A5EcJAb4eTq5aKqS2yATMzCvs1Iw7SIWK5_ROnlMOyS7LmetppDrBoem_sCf306rPD1VClBRSvMW1hyVBm093IKmSiB9xAuq9rACOZrrxSvZjTvmd0ovLppQ0eCkJ-1BJXpvXNnxfMRpF6S590_8ihjQ3Z40qVBNpY"
		if u.AvatarURL != nil && *u.AvatarURL != "" {
			avatarSrc = *u.AvatarURL
		}

		rows = append(rows, dom.Tr(
			[]dom.Attr{
				dom.Class("hover:bg-surface-bright transition-colors group"),
			},
			dom.Td(
				[]dom.Attr{
					dom.Class("px-6 py-4"),
				},
				dom.Div(
					[]dom.Attr{
						dom.Class("flex items-center gap-3"),
					},
					dom.Div(
						[]dom.Attr{
							dom.Class("w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-border-subtle"),
						},
						dom.Img(
							[]dom.Attr{
								dom.Class("w-full h-full object-cover"),
								dom.Src(avatarSrc),
							},
						),
					),
					dom.Div(
						[]dom.Attr{},
						dom.P(
							[]dom.Attr{
								dom.Class("font-label-md text-label-md text-text-primary"),
							},
							dom.Text(u.Name),
						),
						dom.P(
							[]dom.Attr{
								dom.Class("text-xs text-text-secondary"),
							},
							dom.Text(fmt.Sprintf("@user_%d", u.ID)),
						),
					),
				),
			),
			dom.Td(
				[]dom.Attr{
					dom.Class("px-6 py-4 font-body-md text-body-md text-text-secondary"),
				},
				dom.Text(u.Email),
			),
			dom.Td(
				[]dom.Attr{
					dom.Class("px-6 py-4"),
				},
				roleBadge,
			),
			dom.Td(
				[]dom.Attr{
					dom.Class("px-6 py-4"),
				},
				dom.Div(
					[]dom.Attr{
						dom.Class("flex items-center gap-2"),
					},
					dom.Span(
						[]dom.Attr{
							dom.Class("w-2 h-2 rounded-full bg-success"),
						},
					),
					dom.Span(
						[]dom.Attr{
							dom.Class("font-label-sm text-label-sm text-text-primary"),
						},
						dom.Text("Active"),
					),
				),
			),
			dom.Td(
				[]dom.Attr{
					dom.Class("px-6 py-4 font-body-md text-body-md text-text-secondary"),
				},
				dom.Text(u.CreatedAt.Format("Jan 02, 2006")),
			),
			dom.Td(
				[]dom.Attr{
					dom.Class("px-6 py-4 text-right"),
				},
				dom.Div(
					[]dom.Attr{
						dom.Class("flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"),
					},
					dom.Button(
						[]dom.Attr{
							dom.Class("p-2 text-primary hover:bg-[#E7F3FF] rounded-lg transition-colors"),
							dom.CustomAttr("title", "Edit"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined"),
							},
							dom.Text("edit"),
						),
					),
					dom.Button(
						[]dom.Attr{
							dom.Class("p-2 text-error hover:bg-error-container/30 rounded-lg transition-colors"),
							dom.CustomAttr("title", "Ban User"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined"),
							},
							dom.Text("block"),
						),
					),
				),
			),
		))
	}
	return rows
}

func RenderDashboardAdminManajemenPengguna(w io.Writer, users []models.User) error {
	page := dom.Html(
		[]dom.Attr{
			dom.Class("light"),
			dom.Lang("en"),
		},
		dom.Head(
			[]dom.Attr{},
			dom.Meta(
				[]dom.Attr{
					dom.CustomAttr("charset", "utf-8"),
				},
			),
			dom.Meta(
				[]dom.Attr{
					dom.ContentAttr("width=device-width, initial-scale=1.0"),
					dom.Name("viewport"),
				},
			),
			dom.TitleEl(
				[]dom.Attr{},
				dom.Text("User Management | Connect Modern Admin"),
			),
			dom.ScriptEl(
				[]dom.Attr{
					dom.Src("https://cdn.tailwindcss.com?plugins=forms,container-queries"),
				},
			),
			dom.Link(
				[]dom.Attr{
					dom.Href("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"),
					dom.Rel("stylesheet"),
				},
			),
			dom.Link(
				[]dom.Attr{
					dom.Href("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"),
					dom.Rel("stylesheet"),
				},
			),
			dom.Link(
				[]dom.Attr{
					dom.Href("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"),
					dom.Rel("stylesheet"),
				},
			),
			dom.ScriptEl(
				[]dom.Attr{
					dom.Id("tailwind-config"),
				},
				dom.Text("tailwind.config = {\n      darkMode: \"class\",\n      theme: {\n        extend: {\n          \"colors\": {\n                  \"on-primary\": \"#ffffff\",\n                  \"surface-bright\": \"#f7f9fc\",\n                  \"on-tertiary-fixed\": \"#380d00\",\n                  \"secondary\": \"#54606a\",\n                  \"on-tertiary-container\": \"#fff7f5\",\n                  \"on-primary-container\": \"#f9f7ff\",\n                  \"on-secondary-fixed\": \"#111d25\",\n                  \"inverse-surface\": \"#2d3133\",\n                  \"on-tertiary\": \"#ffffff\",\n                  \"on-tertiary-fixed-variant\": \"#812800\",\n                  \"surface-container-lowest\": \"#ffffff\",\n                  \"surface-container-low\": \"#f2f4f7\",\n                  \"success\": \"#31A24C\",\n                  \"primary-fixed-dim\": \"#b3c5ff\",\n                  \"tertiary-fixed-dim\": \"#ffb59b\",\n                  \"outline\": \"#727687\",\n                  \"border-subtle\": \"#CED0D4\",\n                  \"on-secondary\": \"#ffffff\",\n                  \"on-surface\": \"#191c1e\",\n                  \"on-secondary-fixed-variant\": \"#3d4852\",\n                  \"surface-container-highest\": \"#e0e3e6\",\n                  \"tertiary\": \"#a13400\",\n                  \"secondary-fixed\": \"#d8e4f0\",\n                  \"secondary-container\": \"#d8e4f0\",\n                  \"surface\": \"#f7f9fc\",\n                  \"inverse-primary\": \"#b3c5ff\",\n                  \"surface-dim\": \"#d8dadd\",\n                  \"on-primary-fixed-variant\": \"#003fa5\",\n                  \"surface-card\": \"#FFFFFF\",\n                  \"tertiary-fixed\": \"#ffdbcf\",\n                  \"surface-container\": \"#eceef1\",\n                  \"primary-container\": \"#0866ff\",\n                  \"primary-fixed\": \"#dbe1ff\",\n                  \"outline-variant\": \"#c2c6d8\",\n                  \"on-secondary-container\": \"#5a6670\",\n                  \"on-background\": \"#191c1e\",\n                  \"text-secondary\": \"#65676B\",\n                  \"inverse-on-surface\": \"#eff1f4\",\n                  \"surface-container-high\": \"#e6e8eb\",\n                  \"on-primary-fixed\": \"#00184a\",\n                  \"tertiary-container\": \"#cb4400\",\n                  \"text-primary\": \"#1C1E21\",\n                  \"primary\": \"#0050cd\",\n                  \"error\": \"#F02849\",\n                  \"on-error\": \"#ffffff\",\n                  \"background\": \"#f7f9fc\",\n                  \"error-container\": \"#ffdad6\",\n                  \"surface-variant\": \"#e0e3e6\",\n                  \"on-surface-variant\": \"#424656\",\n                  \"secondary-fixed-dim\": \"#bcc8d3\",\n                  \"on-error-container\": \"#93000a\",\n                  \"surface-tint\": \"#0054d7\"\n          },\n          \"borderRadius\": {\n                  \"DEFAULT\": \"0.25rem\",\n                  \"lg\": \"0.5rem\",\n                  \"xl\": \"0.75rem\",\n                  \"full\": \"9999px\"\n          },\n          \"spacing\": {\n                  \"margin-mobile\": \"16px\",\n                  \"unit\": \"4px\",\n                  \"max-width-container\": \"1280px\",\n                  \"margin-desktop\": \"24px\",\n                  \"max-width-feed\": \"680px\",\n                  \"gutter\": \"16px\"\n          },\n          \"fontFamily\": {\n                  \"headline-lg\": [\"Inter\"],\n                  \"body-lg\": [\"Inter\"],\n                  \"label-md\": [\"Inter\"],\n                  \"display-lg\": [\"Inter\"],\n                  \"label-sm\": [\"Inter\"],\n                  \"headline-lg-mobile\": [\"Inter\"],\n                  \"body-md\": [\"Inter\"],\n                  \"headline-md\": [\"Inter\"]\n          },\n          \"fontSize\": {\n                  \"headline-lg\": [\"24px\", {\"lineHeight\": \"1.3\", \"fontWeight\": \"700\"}],\n                  \"body-lg\": [\"16px\", {\"lineHeight\": \"1.5\", \"fontWeight\": \"400\"}],\n                  \"label-md\": [\"13px\", {\"lineHeight\": \"1.2\", \"letterSpacing\": \"0.01em\", \"fontWeight\": \"600\"}],\n                  \"display-lg\": [\"32px\", {\"lineHeight\": \"1.2\", \"letterSpacing\": \"-0.02em\", \"fontWeight\": \"700\"}],\n                  \"label-sm\": [\"12px\", {\"lineHeight\": \"1.2\", \"fontWeight\": \"500\"}],\n                  \"headline-lg-mobile\": [\"20px\", {\"lineHeight\": \"1.3\", \"fontWeight\": \"700\"}],\n                  \"body-md\": [\"14px\", {\"lineHeight\": \"1.5\", \"fontWeight\": \"400\"}],\n                  \"headline-md\": [\"20px\", {\"lineHeight\": \"1.4\", \"fontWeight\": \"600\"}]\n          }\n        },\n      },\n    }"),
			),
			dom.StyleEl(
				[]dom.Attr{},
				dom.Text("body {\n      font-family: 'Inter', sans-serif;\n      background-color: #f7f9fc;\n    }\n    .material-symbols-outlined {\n      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;\n    }\n    .custom-scrollbar::-webkit-scrollbar {\n      width: 6px;\n    }\n    .custom-scrollbar::-webkit-scrollbar-track {\n      background: transparent;\n    }\n    .custom-scrollbar::-webkit-scrollbar-thumb {\n      background: #e0e3e6;\n      border-radius: 10px;\n    }\n    .table-container {\n      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);\n    }"),
			),
		),
		dom.Body(
			[]dom.Attr{
				dom.Class("bg-background text-on-background"),
			},
			dom.Aside(
				[]dom.Attr{
					dom.Class("flex flex-col h-screen p-4 gap-2 bg-surface-container-lowest dark:bg-inverse-surface h-full w-64 fixed left-0 top-0 border-r border-border-subtle z-50"),
				},
				dom.Div(
					[]dom.Attr{
						dom.Class("mb-8 px-2"),
					},
					dom.H1(
						[]dom.Attr{
							dom.Class("font-headline-lg text-headline-lg font-black text-primary"),
						},
						dom.Text("Connect Modern"),
					),
					dom.P(
						[]dom.Attr{
							dom.Class("font-label-md text-label-md text-secondary"),
						},
						dom.Text("Control Center"),
					),
				),
				dom.Nav(
					[]dom.Attr{
						dom.Class("flex-1 flex flex-col gap-1"),
					},
					dom.A(
						[]dom.Attr{
							dom.Class("flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out"),
							dom.Href("/web/admin/dashboard"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined"),
							},
							dom.Text("dashboard"),
						),
						dom.Span(
							[]dom.Attr{
								dom.Class("font-label-md text-label-md"),
							},
							dom.Text("Overview"),
						),
					),
					dom.A(
						[]dom.Attr{
							dom.Class("flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container font-bold rounded-lg duration-200 ease-in-out"),
							dom.Href("/web/admin/users"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined"),
							},
							dom.Text("group"),
						),
						dom.Span(
							[]dom.Attr{
								dom.Class("font-label-md text-label-md"),
							},
							dom.Text("Users"),
						),
					),
					dom.A(
						[]dom.Attr{
							dom.Class("flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-low rounded-lg duration-200 ease-in-out transition-all"),
							dom.Href("/web/admin/moderation"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined"),
							},
							dom.Text("chat_bubble"),
						),
						dom.Span(
							[]dom.Attr{
								dom.Class("font-label-md text-label-md"),
							},
							dom.Text("Posts"),
						),
					),
					dom.A(
						[]dom.Attr{
							dom.Class("flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-low rounded-lg duration-200 ease-in-out transition-all"),
							dom.Href("#"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined"),
							},
							dom.Text("assessment"),
						),
						dom.Span(
							[]dom.Attr{
								dom.Class("font-label-md text-label-md"),
							},
							dom.Text("Reports"),
						),
					),
					dom.A(
						[]dom.Attr{
							dom.Class("flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-low rounded-lg duration-200 ease-in-out transition-all"),
							dom.Href("/web/admin/settings"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined"),
							},
							dom.Text("settings"),
						),
						dom.Span(
							[]dom.Attr{
								dom.Class("font-label-md text-label-md"),
							},
							dom.Text("Settings"),
						),
					),
				),
				dom.Div(
					[]dom.Attr{
						dom.Class("mt-auto pt-4 border-t border-border-subtle flex flex-col gap-1"),
					},
					dom.Button(
						[]dom.Attr{
							dom.Class("w-full mb-4 py-3 bg-primary-container text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined"),
								dom.Style("font-variation-settings: 'FILL' 1;"),
							},
							dom.Text("add"),
						),
						dom.Span(
							[]dom.Attr{
								dom.Class("font-label-md text-label-md"),
							},
							dom.Text("Generate Report"),
						),
					),
					dom.A(
						[]dom.Attr{
							dom.Class("flex items-center gap-3 px-4 py-2 text-secondary hover:bg-surface-container-low rounded-lg transition-all"),
							dom.Href("#"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined"),
							},
							dom.Text("contact_support"),
						),
						dom.Span(
							[]dom.Attr{
								dom.Class("font-label-md text-label-md"),
							},
							dom.Text("Support"),
						),
					),
					dom.A(
						[]dom.Attr{
							dom.Class("flex items-center gap-3 px-4 py-2 text-secondary hover:bg-surface-container-low rounded-lg transition-all"),
							dom.Href("/web/logout"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined"),
							},
							dom.Text("logout"),
						),
						dom.Span(
							[]dom.Attr{
								dom.Class("font-label-md text-label-md"),
							},
							dom.Text("Logout"),
						),
					),
				),
			),
			dom.Header(
				[]dom.Attr{
					dom.Class("flex justify-between items-center h-16 px-margin-desktop sticky top-0 z-40 bg-surface dark:bg-inverse-surface shadow-sm ml-64"),
				},
				dom.Div(
					[]dom.Attr{
						dom.Class("flex items-center gap-4"),
					},
					dom.H2(
						[]dom.Attr{
							dom.Class("font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary"),
						},
						dom.Text("User Management"),
					),
				),
				dom.Div(
					[]dom.Attr{
						dom.Class("flex items-center gap-4"),
					},
					dom.Button(
						[]dom.Attr{
							dom.Class("p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer active:opacity-80 rounded-full"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined"),
							},
							dom.Text("notifications"),
						),
					),
					dom.Button(
						[]dom.Attr{
							dom.Class("p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer active:opacity-80 rounded-full"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined"),
							},
							dom.Text("help"),
						),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("flex items-center gap-2 ml-2 pl-4 border-l border-border-subtle"),
						},
						dom.Div(
							[]dom.Attr{
								dom.Class("w-8 h-8 rounded-full overflow-hidden border border-border-subtle bg-surface-container-high"),
							},
							dom.Img(
								[]dom.Attr{
									dom.Class("w-full h-full object-cover"),
									dom.CustomAttr("data-alt", "A professional high-quality headshot of a corporate administrator, looking directly at the camera with a confident smile. The background is a blurred high-end modern office with soft blue and white highlights. Lighting is studio-quality, clean and flattering, matching the professional Connect Modern aesthetic."),
									dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuAJHtDYLr4vZibw0KJDSiPJqE_N0HsOqZj0peMsVxtpO1YeGYPPuTp8S0uSwgLkx_agQvnGCXOycSUE9E1PnZodJvlwyWHXJtsOk-09vSi1xCPFU5dL4HAOWa0ySJUdTM7FhoJdZQ1mzJKxu_Va0Itj7yfB8ObSO6U4cJr-SALJkBaA76ih9vK1XgUYq7RTwS4O9DUNwHlsoWFXFjVzk0J99SaGqG3LIygs6sTegDPxMRiKEeGDbVh1eLfktz5CkOJgiuPElstg_Og"),
								},
							),
						),
						dom.Span(
							[]dom.Attr{
								dom.Class("font-label-md text-label-md text-on-surface"),
							},
							dom.Text("Admin User"),
						),
					),
				),
			),
			dom.Main(
				[]dom.Attr{
					dom.Class("ml-64 p-margin-desktop min-h-[calc(100vh-64px)]"),
				},
				dom.Div(
					[]dom.Attr{
						dom.Class("mb-8 flex flex-wrap items-center justify-between gap-4"),
					},
					dom.Div(
						[]dom.Attr{
							dom.Class("relative w-full max-w-md"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"),
							},
							dom.Text("search"),
						),
						dom.Input(
							[]dom.Attr{
								dom.Class("w-full pl-12 pr-4 py-3 bg-[#F0F2F5] border-none rounded-full font-body-md text-body-md focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-on-surface-variant"),
								dom.Placeholder("Search by name, email or role..."),
								dom.Type("text"),
							},
						),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("flex items-center gap-3"),
						},
						dom.Button(
							[]dom.Attr{
								dom.Class("flex items-center gap-2 px-5 py-3 bg-[#E7F3FF] text-primary font-bold rounded-lg hover:bg-surface-container-high transition-colors"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("filter_list"),
							),
							dom.Span(
								[]dom.Attr{
									dom.Class("font-label-md text-label-md"),
								},
								dom.Text("Filters"),
							),
						),
						dom.Button(
							[]dom.Attr{
								dom.Class("flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary font-bold rounded-lg hover:opacity-90 shadow-md transition-all active:scale-95"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
									dom.Style("font-variation-settings: 'FILL' 1;"),
								},
								dom.Text("person_add"),
							),
							dom.Span(
								[]dom.Attr{
									dom.Class("font-label-md text-label-md"),
								},
								dom.Text("Add User"),
							),
						),
					),
				),
				dom.Div(
					[]dom.Attr{
						dom.Class("bg-surface-card rounded-xl border border-border-subtle overflow-hidden table-container"),
					},
					dom.Div(
						[]dom.Attr{
							dom.Class("overflow-x-auto custom-scrollbar"),
						},
						dom.Table(
							[]dom.Attr{
								dom.Class("w-full text-left border-collapse"),
							},
							dom.Thead(
								[]dom.Attr{},
								dom.Tr(
									[]dom.Attr{
										dom.Class("bg-surface-container-low border-b border-border-subtle"),
									},
									dom.Th(
										[]dom.Attr{
											dom.Class("px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider"),
										},
										dom.Text("Name"),
									),
									dom.Th(
										[]dom.Attr{
											dom.Class("px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider"),
										},
										dom.Text("Email"),
									),
									dom.Th(
										[]dom.Attr{
											dom.Class("px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider"),
										},
										dom.Text("Role"),
									),
									dom.Th(
										[]dom.Attr{
											dom.Class("px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider"),
										},
										dom.Text("Status"),
									),
									dom.Th(
										[]dom.Attr{
											dom.Class("px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider"),
										},
										dom.Text("Joined Date"),
									),
									dom.Th(
										[]dom.Attr{
											dom.Class("px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right"),
										},
										dom.Text("Actions"),
									),
								),
							),
							dom.Tbody(
								[]dom.Attr{
									dom.Class("divide-y divide-border-subtle"),
								},
								generateUserRows(users)...,
							),
						),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("px-6 py-4 bg-surface-container-low flex items-center justify-between border-t border-border-subtle"),
						},
						dom.P(
							[]dom.Attr{
								dom.Class("font-label-sm text-label-sm text-text-secondary"),
							},
							dom.Text("Showing 1 to 5 of 1,248 users"),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("flex items-center gap-2"),
							},
							dom.Button(
								[]dom.Attr{
									dom.Class("p-2 hover:bg-surface-container-high rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"),
									dom.Disabled(),
								},
								dom.Span(
									[]dom.Attr{
										dom.Class("material-symbols-outlined"),
									},
									dom.Text("chevron_left"),
								),
							),
							dom.Button(
								[]dom.Attr{
									dom.Class("w-8 h-8 flex items-center justify-center bg-primary text-on-primary font-bold rounded-lg text-xs"),
								},
								dom.Text("1"),
							),
							dom.Button(
								[]dom.Attr{
									dom.Class("w-8 h-8 flex items-center justify-center hover:bg-surface-container-high text-text-primary font-bold rounded-lg text-xs transition-colors"),
								},
								dom.Text("2"),
							),
							dom.Button(
								[]dom.Attr{
									dom.Class("w-8 h-8 flex items-center justify-center hover:bg-surface-container-high text-text-primary font-bold rounded-lg text-xs transition-colors"),
								},
								dom.Text("3"),
							),
							dom.Span(
								[]dom.Attr{
									dom.Class("text-text-secondary"),
								},
								dom.Text("..."),
							),
							dom.Button(
								[]dom.Attr{
									dom.Class("w-8 h-8 flex items-center justify-center hover:bg-surface-container-high text-text-primary font-bold rounded-lg text-xs transition-colors"),
								},
								dom.Text("250"),
							),
							dom.Button(
								[]dom.Attr{
									dom.Class("p-2 hover:bg-surface-container-high rounded-lg transition-colors"),
								},
								dom.Span(
									[]dom.Attr{
										dom.Class("material-symbols-outlined"),
									},
									dom.Text("chevron_right"),
								),
							),
						),
					),
				),
				dom.Div(
					[]dom.Attr{
						dom.Class("mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"),
					},
					dom.Div(
						[]dom.Attr{
							dom.Class("bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-1"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("text-text-secondary font-label-sm text-label-sm uppercase tracking-wide"),
							},
							dom.Text("Total Users"),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("flex items-baseline gap-2"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("font-display-lg text-display-lg text-text-primary"),
								},
								dom.Text("12,482"),
							),
							dom.Span(
								[]dom.Attr{
									dom.Class("text-success font-bold text-xs"),
								},
								dom.Text("+12%"),
							),
						),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-1"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("text-text-secondary font-label-sm text-label-sm uppercase tracking-wide"),
							},
							dom.Text("Active Now"),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("flex items-baseline gap-2"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("font-display-lg text-display-lg text-text-primary"),
								},
								dom.Text("843"),
							),
							dom.Span(
								[]dom.Attr{
									dom.Class("text-primary font-bold text-xs"),
								},
								dom.Text("Live"),
							),
						),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("bg-surface-card p-5 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-1"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("text-text-secondary font-label-sm text-label-sm uppercase tracking-wide"),
							},
							dom.Text("Reported Accounts"),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("flex items-baseline gap-2"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("font-display-lg text-display-lg text-text-primary"),
								},
								dom.Text("24"),
							),
							dom.Span(
								[]dom.Attr{
									dom.Class("text-error font-bold text-xs"),
								},
								dom.Text("High"),
							),
						),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("bg-primary-container p-5 rounded-xl border border-primary shadow-lg flex flex-col gap-1 text-on-primary"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("opacity-80 font-label-sm text-label-sm uppercase tracking-wide"),
							},
							dom.Text("New Today"),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("flex items-baseline gap-2"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("font-display-lg text-display-lg"),
								},
								dom.Text("+142"),
							),
							dom.Span(
								[]dom.Attr{
									dom.Class("opacity-80 font-bold text-xs"),
								},
								dom.Text("Verified"),
							),
						),
					),
				),
			),
			dom.ScriptEl(
				[]dom.Attr{},
				dom.Text("// Subtle hover effect for the table rows\n    document.querySelectorAll('tbody tr').forEach(row => {\n      row.addEventListener('mouseenter', () => {\n        row.style.transform = 'translateX(4px)';\n        row.style.transition = 'transform 0.2s ease-out';\n      });\n      row.addEventListener('mouseleave', () => {\n        row.style.transform = 'translateX(0)';\n      });\n    });\n\n    // Simple search interaction simulation\n    const searchInput = document.querySelector('input[type=\"text\"]');\n    searchInput.addEventListener('input', (e) => {\n      console.log('Searching for:', e.target.value);\n      // In a real app, this would trigger a debounced fetch or filter logic\n    });"),
			),
		),
	)
	return page.Render(w)
}
