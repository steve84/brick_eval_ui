var m = require("mithril")
var Score = require("../../models/score/Score")

var Table = require("../common/Table")
var ScoreSearchForm = require("./ScoreSearchForm")

var getRating = (rating) => {
    color = "red"
    if (rating > 3) {
        color = "green"
    } else if (rating > 2) {
        color = "yellow"
    } else if (rating > 1) {
        color = "orange"
    }
    return m("div", {class: "ui " + color + " rating disabled"}, [
        m("i", {"class": "star icon" + (rating >= 1 ? " active" : "")}),
        m("i", {"class": "star icon" + (rating >= 2 ? " active" : "")}),
        m("i", {"class": "star icon" + (rating >= 3 ? " active" : "")}),
        m("i", {"class": "star icon" + (rating >= 4 ? " active" : "")})
    ])
}

var ScoreList =  {
    oninit: (vnode) => {
        vnode.state.cols = [
            {"name": "Name", "property": "name"},
            {"name": "Nummer", "property": "num"},
            {"name": "Jahr", "property": "year_of_publication"},
            {"name": "Anzahl Teile", "property": "num_parts"},
            {"name": "Typ", "property": "is_set", fn: row => row["is_set"] ? "Set" : "Minifigur"},
            {"name": "Bewertung", "property": "score", "fn": row => row["score"] ? row["score"].toFixed(4) : ""},
            {"name": "Rating", "element": row => getRating(row["rating"])},
            {"name": "Berechnungsdatum", "property": "calc_date", "fn": row => row["calc_date"] ? new Date(row["calc_date"]).toLocaleDateString() : ""},
            {"name": "Details", "element": (row) => m("div", m(m.route.Link, {
                selector: "button",
                class: "mini ui secondary button",
                href: (row.is_set ? '/set/' : '/minifig/') + row.entity_id,
                options: {
                    state: {backlink: m.route.get()}
                }
            }, "Details"))},
        ],
        Score.queryParams = {
            "filter[objects]": [
                {"name": "score", "op": ">=", "val": 0}
            ]
        }
        Score.getScores()
    },
    view: (vnode) => [
        m(ScoreSearchForm),
        m(Table, {
            "sortable": true,
            "pageable": true,
            "isLoading": () => Score.loading,
            "getList": () => Score.list,
            "getNumResults": () => Score.numResults,
            "fn": () => Score.getScores(),
            "cols": vnode.state.cols,
            "setPage": (page) => Score.page = page,
            "getPage": () => Score.page,
            "getTotalPages": () => Score.totalPages,
            "getOrderByField": () => Score.orderByField,
            "setOrderByField": (field) => Score.orderByField = field,
            "getOrderByDirection": () => Score.orderByDirection,
            "setOrderByDirection": (direction) => Score.orderByDirection = direction
        })
    ]
}

module.exports = ScoreList