var m = require("mithril")

var baseUrl = "http://localhost:5000/api/"

var Set = {
    list: [],
    numResults: 0,
    page: 1,
    pageSize: 15,
    orderByField: "set_num",
    orderByDirection: "asc",
    actualSet: {},
    queryParams: {},
    getSets: function() {
        Set.queryParams["page"] = Set.page
        Set.queryParams["results_per_page"] = Set.pageSize
        if (!Set.queryParams.hasOwnProperty("q")) {
            Set.queryParams["q"] = {}
        }
        Set.queryParams["q"]["order_by"] = [{"field": Set.orderByField, "direction": Set.orderByDirection}]
        tmpQueryParams = Object.assign({}, Set.queryParams);
        tmpQueryParams["q"] = JSON.stringify(Set.queryParams["q"])
        return m.request({
            method: "GET",
            url: baseUrl + "sets",
            params: tmpQueryParams
        }).then(res => {
            Set.list = res.objects
            Set.numResults = res.num_results
            Set.page = res.page
        })
    },
    getSetById: 
        id => m.request({method: "GET", url: baseUrl + "sets/" + id}).then(res => Set.actualSet = res)
}

module.exports = Set