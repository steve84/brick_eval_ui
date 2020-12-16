var m = require("mithril")

var baseUrl = "http://localhost:5000/api/"

var InventoryMinifig = {
    list: [],
    numResults: 0,
    totalPages: 0,
    page: 1,
    pageSize: 15,
    orderByField: "id",
    orderByDirection: "asc",
    loading: false,
    queryParams: {},
    actualInventoryMinifig: {},
    getMinifigsByInventoryId: 
        inventory_id => {
            InventoryMinifig.loading = true
            InventoryMinifig.queryParams["page"] = InventoryMinifig.page
            InventoryMinifig.queryParams["results_per_page"] = InventoryMinifig.pageSize
            if (!InventoryMinifig.queryParams.hasOwnProperty("q")) {
                InventoryMinifig.queryParams["q"] = {}
            }
            InventoryMinifig.queryParams["q"]["filters"] = [{"name": "inventory_id", "op": "eq", "val": inventory_id}]
            InventoryMinifig.queryParams["q"]["order_by"] = [{"field": InventoryMinifig.orderByField, "direction": InventoryMinifig.orderByDirection}]
            tmpQueryParams = Object.assign({}, InventoryMinifig.queryParams)
            tmpQueryParams["q"] = JSON.stringify(InventoryMinifig.queryParams["q"])
            InventoryMinifig.loading = true
            m.request({
                method: "GET",
                url: baseUrl + "inventory_minifigs",
                params: tmpQueryParams
            }).then(res => {
                InventoryMinifig.list = res.objects
                InventoryMinifig.page = res.page
                InventoryMinifig.numResults = res.num_results
                InventoryMinifig.totalPages = res.total_pages
                InventoryMinifig.loading = false
            })
        },
    getInventoryMinifigById:
        id => {
            m.request({
                method: "GET",
                url: baseUrl + "inventory_minifigs/" + id,
            }).then(res => {
                InventoryMinifig.actualInventoryMinifig = res
            })
        }
}

module.exports = InventoryMinifig