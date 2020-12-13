var m = require("mithril")

var baseUrl = "http://localhost:5000/api/"

var Minifig = {
    list: [],
    page: 1,
    pageSize: 10,
    numResults: 0,
    getMinifigsByInventoryId: 
        inventory_id => m.request({
            method: "GET",
            url: baseUrl + "inventory_minifigs",
            params: {
                "page": Minifig.page,
                "results_per_page": Minifig.pageSize,
                "q": JSON.stringify({
                    "filters": [
                        {
                            "name": "inventory_id",
                            "op": "eq",
                            "val": inventory_id
                        }
                    ]
                })
            }
        }).then(res => {
            Minifig.list = res.objects
            Minifig.page = res.page
            Minifig.numResults = res.num_results
        })
}

module.exports = Minifig