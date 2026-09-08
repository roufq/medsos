package dom

import (
	"fmt"
	"io"
	"strings"
)

type Node interface {
	Render(w io.Writer) error
}

type Element struct {
	Tag      string
	Attrs    []Attr
	Children []Node
}

type Attr struct {
	Key   string
	Value string
}

func (e *Element) Render(w io.Writer) error {
	if len(e.Children) == 0 && isSelfClosing(e.Tag) {
		_, err := fmt.Fprintf(w, "<%s%s />", e.Tag, renderAttrs(e.Attrs))
		return err
	}
	if _, err := fmt.Fprintf(w, "<%s%s>", e.Tag, renderAttrs(e.Attrs)); err != nil {
		return err
	}
	for _, child := range e.Children {
		if child != nil {
			if err := child.Render(w); err != nil {
				return err
			}
		}
	}
	_, err := fmt.Fprintf(w, "</%s>", e.Tag)
	return err
}

type Text string

func (t Text) Render(w io.Writer) error {
	_, err := w.Write([]byte(htmlEscape(string(t))))
	return err
}

type Raw string

func (r Raw) Render(w io.Writer) error {
	_, err := w.Write([]byte(r))
	return err
}

type GroupNode []Node

func (g GroupNode) Render(w io.Writer) error {
	for _, child := range g {
		if child != nil {
			if err := child.Render(w); err != nil {
				return err
			}
		}
	}
	return nil
}

func Group(children ...Node) Node {
	return GroupNode(children)
}

func htmlEscape(s string) string {
	r := strings.NewReplacer(
		"&", "&amp;",
		"<", "&lt;",
		">", "&gt;",
		`"`, "&quot;",
		`'`, "&#39;",
	)
	return r.Replace(s)
}

func isSelfClosing(tag string) bool {
	switch tag {
	case "meta", "link", "input", "img", "br", "hr":
		return true
	}
	return false
}

func renderAttrs(attrs []Attr) string {
	var sb strings.Builder
	for _, attr := range attrs {
		if attr.Value == "" && isBooleanAttr(attr.Key) {
			sb.WriteString(" " + attr.Key)
		} else {
			sb.WriteString(fmt.Sprintf(" %s=\"%s\"", attr.Key, htmlEscape(attr.Value)))
		}
	}
	return sb.String()
}

func isBooleanAttr(key string) bool {
	switch key {
	case "required", "checked", "disabled", "controls", "autofocus", "readonly":
		return true
	}
	return false
}

// Tag constructors
func HTML(attrs []Attr, children ...Node) *Element { return &Element{"html", attrs, children} }
func Head(attrs []Attr, children ...Node) *Element { return &Element{"head", attrs, children} }
func Body(attrs []Attr, children ...Node) *Element { return &Element{"body", attrs, children} }
func Meta(attrs []Attr) *Element                   { return &Element{"meta", attrs, nil} }
func Link(attrs []Attr) *Element                   { return &Element{"link", attrs, nil} }
func Hr(attrs []Attr) *Element                     { return &Element{"hr", attrs, nil} }
func TitleEl(first any, second ...Node) *Element {
	switch v := first.(type) {
	case string:
		return &Element{"title", nil, []Node{Text(v)}}
	case []Attr:
		return &Element{"title", v, second}
	default:
		return &Element{"title", nil, second}
	}
}
func Title(attrs []Attr, children ...Node) *Element { return &Element{"title", attrs, children} }
func StyleEl(attrs []Attr, body ...any) *Element {
	var children []Node
	for _, item := range body {
		switch v := item.(type) {
		case string:
			if v != "" {
				children = append(children, Raw(v))
			}
		case Node:
			children = append(children, v)
		}
	}
	return &Element{"style", attrs, children}
}
func ScriptEl(attrs []Attr, body ...any) *Element {
	var children []Node
	for _, item := range body {
		switch v := item.(type) {
		case string:
			if v != "" {
				children = append(children, Raw(v))
			}
		case Node:
			children = append(children, v)
		}
	}
	return &Element{"script", attrs, children}
}
func Script(attrs []Attr, children ...Node) *Element {
	anyNodes := make([]any, len(children))
	for i, c := range children {
		anyNodes[i] = c
	}
	return ScriptEl(attrs, anyNodes...)
}
func Header(attrs []Attr, children ...Node) *Element   { return &Element{"header", attrs, children} }
func Footer(attrs []Attr, children ...Node) *Element   { return &Element{"footer", attrs, children} }
func Nav(attrs []Attr, children ...Node) *Element      { return &Element{"nav", attrs, children} }
func Aside(attrs []Attr, children ...Node) *Element    { return &Element{"aside", attrs, children} }
func Main(attrs []Attr, children ...Node) *Element     { return &Element{"main", attrs, children} }
func Section(attrs []Attr, children ...Node) *Element  { return &Element{"section", attrs, children} }
func Article(attrs []Attr, children ...Node) *Element  { return &Element{"article", attrs, children} }
func Div(attrs []Attr, children ...Node) *Element      { return &Element{"div", attrs, children} }
func Span(attrs []Attr, children ...Node) *Element     { return &Element{"span", attrs, children} }
func P(attrs []Attr, children ...Node) *Element        { return &Element{"p", attrs, children} }
func H1(attrs []Attr, children ...Node) *Element       { return &Element{"h1", attrs, children} }
func H2(attrs []Attr, children ...Node) *Element       { return &Element{"h2", attrs, children} }
func H3(attrs []Attr, children ...Node) *Element       { return &Element{"h3", attrs, children} }
func H4(attrs []Attr, children ...Node) *Element       { return &Element{"h4", attrs, children} }
func H5(attrs []Attr, children ...Node) *Element       { return &Element{"h5", attrs, children} }
func H6(attrs []Attr, children ...Node) *Element       { return &Element{"h6", attrs, children} }
func A(attrs []Attr, children ...Node) *Element        { return &Element{"a", attrs, children} }
func Button(attrs []Attr, children ...Node) *Element   { return &Element{"button", attrs, children} }
func Input(attrs []Attr) *Element                      { return &Element{"input", attrs, nil} }
func Form(attrs []Attr, children ...Node) *Element     { return &Element{"form", attrs, children} }
func Img(attrs []Attr) *Element                        { return &Element{"img", attrs, nil} }
func Video(attrs []Attr, children ...Node) *Element    { return &Element{"video", attrs, children} }
func SVG(attrs []Attr, children ...Node) *Element      { return &Element{"svg", attrs, children} }
func Path(attrs []Attr) *Element                       { return &Element{"path", attrs, nil} }
func Table(attrs []Attr, children ...Node) *Element    { return &Element{"table", attrs, children} }
func THead(attrs []Attr, children ...Node) *Element    { return &Element{"thead", attrs, children} }
func TBody(attrs []Attr, children ...Node) *Element    { return &Element{"tbody", attrs, children} }
func TR(attrs []Attr, children ...Node) *Element       { return &Element{"tr", attrs, children} }
func TH(attrs []Attr, children ...Node) *Element       { return &Element{"th", attrs, children} }
func TD(attrs []Attr, children ...Node) *Element       { return &Element{"td", attrs, children} }
func Label(attrs []Attr, children ...Node) *Element    { return &Element{"label", attrs, children} }
func OptionEl(attrs []Attr, children ...Node) *Element { return &Element{"option", attrs, children} }
func SelectEl(attrs []Attr, children ...Node) *Element { return &Element{"select", attrs, children} }
func Textarea(attrs []Attr, children ...Node) *Element { return &Element{"textarea", attrs, children} }

