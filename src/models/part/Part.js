var m = require("mithril")

var baseUrl = "http://localhost:5000/api/"

var Part = {
    list: [],
    numResults: 0,
    totalPages: 0,
    page: 1,
    pageSize: 15,
    orderByField: "part_num",
    orderByDirection: "",
    loading: false,
    actualSet: {},
    queryParams: {},
    getParts: function() {
        Part.queryParams["page[number]"] = Part.page
        Part.queryParams["page[size]"] = Part.pageSize
        if (!Part.queryParams.hasOwnProperty("filter[objects]")) {
            Part.queryParams["filter[objects]"] = []
        }
        Part.queryParams["sort"] = Part.orderByDirection + Part.orderByField
        tmpQueryParams = Object.assign({}, Part.queryParams);
        tmpQueryParams["filter[objects]"] = JSON.stringify(Part.queryParams["filter[objects]"])
        Part.loading = true;
        m.request({
            method: "GET",
            url: baseUrl + "v_parts",
            params: tmpQueryParams,
            headers: {"Accept": "application/vnd.api+json"}
        }).then(res => {
            Part.list = res.data
            Part.list.forEach(e => e.attributes.id = e.id)
            Part.numResults = res.meta.total
            Part.page = tmpQueryParams["page[number]"]
            Part.pageSize = tmpQueryParams["page[size]"]
            Part.totalPages = Math.trunc(Part.numResults / Part.pageSize) + 1
            Part.loading = false
        })
    }
}

module.exports = Part