var m = require("mithril")

var SetList = require("./views/set/SetList")
var SetDetail = require("./views/set/SetDetail")
var MinifigDetail = require("./views/minifig/MinifigDetail")
var MinifigSimilarityList = require("./views/minifig/MinifigSimilarityList")
var ScoreList = require("./views/score/ScoreList")
var PartList = require("./views/part/PartList")

var Statistic = require('./models/statistic/Statistic')


var appState = {
    activeRoute: window.location.hash.split('/').pop()
}

var q = [
    {
        "or": [
            {"name": "set_num", "op": "ilike", "val": "{set_search}%25"},
            {"name": "name", "op": "ilike", "val": "%25{set_search}%25"}
        ]
    }
]
$.fn.api.settings.api["search sets"] = 'http://localhost:5000/api/sets?filter[objects]=' + JSON.stringify(q)

Statistic.getMinifigStatistics()

m.render(document.body, [
    m("nav", m("div", {class: "ui menu"}, [
        m(m.route.Link, {class: (appState && appState.activeRoute == 'sets' ? "active " : "") + "item", href: '/sets', onclick: e => {
            $('a.active.item').first().removeClass('active')
            $(e.srcElement).addClass('active')
            appState.activeRoute = 'sets'
        }}, "Sets"),
        m(m.route.Link, {class: (appState && appState.activeRoute === 'scores' ? "active " : "") + "item", href: '/scores', onclick: e => {
            $('a.active.item').first().removeClass('active')
            $(e.srcElement).addClass('active')
            appState.activeRoute = 'scores'
        }}, "Bewertungen"),
        m(m.route.Link, {class: (appState && appState.activeRoute === 'parts' ? "active " : "") + "item", href: '/parts', onclick: e => {
            $('a.active.item').first().removeClass('active')
            $(e.srcElement).addClass('active')
            appState.activeRoute = 'parts'
        }}, "Teile"),
        m(m.route.Link, {class: (appState && appState.activeRoute === 'minifigs_similarity' ? "active " : "") + "item", href: '/minifigs_similarity', onclick: e => {
            $('a.active.item').first().removeClass('active')
            $(e.srcElement).addClass('active')
            appState.activeRoute = 'minifigs_similarity'
        }}, "Ähnliche Figuren"),
        m("div", {class: "right menu"}, m("div", {class: "item"}, m("div", {class: "ui search", "id": "set_search"}, [
            m("div", {class: "ui icon input"}, [
                m("input", {type: "text", "placeholder": "Suche...", class: "prompt"}),
                m("i", {class: "search link icon"})
            ]),
            m("div", {class: "results"})
        ])))
    ])),
    m("main", m("div", {class: "ui container"}))
])

$('#set_search').search(
    {
        apiSettings: {
            action: "search sets",
            method: "GET",
            headers: {"Accept": "application/vnd.api+json"},
            onResponse: resp => resp.data.map(a => {return {"title": a.attributes.set_num, "description": a.attributes.name, "id": a.id}}),
            beforeSend: settings => settings.urlData = {"set_search": $('#set_search input').val()},
        },
        onSelect: (res) => {
            m.route.set('set/:id', {"id": res.id})
        }
    }
)

var mainTag = document.body.vnodes.find(n => n.tag === "main")
var mainContainerTag = mainTag ? mainTag.children[0] : undefined

if (mainContainerTag) {
    m.route(mainContainerTag.dom, "/sets", {
        "/sets": SetList,
        "/set/:key": SetDetail,
        "/minifig/:key": MinifigDetail,
        "/minifigs_similarity": MinifigSimilarityList,
        "/scores": ScoreList,
        "/parts": PartList
    })
}