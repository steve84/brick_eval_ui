var m = require("mithril")

var SetList = require("./views/set/SetList")
var SetDetail = require("./views/set/SetDetail")

m.render(document.body, [
    m("nav", m("div", {class: "ui three item menu"}, [
        m(m.route.Link, {class: "active item", href: '/sets'}, "Sets"),
        m(m.route.Link, {class: "item", href: '/scores'}, "Bewertungen"),
        m(m.route.Link, {class: "item", href: '/parts'}, "Teile"),
    ])),
    m("main", m("div", {class: "ui container"}))
])

var mainTag = document.body.vnodes.find(n => n.tag === "main")
var mainContainerTag = mainTag ? mainTag.children[0] : undefined

if (mainContainerTag) {
    m.route(mainContainerTag.dom, "/sets", {
        "/sets": SetList,
        "/set/:id": SetDetail
    })
}