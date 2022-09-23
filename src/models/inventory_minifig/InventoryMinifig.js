var m = require("mithril")

var JsonUtil = require("../../utils/JsonUtil")
var MiscUtil = require("../../utils/MiscUtil")

var baseUrl = "http://localhost:5000/api/"

var InventoryMinifig = {
    list: [],
    numResults: 0,
    totalPages: 0,
    page: 1,
    pageSize: 15,
    orderByField: "id",
    orderByDirection: "",
    loading: false,
    queryParams: {},
    actualInventoryMinifig: {},
    getMinifigsByInventoryId: 
        inventory_id => {
            InventoryMinifig.loading = true
            InventoryMinifig.queryParams["page[number]"] = InventoryMinifig.page
            InventoryMinifig.queryParams["page[size]"] = InventoryMinifig.pageSize
            if (!InventoryMinifig.queryParams.hasOwnProperty("filter[objects]")) {
                InventoryMinifig.queryParams["filter[objects]"] = {}
            }
            InventoryMinifig.queryParams["filter[objects]"] = [{"name": "inventory_id", "op": "eq", "val": inventory_id}]
            InventoryMinifig.queryParams["sort"] = InventoryMinifig.orderByDirection + InventoryMinifig.orderByField
            tmpQueryParams = Object.assign({}, InventoryMinifig.queryParams)
            tmpQueryParams["filter[objects]"] = JSON.stringify(InventoryMinifig.queryParams["filter[objects]"])
            tmpQueryParams["include"] = "minifig,score"
            InventoryMinifig.loading = true
            m.request({
                method: "GET",
                url: baseUrl + "inventory_minifigs",
                params: tmpQueryParams,
                headers: {"Accept": "application/vnd.api+json"}
            }).then(res => {
                enriched_data = JsonUtil.enrichResponse(res)
                InventoryMinifig.list = []
                if (MiscUtil.hasPropertyPath(enriched_data, "data")) {
                    InventoryMinifig.list = enriched_data.data
                    InventoryMinifig.page = tmpQueryParams["page[number]"]
                    InventoryMinifig.pageSize = tmpQueryParams["page[size]"]
                    InventoryMinifig.totalPages = Math.trunc(InventoryMinifig.numResults / InventoryMinifig.pageSize) + 1
                    InventoryMinifig.numResults = res.meta.total
                }
                InventoryMinifig.loading = false
            })
        },
    getInventoryMinifigById:
        id => {
            m.request({
                method: "GET",
                url: baseUrl + "inventory_minifigs/" + id,
                headers: {"Accept": "application/vnd.api+json"},
                params: {"include": "minifig,score,inventory_minifig_rel,inventories"}
            }).then(res => {
                enriched_resp = JsonUtil.enrichResponse(res)
                mir = enriched_resp.included.find(i => i.type === "minifig_inventory_rel")
                if (mir && MiscUtil.hasPropertyPath(mir, "relationships.inventory.data.id")) {
                    enriched_resp.data.attributes.minifig_inventory_id = mir.relationships.inventory.data.id
                }
                InventoryMinifig.actualInventoryMinifig = enriched_resp.data.attributes
            })
        }
}

module.exports = InventoryMinifig