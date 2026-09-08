package backend

import (
	"goravel/resources/views/backend/dom"
	"io"
)

func RenderDashboardAdminIkhtisarV3NewBrand(w io.Writer) error {
	page := LayoutAdmin("Connect Modern - Admin Dashboard", "Overview",
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
										dom.Class("font-headline-lg text-headline-lg text-text-primary tracking-tight"),
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
										dom.Class("flex items-center gap-2 bg-surface-card border border-outline-variant/30 px-4 py-2.5 rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors shadow-sm"),
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
										dom.Class("flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg font-label-md text-label-md font-bold hover:bg-primary/90 transition-all shadow-sm"),
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
									dom.Class("bg-surface-card p-6 rounded-2xl border border-outline-variant/30 metric-card-hover transition-all shadow-sm"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center justify-between mb-4"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("p-2.5 bg-primary-fixed rounded-lg"),
										},
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-primary text-[24px]"),
											},
											dom.Text("group"),
										),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-success font-label-sm text-label-sm flex items-center bg-success/10 px-2 py-0.5 rounded-full font-bold"),
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
										dom.Class("text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1"),
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
									dom.Class("bg-surface-card p-6 rounded-2xl border border-outline-variant/30 metric-card-hover transition-all shadow-sm"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center justify-between mb-4"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("p-2.5 bg-tertiary-fixed rounded-lg"),
										},
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-tertiary text-[24px]"),
											},
											dom.Text("chat_bubble"),
										),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-success font-label-sm text-label-sm flex items-center bg-success/10 px-2 py-0.5 rounded-full font-bold"),
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
										dom.Class("text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1"),
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
									dom.Class("bg-surface-card p-6 rounded-2xl border border-outline-variant/30 metric-card-hover transition-all shadow-sm"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center justify-between mb-4"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("p-2.5 bg-secondary-fixed rounded-lg"),
										},
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-secondary text-[24px]"),
											},
											dom.Text("flag"),
										),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-error font-label-sm text-label-sm flex items-center bg-error/10 px-2 py-0.5 rounded-full font-bold"),
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
										dom.Class("text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1"),
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
									dom.Class("bg-surface-card p-6 rounded-2xl border border-outline-variant/30 metric-card-hover transition-all shadow-sm"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center justify-between mb-4"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("p-2.5 bg-success/15 rounded-lg"),
										},
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-success text-[24px]"),
											},
											dom.Text("payments"),
										),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-success font-label-sm text-label-sm flex items-center bg-success/10 px-2 py-0.5 rounded-full font-bold"),
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
										dom.Class("text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1"),
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
									dom.Class("xl:col-span-2 bg-surface-card p-8 rounded-2xl border border-outline-variant/30 shadow-sm"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center justify-between mb-10"),
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
											dom.Class("flex gap-6"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("flex items-center gap-2"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("w-3 h-3 rounded-full bg-primary shadow-sm"),
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
													dom.Class("w-3 h-3 rounded-full bg-primary-fixed-dim shadow-sm"),
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
										dom.Class("chart-container flex items-end justify-between gap-3 px-2"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("flex-1 flex flex-col justify-end group"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary-fixed-dim/30 rounded-t h-[40%] group-hover:bg-primary-fixed-dim/50 transition-colors shadow-sm"),
											},
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary rounded-t h-[60%] group-hover:bg-primary/90 transition-colors shadow-sm"),
											},
										),
										dom.P(
											[]dom.Attr{
												dom.Class("mt-4 text-center font-label-sm text-label-sm text-on-surface-variant font-medium"),
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
												dom.Class("relative w-full bg-primary-fixed-dim/30 rounded-t h-[55%] group-hover:bg-primary-fixed-dim/50 transition-colors shadow-sm"),
											},
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary rounded-t h-[75%] group-hover:bg-primary/90 transition-colors shadow-sm"),
											},
										),
										dom.P(
											[]dom.Attr{
												dom.Class("mt-4 text-center font-label-sm text-label-sm text-on-surface-variant font-medium"),
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
												dom.Class("relative w-full bg-primary-fixed-dim/30 rounded-t h-[30%] group-hover:bg-primary-fixed-dim/50 transition-colors shadow-sm"),
											},
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary rounded-t h-[45%] group-hover:bg-primary/90 transition-colors shadow-sm"),
											},
										),
										dom.P(
											[]dom.Attr{
												dom.Class("mt-4 text-center font-label-sm text-label-sm text-on-surface-variant font-medium"),
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
												dom.Class("relative w-full bg-primary-fixed-dim/30 rounded-t h-[65%] group-hover:bg-primary-fixed-dim/50 transition-colors shadow-sm"),
											},
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary rounded-t h-[90%] group-hover:bg-primary/90 transition-colors shadow-sm"),
											},
										),
										dom.P(
											[]dom.Attr{
												dom.Class("mt-4 text-center font-label-sm text-label-sm text-on-surface-variant font-medium"),
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
												dom.Class("relative w-full bg-primary-fixed-dim/30 rounded-t h-[45%] group-hover:bg-primary-fixed-dim/50 transition-colors shadow-sm"),
											},
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary rounded-t h-[70%] group-hover:bg-primary/90 transition-colors shadow-sm"),
											},
										),
										dom.P(
											[]dom.Attr{
												dom.Class("mt-4 text-center font-label-sm text-label-sm text-on-surface-variant font-medium"),
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
												dom.Class("relative w-full bg-primary-fixed-dim/30 rounded-t h-[80%] group-hover:bg-primary-fixed-dim/50 transition-colors shadow-sm"),
											},
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary rounded-t h-[95%] group-hover:bg-primary/90 transition-colors shadow-sm"),
											},
										),
										dom.P(
											[]dom.Attr{
												dom.Class("mt-4 text-center font-label-sm text-label-sm text-on-surface-variant font-medium"),
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
												dom.Class("relative w-full bg-primary-fixed-dim/30 rounded-t h-[50%] group-hover:bg-primary-fixed-dim/50 transition-colors shadow-sm"),
											},
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full bg-primary rounded-t h-[85%] group-hover:bg-primary/90 transition-colors shadow-sm"),
											},
										),
										dom.P(
											[]dom.Attr{
												dom.Class("mt-4 text-center font-label-sm text-label-sm text-on-surface-variant font-medium"),
											},
											dom.Text("Sun"),
										),
									),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("bg-surface-card p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col"),
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
											dom.Class("text-primary font-label-md text-label-md font-bold hover:underline"),
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
											dom.Class("flex gap-4 items-start"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("relative"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("w-11 h-11 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30"),
												},
												dom.Img(
													[]dom.Attr{
														dom.Class("w-full h-full object-cover"),
														dom.CustomAttr("data-alt", "Portrait of Marcus Chen"),
														dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuAhkm0sGYbpvgHDWA3pVNH4Lf_-AZD-oxgmxVe3MWpHZYl0UzkPaUrSIeckQVnTCdE4ruWPrUAw9Cjoct50Vb_55TDOalBqHrpX0HG8EN7jMy0PJ4QY1gIPXehiXKlV1Q8LFKGG-Ma_TW-XJiC4SqOllzaQKTKZsdcCPlVRloXc0CBzQJnfDPfeicD1aczOr4U2kqt5taLBHdOoI71FJ805JRMlvtAH-co1K4w9UNBxJyy7D3f0W9mnz9KDNEUtyokv5If8LEKJX78"),
													},
												),
											),
											dom.Div(
												[]dom.Attr{
													dom.Class("absolute -bottom-0.5 -right-0.5 bg-success border-2 border-surface-card rounded-full w-3.5 h-3.5 shadow-sm"),
												},
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex-1"),
											},
											dom.P(
												[]dom.Attr{
													dom.Class("font-body-md text-body-md text-text-primary leading-snug"),
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
													dom.Class("text-text-secondary font-label-sm text-label-sm mt-0.5"),
												},
												dom.Text("2 minutes ago"),
											),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex gap-4 items-start"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("w-11 h-11 rounded-full bg-tertiary-fixed-dim/30 flex items-center justify-center border border-tertiary-fixed-dim/50"),
											},
											dom.Span(
												[]dom.Attr{
													dom.Class("material-symbols-outlined text-tertiary text-[22px]"),
												},
												dom.Text("report"),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex-1"),
											},
											dom.P(
												[]dom.Attr{
													dom.Class("font-body-md text-body-md text-text-primary leading-snug"),
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
													dom.Class("text-text-secondary font-label-sm text-label-sm mt-0.5"),
												},
												dom.Text("15 minutes ago"),
											),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex gap-4 items-start"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("w-11 h-11 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30"),
											},
											dom.Img(
												[]dom.Attr{
													dom.Class("w-full h-full object-cover"),
													dom.CustomAttr("data-alt", "Portrait of Elena Rodriguez"),
													dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuAHpyDX7C1RMmnrvL0tQnP8q6_Xs8Q9hx8CEfsUI0r_doVfnS53rViP2JGYskcC-P2x6X37C-8_Im1PLpH92RAM21md8X8mIztFKJu3bonMV7Xj6PTqSjiB53Sy-mruy-3b6xtV5fjSYLc_xgPqt4paWn8nO81Fe55mVoOThNC89hzYNs6IxqOWAWY6z8-fIsL4KPv6ltBBRpDEvx1Q-y-It10qNAfjfoAPETy7i7TaJ4qZKpkSjBVTjMEQw3JuLn83l7tIVX2aXes"),
												},
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex-1"),
											},
											dom.P(
												[]dom.Attr{
													dom.Class("font-body-md text-body-md text-text-primary leading-snug"),
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
													dom.Class("text-text-secondary font-label-sm text-label-sm mt-0.5"),
												},
												dom.Text("42 minutes ago"),
											),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex gap-4 items-start"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("w-11 h-11 rounded-full bg-primary-fixed/50 flex items-center justify-center border border-primary-fixed"),
											},
											dom.Span(
												[]dom.Attr{
													dom.Class("material-symbols-outlined text-primary text-[22px]"),
												},
												dom.Text("shopping_bag"),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex-1"),
											},
											dom.P(
												[]dom.Attr{
													dom.Class("font-body-md text-body-md text-text-primary leading-snug"),
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
													dom.Class("text-text-secondary font-label-sm text-label-sm mt-0.5"),
												},
												dom.Text("1 hour ago"),
											),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("flex gap-4 items-start"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("w-11 h-11 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30"),
											},
											dom.Img(
												[]dom.Attr{
													dom.Class("w-full h-full object-cover"),
													dom.CustomAttr("data-alt", "Portrait of Julian Vane"),
													dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuChxiqvbrO_VIfj-s5UUj2Et3fUUgGHJ80v_4Mn3rccjgUWGleLKgtksb1I0le7poYopQb5uWuISAe_Dlq1gkoiO_spvqVIvLbxDedbCMgmSlmYcjvTPWgNvXZNhJpPmQdNhn19q2yuIvSEE81BGoN6SUrJcsE41LG1jq7b6F2zs5A851RUdq7GYxf3h9SdtdulnxR1K_TZQeFIjIG1bV-MiqiL9bCMWMpx2qNRLXSxNzccxkysS_F8vxjtk8Jmsg8XKNHQZ9PQHIY"),
												},
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex-1"),
											},
											dom.P(
												[]dom.Attr{
													dom.Class("font-body-md text-body-md text-text-primary leading-snug"),
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
													dom.Class("text-text-secondary font-label-sm text-label-sm mt-0.5"),
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
									dom.Class("bg-surface-card rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("px-6 py-5 border-b border-outline-variant/30 flex items-center justify-between"),
									},
									dom.H3(
										[]dom.Attr{
											dom.Class("font-headline-md text-headline-md text-text-primary"),
										},
										dom.Text("Newest Members"),
									),
									dom.Button(
										[]dom.Attr{
											dom.Class("text-on-surface-variant material-symbols-outlined hover:bg-surface-container-low p-1.5 rounded-full transition-colors"),
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
													dom.Class("bg-surface-container-low/50"),
												},
												dom.Th(
													[]dom.Attr{
														dom.Class("px-6 py-3.5 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
													},
													dom.Text("User"),
												),
												dom.Th(
													[]dom.Attr{
														dom.Class("px-6 py-3.5 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
													},
													dom.Text("Status"),
												),
												dom.Th(
													[]dom.Attr{
														dom.Class("px-6 py-3.5 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
													},
													dom.Text("Role"),
												),
												dom.Th(
													[]dom.Attr{
														dom.Class("px-6 py-3.5 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
													},
													dom.Text("Joined"),
												),
											),
										),
										dom.Tbody(
											[]dom.Attr{
												dom.Class("divide-y divide-outline-variant/20"),
											},
											dom.Tr(
												[]dom.Attr{
													dom.Class("hover:bg-surface-container-low/50 transition-colors"),
												},
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4 flex items-center gap-3"),
													},
													dom.Div(
														[]dom.Attr{
															dom.Class("w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary text-xs shadow-sm"),
														},
														dom.Text("JD"),
													),
													dom.Span(
														[]dom.Attr{
															dom.Class("font-body-md text-body-md font-semibold text-on-surface"),
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
															dom.Class("px-2.5 py-1 rounded-lg bg-success/10 text-success text-[10px] font-bold uppercase tracking-tight"),
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
													dom.Class("hover:bg-surface-container-low/50 transition-colors"),
												},
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4 flex items-center gap-3"),
													},
													dom.Div(
														[]dom.Attr{
															dom.Class("w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-secondary text-xs shadow-sm"),
														},
														dom.Text("AS"),
													),
													dom.Span(
														[]dom.Attr{
															dom.Class("font-body-md text-body-md font-semibold text-on-surface"),
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
															dom.Class("px-2.5 py-1 rounded-lg bg-success/10 text-success text-[10px] font-bold uppercase tracking-tight"),
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
													dom.Class("hover:bg-surface-container-low/50 transition-colors"),
												},
												dom.Td(
													[]dom.Attr{
														dom.Class("px-6 py-4 flex items-center gap-3"),
													},
													dom.Div(
														[]dom.Attr{
															dom.Class("w-9 h-9 rounded-full bg-tertiary-fixed flex items-center justify-center font-bold text-tertiary text-xs shadow-sm"),
														},
														dom.Text("BK"),
													),
													dom.Span(
														[]dom.Attr{
															dom.Class("font-body-md text-body-md font-semibold text-on-surface"),
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
															dom.Class("px-2.5 py-1 rounded-lg bg-on-surface-variant/10 text-on-surface-variant text-[10px] font-bold uppercase tracking-tight"),
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
										dom.Class("bg-surface-card p-6 rounded-2xl border border-outline-variant/30 shadow-sm"),
									},
									dom.H3(
										[]dom.Attr{
											dom.Class("font-headline-md text-headline-md text-text-primary mb-5"),
										},
										dom.Text("System Tasks"),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("space-y-3.5"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("flex items-center justify-between p-3.5 bg-surface-container-low/60 rounded-xl border border-outline-variant/10"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("flex items-center gap-3"),
												},
												dom.Input(
													[]dom.Attr{
														dom.Class("rounded text-primary focus:ring-primary h-4.5 w-4.5 border-outline-variant"),
														dom.Type("checkbox"),
													},
												),
												dom.Span(
													[]dom.Attr{
														dom.Class("font-body-md text-body-md font-medium text-on-surface"),
													},
													dom.Text("Review 12 flagged posts"),
												),
											),
											dom.Span(
												[]dom.Attr{
													dom.Class("bg-error/10 text-error px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight"),
												},
												dom.Text("High Priority"),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex items-center justify-between p-3.5 bg-surface-container-low/60 rounded-xl border border-outline-variant/10"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("flex items-center gap-3"),
												},
												dom.Input(
													[]dom.Attr{
														dom.Class("rounded text-primary focus:ring-primary h-4.5 w-4.5 border-outline-variant"),
														dom.Type("checkbox"),
													},
												),
												dom.Span(
													[]dom.Attr{
														dom.Class("font-body-md text-body-md font-medium text-on-surface"),
													},
													dom.Text("Backup database server"),
												),
											),
											dom.Span(
												[]dom.Attr{
													dom.Class("bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight"),
												},
												dom.Text("Scheduled"),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex items-center justify-between p-3.5 bg-surface-container-low/60 rounded-xl border border-outline-variant/10"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("flex items-center gap-3"),
												},
												dom.Input(
													[]dom.Attr{
														dom.Checked(),
														dom.Class("rounded text-primary focus:ring-primary h-4.5 w-4.5 border-outline-variant"),
														dom.Type("checkbox"),
													},
												),
												dom.Span(
													[]dom.Attr{
														dom.Class("font-body-md text-body-md font-medium text-on-surface line-through opacity-40"),
													},
													dom.Text("Approve new API credentials"),
												),
											),
											dom.Span(
												[]dom.Attr{
													dom.Class("bg-success/15 text-success px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight"),
												},
												dom.Text("Done"),
											),
										),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("bg-inverse-surface text-inverse-on-surface p-7 rounded-2xl shadow-lg flex items-center justify-between"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("flex items-center gap-5"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("w-14 h-14 rounded-full bg-success/20 flex items-center justify-center shadow-inner"),
											},
											dom.Span(
												[]dom.Attr{
													dom.Class("material-symbols-outlined text-success text-[32px]"),
												},
												dom.Text("check_circle"),
											),
										),
										dom.Div(
											[]dom.Attr{},
											dom.H4(
												[]dom.Attr{
													dom.Class("font-headline-md text-headline-md tracking-tight"),
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
											dom.Class("bg-white/15 hover:bg-white/25 px-5 py-2.5 rounded-lg font-label-md text-label-md transition-all font-bold backdrop-blur-sm border border-white/10"),
										},
										dom.Text("Status Page"),
									),
								),
							),
						),
					),
	)
	return page.Render(w)
}
