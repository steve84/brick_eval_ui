var m = require("mithril")
const SetList = require("../../views/set/SetList")

var baseUrl = "http://localhost:5000/api/"

var Set = {
    list: [],
    numResults: 0,
    totalPages: 0,
    page: 1,
    pageSize: 15,
    orderByField: "set_num",
    orderByDirection: "",
    loading: false,
    actualSet: {},
    queryParams: {},
    getSets: function() {
        Set.queryParams["page[number]"] = Set.page
        Set.queryParams["page[size]"] = Set.pageSize
        if (!Set.queryParams.hasOwnProperty("filter[objects]")) {
            Set.queryParams["filter[objects]"] = {}
        }
        Set.queryParams["sort"] = Set.orderByDirection + Set.orderByField
        tmpQueryParams = Object.assign({}, Set.queryParams);
        tmpQueryParams["filter[objects]"] = JSON.stringify(Set.queryParams["filter[objects]"])
        Set.loading = true;
        return m.request({
            method: "GET",
            url: baseUrl + "v_sets",
            params: tmpQueryParams,
            headers: {"Accept": "application/vnd.api+json"}
        }).then(res => {
            Set.list = res.data
            Set.list.forEach(e => e.attributes.id = e.id)
            Set.numResults = res.meta.total
            Set.page = tmpQueryParams["page[number]"]
            Set.pageSize = tmpQueryParams["page[size]"]
            Set.totalPages = Math.trunc(Set.numResults / Set.pageSize) + 1
            Set.loading = false
        })
    },
    getSetById: 
        id => {
            Set.loading = true
            Set.actualSet = {}
            m.request({
                method: "GET",
                url: baseUrl + "v_sets/" + id,
                headers: {"Accept": "application/vnd.api+json"}
            }).then(res => Set.actualSet = res.data.attributes)
        }
}

module.exports = Set