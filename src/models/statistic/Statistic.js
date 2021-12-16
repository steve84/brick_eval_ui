var m = require("mithril")

var baseUrl = "http://localhost:5000/api/"

var Statistic = {
    minifigStat: {},
    setStat: {},
    getSetStatistics:
        theme_id => m.request({
            method: "GET",
            url: baseUrl + "statistics",
            params: {
                "q": JSON.stringify({"filters": [
                    {"and": [
                        {"name": "is_set", "op": "eq", "val": true},
                        {"or": [
                            {"name": "theme_id", "op": "is_null"},
                            {"name": "theme_id", "op": "eq", "val": theme_id}
                        ]}
                    ]}
                ]})
            }
        }),
    getMinifigStatistics:
        () => m.request({
            method: "GET",
            url: baseUrl + "statistics",
            params: {
                "q": JSON.stringify({
                    "filters": [
                        {"name": "is_set", "op": "eq", "val": false}
                    ],
                    "single": true
                })
            }
        }).then(res => {
            Statistic.minifigStat = res
        }),
    
    getMinifigScoreQuantil:
        score => {
            if (Statistic.minifigStat && Statistic.minifigStat.hasOwnProperty("count")) {
                if (score < Statistic.minifigStat["lower_quartil"]) {
                    return 1
                } else if (score >= Statistic.minifigStat["lower_quartil"] && score < Statistic.minifigStat["median"]) {
                    return 2
                } else if (score >= Statistic.minifigStat["median"] && score < Statistic.minifigStat["upper_quartil"]) {
                    return 3
                } else {
                    return 4
                }
            }
            return -1
        },
    
    getScoreQuantil:
        (score, stats) => {
            if (stats && stats.hasOwnProperty("count")) {
                if (score < stats["lower_quartil"]) {
                    return 1
                } else if (score >= stats["lower_quartil"] && score < stats["median"]) {
                    return 2
                } else if (score >= stats["median"] && score < stats["upper_quartil"]) {
                    return 3
                } else {
                    return 4
                }
            }
            return -1
        }
}

module.exports = Statistic