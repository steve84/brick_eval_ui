var m = require("mithril")

var baseUrl = "http://localhost:5000/api/"

var PartColorFrequency = {
    list: [],
    loading: false,
    queryParams: {},
    getPartColorFrequenciesByElementId: 
        element_ids => {
            PartColorFrequency.queryParams["results_per_page"] = element_ids.length
            if (!PartColorFrequency.queryParams.hasOwnProperty("q")) {
                PartColorFrequency.queryParams["q"] = {}
            }
            PartColorFrequency.queryParams["q"]["filters"] = [{"name": "id", "op": "in", "val": element_ids}]
            tmpQueryParams = Object.assign({}, PartColorFrequency.queryParams)
            tmpQueryParams["q"] = JSON.stringify(PartColorFrequency.queryParams["q"])
            PartColorFrequency.loading = true
            return new Promise(resolve => resolve(m.request({
                method: "GET",
                url: baseUrl + "part_color_frequencies",
                params: tmpQueryParams
            })))
    }
}

module.exports = PartColorFrequency