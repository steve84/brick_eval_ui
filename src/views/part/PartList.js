var m = require("mithril")
var Part = require("../../models/part/Part")
var ColorUtil = require("../../utils/ColorUtil")

var Table = require("../common/Table")

var PartList =  {
    oninit: (vnode) => {
        vnode.state.cols = [
            {"name": "Bild", "property": "element_id", "fn": row => m("div", row["element_id"] ? m("img", {class: "ui rounded image", src: "https://cdn.rebrickable.com/media/thumbs/parts/elements/" + row["element_id"] + ".jpg/75x75p.jpg"}) : m("span"))},
            {"name": "Teile-Name", "property": "part_name", "searchable": true},
            {"name": "Teile-Nr.", "property": "part_num", "searchable": true},
            {"name": "Bedruckt", "property": "is_print", "fn": row => row["is_print"] ? "Ja" : "Nein"},
            {"name": "Farbe", "property": "color_name"},
            {"name": "Kategorie", "property": "category_name"},
            {"name": "Transparent", "property": "is_trans", "fn": row => row["is_trans"] ? "Ja" : "Nein"},
            {"name": "Element-ID", "property": "element_id", "searchable": true},
            {"name": "Preis", "property": "price", "fn": row => row["price"] ? (row["price"] === -1 ? "n.a." : (row["price"] / 100).toFixed(2)) : ""},
            {"name": "Häufigkeit", "property": "total_amount"},

        ],
        Part.getParts()
    },
    view: (vnode) => [
        m(Table, {
            "sortable": true,
            "pageable": true,
            "searchable": true,
            "isLoading": () => Part.loading,
            "getList": () => Part.list,
            "searchInput": (col, value) => {
                Part.loading = true
                index = Part.queryParams["filter[objects]"].findIndex(e => e.name === col)
                val = value ? value.split(' ').filter(e => e.length > 0).join('%') : null
                if (index > -1) {
                    if (!!val) {
                        Part.queryParams["filter[objects]"][index] = {name: col, "op": "ilike", "val": "%" + val + "%"}
                    } else {
                        Part.queryParams["filter[objects]"].splice(index, 1)
                    }
                } else {
                    Part.queryParams["filter[objects]"].push({name: col, "op": "ilike", "val": "%" + val + "%"})
                }
                Part.page = 1
            },
            "getNumResults": () => Part.numResults,
            "fn": () => Part.getParts(),
            "cols": vnode.state.cols,
            "setPage": (page) => Part.page = page,
            "getPage": () => Part.page,
            "getTotalPages": () => Part.totalPages,
            "getOrderByField": () => Part.orderByField,
            "setOrderByField": (field) => Part.orderByField = field,
            "getOrderByDirection": () => Part.orderByDirection,
            "setOrderByDirection": (direction) => Part.orderByDirection = direction,
            "rowStyle": (row) => {
                return {style: "background: #" + row.rgb + "; color: " + ColorUtil.calculateFontColor(row.rgb)}
            },
        })
    ]
}

module.exports = PartList