import numpy as np
import pandas as pd
import unicodedata
import re
import requests

from pathlib import Path

def slugify(value, allow_unicode=False):
    value = str(value)
    if allow_unicode:
        value = unicodedata.normalize('NFKC', value)
    else:
        value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower())
    return re.sub(r'[-\s]+', '-', value).strip('-_')


def download(url, filename, always=False):
    if not always and Path(filename).is_file():
        return
    print('download file %s' % filename)
    get_response = requests.get(url, stream=True)
    with open(filename, 'wb') as f:
        for chunk in get_response.iter_content(chunk_size=1024):
            if chunk: # filter out keep-alive new chunks
                f.write(chunk)


def createFolder(path):
    Path(path).mkdir(parents=True, exist_ok=True)


def generateMenu(activeItem: str) -> str:
    html = '<div class="ui menu">'
    i = 1
    first_right = True
    for item in menu:
        if item['position'] == 'left':
            html += '<a class="%sheader item" tabindex="%d" href="%s">%s</a>' % ('active ' if item['name'] == activeItem else '', i, item['href'], item['name'])
        else:
            if first_right:
                html += '<div class="right menu"><a class="%sitem" tabindex="%d" href="%s">%s</a>' % ('active ' if item['name'] == activeItem else '', i, item['href'], item['name'])
                first_right = False
            else:
                html += '<a class="%sitem" tabindex="%d" href="%s">%s</a>' % ('active ' if item['name'] == activeItem else '', i, item['href'], item['name'])
        i += 1
    if not first_right:
        html += '</div>'    
    html += '</div>'
    return html


def createSnippet(title, meta_keywords, meta_description, header, snippet_name, outfile):
    base_template = ''
    with open('templates/base_template.html', 'r') as file:
        base_template = file.read()
    
    snippet = ''
    with open('snippets/%s.html' % snippet_name, 'r', encoding='utf-8') as file:
        snippet = file.read()
    
    with open(output_folder % outfile, 'w', encoding='utf-8') as file:
        file.write(base_template.format(meta_keywords.lower(), meta_description.lower(), title, generateMenu(title), header, snippet))


# select
# case when m.rebrickable_id is not null
# then 'https://cdn.rebrickable.com/media/sets/' || m.fig_num || '/' || m.rebrickable_id || '.jpg'
# else 'https://rebrickable.com/static/img/nil_mf.jpg' end as minifig_img_link,
# m.name as fig_name,
# t.name as theme_name,
# rt.name as root_theme_name,
# sc.rating,
# sc.score as minifig_score,
# im.quantity,
# m.has_unique_part,
# m.unique_character,
# s.set_num,
# s.eol,
# s.name as set_name,
# s.name_de as set_name_de,
# s.lego_slug as lego_slug,
# s.num_parts,
# sc.year_of_publication,
# s.has_stickers,
# scs.rating as set_rating,
# scs.score as set_score,
# sp.retail_price as set_price
# from (SELECT * FROM v_scores WHERE id IN (SELECT first_value(id) OVER (PARTITION BY is_set, entity_id ORDER BY calc_date DESC) from v_scores)) sc
# left join inventory_minifigs im on im.id = sc.entity_id
# left join minifigs m on m.id = im.fig_id
# left join inventories i on i.id = im.inventory_id
# left join sets s on s.id = i.set_id
# left join themes t on t.id = s.theme_id
# left join themes rt on rt.id = s.root_theme_id
# left join (SELECT * FROM v_scores WHERE id IN (SELECT first_value(id) OVER (PARTITION BY is_set, entity_id ORDER BY calc_date DESC) from v_scores)) scs on s.id = scs.entity_id and scs.is_set = true
# join (SELECT * FROM set_prices WHERE id IN (SELECT first_value(id) OVER (PARTITION BY set_id ORDER BY check_date DESC) from set_prices)) sp on sp.set_id = s.id
# where sc.is_set = false and s.eol not in ('-1', '0') and s.num_parts > 0 and m.has_unique_part is not null and not m.is_minidoll and sp.retail_price is not null;

output_folder = 'public/%s'
rebrickable_img_url = 'https://cdn.rebrickable.com/media/sets/'

menu = [
    {'name': 'Brickadvisor', 'href': 'index.html', 'position': 'left'},
    {'name': 'Impressum', 'href': 'impressum.html', 'position': 'right'},
    {'name': 'Datenschutz', 'href': 'privacy.html', 'position': 'right'}
]

max_star_rating = 4