// Attribute constructors
func Class(v string) Attr       { return Attr{"class", v} }
func Href(v string) Attr        { return Attr{"href", v} }
func Src(v string) Attr         { return Attr{"src", v} }
func Type(v string) Attr        { return Attr{"type", v} }
func Placeholder(v string) Attr { return Attr{"placeholder", v} }
func Value(v string) Attr       { return Attr{"value", v} }
func Name(v string) Attr        { return Attr{"name", v} }
func Rel(v string) Attr         { return Attr{"rel", v} }
func Style(v string) Attr       { return Attr{"style", v} }
func Lang(v string) Attr        { return Attr{"lang", v} }
func ContentAttr(v string) Attr { return Attr{"content", v} }
func Id(v string) Attr          { return Attr{"id", v} }
func Charset(v string) Attr     { return Attr{"charset", v} }
func Method(v string) Attr      { return Attr{"method", v} }
func Action(v string) Attr      { return Attr{"action", v} }
func Enctype(v string) Attr     { return Attr{"enctype", v} }
func Accept(v string) Attr      { return Attr{"accept", v} }

// Generic Attr constructor for unmapped attributes (e.g. data-*)
func CustomAttr(k, v string) Attr { return Attr{k, v} }

// Boolean Attributes
func Required() Attr { return Attr{"required", ""} }
func Checked() Attr  { return Attr{"checked", ""} }
func Disabled() Attr { return Attr{"disabled", ""} }
func Controls() Attr { return Attr{"controls", ""} }

// Conditional and mapping helpers
func If(cond bool, n Node) Node {
	if cond {
		return n
	}
	return nil
}

func Map[T any](slice []T, fn func(T) Node) Node {
	nodes := make([]Node, 0, len(slice))
	for _, item := range slice {
		node := fn(item)
		if node != nil {
			nodes = append(nodes, node)
		}
	}
	return GroupNode(nodes)
}

// Capitalization and Tag Aliases
func Html(attrs []Attr, children ...Node) *Element   { return HTML(attrs, children...) }
func Svg(attrs []Attr, children ...Node) *Element    { return SVG(attrs, children...) }
func Thead(attrs []Attr, children ...Node) *Element  { return THead(attrs, children...) }
func Tbody(attrs []Attr, children ...Node) *Element  { return TBody(attrs, children...) }
func Option(attrs []Attr, children ...Node) *Element { return OptionEl(attrs, children...) }
func Select(attrs []Attr, children ...Node) *Element { return SelectEl(attrs, children...) }
func Tr(attrs []Attr, children ...Node) *Element     { return TR(attrs, children...) }
func Th(attrs []Attr, children ...Node) *Element     { return TH(attrs, children...) }
func Td(attrs []Attr, children ...Node) *Element     { return TD(attrs, children...) }
