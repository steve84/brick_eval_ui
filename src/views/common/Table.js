var m = require("mithril")

var CellContent = {
    view: function(vnode) {
        if (vnode.attrs.col.element) {
            return m("td", {"data-label": vnode.attrs.name}, vnode.attrs.col.element(vnode.attrs.row))
        } else if (vnode.attrs.col.property) {
            return m("td", {"data-label": vnode.attrs.col.name}, vnode.attrs.col.fn ? vnode.attrs.col.fn(vnode.attrs.row[vnode.attrs.col.property]) : vnode.attrs.col.property.split('.').reduce((o, k) =>  o.hasOwnProperty(k) ? o[k] : "", vnode.attrs.row))
        }
    }
}

var HeaderContent = {
    view: function(vnode) {
        var properties = {}
        if (vnode.attrs.sortable) {
            if (vnode.attrs.col.property === vnode.attrs.state.getOrderByField().replace("__", ".")) {
                properties["class"] = "sorted " + (vnode.attrs.state.getOrderByDirection() === "desc" ? "descending" : "ascending")
            }
            properties["onclick"] = (e) => {
                if (vnode.attrs.state.getOrderByField() === vnode.attrs.col.property.replace(".", "__")) {
                    vnode.attrs.state.setOrderByDirection(vnode.attrs.state.getOrderByDirection() === "asc" ? "desc" : "asc")
                } else {
                    vnode.attrs.state.setOrderByDirection("asc")
                }
                vnode.attrs.state.setOrderByField(vnode.attrs.col.property.replace(".", "__"))
                vnode.attrs.state.fn()
            }
        }
        return m("th", properties, vnode.attrs.col.name)
    }
}


var PagingElement = {
    view: function(vnode) {
        return m("div", {class: "ui right floated pagination menu"}, [
            m("a", {class: "icon item", onclick: () => {
                vnode.attrs.state.setPage(1)
                vnode.attrs.state.fn()
            }}, m("i", {class: "angle double left icon"})),
            m("a", {class: "icon item", onclick: () => {
                vnode.attrs.state.setPage(vnode.attrs.state.getPage() - 1)
                vnode.attrs.state.fn()
            }}, m("i", {class: "angle left icon"})),
            m("a", {class: "item"}, vnode.attrs.state.getPage() + " von " + vnode.attrs.state.getTotalPages()),
            m("a", {class: "icon item", onclick: () => {
                vnode.attrs.state.setPage(vnode.attrs.state.getPage() + 1)
                vnode.attrs.state.fn()
            }}, m("i", {class: "angle right icon"})),
            m("a", {class: "icon item", onclick: () => {
                vnode.attrs.state.setPage(vnode.attrs.state.getTotalPages())
                vnode.attrs.state.fn()
            }}, m("i", {class: "angle double right icon"}))
        ])
    }
}

var Table =  {
    oninit: (vnode) => {
        vnode.state.sortable = vnode.attrs.sortable
        vnode.state.pageable = vnode.attrs.pageable
        vnode.state.isLoading = vnode.attrs.isLoading
        vnode.state.getList = vnode.attrs.getList
        vnode.state.getNumResults = vnode.attrs.getNumResults
        vnode.state.cols = vnode.attrs.cols
        vnode.state.fn = vnode.attrs.fn
        vnode.state.rowStyle = vnode.attrs.rowStyle
        if (vnode.state.pageable) {
            vnode.state.setPage = vnode.attrs.setPage
            vnode.state.getPage = vnode.attrs.getPage
            vnode.state.getTotalPages = vnode.attrs.getTotalPages
        }
        if (vnode.state.sortable) {
            vnode.state.getOrderByField = vnode.attrs.getOrderByField
            vnode.state.setOrderByField = vnode.attrs.setOrderByField
            vnode.state.getOrderByDirection = vnode.attrs.getOrderByDirection
            vnode.state.setOrderByDirection = vnode.attrs.setOrderByDirection
        }
    },
    sortable: false,
    pageable: false,
    isLoading: () => true,
    getList: () => {},
    cols: [],
    setPage: () => {},
    getPage: () => {},
    getTotalPages: () => {},
    getOrderByField: () => {},
    setOrderByField: () => {},
    getOrderByDirection: () => {},
    setOrderByDirection: () => {},
    getNumResults: () => {},
    fn: () => {},
    rowStyle: () => {},
    renderHeaders: (vnode) => m("thead", m("tr", vnode.state.cols.map(col => m(HeaderContent, {"sortable": vnode.state.sortable, "col": col, "state": vnode.state})))),
    renderBody: (vnode) => m("tbody", vnode.state.getList().map(row => m("tr", vnode.state.rowStyle ? vnode.state.rowStyle(row) : {}, vnode.state.cols.map(col => m(CellContent, {"col": col, "row": row}))))),
    renderFooter: (vnode) => m("tfoot", {class: "full-width"}, m("tr", m("th", {"colspan": vnode.state.cols.length}, [
        vnode.state.pageable ? m(PagingElement, {"state": vnode.state}) :  null,
        m("div", {class: "left floated"}, "Anzahl Einträge: " + vnode.state.getNumResults())
    ]))),
    view: (vnode) => [
        m("div", {class: "ui segment", style: "border: none; box-shadow: none; padding: unset"}, [
            m("div", {class: "ui " + (vnode.state.isLoading() ? "active" : "disabled") + " dimmer"}, m("div", {class: "ui " + (vnode.state.isLoading() ? "" : "disabled") + " text loader"}, "Lädt...")),
            m("table", {class: "ui striped sortable celled table"}, [
                vnode.state.renderHeaders(vnode),
                vnode.state.renderBody(vnode),
                vnode.state.renderFooter(vnode)
            ])])
    ],
}

module.exports = Table