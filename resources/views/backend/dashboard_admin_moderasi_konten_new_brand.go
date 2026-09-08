package backend

import (
	"goravel/resources/views/backend/dom"
	"io"
)

func RenderDashboardAdminModerasiKontenNewBrand(w io.Writer) error {
	page := LayoutAdmin("Connect Modern - Admin Dashboard", "Reports",
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
									dom.Text("Content Moderation"),
								),
								dom.P(
									[]dom.Attr{
										dom.Class("text-text-secondary font-body-md text-body-md"),
									},
									dom.Text("Review and manage flagged content across the platform."),
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
											dom.Class("p-2.5 bg-tertiary-fixed rounded-lg"),
										},
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-tertiary text-[24px]"),
											},
											dom.Text("pending_actions"),
										),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-error font-label-sm text-label-sm flex items-center bg-error/10 px-2 py-0.5 rounded-full font-bold"),
										},
										dom.Text("+12"),
									),
								),
								dom.P(
									[]dom.Attr{
										dom.Class("text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1"),
									},
									dom.Text("Pending Review"),
								),
								dom.H3(
									[]dom.Attr{
										dom.Class("font-display-lg text-display-lg text-text-primary"),
									},
									dom.Text("142"),
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
										dom.Text("+5"),
									),
								),
								dom.P(
									[]dom.Attr{
										dom.Class("text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1"),
									},
									dom.Text("Flagged Today"),
								),
								dom.H3(
									[]dom.Attr{
										dom.Class("font-display-lg text-display-lg text-text-primary"),
									},
									dom.Text("28"),
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
											dom.Text("check_circle"),
										),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-success font-label-sm text-label-sm flex items-center bg-success/10 px-2 py-0.5 rounded-full font-bold"),
										},
										dom.Text("98%"),
									),
								),
								dom.P(
									[]dom.Attr{
										dom.Class("text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1"),
									},
									dom.Text("Resolved"),
								),
								dom.H3(
									[]dom.Attr{
										dom.Class("font-display-lg text-display-lg text-text-primary"),
									},
									dom.Text("1,204"),
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
											dom.Class("p-2.5 bg-primary-fixed rounded-lg"),
										},
										dom.Span(
											[]dom.Attr{
												dom.Class("material-symbols-outlined text-primary text-[24px]"),
											},
											dom.Text("block"),
										),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-on-surface-variant font-label-sm text-label-sm flex items-center bg-on-surface-variant/10 px-2 py-0.5 rounded-full font-bold"),
										},
										dom.Text("Stable"),
									),
								),
								dom.P(
									[]dom.Attr{
										dom.Class("text-text-secondary font-label-md text-label-md uppercase tracking-widest mb-1"),
									},
									dom.Text("Auto-Blocked"),
								),
								dom.H3(
									[]dom.Attr{
										dom.Class("font-display-lg text-display-lg text-text-primary"),
									},
									dom.Text("56"),
								),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("bg-surface-card rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("px-8 py-6 border-b border-outline-variant/30 flex items-center justify-between"),
								},
								dom.H3(
									[]dom.Attr{
										dom.Class("font-headline-md text-headline-md text-text-primary"),
									},
									dom.Text("Moderation Queue"),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("flex gap-2"),
									},
									dom.Button(
										[]dom.Attr{
											dom.Class("px-4 py-2 bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg border border-outline-variant/30 hover:bg-surface-container-high transition-colors"),
										},
										dom.Text("Filter"),
									),
									dom.Button(
										[]dom.Attr{
											dom.Class("px-4 py-2 bg-primary text-on-primary font-label-md text-label-md font-bold rounded-lg hover:bg-primary/90 transition-all"),
										},
										dom.Text("Bulk Actions"),
									),
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
													dom.Class("px-8 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
												},
												dom.Text("Content"),
											),
											dom.Th(
												[]dom.Attr{
													dom.Class("px-8 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
												},
												dom.Text("Author"),
											),
											dom.Th(
												[]dom.Attr{
													dom.Class("px-8 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
												},
												dom.Text("Report Reason"),
											),
											dom.Th(
												[]dom.Attr{
													dom.Class("px-8 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
												},
												dom.Text("Status"),
											),
											dom.Th(
												[]dom.Attr{
													dom.Class("px-8 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
												},
												dom.Text("Actions"),
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
													dom.Class("px-8 py-5"),
												},
												dom.P(
													[]dom.Attr{
														dom.Class("font-body-md text-body-md text-on-surface line-clamp-1"),
													},
													dom.Text("\"This platform is terrible and everyone should leave...\""),
												),
											),
											dom.Td(
												[]dom.Attr{
													dom.Class("px-8 py-5"),
												},
												dom.Div(
													[]dom.Attr{
														dom.Class("flex items-center gap-3"),
													},
													dom.Div(
														[]dom.Attr{
															dom.Class("w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-secondary text-[10px]"),
														},
														dom.Text("TR"),
													),
													dom.Span(
														[]dom.Attr{
															dom.Class("font-body-md text-body-md font-semibold text-on-surface"),
														},
														dom.Text("Tom Riddle"),
													),
												),
											),
											dom.Td(
												[]dom.Attr{
													dom.Class("px-8 py-5"),
												},
												dom.Span(
													[]dom.Attr{
														dom.Class("text-body-md text-text-secondary"),
													},
													dom.Text("Harassment"),
												),
											),
											dom.Td(
												[]dom.Attr{
													dom.Class("px-8 py-5"),
												},
												dom.Span(
													[]dom.Attr{
														dom.Class("px-2.5 py-1 rounded-lg bg-tertiary-fixed-dim/30 text-tertiary text-[10px] font-bold uppercase tracking-tight"),
													},
													dom.Text("Under Review"),
												),
											),
											dom.Td(
												[]dom.Attr{
													dom.Class("px-8 py-5"),
												},
												dom.Div(
													[]dom.Attr{
														dom.Class("flex gap-2"),
													},
													dom.Button(
														[]dom.Attr{
															dom.Class("p-2 text-success hover:bg-success/10 rounded-lg transition-colors material-symbols-outlined"),
														},
														dom.Text("check"),
													),
													dom.Button(
														[]dom.Attr{
															dom.Class("p-2 text-error hover:bg-error/10 rounded-lg transition-colors material-symbols-outlined"),
														},
														dom.Text("block"),
													),
													dom.Button(
														[]dom.Attr{
															dom.Class("p-2 text-text-secondary hover:bg-surface-container-high rounded-lg transition-colors material-symbols-outlined"),
														},
														dom.Text("delete"),
													),
												),
											),
										),
										dom.Tr(
											[]dom.Attr{
												dom.Class("hover:bg-surface-container-low/50 transition-colors"),
											},
											dom.Td(
												[]dom.Attr{
													dom.Class("px-8 py-5"),
												},
												dom.P(
													[]dom.Attr{
														dom.Class("font-body-md text-body-md text-on-surface line-clamp-1"),
													},
													dom.Text("\"Check out this amazing crypto opportunity! Link in bio...\""),
												),
											),
											dom.Td(
												[]dom.Attr{
													dom.Class("px-8 py-5"),
												},
												dom.Div(
													[]dom.Attr{
														dom.Class("flex items-center gap-3"),
													},
													dom.Div(
														[]dom.Attr{
															dom.Class("w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary text-[10px]"),
														},
														dom.Text("SB"),
													),
													dom.Span(
														[]dom.Attr{
															dom.Class("font-body-md text-body-md font-semibold text-on-surface"),
														},
														dom.Text("SpamBot99"),
													),
												),
											),
											dom.Td(
												[]dom.Attr{
													dom.Class("px-8 py-5"),
												},
												dom.Span(
													[]dom.Attr{
														dom.Class("text-body-md text-text-secondary"),
													},
													dom.Text("Spam"),
												),
											),
											dom.Td(
												[]dom.Attr{
													dom.Class("px-8 py-5"),
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
													dom.Class("px-8 py-5"),
												},
												dom.Div(
													[]dom.Attr{
														dom.Class("flex gap-2"),
													},
													dom.Button(
														[]dom.Attr{
															dom.Class("p-2 text-success hover:bg-success/10 rounded-lg transition-colors material-symbols-outlined"),
														},
														dom.Text("check"),
													),
													dom.Button(
														[]dom.Attr{
															dom.Class("p-2 text-error hover:bg-error/10 rounded-lg transition-colors material-symbols-outlined"),
														},
														dom.Text("block"),
													),
													dom.Button(
														[]dom.Attr{
															dom.Class("p-2 text-text-secondary hover:bg-surface-container-high rounded-lg transition-colors material-symbols-outlined"),
														},
														dom.Text("delete"),
													),
												),
											),
										),
									),
								),
							),
						),
					),
	)
	return page.Render(w)
}
