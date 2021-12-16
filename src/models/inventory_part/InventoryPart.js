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
    orderByDirection: "asc",
    loading: false,
    queryParams: {},
    getInventoryPartsByInventoryId: 
        inventory_id => {
            InventoryPart.queryParams["page"] = InventoryPart.page
            InventoryPart.queryParams["results_per_page"] = InventoryPart.pageSize
            if (!InventoryPart.queryParams.hasOwnProperty("q")) {
                InventoryPart.queryParams["q"] = {}
            }
            InventoryPart.queryParams["q"]["filters"] = [{"name": "inventory_id", "op": "eq", "val": inventory_id}]
            InventoryPart.queryParams["q"]["order_by"] = [{"field": InventoryPart.orderByField, "direction": InventoryPart.orderByDirection}]
            tmpQueryParams = Object.assign({}, InventoryPart.queryParams)
            tmpQueryParams["q"] = JSON.stringify(InventoryPart.queryParams["q"])
            InventoryPart.loading = true
            return m.request({
                method: "GET",
                url: baseUrl + "v_inventory_parts",
                params: tmpQueryParams
            }).then(res => {
                InventoryPart.list = res.objects
                InventoryPart.numResults = res.num_results
                InventoryPart.page = res.page
                InventoryPart.totalPages = res.total_pages
                InventoryPart.loading = false
            })
    }
}

module.exports = InventoryPart