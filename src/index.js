var m = require("mithril")

var SetList = require("./views/SetList")

m.render(document.body, [
    m("nav", m("div", {class: "ui three item menu"}, [
        m("a", {class: "active item"}, "Sets"),
        m("a", {class: "item"}, "Bewertungen"),
        m("a", {class: "item"}, "Themen"),
    ])),
    m("main", m("div", {class: "ui container"}))
])

var mainTag = document.body.vnodes.find(n => n.tag === "main")
var mainContainerTag = mainTag ? mainTag.children[0] : undefined

if (mainContainerTag) {
    m.route(mainContainerTag.dom, "/list", {
        "/list": SetList
    })
}