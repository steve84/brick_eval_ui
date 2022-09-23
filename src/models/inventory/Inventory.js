var m = require("mithril")

var JsonUtil = require("../../utils/JsonUtil")

var baseUrl = "http://localhost:5000/api/"

var Inventory = {
    list: [],
    numResults: 0,
    totalPages: 0,
    page: 1,
    pageSize: 15,
    orderByField: "id",
    orderByDirection: "",
    loading: false,
    queryParams: {},
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
            enriched_resp = JsonUtil.enrichResponse(res)
            Inventory.actualInventory = enriched_resp.data[0]
            set_attrs = enriched_resp.included.find(i => i.type === "sets" && i.id === Inventory.actualInventory.attributes.set.id)
            if (set_attrs) {
                Inventory.actualInventory.attributes.set.theme_id = set_attrs.relationships.theme.data.id
                Inventory.actualInventory.attributes.set.root_theme_id = set_attrs.relationships.root_theme.data.id
            }
        })
}

module.exports = Inventory