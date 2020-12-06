var m = require("mithril")

var baseUrl = "http://192.168.1.127:5000/api/"

var Set = {
    list: [],
    page: {},
    loadList: function() {
        return m.request({
            method: "GET",
            url: baseUrl + "sets"
        })
        .then(res => {Set.list = res.objects; Set.page = res.page})
    },
    loadPage: 
        page => m.request({method: "GET", url: baseUrl + "sets", params: {"page": page}})
        .then(res => {Set.list = res.objects; Set.page = res.page})
}

module.exports = Set