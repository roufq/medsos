package backend

import (
	"goravel/app/models"
	"goravel/resources/views/backend/dom"
	"io"
)

type ProfileData struct {
	User  models.User
	Posts []models.Post
}

func RenderProfile(w io.Writer, data ProfileData) error {
	coverPhoto := "https://lh3.googleusercontent.com/aida-public/AB6AXuAsup8TqfhDhvdcTBjVjI8At-Tjv9UadQdwwNc72ReXbJJW8PK4wWNsEU0oF6YaUAyveCZ5g6CBnXQBzydR1tXkQ5kYMhj6c-xvYkzRIaqD_tei_N5FxRCx28_Oh5M0ljo8lReOyIq4coj7MG0QONRDD7Pk0JmVWNBzU10GLYbLRhg8fyZGDZ3ggZx9P3Qg7HgwdeFCy_t4a5JQ1Dqte3hGkQtCb1QZUq_4no3azzhRY4Sq4J-2c_JuSaLeQg-WvqA1zscBYDsyvuM"
	if data.User.CoverURL != nil && *data.User.CoverURL != "" {
		coverPhoto = *data.User.CoverURL
	}

	avatarPhoto := "https://lh3.googleusercontent.com/aida-public/AB6AXuCbN7QywhDFwpFuEh9ofgWQn0ehlLI5IpJfOXOa8QV4pZ9ivCncV7_sX-ncBEIFuCyeO4KlEeEDGOSEa_5Jtiz-xsKOXYK9rkNx1jbm5Acw34YFYwb65w0ZKGGB_G9_uCstHkzE6SNU91mRIoiFlkkxJA0foztRsLcMHg-3w5Ozp9_sCRE8XnjAg94hc00RpVDHC_1PdotH4TyE4IDfU1l3ddOyPb06YZlyIIIVzxndLUnn-Gjo09D_2dYCNF5RbGdOM6K3kC1Kn7I"
	if data.User.AvatarURL != nil && *data.User.AvatarURL != "" {
		avatarPhoto = *data.User.AvatarURL
	}

	bioText := "Design Lead at Connect. Coffee enthusiast. Exploring the intersection of human psychology and digital interfaces."
	if data.User.Bio != nil && *data.User.Bio != "" {
		bioText = *data.User.Bio
	}

	page := dom.Html(
		[]dom.Attr{
			dom.Class("light"),
			dom.Lang("en"),
		},
		dom.Head(
			nil,
			dom.Meta([]dom.Attr{dom.Charset("utf-8")}),
			dom.Meta([]dom.Attr{dom.ContentAttr("width=device-width, initial-scale=1.0"), dom.Name("viewport")}),
			dom.TitleEl(data.User.Name+" | Connect Modern"),
			dom.ScriptEl([]dom.Attr{dom.Src("https://cdn.tailwindcss.com?plugins=forms,container-queries")}, ""),
			dom.Link([]dom.Attr{dom.Href("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"), dom.Rel("stylesheet")}),
			dom.Link([]dom.Attr{dom.Href("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"), dom.Rel("stylesheet")}),
			dom.Link([]dom.Attr{dom.Href("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"), dom.Rel("stylesheet")}),
			dom.StyleEl(nil, `body {
            font-family: 'Inter', sans-serif;
            background-color: #f7f9fc;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .nav-active {
            border-bottom: 3px solid #0050cd;
            color: #0050cd;
        }
        .custom-shadow {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
					dom.Div(
						[]dom.Attr{
							dom.Class("font-display-lg text-display-lg font-bold text-primary"),
						},
						dom.Text("Connect Modern"),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("hidden md:flex ml-4 bg-surface-container-low rounded-full px-4 py-2 items-center gap-2"),
						},
						dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-on-surface-variant")}, dom.Text("search")),
						dom.Input([]dom.Attr{
							dom.Class("bg-transparent border-none focus:ring-0 text-body-md font-body-md w-64"),
							dom.Placeholder("Search Connect"),
							dom.Type("text"),
						}),
					),
				),
				dom.Div(
					[]dom.Attr{
						dom.Class("flex items-center gap-2"),
					},
					dom.Button(
						[]dom.Attr{
							dom.Class("p-2 rounded-full hover:bg-surface-container-low transition-colors text-primary"),
						},
						dom.Span([]dom.Attr{dom.Class("material-symbols-outlined")}, dom.Text("notifications")),
					),
					dom.Button(
						[]dom.Attr{
							dom.Class("p-2 rounded-full hover:bg-surface-container-low transition-colors text-primary"),
						},
						dom.Span([]dom.Attr{dom.Class("material-symbols-outlined")}, dom.Text("chat")),
					),
					dom.Button(
						[]dom.Attr{
							dom.Class("p-1 rounded-full border-2 border-primary"),
						},
						dom.Img([]dom.Attr{
							dom.Class("w-8 h-8 rounded-full object-cover"),
							dom.CustomAttr("data-alt", "User Avatar"),
							dom.Src(avatarPhoto),
						}),
					),
				),
			),
			dom.Main(
				[]dom.Attr{
					dom.Class("max-w-[1250px] mx-auto pb-10"),
				},
				dom.Section(
					[]dom.Attr{
						dom.Class("bg-surface-card shadow-sm rounded-b-xl overflow-hidden mb-4"),
					},
					dom.Div(
						[]dom.Attr{
							dom.Class("relative h-[350px] md:h-[400px] w-full"),
						},
						dom.Img([]dom.Attr{
							dom.Class("w-full h-full object-cover"),
							dom.Src(coverPhoto),
						}),
						dom.Div(
							[]dom.Attr{
								dom.Class("absolute bottom-4 right-4"),
							},
							dom.Button(
								[]dom.Attr{
									dom.Class("flex items-center gap-2 bg-white px-4 py-2 rounded-lg font-label-md text-label-md shadow-sm hover:bg-surface-container-low transition-all"),
								},
								dom.Span([]dom.Attr{dom.Class("material-symbols-outlined")}, dom.Text("photo_camera")),
								dom.Text("Edit cover photo"),
							),
						),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("px-8 pb-4 relative"),
						},
						dom.Div(
							[]dom.Attr{
								dom.Class("flex flex-col md:flex-row md:items-end gap-4 -mt-8 md:-mt-12"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("relative"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("p-1 bg-surface-card rounded-full inline-block"),
									},
									dom.Img([]dom.Attr{
										dom.Class("w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-surface-card"),
										dom.Src(avatarPhoto),
									}),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("absolute bottom-2 right-2 p-2 bg-surface-container-high rounded-full border border-border-subtle hover:bg-surface-container-highest transition-colors"),
									},
									dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-body-md")}, dom.Text("photo_camera")),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("mb-4 flex-grow"),
								},
								dom.H1([]dom.Attr{dom.Class("font-headline-lg text-headline-lg text-text-primary")}, dom.Text(data.User.Name)),
								dom.P([]dom.Attr{dom.Class("text-text-secondary font-label-md text-label-md mt-1")}, dom.Text("Active User")),
								dom.Div(
									[]dom.Attr{
										dom.Class("flex mt-2 -space-x-2"),
									},
									dom.Img([]dom.Attr{
										dom.Class("w-8 h-8 rounded-full border-2 border-surface-card"),
										dom.CustomAttr("data-alt", "Friend 1"),
										dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuDisdMRrWmhNhKEM7QrxVR7egaXcRAKtje143V-zm8vp0INPvPxITvqDnBFoNYJC3ZCeDv3uozfOeHMn93_fScSfrdgB5KtupSNd2J4-kEPP9g32Zq_ZIsYKayOiL4s58z-0l4rZradzVvBTzXqleMmHb-OGyKHNV8xVLq7WF1k5TB7oaxMq18nJbXzIeH3YFp1I-DnKlSqtLGNJ1SyVQMRdpS-10Ac5HsI-SveohRwAb_dGNFWa6P7fTCVpuxgw2xuwe6zCTn3bYw"),
									}),
									dom.Img([]dom.Attr{
										dom.Class("w-8 h-8 rounded-full border-2 border-surface-card"),
										dom.CustomAttr("data-alt", "Friend 2"),
										dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuCXLQjjqSildlpoTjkubWSN4iuOVsCvqteT8WNI40xcuPebkVzRZsWuJ0ekgBGLmvupJ-QMZaaDj6rYbc-OemtitDaU6gQ0UbTe2kc1nkFBmvHSggMFfwd2gkR3x7vxRbL-ahHRH9_ir9XB03Wg9ZsyHEI9-k8dA_PO6vVnc0GcQhCInT42ZX-fCKlc7-yDDuVQOyG0dyUTB7QOf7yDH-v9RlUN-HAAjwSw19BrpjLa1Afe3TzSS1nlcfafa8ZmICFQM72MZ9yukZI"),
									}),
									dom.Img([]dom.Attr{
										dom.Class("w-8 h-8 rounded-full border-2 border-surface-card"),
										dom.CustomAttr("data-alt", "Friend 3"),
										dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuC3Qq8m8S35IT61y3K_6ZDpiUFD64NnE-XwgG9PupJ1GIqvfbSnceWLQWwJzeRyWIzEj2xRCD5I_42yFg4KapUHrj0NkCKZCUdFAFAqI1NYwEI_qRGdKdrCG1pYHoBf02RhHmJjqc1mjDfwY4mwC58ALpDpl32amOnhB19yV4t7mNeANA-lTbhIK8SRFZ6pfWew2JtkObVLouer-LwAXyLv1bHgUoz_Ua3uq7QTEYZBclW9SfuYUspLR4bgJbVvaL1peWM8gBqq6AI"),
									}),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("flex gap-2 mb-4"),
								},
								dom.Button(
									[]dom.Attr{
										dom.Class("bg-primary-container text-on-primary px-4 py-2 rounded-lg flex items-center gap-2 font-label-md text-label-md transition-transform active:scale-95"),
									},
									dom.Span([]dom.Attr{
										dom.Class("material-symbols-outlined"),
										dom.Style("font-variation-settings: 'FILL' 1;"),
									}, dom.Text("add")),
									dom.Text("Add to story"),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("bg-surface-container-high text-on-surface px-4 py-2 rounded-lg flex items-center gap-2 font-label-md text-label-md hover:bg-surface-container-highest transition-transform active:scale-95"),
									},
									dom.Span([]dom.Attr{dom.Class("material-symbols-outlined")}, dom.Text("edit")),
									dom.Text("Edit profile"),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("bg-surface-container-high text-on-surface px-3 py-2 rounded-lg hover:bg-surface-container-highest transition-colors"),
									},
									dom.Span([]dom.Attr{dom.Class("material-symbols-outlined")}, dom.Text("expand_more")),
								),
							),
						),
						dom.Nav(
							[]dom.Attr{
								dom.Class("mt-6 border-t border-border-subtle flex items-center gap-1 overflow-x-auto"),
							},
							dom.A([]dom.Attr{dom.Class("px-4 py-4 font-label-md text-label-md nav-active transition-colors"), dom.Href("#")}, dom.Text("Posts")),
							dom.A([]dom.Attr{dom.Class("px-4 py-4 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"), dom.Href("#")}, dom.Text("About")),
							dom.A([]dom.Attr{dom.Class("px-4 py-4 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"), dom.Href("#")}, dom.Text("Friends")),
							dom.A([]dom.Attr{dom.Class("px-4 py-4 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"), dom.Href("#")}, dom.Text("Photos")),
							dom.A([]dom.Attr{dom.Class("px-4 py-4 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"), dom.Href("#")}, dom.Text("Videos")),
							dom.A([]dom.Attr{dom.Class("px-4 py-4 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"), dom.Href("#")}, dom.Text("Check-ins")),
							dom.A([]dom.Attr{dom.Class("px-4 py-4 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"), dom.Href("#")}, dom.Text("More")),
						),
					),
				),
				dom.Div(
					[]dom.Attr{
						dom.Class("grid grid-cols-1 lg:grid-cols-12 gap-gutter px-4 md:px-0"),
					},
					dom.Aside(
						[]dom.Attr{
							dom.Class("lg:col-span-5 flex flex-col gap-gutter"),
						},
						dom.Div(
							[]dom.Attr{
								dom.Class("bg-surface-card p-4 rounded-xl custom-shadow"),
							},
							dom.H2([]dom.Attr{dom.Class("font-headline-md text-headline-md mb-4")}, dom.Text("Intro")),
							dom.Div(
								[]dom.Attr{
									dom.Class("text-center mb-4"),
								},
								dom.P([]dom.Attr{dom.Class("font-body-md text-body-md text-text-primary")}, dom.Text(bioText)),
							),
							dom.Button(
								[]dom.Attr{
									dom.Class("w-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md py-2 rounded-lg hover:bg-surface-container-highest transition-colors mb-4"),
								},
								dom.Text("Edit bio"),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("space-y-4"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center gap-3"),
									},
									dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-on-surface-variant")}, dom.Text("work")),
									dom.Span(nil, dom.Text("Design Lead at "), dom.Span([]dom.Attr{dom.Class("font-bold")}, dom.Text("Connect Modern"))),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center gap-3"),
									},
									dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-on-surface-variant")}, dom.Text("school")),
									dom.Span(nil, dom.Text("Studied Interaction Design at "), dom.Span([]dom.Attr{dom.Class("font-bold")}, dom.Text("Stanford University"))),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center gap-3"),
									},
									dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-on-surface-variant")}, dom.Text("home")),
									dom.Span(nil, dom.Text("Lives in "), dom.Span([]dom.Attr{dom.Class("font-bold")}, dom.Text("San Francisco, California"))),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center gap-3"),
									},
									dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-on-surface-variant")}, dom.Text("location_on")),
									dom.Span(nil, dom.Text("From "), dom.Span([]dom.Attr{dom.Class("font-bold")}, dom.Text("Seattle, Washington"))),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center gap-3"),
									},
									dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-on-surface-variant")}, dom.Text("rss_feed")),
									dom.Span(nil, dom.Text("Followed by "), dom.Span([]dom.Attr{dom.Class("font-bold")}, dom.Text("842 people"))),
								),
							),
							dom.Button(
								[]dom.Attr{
									dom.Class("w-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md py-2 rounded-lg mt-4 hover:bg-surface-container-highest transition-colors"),
								},
								dom.Text("Edit details"),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("grid grid-cols-3 gap-2 mt-4"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("aspect-square bg-surface-container-low rounded-lg overflow-hidden"),
									},
									dom.Img([]dom.Attr{
										dom.Class("w-full h-full object-cover"),
										dom.CustomAttr("data-alt", "Featured 1"),
										dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuB2qE3WV-xEMFVs_S_p2TsW2BMH0SefTRCqqXHcHIFaUYYLBg3JbGBjBv7A7yzmhKJIlYlecmnro8dNP8hm-Zthm_Clpp9ZVVDl2MyopMJc1FIdtMEOktH2k19BLqXOX9qQT3ELzVR1fgSNxRqDx_f8JkRD2ROrGbMYIF36Fp3Bdm7lGCd_ufcLZ-sDosCRYGV-zk0daOIW7pnuieBzWo6TeDagQ9vO99GNWvjmIPHdqEo-pJboTWbjMEHKL_2kHfXgwosLlQI69hc"),
									}),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("aspect-square bg-surface-container-low rounded-lg overflow-hidden"),
									},
									dom.Img([]dom.Attr{
										dom.Class("w-full h-full object-cover"),
										dom.CustomAttr("data-alt", "Featured 2"),
										dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuBnfzazPE2epbRMs0qDHqWGWh9DFHyx9bXmb7cZ-rc86CuNRfW5M2renngRlri-NGCZGgWmU9y9-fvQPa1ey7_HStoTyOaDDmKPMYInWwAVpNxPE7T5CFzOGBQEQJYgP5HQ3FZa0MBN1r4HbzXBJmONmzfIQExZecy-7PibOxgRLIsHTSUsxVDwEkmUm2w7vWQtQtpDf68-Bw4WrkKo1wOdy2xQNeuJ0gaqOdYtx56bSNtIzIghuMR90l1sMvTcokMCDZn09JPFzbw"),
									}),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("aspect-square bg-surface-container-low rounded-lg overflow-hidden"),
									},
									dom.Img([]dom.Attr{
										dom.Class("w-full h-full object-cover"),
										dom.CustomAttr("data-alt", "Featured 3"),
										dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuClMnCFYSwdTEjEwE-BFnc8G9aIqzU1GyY3gIhEwoeyqDjgLl8sGEmR4o9Iny2AZwHxnpBgvVa_i9aeY32wJ0Z9F1MFxNAgcxV37AWJut44beqtmS5ImFUb1HGcstfIiEiuBmevmZAo89B_iiEbcUQ147XRNcO8m9sjWsqXQA8Sz3He30Vp--RswWL_Exrx6SGBVT3WzyTnYJlGCJb8y0PGEbh2bqW4dHUYB8MsIlT0aFreRUjjNkVPsb9X5RbJzHBcvcWKoB1fS6I"),
									}),
								),
							),
							dom.Button(
								[]dom.Attr{
									dom.Class("w-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md py-2 rounded-lg mt-4 hover:bg-surface-container-highest transition-colors"),
								},
								dom.Text("Edit featured"),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("bg-surface-card p-4 rounded-xl custom-shadow"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("flex justify-between items-center mb-4"),
								},
								dom.H2([]dom.Attr{dom.Class("font-headline-md text-headline-md")}, dom.Text("Photos")),
								dom.A([]dom.Attr{dom.Class("text-primary font-label-md text-label-md hover:underline"), dom.Href("#")}, dom.Text("See all photos")),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("grid grid-cols-3 gap-1 rounded-xl overflow-hidden"),
								},
								dom.Img([]dom.Attr{dom.Class("w-full h-40 object-cover"), dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuAESVdTYNy8wZPkuE-i75AyD_eHb1WhuADVlphLYbwj_JFrUSkqUnFM8-0g_SHazT2jyDtf8K0yW3B6RFEg7vV-V8hWVNbeQ4t3nOzG9zfvF_9-uF2L1Wivlv1hl2H0m_6Af3sTkkhUGxBE-QBEFGzXczHds5_qm9sm-l94pJj-wYv5jeHf9s-Aw9Wisxz6g1mcXfcLC18XUmWzThD4d0EbbFlFnZGIn4LsWVgJ0yNxVso_4I2efcWmY9RwK9JdmDjTIxI9Egzyjvs")}),
								dom.Img([]dom.Attr{dom.Class("w-full h-40 object-cover"), dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuBcI262IwnK2k-qquzmByoSJ-ylGd-I29OGwa-86IHnq6WXlN3wpcZGhwB27AwwAcbHvWrHdmZoIlvCqGW62TlPan50RW_vdoHM80VxCeaB259En2oj97-G8934xfardDgDmiSUJUMMKeSfVyR8_-I7IBic-Bp-qiN3HE8Mvva9Q3lNkKIg1K7H6vA8JvWIcMaFzmre8RFhwmQELHy7jcmBLUlFPCEGJmsRnHn1AnIHkKfIdbBbo4g4-_A5_Wfwh8TpAGUhWd3UQ1g")}),
								dom.Img([]dom.Attr{dom.Class("w-full h-40 object-cover"), dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuD7QkEnInnQlk1SIA25u2acP7NP23gKZkHPJIiaBfrq8BcswtqvS3G8OY8ZKWoVjvXAQkBrez5lTBx4TP1DAcCgvylB8ju1mDOeBnomWCdN-zgmIFJpTOGRFKh5GlKJcmxLj7yFeIyzI0-YebZy_dUbQM5OmYH177YY4DF1QgrgLela5FrU0CznasrVrY3zzPQClWiT0To4zCcIBR70RBUUW1MdTNxi8BIKi1BrpgNgw7UE1TlKKf8OF6hsZuMhJPe13i4Xncrg-1o")}),
								dom.Img([]dom.Attr{dom.Class("w-full h-40 object-cover"), dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuBtuGuXOkECnSOs3R7cd7UFNcWXf4l0H6AKx_BHxgwTzBx6K9xSQt3IkhWOSWNVePlwSjVy1OzQLRZt7iKl0y3AXScGLm3bYNsKkwA3iOzWIRvF3pRlwpzS8Z_GkCvsLugZxTIcn7PXhaNiHYK_5ZNSz0cOS02IkXyR59x45yXFLHvVrF01ed62b7xkcqXGgZRm5Rmtaj-Nmy1mdwG5wQW5RidJUZ-hRIJAJqdXDAumUras4ZcFv-Ya_RUHS4u4LPd8QKLS6px3j4s")}),
								dom.Img([]dom.Attr{dom.Class("w-full h-40 object-cover"), dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuDOww2mfZmt0El29acqHU6t5ePoO3CNZA-uiNqdEpB1N39uAeCEx21qvVJHw36ueNDAAXLCXcMuaXYRDnbXQBhpR1Etv-V0BsBSPfgtFUL-1YPQHHlLIG6lyInpiRmFWqoXV5GtZOtx431q4WoIH_0Y7I6trqOWcRCsSHty4kS-kkCNvs2GkwFlPSMWNksHFW0CammnzZ73HgdfIzgrUAwSjo8wgbOPFiPf4DcDz7OCKagjzLkgREVGObS_Am6-toZDy_Di_MFhoPA")}),
								dom.Img([]dom.Attr{dom.Class("w-full h-40 object-cover"), dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuCOafrTlTtz11gMuve_BPHZuw3u3deMtzMzpuuPy6pbDKCLA96-s1yvB0lpN0m9C7OGKsEi9WPpdsCRHvs4uMQk6wktM2BN0NGfxFcYKVSmgZOpeUXKkBX6qtA4Q7kkho-tqmQSj4IKIMbHEAjjQ3ONfafjDrcPldNJYJ1j6Yvx9UO7p6YisdYUc_GLu55jZCjbejB3kdttJWvvONLHqD9nDqKrTDbFKWvZCidJQPaaJlhGK6Pw3dQcXpMzywcEv00eNwxRN8b5j6Q")}),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("bg-surface-card p-4 rounded-xl custom-shadow"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("flex justify-between items-center mb-1"),
								},
								dom.H2([]dom.Attr{dom.Class("font-headline-md text-headline-md")}, dom.Text("Friends")),
								dom.A([]dom.Attr{dom.Class("text-primary font-label-md text-label-md hover:underline"), dom.Href("#")}, dom.Text("See all friends")),
							),
							dom.P([]dom.Attr{dom.Class("text-text-secondary font-label-md text-label-md mb-4")}, dom.Text("1,245 friends")),
							dom.Div(
								[]dom.Attr{
									dom.Class("grid grid-cols-3 gap-x-3 gap-y-4"),
								},
								dom.Div([]dom.Attr{dom.Class("space-y-1")}, dom.Img([]dom.Attr{dom.Class("w-full aspect-square rounded-lg object-cover"), dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuCq3tMtVGA7LnexKy_NytBcAfM-_nq46VZ7cAwcstTrrqg7CclYAfdEVS-5LzT6oknfHasACW3G8O4e57zLSBAXHhvcyvbejTIpPtpf6ztAI5l3_a_MHwWXNMFvksetNma_5ZY_gEgGZ4L6iFRkCAon4CfyU6rY3umEvCTAAbEHJWBDzw-MsruUbkwo3NB9yQbaDQFEjNdO6GRVyV0EBOW-0PwMQBolnEzcI6lBuGrXXrXLhC626Wru8yh8nQ3mr8_9xBHEfRbo_Yw")}), dom.P([]dom.Attr{dom.Class("text-label-sm font-label-sm truncate")}, dom.Text("Sarah Jenkins"))),
								dom.Div([]dom.Attr{dom.Class("space-y-1")}, dom.Img([]dom.Attr{dom.Class("w-full aspect-square rounded-lg object-cover"), dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuDn7N-q4rB1DS5lG-gwsTdVucViaO7WrBMEemgip0AM6r4MzbvLEidxMS3T75wGAjA7GoS0Atjrf4AS1xHmxBqLf9V5pigZnzXzeT2kXLfm1OkaYUknno4Yw88BVh5Qt3q13DW4WID8jKsHhJm9Z6q6KTF3rXAcWQCKsm7f-wGQa_yT8x07-a9UuGz8cfN-7tEQ5FuKAJzQP3OU-qr6quUI3Q4tbuJjKfF8WFu0j3lXAnHRzyGSwpMY8NQOJ1fGZe5UdnwRLanLnYU")}), dom.P([]dom.Attr{dom.Class("text-label-sm font-label-sm truncate")}, dom.Text("Mike Ross"))),
								dom.Div([]dom.Attr{dom.Class("space-y-1")}, dom.Img([]dom.Attr{dom.Class("w-full aspect-square rounded-lg object-cover"), dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuDPWmyWOqX9nW4Saln8Du30gJkvb6ib2bdkdfrwuNkLZ-aP5oNolpTG0Qb5U6LhfRcvLenvE-4MADw8DhUp9sXVZop3iDEGZkf0y-A6Q36yropsLRxTsST3s2VuP47VYNWPJvKbKVnSUwuEFu1fNzBN2sFjFycDHK_bGka6QMvqE4DaCx_-2dTTEKzfqOYEc1umrQbJUGROBAtKUYx9dCbSn6CQLPI_sI3HwYSts50qtVVITCsDu2vlReMLzC0E4moRjmNjmN8Mar0")}), dom.P([]dom.Attr{dom.Class("text-label-sm font-label-sm truncate")}, dom.Text("Elena Vance"))),
								dom.Div([]dom.Attr{dom.Class("space-y-1")}, dom.Img([]dom.Attr{dom.Class("w-full aspect-square rounded-lg object-cover"), dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuAox2ifGGt5-Wdz4Gyq8SKT-m8l7RrhdmLqHPrVwBNnKNaKfAtXAAGguezm5HIsGB8SRMkym8fRHDU5ZuaUi0nq7_JmMQo8dQfQL794g-f8sEZpWMHIm8vuVLGRHb0Qj4E7e__qtObkWAjR2asyu3pUwaFSqAkGqOnI_ptY2t5pjttvCE2SJpLZ8o7QAZOOm7pBZR0wx6RaxO6Ivk4dbG1n8RcRO_tY4JIhOhhVhOYF9oAEj44g-ShyCPzqBjyjKKCYEMQsjt8TLWs")}), dom.P([]dom.Attr{dom.Class("text-label-sm font-label-sm truncate")}, dom.Text("David Miller"))),
								dom.Div([]dom.Attr{dom.Class("space-y-1")}, dom.Img([]dom.Attr{dom.Class("w-full aspect-square rounded-lg object-cover"), dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuB1yuraGZ78Zs4RaN5p7hQs97GHx0z-GtK-S6vYFL6IWJlRPXZvugaBfD7Q2_JqRM05KaZX4pvUxgSbMQ-gdsP5cGWbLv_3rIOnNdRSBClJdTbFQV16JXOUhkHhWisU-Ca9c17yX-43ekWn1UwUEFiy9QgyV5XxkwLl0sI8YjGYnbIMx2ObLq1zjvKr2soqzHUX1cuNM4A-UHa3pPqVG8kfGU478hBrAUqYDR2zzwn6Ukhn_H4cnAc_b23Q9PmhQN29LkykojXPB6g")}), dom.P([]dom.Attr{dom.Class("text-label-sm font-label-sm truncate")}, dom.Text("Chloe Zhao"))),
								dom.Div([]dom.Attr{dom.Class("space-y-1")}, dom.Img([]dom.Attr{dom.Class("w-full aspect-square rounded-lg object-cover"), dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuDGp1jF4FGnnakDq6J3H5XKZtJEBClwqycHVnyKiikshqyIOzUOkkF9i_I0t7Zh9QCg7gaGBvpPU_p7Q8Q1iViQw3aQaXpScRGCKyxQA74eal8I4DZGQCjdnj643tfH-13dapjNSuVQzdIqXPc44_W0yT_hs6rTMa6jdW0nniLHCaPr_MZK5cqMpmFecj2hGHyFlHUY8blLhSpj6W0r9533ZFW9lIt6WCWEO4Pn55KLcq5gcuc2YwiJuj8OJdc8P-n10fBrddTtwLE")}), dom.P([]dom.Attr{dom.Class("text-label-sm font-label-sm truncate")}, dom.Text("Marcus Wright"))),
							),
						),
					),
					dom.Section(
						[]dom.Attr{
							dom.Class("lg:col-span-7 flex flex-col gap-gutter max-w-max-width-feed"),
						},
						dom.Div(
							[]dom.Attr{
								dom.Class("bg-surface-card p-4 rounded-xl custom-shadow"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("flex gap-3 items-center"),
								},
								dom.Img([]dom.Attr{
									dom.Class("w-10 h-10 rounded-full object-cover"),
									dom.Src(avatarPhoto),
								}),
								dom.Button(
									[]dom.Attr{
										dom.Class("flex-grow bg-surface-container-low text-on-surface-variant font-body-md text-body-md text-left py-2 px-4 rounded-full hover:bg-surface-container-high transition-colors"),
									},
									dom.Text("What's on your mind, "+data.User.Name+"?"),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("flex mt-4 pt-3 border-t border-border-subtle"),
								},
								dom.Button(
									[]dom.Attr{
										dom.Class("flex-1 flex justify-center items-center gap-2 py-2 rounded-lg hover:bg-surface-container-low transition-colors"),
									},
									dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-error")}, dom.Text("videocam")),
									dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md text-on-surface-variant")}, dom.Text("Live video")),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("flex-1 flex justify-center items-center gap-2 py-2 rounded-lg hover:bg-surface-container-low transition-colors"),
									},
									dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-success")}, dom.Text("photo_library")),
									dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md text-on-surface-variant")}, dom.Text("Photo/video")),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("flex-1 flex justify-center items-center gap-2 py-2 rounded-lg hover:bg-surface-container-low transition-colors"),
									},
									dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-tertiary")}, dom.Text("emoji_emotions")),
									dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md text-on-surface-variant")}, dom.Text("Life event")),
								),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("bg-surface-card p-4 rounded-xl custom-shadow flex justify-between items-center"),
							},
							dom.H2([]dom.Attr{dom.Class("font-headline-md text-headline-md")}, dom.Text("Posts")),
							dom.Div(
								[]dom.Attr{
									dom.Class("flex gap-2"),
								},
								dom.Button(
									[]dom.Attr{
										dom.Class("bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg flex items-center gap-2 font-label-md text-label-md hover:bg-surface-container-highest transition-colors"),
									},
									dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-body-md")}, dom.Text("tune")),
									dom.Text("Filters"),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg flex items-center gap-2 font-label-md text-label-md hover:bg-surface-container-highest transition-colors"),
									},
									dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-body-md")}, dom.Text("settings")),
									dom.Text("Manage posts"),
								),
							),
						),
						// Map posts
						dom.Map(data.Posts, func(post models.Post) dom.Node {
							userAvatar := "https://lh3.googleusercontent.com/aida-public/AB6AXuBvTEfn_OD2OcuaL7fDG5TktYj4ddGZXXNKyqq-SO5SpJXhic851LZnP7-sLwq9NXRhIghPfui5jKjB5n8yb8D0QLqEjKXIjw3PQp2XY5hntjKbwjVx2ghLlQHRVT41r_26NBU5vk6ZOTYxVKBDepkG6WVOOInnig3EwSOgtrZ78zje1krJydOgP4VwT4Zj_tjrcUHpL0jt0O0EU4KF_1Su_5hdWkE2u7Nj-lXa3b5G3BQhEbkIdW-ILbmuQQzEOJtVgI2ZwFOit6k"
							if post.User.AvatarURL != nil && *post.User.AvatarURL != "" {
								userAvatar = *post.User.AvatarURL
							}
							postContent := ""
							if post.Content != nil {
								postContent = *post.Content
							}

							return dom.Article(
								[]dom.Attr{
									dom.Class("bg-surface-card rounded-xl custom-shadow overflow-hidden mb-4"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("p-4 flex justify-between items-start"),
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
											dom.H3([]dom.Attr{dom.Class("font-label-md text-label-md text-text-primary")}, dom.Text(post.User.Name)),
											dom.Div(
												[]dom.Attr{dom.Class("flex items-center gap-1 text-text-secondary font-label-sm text-label-sm")},
												dom.Span(nil, dom.Text(post.CreatedAt.Format("02 Jan 2006 15:04"))),
												dom.Span(nil, dom.Text("•")),
												dom.Span([]dom.Attr{
													dom.Class("material-symbols-outlined"),
													dom.Style("font-size: 14px;"),
												}, dom.Text("public")),
											),
										),
									),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("px-4 pb-4 font-body-md text-body-md text-text-primary"),
									},
									dom.Text(postContent),
								),
								dom.If(post.PostType == models.PostTypeImage, dom.Group(
									dom.Map(post.Media, func(m models.PostMedia) dom.Node {
										return dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full h-80 bg-surface-container-low"),
											},
											dom.Img([]dom.Attr{
												dom.Class("w-full h-full object-cover"),
												dom.Src(m.MediaURL),
											}),
										)
									}),
								)),
								dom.If(post.PostType == models.PostTypeVideo, dom.Group(
									dom.Map(post.Media, func(m models.PostMedia) dom.Node {
										return dom.Div(
											[]dom.Attr{
												dom.Class("relative w-full h-80 bg-surface-container-low"),
											},
											dom.Video(
												[]dom.Attr{
													dom.Class("w-full h-full object-cover"),
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
										dom.Class("px-2 py-1 flex border-t border-border-subtle"),
									},
									dom.Button(
										[]dom.Attr{
											dom.Class("flex-1 flex justify-center items-center gap-2 py-2 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant font-label-md text-label-md"),
										},
										dom.Span([]dom.Attr{dom.Class("material-symbols-outlined")}, dom.Text("thumb_up")),
										dom.Text("Like"),
									),
									dom.Button(
										[]dom.Attr{
											dom.Class("flex-1 flex justify-center items-center gap-2 py-2 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant font-label-md text-label-md"),
										},
										dom.Span([]dom.Attr{dom.Class("material-symbols-outlined")}, dom.Text("chat_bubble")),
										dom.Text("Comment"),
									),
								),
							)
						}),
					),
				),
			),
			dom.ScriptEl(nil, `// Simple tab switching visual
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('nav-active', 'text-primary'));
                navLinks.forEach(l => l.classList.add('text-on-surface-variant'));
                link.classList.add('nav-active');
                link.classList.remove('text-on-surface-variant');
            });
        });

        // Hover animation for cards
        const cards = document.querySelectorAll('.custom-shadow');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
                card.style.transition = 'transform 0.3s ease';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });`),
		),
	)
	return page.Render(w)
}
