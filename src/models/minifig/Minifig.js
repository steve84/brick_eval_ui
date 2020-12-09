var m = require("mithril")

var baseUrl = "http://192.168.1.104:5000/api/"

var Minifig = {
    getMinifigsByInventoryId: 
        inventory_id => m.request({method: "GET", url: baseUrl + "inventory_minifigs", params: {"q": JSON.stringify({"filters":[{"name":"inventory_id","op":"eq","val":inventory_id}]})}})
}

module.exports = Minifig