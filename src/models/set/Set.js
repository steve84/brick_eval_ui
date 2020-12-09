var m = require("mithril")

var baseUrl = "http://192.168.1.104:5000/api/"

var Set = {
    getSets: function(params={}) {
        return m.request({
            method: "GET",
            url: baseUrl + "sets",
            params: params
        })

    },
    getSetById: 
        id => m.request({method: "GET", url: baseUrl + "sets/" + id})
}

module.exports = Set