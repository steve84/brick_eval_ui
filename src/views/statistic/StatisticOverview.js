var m = require("mithril")

var Statistic = require("../../models/statistic/Statistic")
var Theme = require("../../models/theme/Theme")



var StatisticOverview =  {
    oninit: (vnode) => {
        vnode.state.is_minifig = vnode.attrs.is_minifig
        if (vnode.attrs.inventory && vnode.attrs.inventory.attributes && vnode.attrs.inventory.attributes.set) {
            vnode.state.theme_id = vnode.attrs.inventory.attributes.set.theme_id
            if (vnode.attrs.inventory.attributes.scores && vnode.attrs.inventory.attributes.scores.length > 0) {
                vnode.state.score = vnode.attrs.inventory.attributes.scores.find(s => s.id == vnode.attrs.inventory.attributes.set.score_id)
                vnode.state.score = vnode.state.score ? vnode.state.score.score : null
            }
        }
        if (vnode.state.theme_id) {
            if (Statistic.setStat && !Statistic.setStat.hasOwnProperty(vnode.state.theme_id)) {
                Statistic.getSetStatistics(vnode.state.theme_id).then(res => {
                    themeStats = res.data.find(s => s.relationships.theme.data && s.relationships.theme.data.id === vnode.state.theme_id)
                    if (themeStats) {
                        Statistic.setStat[vnode.state.theme_id] = themeStats.attributes
                    }
                    overallStats = res.data.find(s => !!s.relationships.theme.data)
                    if (!Statistic.setStat.hasOwnProperty(0) && overallStats) {
                        Statistic.setStat[0] = overallStats.attributes
                    }
                    vnode.state.stats = Statistic.setStat
                })
            } else {
                vnode.state.stats = Statistic.setStat
            }

        }
    },
    oncreate: () => setTimeout(() => {$('.rating').rating('disable')}, 500),
    view: (vnode) =>  m("div", {class: "ui card", style: "margin-top: 15px"}, m("div", {class: "ui celled list"}, vnode.state.stats && vnode.state.score ? [
        m("div", {class: "item"}, m("div", {class: "content"}, [
            m("div", {class: "header"}, "Gesamt"),
            m("div", [
                m("div", {class: "ui star rating", "style": "display: unset", "data-rating": Statistic.getScoreQuantil(vnode.state.score,  vnode.state.stats[0]), "data-max-rating": "4"}),
                m("span", " (" + vnode.state.score.toFixed(4) + ")")
            ])
        ])),
        m("div", {class: "item"}, m("div", {class: "content"}, [
            m("div", {class: "header"}, Theme.lookup.hasOwnProperty(vnode.state.theme_id) ? Theme.lookup[vnode.state.theme_id].fullName : "Thema"),
            m("div", [
                m("div", {class: "ui star rating", "style": "display: unset", "data-rating": Statistic.getScoreQuantil(vnode.state.score,  vnode.state.stats[vnode.state.theme_id]), "data-max-rating": "4"}),
                m("span", " (" + vnode.state.score.toFixed(4) + ")")
            ])
        ]))
    ] : []))
}

module.exports = StatisticOverview