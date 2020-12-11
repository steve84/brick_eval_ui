var m = require("mithril")

var baseUrl = "http://localhost:5000/api/"

var Theme = {
    getThemeHierarchy: 
        () => m.request({method: "GET", url: baseUrl + "themes/hierarchy"})
}

module.exports = Theme