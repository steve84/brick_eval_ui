var m = require("mithril")
var Inventory = require("../../models/inventory/Inventory")
var Theme = require("../../models/theme/Theme")

var Table = require("../common/Table")
var MinifigList = require("../minifig/MinifigList")
var InventoryPartList = require("../inventory_part/InventoryPartList")



var PropertyList = {
    view: function(vnode) {
        if (vnode.attrs.data && vnode.attrs.data.set) {
            return m("tbody", SetDetail.cols.map(col => m("tr", [
                m("td", {class: "two wide column"},  col.name), 
                m("td", col.fn ? col.fn(vnode.attrs.data.set[col.property]) : col.property.split('.').reduce((o, k) => o.hasOwnProperty(k) ? o[k] : "", vnode.attrs.data.set))
            ])))
        }
    }
}

var ScoreList = {
    view: function(vnode) {
        var cols = [
            {"name": "Bewertung", "property": "score", "fn": (val) => val.toFixed(4)},
            {"name": "Berechnungsdatum", "property": "calc_date"},
        ]
        if (vnode.attrs.scores) {
            scoreTable = Object.assign({}, Table)
            return m(scoreTable, {
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
        if (Theme.dropdownList.length == 0) {
            Theme.getThemeHierarchy()
        }
        Inventory.actualInventory = {};
        Inventory.getInventoryBySetId(vnode.attrs.key)},
    view: () => m("div", {class: "ui two column grid"}, [
        m("div", {class: "twelve wide column"}, m("div", {class: "ui card", style: "width: 100%; margin-top: 15px"}, m("div", {class: "ui definition table"}, m(PropertyList, {"data": Inventory.actualInventory})))),
        m("div", {class: "four wide column"}, m("div", {class: "ui card", style: "width: 100%; margin-top: 15px"}, m(ImageElement, {"data": Inventory.actualInventory}))),
        m("div", {class: "sixteen wide column"}, Inventory.actualInventory && Inventory.actualInventory.id ? m(MinifigList, {"inventory": Inventory.actualInventory}) : m("div")),
        m("div", {class: "sixteen wide column"}, m(ScoreList, {"scores": Inventory.actualInventory.scores})),
        m("div", {class: "sixteen wide column"}, Inventory.actualInventory && Inventory.actualInventory.id ? m(InventoryPartList, {"inventory": Inventory.actualInventory}) : m("div")),
        m(m.route.Link, {selector: "button", class: "mini ui primary button", href: '/sets'}, "Zurück")
    ]),
    cols: [
        {"name": "Set-Nr.", "property": "set_num"},
        {"name": "Set-Name", "property": "name"},
        {"name": "Anzahl Teile", "property": "num_parts"},
        {"name": "Jahr", "property": "year_of_publication"},
        {"name": "Thema", "property": "theme_id", "fn": (id) => Theme.lookup.hasOwnProperty(id) ? Theme.lookup[id].fullName.replaceAll(";", " / ") : ""},
        {"name": "Verkaufspreis", "property": "retail_price", "fn": val => val ? (val / 100).toFixed(2) : ""},
        {"name": "EOL", "property": "eol"},
    ]
}

module.exports = SetDetail