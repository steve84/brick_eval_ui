var m = require("mithril")
var Set = require("../../models/set/Set")

var SetSearchForm = require("./SetSearchForm")


var CellContent = {
    view: function(vnode) {
        if (vnode.attrs.col.element) {
            return m("td", {"data-label": vnode.attrs.name}, vnode.attrs.col.element(vnode.attrs.row))
        } else if (vnode.attrs.col.property) {
            return m("td", {"data-label": vnode.attrs.col.name}, vnode.attrs.col.property.split('.').reduce((o, k) =>  o.hasOwnProperty(k) ? o[k] : "", vnode.attrs.row))
        }
    }
}

var HeaderContent = {
    view: function(vnode) {
        var properties = {}
        if (vnode.attrs.col.property === Set.orderByField.replace("__", ".")) {
            properties["class"] = "sorted " + (Set.orderByDirection === "desc" ? "descending" : "ascending")
        }
        properties["onclick"] = (e) => {
            if (Set.orderByField === vnode.attrs.col.property.replace(".", "__")) {
                Set.orderByDirection = Set.orderByDirection === "asc" ? "desc" : "asc"
            } else {
                Set.orderByDirection = "asc"
            }
            Set.orderByField = vnode.attrs.col.property.replace(".", "__")
            Set.getSets()
        }
        return m("th", properties, vnode.attrs.col.name)
    }
}

var state = {
    cols: [
        {"name": "Set-Nr.", "property": "set_num"},
        {"name": "Set-Name", "property": "name"},
        {"name": "Anzahl Teile", "property": "num_parts"},
        {"name": "Jahr", "property": "year_of_publication"},
        {"name": "Thema", "property": "theme.name"},
        {"name": "Verkaufspreis", "property": "retail_price"},
        {"name": "EOL", "property": "eol"},
        {"name": "Details", "element": (row) => m("div", m(m.route.Link, {selector: "button", class: "mini ui secondary button", href: '/set/' + row.id}, "Details"))},
    ],
    renderHeaders: () => m("thead", m("tr", state.cols.map(col => m(HeaderContent, {col: col})))),
    renderBody: () => m("tbody", Set.list.map(row => m("tr", state.cols.map(col => m(CellContent, {col: col, row: row}))))),
    renderFooter: () => m("tfoot", {class: "full-width"}, m("tr", m("th", {"colspan": state.cols.length}, [
        m("div", {class: "ui small primary labeled icon button", onclick: () => {
            Set.page--
            Set.getSets()
        }}, m("i", {class: "left arrow icon"}), "Prev"),
        m("div", {class: "ui label"}, Set.page),
        m("div", {class: "ui small primary right labeled icon button", onclick: () => {
            Set.page++
            Set.getSets()
        }}, m("i", {class: "right arrow icon"}), "Next")
    ])))
}

var SetList =  {
    oninit: Set.getSets,
    view: () => [
        m(SetSearchForm),
        m("div", Set.numResults + " Resultat(e) gefunden"),
        m("table", {class: "ui striped sortable celled table", style: "margin-top: 15px"}, [
            state.renderHeaders(),
            state.renderBody(),
            state.renderFooter()
        ])
    ]
}

module.exports = SetList