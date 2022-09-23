var MiscUtil = {
    deepCopy: obj => JSON.parse(JSON.stringify(obj)),
    hasProperty: (obj, prop) => !!obj ? Object.prototype.hasOwnProperty.call(obj, prop) : false,
    hasPropertyPath: (obj, path, separator) => {
        if (!obj) {
            return false
        }
        if (!separator) {
            separator = "."
        }
        parts = path.split(separator)
        if (parts.length === 0 || !MiscUtil.hasProperty(obj, parts[0])) {
            return false
        } else {
            if (parts.length === 1) {
                return true
            } else {
                return MiscUtil.hasPropertyPath(obj[parts[0]], parts.slice(1).join(separator), separator)
            }
        }
    }
}

module.exports = MiscUtil