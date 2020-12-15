var m = require("mithril")

var baseUrl = "http://localhost:5000/api/"

var Minifig = {
    list: [],
    numResults: 0,
    totalPages: 0,
    page: 1,
    pageSize: 15,
    orderByField: "id",
    orderByDirection: "asc",
    loading: false,
    queryParams: {},
    getMinifigsByInventoryId: 
        inventory_id => {
            Minifig.loading = true
            Minifig.queryParams["page"] = Minifig.page
            Minifig.queryParams["results_per_page"] = Minifig.pageSize
            if (!Minifig.queryParams.hasOwnProperty("q")) {
                Minifig.queryParams["q"] = {}
            }
            Minifig.queryParams["q"]["filters"] = [{"name": "inventory_id", "op": "eq", "val": inventory_id}]
            Minifig.queryParams["q"]["order_by"] = [{"field": Minifig.orderByField, "direction": Minifig.orderByDirection}]
            tmpQueryParams = Object.assign({}, Minifig.queryParams)
            tmpQueryParams["q"] = JSON.stringify(Minifig.queryParams["q"])
            Minifig.loading = true
            m.request({
                method: "GET",
                url: baseUrl + "inventory_minifigs",
                params: tmpQueryParams
            }).then(res => {
                Minifig.list = res.objects
                Minifig.page = res.page
                Minifig.numResults = res.num_results
                Minifig.totalPages = res.total_pages
                Minifig.loading = false
            })
        }
}

module.exports = Minifig