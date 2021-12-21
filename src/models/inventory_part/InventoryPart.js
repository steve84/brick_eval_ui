var m = require("mithril")

var PartColorFrequency = require("../part_color_frequency/PartColorFrequency")

var baseUrl = "http://localhost:5000/api/"

var InventoryPart = {
    list: [],
    numResults: 0,
    totalPages: 0,
    page: 1,
    pageSize: 15,
    orderByField: "inventory_id",
    orderByDirection: "",
    loading: false,
    queryParams: {},
    getInventoryPartsByInventoryId: 
        inventory_id => {
            InventoryPart.queryParams["page[number]"] = InventoryPart.page
            InventoryPart.queryParams["page[size]"] = InventoryPart.pageSize
            if (!InventoryPart.queryParams.hasOwnProperty("filter[objects]")) {
                InventoryPart.queryParams["filter[objects]"] = {}
            }
            InventoryPart.queryParams["filter[objects]"] = [{"name": "inventory_id", "op": "eq", "val": inventory_id}]
            InventoryPart.queryParams["sort"] = InventoryPart.orderByDirection + InventoryPart.orderByField, 
            tmpQueryParams = Object.assign({}, InventoryPart.queryParams)
            tmpQueryParams["filter[objects]"] = JSON.stringify(InventoryPart.queryParams["filter[objects]"])
            InventoryPart.loading = true
            return m.request({
                method: "GET",
                url: baseUrl + "v_inventory_parts",
                params: tmpQueryParams,
                headers: {"Accept": "application/vnd.api+json"}
            }).then(res => {
                InventoryPart.list = res.data
                InventoryPart.numResults = res.meta.total
                InventoryPart.page = tmpQueryParams["page[number]"]
                InventoryPart.pageSize = tmpQueryParams["page[size]"]
                InventoryPart.totalPages = Math.trunc(InventoryPart.numResults / InventoryPart.pageSize) + 1
                InventoryPart.loading = false
            })
    }
}

module.exports = InventoryPart