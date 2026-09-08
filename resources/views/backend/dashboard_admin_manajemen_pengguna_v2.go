package backend

import (
	"fmt"
	"goravel/app/models"
	"goravel/resources/views/backend/dom"
	"io"
	"strings"
)

func RenderDashboardAdminManajemenPenggunaV2(w io.Writer, users []models.User) error {
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
			roleText = string(u.Role)
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

	page := LayoutAdmin("Connect Modern - Admin Dashboard", "Users",
		dom.Div(
					[]dom.Attr{
						dom.Class("max-w-max-width-container mx-auto"),
					},
					dom.Div(
						[]dom.Attr{
							dom.Class("flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"),
						},
						dom.Div(
							[]dom.Attr{},
							dom.H1(
								[]dom.Attr{
									dom.Class("font-headline-lg text-headline-lg text-text-primary tracking-tight"),
								},
								dom.Text("User Management"),
							),
							dom.P(
								[]dom.Attr{
									dom.Class("font-body-md text-body-md text-text-secondary mt-1"),
								},
								dom.Text("Manage platform access, roles, and monitoring active user sessions."),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("flex items-center gap-3"),
							},
							dom.Button(
								[]dom.Attr{
									dom.Class("flex items-center gap-2 px-4 py-2.5 bg-secondary-container text-on-secondary-container rounded-xl font-label-md text-label-md hover:bg-secondary-fixed transition-colors active:scale-95"),
								},
								dom.Span(
									[]dom.Attr{
										dom.Class("material-symbols-outlined text-[20px]"),
									},
									dom.Text("download"),
								),
								dom.Text("Export CSV"),
							),
							dom.Button(
								[]dom.Attr{
									dom.Class("flex items-center gap-2 px-6 py-2.5 bg-primary-container text-on-primary rounded-xl font-label-md text-label-md shadow-lg shadow-primary/10 hover:opacity-90 transition-all active:scale-95"),
								},
								dom.Span(
									[]dom.Attr{
										dom.Class("material-symbols-outlined text-[20px]"),
									},
									dom.Text("person_add"),
								),
								dom.Text("Add New User"),
							),
						),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"),
						},
						dom.Div(
							[]dom.Attr{
								dom.Class("bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-2"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("text-text-secondary font-label-md text-label-md"),
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
									dom.Text(fmt.Sprintf("%d", len(users))),
								),
								dom.Span(
									[]dom.Attr{
										dom.Class("text-success text-[12px] font-bold"),
									},
									dom.Text("+0%"),
								),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-2"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("text-text-secondary font-label-md text-label-md"),
								},
								dom.Text("Active Now"),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("flex items-center gap-2"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("w-2 h-2 rounded-full bg-success animate-pulse"),
									},
								),
								dom.Span(
									[]dom.Attr{
										dom.Class("font-display-lg text-display-lg text-text-primary"),
									},
									dom.Text(fmt.Sprintf("%d", len(users))),
								),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-2"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("text-text-secondary font-label-md text-label-md"),
								},
								dom.Text("Pending Invites"),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("flex items-baseline gap-2"),
								},
								dom.Span(
									[]dom.Attr{
										dom.Class("font-display-lg text-display-lg text-text-primary"),
									},
									dom.Text("0"),
								),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col gap-2"),
							},
							dom.Span(
								[]dom.Attr{
									dom.Class("text-text-secondary font-label-md text-label-md"),
								},
								dom.Text("Avg. Activity"),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("flex items-baseline gap-2"),
								},
								dom.Span(
									[]dom.Attr{
										dom.Class("font-display-lg text-display-lg text-text-primary"),
									},
									dom.Text("84%"),
								),
								dom.Span(
									[]dom.Attr{
										dom.Class("text-error text-[12px] font-bold"),
									},
									dom.Text("-2%"),
								),
							),
						),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("bg-surface-container-lowest rounded-2xl border border-border-subtle shadow-sm overflow-hidden flex flex-col"),
						},
						dom.Div(
							[]dom.Attr{
								dom.Class("px-6 py-4 border-b border-border-subtle flex flex-wrap items-center justify-between gap-4"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("flex items-center gap-4"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-border-subtle"),
									},
									dom.Span(
										[]dom.Attr{
											dom.Class("material-symbols-outlined text-[18px] text-text-secondary"),
										},
										dom.Text("filter_alt"),
									),
									dom.SelectEl(
										[]dom.Attr{
											dom.Class("bg-transparent border-none p-0 pr-6 focus:ring-0 font-label-md text-label-md text-text-primary cursor-pointer"),
										},
										dom.OptionEl(
											[]dom.Attr{},
											dom.Text("All Roles"),
										),
										dom.OptionEl(
											[]dom.Attr{},
											dom.Text("Admin"),
										),
										dom.OptionEl(
											[]dom.Attr{},
											dom.Text("Editor"),
										),
										dom.OptionEl(
											[]dom.Attr{},
											dom.Text("Viewer"),
										),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-border-subtle"),
									},
									dom.Span(
										[]dom.Attr{
											dom.Class("material-symbols-outlined text-[18px] text-text-secondary"),
										},
										dom.Text("event"),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("font-label-md text-label-md text-text-primary"),
										},
										dom.Text("Last 30 Days"),
									),
								),
							),
							dom.Span(
								[]dom.Attr{
									dom.Class("text-text-secondary font-label-md text-label-md"),
								},
								dom.Text(fmt.Sprintf("Showing 1-%d of %d users", len(users), len(users))),
							),
						),
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
												dom.Class("px-6 py-4 w-12"),
											},
											dom.Input(
												[]dom.Attr{
													dom.Class("rounded border-border-subtle text-primary focus:ring-primary"),
													dom.Type("checkbox"),
												},
											),
										),
										dom.Th(
											[]dom.Attr{
												dom.Class("px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
											},
											dom.Text("Name"),
										),
										dom.Th(
											[]dom.Attr{
												dom.Class("px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
											},
											dom.Text("Role"),
										),
										dom.Th(
											[]dom.Attr{
												dom.Class("px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
											},
											dom.Text("Status"),
										),
										dom.Th(
											[]dom.Attr{
												dom.Class("px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
											},
											dom.Text("Team"),
										),
										dom.Th(
											[]dom.Attr{
												dom.Class("px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
											},
											dom.Text("Last Activity"),
										),
										dom.Th(
											[]dom.Attr{
												dom.Class("px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider text-right"),
											},
											dom.Text("Actions"),
										),
									),
								),
								dom.Tbody(
									[]dom.Attr{
										dom.Class("divide-y divide-border-subtle"),
									},
									userRows...,
								),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("px-6 py-4 bg-surface-container-low flex items-center justify-between"),
							},
							dom.Button(
								[]dom.Attr{
									dom.Class("flex items-center gap-2 px-3 py-1.5 bg-white border border-border-subtle rounded-lg font-label-sm text-label-sm text-text-secondary disabled:opacity-50"),
									dom.Disabled(),
								},
								dom.Span(
									[]dom.Attr{
										dom.Class("material-symbols-outlined text-[16px]"),
									},
									dom.Text("chevron_left"),
								),
								dom.Text("Previous"),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("flex items-center gap-1"),
								},
								dom.Button(
									[]dom.Attr{
										dom.Class("w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-label-sm text-label-sm"),
									},
									dom.Text("1"),
								),
							),
							dom.Button(
								[]dom.Attr{
									dom.Class("flex items-center gap-2 px-3 py-1.5 bg-white border border-border-subtle rounded-lg font-label-sm text-label-sm text-text-secondary disabled:opacity-50"),
									dom.Disabled(),
								},
								dom.Text("Next"),
								dom.Span(
									[]dom.Attr{
										dom.Class("material-symbols-outlined text-[16px]"),
									},
									dom.Text("chevron_right"),
								),
							),
						),
					),
				),
	)
	return page.Render(w)
}
