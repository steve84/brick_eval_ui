var m = require("mithril")

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
        if (vnode.attrs.sortable) {
            if (vnode.attrs.col.property === state.getOrderByField().replace("__", ".")) {
                properties["class"] = "sorted " + (state.getOrderByDirection() === "desc" ? "descending" : "ascending")
            }
            properties["onclick"] = (e) => {
                if (state.getOrderByField() === vnode.attrs.col.property.replace(".", "__")) {
                    state.setOrderByDirection(state.getOrderByDirection() === "asc" ? "desc" : "asc")
                } else {
                    state.setOrderByDirection("asc")
                }
                state.setOrderByField(vnode.attrs.col.property.replace(".", "__"))
                state.fn()
            }
        }
        return m("th", properties, vnode.attrs.col.name)
    }
}


var PagingElement = {
    view: function(vnode) {
        return m("div", {class: "ui right floated pagination menu"}, [
            m("a", {class: "icon item", onclick: () => {
                state.setPage(1)
                state.fn()
            }}, m("i", {class: "angle double left icon"})),
            m("a", {class: "icon item", onclick: () => {
                state.setPage(state.getPage() - 1)
                state.fn()
            }}, m("i", {class: "angle left icon"})),
            m("a", {class: "item"}, state.getPage() + " von " + state.getTotalPages()),
            m("a", {class: "icon item", onclick: () => {
                state.setPage(state.getPage() + 1)
                state.fn()
            }}, m("i", {class: "angle right icon"})),
            m("a", {class: "icon item", onclick: () => {
                state.setPage(state.getTotalPages())
                state.fn()
            }}, m("i", {class: "angle double right icon"}))
        ])
    }
}

var state = {
    sortable: false,
    pageable: false,
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
    renderHeaders: () => m("thead", m("tr", state.cols.map(col => m(HeaderContent, {"sortable": state.sortable, "col": col})))),
    renderBody: () => m("tbody", state.getList().map(row => m("tr", state.cols.map(col => m(CellContent, {"col": col, "row": row}))))),
    renderFooter: () => m("tfoot", {class: "full-width"}, m("tr", m("th", {"colspan": state.cols.length}, [
        state.pageable ? m(PagingElement) :  null,
        m("div", {class: "left floated"}, "Anzahl Einträge: " + state.getNumResults())
    ])))
}

var Table =  {
    oninit: (vnode) => {
        state.sortable = vnode.attrs.sortable
        state.pageable = vnode.attrs.pageable
        state.getList = vnode.attrs.getList
        state.getNumResults = vnode.attrs.getNumResults
        state.cols = vnode.attrs.cols
        state.fn = vnode.attrs.fn
        if (state.pageable) {
            state.setPage = vnode.attrs.setPage
            state.getPage = vnode.attrs.getPage
            state.getTotalPages = vnode.attrs.getTotalPages
        }
        if (state.sortable) {
            state.getOrderByField = vnode.attrs.getOrderByField
            state.setOrderByField = vnode.attrs.setOrderByField
            state.getOrderByDirection = vnode.attrs.getOrderByDirection
            state.setOrderByDirection = vnode.attrs.setOrderByDirection
        }
    },
    view: () => [
        m("table", {class: "ui striped sortable celled table", style: "margin-top: 15px"}, [
            state.renderHeaders(),
            state.renderBody(),
            state.renderFooter()
        ])
    ]
}

module.exports = Table