package backend

import (
	"fmt"
	"goravel/app/models"
	"goravel/resources/views/backend/dom"
	"io"
)

func RenderDashboardAdminPosts(w io.Writer, posts []models.Post) error {
	var postRows []dom.Node
	for _, p := range posts {
		authorName := "Unknown User"
		if p.User.Name != "" {
			authorName = p.User.Name
		}
		
		contentPreview := ""
		if p.Content != nil {
			contentPreview = *p.Content
			if len(contentPreview) > 50 {
				contentPreview = contentPreview[:50] + "..."
			}
		}

		postRows = append(postRows, dom.Tr(
			[]dom.Attr{
				dom.Class("hover:bg-surface-container-low/50 transition-colors group"),
			},
			dom.Td(
				[]dom.Attr{dom.Class("px-6 py-4 font-label-md text-label-md text-text-primary")},
				dom.Text(fmt.Sprintf("%d", p.ID)),
			),
			dom.Td(
				[]dom.Attr{dom.Class("px-6 py-4 font-label-md text-label-md text-text-primary")},
				dom.Text(authorName),
			),
			dom.Td(
				[]dom.Attr{dom.Class("px-6 py-4 font-body-md text-body-md text-text-secondary")},
				dom.Text(contentPreview),
			),
			dom.Td(
				[]dom.Attr{dom.Class("px-6 py-4")},
				dom.Span([]dom.Attr{dom.Class("px-2 py-1 bg-surface-container-high rounded-full font-label-sm text-label-sm text-text-primary uppercase")}, dom.Text(string(p.PostType))),
			),
			dom.Td(
				[]dom.Attr{dom.Class("px-6 py-4 font-body-md text-body-md text-text-secondary")},
				dom.Text(p.CreatedAt.Format("02 Jan 2006, 15:04")),
			),
			dom.Td(
				[]dom.Attr{dom.Class("px-6 py-4 text-right")},
				dom.Form(
					[]dom.Attr{
						dom.CustomAttr("action", fmt.Sprintf("/web/admin/posts/%d/delete", p.ID)),
						dom.CustomAttr("method", "POST"),
						dom.Style("display:inline;"),
					},
					dom.Button(
						[]dom.Attr{
							dom.Type("submit"),
							dom.Class("p-2 text-text-secondary hover:text-error transition-colors"),
							dom.CustomAttr("onclick", "return confirm('Are you sure you want to delete this post?');"),
						},
						dom.Span([]dom.Attr{dom.Class("material-symbols-outlined")}, dom.Text("delete")),
					),
				),
			),
		))
	}

	page := LayoutAdmin("Connect Modern - Posts Management", "Posts",
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
						dom.Text("Posts Management"),
					),
					dom.P(
						[]dom.Attr{
							dom.Class("font-body-md text-body-md text-text-secondary mt-1"),
						},
						dom.Text("Monitor and manage user-generated content on the platform."),
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
					dom.Span(
						[]dom.Attr{
							dom.Class("text-text-secondary font-label-md text-label-md"),
						},
						dom.Text(fmt.Sprintf("Showing 1-%d of %d posts", len(posts), len(posts))),
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
										dom.Class("px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
									},
									dom.Text("ID"),
								),
								dom.Th(
									[]dom.Attr{
										dom.Class("px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
									},
									dom.Text("Author"),
								),
								dom.Th(
									[]dom.Attr{
										dom.Class("px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
									},
									dom.Text("Content"),
								),
								dom.Th(
									[]dom.Attr{
										dom.Class("px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
									},
									dom.Text("Type"),
								),
								dom.Th(
									[]dom.Attr{
										dom.Class("px-6 py-4 font-label-md text-label-md text-text-secondary uppercase tracking-wider"),
									},
									dom.Text("Date Created"),
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
							postRows...,
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
