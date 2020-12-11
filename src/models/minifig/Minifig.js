var m = require("mithril")

var baseUrl = "http://localhost:5000/api/"

var Minifig = {
    list: [],
    getMinifigsByInventoryId: 
        inventory_id => m.request({
            method: "GET",
            url: baseUrl + "inventory_minifigs",
            params: {
                "q": JSON.stringify({"filters":[{"name":"inventory_id","op":"eq","val":inventory_id}]})
            }
        }).then(res => Minifig.list = res.objects)
}

module.exports = Minifig