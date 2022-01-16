var m = require("mithril")
var MinifigSimilarity = require("../../models/minifig/MinifigSimilarity")

var Table = require("../common/Table")

var MinifigSimilarityList =  {
    oninit: (vnode) => {
        vnode.state.cols = [
            {"name": "Ähnlichkeit", "property": "similarity", "fn": row => row["similarity"] ? (row["similarity"] * 100).toFixed(0) : ""},
            {"name": "Nummer F1", "property": "num_minifig_1", "searchable": true},
            {"name": "Nummer F2", "property": "num_minifig_2"},
            {"name": "Name F1", "property": "name_minifig_1", "searchable": true},
            {"name": "Name F2", "property": "name_minifig_2"},
            {"name": "Thema F1", "property": "theme_minifig_1", "searchable": true},
            {"name": "Thema F2", "property": "theme_minifig_2"},
            {"name": "Bewertung F1", "property": "score_minifig_1", "fn": row => row["score_minifig_1"] ? row["score_minifig_1"].toFixed(2) : ""},
            {"name": "Bewertung F2", "property": "score_minifig_2", "fn": row => row["score_minifig_2"] ? row["score_minifig_2"].toFixed(2) : ""},
            {"name": "Statistiken", "sortable": false, "element": (row) =>  m("div", {class: "ui definition table"}, m("tbody", [
                {"name": "Teile F1", "property": "num_parts_minifig_1"},
                {"name": "Teile F2", "property": "num_parts_minifig_2"},
                {"name": "In Sets F1", "property": "set_occurance_minifig_1"},
                {"name": "In Sets F2", "property": "set_occurance_minifig_2"},
                {"name": "Max. Set-Teile F1", "property": "max_set_parts_minifig_1"},
                {"name": "Max. Set-Teile F2", "property": "max_set_parts_minifig_2"},
                {"name": "Min. Set-Teile F1", "property": "min_set_parts_minifig_1"},
                {"name": "Min. Set-Teile F2", "property": "min_set_parts_minifig_2"}
            ].map(col => m("tr", [
                m("td", {class: "two wide column"},  col.name), 
                m("td", row[col.property])
            ]))))}
        ]
        MinifigSimilarity.getMinfigSimilarities()
    },
    view: (vnode) => m(Table, {
        "pageable": true,
        "searchable": true,
        "isLoading": () => MinifigSimilarity.loading,
        "getList": () => MinifigSimilarity.list,
        "searchInput": (col, value) => {
            MinifigSimilarity.loading = true
            index = MinifigSimilarity.queryParams["filter[objects]"].findIndex(e => e.name === col)
            val = value ? value.split(' ').filter(e => e.length > 0).join('%') : null
            if (index > -1) {
                if (!!val) {
                    MinifigSimilarity.queryParams["filter[objects]"][index] = {name: col, "op": "ilike", "val": "%" + val + "%"}
                } else {
                    MinifigSimilarity.queryParams["filter[objects]"].splice(index, 1)
                }
            } else {
                MinifigSimilarity.queryParams["filter[objects]"].push({name: col, "op": "ilike", "val": "%" + val + "%"})
            }
            MinifigSimilarity.page = 1
        },
        "getNumResults": () => MinifigSimilarity.numResults,
        "fn": () => MinifigSimilarity.getMinfigSimilarities(),
        "cols": vnode.state.cols,
        "setPage": (page) => MinifigSimilarity.page = page,
        "getPage": () => MinifigSimilarity.page,
        "getTotalPages": () => MinifigSimilarity.totalPages,
        "getOrderByField": () => MinifigSimilarity.orderByField,
        "setOrderByField": (field) => MinifigSimilarity.orderByField = field,
        "getOrderByDirection": () => MinifigSimilarity.orderByDirection,
        "setOrderByDirection": (direction) => MinifigSimilarity.orderByDirection = direction
    })
}

module.exports = MinifigSimilarityList