var figures = %(figures)s;

var search_themes = null;
var search_states = null;
var search_text = null;
var is_exclusive = null;
var first_edition = null;
var minPrice = null;
var maxPrice = null;
var minYear = null;
var maxYear = null;

var minPriceTotal = null;
var maxPriceTotal = null;
var minYearTotal = null;
var maxYearTotal = null;

var actualPage = 1;
var totalPages = null;
var pageSize = 20;
var priceStepSize = 10;

var search_timeout = null;

var generateCard = obj => `<div class="ui card">    <div class="image">        <img alt="${obj.fig_name} (${obj.theme_name} / ${obj.root_theme_name})" src="${obj.minifig_img_link}" style="max-height: 202px; object-fit: contain;">    </div>    <div class="content">        ${obj.unique_character}        ${obj.minifig_rating}        ${obj.is_exclusive}        <div class="header">            <br />            ${obj.fig_name}        </div>        <div class="meta" style="font-style: italic; color: black;">            ${obj.theme}        </div>        <div class="description">            <div class="ui divided list">                <div class="item">                    <div class="header">Set-Bewertung <span data-tooltip="Die Seltenheit der einzelnen Steine" data-inverted=""><i class="circular small help icon"></i></span></div>                    ${obj.set_rating}                </div>                <div class="item">                    <div class="header">Set-Nummer</div>                    ${obj.set_num}                </div>                <div class="item">                    <div class="header">Set-Bezeichnung</div>                    ${obj.set_name}                </div>                <div class="item">                    <div class="header">Anzahl Teile</div>                    ${obj.num_parts}                </div>                <div class="item">                    <div class="header">Erscheinungsjahr</div>                    ${obj.year_of_publication}                </div>                <div class="item">                    <div class="header">Aufkleber</div>                    ${obj.has_stickers}                </div>                <div class="item">                    <div class="header">Figuren pro Set</div>                    ${obj.quantity}                </div>                <div class="item">                    <div class="header">Preis / Preis pro Stein</div>                    CHF ${obj.set_price} / ${obj.part_price}                </div>                <div class="item">                    <div class="header">Status <span data-tooltip="Wird der Artikel noch regul&auml;r produziert oder in K&uuml;rze aus dem Sortiment genommen" data-variation="multiline" data-inverted=""><i class="circular small help icon"></i></span></div>                    ${obj.eol}                </div>            </div>        </div>    </div>    <div class="extra content">        <div class="ui list">            <div class="item">                <img class="ui mini image" alt="Direktlink zu ${obj.set_name}" src="static/images/LEGO_logo_50px.png"/>                <div class="content">                    <a class="header" href="https://www.lego.com/de-ch/product/${obj.lego_slug}" target="_blank">LEGO Direktlink</a>                    <div class="description">CHF ${obj.set_price}</div>                </div>            </div>        </div>    </div></div>`;

var showModal = topic => $.modal(topic).modal('show');

var setSearchText = () => {
    if (!!search_timeout) {
        clearTimeout(search_timeout);
    }
    search_timeout = setTimeout(() => {
        search_text = $('#input_search_text').val();
        actualPage = 1;
        generateCards();
    }, 1000);
}


var generatePagination = () => {
    minPage = actualPage - 2;
    if (minPage < 1) {
        minPage = 1;
    }
    maxPage = actualPage + 2;
    if (maxPage > totalPages) {
        maxPage = totalPages;
    }
    output = '';
    if (actualPage === 1) {
        output += `<a class="icon disabled item"><i class="left chevron icon"></i></a>`;
    } else {
        output += `<a class="icon item" onclick=doPagination(${actualPage - 1})><i class="left chevron icon"></i></a>`;
    }
    for (i = minPage; i <= maxPage; i++) {
        if (totalPages === 1) {
            output += `<a class="disabled item">${i}</a>`;
        } else {
            if (i === actualPage) {
                output += `<a class="active item" onclick=doPagination(${i})>${i}</a>`;
            } else {
                output += `<a class="item" onclick=doPagination(${i})>${i}</a>`;
            }
        }
    }
    if (actualPage === totalPages) {
        output += `<a class="icon disabled item"><i class="right chevron icon"></i></a>`;
    } else {
        output += `<a class="icon item" onclick=doPagination(${actualPage + 1})><i class="right chevron icon"></i></a>`;
    }
    $('#pagination').html(output)
}


var doPagination = page => {
    actualPage = page;
    generateCards();
}

var printSearchParams = () => {
    console.log(`Page: ${actualPage}`);
    console.log(`Themes: ${search_themes}`);
    console.log(`Text: ${search_text}`);
    console.log(`EOL state: ${search_states}`);
    console.log(`Exclusive: ${is_exclusive}`);
    console.log(`First edition: ${first_edition}`);
    console.log(`Min Price: ${minPrice}`);
    console.log(`Max Price: ${maxPrice}`);
    console.log(`Min Year: ${minYear}`);
    console.log(`Max Year: ${maxYear}`);
}

var resetFilters = () => {
    if (!!search_timeout) {
        clearTimeout(search_timeout);
    }
    search_themes = null;
    search_states = null;
    search_text = null;
    is_exclusive = null;
    first_edition = null;
    minPrice = null;
    maxPrice = null;
    minYear = null;
    maxYear = null;
    actualPage = 1;
    $('#slider_price').slider('set rangeValue', minPriceTotal, maxPriceTotal, false);
    $('#slider_year_of_publication').slider('set rangeValue', minYearTotal, maxYearTotal, false);
    $('#checkbox_exclusive').checkbox('set unchecked');
    $('#checkbox_first_edition').checkbox('set unchecked');
    $('#dropdown_theme').dropdown('clear');
    $('#dropdown_status').dropdown('clear');
    $('#input_search_text').val(null);
    generateCards();
}


