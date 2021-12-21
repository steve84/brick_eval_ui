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
                "filter[objects]": JSON.stringify([{"name":"set_id","op":"eq", "val": set_id}, {"name":"is_latest","op":"eq", "val": true}]),
                "include": "set,scores"
            },
            headers: {"Accept": "application/vnd.api+json"}
        }).then(res => {
            Inventory.actualInventory = res.data[0]
            set_id = Inventory.actualInventory.relationships.set.data.id
            set_attrs = res.included.find(i => i.type === "sets" && i.id === set_id)
            if (set_attrs) {
                Inventory.actualInventory.attributes.set = set_attrs.attributes
                Inventory.actualInventory.attributes.set.theme_id = set_attrs.relationships.theme.data.id
                Inventory.actualInventory.attributes.set.root_theme_id = set_attrs.relationships.root_theme.data.id
                Inventory.actualInventory.attributes.set.score_id = set_attrs.relationships.score.data ? set_attrs.relationships.score.data.id : null
            }
            if (Inventory.actualInventory.relationships.scores.data) {
                score_ids = Inventory.actualInventory.relationships.scores.data.map(e => e.id)
                scores = res.included.filter(i => i.type === "scores" && score_ids.find(e => e === i.id)).map(e => {
                    obj = e.attributes
                    obj.id = e.id
                    return obj
                })
                if (scores) {
                    Inventory.actualInventory.attributes.scores = scores
                }
            }
        })
}

module.exports = Inventory