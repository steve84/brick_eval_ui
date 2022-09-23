var m = require("mithril")

var baseUrl = "http://localhost:5000/api/"

var SetPrice = {
    loading: false,
    queryParams: {},
    getPricesBySetId: set_id => {
        SetPrice.queryParams = {
            "page[number]": 1,
            "page[size]": 100,
            "filter[objects]": JSON.stringify([{"name":"set_id","op":"eq", "val": set_id}])
        }
        SetPrice.loading = true;
        return m.request({
            method: "GET",
            url: baseUrl + "set_prices",
            params: SetPrice.queryParams,
            headers: {"Accept": "application/vnd.api+json"}
        })
    }
}

module.exports = SetPrice