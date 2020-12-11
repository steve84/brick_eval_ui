var m = require("mithril")
var Set = require("../../models/set/Set")

var MinifigList = require("../../views/minifig/MinifigList")


var PropertyList = {
    view: function(vnode) {
        return state.cols.map(col => m("div", {class: "item"}, m("div", {class: "header"}, col.name), col.property.split('.').reduce((o, k) => o.hasOwnProperty(k) ? o[k] : "", vnode.attrs.data)))
    }
}

var MinifigListElement = {
    view: function(vnode) {
        if (vnode.attrs.inventories) {
            return m(MinifigList, {"inventory_id": vnode.attrs.inventories.filter(inv => inv.is_latest).map(inv => inv.id)[0]})
        }
    }
}


var state = {
    cols: [
        {"name": "Set-Nr.", "property": "set_num"},
        {"name": "Set-Name", "property": "name"},
        {"name": "Anzahl Teile", "property": "num_parts"},
        {"name": "Jahr", "property": "year_of_publication"},
        {"name": "Thema", "property": "theme.name"},
        {"name": "Verkaufspreis", "property": "retail_price"},
        {"name": "EOL", "property": "eol"},
    ],
}


var SetDetail =  {
    oninit: (vnode) => {Set.actualSet = {}; Set.getSetById(vnode.attrs.id)},
    view: () => m("div", {class: "ui two column grid"}, [
        m("div", {class: "twelve wide column"}, m("div", {class: "ui card", style: "width: 100%; margin-top: 15px"}, m("div", {class: "ui celled list"}, m(PropertyList, {"data": Set.actualSet})))),
        m("div", {class: "four wide column"}, m("div", {class: "ui card", style: "width: 100%; margin-top: 15px"}, Set.actualSet.set_num ? [
            m("div", {class: "ui slide masked reveal image" }, [
                m("img", {class: "visible content", src: 'https://img.bricklink.com/ItemImage/ON/0/' + Set.actualSet.set_num + '.png'}),
                m("img", {class: "hidden content", src: 'https://img.bricklink.com/ItemImage/SN/0/' + Set.actualSet.set_num + '.png'}),
            ]),
            m("div", {class: "ui slide masked reveal image" }, m("div", {class: "extra content"}, "2 Bilder"))
        ] : [])),
        m("div", {class: "sixteen wide column"}, m(MinifigListElement, {"inventories": Set.actualSet.inventories})),
        m(m.route.Link, {selector: "button", class: "mini ui primary button", href: '/sets'}, "Zurück")
    ])
}

module.exports = SetDetail