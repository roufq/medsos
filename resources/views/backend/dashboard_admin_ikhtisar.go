package backend

import (
	"goravel/resources/views/backend/dom"
	"io"
)

func RenderDashboardAdminIkhtisar(w io.Writer) error {
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
				dom.Text("Connect Modern - Admin Dashboard"),
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
					dom.Src("https://cdn.tailwindcss.com?plugins=forms,container-queries"),
				},
			),
			dom.ScriptEl(
				[]dom.Attr{
					dom.Id("tailwind-config"),
				},
				dom.Text("tailwind.config = {\n            darkMode: \"class\",\n            theme: {\n                extend: {\n                    \"colors\": {\n                        \"on-primary\": \"#ffffff\",\n                        \"surface-bright\": \"#f7f9fc\",\n                        \"on-tertiary-fixed\": \"#380d00\",\n                        \"secondary\": \"#54606a\",\n                        \"on-tertiary-container\": \"#fff7f5\",\n                        \"on-primary-container\": \"#f9f7ff\",\n                        \"on-secondary-fixed\": \"#111d25\",\n                        \"inverse-surface\": \"#2d3133\",\n                        \"on-tertiary\": \"#ffffff\",\n                        \"on-tertiary-fixed-variant\": \"#812800\",\n                        \"surface-container-lowest\": \"#ffffff\",\n                        \"surface-container-low\": \"#f2f4f7\",\n                        \"success\": \"#31A24C\",\n                        \"primary-fixed-dim\": \"#b3c5ff\",\n                        \"tertiary-fixed-dim\": \"#ffb59b\",\n                        \"outline\": \"#727687\",\n                        \"border-subtle\": \"#CED0D4\",\n                        \"on-secondary\": \"#ffffff\",\n                        \"on-surface\": \"#191c1e\",\n                        \"on-secondary-fixed-variant\": \"#3d4852\",\n                        \"surface-container-highest\": \"#e0e3e6\",\n                        \"tertiary\": \"#a13400\",\n                        \"secondary-fixed\": \"#d8e4f0\",\n                        \"secondary-container\": \"#d8e4f0\",\n                        \"surface\": \"#f7f9fc\",\n                        \"inverse-primary\": \"#b3c5ff\",\n                        \"surface-dim\": \"#d8dadd\",\n                        \"on-primary-fixed-variant\": \"#003fa5\",\n                        \"surface-card\": \"#FFFFFF\",\n                        \"tertiary-fixed\": \"#ffdbcf\",\n                        \"surface-container\": \"#eceef1\",\n                        \"primary-container\": \"#0866ff\",\n                        \"primary-fixed\": \"#dbe1ff\",\n                        \"outline-variant\": \"#c2c6d8\",\n                        \"on-secondary-container\": \"#5a6670\",\n                        \"on-background\": \"#191c1e\",\n                        \"text-secondary\": \"#65676B\",\n                        \"inverse-on-surface\": \"#eff1f4\",\n                        \"surface-container-high\": \"#e6e8eb\",\n                        \"on-primary-fixed\": \"#00184a\",\n                        \"tertiary-container\": \"#cb4400\",\n                        \"text-primary\": \"#1C1E21\",\n                        \"primary\": \"#0050cd\",\n                        \"error\": \"#F02849\",\n                        \"on-error\": \"#ffffff\",\n                        \"background\": \"#f7f9fc\",\n                        \"error-container\": \"#ffdad6\",\n                        \"surface-variant\": \"#e0e3e6\",\n                        \"on-surface-variant\": \"#424656\",\n                        \"secondary-fixed-dim\": \"#bcc8d3\",\n                        \"on-error-container\": \"#93000a\",\n                        \"surface-tint\": \"#0054d7\"\n                    },\n                    \"borderRadius\": {\n                        \"DEFAULT\": \"0.25rem\",\n                        \"lg\": \"0.5rem\",\n                        \"xl\": \"0.75rem\",\n                        \"full\": \"9999px\"\n                    },\n                    \"spacing\": {\n                        \"margin-mobile\": \"16px\",\n                        \"unit\": \"4px\",\n                        \"max-width-container\": \"1280px\",\n                        \"margin-desktop\": \"24px\",\n                        \"max-width-feed\": \"680px\",\n                        \"gutter\": \"16px\"\n                    },\n                    \"fontFamily\": {\n                        \"headline-lg\": [\"Inter\"],\n                        \"body-lg\": [\"Inter\"],\n                        \"label-md\": [\"Inter\"],\n                        \"display-lg\": [\"Inter\"],\n                        \"label-sm\": [\"Inter\"],\n                        \"headline-lg-mobile\": [\"Inter\"],\n                        \"body-md\": [\"Inter\"],\n                        \"headline-md\": [\"Inter\"]\n                    },\n                    \"fontSize\": {\n                        \"headline-lg\": [\"24px\", {\"lineHeight\": \"1.3\", \"fontWeight\": \"700\"}],\n                        \"body-lg\": [\"16px\", {\"lineHeight\": \"1.5\", \"fontWeight\": \"400\"}],\n                        \"label-md\": [\"13px\", {\"lineHeight\": \"1.2\", \"letterSpacing\": \"0.01em\", \"fontWeight\": \"600\"}],\n                        \"display-lg\": [\"32px\", {\"lineHeight\": \"1.2\", \"letterSpacing\": \"-0.02em\", \"fontWeight\": \"700\"}],\n                        \"label-sm\": [\"12px\", {\"lineHeight\": \"1.2\", \"fontWeight\": \"500\"}],\n                        \"headline-lg-mobile\": [\"20px\", {\"lineHeight\": \"1.3\", \"fontWeight\": \"700\"}],\n                        \"body-md\": [\"14px\", {\"lineHeight\": \"1.5\", \"fontWeight\": \"400\"}],\n                        \"headline-md\": [\"20px\", {\"lineHeight\": \"1.4\", \"fontWeight\": \"600\"}]\n                    }\n                },\n            },\n        }"),
			),
			dom.StyleEl(
				[]dom.Attr{},
				dom.Text("body {\n            font-family: 'Inter', sans-serif;\n            background-color: #f7f9fc;\n        }\n        .material-symbols-outlined {\n            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;\n            display: inline-block;\n            vertical-align: middle;\n        }\n        .chart-container {\n            position: relative;\n            height: 300px;\n            width: 100%;\n        }\n        .custom-scrollbar::-webkit-scrollbar {\n            width: 6px;\n        }\n        .custom-scrollbar::-webkit-scrollbar-track {\n            background: transparent;\n        }\n        .custom-scrollbar::-webkit-scrollbar-thumb {\n            background: #e0e3e6;\n            border-radius: 10px;\n        }\n        .metric-card-hover:hover {\n            transform: translateY(-2px);\n            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);\n        }"),
			),
		),
		dom.Body(
			[]dom.Attr{
				dom.Class("text-on-background bg-background"),
			},
			dom.Header(
				[]dom.Attr{
					dom.Class("bg-surface dark:bg-inverse-surface shadow-sm sticky top-0 z-50 flex justify-between items-center h-16 px-margin-desktop"),
				},
				dom.Div(
					[]dom.Attr{
						dom.Class("flex items-center gap-6"),
					},
					dom.H1(
						[]dom.Attr{
							dom.Class("font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary"),
						},
						dom.Text("Connect Modern"),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full w-80"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined text-outline mr-2"),
							},
							dom.Text("search"),
						),
						dom.Input(
							[]dom.Attr{
								dom.Class("bg-transparent border-none focus:ring-0 text-body-md w-full"),
								dom.Placeholder("Search data, reports, or users..."),
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
							dom.Class("material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors cursor-pointer active:opacity-80"),
						},
						dom.Text("notifications"),
					),
					dom.Button(
						[]dom.Attr{
							dom.Class("material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors cursor-pointer active:opacity-80"),
						},
						dom.Text("help"),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("h-8 w-8 rounded-full overflow-hidden border border-border-subtle cursor-pointer"),
						},
						dom.Img(
							[]dom.Attr{
								dom.Class("w-full h-full object-cover"),
								dom.CustomAttr("data-alt", "A professional headshot of a female technology administrator in a bright, modern office setting. She has a friendly expression, wearing minimalist glasses and a charcoal blazer. The lighting is soft and natural, reflecting a high-end corporate social network environment with neutral gray and blue tones."),
								dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuDqsdUhFcG3uPaZGLXoKWUnqOu7qkdvrbRl_oAWjA79sqOuQj35GD_7MSD63tVLPecdAxbu1xg34JpOTFRAYu6R3MDnPgk6SN9-TNuPoQz_zMsW09PzA-HZGIng7GnkK0JgHMxOHTAFF6Vs9yspvzZK0-Q2CwdVEaVtYTfhXH6t8gGvA9FYthiLulCC7-Xif2SUQtO4riVu78F1uumAeUT84su0O5-DvRcrlQzq4tYaTD4nQPNC2qjQjwJQK_lRBDLQMJQl5jeeNoA"),
							},
						),
					),
				),
			),
			dom.Div(
				[]dom.Attr{
					dom.Class("flex"),
				},
				dom.Aside(
					[]dom.Attr{
						dom.Class("h-screen w-64 fixed left-0 top-16 bg-surface-container-lowest dark:bg-inverse-surface border-r border-border-subtle flex flex-col p-4 gap-2 hidden lg:flex"),
					},
					dom.Div(
						[]dom.Attr{
							dom.Class("mb-6 px-2"),
						},
						dom.H2(
							[]dom.Attr{
								dom.Class("font-headline-md text-headline-md font-black text-primary"),
							},
							dom.Text("Admin Panel"),
						),
						dom.P(
							[]dom.Attr{
								dom.Class("font-label-sm text-label-sm text-on-surface-variant opacity-70"),
							},
							dom.Text("Connect Modern Control"),
						),
					),
					dom.Nav(
						[]dom.Attr{
							dom.Class("space-y-1 flex-1"),
						},
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container font-bold rounded-lg transition-all duration-200 ease-in-out"),
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
								dom.Class("flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out"),
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
								dom.Class("flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out"),
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
								dom.Class("flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out"),
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
								dom.Class("flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out"),
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
							dom.Class("mt-auto pt-4 border-t border-border-subtle space-y-1"),
						},
						dom.Button(
							[]dom.Attr{
								dom.Class("w-full bg-primary text-white py-3 rounded-lg font-label-md text-label-md font-bold mb-4 hover:opacity-90 transition-opacity"),
							},
							dom.Text("Generate Report"),
						),
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-low rounded-lg transition-all"),
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
								dom.Class("flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-low rounded-lg transition-all"),
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
				dom.Main(
					[]dom.Attr{
						dom.Class("flex-1 lg:ml-64 p-6 md:p-10"),
					},
					dom.Div(
						[]dom.Attr{
							dom.Class("max-w-max-width-container mx-auto"),
						},
						dom.Div(
							[]dom.Attr{
								dom.Class("flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"),
							},
							dom.Div(
								[]dom.Attr{},
								dom.H2(
									[]dom.Attr{
										dom.Class("font-headline-lg text-headline-lg text-text-primary"),
									},
									dom.Text("Dashboard Overview"),
								),
								dom.P(
									[]dom.Attr{
										dom.Class("text-text-secondary font-body-md text-body-md"),
									},
									dom.Text("Real-time performance metrics and platform health."),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("flex items-center gap-3"),
								},
								dom.Button(
									[]dom.Attr{
										dom.Class("flex items-center gap-2 bg-surface-card border border-border-subtle px-4 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"),
									},
									dom.Span(
										[]dom.Attr{
											dom.Class("material-symbols-outlined text-[20px]"),
										},
										dom.Text("calendar_today"),
									),
									dom.Text("Last 30 Days"),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity shadow-sm"),
									},
									dom.Span(
										[]dom.Attr{
											dom.Class("material-symbols-outlined text-[20px]"),
										},
										dom.Text("download"),
									),
									dom.Text("Export"),
								),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("bg-surface-card p-6 rounded-xl border border-border-subtle metric-card-hover transition-all"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center justify-between mb-4"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("p-2 bg-primary-fixed rounded-lg"),
										},
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-primary"),
											},
											dom.Text("group"),
										),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-success font-label-sm text-label-sm flex items-center bg-success/10 px-2 py-0.5 rounded-full"),
										},
										dom.Text("+12%"),
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-sm ml-1"),
											},
											dom.Text("trending_up"),
										),
									),
								),
								dom.P(
									[]dom.Attr{
										dom.Class("text-text-secondary font-label-md text-label-md uppercase tracking-wider mb-1"),
									},
									dom.Text("Total Users"),
								),
								dom.H3(
									[]dom.Attr{
										dom.Class("font-display-lg text-display-lg text-text-primary"),
									},
									dom.Text("42,892"),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("bg-surface-card p-6 rounded-xl border border-border-subtle metric-card-hover transition-all"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center justify-between mb-4"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("p-2 bg-tertiary-fixed rounded-lg"),
										},
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-tertiary"),
											},
											dom.Text("chat_bubble"),
										),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-success font-label-sm text-label-sm flex items-center bg-success/10 px-2 py-0.5 rounded-full"),
										},
										dom.Text("+8%"),
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-sm ml-1"),
											},
											dom.Text("trending_up"),
										),
									),
								),
								dom.P(
									[]dom.Attr{
										dom.Class("text-text-secondary font-label-md text-label-md uppercase tracking-wider mb-1"),
									},
									dom.Text("New Posts"),
								),
								dom.H3(
									[]dom.Attr{
										dom.Class("font-display-lg text-display-lg text-text-primary"),
									},
									dom.Text("15,402"),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("bg-surface-card p-6 rounded-xl border border-border-subtle metric-card-hover transition-all"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center justify-between mb-4"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("p-2 bg-secondary-fixed rounded-lg"),
										},
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-secondary"),
											},
											dom.Text("flag"),
										),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-error font-label-sm text-label-sm flex items-center bg-error/10 px-2 py-0.5 rounded-full"),
										},
										dom.Text("-3%"),
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-sm ml-1"),
											},
											dom.Text("trending_down"),
										),
									),
								),
								dom.P(
									[]dom.Attr{
										dom.Class("text-text-secondary font-label-md text-label-md uppercase tracking-wider mb-1"),
									},
									dom.Text("Active Reports"),
								),
								dom.H3(
									[]dom.Attr{
										dom.Class("font-display-lg text-display-lg text-text-primary"),
									},
									dom.Text("128"),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("bg-surface-card p-6 rounded-xl border border-border-subtle metric-card-hover transition-all"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center justify-between mb-4"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("p-2 bg-success/20 rounded-lg"),
										},
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-success"),
											},
											dom.Text("payments"),
										),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-success font-label-sm text-label-sm flex items-center bg-success/10 px-2 py-0.5 rounded-full"),
										},
										dom.Text("+24%"),
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-sm ml-1"),
											},
											dom.Text("trending_up"),
										),
									),
								),
								dom.P(
									[]dom.Attr{
										dom.Class("text-text-secondary font-label-md text-label-md uppercase tracking-wider mb-1"),
									},
									dom.Text("Revenue"),
								),
								dom.H3(
									[]dom.Attr{
										dom.Class("font-display-lg text-display-lg text-text-primary"),
									},
									dom.Text("$84,200"),
								),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("grid grid-cols-1 xl:grid-cols-3 gap-8"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("xl:col-span-2 bg-surface-card p-8 rounded-xl border border-border-subtle shadow-sm"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center justify-between mb-8"),
									},
									dom.Div(
										[]dom.Attr{},
										dom.H3(
											[]dom.Attr{
												dom.Class("font-headline-md text-headline-md text-text-primary"),
											},
											dom.Text("User Growth"),
										),
										dom.P(
											[]dom.Attr{
												dom.Class("text-text-secondary font-body-md text-body-md"),
											},
											dom.Text("Daily active users vs. New sign-ups"),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex gap-4"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("flex items-center gap-2"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("w-3 h-3 rounded-full bg-primary"),
												},
											),
											dom.Span(
												[]dom.Attr{
													dom.Class("font-label-sm text-label-sm text-text-secondary"),
												},
												dom.Text("DAU"),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex items-center gap-2"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("w-3 h-3 rounded-full bg-primary-fixed-dim"),
												},
											),
											dom.Span(
												[]dom.Attr{
													dom.Class("font-label-sm text-label-sm text-text-secondary"),
												},
												dom.Text("New Sign-ups"),
											),
										),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("chart-container flex items-end justify-between gap-2 px-2"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("flex-1 flex flex-col justify-end group"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary-fixed-dim/20 rounded-t-sm h-[40%] group-hover:bg-primary-fixed-dim/30 transition-colors"),
											},
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary rounded-t-sm h-[60%] group-hover:bg-primary/80 transition-colors"),
											},
										),
										dom.P(
											[]dom.Attr{
												dom.Class("mt-4 text-center font-label-sm text-label-sm text-on-surface-variant opacity-60"),
											},
											dom.Text("Mon"),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex-1 flex flex-col justify-end group"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary-fixed-dim/20 rounded-t-sm h-[55%] group-hover:bg-primary-fixed-dim/30 transition-colors"),
											},
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary rounded-t-sm h-[75%] group-hover:bg-primary/80 transition-colors"),
											},
										),
										dom.P(
											[]dom.Attr{
												dom.Class("mt-4 text-center font-label-sm text-label-sm text-on-surface-variant opacity-60"),
											},
											dom.Text("Tue"),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex-1 flex flex-col justify-end group"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary-fixed-dim/20 rounded-t-sm h-[30%] group-hover:bg-primary-fixed-dim/30 transition-colors"),
											},
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary rounded-t-sm h-[45%] group-hover:bg-primary/80 transition-colors"),
											},
										),
										dom.P(
											[]dom.Attr{
												dom.Class("mt-4 text-center font-label-sm text-label-sm text-on-surface-variant opacity-60"),
											},
											dom.Text("Wed"),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex-1 flex flex-col justify-end group"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary-fixed-dim/20 rounded-t-sm h-[65%] group-hover:bg-primary-fixed-dim/30 transition-colors"),
											},
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary rounded-t-sm h-[90%] group-hover:bg-primary/80 transition-colors"),
											},
										),
										dom.P(
											[]dom.Attr{
												dom.Class("mt-4 text-center font-label-sm text-label-sm text-on-surface-variant opacity-60"),
											},
											dom.Text("Thu"),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex-1 flex flex-col justify-end group"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary-fixed-dim/20 rounded-t-sm h-[45%] group-hover:bg-primary-fixed-dim/30 transition-colors"),
											},
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary rounded-t-sm h-[70%] group-hover:bg-primary/80 transition-colors"),
											},
										),
										dom.P(
											[]dom.Attr{
												dom.Class("mt-4 text-center font-label-sm text-label-sm text-on-surface-variant opacity-60"),
											},
											dom.Text("Fri"),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex-1 flex flex-col justify-end group"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary-fixed-dim/20 rounded-t-sm h-[80%] group-hover:bg-primary-fixed-dim/30 transition-colors"),
											},
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary rounded-t-sm h-[95%] group-hover:bg-primary/80 transition-colors"),
											},
										),
										dom.P(
											[]dom.Attr{
												dom.Class("mt-4 text-center font-label-sm text-label-sm text-on-surface-variant opacity-60"),
											},
											dom.Text("Sat"),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex-1 flex flex-col justify-end group"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary-fixed-dim/20 rounded-t-sm h-[50%] group-hover:bg-primary-fixed-dim/30 transition-colors"),
											},
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary rounded-t-sm h-[85%] group-hover:bg-primary/80 transition-colors"),
											},
										),
										dom.P(
											[]dom.Attr{
												dom.Class("mt-4 text-center font-label-sm text-label-sm text-on-surface-variant opacity-60"),
											},
											dom.Text("Sun"),
										),
									),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("bg-surface-card p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center justify-between mb-6"),
									},
									dom.H3(
										[]dom.Attr{
											dom.Class("font-headline-md text-headline-md text-text-primary"),
										},
										dom.Text("Recent Activity"),
									),
									dom.Button(
										[]dom.Attr{
											dom.Class("text-primary font-label-md text-label-md hover:underline"),
										},
										dom.Text("View All"),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("flex gap-4"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("relative"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("w-10 h-10 rounded-full bg-surface-container-high overflow-hidden"),
												},
												dom.Img(
													[]dom.Attr{
														dom.Class("w-full h-full object-cover"),
														dom.CustomAttr("data-alt", "Close-up portrait of a young male designer in a bright, modern studio. He has a warm smile, wearing a simple white t-shirt. The aesthetic matches a clean, professional social network with soft lighting and a light blue background."),
														dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuAhkm0sGYbpvgHDWA3pVNH4Lf_-AZD-oxgmxVe3MWpHZYl0UzkPaUrSIeckQVnTCdE4ruWPrUAw9Cjoct50Vb_55TDOalBqHrpX0HG8EN7jMy0PJ4QY1gIPXehiXKlV1Q8LFKGG-Ma_TW-XJiC4SqOllzaQKTKZsdcCPlVRloXc0CBzQJnfDPfeicD1aczOr4U2kqt5taLBHdOoI71FJ805JRMlvtAH-co1K4w9UNBxJyy7D3f0W9mnz9KDNEUtyokv5If8LEKJX78"),
													},
												),
											),
											dom.Div(
												[]dom.Attr{
													dom.Class("absolute -bottom-1 -right-1 bg-success border-2 border-surface-card rounded-full w-4 h-4"),
												},
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex-1"),
											},
											dom.P(
												[]dom.Attr{
													dom.Class("font-body-md text-body-md text-text-primary leading-tight"),
												},
												dom.Span(
													[]dom.Attr{
														dom.Class("font-bold"),
													},
													dom.Text("Marcus Chen"),
												),
												dom.Text("joined the platform."),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("text-text-secondary font-label-sm text-label-sm"),
												},
												dom.Text("2 minutes ago"),
											),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex gap-4"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("relative"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center"),
												},
												dom.Span(
													[]dom.Attr{
														dom.Class("material-symbols-outlined text-tertiary"),
													},
													dom.Text("report"),
												),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex-1"),
											},
											dom.P(
												[]dom.Attr{
													dom.Class("font-body-md text-body-md text-text-primary leading-tight"),
												},
												dom.Span(
													[]dom.Attr{
														dom.Class("font-bold"),
													},
													dom.Text("New Report"),
												),
												dom.Text("flagged on post #8291."),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("text-text-secondary font-label-sm text-label-sm"),
												},
												dom.Text("15 minutes ago"),
											),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex gap-4"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("relative"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("w-10 h-10 rounded-full bg-surface-container-high overflow-hidden"),
												},
												dom.Img(
													[]dom.Attr{
														dom.Class("w-full h-full object-cover"),
														dom.CustomAttr("data-alt", "Portrait of a female developer with curly hair in a minimalist coworking space. She is smiling, wearing a light blue denim shirt. High-key lighting, modern and clean social media aesthetic, professional and approachable mood."),
														dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuAHpyDX7C1RMmnrvL0tQnP8q6_Xs8Q9hx8CEfsUI0r_doVfnS53rViP2JGYskcC-P2x6X37C-8_Im1PLpH92RAM21md8X8mIztFKJu3bonMV7Xj6PTqSjiB53Sy-mruy-3b6xtV5fjSYLc_xgPqt4paWn8nO81Fe55mVoOThNC89hzYNs6IxqOWAWY6z8-fIsL4KPv6ltBBRpDEvx1Q-y-It10qNAfjfoAPETy7i7TaJ4qZKpkSjBVTjMEQw3JuLn83l7tIVX2aXes"),
													},
												),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex-1"),
											},
											dom.P(
												[]dom.Attr{
													dom.Class("font-body-md text-body-md text-text-primary leading-tight"),
												},
												dom.Span(
													[]dom.Attr{
														dom.Class("font-bold"),
													},
													dom.Text("Elena Rodriguez"),
												),
												dom.Text("verified her account."),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("text-text-secondary font-label-sm text-label-sm"),
												},
												dom.Text("42 minutes ago"),
											),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex gap-4"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("relative"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center"),
												},
												dom.Span(
													[]dom.Attr{
														dom.Class("material-symbols-outlined text-primary"),
													},
													dom.Text("shopping_bag"),
												),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex-1"),
											},
											dom.P(
												[]dom.Attr{
													dom.Class("font-body-md text-body-md text-text-primary leading-tight"),
												},
												dom.Span(
													[]dom.Attr{
														dom.Class("font-bold"),
													},
													dom.Text("Premium Plan"),
												),
												dom.Text("purchased by Sarah K."),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("text-text-secondary font-label-sm text-label-sm"),
												},
												dom.Text("1 hour ago"),
											),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex gap-4"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("relative"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("w-10 h-10 rounded-full bg-surface-container-high overflow-hidden"),
												},
												dom.Img(
													[]dom.Attr{
														dom.Class("w-full h-full object-cover"),
														dom.CustomAttr("data-alt", "Portrait of an older male executive with silver hair and a sharp navy blue suit. He has a confident, professional look. The background is a blurred high-end corporate office with soft, natural lighting. Palette of deep blues and clean whites."),
														dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuChxiqvbrO_VIfj-s5UUj2Et3fUUgGHJ80v_4Mn3rccjgUWGleLKgtksb1I0le7poYopQb5uWuISAe_Dlq1gkoiO_spvqVIvLbxDedbCMgmSlmYcjvTPWgNvXZNhJpPmQdNhn19q2yuIvSEE81BGoN6SUrJcsE41LG1jq7b6F2zs5A851RUdq7GYxf3h9SdtdulnxR1K_TZQeFIjIG1bV-MiqiL9bCMWMpx2qNRLXSxNzccxkysS_F8vxjtk8Jmsg8XKNHQZ9PQHIY"),
													},
												),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex-1"),
											},
											dom.P(
												[]dom.Attr{
													dom.Class("font-body-md text-body-md text-text-primary leading-tight"),
												},
												dom.Span(
													[]dom.Attr{
														dom.Class("font-bold"),
													},
													dom.Text("Julian Vane"),
												),
												dom.Text("updated admin permissions."),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("text-text-secondary font-label-sm text-label-sm"),
												},
												dom.Text("3 hours ago"),
											),
										),
									),
								),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("px-6 py-4 border-b border-border-subtle flex items-center justify-between"),
									},
									dom.H3(
										[]dom.Attr{
											dom.Class("font-headline-md text-headline-md text-text-primary"),
										},
										dom.Text("Newest Members"),
									),
									dom.Button(
										[]dom.Attr{
											dom.Class("text-on-surface-variant material-symbols-outlined hover:bg-surface-container-low p-1 rounded transition-colors"),
										},
										dom.Text("more_vert"),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("overflow-x-auto"),
									},
									dom.Table(
										[]dom.Attr{
											dom.Class("w-full text-left"),
										},
										dom.Thead(
											[]dom.Attr{},
											dom.Tr(
												[]dom.Attr{
													dom.Class("bg-surface-container-lowest"),
												},
												dom.Th(
													[]dom.Attr{
														dom.Class("px-6 py-3 font-label-md text-label-md text-text-secondary uppercase"),
													},
													dom.Text("User"),
												),
												dom.Th(
													[]dom.Attr{
														dom.Class("px-6 py-3 font-label-md text-label-md text-text-secondary uppercase"),
													},
													dom.Text("Status"),
												),
												dom.Th(
													[]dom.Attr{
														dom.Class("px-6 py-3 font-label-md text-label-md text-text-secondary uppercase"),
													},
													dom.Text("Role"),
												),
												dom.Th(
													[]dom.Attr{
														dom.Class("px-6 py-3 font-label-md text-label-md text-text-secondary uppercase"),
													},
													dom.Text("Joined"),
												),
											),
										),
										dom.Tbody(
											[]dom.Attr{
												dom.Class("divide-y divide-border-subtle"),
											},
											dom.Tr(
												[]dom.Attr{
													dom.Class("hover:bg-surface-container-low transition-colors"),
												},
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4 flex items-center gap-3"),
													},
													dom.Div(
														[]dom.Attr{
															dom.Class("w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary text-xs"),
														},
														dom.Text("JD"),
													),
													dom.Span(
														[]dom.Attr{
															dom.Class("font-body-md text-body-md font-medium"),
														},
														dom.Text("Jason Doe"),
													),
												),
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4"),
													},
													dom.Span(
														[]dom.Attr{
															dom.Class("px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase"),
														},
														dom.Text("Active"),
													),
												),
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4 font-body-md text-body-md text-text-secondary"),
													},
													dom.Text("Member"),
												),
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4 font-body-md text-body-md text-text-secondary"),
													},
													dom.Text("Today"),
												),
											),
											dom.Tr(
												[]dom.Attr{
													dom.Class("hover:bg-surface-container-low transition-colors"),
												},
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4 flex items-center gap-3"),
													},
													dom.Div(
														[]dom.Attr{
															dom.Class("w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-secondary text-xs"),
														},
														dom.Text("AS"),
													),
													dom.Span(
														[]dom.Attr{
															dom.Class("font-body-md text-body-md font-medium"),
														},
														dom.Text("Anna Smith"),
													),
												),
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4"),
													},
													dom.Span(
														[]dom.Attr{
															dom.Class("px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase"),
														},
														dom.Text("Active"),
													),
												),
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4 font-body-md text-body-md text-text-secondary"),
													},
													dom.Text("Premium"),
												),
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4 font-body-md text-body-md text-text-secondary"),
													},
													dom.Text("Yesterday"),
												),
											),
											dom.Tr(
												[]dom.Attr{
													dom.Class("hover:bg-surface-container-low transition-colors"),
												},
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4 flex items-center gap-3"),
													},
													dom.Div(
														[]dom.Attr{
															dom.Class("w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-tertiary text-xs"),
														},
														dom.Text("BK"),
													),
													dom.Span(
														[]dom.Attr{
															dom.Class("font-body-md text-body-md font-medium"),
														},
														dom.Text("Ben King"),
													),
												),
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4"),
													},
													dom.Span(
														[]dom.Attr{
															dom.Class("px-2 py-0.5 rounded-full bg-on-surface-variant/10 text-on-surface-variant text-[10px] font-bold uppercase"),
														},
														dom.Text("Pending"),
													),
												),
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4 font-body-md text-body-md text-text-secondary"),
													},
													dom.Text("Member"),
												),
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4 font-body-md text-body-md text-text-secondary"),
													},
													dom.Text("2 days ago"),
												),
											),
										),
									),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("grid grid-cols-1 gap-6"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("bg-surface-card p-6 rounded-xl border border-border-subtle shadow-sm"),
									},
									dom.H3(
										[]dom.Attr{
											dom.Class("font-headline-md text-headline-md text-text-primary mb-4"),
										},
										dom.Text("System Tasks"),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("space-y-3"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("flex items-center justify-between p-3 bg-surface-container-low rounded-lg"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("flex items-center gap-3"),
												},
												dom.Input(
													[]dom.Attr{
														dom.Class("rounded text-primary focus:ring-primary h-4 w-4 border-border-subtle"),
														dom.Type("checkbox"),
													},
												),
												dom.Span(
													[]dom.Attr{
														dom.Class("font-body-md text-body-md text-text-primary"),
													},
													dom.Text("Review 12 flagged posts"),
												),
											),
											dom.Span(
												[]dom.Attr{
													dom.Class("bg-error/10 text-error px-2 py-0.5 rounded text-[10px] font-bold uppercase"),
												},
												dom.Text("High Priority"),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex items-center justify-between p-3 bg-surface-container-low rounded-lg"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("flex items-center gap-3"),
												},
												dom.Input(
													[]dom.Attr{
														dom.Class("rounded text-primary focus:ring-primary h-4 w-4 border-border-subtle"),
														dom.Type("checkbox"),
													},
												),
												dom.Span(
													[]dom.Attr{
														dom.Class("font-body-md text-body-md text-text-primary"),
													},
													dom.Text("Backup database server"),
												),
											),
											dom.Span(
												[]dom.Attr{
													dom.Class("bg-secondary-fixed-dim/40 text-secondary px-2 py-0.5 rounded text-[10px] font-bold uppercase"),
												},
												dom.Text("Scheduled"),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex items-center justify-between p-3 bg-surface-container-low rounded-lg"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("flex items-center gap-3"),
												},
												dom.Input(
													[]dom.Attr{
														dom.Checked(),
														dom.Class("rounded text-primary focus:ring-primary h-4 w-4 border-border-subtle"),
														dom.Type("checkbox"),
													},
												),
												dom.Span(
													[]dom.Attr{
														dom.Class("font-body-md text-body-md text-text-primary line-through opacity-50"),
													},
													dom.Text("Approve new API credentials"),
												),
											),
											dom.Span(
												[]dom.Attr{
													dom.Class("bg-success/10 text-success px-2 py-0.5 rounded text-[10px] font-bold uppercase"),
												},
												dom.Text("Done"),
											),
										),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("bg-inverse-surface text-inverse-on-surface p-6 rounded-xl shadow-sm flex items-center justify-between"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("flex items-center gap-4"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("w-12 h-12 rounded-full bg-success/20 flex items-center justify-center"),
											},
											dom.Span(
												[]dom.Attr{
													dom.Class("material-symbols-outlined text-success"),
												},
												dom.Text("check_circle"),
											),
										),
										dom.Div(
											[]dom.Attr{},
											dom.H4(
												[]dom.Attr{
													dom.Class("font-headline-md text-headline-md"),
												},
												dom.Text("System Online"),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("font-label-sm text-label-sm opacity-70"),
												},
												dom.Text("Uptime: 99.98% (Current Month)"),
											),
										),
									),
									dom.Button(
										[]dom.Attr{
											dom.Class("bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-label-md text-label-md transition-colors"),
										},
										dom.Text("Status Page"),
									),
								),
							),
						),
					),
				),
			),
			dom.Nav(
				[]dom.Attr{
					dom.Class("fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border-subtle flex lg:hidden z-50"),
				},
				dom.A(
					[]dom.Attr{
						dom.Class("flex-1 flex flex-col items-center justify-center text-primary font-bold"),
						dom.Href("#"),
					},
					dom.Span(
						[]dom.Attr{
							dom.Class("material-symbols-outlined"),
						},
						dom.Text("dashboard"),
					),
					dom.Span(
						[]dom.Attr{
							dom.Class("text-[10px]"),
						},
						dom.Text("Dashboard"),
					),
				),
				dom.A(
					[]dom.Attr{
						dom.Class("flex-1 flex flex-col items-center justify-center text-on-surface-variant"),
						dom.Href("#"),
					},
					dom.Span(
						[]dom.Attr{
							dom.Class("material-symbols-outlined"),
						},
						dom.Text("group"),
					),
					dom.Span(
						[]dom.Attr{
							dom.Class("text-[10px]"),
						},
						dom.Text("Users"),
					),
				),
				dom.A(
					[]dom.Attr{
						dom.Class("flex-1 flex flex-col items-center justify-center text-on-surface-variant"),
						dom.Href("#"),
					},
					dom.Span(
						[]dom.Attr{
							dom.Class("material-symbols-outlined"),
						},
						dom.Text("chat_bubble"),
					),
					dom.Span(
						[]dom.Attr{
							dom.Class("text-[10px]"),
						},
						dom.Text("Posts"),
					),
				),
				dom.A(
					[]dom.Attr{
						dom.Class("flex-1 flex flex-col items-center justify-center text-on-surface-variant"),
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
							dom.Class("text-[10px]"),
						},
						dom.Text("Reports"),
					),
				),
			),
			dom.ScriptEl(
				[]dom.Attr{},
				dom.Text("// Simple interactivity for demonstration\n        document.querySelectorAll('.metric-card-hover').forEach(card => {\n            card.addEventListener('mouseenter', () => {\n                card.style.borderColor = '#0050cd';\n            });\n            card.addEventListener('mouseleave', () => {\n                card.style.borderColor = '#CED0D4';\n            });\n        });\n\n        // Search bar focus effect\n        const searchInput = document.querySelector('input[type=\"text\"]');\n        const searchContainer = searchInput?.parentElement;\n        if (searchInput && searchContainer) {\n            searchInput.addEventListener('focus', () => {\n                searchContainer.classList.remove('bg-surface-container-low');\n                searchContainer.classList.add('bg-white', 'ring-2', 'ring-primary');\n            });\n            searchInput.addEventListener('blur', () => {\n                searchContainer.classList.remove('bg-white', 'ring-2', 'ring-primary');\n                searchContainer.classList.add('bg-surface-container-low');\n            });\n        }"),
			),
		),
	)
	return page.Render(w)
}