star_mapping = {1: 'red', 2: 'orange', 3: 'yellow', 4: 'green'}
eol_mapping = {1: 'Verfügbar', 2: 'Einstellung in Kürze', 3: 'EOL erwartet'}

get_star_color = lambda x: star_mapping[x] if x > 0 and x <= max_star_rating else ''

generate_rating = lambda x: '<div class="ui %s rating disabled"><span data-tooltip="%d von %d Sternen" data-inverted="">%s</span></div>' % (get_star_color(x), x, max_star_rating, ''.join(['<i class="heart icon%s"></i>' % (' active' if i < x else '') for i in range(0, max_star_rating)])) if not np.isnan(x) else '-'
generate_exclusive_icon = lambda x: '<span class="right floated" data-tooltip="Figur besitzt mindestens ein exklusives Teil" data-position="left center" data-inverted=""><i class="right floated orange gem icon"></i></span>' if x else ''
generate_unique_icon = lambda x: '<span class="right floated" data-tooltip="Erstauflage" data-position="left center" data-inverted=""><i class="right floated yellow medal icon"></i></span>' if x else ''

df = pd.read_csv('figures.csv')
df = df.drop_duplicates()

df['filename'] = df['minifig_img_link'].apply(lambda x: x.replace(rebrickable_img_url, '') if x.startswith(rebrickable_img_url) else None)
df['part_price'] = df.apply(lambda x: (x['set_price'] / (100 * x['num_parts'])) if x['set_price'] and not np.isnan(x['set_price']) else None, axis=1)
df['is_exclusive'] = df.apply(lambda x: generate_exclusive_icon(x['has_unique_part']), axis=1)
df['minifig_rating_html'] = df.apply(lambda x: generate_rating(x['rating']), axis=1)
df['set_rating_html'] = df.apply(lambda x: generate_rating(x['set_rating']), axis=1)
df['eol'] = df.apply(lambda x: eol_mapping[x['eol']], axis=1)
df['theme'] = df.apply(lambda x: '%s / %s' % (x['root_theme_name'], x['theme_name']) if x['theme_name'] != x['root_theme_name'] else x['theme_name'], axis=1)
df['has_stickers'] = df.apply(lambda x: 'Ja' if x['has_stickers'] else 'Nein', axis=1)
df['set_price'] = df.apply(lambda x: '%.2f' % (x['set_price'] / 100) if x['set_price'] and not np.isnan(x['set_price']) else '-', axis=1)
df['part_price'] = df.apply(lambda x: '%.4f' % x['part_price'] if x['set_price'] else '-', axis=1)
df['set_num'] = df.apply(lambda x: x['set_num'].split('-')[0], axis=1)
df['minifig_img_link'] = df.apply(lambda x: 'static/images/%s' % x['filename'] if x['filename'] else 'static/images/nil_mf.jpg', axis=1)
df['unique_character'] = df.apply(lambda x: generate_unique_icon(x['unique_character']), axis=1)
df['set_name'] = df.apply(lambda x: x['set_name_de'] if x['set_name_de'] else x['set_name'] , axis=1)

df = df.sort_values(by=['has_unique_part', 'minifig_score', 'unique_character', 'part_price'], ascending=[False, False, False, True])

for subpath in df[~df['filename'].isna()]['filename']:
    folder, filename = subpath.split('/')
    createFolder('public/static/images/%s' % folder)
    download((rebrickable_img_url + '%s') % subpath, 'public/static/images/%s/%s' % (folder, filename))


figure_card = ''
with open('snippets/figure_card.html', 'r') as file:
    figure_card = file.read()

df['year_of_publication'] = df['year_of_publication'].astype(object)

main_js_template = ''
with open('templates/main_template.js', 'r') as file:
    main_js_template = file.read()


wiki_page = ''
with open('snippets/wiki.html', 'r', encoding='utf-8') as file:
    wiki_page = file.read()

info_page = ''
with open('snippets/home.html', 'r', encoding='utf-8') as file:
    info_page = file.read()

createFolder(output_folder % 'static/js')
with open(output_folder % 'static/js/main.js', 'w', encoding='utf-8') as file:
    createFolder(output_folder % 'static/js')
    tmp = main_js_template % {'figures': df.to_dict(orient='records'), 'wiki_page': wiki_page.replace('\n', ''), 'info_page': info_page.replace('\n', '')}
    tmp = tmp.replace('True', 'true')
    tmp = tmp.replace('False', 'false')
    tmp = tmp.replace('None', 'null')
    tmp = tmp.replace(': nan', ': null')
    file.write(tmp)

