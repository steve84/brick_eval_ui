var m = require("mithril")

var delayTimer;

var CellContent = {
    view: function(vnode) {
        if (vnode.attrs.col.element) {
            return m("td", {"data-label": vnode.attrs.name}, vnode.attrs.col.element(vnode.attrs.row))
        } else if (vnode.attrs.col.property) {
            return m("td", {"data-label": vnode.attrs.col.name}, vnode.attrs.col.fn ? vnode.attrs.col.fn(vnode.attrs.row) : vnode.attrs.col.property.split('.').reduce((o, k) =>  o && o.hasOwnProperty(k)  ? o[k] : "", vnode.attrs.row))
        }
    }
}

var HeaderContent = {
    view: function(vnode) {
        var properties = {}
        if (!vnode.attrs.col.hasOwnProperty("sortable") || !!vnode.attrs.col.sortable) {
            if (vnode.attrs.col.property === vnode.attrs.state.getOrderByField()) {
                properties["class"] = "sorted " + (vnode.attrs.state.getOrderByDirection() === "-" ? "descending" : "ascending")
            }
            properties["onclick"] = (e) => {
                if (vnode.attrs.state.getOrderByField() === vnode.attrs.col.property) {
                    vnode.attrs.state.setOrderByDirection(vnode.attrs.state.getOrderByDirection() === "" ? "-" : "")
                } else {
                    vnode.attrs.state.setOrderByDirection("")
                }
                vnode.attrs.state.setOrderByField(vnode.attrs.col.property)
                vnode.attrs.state.fn()
            }
        }
        return m("th", properties, vnode.attrs.col.name)
    }
}


var HeaderSearchContent = {
    view: function(vnode) {
        var properties = {}
        if (!vnode.attrs.col.searchable) {
            return m("th");
        }
        properties["oninput"] = (e) => {
            clearTimeout(delayTimer);
            delayTimer = setTimeout(() => {
                vnode.attrs.state.searchInput(vnode.attrs.col.property, e.target.value)
                vnode.attrs.state.fn()
            }, 500)
        }
        return m("th", properties, m("div", {"class": "ui icon mini input"}, [
            m("input", {"type": "text", "id": "search_input_" + vnode.attrs.col.property, "size": 10}),
            m("i", {class: "ban link icon", onclick: () => {
                clearTimeout(delayTimer);
                $('#search_input_' + vnode.attrs.col.property)[0].value = ''
                vnode.attrs.state.searchInput(vnode.attrs.col.property, null)
                vnode.attrs.state.fn()
            }})
        ]))
    }
}


var PagingElement = {
    view: function(vnode) {
        return m("div", {class: "ui right floated pagination menu"}, [
            m("a", {class: "icon " + (vnode.attrs.state.getPage() === 1 ? "disabled" : "")  + " item", onclick: () => {
                vnode.attrs.state.setPage(1)
                vnode.attrs.state.fn()
            }}, m("i", {class: "angle double left icon"})),
            m("a", {class: "icon " + (vnode.attrs.state.getPage() === 1 ? "disabled" : "")  + " item", onclick: () => {
                vnode.attrs.state.setPage(vnode.attrs.state.getPage() - 1)
                vnode.attrs.state.fn()
            }}, m("i", {class: "angle left icon"})),
            m("a", {class: "item"}, vnode.attrs.state.getPage() + " von " + vnode.attrs.state.getTotalPages()),
            m("a", {class: "icon " + (vnode.attrs.state.getPage() === vnode.attrs.state.getTotalPages() ? "disabled" : "")  + " item", onclick: () => {
                vnode.attrs.state.setPage(vnode.attrs.state.getPage() + 1)
                vnode.attrs.state.fn()
            }}, m("i", {class: "angle right icon"})),
            m("a", {class:  "icon " + (vnode.attrs.state.getPage() === vnode.attrs.state.getTotalPages() ? "disabled" : "")  + " item", onclick: () => {
                vnode.attrs.state.setPage(vnode.attrs.state.getTotalPages())
                vnode.attrs.state.fn()
            }}, m("i", {class: "angle double right icon"}))
        ])
    }
}

var Table = {
    oninit: (vnode) => {
        vnode.state.pageable = vnode.attrs.pageable
        vnode.state.searchable = vnode.attrs.searchable
        vnode.state.isLoading = vnode.attrs.isLoading
        vnode.state.getList = vnode.attrs.getList
        vnode.state.searchInput = vnode.attrs.searchInput
        vnode.state.getNumResults = vnode.attrs.getNumResults
        vnode.state.cols = vnode.attrs.cols
        vnode.state.fn = vnode.attrs.fn
        vnode.state.rowStyle = vnode.attrs.rowStyle
        if (vnode.state.pageable) {
            vnode.state.setPage = vnode.attrs.setPage
            vnode.state.getPage = vnode.attrs.getPage
            vnode.state.getTotalPages = vnode.attrs.getTotalPages
        }
        if (!!vnode.state.cols.find(c => !c.hasOwnProperty("sortable") || c.sortable)) {
            vnode.state.getOrderByField = vnode.attrs.getOrderByField
            vnode.state.setOrderByField = vnode.attrs.setOrderByField
            vnode.state.getOrderByDirection = vnode.attrs.getOrderByDirection
            vnode.state.setOrderByDirection = vnode.attrs.setOrderByDirection
        }
    },
    pageable: false,
    searchable: false,
    isLoading: () => true,
    getList: () => {},
    searchInput: (col, value) => {},
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
    renderHeaders: (vnode) => m("thead", [m("tr", vnode.state.cols.map(col => m(HeaderContent, {"col": col, "state": vnode.state}))), vnode.state.searchable ? m("tr", vnode.state.cols.map(col => m(HeaderSearchContent, {"col": col, "state": vnode.state}))) : null]),
    renderBody: (vnode) => m("tbody", vnode.state.getList().map(row => m("tr", vnode.state.rowStyle ? vnode.state.rowStyle(row.attributes) : {}, vnode.state.cols.map(col => m(CellContent, {"col": col, "row": row.attributes}))))),
    renderFooter: (vnode) => m("tfoot", {class: "full-width"}, m("tr", m("th", {"colspan": vnode.state.cols.length}, [
        vnode.state.pageable ? m(PagingElement, {"state": vnode.state}) :  null,
        m("div", {class: "left floated"}, "Anzahl Einträge: " + vnode.state.getNumResults())
    ]))),
    view: (vnode) => [
        m("div", {class: "ui segment", style: "border: none; box-shadow: none; padding: unset"}, [
            m("div", {class: "ui " + (vnode.state.isLoading() ? "active" : "disabled") + " dimmer"}, m("div", {class: "ui " + (vnode.state.isLoading() ? "" : "disabled") + " text loader"}, "Lädt...")),
            m("table", {class: (!!vnode.state.cols.find(c => !c.hasOwnProperty("sortable") || c.sortable)) ? "ui striped sortable celled table" : "ui striped celled table"}, [
                vnode.state.renderHeaders(vnode),
                vnode.state.renderBody(vnode),
                vnode.state.renderFooter(vnode)
            ])])
    ],
}

module.exports = Table