var m = require("mithril")
var InventoryPart = require("../../models/inventory_part/InventoryPart")
var ColorUtil = require("../../utils/ColorUtil")

var Table = require("../common/Table")


var state = {
    cols: [
        {"name": "Name", "property": "part.name"},
        {"name": "Teil-Nr.", "property": "part.part_num"},
        {"name": "Material", "property": "part.part_material"},
        {"name": "Ersatzteil", "property": "is_spare", "fn": val => val ? "Ja" : "Nein"},
        {"name": "Farbe", "property": "color.name"},
        {"name": "Transparent", "property": "color.is_trans", "fn": val => val ? "Ja" : "Nein"},
        {"name": "Anzahl", "property": "quantity"},
        {"name": "Häufigkeit", "property": "part_color_frequency", "fn": val => val.length === 1 ? val[0]["total_amount"] : ""},
    ],
    inventory_id: null
}

var InventoryPartList =  {
    oninit: (vnode) => {
        if (vnode.attrs.inventory && vnode.attrs.inventory.id) {
            state.inventory_id = vnode.attrs.inventory.id
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
                rgb = ["color", "rgb"].reduce((o, k) =>  o.hasOwnProperty(k) ? o[k] : "", row)
                return {style: "background: #" + rgb + "; color: " + ColorUtil.calculateFontColor(rgb)}
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