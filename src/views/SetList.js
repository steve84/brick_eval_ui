var m = require("mithril")
var Set = require("../models/Set")

var cols = [
    {"name": "Set-Nr.", "property": "set_num"},
    {"name": "Set-Name", "property": "name"},
    {"name": "Anzahl Teile", "property": "num_parts"},
    {"name": "Jahr", "property": "year_of_publication"},
    {"name": "Thema", "property": "theme.name"},
    {"name": "Verkaufspreis", "property": "retail_price"},
    {"name": "EOL", "property": "eol"},
    {"name": "Details", "element": m("button", {class: "mini ui secondary button"}, "Details")},
]

var renderHeaders = (cols) =>
    m("thead", m("tr", cols.map(col => m("th", col.name))))

var renderBody = (sets, cols) =>
    m("tbody", sets.map(row => m("tr", cols.map(col => m("td", {"data-label": col.name}, col.element ? col.element : col.property.split('.').reduce((o, k) => o[k], row))))))

var renderFooter = (page, numHeaders) =>
    m("tfoot", {class: "full-width"}, m("tr", m("th", {"colspan": numHeaders}, [
        m("div", {class: "ui small primary labeled icon button", onclick: () => Set.loadPage(page - 1)}, m("i", {class: "left arrow icon"}), "Prev"),
        m("div", {class: "ui label"}, page),
        m("div", {class: "ui small primary right labeled icon button", onclick: () => Set.loadPage(page + 1)}, m("i", {class: "right arrow icon"}), "Next")
    ])))


module.exports = {
    oninit: Set.loadList,
    view: () => m("table", {class: "ui celled table"}, [
        renderHeaders(cols),
        renderBody(Set.list, cols),
        renderFooter(Set.page, cols.length)
    ])
}