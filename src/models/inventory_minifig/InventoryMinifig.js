var m = require("mithril")

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
                InventoryMinifig.list = res.data
                InventoryMinifig.list.forEach(e => {
                    e.attributes.id = e.id
                    minifig_id = e.relationships.minifig.data.id
                    minifig_attrs = res.included.find(i => i.type === "minifigs" && i.id === minifig_id)
                    if (minifig_attrs) {
                        e.attributes.minifig = minifig_attrs.attributes
                        e.attributes.minifig.id = minifig_attrs.id
                    }
                    score_id = e.relationships.score.data ? e.relationships.score.data.id : null
                    if (score_id) {
                        score_attrs = res.included.find(i => i.type === "scores" && i.id === score_id)
                        if (score_attrs) {
                            e.attributes.score = score_attrs.attributes
                        }
                    }
                })
                InventoryMinifig.page = tmpQueryParams["page[number]"]
                InventoryMinifig.pageSize = tmpQueryParams["page[size]"]
                InventoryMinifig.totalPages = Math.trunc(InventoryMinifig.numResults / InventoryMinifig.pageSize) + 1
                InventoryMinifig.numResults = res.meta.total
                InventoryMinifig.loading = false
            })
        },
    getInventoryMinifigById:
        id => {
            m.request({
                method: "GET",
                url: baseUrl + "inventory_minifigs/" + id,
                headers: {"Accept": "application/vnd.api+json"},
                params: {"include": "minifig,score,inventory_minifig_rel"}
            }).then(res => {
                InventoryMinifig.actualInventoryMinifig = res.data.attributes
                minifig_id = res.data.relationships.minifig.data.id
                minifig_attrs = res.included.find(i => i.type === "minifigs" && i.id === minifig_id)
                if (minifig_attrs) {
                    InventoryMinifig.actualInventoryMinifig.minifig = minifig_attrs.attributes
                }
                score_id = res.data.relationships.score.data ? res.data.relationships.score.data.id : null
                if (score_id) {
                    score_attrs = res.included.find(i => i.type === "scores" && i.id === score_id)
                    if (score_attrs) {
                        InventoryMinifig.actualInventoryMinifig.score = score_attrs.attributes
                    }
                }
                inventory_minifig_rel_id = res.data.relationships.inventory_minifig_rel.data && res.data.relationships.inventory_minifig_rel.data.length === 1  ? res.data.relationships.inventory_minifig_rel.data[0].id : null
                if (inventory_minifig_rel_id) {
                    inventory_minifig_rel_attrs = res.included.find(i => i.type === "minifig_inventory_rel" && i.id === inventory_minifig_rel_id)
                    if (inventory_minifig_rel_attrs) {
                        InventoryMinifig.actualInventoryMinifig.inventory_id = inventory_minifig_rel_attrs.relationships.inventory.data.id
                    }
                }
            })
        }
}

module.exports = InventoryMinifig