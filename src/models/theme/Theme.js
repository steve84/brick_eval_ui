var m = require("mithril")

var baseUrl = "http://localhost:5000/api/"


var reducer = (acc, cur) => {
    if(cur.children.length > 0) {
        acc[cur.id] = cur
        cur.children.reduce(reducer, acc)
    } else {
        acc[cur.id] = cur
    }
    return acc
}

var addFullName = (obj) => {
    Object.keys(obj).forEach(id => {
        var themeName = obj[id].name
        var parentId = obj[id].parent
        while (parentId) {
            themeName = obj[parentId].name + ";" + themeName
            parentId = obj[parentId].parent
        }
        obj[id]["fullName"] = themeName
    });
    return obj
}

var Theme = {
    dropdownList: [],
    lookup: {},
    getThemeHierarchy: 
        () => m.request(
                {
                    method: "GET",
                    url: baseUrl + "themes/hierarchy"
                }
            ).then(res => {
                Theme.lookup = addFullName(res.reduce(reducer, {}))
                Theme.dropdownList = res
                Theme.dropdownList.sort((t1, t2) => t1.name.localeCompare(t2.name))
                Theme.dropdownList.unshift({"name": "Alle", "id": null, "children": []})
        })
}

module.exports = Theme