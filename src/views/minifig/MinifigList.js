var m = require("mithril")
var Minfig = require("../../models/minifig/Minifig")


var CellContent = {
    view: function(vnode) {
        if (vnode.attrs.col.element) {
            return m("td", {"data-label": vnode.attrs.name}, vnode.attrs.col.element(vnode.attrs.row))
        } else if (vnode.attrs.col.property) {
            return m("td", {"data-label": vnode.attrs.col.name}, vnode.attrs.col.property.split('.').reduce((o, k) =>  o.hasOwnProperty(k) ? o[k] : "", vnode.attrs.row))
        }
    }
}

var state = {
    list: [],
    cols: [
        {"name": "Figuren-Nr.", "property": "minifig.fig_num"},
        {"name": "Figuren-Name", "property": "minifig.name"},
        {"name": "Anzahl Teile", "property": "minifig.num_parts"},
        {"name": "Häufigkeit pro Set", "property": "quantity"},
        {"name": "Details", "element": (row) => m("div", m(m.route.Link, {selector: "button", class: "mini ui secondary button", href: '/minifig/' + row.fig_id}, "Details"))},
    ],
    renderHeaders: () => m("thead", m("tr", state.cols.map(col => m("th", col.name)))),
    renderBody: () => m("tbody", state.list ? state.list.map(row => m("tr", state.cols.map(col => m(CellContent, {col: col, row: row})))) : ""),
    renderFooter: () => m("tfoot", {class: "full-width"}, m("tr", m("th", {"colspan": state.cols.length}, "Anzahl Minifiguren: " + state.list.length)))
}

var MinifigList =  {
    oninit: (vnode) => vnode.attrs.inventory_id ? Minfig.getMinifigsByInventoryId(vnode.attrs.inventory_id).then(res => state.list = res.objects) : state.list = [],
    view: () => m("table", {class: "ui striped celled table", style: "margin-top: 15px"}, [
        state.renderHeaders(),
        state.renderBody(),
        state.renderFooter()
    ])
}

module.exports = MinifigList