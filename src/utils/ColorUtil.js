var ColorUtil = {
    // https://24ways.org/2010/calculating-color-contrast/
    calculateFontColor: (backgroundHex) => {
        var r = parseInt(backgroundHex.substr(0,2),16);
        var g = parseInt(backgroundHex.substr(2,2),16);
        var b = parseInt(backgroundHex.substr(4,2),16);
        var yiq = ((r*299)+(g*587)+(b*114))/1000;
        return (yiq >= 128) ? 'black' : 'white';
    }
}

module.exports = ColorUtil