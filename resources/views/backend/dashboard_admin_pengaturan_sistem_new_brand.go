package backend

import (
	"goravel/resources/views/backend/dom"
	"io"
)

func RenderDashboardAdminPengaturanSistemNewBrand(w io.Writer) error {
	page := LayoutAdmin("Connect Modern - Admin Dashboard", "Settings",
		dom.Div(
						[]dom.Attr{
							dom.Class("max-w-[1100px] mx-auto"),
						},
						dom.Header(
							[]dom.Attr{
								dom.Class("mb-10"),
							},
							dom.H2(
								[]dom.Attr{
									dom.Class("font-display-lg text-display-lg text-text-primary mb-2"),
								},
								dom.Text("Platform Settings"),
							),
							dom.P(
								[]dom.Attr{
									dom.Class("text-text-secondary font-body-md text-body-md max-w-2xl"),
								},
								dom.Text("Manage your application's global configuration, security protocols, and third-party integrations."),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("grid grid-cols-1 md:grid-cols-12 gap-8 items-start"),
							},
							dom.Nav(
								[]dom.Attr{
									dom.Class("md:col-span-3 space-y-1.5"),
									dom.Id("settings-tabs"),
								},
								dom.Button(
									[]dom.Attr{
										dom.Class("tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 bg-surface-container-lowest shadow-sm border border-primary/20 text-primary font-bold"),
										dom.CustomAttr("data-tab", "general"),
										dom.CustomAttr("onclick", "switchTab('general')"),
									},
									dom.Span(
										[]dom.Attr{
											dom.Class("material-symbols-outlined text-[20px]"),
										},
										dom.Text("tune"),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-label-md"),
										},
										dom.Text("General"),
									),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-secondary hover:bg-surface-container-low"),
										dom.CustomAttr("data-tab", "security"),
										dom.CustomAttr("onclick", "switchTab('security')"),
									},
									dom.Span(
										[]dom.Attr{
											dom.Class("material-symbols-outlined text-[20px]"),
										},
										dom.Text("shield"),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-label-md"),
										},
										dom.Text("Security"),
									),
								),
								dom.Button(
									[]dom.Attr{
										dom.Class("tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-secondary hover:bg-surface-container-low"),
										dom.CustomAttr("data-tab", "storage"),
										dom.CustomAttr("onclick", "switchTab('storage')"),
									},
									dom.Span(
										[]dom.Attr{
											dom.Class("material-symbols-outlined text-[20px]"),
										},
										dom.Text("cloud_queue"),
									),
									dom.Span(
										[]dom.Attr{
											dom.Class("text-label-md"),
										},
										dom.Text("Storage"),
									),
								),
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("md:col-span-9"),
								},
								dom.Section(
									[]dom.Attr{
										dom.Class("tab-pane bg-surface-card p-8 rounded-2xl shadow-sm border border-border-subtle animate-in fade-in slide-in-from-bottom-2 duration-300"),
										dom.Id("general-content"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("flex items-center gap-4 mb-8"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"),
											},
											dom.Span(
												[]dom.Attr{
													dom.Class("material-symbols-outlined"),
												},
												dom.Text("tune"),
											),
										),
										dom.Div(
											[]dom.Attr{},
											dom.H3(
												[]dom.Attr{
													dom.Class("font-headline-md text-headline-md"),
												},
												dom.Text("General Configuration"),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("text-label-sm text-text-secondary"),
												},
												dom.Text("Basic platform identity and contact information."),
											),
										),
									),
									dom.Form(
										[]dom.Attr{
											dom.Class("space-y-6"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("grid grid-cols-1 md:grid-cols-2 gap-6"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Site Name"),
												),
												dom.Input(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"),
														dom.Type("text"),
														dom.Value("Connect Modern"),
													},
												),
											),
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Contact Email"),
												),
												dom.Input(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"),
														dom.Type("email"),
														dom.Value("admin@connectmodern.com"),
													},
												),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("space-y-2"),
											},
											dom.Label(
												[]dom.Attr{
													dom.Class("font-label-md text-on-surface-variant block"),
												},
												dom.Text("Platform Description"),
											),
											dom.Textarea(
												[]dom.Attr{
													dom.Class("w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"),
													dom.CustomAttr("rows", "4"),
												},
												dom.Text("The next-generation social ecosystem for professional networking and digital expression."),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("flex items-center justify-between p-5 bg-surface-container-lowest rounded-2xl border border-border-subtle shadow-sm"),
											},
											dom.Div(
												[]dom.Attr{},
												dom.P(
													[]dom.Attr{
														dom.Class("font-label-md text-text-primary"),
													},
													dom.Text("Maintenance Mode"),
												),
												dom.P(
													[]dom.Attr{
														dom.Class("text-label-sm text-text-secondary"),
													},
													dom.Text("Disable public access for scheduled updates."),
												),
											),
											dom.Label(
												[]dom.Attr{
													dom.Class("relative inline-flex items-center cursor-pointer"),
												},
												dom.Input(
													[]dom.Attr{
														dom.Class("sr-only peer"),
														dom.Type("checkbox"),
													},
												),
												dom.Div(
													[]dom.Attr{
														dom.Class("w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"),
													},
												),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("pt-6 flex justify-end gap-4 border-t border-border-subtle"),
											},
											dom.Button(
												[]dom.Attr{
													dom.Class("px-6 py-2.5 rounded-xl text-secondary font-bold hover:bg-surface-container-low transition-colors"),
													dom.Type("button"),
												},
												dom.Text("Discard"),
											),
											dom.Button(
												[]dom.Attr{
													dom.Class("px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:brightness-110 transition-all active:scale-95"),
													dom.Type("button"),
												},
												dom.Text("Save Changes"),
											),
										),
									),
								),
								dom.Section(
									[]dom.Attr{
										dom.Class("tab-pane hidden bg-surface-card p-8 rounded-2xl shadow-sm border border-border-subtle animate-in fade-in slide-in-from-bottom-2 duration-300"),
										dom.Id("security-content"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("flex items-center gap-4 mb-8"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("w-12 h-12 bg-error/10 rounded-2xl flex items-center justify-center text-error"),
											},
											dom.Span(
												[]dom.Attr{
													dom.Class("material-symbols-outlined"),
												},
												dom.Text("shield"),
											),
										),
										dom.Div(
											[]dom.Attr{},
											dom.H3(
												[]dom.Attr{
													dom.Class("font-headline-md text-headline-md"),
												},
												dom.Text("Security & Authentication"),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("text-label-sm text-text-secondary"),
												},
												dom.Text("Configure JWT secrets and session lifecycle parameters."),
											),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("space-y-6"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("space-y-2"),
											},
											dom.Label(
												[]dom.Attr{
													dom.Class("font-label-md text-on-surface-variant block"),
												},
												dom.Text("JWT Secret Key"),
											),
											dom.Div(
												[]dom.Attr{
													dom.Class("flex gap-2"),
												},
												dom.Input(
													[]dom.Attr{
														dom.Class("flex-1 px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all font-mono outline-none"),
														dom.Type("password"),
														dom.Value("••••••••••••••••••••••••••••"),
													},
												),
												dom.Button(
													[]dom.Attr{
														dom.Class("p-2.5 rounded-xl border border-border-subtle hover:bg-surface-container-low transition-colors"),
													},
													dom.Span(
														[]dom.Attr{
															dom.Class("material-symbols-outlined text-[20px]"),
														},
														dom.Text("visibility"),
													),
												),
												dom.Button(
													[]dom.Attr{
														dom.Class("p-2.5 rounded-xl border border-border-subtle hover:bg-surface-container-low transition-colors"),
													},
													dom.Span(
														[]dom.Attr{
															dom.Class("material-symbols-outlined text-[20px]"),
														},
														dom.Text("refresh"),
													),
												),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("text-label-sm text-text-secondary"),
												},
												dom.Text("Changing this will invalidate all active user sessions."),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("grid grid-cols-1 md:grid-cols-2 gap-6"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Session Timeout (Minutes)"),
												),
												dom.Input(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"),
														dom.Type("number"),
														dom.Value("1440"),
													},
												),
											),
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Password Complexity"),
												),
												dom.SelectEl(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"),
													},
													dom.OptionEl(
														[]dom.Attr{},
														dom.Text("Standard (8+ chars)"),
													),
													dom.OptionEl(
														[]dom.Attr{
															dom.CustomAttr("selected", ""),
														},
														dom.Text("Enterprise (Special, Num, Mixed Case)"),
													),
													dom.OptionEl(
														[]dom.Attr{},
														dom.Text("Strict (Biometric Only)"),
													),
												),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("p-5 bg-tertiary-fixed rounded-2xl border border-tertiary-container/10 flex gap-4"),
											},
											dom.Span(
												[]dom.Attr{
													dom.Class("material-symbols-outlined text-tertiary"),
												},
												dom.Text("warning"),
											),
											dom.Div(
												[]dom.Attr{},
												dom.P(
													[]dom.Attr{
														dom.Class("font-label-md text-tertiary"),
													},
													dom.Text("Security Protocol"),
												),
												dom.P(
													[]dom.Attr{
														dom.Class("text-label-sm text-tertiary-container leading-relaxed"),
													},
													dom.Text("Ensure your SSL certificates are updated before changing JWT parameters to prevent man-in-the-middle exploits."),
												),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("pt-6 flex justify-end gap-4 border-t border-border-subtle"),
											},
											dom.Button(
												[]dom.Attr{
													dom.Class("px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:brightness-110 transition-all active:scale-95"),
													dom.Type("button"),
												},
												dom.Text("Update Security"),
											),
										),
									),
								),
								dom.Section(
									[]dom.Attr{
										dom.Class("tab-pane hidden bg-surface-card p-8 rounded-2xl shadow-sm border border-border-subtle animate-in fade-in slide-in-from-bottom-2 duration-300"),
										dom.Id("storage-content"),
									},
									dom.Div(
										[]dom.Attr{
											dom.Class("flex items-center gap-4 mb-8"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center text-success"),
											},
											dom.Span(
												[]dom.Attr{
													dom.Class("material-symbols-outlined"),
												},
												dom.Text("cloud_queue"),
											),
										),
										dom.Div(
											[]dom.Attr{},
											dom.H3(
												[]dom.Attr{
													dom.Class("font-headline-md text-headline-md"),
												},
												dom.Text("Cloud Storage Integration"),
											),
											dom.P(
												[]dom.Attr{
													dom.Class("text-label-sm text-text-secondary"),
												},
												dom.Text("Configure AWS S3 or Cloudinary for media assets."),
											),
										),
									),
									dom.Div(
										[]dom.Attr{
											dom.Class("space-y-6"),
										},
										dom.Div(
											[]dom.Attr{
												dom.Class("flex gap-2 p-1 bg-surface-container-low rounded-xl mb-6"),
											},
											dom.Button(
												[]dom.Attr{
													dom.Class("flex-1 py-2 text-label-md font-bold bg-white shadow-sm rounded-lg text-primary border border-primary/10"),
												},
												dom.Text("AWS S3"),
											),
											dom.Button(
												[]dom.Attr{
													dom.Class("flex-1 py-2 text-label-md font-bold text-secondary hover:bg-white/50 rounded-lg transition-all"),
												},
												dom.Text("Cloudinary"),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("grid grid-cols-1 md:grid-cols-2 gap-6"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Access Key ID"),
												),
												dom.Input(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"),
														dom.Placeholder("AKIA..."),
														dom.Type("text"),
													},
												),
											),
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Secret Access Key"),
												),
												dom.Input(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"),
														dom.Placeholder("••••••••"),
														dom.Type("password"),
													},
												),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("grid grid-cols-1 md:grid-cols-3 gap-6"),
											},
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2 md:col-span-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Bucket Name"),
												),
												dom.Input(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"),
														dom.Type("text"),
														dom.Value("prod-connect-assets"),
													},
												),
											),
											dom.Div(
												[]dom.Attr{
													dom.Class("space-y-2"),
												},
												dom.Label(
													[]dom.Attr{
														dom.Class("font-label-md text-on-surface-variant block"),
													},
													dom.Text("Region"),
												),
												dom.Input(
													[]dom.Attr{
														dom.Class("w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary text-body-md transition-all outline-none"),
														dom.Type("text"),
														dom.Value("us-east-1"),
													},
												),
											),
										),
										dom.Button(
											[]dom.Attr{
												dom.Class("w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-border-subtle hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group"),
											},
											dom.Span(
												[]dom.Attr{
													dom.Class("material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform duration-500"),
												},
												dom.Text("analytics"),
											),
											dom.Span(
												[]dom.Attr{
													dom.Class("font-bold"),
												},
												dom.Text("Test Storage Connection"),
											),
										),
										dom.Div(
											[]dom.Attr{
												dom.Class("pt-6 flex justify-end gap-4 border-t border-border-subtle"),
											},
											dom.Button(
												[]dom.Attr{
													dom.Class("px-8 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:brightness-110 transition-all active:scale-95"),
													dom.Type("button"),
												},
												dom.Text("Save Storage Config"),
											),
										),
									),
								),
							),
						),
						dom.Div(
							[]dom.Attr{
								dom.Class("mt-12 p-8 rounded-2xl bg-surface-container-low border border-border-subtle flex flex-col md:flex-row items-center gap-8 shadow-sm"),
							},
							dom.Div(
								[]dom.Attr{
									dom.Class("w-32 h-32 bg-cover bg-center rounded-2xl shrink-0 shadow-lg"),
									dom.CustomAttr("data-alt", "Abstract connectivity illustration."),
									dom.Style("background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAeHE7jknTJLX9bZBK_3GWJXdR5natCNyPD8Om4d00z6G21TYryWGjVKuvaPMUTjSXr2ZTooabx3mSBWcWZE0YnfwxHxGhAFtwmBi8zyiWJzy7WpbbH15cSslBAGSYfDXC8ifpxBJZVsjsUXUwolHtvozHVOENpGSY6aJXqOcE7jWJH8IsEVG1XwEXNqAL_Fy9Ze1EX5Df0hRYxIO-__f_b-8XlFj0DS5rnKDKlV2Spkznc9THQTS5WsX1pZ4qfYnwjQ-H6zTmsea4')"),
								},
							),
							dom.Div(
								[]dom.Attr{
									dom.Class("flex-1 text-center md:text-left"),
								},
								dom.H4(
									[]dom.Attr{
										dom.Class("font-headline-md text-headline-md text-text-primary mb-2"),
									},
									dom.Text("Need Configuration Help?"),
								),
								dom.P(
									[]dom.Attr{
										dom.Class("text-body-md text-text-secondary leading-relaxed"),
									},
									dom.Text("Refer to our technical documentation for advanced environment variable mappings and multi-tenant setup guides. Our support team is available 24/7 for enterprise integration assistance."),
								),
							),
							dom.A(
								[]dom.Attr{
									dom.Class("px-8 py-3 rounded-xl bg-white border border-border-subtle text-text-primary font-bold hover:bg-surface-container-low transition-all whitespace-nowrap shadow-sm"),
									dom.Href("#"),
								},
								dom.Text("View Documentation"),
							),
						),
					),
	)
	return page.Render(w)
}
