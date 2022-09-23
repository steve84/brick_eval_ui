var m = require("mithril")

var MiscUtil = require("../../utils/MiscUtil")

var Inventory = require("../../models/inventory/Inventory")
var Theme = require("../../models/theme/Theme")
var InventoryPart = require("../../models/inventory_part/InventoryPart")
var InventoryMinifig = require("../../models/inventory_minifig/InventoryMinifig")

var Table = require("../common/Table")
var MinifigList = require("../minifig/MinifigList")
var InventoryPartList = require("../inventory_part/InventoryPartList")
var StatisticOverview = require("../statistic/StatisticOverview")
var SetPriceList = require("./SetPriceList")
var SetPriceChart = require("./SetPriceChart")



var PropertyList = {
    view: function(vnode) {
        if (MiscUtil.hasPropertyPath(vnode, "attrs.data.attributes.set")) {
            return m("tbody", vnode.attrs.cols.map(col => m("tr", [
                m("td", {class: "two wide column"},  col.name), 
                m("td", col.fn ? col.fn(vnode.attrs.data.attributes.set[col.property]) : col.property.split('.').reduce((o, k) => o.hasOwnProperty(k) ? o[k] : "", vnode.attrs.data.attributes.set))
            ])))
        }
    }
}

var ScoreList = {
    view: function(vnode) {
        var cols = [
            {"name": "Bewertung", "property": "score", "sortable": false, "fn": row => row["score"].toFixed(4)},
            {"name": "Berechnungsdatum", "property": "calc_date", "sortable": false, "fn": row => row["calc_date"] ? new Date(row["calc_date"]).toLocaleDateString() : ""},
        ]
        if (vnode.attrs.scores) {
            return m(Table, {
                "pageable": false,
                "isLoading": () => false,
                "getList": () => vnode.attrs.scores.map(e => ({attributes: e})),
                "getNumResults": () => vnode.attrs.scores.length,
                "cols": cols,
            })
        }
    }
}

var ScoreChart = {
    oncreate: vnode => {
        ctx = $('#scoreChart')
        if (!!ctx && ctx.length === 1) {
            new Chart(ctx, {
                type: "line",
                data: {
                    labels: vnode.attrs.scores.sort((a, b) => new Date(a.calc_date) - new Date(b.calc_date)).map(p => new Date(p.calc_date).toLocaleDateString()),
                    datasets: [{
                        label: "Score",
                        data: vnode.attrs.scores.sort((a, b) => new Date(a.calc_date) - new Date(b.calc_date)).map(p => p.score)
                    }]
                }
            })
        }
    },
    view: () => {
        return m("canvas", {
            id: "scoreChart"
        })
    }
}

var ImageElement = {
    view: function(vnode) {
        if (MiscUtil.hasPropertyPath(vnode, "attrs.data.set")) {
            return [
                m("div", {class: "ui slide masked reveal image" }, [
                    m("img", {class: "visible content", src: 'https://img.bricklink.com/ItemImage/ON/0/' + vnode.attrs.data.set.set_num + '.png'}),
                    m("img", {class: "hidden content", src: 'https://img.bricklink.com/ItemImage/SN/0/' + vnode.attrs.data.set.set_num + '.png'}),
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
            {"name": "Mit Stickern", "property": "has_stickers", "fn": row => row.has_stickers ? "Ja" : "Nein"},
            {"name": "Thema", "property": "theme_id", "fn": id => Theme.lookup.hasOwnProperty(id) ? Theme.lookup[id].fullName.replaceAll(";", " / ") : ""},
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
        m("div", {class: "three wide computer sixteen wide tablet column"}, MiscUtil.hasPropertyPath(Inventory, "actualInventory.id") ? m(StatisticOverview, {"inventory": Inventory.actualInventory, "is_minifig": false}) : m("div")),
        m("div", {class: "five wide computer sixteen wide tablet column"}, m("div", {class: "ui card", style: "width: 100%; margin-top: 15px"}, m(ImageElement, {"data": Inventory.actualInventory && Inventory.actualInventory.attributes ? Inventory.actualInventory.attributes : {}}))),
        m("div", {class: "sixteen wide computer sixteen wide tablet column"}, MiscUtil.hasPropertyPath(Inventory, "actualInventory.id") ? m(MinifigList, {"inventory": Inventory.actualInventory}) : m("div")),
        m("div", {class: "eight wide computer eight wide tablet column"}, MiscUtil.hasPropertyPath(Inventory, "actualInventory.attributes.set.id") ? m(SetPriceList, {"set_id": Inventory.actualInventory.attributes.set.id}) : m("div")),
        m("div", {class: "eight wide computer eight wide tablet column"}, MiscUtil.hasPropertyPath(Inventory, "actualInventory.attributes.set.id") ? m(SetPriceChart, {"set_id": Inventory.actualInventory.attributes.set.id}) : m("div")),
        m("div", {class: "eight wide computer eight wide tablet column"}, MiscUtil.hasPropertyPath(Inventory, "actualInventory.attributes.scores") ? m(ScoreList, {"scores": Inventory.actualInventory.attributes.scores}) : m("div")),
        m("div", {class: "eight wide computer eight wide tablet column"}, MiscUtil.hasPropertyPath(Inventory, "actualInventory.attributes.scores") ? m(ScoreChart, {"scores": Inventory.actualInventory.attributes.scores}) : m("div")),
        m("div", {class: "sixteen wide column"}, MiscUtil.hasPropertyPath(Inventory, "actualInventory.id") ? m(InventoryPartList, {"inventory_id": Inventory.actualInventory.id}) : m("div")),
        m(m.route.Link, {selector: "button", class: "mini ui primary button", href: '/sets'}, "Zurück")
    ]),
}

module.exports = SetDetail