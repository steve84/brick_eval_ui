var m = require("mithril")
var InventoryMinifig = require("../../models/inventory_minifig/InventoryMinifig")

var Table = require("../common/Table")

var MinifigList =  {
    oninit: (vnode) => {
        vnode.state.cols = [
            {"name": "Figuren-Nr.", "property": "minifig.fig_num"},
            {"name": "Figuren-Name", "property": "minifig.name"},
            {"name": "Ersterscheinung", "property": "minifig.year_of_publication"},
            {"name": "Exklusiv", "property": "minifig.has_unique_part", "fn": (row) => row["minifig"]["has_unique_part"] ? "Ja" : "Nein"},
            {"name": "Anzahl Teile", "property": "minifig.num_parts"},
            {"name": "Häufigkeit pro Set", "property": "quantity"},
            {"name": "Bewertung", "property": "score.score", "fn": (row) => row["score"] ? row["score"]["score"].toFixed(4) : ""},
            {"name": "Details", "element": (row) => m("div", m(m.route.Link, {
                selector: "button",
                class: "mini ui secondary button",
                href: '/minifig/' + row.id,
                options: {
                    state: {backlink: m.route.get()}
                }
            }, "Details"))},
        ]
        if (vnode.attrs.inventory && vnode.attrs.inventory.id) {
            vnode.state.inventory_id = vnode.attrs.inventory.id
            InventoryMinifig.getMinifigsByInventoryId(vnode.state.inventory_id)
        }
    },
    view: (vnode) => m(Table, {
        "sortable": true,
        "pageable": true,
        "isLoading": () => InventoryMinifig.loading,
        "getList": () => InventoryMinifig.list,
        "getNumResults": () => InventoryMinifig.numResults,
        "fn": () => InventoryMinifig.getMinifigsByInventoryId(vnode.state.inventory_id),
        "cols": vnode.state.cols,
        "setPage": (page) => InventoryMinifig.page = page,
        "getPage": () => InventoryMinifig.page,
        "getTotalPages": () => InventoryMinifig.totalPages,
        "getOrderByField": () => InventoryMinifig.orderByField,
        "setOrderByField": (field) => InventoryMinifig.orderByField = field,
        "getOrderByDirection": () => InventoryMinifig.orderByDirection,
        "setOrderByDirection": (direction) => InventoryMinifig.orderByDirection = direction
    })
}

module.exports = MinifigList