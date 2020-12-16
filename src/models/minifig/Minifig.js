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
    actualMinifig: {},
    getMinifigById:
        id => m.request({
            method: "GET",
            url: baseUrl + "minifigs/" + id
        }).then(res => {
            Minifig.actualMinifig = res
        })
}

module.exports = Minifig