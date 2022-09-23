var m = require("mithril")
var SetPrice = require("../../models/set/SetPrice")

var Table = require("../common/Table")

var SetPriceList =  {
    oninit: (vnode) => {
        vnode.state.set_id = vnode.attrs.set_id
        vnode.state.list = []
        vnode.state.cols = [
            {"name": "Datum der Überprüfung", "property": "check_date", "sortable": false, "fn": row => row["check_date"] ? new Date(row["check_date"]).toLocaleDateString() : ""},
            {"name": "Verkaufspreis", "property": "retail_price", "sortable": false, "fn": row => row ? (row["retail_price"] / 100).toFixed(2) : ""}
        ],
        SetPrice.getPricesBySetId(vnode.state.set_id).then(res => {
            vnode.state.list = res.data
            SetPrice.loading = false
        })
    },
    view: (vnode) => [
        m(Table, {
            "pageable": false,
            "isLoading": () => SetPrice.loading,
            "getList": () => vnode.state.list,
            "getNumResults": () => 100,
            "getOrderByField": () => "",
            "getOrderByDirection": () => "asc",
            "fn": () => SetPrice.getPricesBySetId(vnode.state.set_id).then(res => vnode.state.list = res.data),
            "cols": vnode.state.cols,
            "getPage": () => 1,
            "getTotalPages": () => 1
        })
    ]
}

module.exports = SetPriceList