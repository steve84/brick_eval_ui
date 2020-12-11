var m = require("mithril")

var Theme = require("../../models/theme/Theme")
var Set = require("../../models/set/Set")


var state = {
    themes: [],
    yearFrom: null,
    yearTo: null,
    minNumParts: null,
    maxNumParts: null,
    priceFrom: null,
    priceTo: null,
    setState: null,
    setTheme: null
}


var getAllChildIdsFromTheme = function(theme) {
    if (theme.children.length == 0) {
        return theme.id
    } else {
        return [theme.id, theme.children.map(c => getAllChildIdsFromTheme(c))]
    }
}

var resetForm = () => {
    state.yearFrom = null
    state.yearTo = null
    state.minNumParts = null
    state.maxNumParts = null
    state.priceFrom = null
    state.priceTo = null
    state.setState = null
    state.setTheme = null
    Set.page = 1
    delete Set.queryParams.q
}

var generateQuery = () => {
    query = {"filters": []}
    if (state.yearFrom) {
        query["filters"].push({"name": "year_of_publication", "op": ">=", "val": state.yearFrom})
    }
    if (state.yearTo) {
        query["filters"].push({"name": "year_of_publication", "op": "<=", "val": state.yearTo})
    }
    if (state.minNumParts) {
        query["filters"].push({"name": "num_parts", "op": ">=", "val": state.minNumParts})
    }
    if (state.maxNumParts) {
        query["filters"].push({"name": "num_parts", "op": "<=", "val": state.maxNumParts})
    }
    if (state.priceFrom) {
        query["filters"].push(
            {"or": [
                {"name": "retail_price", "op": "is_null"},
                {"name": "retail_price", "op": ">=", "val": state.priceFrom}
            ]}
        )
    }
    if (state.priceTo) {
        query["filters"].push(
            {"or": [
                {"name": "retail_price", "op": "is_null"},
                {"name": "retail_price", "op": "<=", "val": state.priceTo}
            ]}
        )
    }
    if (state.setState) {
        /*query["filters"].push(
            {"or": [
                {"name": "retail_price", "op": "is_null"},
                {"name": "retail_price", "op": "<=", "val": state.priceTo}
            ]}
        )*/
    }
    if (state.setTheme) {
        query["filters"].push({"name": "theme_id", "op": "in", "val": state.setTheme.split(",")})
    }
    return query
}


var SetSearchForm =  {
    oninit: () => Theme.getThemeHierarchy().then(res => {
        state.themes = res
        state.themes.sort((t1, t2) => t1.name.localeCompare(t2.name))
        state.themes.unshift({"name": "Alle", "id": null, "children": []})
    }),
    view: () => m("form", {
        class: "ui form",
        style: "margin-top: 15px",
        onsubmit: (e) => {e.preventDefault(); Set.queryParams["q"] = generateQuery(); Set.getSets()},
        onreset: (e) => {resetForm(); Set.getSets()}
    },
    [
        m("div", {class: "two fields"}, [
            m("div", {class: "field"}, [
                m("label", "Jahr von:"),
                m("input", {"type": "number", "name": "yearFrom", "value": state.yearFrom, oninput: (e) => state.yearFrom = e.target.value})
            ]),
            m("div", {class: "field"}, [
                m("label", "Jahr bis:"),
                m("input", {"type": "number", "name": "yearTo", "value": state.yearTo, oninput: (e) => state.yearTo = e.target.value})
            ]),
        ]),
        m("div", {class: "two fields"}, [
            m("div", {class: "field"}, [
                m("label", "Anzahl Teile (min):"),
                m("input", {"type": "number", "name": "minNumParts", "value": state.minNumParts, oninput: (e) => state.minNumParts = e.target.value})
            ]),
            m("div", {class: "field"}, [
                m("label", "Anzahl Teile (max):"),
                m("input", {"type": "number", "name": "maxNumParts", "value": state.maxNumParts, oninput: (e) => state.maxNumParts = e.target.value})
            ]),
        ]),
        m("div", {class: "two fields"}, [
            m("div", {class: "field"}, [
                m("label", "Verkaufspreis ab:"),
                m("input", {"type": "number", "name": "priceFrom", "value": state.priceFrom, oninput: (e) => state.priceFrom = e.target.value})
            ]),
            m("div", {class: "field"}, [
                m("label", "Verkaufspreis bis:"),
                m("input", {"type": "number", "name": "priceTo", "value": state.priceTo, oninput: (e) => state.priceTo = e.target.value})
            ]),
        ]),
        m("div", {class: "two fields"}, [
            m("div", {class: "field"}, [
                m("label", "Status:"),
                m("select", {class: "ui search dropdown", "name": "eol", "value": state.setState, oninput: (e) => state.setState = e.target.value}, [
                    m("option", {"value": null}, "Alle"),
                    m("option", {"value": "0"}, "Verfügbar"),
                    m("option", {"value": "1"}, "EOL"),
                    m("option", {"value": "2"}, "Einstellung in Kürze"),
                    m("option", {"value": "3"}, "EOL erwartet"),
                ])
            ]),
            m("div", {class: "field"}, [
                m("label", "Thema:"),
                m("select", {class: "ui search dropdown", "name": "theme", "value": state.setTheme, oninput: (e) => state.setTheme = e.target.value}, state.themes.map(t => m("option", {"value": getAllChildIdsFromTheme(t)}, t.name)))
            ]),
        ]),
        m("button", {class: "ui primary button", "type": "submit"}, "Suchen"),
        m("button", {class: "ui secondary button", "type": "reset"}, "Zurücksetzen")
    ])
}

module.exports = SetSearchForm
