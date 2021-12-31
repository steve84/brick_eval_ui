var m = require("mithril")

var Score = require("../../models/score/Score")


var state = {
    yearFrom: null,
    yearTo: null,
    minNumParts: null,
    maxNumParts: null,
    scoreFrom: null,
    scoreTo: null,
    scoreType: -1,
    isClosed: false,
}


var resetForm = () => {
    state.yearFrom = null
    state.yearTo = null
    state.minNumParts = null
    state.maxNumParts = null
    state.scoreFrom = null
    state.scoreTo = null
    state.scoreType = -1
    Score.page = 1
    delete Score.queryParams["filter[objects]"]
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
    if (state.scoreFrom) {
        query.push({"name": "score", "op": ">=", "val": state.scoreFrom})
    }
    if (state.scoreTo) {
        query.push({"name": "score", "op": "<=", "val": state.scoreTo})
    }
    if (state.scoreType) {
        if (state.scoreType == 0) {
            query.push({"name": "is_set", "op": "eq", "val": true})
        }
        if (state.scoreType == 1) {
            query.push({"name": "is_set", "op": "eq", "val": false})
        }
    }
    return query
}


var ScoreSearchForm =  {
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
        onsubmit: (e) => {e.preventDefault(); Score.page = 1; Score.queryParams["filter[objects]"] = generateQuery(); Score.getScores()},
        onreset: (e) => {resetForm(); Score.page = 1; Score.getScores()}
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
                m("input", {"type": "number", "min": "0", "name": "minNumParts", "value": state.minNumParts, oninput: (e) => state.minNumParts = e.target.value})
            ]),
            m("div", {class: "field"}, [
                m("label", "Anzahl Teile (max):"),
                m("input", {"type": "number", "min": "0", "name": "maxNumParts", "value": state.maxNumParts, oninput: (e) => state.maxNumParts = e.target.value})
            ]),
        ]),
        m("div", {class: "two fields"}, [
            m("div", {class: "field"}, [
                m("label", "Bewertung von:"),
                m("input", {"type": "number", "min": "0", "max": "1", "step": "any", "name": "scoreFrom", "value": state.scoreFrom, oninput: (e) => state.scoreFrom = e.target.value})
            ]),
            m("div", {class: "field"}, [
                m("label", "Bewertung bis:"),
                m("input", {"type": "number", "min": "0", "max": "1", "step": "any", "name": "scoreTo", "value": state.scoreTo, oninput: (e) => state.scoreTo = e.target.value})
            ]),
        ]),
        m("div", {class: "two fields"}, [
            m("div", {class: "field"}, [
                m("label", "Typ:"),
                m("select", {class: "ui search dropdown", "name": "scoreType", "value": state.scoreType, oninput: (e) => state.scoreType = e.target.value}, [
                    m("option", {"value": -1}, "Sets und Minifiguren"),
                    m("option", {"value": 0}, "Nur Sets"),
                    m("option", {"value": 1}, "Nur Minifiguren")
                ])
            ]),
            m("div", {class: "field"})
        ]),
        m("button", {class: "ui primary button", "type": "submit"}, "Suchen"),
        m("button", {class: "ui secondary button", "type": "reset"}, "Zurücksetzen")
    ])))])
}

module.exports = ScoreSearchForm
