var m = require("mithril")
var Set = require("../../models/set/Set")

var SetSearchForm = require("./SetSearchForm")
var Table = require("../common/Table")


var state = {
    cols: [
        {"name": "Set-Nr.", "property": "set_num"},
        {"name": "Set-Name", "property": "name"},
        {"name": "Anzahl Teile", "property": "num_parts"},
        {"name": "Jahr", "property": "year_of_publication"},
        {"name": "Thema", "property": "theme.name"},
        {"name": "Verkaufspreis", "property": "retail_price", "fn": (row) => row["retail_price"] ? (row["retail_price"] / 100).toFixed(2) : ""},
        {"name": "EOL", "property": "eol"},
        {"name": "Bewertung", "property": "score.score", "fn": (row) => row["score"] ? row["score"]["score"].toFixed(4) : ""},
        {"name": "Details", "element": (row) => m("div", m(m.route.Link, {selector: "button", class: "mini ui secondary button", href: '/set/' + row.id}, "Details"))},
    ]
}

var SetList =  {
    oninit: Set.getSets,
    view: () => [
        m(SetSearchForm),
        m(Table, {
            "sortable": true,
            "pageable": true,
            "isLoading": () => Set.loading,
            "getList": () => Set.list,
            "fn": Set.getSets,
            "cols": state.cols,
            "getNumResults": () => Set.numResults,
            "setPage": (page) => Set.page = page,
            "getPage": () => Set.page,
            "getTotalPages": () => Set.totalPages,
            "getOrderByField": () => Set.orderByField,
            "setOrderByField": (field) => Set.orderByField = field,
            "getOrderByDirection": () => Set.orderByDirection,
            "setOrderByDirection": (direction) => Set.orderByDirection = direction
        }),
    ]
}

module.exports = SetList