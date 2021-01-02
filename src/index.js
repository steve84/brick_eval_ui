var m = require("mithril")

var SetList = require("./views/set/SetList")
var SetDetail = require("./views/set/SetDetail")
var MinifigDetail = require("./views/minifig/MinifigDetail")

var Statistic = require('./models/statistic/Statistic')


var q = {
    "filters": [
        {
            "or": [
                {"name": "set_num", "op": "ilike", "val": "{set_search}%25"},
                {"name": "name", "op": "ilike", "val": "%25{set_search}%25"}
            ]
        }
    ]
}
$.fn.api.settings.api["search sets"] = 'http://localhost:5000/api/sets?q=' + JSON.stringify(q)

Statistic.getMinifigStatistics()

m.render(document.body, [
    m("nav", m("div", {class: "ui menu"}, [
        m(m.route.Link, {class: "active item", href: '/sets'}, "Sets"),
        m(m.route.Link, {class: "item", href: '/scores'}, "Bewertungen"),
        m(m.route.Link, {class: "item", href: '/parts'}, "Teile"),
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
            onResponse: resp => resp.objects.map(a => {return {"title": a.set_num, "description": a.name, "id": a.id}}),
            beforeSend: settings => settings.urlData = {"set_search": $('#set_search input').val()},
        },
        onSelect: (res, resp) => m.route.set('set/:id', {"id": res.id})
    }
)

var mainTag = document.body.vnodes.find(n => n.tag === "main")
var mainContainerTag = mainTag ? mainTag.children[0] : undefined

if (mainContainerTag) {
    m.route(mainContainerTag.dom, "/sets", {
        "/sets": SetList,
        "/set/:key": SetDetail,
        "/minifig/:key": MinifigDetail
    })
}