package backend

import (
	"goravel/resources/views/backend/dom"
	"io"
)

type LoginData struct {
	Email string
	Error string
}

func RenderLogin(w io.Writer, data LoginData) error {
	page := dom.Html(
		[]dom.Attr{
			dom.Class("light"),
			dom.Lang("en"),
		},
		dom.Head(
			nil,
			dom.Meta([]dom.Attr{dom.Charset("utf-8")}),
			dom.Meta([]dom.Attr{dom.ContentAttr("width=device-width, initial-scale=1.0"), dom.Name("viewport")}),
			dom.TitleEl("Connect Modern - Log In"),
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
        .login-card-shadow {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .glass-effect {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(8px);
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
            },
          },
        }`),
		),
		dom.Body(
			[]dom.Attr{
				dom.Class("bg-background min-h-screen flex items-center justify-center p-4"),
			},
			dom.Div(
				[]dom.Attr{
					dom.Class("fixed inset-0 overflow-hidden pointer-events-none"),
				},
				dom.Div([]dom.Attr{dom.Class("absolute -top-24 -left-24 w-96 h-96 bg-primary-fixed opacity-20 blur-[100px] rounded-full")}),
				dom.Div([]dom.Attr{dom.Class("absolute top-1/2 -right-24 w-80 h-80 bg-secondary-fixed opacity-30 blur-[80px] rounded-full")}),
				dom.Div([]dom.Attr{dom.Class("absolute -bottom-24 left-1/3 w-64 h-64 bg-tertiary-fixed opacity-20 blur-[120px] rounded-full")}),
			),
			dom.Main(
				[]dom.Attr{
					dom.Class("relative z-10 w-full max-w-max-width-container flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-24"),
				},
				dom.Section(
					[]dom.Attr{
						dom.Class("flex flex-col text-center md:text-left max-w-md animate-fade-in-left"),
					},
					dom.H1([]dom.Attr{dom.Class("font-display-lg text-display-lg text-primary-container mb-4")}, dom.Text("Connect Modern")),
					dom.P([]dom.Attr{dom.Class("font-body-lg text-body-lg text-text-secondary leading-relaxed")}, dom.Text("Connect Modern helps you link with friends and the world around you. Experience a social environment built on clarity, trust, and professional efficiency.")),
					dom.Div(
						[]dom.Attr{dom.Class("hidden md:grid grid-cols-2 gap-4 mt-12 opacity-80")},
						dom.Div(
							[]dom.Attr{dom.Class("h-32 rounded-xl overflow-hidden shadow-sm")},
							dom.Img([]dom.Attr{
								dom.Class("w-full h-full object-cover"),
								dom.CustomAttr("data-alt", "A clean, minimalist workspace..."),
								dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuBzuPa9VWssYg_PpER2-TYOr9jidgIXTzX_8emgbWvPNtI9NyAPlgl3IdgDvsfduXNe-FzWnewgfMQbXDM_hzuaeI3Z8AxDgF0cp_3YH3IxGkCno9gNyplMXGd6V6awnab5ebY4nBNoKUUt0o8XnfE1RzHUqkPQPpYQeFRUCSDiV3RvJ8RzkSFCISYqjv8a6yOk0NjbftdQ8iwTYwb_9LToTOVpG7VFV7_XM-dTCaUOATGSNzgVYhp2meNvgeW3UE-KYltfzHE29PI"),
							}),
						),
						dom.Div(
							[]dom.Attr{dom.Class("h-32 rounded-xl overflow-hidden shadow-sm translate-y-6")},
							dom.Img([]dom.Attr{
								dom.Class("w-full h-full object-cover"),
								dom.CustomAttr("data-alt", "Close-up of a high-end smartphone screen..."),
								dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuAIVEFljoWCEF-IxnbgprxrAIuIrAx4WiFJXnQyXMfuPHnIEcbpJwy9IPuBYHp8LQGUUuRJ6POAFw11TgrswBrl80kF-WT6y_9UjZ1GXeLj60WPlpOMGnaZ--7cEKHYUOTsfHrLGV5gySjb4i5UHKCBFNHgILLc9qXZBv7ohYmAFpr0aIU-0RANoqnBUbtNOgPQtcESwKFFfUpsAfUQkLUTUPxbI_oAku_D7Vhc8HJzy6naXphfxZqZLSX0Cy48LDbtbKNq7y0Efio"),
							}),
						),
					),
				),
				dom.Section(
					[]dom.Attr{dom.Class("w-full max-w-[400px]")},
					dom.Div(
						[]dom.Attr{dom.Class("bg-surface-card rounded-xl p-6 lg:p-8 login-card-shadow glass-effect transition-all hover:shadow-lg")},
						dom.If(data.Error != "", dom.Div(
							[]dom.Attr{dom.Class("bg-error-container text-on-error-container p-3 rounded-lg text-body-md border border-error mb-4 font-body-md")},
							dom.Text(data.Error),
						)),
						dom.Form(
							[]dom.Attr{
								dom.Class("space-y-4"),
								dom.CustomAttr("method", "POST"),
								dom.CustomAttr("action", "/web/login"),
							},
							dom.Div(
								[]dom.Attr{dom.Class("space-y-1")},
								dom.Input([]dom.Attr{
									dom.Class("w-full px-4 py-3 bg-surface-container-low border border-transparent rounded-lg font-body-md text-on-surface focus:bg-white focus:border-primary-container focus:ring-0 transition-all outline-none"),
									dom.Placeholder("Email address"),
									dom.Required(),
									dom.Type("email"),
									dom.Value(data.Email),
									dom.Name("email"),
								}),
							),
							dom.Div(
								[]dom.Attr{dom.Class("space-y-1")},
								dom.Input([]dom.Attr{
									dom.Class("w-full px-4 py-3 bg-surface-container-low border border-transparent rounded-lg font-body-md text-on-surface focus:bg-white focus:border-primary-container focus:ring-0 transition-all outline-none"),
									dom.Placeholder("Password"),
									dom.Required(),
									dom.Type("password"),
									dom.Name("password"),
								}),
							),
							dom.Button(
								[]dom.Attr{
									dom.Class("w-full py-3 bg-primary-container text-on-primary font-headline-md rounded-lg hover:brightness-110 active:scale-[0.98] transition-all"),
									dom.Type("submit"),
								},
								dom.Text("Log In"),
							),
							dom.Div(
								[]dom.Attr{dom.Class("text-center")},
								dom.A([]dom.Attr{
									dom.Class("font-label-md text-primary hover:underline decoration-2 underline-offset-4"),
									dom.Href("#"),
								}, dom.Text("Forgotten password?")),
							),
							dom.Div([]dom.Attr{dom.Class("border-t border-border-subtle my-6")}),
							dom.Div(
								[]dom.Attr{dom.Class("text-center")},
								dom.Button([]dom.Attr{
									dom.Class("px-6 py-3 bg-success text-on-primary font-headline-md rounded-lg hover:brightness-105 active:scale-[0.98] transition-all"),
									dom.Type("button"),
								}, dom.Text("Create new account")),
							),
						),
					),
					dom.Div(
						[]dom.Attr{dom.Class("mt-8 text-center md:text-left")},
						dom.P(
							[]dom.Attr{dom.Class("font-label-sm text-on-surface-variant")},
							dom.Span([]dom.Attr{dom.Class("font-bold text-on-surface cursor-pointer hover:underline")}, dom.Text("Create a Page ")),
							dom.Text("for a celebrity, brand or business."),
						),
					),
				),
			),
			dom.Footer(
				[]dom.Attr{dom.Class("fixed bottom-0 left-0 w-full p-4 md:px-8 hidden sm:block")},
				dom.Div(
					[]dom.Attr{dom.Class("max-w-max-width-container mx-auto flex flex-wrap gap-x-4 gap-y-2 justify-center font-label-sm text-text-secondary")},
					dom.Span([]dom.Attr{dom.Class("hover:underline cursor-pointer")}, dom.Text("English (UK)")),
					dom.Span([]dom.Attr{dom.Class("hover:underline cursor-pointer")}, dom.Text("Français (France)")),
					dom.Span([]dom.Attr{dom.Class("hover:underline cursor-pointer")}, dom.Text("Español")),
					dom.Span([]dom.Attr{dom.Class("hover:underline cursor-pointer")}, dom.Text("Deutsch")),
					dom.Span([]dom.Attr{dom.Class("hover:underline cursor-pointer")}, dom.Text("Italiano")),
					dom.Span([]dom.Attr{dom.Class("hover:underline cursor-pointer")}, dom.Text("Português (Brasil)")),
					dom.Span([]dom.Attr{dom.Class("hover:underline cursor-pointer")}, dom.Text("हिन्दी")),
					dom.Button(
						[]dom.Attr{dom.Class("bg-surface-container-high w-6 h-6 flex items-center justify-center rounded-sm text-on-surface-variant hover:bg-surface-dim transition-colors")},
						dom.Span([]dom.Attr{dom.Class("material-symbols-outlined text-[16px]")}, dom.Text("add")),
					),
				),
			),
			dom.StyleEl(nil, `@keyframes fade-in-left {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-left {
            animation: fade-in-left 0.8s ease-out forwards;
        }`),
		),
	)
	return page.Render(w)
}
