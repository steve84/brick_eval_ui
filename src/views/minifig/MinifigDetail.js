var m = require("mithril")

var Statistic = require("../../models/statistic/Statistic")
var InventoryMinifig = require("../../models/inventory_minifig/InventoryMinifig")

var Table = require("../common/Table")
var InventoryPartList = require("../inventory_part/InventoryPartList")



var PropertyList = {
    oncreate: () => setTimeout(() => {$('.rating').rating('disable')}, 500),
    view: function(vnode) {
        if (vnode.attrs.data && vnode.attrs.data.minifig) {
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
            {"name": "Bewertung", "property": "score", "sortable": false, "fn": (row) => row["score"].toFixed(4)},
            {"name": "Berechnungsdatum", "property": "calc_date", "sortable": false, "fn": row => row["calc_date"] ? new Date(row["calc_date"]).toLocaleDateString() : ""},
        ]
        if (vnode.attrs.scores) {
            return m(Table, {
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
        vnode.state.backlink = vnode.attrs.backlink
        vnode.state.cols = [
            {"name": "Figuren-Nr.", "property": "minifig.fig_num"},
            {"name": "Name", "property": "minifig.name"},
            {"name": "Anzahl Teile", "property": "minifig.num_parts"},
            {"name": "Exklusiv", "property": "minifig.has_unique_part", "fn": (row) => row["minifig"]["has_unique_part"] ? "Ja" : "Nein"},
            {"name": "Bewertung", "property": null, "fn": data => data && data['score'] ? [m("div", {class: "ui star rating", "data-rating": Statistic.getMinifigScoreQuantil(data["score"]["score"]), "data-max-rating": "4"}), m("span", " (" + data["score"]["score"].toFixed(4) + ")")] : ""},
            {"name": "Berechnungsdatum", "property": "score.calc_date", "fn": data => data["score"] ? new Date(data["score"]["calc_date"]).toLocaleDateString() : ""},
        ]
        InventoryMinifig.actualInventoryMinifig = {}
        InventoryMinifig.getInventoryMinifigById(vnode.attrs.key)},
    view: (vnode) => m("div", {class: "ui two column grid"}, [
        m("div", {class: "sixteen wide column"}, m("div", {class: "ui card", style: "width: 100%; margin-top: 15px"}, m("div", {class: "ui definition table"}, m(PropertyList, {"cols": vnode.state.cols, "data": InventoryMinifig.actualInventoryMinifig})))),
        m("div", {class: "sixteen wide column"}, InventoryMinifig.actualInventoryMinifig && InventoryMinifig.actualInventoryMinifig.inventory_id ? m(InventoryPartList, {"inventory_id": InventoryMinifig.actualInventoryMinifig.inventory_id}) : m("div")),
        m(m.route.Link, {selector: "button", class: "mini ui primary button", href: vnode.state.backlink}, "Zurück")
    ])
}

module.exports = MinifigDetail