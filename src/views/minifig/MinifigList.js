var m = require("mithril")
var Minifig = require("../../models/minifig/Minifig")

var Table = require("../common/Table")

var state = {
    cols: [
        {"name": "Figuren-Nr.", "property": "minifig.fig_num"},
        {"name": "Figuren-Name", "property": "minifig.name"},
        {"name": "Anzahl Teile", "property": "minifig.num_parts"},
        {"name": "Häufigkeit pro Set", "property": "quantity"},
        {"name": "Details", "element": (row) => m("div", m(m.route.Link, {selector: "button", class: "mini ui secondary button", href: '/minifig/' + row.fig_id}, "Details"))},
    ],
    inventory_id: null
}

var MinifigList =  {
    oninit: (vnode) => {
        if (vnode.attrs.inventory && vnode.attrs.inventory.id) {
            state.inventory_id = vnode.attrs.inventory.id
            Minifig.getMinifigsByInventoryId(state.inventory_id)
        }
    },
    view: () => m(Table, {
        "sortable": true,
        "pageable": true,
        "isLoading": () => Minifig.loading,
        "getList": () => Minifig.list,
        "getNumResults": () => Minifig.numResults,
        "fn": () => Minifig.getMinifigsByInventoryId(state.inventory_id),
        "cols": state.cols,
        "setPage": (page) => Minifig.page = page,
        "getPage": () => Minifig.page,
        "getTotalPages": () => Minifig.totalPages,
        "getOrderByField": () => Minifig.orderByField,
        "setOrderByField": (field) => Minifig.orderByField = field,
        "getOrderByDirection": () => Minifig.orderByDirection,
        "setOrderByDirection": (direction) => Minifig.orderByDirection = direction
    })
}

module.exports = MinifigList