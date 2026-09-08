package backend

import (
	"goravel/app/models"
	"goravel/resources/views/backend/dom"
	"io"
)

type BerandaData struct {
	CurrentUser models.User
	Posts       []models.Post
}

func RenderBeranda(w io.Writer, data BerandaData) error {
	currentUserAvatar := "https://lh3.googleusercontent.com/aida-public/AB6AXuBvTEfn_OD2OcuaL7fDG5TktYj4ddGZXXNKyqq-SO5SpJXhic851LZnP7-sLwq9NXRhIghPfui5jKjB5n8yb8D0QLqEjKXIjw3PQp2XY5hntjKbwjVx2ghLlQHRVT41r_26NBU5vk6ZOTYxVKBDepkG6WVOOInnig3EwSOgtrZ78zje1krJydOgP4VwT4Zj_tjrcUHpL0jt0O0EU4KF_1Su_5hdWkE2u7Nj-lXa3b5G3BQhEbkIdW-ILbmuQQzEOJtVgI2ZwFOit6k"
	if data.CurrentUser.AvatarURL != nil && *data.CurrentUser.AvatarURL != "" {
		currentUserAvatar = *data.CurrentUser.AvatarURL
	}

	page := dom.Html(
		[]dom.Attr{
			dom.Lang("en"),
		},
		dom.Head(
			nil,
			dom.Meta([]dom.Attr{dom.Charset("utf-8")}),
			dom.Meta([]dom.Attr{dom.ContentAttr("width=device-width, initial-scale=1.0"), dom.Name("viewport")}),
			dom.TitleEl("Connect Modern | Home"),
			dom.ScriptEl([]dom.Attr{dom.Src("https://cdn.tailwindcss.com?plugins=forms,container-queries")}, ""),
			dom.Link([]dom.Attr{dom.Href("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"), dom.Rel("stylesheet")}),
			dom.Link([]dom.Attr{dom.Href("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"), dom.Rel("stylesheet")}),
			dom.Link([]dom.Attr{dom.Href("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"), dom.Rel("stylesheet")}),
			dom.StyleEl(nil, `.material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .fill-icon {
            font-variation-settings: 'FILL' 1;
        }
        body {
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }`),
			dom.ScriptEl([]dom.Attr{dom.Id("tailwind-config")}, `tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "secondary": "#54606a",
                        "tertiary-fixed-dim": "#ffb59b",
                        "border-subtle": "#CED0D4",
                        "tertiary-container": "#cb4400",
                        "surface-container-highest": "#e0e3e6",
                        "inverse-primary": "#b3c5ff",
                        "on-surface": "#191c1e",
                        "on-error-container": "#93000a",
                        "secondary-fixed": "#d8e4f0",
                        "on-secondary-container": "#5a6670",
                        "on-primary-fixed-variant": "#003fa5",
                        "surface-bright": "#f7f9fc",
                        "surface-container": "#eceef1",
                        "primary-container": "#0866ff",
                        "surface-tint": "#0054d7",
                        "on-tertiary": "#ffffff",
                        "on-background": "#191c1e",
                        "surface-card": "#FFFFFF",
                        "on-secondary": "#ffffff",
                        "inverse-on-surface": "#eff1f4",
                        "surface-container-lowest": "#ffffff",
                        "on-secondary-fixed": "#111d25",
                        "on-surface-variant": "#424656",
                        "text-secondary": "#65676B",
                        "text-primary": "#1C1E21",
                        "outline": "#727687",
                        "inverse-surface": "#2d3133",
                        "surface-container-low": "#f2f4f7",
                        "on-tertiary-fixed-variant": "#812800",
                        "on-error": "#ffffff",
                        "outline-variant": "#c2c6d8",
                        "primary-fixed-dim": "#b3c5ff",
                        "on-primary": "#ffffff",
                        "on-tertiary-container": "#fff7f5",
                        "success": "#31A24C",
                        "surface-container-high": "#e6e8eb",
                        "error": "#F02849",
                        "background": "#f7f9fc",
                        "on-secondary-fixed-variant": "#3d4852",
                        "primary-fixed": "#dbe1ff",
                        "surface-variant": "#e0e3e6",
                        "error-container": "#ffdad6",
                        "tertiary-fixed": "#ffdbcf",
                        "on-primary-fixed": "#00184a",
                        "secondary-container": "#d8e4f0",
                        "secondary-fixed-dim": "#bcc8d3",
                        "on-tertiary-fixed": "#380d00",
                        "surface-dim": "#d8dadd",
                        "on-primary-container": "#f9f7ff",
                        "tertiary": "#a13400",
                        "surface": "#f7f9fc",
                        "primary": "#0050cd"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "margin-mobile": "16px",
                        "gutter": "16px",
                        "margin-desktop": "24px",
                        "unit": "4px",
                        "max-width-feed": "680px",
                        "max-width-container": "1280px"
                    },
                    "fontFamily": {
                        "display-lg": ["Inter"],
                        "label-sm": ["Inter"],
                        "body-md": ["Inter"],
                        "label-md": ["Inter"],
                        "headline-md": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "headline-lg": ["Inter"]
                    },
                    "fontSize": {
                        "display-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                        "label-sm": ["12px", {"lineHeight": "1.2", "fontWeight": "500"}],
                        "body-md": ["14px", {"lineHeight": "1.5", "fontWeight": "400"}],
                        "label-md": ["13px", {"lineHeight": "1.2", "letterSpacing": "0.01em", "fontWeight": "600"}],
                        "headline-md": ["20px", {"lineHeight": "1.4", "fontWeight": "600"}],
                        "body-lg": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
                        "headline-lg-mobile": ["20px", {"lineHeight": "1.3", "fontWeight": "700"}],
                        "headline-lg": ["24px", {"lineHeight": "1.3", "fontWeight": "700"}]
                    }
                }
            }
        }`),
		),
		dom.Body(
			[]dom.Attr{
				dom.Class("bg-background text-on-surface"),
			},
			dom.Header(
				[]dom.Attr{
					dom.Class("sticky top-0 z-50 flex justify-between items-center px-4 w-full h-16 bg-surface-card border-b border-border-subtle shadow-sm"),
				},
				dom.Div(
					[]dom.Attr{
						dom.Class("flex items-center gap-2"),
					},
					dom.Span([]dom.Attr{dom.Class("font-display-lg text-display-lg font-bold text-primary")}, dom.Text("Connect Modern")),
					dom.Div(
						[]dom.Attr{
							dom.Class("hidden md:flex ml-4 items-center bg-surface-container-low rounded-full px-4 py-2 w-64 group focus-within:bg-surface-card focus-within:ring-2 focus-within:ring-primary-container transition-all"),
						},
						dom.Span([]dom.Attr{
							dom.Class("material-symbols-outlined text-on-surface-variant mr-2"),
							dom.CustomAttr("data-icon", "search"),
						}, dom.Text("search")),
						dom.Input([]dom.Attr{
							dom.Class("bg-transparent border-none focus:ring-0 text-body-md w-full placeholder:text-on-surface-variant"),
							dom.Placeholder("Search Connect"),
							dom.Type("text"),
						}),
					),
				),
				dom.Nav(
					[]dom.Attr{
						dom.Class("hidden lg:flex items-center gap-8 h-full"),
					},
					dom.A(
						[]dom.Attr{
							dom.Class("h-full flex items-center px-6 text-primary border-b-2 border-primary pb-1 group transition-all"),
							dom.Href("#"),
							dom.CustomAttr("title", "Home"),
						},
						dom.Span([]dom.Attr{
							dom.Class("material-symbols-outlined fill-icon"),
							dom.CustomAttr("data-icon", "home"),
							dom.Style("font-variation-settings: 'FILL' 1;"),
						}, dom.Text("home")),
					),
					dom.A(
						[]dom.Attr{
							dom.Class("h-full flex items-center px-6 text-on-surface-variant hover:bg-surface-container-low transition-colors"),
							dom.Href("#"),
							dom.CustomAttr("title", "Watch"),
						},
						dom.Span([]dom.Attr{
							dom.Class("material-symbols-outlined"),
							dom.CustomAttr("data-icon", "smart_display"),
						}, dom.Text("smart_display")),
					),
					dom.A(
						[]dom.Attr{
							dom.Class("h-full flex items-center px-6 text-on-surface-variant hover:bg-surface-container-low transition-colors"),
							dom.Href("#"),
							dom.CustomAttr("title", "Marketplace"),
						},
						dom.Span([]dom.Attr{
							dom.Class("material-symbols-outlined"),
							dom.CustomAttr("data-icon", "storefront"),
						}, dom.Text("storefront")),
					),
					dom.A(
						[]dom.Attr{
							dom.Class("h-full flex items-center px-6 text-on-surface-variant hover:bg-surface-container-low transition-colors"),
							dom.Href("#"),
							dom.CustomAttr("title", "Groups"),
						},
						dom.Span([]dom.Attr{
							dom.Class("material-symbols-outlined"),
							dom.CustomAttr("data-icon", "groups"),
						}, dom.Text("groups")),
					),
				),
				dom.Div(
					[]dom.Attr{
						dom.Class("flex items-center gap-2"),
					},
					dom.Button(
						[]dom.Attr{
							dom.Class("p-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface"),
						},
						dom.Span([]dom.Attr{
							dom.Class("material-symbols-outlined"),
							dom.CustomAttr("data-icon", "notifications"),
						}, dom.Text("notifications")),
					),
					dom.Button(
						[]dom.Attr{
							dom.Class("p-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface"),
						},
						dom.Span([]dom.Attr{
							dom.Class("material-symbols-outlined"),
							dom.CustomAttr("data-icon", "chat"),
						}, dom.Text("chat")),
					),
					dom.Button(
						[]dom.Attr{
							dom.Class("flex items-center gap-2 p-1 pl-1 pr-2 rounded-full hover:bg-surface-container-high transition-all"),
						},
						dom.Img([]dom.Attr{
							dom.Class("w-8 h-8 rounded-full object-cover"),
							dom.CustomAttr("data-alt", "User Avatar"),
							dom.Src(currentUserAvatar),
						}),
						dom.Span([]dom.Attr{
							dom.Class("material-symbols-outlined"),
							dom.CustomAttr("data-icon", "account_circle"),
						}, dom.Text("account_circle")),
					),
				),
			),
			dom.Main(
				[]dom.Attr{
					dom.Class("max-w-[1440px] mx-auto flex justify-center"),
				},
				dom.Aside(
					[]dom.Attr{
						dom.Class("fixed left-0 top-16 h-[calc(100vh-64px)] hidden xl:flex flex-col gap-1 p-4 w-[280px] overflow-y-auto bg-surface"),
					},
					dom.A(
						[]dom.Attr{
							dom.Class("flex items-center gap-3 p-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all translate-x-1"),
							dom.Href("#"),
						},
						dom.Span([]dom.Attr{
							dom.Class("material-symbols-outlined text-primary"),
							dom.CustomAttr("data-icon", "home"),
						}, dom.Text("home")),
						dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md")}, dom.Text("Home")),
					),
					dom.A(
						[]dom.Attr{
							dom.Class("flex items-center gap-3 p-3 text-on-surface font-medium hover:bg-surface-container-high rounded-lg transition-all"),
							dom.Href("#"),
						},
						dom.Span([]dom.Attr{
							dom.Class("material-symbols-outlined text-on-surface-variant"),
							dom.CustomAttr("data-icon", "group"),
						}, dom.Text("group")),
						dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md")}, dom.Text("Friends")),
					),
					dom.A(
						[]dom.Attr{
							dom.Class("flex items-center gap-3 p-3 text-on-surface font-medium hover:bg-surface-container-high rounded-lg transition-all"),
							dom.Href("#"),
						},
						dom.Span([]dom.Attr{
							dom.Class("material-symbols-outlined text-on-surface-variant"),
							dom.CustomAttr("data-icon", "groups"),
						}, dom.Text("groups")),
						dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md")}, dom.Text("Groups")),
					),
					dom.A(
						[]dom.Attr{
							dom.Class("flex items-center gap-3 p-3 text-on-surface font-medium hover:bg-surface-container-high rounded-lg transition-all"),
							dom.Href("#"),
						},
						dom.Span([]dom.Attr{
							dom.Class("material-symbols-outlined text-on-surface-variant"),
							dom.CustomAttr("data-icon", "storefront"),
						}, dom.Text("storefront")),
						dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md")}, dom.Text("Marketplace")),
					),
					dom.A(
						[]dom.Attr{
							dom.Class("flex items-center gap-3 p-3 text-on-surface font-medium hover:bg-surface-container-high rounded-lg transition-all"),
							dom.Href("#"),
						},
						dom.Span([]dom.Attr{
							dom.Class("material-symbols-outlined text-on-surface-variant"),
							dom.CustomAttr("data-icon", "smart_display"),
						}, dom.Text("smart_display")),
						dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md")}, dom.Text("Watch")),
					),
					dom.A(
						[]dom.Attr{
							dom.Class("flex items-center gap-3 p-3 text-on-surface font-medium hover:bg-surface-container-high rounded-lg transition-all"),
							dom.Href("#"),
						},
						dom.Span([]dom.Attr{
							dom.Class("material-symbols-outlined text-on-surface-variant"),
							dom.CustomAttr("data-icon", "history"),
						}, dom.Text("history")),
						dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md")}, dom.Text("Memories")),
					),
					dom.Div([]dom.Attr{dom.Class("my-4 border-t border-surface-container-high")}),
					dom.H3([]dom.Attr{dom.Class("px-3 py-2 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider")}, dom.Text("Your Shortcuts")),
					dom.Button(
						[]dom.Attr{
							dom.Class("flex items-center gap-3 p-3 text-on-surface font-medium hover:bg-surface-container-high rounded-lg transition-all w-full text-left"),
						},
						dom.Div(
							[]dom.Attr{
								dom.Class("w-8 h-8 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center"),
							},
							dom.Span([]dom.Attr{
								dom.Class("material-symbols-outlined"),
								dom.CustomAttr("data-icon", "design_services"),
							}, dom.Text("design_services")),
						),
						dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md")}, dom.Text("Design Community")),
					),
					dom.Button(
						[]dom.Attr{
							dom.Class("mt-4 w-full py-3 bg-primary-container text-on-primary rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all"),
						},
						dom.Text("Create New Group"),
					),
				),
				dom.Section(
					[]dom.Attr{
						dom.Class("w-full max-w-max-width-feed px-4 py-6 flex flex-col gap-6"),
					},
					dom.Form(
						[]dom.Attr{
							dom.Method("POST"),
							dom.Action("/web/beranda"),
							dom.Enctype("multipart/form-data"),
							dom.Class("bg-surface-card rounded-xl p-4 shadow-sm border border-border-subtle flex flex-col gap-4"),
						},
						dom.Div(
							[]dom.Attr{
								dom.Class("flex gap-3"),
							},
							dom.Img([]dom.Attr{
								dom.Class("w-10 h-10 rounded-full object-cover"),
								dom.Src(currentUserAvatar),
							}),
							dom.Input([]dom.Attr{
								dom.Type("text"),
								dom.Name("content"),
								dom.Required(),
								dom.Class("flex-1 bg-surface-container-low hover:bg-surface-container-high rounded-full px-5 py-2 text-on-surface font-body-md transition-colors border-none focus:ring-0"),
								dom.Placeholder("What's on your mind, " + data.CurrentUser.Name + "?"),
							}),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("border-t border-surface-container py-2 flex justify-between items-center"),
							},
							dom.Input([]dom.Attr{
								dom.Type("file"),
								dom.Name("media"),
								dom.Accept("image/*,video/*"),
								dom.Class("text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-on-primary hover:file:bg-primary-container/80 transition-colors cursor-pointer"),
							}),
							dom.Button(
								[]dom.Attr{
									dom.Type("submit"),
									dom.Class("bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-90 active:scale-95 transition-all"),
								},
								dom.Text("Post"),
							),
						),
					),
					// Loop over posts
					dom.Map(data.Posts, func(post models.Post) dom.Node {
						userAvatar := "https://lh3.googleusercontent.com/aida-public/AB6AXuBvTEfn_OD2OcuaL7fDG5TktYj4ddGZXXNKyqq-SO5SpJXhic851LZnP7-sLwq9NXRhIghPfui5jKjB5n8yb8D0QLqEjKXIjw3PQp2XY5hntjKbwjVx2ghLlQHRVT41r_26NBU5vk6ZOTYxVKBDepkG6WVOOInnig3EwSOgtrZ78zje1krJydOgP4VwT4Zj_tjrcUHpL0jt0O0EU4KF_1Su_5hdWkE2u7Nj-lXa3b5G3BQhEbkIdW-ILbmuQQzEOJtVgI2ZwFOit6k"
						if post.User.AvatarURL != nil && *post.User.AvatarURL != "" {
							userAvatar = *post.User.AvatarURL
						}
						postContent := ""
						if post.Content != nil {
							postContent = *post.Content
						}

						return dom.Div(
							[]dom.Attr{
								dom.Class("bg-surface-card rounded-xl shadow-sm border border-border-subtle overflow-hidden"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("p-4 flex items-start justify-between"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex gap-3"),
									},
									dom.Img([]dom.Attr{
										dom.Class("w-10 h-10 rounded-full object-cover"),
										dom.Src(userAvatar),
									}),
									dom.Div(
										nil,
										dom.H4([]dom.Attr{dom.Class("font-headline-md text-body-lg font-semibold text-on-surface")}, dom.Text(post.User.Name)),
										dom.Div(
											[]dom.Attr{dom.Class("flex items-center gap-1 text-on-surface-variant font-label-sm")},
											dom.Span(nil, dom.Text(post.CreatedAt.Format("02 Jan 2006 15:04"))),
											dom.Span(nil, dom.Text("•")),
											dom.Span([]dom.Attr{
												dom.Class("material-symbols-outlined text-[14px]"),
												dom.CustomAttr("data-icon", "public"),
											}, dom.Text("public")),
										),
									),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("px-4 pb-4 font-body-md text-on-surface"),
								},
								dom.Text(postContent),
							),
							// Media block
							dom.If(post.PostType == models.PostTypeImage, dom.Group(
								dom.Map(post.Media, func(m models.PostMedia) dom.Node {
									return dom.Div(
										[]dom.Attr{
											dom.Class("relative group cursor-pointer"),
										},
										dom.Img([]dom.Attr{
											dom.Class("w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-[1.02]"),
											dom.Src(m.MediaURL),
										}),
									)
								}),
							)),
							dom.If(post.PostType == models.PostTypeVideo, dom.Group(
								dom.Map(post.Media, func(m models.PostMedia) dom.Node {
									return dom.Div(
										[]dom.Attr{
											dom.Class("relative group"),
										},
										dom.Video(
											[]dom.Attr{
												dom.Class("w-full aspect-[16/9] object-cover"),
												dom.Controls(),
												dom.Src(m.MediaURL),
											},
											nil,
										),
									)
								}),
							)),
							dom.If(post.PostType == models.PostTypeLink && post.Link != nil, func() dom.Node {
								link := post.Link
								linkImg := ""
								if link.ImageURL != nil {
									linkImg = *link.ImageURL
								}
								linkTitle := ""
								if link.Title != nil {
									linkTitle = *link.Title
								}
								linkDesc := ""
								if link.Description != nil {
									linkDesc = *link.Description
								}
								linkSite := ""
								if link.SiteName != nil {
									linkSite = *link.SiteName
								}

								return dom.A(
									[]dom.Attr{
										dom.Class("block border-y border-border-subtle bg-surface-container-low group"),
										dom.Href(link.URL),
									},
									dom.If(linkImg != "", dom.Img([]dom.Attr{
										dom.Class("w-full h-48 object-cover"),
										dom.Src(linkImg),
									})),
									dom.Div(
										[]dom.Attr{
											dom.Class("p-3 flex flex-col gap-1"),
										},
										dom.Span([]dom.Attr{dom.Class("text-on-surface-variant text-label-sm uppercase tracking-wider")}, dom.Text(linkSite)),
										dom.H5([]dom.Attr{dom.Class("font-headline-md text-body-lg font-bold text-on-surface group-hover:underline")}, dom.Text(linkTitle)),
										dom.P([]dom.Attr{dom.Class("text-on-surface-variant text-body-md line-clamp-2")}, dom.Text(linkDesc)),
									),
								)
							}()),
							dom.Div(
								[]dom.Attr{
									dom.Class("p-3"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex justify-between"),
									},
									dom.Button(
										[]dom.Attr{
											dom.Class("flex items-center justify-center gap-2 flex-1 py-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant font-label-md"),
										},
										dom.Span([]dom.Attr{
											dom.Class("material-symbols-outlined"),
											dom.CustomAttr("data-icon", "thumb_up"),
										}, dom.Text("thumb_up")),
										dom.Text("Like"),
									),
									dom.Button(
										[]dom.Attr{
											dom.Class("flex items-center justify-center gap-2 flex-1 py-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant font-label-md"),
										},
										dom.Span([]dom.Attr{
											dom.Class("material-symbols-outlined"),
											dom.CustomAttr("data-icon", "mode_comment"),
										}, dom.Text("mode_comment")),
										dom.Text("Comment"),
									),
								),
							),
						)
					}),
				),
				dom.Aside(
					[]dom.Attr{
						dom.Class("fixed right-0 top-16 h-[calc(100vh-64px)] hidden xl:flex flex-col gap-1 p-4 w-[280px] overflow-y-auto bg-surface"),
					},
					dom.Div(
						[]dom.Attr{
							dom.Class("flex items-center justify-between mb-4"),
						},
						dom.H3([]dom.Attr{dom.Class("font-headline-md text-on-surface-variant")}, dom.Text("Contacts")),
						dom.Div(
							[]dom.Attr{
								dom.Class("flex gap-2"),
							},
							dom.Button(
								[]dom.Attr{
									dom.Class("p-1.5 hover:bg-surface-container-high rounded-full text-on-surface-variant"),
								},
								dom.Span([]dom.Attr{
									dom.Class("material-symbols-outlined text-[20px]"),
									dom.CustomAttr("data-icon", "videocam"),
								}, dom.Text("videocam")),
							),
							dom.Button(
								[]dom.Attr{
									dom.Class("p-1.5 hover:bg-surface-container-high rounded-full text-on-surface-variant"),
								},
								dom.Span([]dom.Attr{
									dom.Class("material-symbols-outlined text-[20px]"),
									dom.CustomAttr("data-icon", "search"),
								}, dom.Text("search")),
							),
							dom.Button(
								[]dom.Attr{
									dom.Class("p-1.5 hover:bg-surface-container-high rounded-full text-on-surface-variant"),
								},
								dom.Span([]dom.Attr{
									dom.Class("material-symbols-outlined text-[20px]"),
									dom.CustomAttr("data-icon", "more_horiz"),
								}, dom.Text("more_horiz")),
							),
						),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("flex flex-col gap-1"),
						},
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 p-2 hover:bg-surface-container-high rounded-lg transition-all group"),
								dom.Href("#"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("relative"),
								},
								dom.Img([]dom.Attr{
									dom.Class("w-9 h-9 rounded-full object-cover"),
									dom.CustomAttr("data-alt", "Portrait of Jane Smith"),
									dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuAkwyOqjUvwqzWn0sT2H4ossl17QmhnE9xpFmhqnWysYC1FfY7e3tRGzjVlSpqFzhaCLjQTGLivSr-d4r74K4wQ8Tbs0ZpLlOMabl0yORWx2BhE09B8tebAlBtYJrHxP_jclZ81aTjMXWeiBRmSR0oqOqDvJBKmOOm0_toc-TWqOwH67GK192l5dCJ_zonkPpQLCKSgtGyjAE6xEpeVmCiXGMgxHBhSsd4e3BFWiL8DK7-9Rz9-QiLe0t78eki8kG-ndDzRkiFyKJw"),
								}),
								dom.Div([]dom.Attr{dom.Class("absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-surface rounded-full")}),
							),
							dom.Span([]dom.Attr{dom.Class("font-body-md text-on-surface font-medium")}, dom.Text("Jane Smith")),
						),
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 p-2 hover:bg-surface-container-high rounded-lg transition-all group"),
								dom.Href("#"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("relative"),
								},
								dom.Img([]dom.Attr{
									dom.Class("w-9 h-9 rounded-full object-cover"),
									dom.CustomAttr("data-alt", "Portrait of Bob Wilson"),
									dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuD5iCC2v62van3ARB6OHVylgEbARCjoz57E66vq60Qcgkmo5J8jkokdy4ZNKWwa-tEDnZa8WbI3b9sDB6TvMS6krG15z7ocam8E8iaovLropPvF0WIeTLvg7cEg9vzkwZE3d7ODzPrD2eh8ncUgWEHprCPFtyNxnMBnZrbY8cEDXvb_YT9rB1vnCEP-Dpf-lfX-cXN3EaO62m8sKLWqj-GF2KqmcRN1xK-iwsvTlRhTSn3ts5MN4vOYpVGX6la56spQCxSBuys362c"),
								}),
								dom.Div([]dom.Attr{dom.Class("absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-surface rounded-full")}),
							),
							dom.Span([]dom.Attr{dom.Class("font-body-md text-on-surface font-medium")}, dom.Text("Bob Wilson")),
						),
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 p-2 hover:bg-surface-container-high rounded-lg transition-all group"),
								dom.Href("#"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("relative"),
								},
								dom.Img([]dom.Attr{
									dom.Class("w-9 h-9 rounded-full object-cover"),
									dom.CustomAttr("data-alt", "Portrait of Sarah Miller"),
									dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuDLqxGI4Ss9-jfBEtN00njaDbWTJjQuVgK-SoYiHPFQAwqwEvCOWFyHlDVops6yfXNKsUhPc_InDElPCz0gVrrTWR9ngwN72q-SoP7OoHcBjmVO2MQJ7LSMbvnIsi857V-Zv50iRRnQwuNWunzhBpshII6WwxKO7VE5V4uPJu5APRU6dZ9Jx_JNBRgv5VTP6pRP1Wf3wMSQwHslIurqBwb17X3iOpTRy5CZmy6CcSw1k1OerCb2DryqyNkf40BH97piVrZbCbKz96E"),
								}),
								dom.Div([]dom.Attr{dom.Class("absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-surface rounded-full")}),
							),
							dom.Span([]dom.Attr{dom.Class("font-body-md text-on-surface font-medium")}, dom.Text("Sarah Miller")),
						),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("mt-8 border-t border-surface-container-high pt-4"),
						},
						dom.H3([]dom.Attr{dom.Class("px-2 mb-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider")}, dom.Text("Group Conversations")),
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 p-2 hover:bg-surface-container-high rounded-lg transition-all group"),
								dom.Href("#"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("w-9 h-9 rounded-lg bg-secondary-container text-primary flex items-center justify-center"),
								},
								dom.Span([]dom.Attr{
									dom.Class("material-symbols-outlined"),
									dom.CustomAttr("data-icon", "work"),
								}, dom.Text("work")),
							),
							dom.Span([]dom.Attr{dom.Class("font-body-md text-on-surface font-medium")}, dom.Text("Product Design Sync")),
						),
						dom.A(
							[]dom.Attr{
								dom.Class("flex items-center gap-3 p-2 hover:bg-surface-container-high rounded-lg transition-all group"),
								dom.Href("#"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("w-9 h-9 rounded-lg bg-tertiary-container text-white flex items-center justify-center"),
								},
								dom.Span([]dom.Attr{
									dom.Class("material-symbols-outlined"),
									dom.CustomAttr("data-icon", "sports_basketball"),
								}, dom.Text("sports_basketball")),
							),
							dom.Span([]dom.Attr{dom.Class("font-body-md text-on-surface font-medium")}, dom.Text("Weekend Ballers")),
						),
					),
				),
			),
			dom.Button(
				[]dom.Attr{
					dom.Class("fixed bottom-6 right-6 w-14 h-14 bg-primary-container text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group xl:hidden"),
				},
				dom.Span([]dom.Attr{
					dom.Class("material-symbols-outlined"),
					dom.CustomAttr("data-icon", "edit"),
				}, dom.Text("edit")),
				dom.Span([]dom.Attr{
					dom.Class("absolute right-16 bg-on-surface text-white px-3 py-1 rounded-lg text-label-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"),
				}, dom.Text("Create Post")),
			),
			dom.ScriptEl(nil, `// Micro-interactions and simple state management
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', function(e) {
                if (this.classList.contains('active:scale-95')) return;
                this.classList.add('active:scale-90');
                setTimeout(() => this.classList.remove('active:scale-90'), 150);
            });
        });

        // Search bar focus effects
        const searchInput = document.querySelector('input[type="text"]');
        const searchContainer = searchInput?.parentElement;
        if (searchInput && searchContainer) {
            searchInput.addEventListener('focus', () => {
                searchContainer.classList.add('bg-surface-card', 'ring-2', 'ring-primary-container', 'w-80');
                searchContainer.classList.remove('w-64');
            });
            searchInput.addEventListener('blur', () => {
                searchContainer.classList.remove('bg-surface-card', 'ring-2', 'ring-primary-container', 'w-80');
                searchContainer.classList.add('w-64');
            });
        }`),
		),
	)
	return page.Render(w)
}
