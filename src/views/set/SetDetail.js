var m = require("mithril")

var Inventory = require("../../models/inventory/Inventory")
var Theme = require("../../models/theme/Theme")
var InventoryPart = require("../../models/inventory_part/InventoryPart")
var InventoryMinifig = require("../../models/inventory_minifig/InventoryMinifig")

var Table = require("../common/Table")
var MinifigList = require("../minifig/MinifigList")
var InventoryPartList = require("../inventory_part/InventoryPartList")
var StatisticOverview = require("../statistic/StatisticOverview")



var PropertyList = {
    view: function(vnode) {
        if (vnode.attrs.data && vnode.attrs.data.set) {
            return m("tbody", vnode.attrs.cols.map(col => m("tr", [
                m("td", {class: "two wide column"},  col.name), 
                m("td", col.fn ? col.fn(vnode.attrs.data.set[col.property]) : col.property.split('.').reduce((o, k) => o.hasOwnProperty(k) ? o[k] : "", vnode.attrs.data.set))
            ])))
        }
    }
}

var ScoreList = {
    view: function(vnode) {
        var cols = [
            {"name": "Bewertung", "property": "score", "fn": row => row["score"].toFixed(4)},
            {"name": "Berechnungsdatum", "property": "calc_date", "fn": row => row["calc_date"] ? new Date(row["calc_date"]).toLocaleDateString() : ""},
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
                    m("img", {class: "visible content", src: 'https://img.bricklink.com/ItemImage/ON/0/' + Inventory.actualInventory.set.set_num + '.png'}),
                    m("img", {class: "hidden content", src: 'https://img.bricklink.com/ItemImage/SN/0/' + Inventory.actualInventory.set.set_num + '.png'}),
                ]),
                m("div", {class: "ui slide masked reveal image" }, m("div", {class: "extra content"}, "2 Bilder"))
            ]
        } 
        return []
    }
}

var SetDetail =  {
    oninit: (vnode) => {
        vnode.state.cols = [
            {"name": "Set-Nr.", "property": "set_num"},
            {"name": "Set-Name", "property": "name"},
            {"name": "Anzahl Teile", "property": "num_parts"},
            {"name": "Jahr", "property": "year_of_publication"},
            {"name": "Thema", "property": "theme_id", "fn": (id) => Theme.lookup.hasOwnProperty(id) ? Theme.lookup[id].fullName.replaceAll(";", " / ") : ""},
            {"name": "Verkaufspreis", "property": "retail_price", "fn": val => val ? (val / 100).toFixed(2) : ""},
            {"name": "EOL", "property": "eol"},
        ]
        if (Theme.dropdownList.length == 0) {
            Theme.getThemeHierarchy()
        }
        Inventory.actualInventory = {};
        Inventory.getInventoryBySetId(vnode.attrs.key)},
    onremove: () => {InventoryPart.page = 1; InventoryMinifig.page = 1},
    view: (vnode) => m("div", {class: "ui centered grid"}, [
        m("div", {class: "eight wide computer sixteen wide tablet column"}, m("div", {class: "ui card", style: "width: 100%; margin-top: 15px"}, m("div", {class: "ui definition table"}, m(PropertyList, {"cols": vnode.state.cols, "data": Inventory.actualInventory})))),
        m("div", {class: "three wide computer sixteen wide tablet column"},  Inventory.actualInventory && Inventory.actualInventory.set ? m(StatisticOverview, {"inventory": Inventory.actualInventory, "is_minifig": false}) : m("div")),
        m("div", {class: "five wide computer sixteen wide tablet column"}, m("div", {class: "ui card", style: "width: 100%; margin-top: 15px"}, m(ImageElement, {"data": Inventory.actualInventory}))),
        m("div", {class: "sixteen wide column"}, Inventory.actualInventory && Inventory.actualInventory.id ? m(MinifigList, {"inventory": Inventory.actualInventory}) : m("div")),
        m("div", {class: "sixteen wide column"}, m(ScoreList, {"scores": Inventory.actualInventory.scores})),
        m("div", {class: "sixteen wide column"}, Inventory.actualInventory && Inventory.actualInventory.id ? m(InventoryPartList, {"inventory_id": Inventory.actualInventory.id}) : m("div")),
        m(m.route.Link, {selector: "button", class: "mini ui primary button", href: '/sets'}, "Zurück")
    ]),
}

module.exports = SetDetail