# createSnippet('Home', '', 'brickadvisor,lego,figuren,wertanlage,preisvergleich,minifiguren,eol', 'Herzlich Willkommen bei Brickadvisor.ch', 'home', 'index.html')
# createSnippet('Wissenswertes', '', '', 'Wissenswertes', 'wiki', 'wiki.html')
createSnippet('Impressum', 'impressum,kelt 9,haftung,inhalte,links', 'Impressum der Webseite brickadvisor.ch', 'Impressum', 'impressum', 'impressum.html')
createSnippet('Datenschutz', 'datenschutz,kelt 9,haftungausschluss,datenschutzgesetz,artikel 13', '', 'Datenschutz', 'privacy', 'privacy.html')

base_template = ''
with open('templates/base_template.html', 'r') as file:
    base_template = file.read()


with open(output_folder % 'index.html', 'w', encoding='utf-8') as file:
    figure_cards = '<div class="ui segment">'
    figure_cards += '<div class="ui accordion"><div class="active title"><i class="dropdown icon"></i>Filtereinstellungen</div><div class="active content">'
    figure_cards += '<form class="ui form"><div class="equal width fields">'
    figure_cards += '<div class="field"><label>Suche Figuren</label><div class="ui input"><input type="text" placeholder="Charakter, Set-Bezeichnung oder Set-Nummer..." id="input_search_text"></div></div>'
    figure_cards += '<div class="field"><label>Themen</label><div class="ui clearable multiple search selection dropdown" id="dropdown_theme"><input type="hidden" name="dropdown_theme"><i class="dropdown icon"></i><div class="default text">Wähle ein Thema aus</div></div></div></div>'
    figure_cards += '<div class="equal width fields"><div class="field"><label>Status</label><div class="ui clearable multiple search selection dropdown" id="dropdown_status"><input type="hidden" name="dropdown_status"><i class="dropdown icon"></i><div class="default text">Wähle den Status aus</div></div></div>'
    figure_cards += '<div class="field"><label>Weitere Eigenschaften</label><div class="ui checkbox" id="checkbox_exclusive"><input type="checkbox"><label>Nur exklusive Figuren</label></div><br/><div class="ui checkbox" id="checkbox_first_edition"><input type="checkbox"><label>Nur Erstauflagen</label></div></div></div>'
    figure_cards += '<div class="equal width fields"><div class="field"><label>Bewertung Figur</label><div class="ui clearable selection dropdown" id="dropdown_fig_rating"><input type="hidden" name="dropdown_fig_rating"><i class="dropdown icon"></i><div class="default text"></div></div></div><div class="field"><label>Bewertung Set</label><div class="ui clearable selection dropdown" id="dropdown_set_rating"><input type="hidden" name="dropdown_set_rating"><i class="dropdown icon"></i><div class="default text"></div></div></div></div>'
    figure_cards += '<div class="equal width fields"><div class="field"><label>Preisspanne</label><br/><div class="ui labeled ticked range slider" id="slider_price"></div></div></div>'
    figure_cards += '<div class="equal width fields"><div class="field"><label>Veröffentlichungsjahr</label><br/><div class="ui labeled ticked range slider" id="slider_year_of_publication"></div></div></div></form>'
    figure_cards += '<button class="ui primary button" id="button_reset">Filter zurücksetzen</button><button class="ui button" id="button_info"><i class="info icon"></i>Info</button><button class="ui button" id="button_wiki"><i class="book icon"></i>Wiki</button></div>'
    figure_cards += '<div class="ui segment"><div class="ui center aligned pagination menu" id="pagination"></div></div>'
    figure_cards += '<span id="content_figures"></span>'

    file.write(base_template.format('brickadvisor,figuren,lego,seltenheit,eol,star wars,marvel,ninjago,dc,wertanlage,uvp,links,exklusiv,bewertung,preis pro stein', 'Durchstöbere mit Hilfe von verschiedenen Filtern (Exklusivität, Erstausgaben von Charakteren, Bewertung der Einzelsteine, EOL-Status der dazugehörigen Sets) auf Brickadvisor die aktuell verfügbaren Lego Minifiguren aus den gängigen Themengebieten wie Star Wars, Marvel, DC Comics oder Ninjago. Egal ob als Sammelobjekt für die Vitrine, zum Tauschen unter Gleichgesinnten oder als Wertanlage, dank Brickadvisor verpasst Du keine interessante Figur mehr.', 'Figuren', generateMenu('Figuren'), 'Figuren', figure_cards))


        