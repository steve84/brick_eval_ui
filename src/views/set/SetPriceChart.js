var m = require("mithril")

var SetPrice = require("../../models/set/SetPrice")


var SetPriceChart =  {
    oninit: (vnode) => {
        vnode.state.set_id = vnode.attrs.set_id
        vnode.state.list = []
        SetPrice.getPricesBySetId(vnode.state.set_id).then(res => {
            vnode.state.list = res.data
            SetPrice.loading = false
            ctx = $('#setPriceChart')
            new Chart(ctx, {
                type: "line",
                data: {
                    labels: res.data.map(p => new Date(p.attributes.check_date).toLocaleDateString()),
                    datasets: [{
                        label: "Price",
                        data: res.data.map(p => (p.attributes.retail_price / 100).toFixed(2))
                    }]
                }
            })
        })
    },
    view: () => [
        m("canvas", {
            id: "setPriceChart"
        })
    ]
}

module.exports = SetPriceChart