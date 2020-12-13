var m = require("mithril")

var baseUrl = "http://localhost:5000/api/"

var Inventory = {
    list: [],
    actualInventory: {},
    getInventoryBySetId: 
        set_id => m.request({
            method: "GET",
            url: baseUrl + "inventories",
            params: {
                "q": JSON.stringify({"filters":[{"name":"set_id","op":"eq", "val": set_id}, {"name":"is_latest","op":"eq", "val": true}], "single": true})
            }
        }).then(res => Inventory.actualInventory = res)
}

module.exports = Inventory