package backend

import (
	"goravel/resources/views/backend/dom"
)

func LayoutAdmin(title string, activeMenu string, mainContent dom.Node) *dom.Element {
	// Function to generate menu item classes
	menuItemClass := func(name string) string {
		baseClass := "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out "
		if activeMenu == name {
			return baseClass + "bg-primary-fixed text-on-primary-fixed font-bold shadow-sm"
		}
		return baseClass + "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
	}

	return dom.Html(
		[]dom.Attr{dom.Class("light"), dom.Lang("en")},
		dom.Head(
			nil,
			dom.Meta([]dom.Attr{dom.CustomAttr("charset", "utf-8")}),
			dom.Meta([]dom.Attr{dom.ContentAttr("width=device-width, initial-scale=1.0"), dom.Name("viewport")}),
			dom.TitleEl(nil, dom.Text(title)),
			dom.Link([]dom.Attr{dom.Href("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"), dom.Rel("stylesheet")}),
			dom.Link([]dom.Attr{dom.Href("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"), dom.Rel("stylesheet")}),
			dom.ScriptEl([]dom.Attr{dom.Src("https://cdn.tailwindcss.com?plugins=forms,container-queries")}, ""),
			dom.ScriptEl([]dom.Attr{dom.Id("tailwind-config")}, `tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "primary": "#0050cd",
                        "on-primary": "#ffffff",
                        "primary-container": "#0866ff",
                        "on-primary-container": "#f9f7ff",
                        "primary-fixed": "#dbe1ff",
                        "primary-fixed-dim": "#b3c5ff",
                        "on-primary-fixed": "#00184a",
                        "on-primary-fixed-variant": "#003fa5",
                        "secondary": "#54606a",
                        "on-secondary": "#ffffff",
                        "secondary-container": "#d8e4f0",
                        "on-secondary-container": "#5a6670",
                        "secondary-fixed": "#d8e4f0",
                        "secondary-fixed-dim": "#bcc8d3",
                        "on-secondary-fixed": "#111d25",
                        "on-secondary-fixed-variant": "#3d4852",
                        "tertiary": "#a13400",
                        "on-tertiary": "#ffffff",
                        "tertiary-container": "#cb4400",
                        "on-tertiary-container": "#fff7f5",
                        "tertiary-fixed": "#ffdbcf",
                        "tertiary-fixed-dim": "#ffb59b",
                        "on-tertiary-fixed": "#380d00",
                        "on-tertiary-fixed-variant": "#812800",
                        "error": "#F02849",
                        "on-error": "#ffffff",
                        "error-container": "#ffdad6",
                        "on-error-container": "#93000a",
                        "outline": "#727687",
                        "outline-variant": "#c2c6d8",
                        "background": "#f7f9fc",
                        "on-background": "#191c1e",
                        "surface": "#f7f9fc",
                        "on-surface": "#191c1e",
                        "surface-variant": "#e0e3e6",
                        "on-surface-variant": "#424656",
                        "inverse-surface": "#2d3133",
                        "inverse-on-surface": "#eff1f4",
                        "inverse-primary": "#b3c5ff",
                        "surface-bright": "#f7f9fc",
                        "surface-dim": "#d8dadd",
                        "surface-container-lowest": "#ffffff",
                        "surface-container-low": "#f2f4f7",
                        "surface-container": "#eceef1",
                        "surface-container-high": "#e6e8eb",
                        "surface-container-highest": "#e0e3e6",
                        "surface-card": "#FFFFFF",
                        "text-primary": "#1C1E21",
                        "text-secondary": "#65676B",
                        "border-subtle": "#CED0D4",
                        "success": "#31A24C",
                        "surface-tint": "#0054d7"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.5rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "2xl": "1rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "margin-mobile": "16px",
                        "unit": "4px",
                        "max-width-container": "1280px",
                        "margin-desktop": "24px",
                        "max-width-feed": "680px",
                        "gutter": "16px"
                    },
                    "fontFamily": {
                        "headline-lg": ["Inter"],
                        "body-lg": ["Inter"],
                        "label-md": ["Inter"],
                        "display-lg": ["Inter"],
                        "label-sm": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "body-md": ["Inter"],
                        "headline-md": ["Inter"]
                    },
                    "fontSize": {
                        "headline-lg": ["24px", {"lineHeight": "1.3", "fontWeight": "700"}],
                        "body-lg": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}],
                        "label-md": ["13px", {"lineHeight": "1.2", "letterSpacing": "0.01em", "fontWeight": "600"}],
                        "display-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                        "label-sm": ["12px", {"lineHeight": "1.2", "fontWeight": "500"}],
                        "headline-lg-mobile": ["20px", {"lineHeight": "1.3", "fontWeight": "700"}],
                        "body-md": ["14px", {"lineHeight": "1.5", "fontWeight": "400"}],
                        "headline-md": ["20px", {"lineHeight": "1.4", "fontWeight": "600"}]
                    }
                },
            },
        }`),
			dom.StyleEl(nil, `
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f7f9fc;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            vertical-align: middle;
        }
        .chart-container {
            position: relative;
            height: 300px;
            width: 100%;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e0e3e6;
            border-radius: 10px;
        }
        .metric-card-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.05);
        }
        .glass-effect {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(8px);
        }
        .login-card-shadow {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
        }`),
		),
		dom.Body(
			[]dom.Attr{dom.Class("text-on-background bg-background antialiased relative")},
			// Background Blobs Parallax (like login)
			dom.Div(
				[]dom.Attr{dom.Class("fixed inset-0 overflow-hidden pointer-events-none z-0"), dom.Id("parallax-bg")},
				dom.Div([]dom.Attr{dom.Class("absolute -top-24 -left-24 w-96 h-96 bg-primary-fixed opacity-20 blur-[100px] rounded-full")}),
				dom.Div([]dom.Attr{dom.Class("absolute top-1/2 -right-24 w-80 h-80 bg-secondary-fixed opacity-30 blur-[80px] rounded-full")}),
				dom.Div([]dom.Attr{dom.Class("absolute -bottom-24 left-1/3 w-64 h-64 bg-tertiary-fixed opacity-20 blur-[120px] rounded-full")}),
			),
			// Header
			dom.Header(
				[]dom.Attr{dom.Class("bg-surface/80 shadow-sm sticky top-0 z-50 flex justify-between items-center h-16 px-margin-desktop border-b border-outline-variant/30 glass-effect")},
				dom.Div(
					[]dom.Attr{dom.Class("flex items-center gap-6")},
					dom.H1([]dom.Attr{dom.Class("font-headline-md text-headline-md font-bold text-primary")}, dom.Text("Connect Modern")),
					dom.Div(
						[]dom.Attr{dom.Class("hidden md:flex items-center bg-surface-container-low/50 px-4 py-2 rounded-lg w-80 border border-outline-variant/50")},
						dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-outline mr-2 text-[20px]")}, dom.Text("search")),
						dom.Input([]dom.Attr{
							dom.Class("bg-transparent border-none focus:ring-0 text-body-md w-full placeholder:text-outline"),
							dom.Placeholder("Search data, reports, or users..."),
							dom.Type("text"),
						}),
					),
				),
				dom.Div(
					[]dom.Attr{dom.Class("flex items-center gap-4")},
					dom.Button([]dom.Attr{dom.Class("material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors cursor-pointer active:opacity-80")}, dom.Text("notifications")),
					dom.Button([]dom.Attr{dom.Class("material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors cursor-pointer active:opacity-80")}, dom.Text("help")),
					dom.Div([]dom.Attr{dom.Class("h-8 w-8 rounded-full overflow-hidden border border-outline-variant cursor-pointer")},
						dom.Img([]dom.Attr{
							dom.Class("w-full h-full object-cover"),
							dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuDqsdUhFcG3uPaZGLXoKWUnqOu7qkdvrbRl_oAWjA79sqOuQj35GD_7MSD63tVLPecdAxbu1xg34JpOTFRAYu6R3MDnPgk6SN9-TNuPoQz_zMsW09PzA-HZGIng7GnkK0JgHMxOHTAFF6Vs9yspvzZK0-Q2CwdVEaVtYTfhXH6t8gGvA9FYthiLulCC7-Xif2SUQtO4riVu78F1uumAeUT84su0O5-DvRcrlQzq4tYaTD4nQPNC2qjQjwJQK_lRBDLQMJQl5jeeNoA"),
						}),
					),
				),
			),
			// Layout Container
			dom.Div(
				[]dom.Attr{dom.Class("flex relative z-10")},
				// Sidebar
				dom.Aside(
					[]dom.Attr{dom.Class("h-screen w-64 fixed left-0 top-16 bg-surface-container-lowest/80 glass-effect border-r border-outline-variant/30 flex flex-col p-4 gap-2 hidden lg:flex")},
					dom.Div([]dom.Attr{dom.Class("mb-6 px-2")},
						dom.H2([]dom.Attr{dom.Class("font-headline-md text-headline-md font-bold text-on-surface")}, dom.Text("Admin Panel")),
						dom.P([]dom.Attr{dom.Class("font-label-sm text-label-sm text-on-surface-variant")}, dom.Text("Connect Modern Control")),
					),
					dom.Nav([]dom.Attr{dom.Class("space-y-1 flex-1")},
						dom.A([]dom.Attr{dom.Class(menuItemClass("Overview")), dom.Href("/web/admin/dashboard")}, dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-[22px]")}, dom.Text("dashboard")), dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md")}, dom.Text("Overview"))),
						dom.A([]dom.Attr{dom.Class(menuItemClass("Users")), dom.Href("/web/admin/users")}, dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-[22px]")}, dom.Text("group")), dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md")}, dom.Text("Users"))),
						dom.A([]dom.Attr{dom.Class(menuItemClass("Posts")), dom.Href("/web/admin/posts")}, dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-[22px]")}, dom.Text("chat_bubble")), dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md")}, dom.Text("Posts"))),
						dom.A([]dom.Attr{dom.Class(menuItemClass("Reports")), dom.Href("/web/admin/moderation")}, dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-[22px]")}, dom.Text("assessment")), dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md")}, dom.Text("Reports"))),
						dom.A([]dom.Attr{dom.Class(menuItemClass("Settings")), dom.Href("/web/admin/settings")}, dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-[22px]")}, dom.Text("settings")), dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md")}, dom.Text("Settings"))),
					),
					dom.Div([]dom.Attr{dom.Class("mt-auto pt-4 border-t border-outline-variant/30 space-y-1")},
						dom.Button([]dom.Attr{dom.Class("w-full bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md font-bold mb-4 hover:bg-primary/90 transition-all shadow-sm")}, dom.Text("Generate Report")),
						dom.A([]dom.Attr{dom.Class("flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface rounded-lg transition-all"), dom.Href("#")}, dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-[22px]")}, dom.Text("contact_support")), dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md")}, dom.Text("Support"))),
						dom.A([]dom.Attr{dom.Class("flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface rounded-lg transition-all"), dom.Href("/web/logout")}, dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-[22px]")}, dom.Text("logout")), dom.Span([]dom.Attr{dom.Class("font-label-md text-label-md")}, dom.Text("Logout"))),
					),
				),
				// Main Content
				dom.Main(
					[]dom.Attr{dom.Class("flex-1 lg:ml-64 p-6 md:p-10 min-h-screen pb-32")},
					dom.Div([]dom.Attr{dom.Class("max-w-max-width-container mx-auto")}, mainContent),
				),
			),
			dom.ScriptEl(nil, `// Add subtle parallax to background elements
        document.addEventListener('mousemove', (e) => {
            const blobs = document.querySelectorAll('#parallax-bg > div');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            blobs.forEach((blob, i) => {
                const speed = (i + 1) * 20;
                blob.style.transform = "translate(" + (x * speed) + "px, " + (y * speed) + "px)";
            });
        });`),
		),
	)
}