var generateCards = () => {
    printSearchParams();
    $('#content_figures').html('<div class="ui active centered inline loader"></div>');
    minPriceTotal = Math.floor(figures.map(obj => parseFloat(obj.set_price)).reduce((prev, cur) => prev <= cur ? prev : cur));
    maxPriceTotal = Math.ceil(figures.map(obj => parseFloat(obj.set_price)).reduce((prev, cur) => prev >= cur ? prev : cur));
    minYearTotal = figures.map(obj => +obj.year_of_publication).reduce((prev, cur) => prev <= cur ? prev : cur);
    maxYearTotal = figures.map(obj => +obj.year_of_publication).reduce((prev, cur) => prev >= cur ? prev : cur);
    result = figures.filter(obj => !obj || !search_states || search_states.search(obj.eol) > -1)
    result = figures.filter(obj => !obj || !search_states || search_states.search(obj.eol) > -1)
    result = result.filter(obj => !obj || !maxYear || +obj.year_of_publication <= maxYear)
    result = result.filter(obj => !obj || !minYear || +obj.year_of_publication >= minYear)
    result = result.filter(obj => !obj || !maxPrice || parseFloat(obj.set_price) <= maxPrice)
    result = result.filter(obj => !obj || !minPrice || parseFloat(obj.set_price) >= minPrice)
    result = result.filter(obj => !obj || !search_themes || search_themes.search(obj.root_theme_name) > -1)
    result = result.filter(obj => !obj || !first_edition || (obj.unique_character.length > 0 && first_edition))
    result = result.filter(obj => !obj || !is_exclusive || (obj.is_exclusive.length > 0 && is_exclusive))
    result = result.filter(obj => !obj || !search_text || obj.fig_name.toLowerCase().search(search_text.toLowerCase()) > -1 || obj.set_name.toLowerCase().search(search_text.toLowerCase()) > -1 || obj.set_num.toLowerCase().search(search_text.toLowerCase()) > -1)
    result = result.map(obj => generateCard(obj));
    totalPages = Math.ceil(result.length / pageSize);
    generatePagination();
    output = `<span>${result.length === 0 ? 0 : ((actualPage - 1) * pageSize) + 1} bis ${(actualPage * pageSize <= result.length ? actualPage * pageSize : result.length)} (Total Figuren: ${result.length})`;
    output += '<br /></span>';
    output += '<div class="ui five stackable cards" style="margin-top: 5px">';
    output += result.slice((actualPage - 1) * pageSize, actualPage * pageSize).join('');
    setTimeout(() => $('#content_figures').html(output), 300);
}

$(document).ready(() => {
    $.modal.settings.templates.wiki = () => {
        return {
            detachable: false,
            title: 'Wissenswertes',
            content: '%(wiki_page)s',
            classContent: 'scrolling',
            closeIcon: true,
            dimmerSettings: {
                closable : true,
            },
            restoreFocus: false
        }
    }
    
    $.modal.settings.templates.info = () => {
        return {
            detachable: false,
            title: 'Info',
            content: '%(info_page)s',
            classContent: 'scrolling',
            closeIcon: true,
            dimmerSettings: {
                closable : true,
            },
            restoreFocus: false
        }
    }
    generateCards();
    themes = new Set(figures.map(obj => obj.root_theme_name));
    states = new Set(figures.map(obj => obj.eol));
    $('#checkbox_exclusive').checkbox({
        onChecked: function() {
            actualPage = 1;
            is_exclusive = true;
            generateCards();
        },
        onUnchecked: function() {
            actualPage = 1;
            is_exclusive = null;
            generateCards();
        }
    });
    $('#checkbox_first_edition').checkbox({
        onChecked: function() {
            actualPage = 1;
            first_edition = true;
            generateCards();
        },
        onUnchecked: function() {
            actualPage = 1;
            first_edition = null;
            generateCards();
        }
    });
    $('#dropdown_theme').dropdown({
        values: Array.from(themes).map(t => {
            obj = {};
            obj["name"] = t;
            obj["value"] = t;
            return obj;
    }),
    onChange: (value, _, $_) => {search_themes = value; actualPage = 1; generateCards()}});
    $('#dropdown_status').dropdown({
        values: Array.from(states).map(t => {
            obj = {};
            obj["name"] = t;
            obj["value"] = t;
            return obj;
    }),
    onChange: (value, _, $_) => {search_states = value; actualPage = 1; generateCards()}});
    $('#slider_price').slider({
        min: Math.floor(minPriceTotal / priceStepSize) * priceStepSize,
        max: (Math.floor(maxPriceTotal / priceStepSize) + 1) * priceStepSize,
        start: Math.floor(minPriceTotal / priceStepSize) * priceStepSize,
        end: (Math.floor(maxPriceTotal / priceStepSize) + 1) * priceStepSize,
        step: priceStepSize,
        //labelDistance: priceStepSize * 5,
        onChange: (_, minValue, maxValue) => {
            minPrice = minValue;
            maxPrice = maxValue;
            actualPage = 1;
            generateCards();
        }
    });
    $('#slider_year_of_publication').slider({
        min: minYearTotal,
        max: maxYearTotal,
        start: minYearTotal,
        end: maxYearTotal,
        onChange: (_, minValue, maxValue) => {
            minYear = minValue;
            maxYear = maxValue;
            actualPage = 1;
            generateCards();
        }
    });
    $('.ui.accordion').accordion();
    $('#input_search_text').on('input', () => setSearchText());
    $('#button_reset').on('click', () => resetFilters());
    $('#button_info').on('click', () => showModal("info"));
    $('#button_wiki').on('click', () => showModal("wiki"));
});
