var m = require("mithril")

var Inventory = require("../../models/inventory/Inventory")
var Theme = require("../../models/theme/Theme")
var InventoryPart = require("../../models/inventory_part/InventoryPart")
var Minifig = require("../../models/minifig/Minifig")
var InventoryMinifig = require("../../models/inventory_minifig/InventoryMinifig")

var Table = require("../common/Table")
var MinifigList = require("../minifig/MinifigList")
var InventoryPartList = require("../inventory_part/InventoryPartList")



var PropertyList = {
    view: function(vnode) {
        if (vnode.attrs.data) {
            return m("tbody", vnode.attrs.cols.map(col => m("tr", [
                m("td", {class: "two wide column"},  col.name), 
                m("td", col.fn ? col.fn(vnode.attrs.data) : col.property.split('.').reduce((o, k) => o.hasOwnProperty(k) ? o[k] : "", vnode.attrs.data))
            ])))
        }
    }
}

var ScoreList = {
    view: function(vnode) {
        var cols = [
            {"name": "Bewertung", "property": "score", "fn": (row) => row["score"].toFixed(4)},
            {"name": "Berechnungsdatum", "property": "calc_date"},
        ]
        if (vnode.attrs.scores) {
            return m(Table, {
                "sortable": false,
                "pageable": false,
                "isLoading": () => false,
                "getList": () => vnode.attrs.scores,
                "getNumResults": () => vnode.attrs.scores.length,
                "cols": cols,
            })
        }
    }
}

var ImageElement = {
    view: function(vnode) {
        if (vnode.attrs.data && vnode.attrs.data.set) {
            return [
                m("div", {class: "ui slide masked reveal image" }, [
                    //m("img", {class: "visible content", src: 'https://img.bricklink.com/ItemImage/ON/0/' + Inventory.actualInventory.set.set_num + '.png'}),
                    //m("img", {class: "hidden content", src: 'https://img.bricklink.com/ItemImage/SN/0/' + Inventory.actualInventory.set.set_num + '.png'}),
                ]),
                m("div", {class: "ui slide masked reveal image" }, m("div", {class: "extra content"}, "2 Bilder"))
            ]
        } 
        return []
    }
}


var MinifigDetail =  {
    oninit: (vnode) => {
        vnode.state.cols = [
            {"name": "Figuren-Nr.", "property": "minifig.fig_num"},
            {"name": "Name", "property": "minifig.name"},
            {"name": "Anzahl Teile", "property": "minifig.num_parts"},
            {"name": "Bewertung", "property": "score.score", "fn": data => data["score_id"] ? data["score"]["score"].toFixed(4) : ""},
            {"name": "Berechnungsdatum", "property": "score.calc_date", "fn": data => data["score_id"] ? new Date(data["score"]["calc_date"]).toLocaleDateString() : ""},
        ]
        InventoryMinifig.actualInventoryMinifig = {}
        InventoryMinifig.getInventoryMinifigById(vnode.attrs.key)},
    view: (vnode) => m("div", {class: "ui two column grid"}, [
        m("div", {class: "sixteen wide column"}, m("div", {class: "ui card", style: "width: 100%; margin-top: 15px"}, m("div", {class: "ui definition table"}, m(PropertyList, {"cols": vnode.state.cols, "data": InventoryMinifig.actualInventoryMinifig})))),
        m("div", {class: "sixteen wide column"}, InventoryMinifig.actualInventoryMinifig && InventoryMinifig.actualInventoryMinifig.inventories ? m(InventoryPartList, {"inventory_id": InventoryMinifig.actualInventoryMinifig.inventories.filter(i => i.is_latest)[0].id}) : m("div")),
        m(m.route.Link, {selector: "button", class: "mini ui primary button", href: '/sets'}, "Zurück")
    ])
}

module.exports = MinifigDetail