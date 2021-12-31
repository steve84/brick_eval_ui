var m = require("mithril")

var baseUrl = "http://localhost:5000/api/"

var Score = {
    list: [],
    numResults: 0,
    totalPages: 0,
    page: 1,
    pageSize: 15,
    orderByField: "score",
    orderByDirection: "-",
    loading: false,
    queryParams: {},
    getScores: 
        () => {
            Score.queryParams["page[size]"] = Score.pageSize
            Score.queryParams["page[number]"] = Score.page
            Score.queryParams["sort"] = Score.orderByDirection + Score.orderByField
            if (!Score.queryParams.hasOwnProperty("filter[objects]")) {
                Score.queryParams["filter[objects]"] = {}
            }
            tmpQueryParams = Object.assign({}, Score.queryParams)
            tmpQueryParams["filter[objects]"] = JSON.stringify(Score.queryParams["filter[objects]"])
            Score.loading = true
            m.request({
                method: "GET",
                url: baseUrl + "v_scores",
                params: tmpQueryParams,
                headers: {"Accept": "application/vnd.api+json"}
            }).then(res => {
                Score.list = res.data
                Score.list.forEach(e => e.attributes.id = e.id)
                Score.numResults = res.meta.total
                Score.page = tmpQueryParams["page[number]"]
                Score.pageSize = tmpQueryParams["page[size]"]
                Score.totalPages = Math.trunc(Score.numResults / Score.pageSize) + 1
                Score.loading = false
            })
    }
}

module.exports = Score