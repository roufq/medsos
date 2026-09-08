package backend

import (
	"goravel/resources/views/backend/dom"
	"io"
)

type RegisterData struct {
	FirstName string
	Surname   string
	Email     string
	Error     string
}

func RenderRegister(w io.Writer, data RegisterData) error {
	page := dom.Html(
		[]dom.Attr{
			dom.Class("light"),
			dom.Lang("en"),
		},
		dom.Head(
			nil,
			dom.Meta([]dom.Attr{dom.Charset("utf-8")}),
			dom.Meta([]dom.Attr{dom.ContentAttr("width=device-width, initial-scale=1.0"), dom.Name("viewport")}),
			dom.TitleEl("Join Connect Modern"),
			dom.Link([]dom.Attr{dom.Href("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"), dom.Rel("stylesheet")}),
			dom.Link([]dom.Attr{dom.Href("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"), dom.Rel("stylesheet")}),
			dom.Link([]dom.Attr{dom.Href("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"), dom.Rel("stylesheet")}),
			dom.ScriptEl([]dom.Attr{dom.Src("https://cdn.tailwindcss.com?plugins=forms,container-queries")}, ""),
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
			dom.StyleEl(nil, `body { font-family: 'Inter', sans-serif; background-color: #f0f2f5; }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .registration-card {
            box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.1), 0 2px 4px 0 rgba(0, 0, 0, 0.05);
        }
        input:focus {
            box-shadow: none !important;
            border-color: #0050cd !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d8dadd;
            border-radius: 10px;
        }`),
		),
		dom.Body(
			[]dom.Attr{
				dom.Class("bg-background min-h-screen flex items-center justify-center p-4"),
			},
			dom.Div(
				[]dom.Attr{
					dom.Class("max-w-max-width-container w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"),
				},
				dom.Div(
					[]dom.Attr{
						dom.Class("hidden lg:flex flex-col space-y-6"),
					},
					dom.H1([]dom.Attr{dom.Class("font-display-lg text-display-lg text-primary tracking-tight")}, dom.Text("Connect Modern")),
					dom.P([]dom.Attr{dom.Class("font-headline-lg text-headline-lg text-on-surface max-w-md")}, dom.Text("Connect with friends and the world around you on Connect Modern.")),
					dom.Div(
						[]dom.Attr{
							dom.Class("flex items-center space-x-4 pt-4"),
						},
						dom.Div(
							[]dom.Attr{
								dom.Class("flex -space-x-3"),
							},
							dom.Img([]dom.Attr{
								dom.Class("w-12 h-12 rounded-full border-2 border-white object-cover"),
								dom.CustomAttr("data-alt", "A professional headshot..."),
								dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuAu03PRPpnWtF5ie6wfdLWVXN6WVsV2OmZcdsr32rJlxuCOu23Xnfz2p7_D5kOMlsvfiqQMM3DljmVG9o7kcm2dFdzZSCMw-u8vn12bx9pxuAonWn6yKA9yDrPZxgJhyF1MUbjU_PS6oZJZx5vjG1GqCGCXdYZXl4XjIG53VkydMS8lESKiso9h4fBhVzDRGMIGudrP8xyJefVHY3169R88mtR7yKxRItLvRHLy-rYLmo70YRjXs9qxCW0iPrHsvhL_rXqQ39V2Efw"),
							}),
							dom.Img([]dom.Attr{
								dom.Class("w-12 h-12 rounded-full border-2 border-white object-cover"),
								dom.CustomAttr("data-alt", "A diverse group..."),
								dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuAtpEIfim1e4tA-qZAc73el7NOS4-q15O5J7uGQi_gIMf2it9XqQw5rvG_X3IkYiSKREbRGXz-4xFTVvJfZAVHKKgVE4VFuzcKo8VPpTUwiEF4BY0dBGFep5reaa27fekpcou0n6QMxGu16c6xkyYutJcCYdCW8ATmnslzE4VEyPRVYFptZNrJ0F2HD_hbeTT0ttQKdLl5EEFIqnrEdkYJRPtSHDV42Gg4Qfhy1lHt5qW1noK-ZrMYHtwAnX84CJjheggjIYX54ayE"),
							}),
							dom.Img([]dom.Attr{
								dom.Class("w-12 h-12 rounded-full border-2 border-white object-cover"),
								dom.CustomAttr("data-alt", "A close-up..."),
								dom.Src("https://lh3.googleusercontent.com/aida-public/AB6AXuBR43yPqODlkbp98CAU3nuAw5V9_2c_nCkDDghO2qi25xoM4ykvA1GYupeWxa1GGxjAytL96IIuGqFcrjSXVNLUS900qmHJmuApYvkoHVxpbnXtImFtVw-iqL1HgrLRBL0A_UUf0zszg708QpB4RUPLOWOqcpMzKLaO4hEwN4hMDXVfKgpGpdBbIPL_bfnt9GsCT9-EYwkCX2wv9dRUol6LYbLeZGZ94-EXHg49Dfg0Zw2nLlJp4dsD2TzI4JaXy5iDXxzS2KLybEY"),
							}),
						),
						dom.P([]dom.Attr{dom.Class("font-body-md text-body-md text-text-secondary")}, dom.Text("Join 2,000+ people online right now.")),
					),
				),
				dom.Div(
					[]dom.Attr{
						dom.Class("w-full max-w-[432px] mx-auto"),
					},
					dom.Div(
						[]dom.Attr{
							dom.Class("bg-surface-card registration-card rounded-xl p-6 lg:p-8"),
						},
						dom.Div(
							[]dom.Attr{
								dom.Class("mb-6"),
							},
							dom.H2([]dom.Attr{dom.Class("font-display-lg text-display-lg text-on-surface mb-1")}, dom.Text("Create a new account")),
							dom.P([]dom.Attr{dom.Class("font-body-md text-body-md text-text-secondary")}, dom.Text("It's quick and easy.")),
						),
						dom.Hr([]dom.Attr{dom.Class("border-border-subtle mb-6")}),
						dom.If(data.Error != "", dom.Div(
							[]dom.Attr{
								dom.Class("bg-error-container text-on-error-container p-3 rounded-lg text-body-md border border-error mb-4 font-body-md"),
							},
							dom.Text(data.Error),
						)),
						dom.Form(
							[]dom.Attr{
								dom.CustomAttr("action", "/web/register"),
								dom.CustomAttr("method", "POST"),
								dom.Class("space-y-4"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("grid grid-cols-2 gap-3"),
								},
								dom.Input([]dom.Attr{
									dom.Class("w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface placeholder:text-on-surface-variant focus:bg-surface-card transition-all"),
									dom.Placeholder("First name"),
									dom.Required(),
									dom.Type("text"),
									dom.Value(data.FirstName),
									dom.Name("first_name"),
								}),
								dom.Input([]dom.Attr{
									dom.Class("w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface placeholder:text-on-surface-variant focus:bg-surface-card transition-all"),
									dom.Placeholder("Surname"),
									dom.Required(),
									dom.Type("text"),
									dom.Value(data.Surname),
									dom.Name("surname"),
								}),
							),
							dom.Div(
								nil,
								dom.Input([]dom.Attr{
									dom.Class("w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface placeholder:text-on-surface-variant focus:bg-surface-card transition-all"),
									dom.Placeholder("Mobile number or email address"),
									dom.Required(),
									dom.Type("text"),
									dom.Value(data.Email),
									dom.Name("email"),
								}),
							),
							dom.Div(
								nil,
								dom.Input([]dom.Attr{
									dom.Class("w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface placeholder:text-on-surface-variant focus:bg-surface-card transition-all"),
									dom.Placeholder("New password"),
									dom.Required(),
									dom.Type("password"),
									dom.Name("password"),
								}),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("space-y-2"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center space-x-1"),
									},
									dom.Label([]dom.Attr{dom.Class("font-label-md text-label-md text-on-surface-variant")}, dom.Text("Date of birth")),
									dom.Span([]dom.Attr{
										dom.Class("material-symbols-outlined text-sm text-text-secondary cursor-help"),
										dom.CustomAttr("title", "Why do I need to provide my date of birth?"),
									}, dom.Text("help")),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("grid grid-cols-3 gap-3"),
									},
									dom.SelectEl(
										[]dom.Attr{
											dom.Class("bg-surface-card border border-outline-variant rounded-lg px-2 py-2 font-body-md text-on-surface focus:ring-0 focus:border-primary"),
										},
										dom.OptionEl(nil, dom.Text("15")),
									),
									dom.SelectEl(
										[]dom.Attr{
											dom.Class("bg-surface-card border border-outline-variant rounded-lg px-2 py-2 font-body-md text-on-surface focus:ring-0 focus:border-primary"),
										},
										dom.OptionEl(nil, dom.Text("Oct")),
									),
									dom.SelectEl(
										[]dom.Attr{
											dom.Class("bg-surface-card border border-outline-variant rounded-lg px-2 py-2 font-body-md text-on-surface focus:ring-0 focus:border-primary"),
										},
										dom.OptionEl(nil, dom.Text("2023")),
									),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("space-y-2"),
								},
								dom.Div(
									[]dom.Attr{
										dom.Class("flex items-center space-x-1"),
									},
									dom.Label([]dom.Attr{dom.Class("font-label-md text-label-md text-on-surface-variant")}, dom.Text("Gender")),
									dom.Span([]dom.Attr{
										dom.Class("material-symbols-outlined text-sm text-text-secondary cursor-help"),
										dom.CustomAttr("title", "Learn more about gender on Connect Modern"),
									}, dom.Text("help")),
								),
								dom.Div(
									[]dom.Attr{
										dom.Class("grid grid-cols-3 gap-3"),
									},
									dom.Label(
										[]dom.Attr{
											dom.Class("flex items-center justify-between bg-surface-card border border-outline-variant rounded-lg px-3 py-2 cursor-pointer hover:bg-surface-container-low transition-colors"),
										},
										dom.Span([]dom.Attr{dom.Class("font-body-md text-on-surface")}, dom.Text("Female")),
										dom.Input([]dom.Attr{
											dom.Class("text-primary focus:ring-0"),
											dom.Name("gender"),
											dom.Type("radio"),
											dom.Value("female"),
										}),
									),
									dom.Label(
										[]dom.Attr{
											dom.Class("flex items-center justify-between bg-surface-card border border-outline-variant rounded-lg px-3 py-2 cursor-pointer hover:bg-surface-container-low transition-colors"),
										},
										dom.Span([]dom.Attr{dom.Class("font-body-md text-on-surface")}, dom.Text("Male")),
										dom.Input([]dom.Attr{
											dom.Class("text-primary focus:ring-0"),
											dom.Name("gender"),
											dom.Type("radio"),
											dom.Value("male"),
										}),
									),
									dom.Label(
										[]dom.Attr{
											dom.Class("flex items-center justify-between bg-surface-card border border-outline-variant rounded-lg px-3 py-2 cursor-pointer hover:bg-surface-container-low transition-colors"),
										},
										dom.Span([]dom.Attr{dom.Class("font-body-md text-on-surface")}, dom.Text("Custom")),
										dom.Input([]dom.Attr{
											dom.Class("text-primary focus:ring-0"),
											dom.Name("gender"),
											dom.Type("radio"),
											dom.Value("custom"),
										}),
									),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("pt-2"),
								},
								dom.P(
									[]dom.Attr{
										dom.Class("font-label-sm text-label-sm text-text-secondary leading-normal"),
									},
									dom.Text("People who use our service may have uploaded your contact information to Connect Modern. "),
									dom.A([]dom.Attr{
										dom.Class("text-primary hover:underline"),
										dom.Href("#"),
									}, dom.Text("Learn more")),
									dom.Text("."),
								),
								dom.P(
									[]dom.Attr{
										dom.Class("font-label-sm text-label-sm text-text-secondary mt-2 leading-normal"),
									},
									dom.Text("By clicking Sign Up, you agree to our "),
									dom.A([]dom.Attr{
										dom.Class("text-primary hover:underline"),
										dom.Href("#"),
									}, dom.Text("Terms")),
									dom.Text(", "),
									dom.A([]dom.Attr{
										dom.Class("text-primary hover:underline"),
										dom.Href("#"),
									}, dom.Text("Privacy Policy")),
									dom.Text(" and "),
									dom.A([]dom.Attr{
										dom.Class("text-primary hover:underline"),
										dom.Href("#"),
									}, dom.Text("Cookies Policy")),
									dom.Text(". You may receive SMS notifications from us and can opt out at any time."),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("pt-4 flex justify-center"),
								},
								dom.Button([]dom.Attr{
									dom.Class("bg-success text-white font-headline-md text-headline-md px-16 py-2.5 rounded-lg hover:brightness-105 active:scale-95 transition-all shadow-sm"),
									dom.Type("submit"),
								}, dom.Text("Sign Up")),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("mt-6 pt-6 border-t border-border-subtle text-center"),
							},
							dom.A([]dom.Attr{
								dom.Class("text-primary font-body-md hover:underline"),
								dom.Href("#"),
							}, dom.Text("Already have an account?")),
						),
					),
					dom.Div(
						[]dom.Attr{
							dom.Class("mt-8 text-center px-4"),
						},
						dom.P([]dom.Attr{dom.Class("font-label-sm text-label-sm text-text-secondary")}, dom.Text("Create a Page for a celebrity, brand or business.")),
					),
				),
			),
			dom.ScriptEl(nil, `// Dynamic birthday population (simplified demo)
        const daySelect = document.querySelectorAll('select')[0];
        const yearSelect = document.querySelectorAll('select')[2];
        
        for(let i = 1; i <= 31; i++) {
            if(i !== 15) { // Skip 15 since it's already there for static demo
                const opt = document.createElement('option');
                opt.value = i;
                opt.innerHTML = i;
                daySelect.appendChild(opt);
            }
        }

        const currentYear = new Date().getFullYear();
        for(let i = currentYear - 1; i >= currentYear - 100; i--) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.innerHTML = i;
            yearSelect.appendChild(opt);
        }`),
		),
	)
	return page.Render(w)
}
