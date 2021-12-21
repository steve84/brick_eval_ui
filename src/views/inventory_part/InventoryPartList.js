var m = require("mithril")
var InventoryPart = require("../../models/inventory_part/InventoryPart")
var ColorUtil = require("../../utils/ColorUtil")

var Table = require("../common/Table")


var state = {
    cols: [
        {"name": "Bild", "property": "element_id", "fn": row => m("div", row["element_id"] ? m("img", {class: "ui rounded image", src: "https://cdn.rebrickable.com/media/thumbs/parts/elements/" + row["element_id"] + ".jpg/75x75p.jpg"}) : m("span"))},
        {"name": "Name", "property": "name"},
        {"name": "Teil-Nr.", "property": "part_num"},
        {"name": "Material", "property": "part_material"},
        {"name": "Ersatzteil", "property": "is_spare", "fn": row => row["is_spare"] ? "Ja" : "Nein"},
        {"name": "Farbe", "property": "color_name"},
        {"name": "Transparent", "property": "is_trans", "fn": row => row["is_trans"] ? "Ja" : "Nein"},
        {"name": "Anzahl", "property": "quantity"},
        {"name": "Häufigkeit", "property": "total_amount"},
        {"name": "Element-ID", "property": "element_id"}
    ],
    inventory_id: null
}

var InventoryPartList =  {
    oninit: (vnode) => {
        if (vnode.attrs.inventory_id) {
            state.inventory_id = vnode.attrs.inventory_id
            InventoryPart.getInventoryPartsByInventoryId(state.inventory_id)
        }
    },
    view: () => [
        m(Table, {
            "sortable": true,
            "pageable": true,
            "isLoading": () => InventoryPart.loading,
            "getList": () => InventoryPart.list,
            "fn": () => InventoryPart.getInventoryPartsByInventoryId(state.inventory_id),
            "rowStyle": (row) => {
                return {style: "background: #" + row.rgb + "; color: " + ColorUtil.calculateFontColor(row.rgb)}
            },
            "cols": state.cols,
            "getNumResults": () => InventoryPart.numResults,
            "setPage": (page) => InventoryPart.page = page,
            "getPage": () => InventoryPart.page,
            "getTotalPages": () => InventoryPart.totalPages,
            "getOrderByField": () => InventoryPart.orderByField,
            "setOrderByField": (field) => InventoryPart.orderByField = field,
            "getOrderByDirection": () => InventoryPart.orderByDirection,
            "setOrderByDirection": (direction) => InventoryPart.orderByDirection = direction
        })
    ]
}

module.exports = InventoryPartList