package backend

import (
	"goravel/resources/views/backend/dom"
	"io"
)

func RenderDashboardAdminModerasiKonten(w io.Writer) error {
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
				dom.Text("Connect Modern Admin - Content Moderation"),
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
			dom.StyleEl(
				[]dom.Attr{},
				dom.Text("body { font-family: 'Inter', sans-serif; }\n        .material-symbols-outlined {\n            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;\n        }\n        .hide-scrollbar::-webkit-scrollbar { display: none; }\n        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }"),
			),
			dom.ScriptEl(
				[]dom.Attr{
					dom.Id("tailwind-config"),
				},
				dom.Text("tailwind.config = {\n        darkMode: \"class\",\n        theme: {\n          extend: {\n            \"colors\": {\n                    \"on-primary\": \"#ffffff\",\n                    \"surface-bright\": \"#f7f9fc\",\n                    \"on-tertiary-fixed\": \"#380d00\",\n                    \"secondary\": \"#54606a\",\n                    \"on-tertiary-container\": \"#fff7f5\",\n                    \"on-primary-container\": \"#f9f7ff\",\n                    \"on-secondary-fixed\": \"#111d25\",\n                    \"inverse-surface\": \"#2d3133\",\n                    \"on-tertiary\": \"#ffffff\",\n                    \"on-tertiary-fixed-variant\": \"#812800\",\n                    \"surface-container-lowest\": \"#ffffff\",\n                    \"surface-container-low\": \"#f2f4f7\",\n                    \"success\": \"#31A24C\",\n                    \"primary-fixed-dim\": \"#b3c5ff\",\n                    \"tertiary-fixed-dim\": \"#ffb59b\",\n                    \"outline\": \"#727687\",\n                    \"border-subtle\": \"#CED0D4\",\n                    \"on-secondary\": \"#ffffff\",\n                    \"on-surface\": \"#191c1e\",\n                    \"on-secondary-fixed-variant\": \"#3d4852\",\n                    \"surface-container-highest\": \"#e0e3e6\",\n                    \"tertiary\": \"#a13400\",\n                    \"secondary-fixed\": \"#d8e4f0\",\n                    \"secondary-container\": \"#d8e4f0\",\n                    \"surface\": \"#f7f9fc\",\n                    \"inverse-primary\": \"#b3c5ff\",\n                    \"surface-dim\": \"#d8dadd\",\n                    \"on-primary-fixed-variant\": \"#003fa5\",\n                    \"surface-card\": \"#FFFFFF\",\n                    \"tertiary-fixed\": \"#ffdbcf\",\n                    \"surface-container\": \"#eceef1\",\n                    \"primary-container\": \"#0866ff\",\n                    \"primary-fixed\": \"#dbe1ff\",\n                    \"outline-variant\": \"#c2c6d8\",\n                    \"on-secondary-container\": \"#5a6670\",\n                    \"on-background\": \"#191c1e\",\n                    \"text-secondary\": \"#65676B\",\n                    \"inverse-on-surface\": \"#eff1f4\",\n                    \"surface-container-high\": \"#e6e8eb\",\n                    \"on-primary-fixed\": \"#00184a\",\n                    \"tertiary-container\": \"#cb4400\",\n                    \"text-primary\": \"#1C1E21\",\n                    \"primary\": \"#0050cd\",\n                    \"error\": \"#F02849\",\n                    \"on-error\": \"#ffffff\",\n                    \"background\": \"#f7f9fc\",\n                    \"error-container\": \"#ffdad6\",\n                    \"surface-variant\": \"#e0e3e6\",\n                    \"on-surface-variant\": \"#424656\",\n                    \"secondary-fixed-dim\": \"#bcc8d3\",\n                    \"on-error-container\": \"#93000a\",\n                    \"surface-tint\": \"#0054d7\"\n            },\n            \"borderRadius\": {\n                    \"DEFAULT\": \"0.25rem\",\n                    \"lg\": \"0.5rem\",\n                    \"xl\": \"0.75rem\",\n                    \"full\": \"9999px\"\n            },\n            \"spacing\": {\n                    \"margin-mobile\": \"16px\",\n                    \"unit\": \"4px\",\n                    \"max-width-container\": \"1280px\",\n                    \"margin-desktop\": \"24px\",\n                    \"max-width-feed\": \"680px\",\n                    \"gutter\": \"16px\"\n            },\n            \"fontFamily\": {\n                    \"headline-lg\": [\"Inter\"],\n                    \"body-lg\": [\"Inter\"],\n                    \"label-md\": [\"Inter\"],\n                    \"display-lg\": [\"Inter\"],\n                    \"label-sm\": [\"Inter\"],\n                    \"headline-lg-mobile\": [\"Inter\"],\n                    \"body-md\": [\"Inter\"],\n                    \"headline-md\": [\"Inter\"]\n            },\n            \"fontSize\": {\n                    \"headline-lg\": [\"24px\", {\"lineHeight\": \"1.3\", \"fontWeight\": \"700\"}],\n                    \"body-lg\": [\"16px\", {\"lineHeight\": \"1.5\", \"fontWeight\": \"400\"}],\n                    \"label-md\": [\"13px\", {\"lineHeight\": \"1.2\", \"letterSpacing\": \"0.01em\", \"fontWeight\": \"600\"}],\n                    \"display-lg\": [\"32px\", {\"lineHeight\": \"1.2\", \"letterSpacing\": \"-0.02em\", \"fontWeight\": \"700\"}],\n                    \"label-sm\": [\"12px\", {\"lineHeight\": \"1.2\", \"fontWeight\": \"500\"}],\n                    \"headline-lg-mobile\": [\"20px\", {\"lineHeight\": \"1.3\", \"fontWeight\": \"700\"}],\n                    \"body-md\": [\"14px\", {\"lineHeight\": \"1.5\", \"fontWeight\": \"400\"}],\n                    \"headline-md\": [\"20px\", {\"lineHeight\": \"1.4\", \"fontWeight\": \"600\"}]\n            }\n          },\n        },\n      }"),
			),
		),
		dom.Body(
			[]dom.Attr{
				dom.Class("bg-background text-on-background min-h-screen flex flex-col overflow-x-hidden"),
			},
			dom.Header(
				[]dom.Attr{
					dom.Class("bg-surface sticky top-0 z-50 flex justify-between items-center h-16 px-margin-desktop shadow-sm"),
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
							dom.Class("hidden md:flex bg-surface-container-low rounded-full px-4 py-2 items-center gap-3 w-80"),
						},
						dom.Span(
							[]dom.Attr{
								dom.Class("material-symbols-outlined text-outline"),
							},
							dom.Text("search"),
						),
						dom.Input(
							[]dom.Attr{
								dom.Class("bg-transparent border-none focus:ring-0 text-body-md w-full placeholder:text-outline-variant"),
								dom.Placeholder("Search posts or users..."),
								dom.Type("text"),
							},
						),
					),
				),
				dom.Nav(
					[]dom.Attr{
						dom.Class("flex items-center gap-4"),
					},
					dom.Button(
						[]dom.Attr{
							dom.Class("material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full cursor-pointer active:opacity-80"),
						},
						dom.Text("notifications"),
					),
					dom.Button(
						[]dom.Attr{
							dom.Class("material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full cursor-pointer active:opacity-80"),
						},
						dom.Text("help"),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("w-8 h-8 rounded-full overflow-hidden border border-border-subtle cursor-pointer active:opacity-80"),
						},
						dom.Img(
							[]dom.Attr{
								dom.Class("w-full h-full object-cover"),
								dom.CustomAttr("data-alt", "A professional portrait of a tech company administrator, high-end photography with soft studio lighting, neutral grey background, corporate yet approachable aesthetic."),
								dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuD694mM760iAF3nwhExrMhxsJLNWjsZNNvbITCy-AumXDHF2axG2NHdzCr9_0swQU5Ck_AzuZgtJJ6AYXYph_-tQ9JJYLtkNelboBzSPakxUrx3EcpHv58HhjITQPJDDJoRvC00T7wVe8CH90lrtZcvEAHa23iDVmsrhFtwDTYFV5b_NIaTWrFgK1Q8FyOSmjTo7M8S4tNwLKt5HsqXsmUsVdlSg7QK4njCzgaimvcuroP2wqNCxU7bUDb00ujEDn6M5_W9nNrutpc"),
							},
						),
					),
				),
			),
			dom.Div(
				[]dom.Attr{
					dom.Class("flex flex-1 overflow-hidden"),
				},
				dom.Aside(
					[]dom.Attr{
						dom.Class("hidden md:flex flex-col h-[calc(100vh-64px)] w-64 p-4 gap-2 border-r border-border-subtle bg-surface-container-lowest"),
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
								dom.Class("font-label-md text-label-md text-secondary"),
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
								dom.Class("flex items-center gap-3 p-3 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"),
								dom.Href("/web/admin/dashboard"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("dashboard"),
							),
							dom.Text("Overview"),
						),
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 p-3 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"),
								dom.Href("/web/admin/users"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("group"),
							),
							dom.Text("Users"),
						),
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 p-3 bg-secondary-container text-on-secondary-container font-bold rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"),
								dom.Href("/web/admin/moderation"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("chat_bubble"),
							),
							dom.Text("Posts"),
						),
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 p-3 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"),
								dom.Href("#"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("assessment"),
							),
							dom.Text("Reports"),
						),
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 p-3 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"),
								dom.Href("/web/admin/settings"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("settings"),
							),
							dom.Text("Settings"),
						),
					),
					dom.Button(
						[]dom.Attr{
							dom.Class("mt-4 w-full py-3 px-4 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold hover:opacity-90 transition-opacity"),
						},
						dom.Text("Generate Report"),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("mt-auto border-t border-border-subtle pt-4 space-y-1"),
						},
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 p-3 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"),
								dom.Href("#"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("contact_support"),
							),
							dom.Text("Support"),
						),
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 p-3 text-secondary hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out font-label-md text-label-md"),
								dom.Href("/web/logout"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("material-symbols-outlined"),
								},
								dom.Text("logout"),
							),
							dom.Text("Logout"),
						),
					),
				),
				dom.Main(
					[]dom.Attr{
						dom.Class("flex-1 overflow-y-auto bg-background p-4 md:p-8"),
					},
					dom.Div(
						[]dom.Attr{
							dom.Class("max-w-max-width-feed mx-auto"),
						},
						dom.Div(
							[]dom.Attr{
								dom.Class("flex flex-col gap-6 mb-8"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("flex justify-between items-end"),
								},
								dom.Div(
									[]dom.Attr{},
									dom.H3(
										[]dom.Attr{
											dom.Class("font-headline-lg text-headline-lg text-text-primary"),
										},
										dom.Text("Post Management"),
									),
									dom.P(
										[]dom.Attr{
											dom.Class("font-body-md text-body-md text-text-secondary"),
										},
										dom.Text("Review and moderate flagged content across the platform."),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("flex gap-2"),
									},
									dom.Span(
										[]dom.Attr{
											dom.Class("bg-error-container text-on-error-container px-3 py-1 rounded-full text-label-sm font-bold flex items-center gap-1"),
										},
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-[16px]"),
											},
											dom.Text("priority_high"),
										),
										dom.Text("24 Flagged"),
									),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("flex gap-2 overflow-x-auto pb-2 hide-scrollbar"),
								},
								dom.Button(
									[]dom.Attr{
										dom.Class("bg-primary text-on-primary px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap shadow-sm"),
									},
									dom.Text("All Content"),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap hover:bg-surface-container-highest transition-colors"),
									},
									dom.Text("Text Only"),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap hover:bg-surface-container-highest transition-colors"),
									},
									dom.Text("Images"),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap hover:bg-surface-container-highest transition-colors"),
									},
									dom.Text("Videos"),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap hover:bg-surface-container-highest transition-colors"),
									},
									dom.Text("Links"),
								),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("space-y-6"),
							},
							dom.Article(
								[]dom.Attr{
									dom.Class("bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden transition-all hover:shadow-md"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("p-5 border-b border-border-subtle bg-surface-container-lowest flex justify-between items-center"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("flex items-center gap-3"),
										},
										dom.Img(
											[]dom.Attr{
												dom.Class("w-10 h-10 rounded-full border border-border-subtle"),
												dom.CustomAttr("data-alt", "Avatar of a social media user, young adult with a friendly expression, soft lighting, modern casual attire, minimalist background with pastel tones."),
												dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuDSGTBcmRcNKd9HFEbmDWd_yU__ONHzfdVq2OQDaqn8jcq5GhX9EfbhqC40FCclk3CxF1KfZoS_CaPq3U8Kv6fx69uEhD25hfEmOq4AHfY-eYOBqLmxbfBXIoMIAUKRNaldD2D1UQF5QyEO7Z3MZ09Zp_ZNo84dnmfm1EFV9bVzjLCiT_Bpx87-Wotme3yBebSSzLnOYabhFMZG-lmZNpSCb1YPkKjKEjlITzq4-v3Dc5EZYtP33lVBUCYGPAaXIwPEV07YqPH_brI"),
											},
										),
										dom.Div(
											[]dom.Attr{},
											dom.P(
												[]dom.Attr{
													dom.Class("font-label-md text-label-md text-text-primary"),
												},
												dom.Text("Julian Rivera"),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("font-label-sm text-label-sm text-text-secondary"),
												},
												dom.Text("Posted 2 hours ago •"),
												dom.Span(
													[]dom.Attr{
														dom.Class("text-error font-bold"),
													},
													dom.Text("Reported: Spam"),
												),
											),
										),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("material-symbols-outlined text-outline cursor-pointer"),
										},
										dom.Text("more_vert"),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("p-5 space-y-4"),
									},
									dom.P(
										[]dom.Attr{
											dom.Class("font-body-lg text-body-lg text-text-primary"),
										},
										dom.Text("Check out this amazing new digital asset pack I just released! Limited time offer for the next 24 hours only. Link in bio!"),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("rounded-lg overflow-hidden border border-border-subtle aspect-video bg-surface-container"),
										},
										dom.Img(
											[]dom.Attr{
												dom.Class("w-full h-full object-cover"),
												dom.CustomAttr("data-alt", "A vibrant digital marketplace thumbnail showcasing 3D abstract geometric icons in a modern glassmorphism style. Bold primary blue and neon pink accents against a clean white background, high-end professional UI design vibes."),
												dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuDU_xKdYGBXMrhurGoBjOxZUvvVZJojJKMW8UbndMAA8sX4th_Svfu6FasRpeRnHHwN5JolH9J_bMPtIc7RJlFPw_WaUH2v1J-HYXBIHJiccA0yZKu1dO5Vzc1N9DunvR7mD_qglkz38wP745spC4IJ62b2vhCDnWeNsDCQqR0GcWepF81W6lBh_s_Jd4uNHxQii42v2KEnC5Fos1DGi3V3FJJv0-GqJNVc-jv4UGybrn74LD0BnGqWX9ELYffjrSV2u5fMkcClaQc"),
											},
										),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("p-4 bg-surface-container-low flex justify-end gap-3"),
									},
									dom.Button(
										[]dom.Attr{
											dom.Class("px-4 py-2 text-text-secondary font-label-md text-label-md hover:bg-surface-container-high rounded-lg transition-colors"),
										},
										dom.Text("Hide"),
									),
									dom.Button(
										[]dom.Attr{
											dom.Class("px-4 py-2 text-error font-label-md text-label-md hover:bg-error-container rounded-lg transition-colors"),
										},
										dom.Text("Delete"),
									),
									dom.Button(
										[]dom.Attr{
											dom.Class("px-6 py-2 bg-success text-on-primary font-label-md text-label-md font-bold rounded-lg hover:opacity-90 shadow-sm"),
										},
										dom.Text("Approve"),
									),
								),
							),
							dom.Article(
								[]dom.Attr{
									dom.Class("bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden transition-all hover:shadow-md"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("p-5 border-b border-border-subtle bg-surface-container-lowest flex justify-between items-center"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("flex items-center gap-3"),
										},
										dom.Img(
											[]dom.Attr{
												dom.Class("w-10 h-10 rounded-full border border-border-subtle"),
												dom.CustomAttr("data-alt", "Close-up profile photo of a mature professional woman with glasses, smiling confidently. High-key lighting, bright office environment background, very clean and trustworthy corporate aesthetic."),
												dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuAzoAXz0Z7iYpUWh1UiVkJiCrGdP8SJQn5e1ZqshA6D33cPcLTUd_u5IkMgeSvzSVEKO4WLx-sY9KUFgILdaVIVa2qx0r8XUeIpEg4qcNXedY-KQo_8OuwvMaBD14Fjoa-GqhBiSFDy2fny1BprqVp4igxEvPQ5Sn118KYbhOdK5IyYaeB45b7CXMvZdFCNwGWcpIc7ey0VYbt9vw5mw4MuJKXRLM6J1TWKrvKDwx8gqZmwBSC9TM3ZhR1qO7yAoxdF8gC2anGKjik"),
											},
										),
										dom.Div(
											[]dom.Attr{},
											dom.P(
												[]dom.Attr{
													dom.Class("font-label-md text-label-md text-text-primary"),
												},
												dom.Text("Dr. Sarah Chen"),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("font-label-sm text-label-sm text-text-secondary"),
												},
												dom.Text("Posted 4 hours ago •"),
												dom.Span(
													[]dom.Attr{
														dom.Class("text-outline font-bold"),
													},
													dom.Text("Normal Review"),
												),
											),
										),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("material-symbols-outlined text-outline cursor-pointer"),
										},
										dom.Text("more_vert"),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("p-5 space-y-4"),
									},
									dom.P(
										[]dom.Attr{
											dom.Class("font-body-lg text-body-lg text-text-primary"),
										},
										dom.Text("I've just published a new research paper on the intersection of AI and user trust. Would love to hear your thoughts on the ethics section."),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("rounded-xl border border-border-subtle overflow-hidden flex flex-col md:flex-row bg-surface-bright hover:bg-surface-container-low transition-colors cursor-pointer"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("md:w-1/3 aspect-[4/3] md:aspect-auto"),
											},
											dom.Img(
												[]dom.Attr{
													dom.Class("w-full h-full object-cover"),
													dom.CustomAttr("data-alt", "A conceptual 3D illustration of a glowing blue brain connected to a network of translucent nodes. The background is a deep, dark blue representing cyberspace. High-tech, futuristic, and professional lighting."),
													dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuCGJLY11gpt6XDKhk2zjfc8jOSzkErandHRW09anVOBpHWhdkNNMvoKOCRI2KBXCHFWv6frPyg885UNd5IWD7_YToXXK9VRAou2PJ-BmyWVIK3KAF3Jr9OQwp-ZDrSOaUeQe9Fnj5aTBEXW2WJp_KNTQTrK6F8nmQaxCWDjVIfP7Bi0f6ar4WG1VXsftkQJw2OUU2JNXT0usbbzfKZqPRwtgfjvzeIT2PQAYMYGlRQHerJhrCgfEk9qNG4mG7cWOZZ2bkKkOya2xdo"),
												},
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("p-4 md:w-2/3 flex flex-col justify-center"),
											},
											dom.P(
												[]dom.Attr{
													dom.Class("font-label-sm text-label-sm text-primary uppercase tracking-wider mb-1"),
												},
												dom.Text("journals.nature.com"),
											),
											dom.H4(
												[]dom.Attr{
													dom.Class("font-headline-md text-headline-md text-text-primary mb-2"),
												},
												dom.Text("Ethics in the Age of Generative Intelligence"),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("font-body-md text-body-md text-text-secondary line-clamp-2"),
												},
												dom.Text("A comprehensive study exploring the socio-technical implications of large language models in professional environments..."),
											),
										),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("p-4 bg-surface-container-low flex justify-end gap-3"),
									},
									dom.Button(
										[]dom.Attr{
											dom.Class("px-4 py-2 text-text-secondary font-label-md text-label-md hover:bg-surface-container-high rounded-lg transition-colors"),
										},
										dom.Text("Hide"),
									),
									dom.Button(
										[]dom.Attr{
											dom.Class("px-4 py-2 text-error font-label-md text-label-md hover:bg-error-container rounded-lg transition-colors"),
										},
										dom.Text("Delete"),
									),
									dom.Button(
										[]dom.Attr{
											dom.Class("px-6 py-2 bg-success text-on-primary font-label-md text-label-md font-bold rounded-lg hover:opacity-90 shadow-sm"),
										},
										dom.Text("Approve"),
									),
								),
							),
							dom.Article(
								[]dom.Attr{
									dom.Class("bg-surface-card rounded-xl border-2 border-error-container shadow-sm overflow-hidden transition-all hover:shadow-md relative"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("absolute top-0 right-0 p-3"),
									},
									dom.Span(
										[]dom.Attr{
											dom.Class("bg-error text-on-error px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter"),
										},
										dom.Text("High Risk"),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("p-5 border-b border-border-subtle bg-surface-container-lowest flex justify-between items-center"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("flex items-center gap-3"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-border-subtle"),
											},
											dom.Span(
												[]dom.Attr{
													dom.Class("material-symbols-outlined text-outline"),
												},
												dom.Text("person"),
											),
										),
										dom.Div(
											[]dom.Attr{},
											dom.P(
												[]dom.Attr{
													dom.Class("font-label-md text-label-md text-text-primary"),
												},
												dom.Text("Anonymous User #9921"),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("font-label-sm text-label-sm text-text-secondary"),
												},
												dom.Text("Posted 15 mins ago •"),
												dom.Span(
													[]dom.Attr{
														dom.Class("text-error font-bold"),
													},
													dom.Text("Reported: Harassment (3 times)"),
												),
											),
										),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("material-symbols-outlined text-outline cursor-pointer"),
										},
										dom.Text("more_vert"),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("p-5 bg-error-container/10"),
									},
									dom.P(
										[]dom.Attr{
											dom.Class("font-body-lg text-body-lg text-text-primary italic border-l-4 border-error pl-4"),
										},
										dom.Text("\"This is a placeholder for potentially harmful content that has been flagged by the community for review. The system has automatically restricted its visibility until a moderator takes action.\""),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("p-4 bg-surface-container-low flex justify-end gap-3"),
									},
									dom.Button(
										[]dom.Attr{
											dom.Class("px-4 py-2 text-text-secondary font-label-md text-label-md hover:bg-surface-container-high rounded-lg transition-colors"),
										},
										dom.Text("Hide"),
									),
									dom.Button(
										[]dom.Attr{
											dom.Class("px-6 py-2 bg-error text-on-error font-label-md text-label-md font-bold rounded-lg hover:opacity-90 shadow-md"),
										},
										dom.Text("Delete Immediately"),
									),
									dom.Button(
										[]dom.Attr{
											dom.Class("px-4 py-2 text-text-secondary font-label-md text-label-md hover:bg-surface-container-high rounded-lg transition-colors"),
										},
										dom.Text("Approve Anyway"),
									),
								),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("py-12 flex flex-col items-center gap-4"),
							},
							dom.Button(
								[]dom.Attr{
									dom.Class("px-8 py-3 bg-surface-container-high text-on-surface-variant rounded-full font-label-md text-label-md font-bold hover:bg-surface-container-highest transition-all flex items-center gap-2"),
								},
								dom.Span(
									[]dom.Attr{
										dom.Class("material-symbols-outlined text-[18px]"),
									},
									dom.Text("expand_more"),
								),
								dom.Text("Load More Content"),
							),
							dom.P(
								[]dom.Attr{
									dom.Class("text-label-sm text-outline"),
								},
								dom.Text("Showing 3 of 142 pending items"),
							),
						),
					),
				),
			),
			dom.Nav(
				[]dom.Attr{
					dom.Class("md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface flex items-center justify-around z-50 border-t border-border-subtle px-4"),
				},
				dom.Button(
					[]dom.Attr{
						dom.Class("flex flex-col items-center gap-1 text-on-surface-variant"),
					},
					dom.Span(
						[]dom.Attr{
							dom.Class("material-symbols-outlined"),
						},
						dom.Text("group"),
					),
					dom.Span(
						[]dom.Attr{
							dom.Class("text-[10px] font-bold"),
						},
						dom.Text("Users"),
					),
				),
				dom.Button(
					[]dom.Attr{
						dom.Class("flex flex-col items-center gap-1 text-primary"),
					},
					dom.Span(
						[]dom.Attr{
							dom.Class("material-symbols-outlined"),
							dom.Style("font-variation-settings: 'FILL' 1;"),
						},
						dom.Text("chat_bubble"),
					),
					dom.Span(
						[]dom.Attr{
							dom.Class("text-[10px] font-bold"),
						},
						dom.Text("Posts"),
					),
				),
				dom.Button(
					[]dom.Attr{
						dom.Class("flex flex-col items-center gap-1 text-on-surface-variant"),
					},
					dom.Span(
						[]dom.Attr{
							dom.Class("material-symbols-outlined"),
						},
						dom.Text("assessment"),
					),
					dom.Span(
						[]dom.Attr{
							dom.Class("text-[10px] font-bold"),
						},
						dom.Text("Reports"),
					),
				),
				dom.Button(
					[]dom.Attr{
						dom.Class("flex flex-col items-center gap-1 text-on-surface-variant"),
					},
					dom.Span(
						[]dom.Attr{
							dom.Class("material-symbols-outlined"),
						},
						dom.Text("settings"),
					),
					dom.Span(
						[]dom.Attr{
							dom.Class("text-[10px] font-bold"),
						},
						dom.Text("Settings"),
					),
				),
			),
			dom.ScriptEl(
				[]dom.Attr{},
				dom.Text("// Micro-interactions for buttons\n        document.querySelectorAll('button').forEach(button => {\n            button.addEventListener('mousedown', () => {\n                button.classList.add('scale-95');\n            });\n            button.addEventListener('mouseup', () => {\n                button.classList.remove('scale-95');\n            });\n            button.addEventListener('mouseleave', () => {\n                button.classList.remove('scale-95');\n            });\n        });\n\n        // Simple mock for \"Approve\" action\n        function handleApprove(event) {\n            const card = event.target.closest('article');\n            card.style.opacity = '0.5';\n            card.style.transform = 'translateY(-10px)';\n            card.style.transition = 'all 0.3s ease';\n            setTimeout(() => {\n                card.remove();\n            }, 300);\n        }\n\n        document.querySelectorAll('button').forEach(btn => {\n            if (btn.innerText === 'Approve' || btn.innerText === 'Delete' || btn.innerText === 'Delete Immediately') {\n                btn.addEventListener('click', handleApprove);\n            }\n        });"),
			),
		),
	)
	return page.Render(w)
}
