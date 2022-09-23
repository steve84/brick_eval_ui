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
    setTheme: null,
    isClosed: false,
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
    state.setState = -1
    state.setTheme = null
    Set.page = 1
    delete Set.queryParams["filter[objects]"]
}

var generateQuery = () => {
    query = []
    if (state.yearFrom) {
        query.push({"name": "year_of_publication", "op": ">=", "val": state.yearFrom})
    }
    if (state.yearTo) {
        query.push({"name": "year_of_publication", "op": "<=", "val": state.yearTo})
    }
    if (state.minNumParts) {
        query.push({"name": "num_parts", "op": ">=", "val": state.minNumParts})
    }
    if (state.maxNumParts) {
        query.push({"name": "num_parts", "op": "<=", "val": state.maxNumParts})
    }
    if (state.priceFrom) {
        query.push(
            {"or": [
                {"name": "retail_price", "op": ">=", "val": 100 * state.priceFrom}
            ]}
        )
    }
    if (state.priceTo) {
        query.push(
            {"or": [
                {"name": "retail_price", "op": "<=", "val": 100 *state.priceTo}
            ]}
        )
    }
    if (state.setState && state.setState > -1) {
        query.push({"name": "eol", "op": "eq", "val": state.setState})
    }
    if (state.setTheme) {
        query.push({"name": "theme_id", "op": "in", "val": state.setTheme.split(",")})
    }
    return query
}


var SetSearchForm =  {
    oninit: Theme.getThemeHierarchy,
    view: () => m("div", {class: "ui accordion"}, [
        m("div", {
            class: "active title", onclick: () => {
                state.isClosed = !state.isClosed
                $('.ui.accordion').accordion(state.isClosed ? 'open' : 'close', 0)
            }
        }, m("i", {class: "dropdown icon"}), "Suche"),
        m("div", {class: "active content"}, m("p", m("form", {
        class: "ui form",
        style: "margin-top: 15px",
        onsubmit: (e) => {e.preventDefault(); Set.page = 1; Set.queryParams["filter[objects]"] = generateQuery(); Set.getSets()},
        onreset: (e) => {resetForm(); Set.page = 1; Set.getSets()}
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
                    m("option", {"value": -1}, "Alle"),
                    m("option", {"value": 0}, "Altes Produkt"),
                    m("option", {"value": 1}, "Verfügbar"),
                    m("option", {"value": 2}, "Einstellung in Kürze"),
                    m("option", {"value": 3}, "EOL erwartet"),
                ])
            ]),
            m("div", {class: "field"}, [
                m("label", "Thema:"),
                m("select", {class: "ui search dropdown", "name": "theme", "value": state.setTheme ? state.setTheme.id : null, oninput: (e) => state.setTheme = e.target.value}, Theme.dropdownList.map(t => m("option", {"value": getAllChildIdsFromTheme(t)}, t.name)))
            ]),
        ]),
        m("button", {class: "ui primary button", "type": "submit"}, "Suchen"),
        m("button", {class: "ui secondary button", "type": "reset"}, "Zurücksetzen")
    ])))])
}

module.exports = SetSearchForm
