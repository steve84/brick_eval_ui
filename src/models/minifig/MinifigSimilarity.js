var m = require("mithril")

var baseUrl = "http://localhost:5000/api/"

var MinifigSimilarity = {
    list: [],
    numResults: 0,
    totalPages: 0,
    page: 1,
    pageSize: 15,
    orderByField: "similarity",
    orderByDirection: "-",
    loading: false,
    queryParams: {},
    actualMinifig: {},
    getMinfigSimilarities: () => {
        MinifigSimilarity.queryParams["page[number]"] = MinifigSimilarity.page
        MinifigSimilarity.queryParams["page[size]"] = MinifigSimilarity.pageSize
        if (!MinifigSimilarity.queryParams.hasOwnProperty("filter[objects]")) {
            MinifigSimilarity.queryParams["filter[objects]"] = []
        }
        MinifigSimilarity.queryParams["sort"] = MinifigSimilarity.orderByDirection + MinifigSimilarity.orderByField
        tmpQueryParams = Object.assign({}, MinifigSimilarity.queryParams);
        tmpQueryParams["filter[objects]"] = JSON.stringify(MinifigSimilarity.queryParams["filter[objects]"])
        MinifigSimilarity.loading = true;
        return m.request({
            method: "GET",
            url: baseUrl + "minifig_similarities",
            params: tmpQueryParams,
            headers: {"Accept": "application/vnd.api+json"}
        }).then(res => {
            MinifigSimilarity.list = res.data
            MinifigSimilarity.list.forEach(e => e.attributes.id = e.id)
            MinifigSimilarity.numResults = res.meta.total
            MinifigSimilarity.page = tmpQueryParams["page[number]"]
            MinifigSimilarity.pageSize = tmpQueryParams["page[size]"]
            MinifigSimilarity.totalPages = Math.trunc(MinifigSimilarity.numResults / MinifigSimilarity.pageSize) + 1
            MinifigSimilarity.loading = false
        })
    }
}

module.exports = MinifigSimilarity