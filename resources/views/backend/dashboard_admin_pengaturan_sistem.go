package backend

import (
	"goravel/resources/views/backend/dom"
	"io"
)

func RenderDashboardAdminPengaturanSistem(w io.Writer) error {
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
				dom.Text("Platform Settings | Connect Modern Admin"),
			),
			dom.ScriptEl(
				[]dom.Attr{
					dom.Src("https://cdn.tailwindcss.com?plugins=forms,container-queries"),
				},
			),
			dom.Link(
				[]dom.Attr{
					dom.Href("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"),
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
				dom.Text("tailwind.config = {\n        darkMode: \"class\",\n        theme: {\n          extend: {\n            \"colors\": {\n                    \"on-primary\": \"#ffffff\",\n                    \"surface-bright\": \"#f7f9fc\",\n                    \"on-tertiary-fixed\": \"#380d00\",\n                    \"secondary\": \"#54606a\",\n                    \"on-tertiary-container\": \"#fff7f5\",\n                    \"on-primary-container\": \"#f9f7ff\",\n                    \"on-secondary-fixed\": \"#111d25\",\n                    \"inverse-surface\": \"#2d3133\",\n                    \"on-tertiary\": \"#ffffff\",\n                    \"on-tertiary-fixed-variant\": \"#812800\",\n                    \"surface-container-lowest\": \"#ffffff\",\n                    \"surface-container-low\": \"#f2f4f7\",\n                    \"success\": \"#31A24C\",\n                    \"primary-fixed-dim\": \"#b3c5ff\",\n                    \"tertiary-fixed-dim\": \"#ffb59b\",\n                    \"outline\": \"#727687\",\n                    \"border-subtle\": \"#CED0D4\",\n                    \"on-secondary\": \"#ffffff\",\n                    \"on-surface\": \"#191c1e\",\n                    \"on-secondary-fixed-variant\": \"#3d4852\",\n                    \"surface-container-highest\": \"#e0e3e6\",\n                    \"tertiary\": \"#a13400\",\n                    \"secondary-fixed\": \"#d8e4f0\",\n                    \"secondary-container\": \"#d8e4f0\",\n                    \"surface\": \"#f7f9fc\",\n                    \"inverse-primary\": \"#b3c5ff\",\n                    \"surface-dim\": \"#d8dadd\",\n                    \"on-primary-fixed-variant\": \"#003fa5\",\n                    \"surface-card\": \"#FFFFFF\",\n                    \"tertiary-fixed\": \"#ffdbcf\",\n                    \"surface-container\": \"#eceef1\",\n                    \"primary-container\": \"#0866ff\",\n                    \"primary-fixed\": \"#dbe1ff\",\n                    \"outline-variant\": \"#c2c6d8\",\n                    \"on-secondary-container\": \"#5a6670\",\n                    \"on-background\": \"#191c1e\",\n                    \"text-secondary\": \"#65676B\",\n                    \"inverse-on-surface\": \"#eff1f4\",\n                    \"surface-container-high\": \"#e6e8eb\",\n                    \"on-primary-fixed\": \"#00184a\",\n                    \"tertiary-container\": \"#cb4400\",\n                    \"text-primary\": \"#1C1E21\",\n                    \"primary\": \"#0050cd\",\n                    \"error\": \"#F02849\",\n                    \"on-error\": \"#ffffff\",\n                    \"background\": \"#f7f9fc\",\n                    \"error-container\": \"#ffdad6\",\n                    \"surface-variant\": \"#e0e3e6\",\n                    \"on-surface-variant\": \"#424656\",\n                    \"secondary-fixed-dim\": \"#bcc8d3\",\n                    \"on-error-container\": \"#93000a\",\n                    \"surface-tint\": \"#0054d7\"\n            },\n            \"borderRadius\": {\n                    \"DEFAULT\": \"0.25rem\",\n                    \"lg\": \"0.5rem\",\n                    \"xl\": \"0.75rem\",\n                    \"full\": \"9999px\"\n            },\n            \"spacing\": {\n                    \"margin-mobile\": \"16px\",\n                    \"unit\": \"4px\",\n                    \"max-width-container\": \"1280px\",\n                    \"margin-desktop\": \"24px\",\n                    \"max-width-feed\": \"680px\",\n                    \"gutter\": \"16px\"\n            },\n            \"fontFamily\": {\n                    \"headline-lg\": [\"Inter\"],\n                    \"body-lg\": [\"Inter\"],\n                    \"label-md\": [\"Inter\"],\n                    \"display-lg\": [\"Inter\"],\n                    \"label-sm\": [\"Inter\"],\n                    \"headline-lg-mobile\": [\"Inter\"],\n                    \"body-md\": [\"Inter\"],\n                    \"headline-md\": [\"Inter\"]\n            },\n            \"fontSize\": {\n                    \"headline-lg\": [\"24px\", {\"lineHeight\": \"1.3\", \"fontWeight\": \"700\"}],\n                    \"body-lg\": [\"16px\", {\"lineHeight\": \"1.5\", \"fontWeight\": \"400\"}],\n                    \"label-md\": [\"13px\", {\"lineHeight\": \"1.2\", \"letterSpacing\": \"0.01em\", \"fontWeight\": \"600\"}],\n                    \"display-lg\": [\"32px\", {\"lineHeight\": \"1.2\", \"letterSpacing\": \"-0.02em\", \"fontWeight\": \"700\"}],\n                    \"label-sm\": [\"12px\", {\"lineHeight\": \"1.2\", \"fontWeight\": \"500\"}],\n                    \"headline-lg-mobile\": [\"20px\", {\"lineHeight\": \"1.3\", \"fontWeight\": \"700\"}],\n                    \"body-md\": [\"14px\", {\"lineHeight\": \"1.5\", \"fontWeight\": \"400\"}],\n                    \"headline-md\": [\"20px\", {\"lineHeight\": \"1.4\", \"fontWeight\": \"600\"}]\n            }\n          },\n        },\n      }"),
			),
			dom.StyleEl(
				[]dom.Attr{},
				dom.Text("body {\n            background-color: #f7f9fc;\n            font-family: 'Inter', sans-serif;\n        }\n        .material-symbols-outlined {\n            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;\n        }\n        .glass-panel {\n            background: rgba(255, 255, 255, 0.8);\n            backdrop-filter: blur(8px);\n        }\n        ::-webkit-scrollbar {\n            width: 8px;\n        }\n        ::-webkit-scrollbar-track {\n            background: #f1f1f1;\n        }\n        ::-webkit-scrollbar-thumb {\n            background: #CED0D4;\n            border-radius: 4px;\n        }\n        ::-webkit-scrollbar-thumb:hover {\n            background: #bcc8d3;\n        }"),
			),
		),
		dom.Body(
			[]dom.Attr{
				dom.Class("text-on-surface"),
			},
			dom.Header(
				[]dom.Attr{
					dom.Class("flex justify-between items-center h-16 px-margin-desktop sticky top-0 z-50 bg-surface shadow-sm border-b border-surface-container-high"),
				},
				dom.Div(
					[]dom.Attr{
						dom.Class("flex items-center gap-6"),
					},
					dom.H1(
						[]dom.Attr{
							dom.Class("font-headline-md text-headline-md font-bold text-primary"),
						},
						dom.Text("Connect Modern"),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-1.5 gap-2 border border-border-subtle"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined text-outline text-[20px]"),
							},
							dom.Text("search"),
						),
						dom.Input(
							[]dom.Attr{
								dom.Class("bg-transparent border-none focus:ring-0 text-body-md w-64"),
								dom.Placeholder("Search platform..."),
								dom.Type("text"),
							},
						),
					),
				),
				dom.Div(
					[]dom.Attr{
						dom.Class("flex items-center gap-4"),
					},
					dom.Button(
						[]dom.Attr{
							dom.Class("p-2 hover:bg-surface-container-low transition-colors rounded-full relative cursor-pointer active:opacity-80"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined text-on-surface-variant"),
							},
							dom.Text("notifications"),
						),
						dom.Span(
							[]dom.Attr{
								dom.Class("absolute top-2 right-2 w-2 h-2 bg-error rounded-full"),
							},
						),
					),
					dom.Button(
						[]dom.Attr{
							dom.Class("p-2 hover:bg-surface-container-low transition-colors rounded-full cursor-pointer active:opacity-80"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined text-on-surface-variant"),
							},
							dom.Text("help"),
						),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("flex items-center gap-2 cursor-pointer p-1 hover:bg-surface-container-low rounded-lg transition-colors"),
						},
						dom.Img(
							[]dom.Attr{
								dom.Class("w-8 h-8 rounded-full border border-border-subtle"),
								dom.CustomAttr("data-alt", "A clean, professional headshot of a corporate admin user with a friendly expression. The background is a blurred office setting with soft blue and white tones matching the platform aesthetic. Professional lighting and high-end digital photography style."),
								dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuA6qRGbSSNsCBC6tgN_rC6lpryy7S8dFV8rDqu4EiXPmyZ--k6Q0X1CXSTbx5RsgosphTTDvyfi4q-FQ61uHzCLkEx8TETGFLerptjybQayR8XlZxnxxua9qpSplwWzr1qclj5uJA6YTCtUqeaBpRhO-A7FH0xzuOT8bBfKkfdj21ZMntaZhR-Nu48UYn7ioyxit8Bm310DfRTmFNWKhfUDxpHgKaYk0J2UPxqrAtiRuBtfzxmU6HX8QnciggwcuLlb3uZFlI5Joas"),
							},
						),
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined text-on-surface-variant"),
							},
							dom.Text("account_circle"),
						),
					),
				),
			),
			dom.Div(
				[]dom.Attr{
					dom.Class("flex min-h-screen"),
				},
				dom.Aside(
					[]dom.Attr{
						dom.Class("flex flex-col h-screen p-4 gap-2 h-full w-64 fixed left-0 top-16 bg-surface-container-lowest border-r border-border-subtle hidden lg:flex"),
					},
					dom.Div(
						[]dom.Attr{
							dom.Class("mb-6 px-2"),
						},
						dom.H2(
							[]dom.Attr{
								dom.Class("font-headline-lg text-headline-lg font-black text-primary"),
							},
							dom.Text("Admin Panel"),
						),
						dom.P(
							[]dom.Attr{
								dom.Class("text-label-sm text-on-secondary-container opacity-70"),
							},
							dom.Text("Connect Modern Control"),
						),
					),
					dom.Nav(
						[]dom.Attr{
							dom.Class("flex-1 space-y-1"),
						},
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 px-3 py-2 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"),
								dom.Href("/web/admin/dashboard"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("dashboard"),
							),
							dom.Span(
								[]dom.Attr{},
								dom.Text("Overview"),
							),
						),
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 px-3 py-2 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"),
								dom.Href("/web/admin/users"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("group"),
							),
							dom.Span(
								[]dom.Attr{},
								dom.Text("Users"),
							),
						),
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 px-3 py-2 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"),
								dom.Href("/web/admin/moderation"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("chat_bubble"),
							),
							dom.Span(
								[]dom.Attr{},
								dom.Text("Posts"),
							),
						),
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 px-3 py-2 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"),
								dom.Href("#"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("assessment"),
							),
							dom.Span(
								[]dom.Attr{},
								dom.Text("Reports"),
							),
						),
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 px-3 py-2 bg-secondary-container text-on-secondary-container font-bold rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"),
								dom.Href("/web/admin/settings"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("settings"),
							),
							dom.Span(
								[]dom.Attr{},
								dom.Text("Settings"),
							),
						),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("mt-auto space-y-1 pt-4 border-t border-border-subtle"),
						},
						dom.Button(
							[]dom.Attr{
								dom.Class("w-full text-left flex items-center gap-3 px-3 py-2 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("contact_support"),
							),
							dom.Span(
								[]dom.Attr{},
								dom.Text("Support"),
							),
						),
						dom.A(
							[]dom.Attr{
								dom.Class("w-full text-left flex items-center gap-3 px-3 py-2 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"),
								dom.Href("/web/logout"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("logout"),
							),
							dom.Span(
								[]dom.Attr{},
								dom.Text("Logout"),
							),
						),
						dom.Button(
							[]dom.Attr{
								dom.Class("mt-4 w-full bg-primary text-on-primary py-2.5 rounded-lg font-bold shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"),
							},
							dom.Text("Generate Report"),
						),
					),
				),
				dom.Main(
					[]dom.Attr{
						dom.Class("flex-1 lg:ml-64 p-6 md:p-10"),
					},
					dom.Div(
						[]dom.Attr{
							dom.Class("max-w-[1000px] mx-auto"),
						},
						dom.Header(
							[]dom.Attr{
								dom.Class("mb-10"),
							},
							dom.H2(
								[]dom.Attr{
									dom.Class("font-headline-lg text-headline-lg text-text-primary mb-2"),
								},
								dom.Text("Platform Settings"),
							),
							dom.P(
								[]dom.Attr{
									dom.Class("text-text-secondary font-body-md text-body-md"),
								},
								dom.Text("Manage your application's global configuration, security protocols, and third-party integrations."),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("grid grid-cols-1 md:grid-cols-12 gap-8"),
							},
							dom.Nav(
								[]dom.Attr{
									dom.Class("md:col-span-3 space-y-2"),
									dom.Id("settings-tabs"),
								},
								dom.Button(
									[]dom.Attr{
										dom.Class("tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 bg-surface-card shadow-sm border border-primary/10 text-primary font-bold"),
										dom.CustomAttr("data-tab", "general"),
										dom.CustomAttr("onclick", "switchTab('general')"),
									},
									dom.Span(
										[]dom.Attr{
											dom.Class("material-symbols-outlined"),
										},
										dom.Text("tune"),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-label-md"),
										},
										dom.Text("General"),
									),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-secondary hover:bg-surface-container-low"),
										dom.CustomAttr("data-tab", "security"),
										dom.CustomAttr("onclick", "switchTab('security')"),
									},
									dom.Span(
										[]dom.Attr{
											dom.Class("material-symbols-outlined"),
										},
										dom.Text("shield"),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-label-md"),
										},
										dom.Text("Security"),
									),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-secondary hover:bg-surface-container-low"),
										dom.CustomAttr("data-tab", "storage"),
										dom.CustomAttr("onclick", "switchTab('storage')"),
									},
									dom.Span(
										[]dom.Attr{
											dom.Class("material-symbols-outlined"),
										},
										dom.Text("cloud_queue"),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-label-md"),
										},
										dom.Text("Storage"),
									),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("md:col-span-9"),
								},
								dom.Section(
									[]dom.Attr{
										dom.Class("tab-pane bg-surface-card p-8 rounded-2xl shadow-sm border border-border-subtle animate-in fade-in duration-500"),
										dom.Id("general-content"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("flex items-center gap-4 mb-8"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary"),
											},
											dom.Span(
												[]dom.Attr{
													dom.Class("material-symbols-outlined"),
												},
												dom.Text("tune"),
											),
										),
										dom.Div(
											[]dom.Attr{},
											dom.H3(
												[]dom.Attr{
													dom.Class("font-headline-md text-headline-md"),
												},
												dom.Text("General Configuration"),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("text-label-sm text-text-secondary"),
												},
												dom.Text("Basic platform identity and contact information."),
											),
										),
									),
									dom.Form(
										[]dom.Attr{
											dom.Class("space-y-6"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("grid grid-cols-1 md:grid-cols-2 gap-6"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Site Name"),
												),
												dom.Input(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-body-md transition-all"),
														dom.Type("text"),
														dom.Value("Connect Modern"),
													},
												),
											),
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Contact Email"),
												),
												dom.Input(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-body-md transition-all"),
														dom.Type("email"),
														dom.Value("admin@connectmodern.com"),
													},
												),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("space-y-2"),
											},
											dom.Label(
												[]dom.Attr{
													dom.Class("font-label-md text-on-surface-variant block"),
												},
												dom.Text("Platform Description"),
											),
											dom.Textarea(
												[]dom.Attr{
													dom.Class("w-full px-4 py-2.5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-body-md transition-all"),
													dom.CustomAttr("rows", "4"),
												},
												dom.Text("The next-generation social ecosystem for professional networking and digital expression."),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-border-subtle"),
											},
											dom.Div(
												[]dom.Attr{},
												dom.P(
													[]dom.Attr{
														dom.Class("font-label-md text-text-primary"),
													},
													dom.Text("Maintenance Mode"),
												),
												dom.P(
													[]dom.Attr{
														dom.Class("text-label-sm text-text-secondary"),
													},
													dom.Text("Disable public access for scheduled updates."),
												),
											),
											dom.Label(
												[]dom.Attr{
													dom.Class("relative inline-flex items-center cursor-pointer"),
												},
												dom.Input(
													[]dom.Attr{
														dom.Class("sr-only peer"),
														dom.Type("checkbox"),
													},
												),
												dom.Div(
													[]dom.Attr{
														dom.Class("w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"),
													},
												),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("pt-4 flex justify-end gap-4"),
											},
											dom.Button(
												[]dom.Attr{
													dom.Class("px-6 py-2 rounded-lg text-secondary font-bold hover:bg-surface-container-low transition-colors"),
													dom.Type("button"),
												},
												dom.Text("Discard"),
											),
											dom.Button(
												[]dom.Attr{
													dom.Class("px-6 py-2 rounded-lg bg-primary text-on-primary font-bold shadow-sm hover:opacity-90 transition-all active:scale-95"),
													dom.Type("button"),
												},
												dom.Text("Save Changes"),
											),
										),
									),
								),
								dom.Section(
									[]dom.Attr{
										dom.Class("tab-pane hidden bg-surface-card p-8 rounded-2xl shadow-sm border border-border-subtle animate-in fade-in duration-500"),
										dom.Id("security-content"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("flex items-center gap-4 mb-8"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("w-12 h-12 bg-error/10 rounded-full flex items-center justify-center text-error"),
											},
											dom.Span(
												[]dom.Attr{
													dom.Class("material-symbols-outlined"),
												},
												dom.Text("shield"),
											),
										),
										dom.Div(
											[]dom.Attr{},
											dom.H3(
												[]dom.Attr{
													dom.Class("font-headline-md text-headline-md"),
												},
												dom.Text("Security & Authentication"),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("text-label-sm text-text-secondary"),
												},
												dom.Text("Configure JWT secrets and session lifecycle parameters."),
											),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("space-y-6"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("space-y-2"),
											},
											dom.Label(
												[]dom.Attr{
													dom.Class("font-label-md text-on-surface-variant block"),
												},
												dom.Text("JWT Secret Key"),
											),
											dom.Div(
												[]dom.Attr{
													dom.Class("flex gap-2"),
												},
												dom.Input(
													[]dom.Attr{
														dom.Class("flex-1 px-4 py-2.5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-body-md transition-all font-mono"),
														dom.Type("password"),
														dom.Value("••••••••••••••••••••••••••••"),
													},
												),
												dom.Button(
													[]dom.Attr{
														dom.Class("p-2.5 rounded-lg border border-border-subtle hover:bg-surface-container-low transition-colors"),
													},
													dom.Span(
														[]dom.Attr{
															dom.Class("material-symbols-outlined text-[20px]"),
														},
														dom.Text("visibility"),
													),
												),
												dom.Button(
													[]dom.Attr{
														dom.Class("p-2.5 rounded-lg border border-border-subtle hover:bg-surface-container-low transition-colors"),
													},
													dom.Span(
														[]dom.Attr{
															dom.Class("material-symbols-outlined text-[20px]"),
														},
														dom.Text("refresh"),
													),
												),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("text-label-sm text-text-secondary"),
												},
												dom.Text("Changing this will invalidate all active user sessions."),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("grid grid-cols-1 md:grid-cols-2 gap-6"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Session Timeout (Minutes)"),
												),
												dom.Input(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-body-md transition-all"),
														dom.Type("number"),
														dom.Value("1440"),
													},
												),
											),
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Password Complexity"),
												),
												dom.SelectEl(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-body-md transition-all"),
													},
													dom.OptionEl(
														[]dom.Attr{},
														dom.Text("Standard (8+ chars)"),
													),
													dom.OptionEl(
														[]dom.Attr{
															dom.CustomAttr("selected", ""),
														},
														dom.Text("Enterprise (Special, Num, Mixed Case)"),
													),
													dom.OptionEl(
														[]dom.Attr{},
														dom.Text("Strict (Biometric Only)"),
													),
												),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("p-4 bg-tertiary-fixed rounded-xl border border-tertiary-container/20"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("flex gap-3"),
												},
												dom.Span(
													[]dom.Attr{
														dom.Class("material-symbols-outlined text-tertiary"),
													},
													dom.Text("warning"),
												),
												dom.Div(
													[]dom.Attr{},
													dom.P(
														[]dom.Attr{
															dom.Class("font-label-md text-tertiary"),
														},
														dom.Text("Security Protocol"),
													),
													dom.P(
														[]dom.Attr{
															dom.Class("text-label-sm text-tertiary-container"),
														},
														dom.Text("Ensure your SSL certificates are updated before changing JWT parameters to prevent man-in-the-middle exploits."),
													),
												),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("pt-4 flex justify-end gap-4"),
											},
											dom.Button(
												[]dom.Attr{
													dom.Class("px-6 py-2 rounded-lg bg-primary text-on-primary font-bold shadow-sm hover:opacity-90 transition-all active:scale-95"),
													dom.Type("button"),
												},
												dom.Text("Update Security"),
											),
										),
									),
								),
								dom.Section(
									[]dom.Attr{
										dom.Class("tab-pane hidden bg-surface-card p-8 rounded-2xl shadow-sm border border-border-subtle animate-in fade-in duration-500"),
										dom.Id("storage-content"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("flex items-center gap-4 mb-8"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("w-12 h-12 bg-success/10 rounded-full flex items-center justify-center text-success"),
											},
											dom.Span(
												[]dom.Attr{
													dom.Class("material-symbols-outlined"),
												},
												dom.Text("cloud_queue"),
											),
										),
										dom.Div(
											[]dom.Attr{},
											dom.H3(
												[]dom.Attr{
													dom.Class("font-headline-md text-headline-md"),
												},
												dom.Text("Cloud Storage Integration"),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("text-label-sm text-text-secondary"),
												},
												dom.Text("Configure AWS S3 or Cloudinary for media assets."),
											),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("space-y-6"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("flex gap-4 p-1 bg-surface-container-low rounded-xl mb-6"),
											},
											dom.Button(
												[]dom.Attr{
													dom.Class("flex-1 py-2 text-label-md font-bold bg-white shadow-sm rounded-lg text-primary"),
												},
												dom.Text("AWS S3"),
											),
											dom.Button(
												[]dom.Attr{
													dom.Class("flex-1 py-2 text-label-md font-bold text-secondary hover:bg-white/50 rounded-lg transition-all"),
												},
												dom.Text("Cloudinary"),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("grid grid-cols-1 md:grid-cols-2 gap-6"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Access Key ID"),
												),
												dom.Input(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-body-md transition-all"),
														dom.Placeholder("AKIA..."),
														dom.Type("text"),
													},
												),
											),
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Secret Access Key"),
												),
												dom.Input(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-body-md transition-all"),
														dom.Placeholder("••••••••"),
														dom.Type("password"),
													},
												),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("grid grid-cols-1 md:grid-cols-3 gap-6"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2 md:col-span-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Bucket Name"),
												),
												dom.Input(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-body-md transition-all"),
														dom.Type("text"),
														dom.Value("prod-connect-assets"),
													},
												),
											),
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Region"),
												),
												dom.Input(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-body-md transition-all"),
														dom.Type("text"),
														dom.Value("us-east-1"),
													},
												),
											),
										),
										dom.Button(
											[]dom.Attr{
												dom.Class("w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border-subtle hover:border-primary hover:text-primary transition-all group"),
											},
											dom.Span(
												[]dom.Attr{
													dom.Class("material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform"),
												},
												dom.Text("analytics"),
											),
											dom.Span(
												[]dom.Attr{
													dom.Class("font-bold"),
												},
												dom.Text("Test Connection"),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("pt-4 flex justify-end gap-4"),
											},
											dom.Button(
												[]dom.Attr{
													dom.Class("px-6 py-2 rounded-lg bg-primary text-on-primary font-bold shadow-sm hover:opacity-90 transition-all active:scale-95"),
													dom.Type("button"),
												},
												dom.Text("Save Storage Config"),
											),
										),
									),
								),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("mt-12 p-6 rounded-2xl bg-secondary-container/30 border border-secondary-container flex flex-col md:flex-row items-center gap-6"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("w-24 h-24 bg-cover bg-center rounded-xl shrink-0"),
									dom.CustomAttr("data-alt", "A sophisticated abstract illustration representing data connectivity and cloud infrastructure. Glowing lines connect nodes in a geometric web with soft blue and deep navy gradients. The style is clean, modern, and tech-focused, perfectly complementing a premium SaaS administrative interface."),
									dom.Style("background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAeHE7jknTJLX9bZBK_3GWJXdR5natCNyPD8Om4d00z6G21TYryWGjVKuvaPMUTjSXr2ZTooabx3mSBWcWZE0YnfwxHxGhAFtwmBi8zyiWJzy7WpbbH15cSslBAGSYfDXC8ifpxBJZVsjsUXUwolHtvozHVOENpGSY6aJXqOcE7jWJH8IsEVG1XwEXNqAL_Fy9Ze1EX5Df0hRYxIO-__f_b-8XlFj0DS5rnKDKlV2Spkznc9THQTS5WsX1pZ4qfYnwjQ-H6zTmsea4')"),
								},
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("flex-1 text-center md:text-left"),
								},
								dom.H4(
									[]dom.Attr{
										dom.Class("font-headline-md text-headline-md text-on-secondary-container"),
									},
									dom.Text("Need Configuration Help?"),
								),
								dom.P(
									[]dom.Attr{
										dom.Class("text-body-md text-on-secondary-container opacity-80"),
									},
									dom.Text("Refer to our technical documentation for advanced environment variable mappings and multi-tenant setup guides."),
								),
							),
							dom.A(
								[]dom.Attr{
									dom.Class("px-6 py-2.5 rounded-lg bg-secondary-container text-on-secondary-container font-bold hover:bg-secondary-container-dim transition-all whitespace-nowrap"),
									dom.Href("#"),
								},
								dom.Text("View Docs"),
							),
						),
					),
				),
			),
			dom.ScriptEl(
				[]dom.Attr{},
				dom.Text("function switchTab(tabId) {\n            // Hide all panes\n            document.querySelectorAll('.tab-pane').forEach(pane => {\n                pane.classList.add('hidden');\n            });\n            // Show active pane\n            document.getElementById(`${tabId}-content`).classList.remove('hidden');\n\n            // Reset tab button styles\n            document.querySelectorAll('.tab-btn').forEach(btn => {\n                btn.classList.remove('bg-surface-card', 'shadow-sm', 'border', 'border-primary/10', 'text-primary', 'font-bold');\n                btn.classList.add('text-secondary', 'hover:bg-surface-container-low');\n            });\n\n            // Set active button style\n            const activeBtn = document.querySelector(`[data-tab=\"${tabId}\"]`);\n            activeBtn.classList.remove('text-secondary', 'hover:bg-surface-container-low');\n            activeBtn.classList.add('bg-surface-card', 'shadow-sm', 'border', 'border-primary/10', 'text-primary', 'font-bold');\n        }\n\n        // Simple animation trigger for content appearance\n        document.addEventListener('DOMContentLoaded', () => {\n            const panes = document.querySelectorAll('.tab-pane');\n            panes.forEach(pane => {\n                pane.classList.add('transition-all', 'duration-300', 'ease-out');\n            });\n        });\n\n        // Toggle Switch functionality visually\n        const toggles = document.querySelectorAll('input[type=\"checkbox\"]');\n        toggles.forEach(t => {\n            t.addEventListener('change', (e) => {\n                console.log('Maintenance mode toggled:', e.target.checked);\n            });\n        });"),
			),
		),
	)
	return page.Render(w)
}
