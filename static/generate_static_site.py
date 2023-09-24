import numpy as np
import pandas as pd
import os
import unicodedata
import re
import requests

from bs4 import BeautifulSoup
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse



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


def generateMenu(activeItem: str, depth = 0) -> str:
    html = '<div class="ui stackable menu">'
    i = 1
    first_right = True
    for index, item in enumerate(menu):
        if item['position'] == 'left':
            if len(item['children']) > 0:
                html += '<div class="ui dropdown item" id="dropdown_menu_minifigures">%s<i class="dropdown icon"></i><div class="menu">' % item['name']
                html += '%s</div></div>' % ''.join(['<a class="item" href="%s">%s</a>' % ('../'.join(['' for x in range(0, depth + 1)]) + it['href'], it['name']) for it in item['children']])
            else:
                html += '<a class="%s %s item" href="%s">%s</a>' % ('active ' if item['name'] == activeItem else '', 'header ' if index == 0 else '', '../'.join(['' for x in range(0, depth + 1)]) + item['href'], item['name'])
        else:
            if first_right:
                html += '<div class="right menu"><a class="%sitem"href="%s">%s</a>' % ('active ' if item['name'] == activeItem else '', '../'.join(['' for x in range(0, depth + 1)]) + item['href'], item['name'])
                first_right = False
            else:
                html += '<a class="%sitem" href="%s">%s</a>' % ('active ' if item['name'] == activeItem else '', '../'.join(['' for x in range(0, depth + 1)]) + item['href'], item['name'])
        i += 1
    if not first_right:
        html += '</div>'
    html += '</div>'
    return html


def createSitemap():
    with open(output_folder % 'sitemap.xml', 'w', encoding='utf-8') as sitemap_file:
        prefix = 'https://www.brickadvisor.ch'
        urls = []

        for root, dirs, files in os.walk("public"):
            for file in files:
                if file.endswith(".html"):
                    urls.append('%s/%s' % (prefix, os.path.join(root, file).replace('public\\', '').replace('\\', '/')))

        df = pd.DataFrame(urls, columns=["loc"])
        df['lastmod'] = str(datetime.now().date())
        sitemap_file.write(df.to_xml(root_name="urlset", row_name="url", xml_declaration=True, index=False, namespaces={'': 'http://www.sitemaps.org/schemas/sitemap/0.9'}))


def createSnippet(title, meta_keywords, meta_description, header, snippet_name, outfile):
    base_template = ''
    with open('templates/base_template.html', 'r') as file:
        base_template = file.read()
    
    snippet = ''
    with open('snippets/%s.html' % snippet_name, 'r', encoding='utf-8') as file:
        snippet = file.read()
    
    with open(output_folder % outfile, 'w', encoding='utf-8') as file:
        file.write(base_template.format(meta_keywords.lower(), meta_description, title, generateMenu(title), header, snippet, 'static/'))


def createCardsSnippet(title, meta_keywords, meta_description, header, paragraph, snippet_name, outfile, depth):
    base_template = ''
    with open('templates/base_template.html', 'r') as file:
        base_template = file.read()

    snippet = ''
    with open('snippets/%s.html' % snippet_name, 'r') as file:
        snippet = file.read()

    createFolder( '/'.join((output_folder % outfile).split('/')[:-1]))
    with open(output_folder % outfile, 'w', encoding='utf-8') as file:
        figure_cards = '<p>%s</p>' % paragraph
        figure_cards += '<div class="ui segment">'
        figure_cards += '<div class="ui accordion"><div class="active title"><i class="dropdown icon"></i>Filtereinstellungen</div><div class="active content">'
        figure_cards += '<form class="ui form"><div class="equal width fields">'
        figure_cards += '<div class="field"><label>Suche Figuren</label><div class="ui input"><input type="text" placeholder="Charakter, Set-Bezeichnung oder Set-Nummer..." id="input_search_text"></div></div>'
        figure_cards += '<div class="field"><label>Themen</label><div class="ui%s clearable multiple search selection dropdown" id="dropdown_theme"><input type="hidden" name="dropdown_theme" value="Star Wars"><i class="dropdown icon"></i><div class="default text">Wähle ein Thema aus</div></div></div></div>' % (' disabled' if len(outfile.split('/')) >= 3 and outfile.index('minifigures') > -1 else '')
        figure_cards += '<div class="equal width fields"><div class="field"><label>Status</label><div class="ui clearable multiple search selection dropdown" id="dropdown_status"><input type="hidden" name="dropdown_status"><i class="dropdown icon"></i><div class="default text">Wähle den Status aus</div></div></div>'
        figure_cards += '<div class="field"><label>Weitere Eigenschaften</label><div class="ui checkbox" id="checkbox_exclusive"><input type="checkbox"><label>Nur exklusive Figuren</label></div><br/><div class="ui checkbox" id="checkbox_first_edition"><input type="checkbox"><label>Nur Erstauflagen</label></div></div></div>'
        figure_cards += '<div class="equal width fields"><div class="field"><label>Bewertung Figur</label><div class="ui clearable selection dropdown" id="dropdown_fig_rating"><input type="hidden" name="dropdown_fig_rating"><i class="dropdown icon"></i><div class="default text"></div></div></div><div class="field"><label>Bewertung Set</label><div class="ui clearable selection dropdown" id="dropdown_set_rating"><input type="hidden" name="dropdown_set_rating"><i class="dropdown icon"></i><div class="default text"></div></div></div></div>'
        figure_cards += '<div class="equal width fields"><div class="field"><label>Preisspanne</label><br/><div class="ui labeled ticked range slider" id="slider_price"></div></div></div>'
        figure_cards += '<div class="equal width fields"><div class="field"><label>Veröffentlichungsjahr</label><br/><div class="ui labeled ticked range slider" id="slider_year_of_publication"></div></div></div></form>'
        figure_cards += '<button class="ui primary button" id="button_reset">Filter zurücksetzen</button><button class="ui button" id="button_wiki"><i class="book icon"></i>Wiki</button></div></div></div>'
        figure_cards += '<div class="ui segment"><div class="ui segment"><div class="ui center aligned pagination menu" id="pagination_top"></div></div>'
        figure_cards += '<span id="content_figures"></span>'
        figure_cards += '<div class="ui segment"><div class="ui center aligned pagination menu" id="pagination_bottom"></div></div>'

        file.write(base_template.format(meta_keywords.lower(), meta_description, title, generateMenu(title, depth), header, figure_cards, '../'.join(['' for x in range(0, depth + 1)]) + 'static/'))


def generateCardExtraContent(data_row):
    card_extra_content_template = ''
    with open('snippets/card_extra_content.html', 'r') as file:
        card_extra_content_template = file.read()

    output = ''
    # LEGO
    output += card_extra_content_template.format('Lego&#174; Direktlink zu %(set_name)s' % data_row, 'LEGO_logo_50px.png', 'https://www.lego.com/de-ch/product/%(lego_slug)s' % data_row, 'Lego&#174; Direktlink', 'CHF %(set_price)s' % data_row)
    # Amazon
    output += card_extra_content_template.format('Amazon Suchlink zu %(set_name)s' % data_row,  'amazon_logo_50px.png', 'https://www.amazon.de/gp/search?ie=UTF8&tag=brickadvisor-21&linkCode=ur2&linkId=33c68d982720ef189b223648dfcba6d7&camp=1638&creative=6742&index=toys&keywords=Lego %(set_num)s' % data_row, 'Amazon-Suchlink',  'Preis nicht verfügbar')
    # Alternate
    if pd.notna(data_row['alternate_price']) and pd.notna(data_row['alternate_slug']):
        output += card_extra_content_template.format( 'Alternate Direktlink zu %(set_name)s' % data_row, 'alternate_logo_50px.png', 'https://www.awin1.com/cread.php?awinmid=9309&awinaffid=1307233&ued=https://www.alternate.ch%(alternate_slug)s?partner=chdezanox' % data_row, 'Alternate Direktlink', 'CHF %(alternate_price)s' % data_row)

    return output


def determineRarityColor(score):
    if score == 1:
        return 'rgba(190,199,199,%s)'
    elif score == 2:
        return 'rgba(214,195,114,%s)'
    elif score == 3:
        return 'rgba(188,69,26,%s)'
    return 'rgba(0,0,0,%s)'


def generateCardCss(is_unique, is_exclusive, high_score):
    score = 0
    if is_unique:
        score += 1
    if is_exclusive:
        score += 1
    if high_score:
        score += 1

    color = determineRarityColor(score)

    return 'border: %s; border-style: solid; border-width: 1px; box-shadow: none; background: %s;' % (color % '1.0', color % '0.15')


def generateCardContentCss(is_unique, is_exclusive, high_score):
    score = 0
    if is_unique:
        score += 1
    if is_exclusive:
        score += 1
    if high_score:
        score += 1

    color = determineRarityColor(score)

    return 'background: linear-gradient(135deg, %s %s, %s %s, transparent %s, transparent %s);' % (color % '1.0', '0%', color % '1.0', '0%', '25%', '100%')


def getAlternateInfo(set_list, csv_output_file = 'alternate_info.csv'):
    if Path(csv_output_file).is_file():
        return pd.read_csv(csv_output_file)
    else:
        output_list = {'set_num': list(), 'alternate_slug': list(), 'alternate_price': list()}
        for set in set_list:
            resp = requests.get(alternate_base_search_url % set.split('-')[0])
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, features='lxml')
                suggestions = soup.find_all('a', {'class': ['suggest-entry', 'mb-1']})
                if len(suggestions) == 1:
                    suggest = suggestions[0]
                    suggest_text = suggest.findAll('span', 'text-font')
                    if len(suggest_text) != 1 or suggest_text[0].text.find(set.split('-')[0]) == -1:
                        print('Wrong search result %s' % set)
                        continue
                    url_path = urlparse(suggest.get('href')).path
                    output_list['alternate_slug'].append(url_path)
                    prices = suggest.findAll('span', 'suggest-price')
                    if len(prices) == 1:
                        price = int(float(prices[0].text.replace('CHF ', '').replace(',', '.'))*100)
                        output_list['alternate_price'].append(price)
                        print('Get price %d' % price)
                    else:
                        print('Price not found %s' % set)
                        output_list['alternate_price'].append(None)
                    output_list['set_num'].append(str(set))
                else:
                    print('Search results not unique %s' % set)
            else:
                print('Cannot retrieve set %s' % set)

        df = pd.DataFrame.from_dict(output_list)
        df.to_csv(csv_output_file, index=False)
        return df

# select
# case when m.rebrickable_id is not null
# then 'https://cdn.rebrickable.com/media/thumbs/sets/' || m.fig_num || '/' || m.rebrickable_id || '.jpg/300x300p.jpg'
# else 'https://rebrickable.com/static/img/nil_mf.jpg' end as minifig_img_link,
# m.name as fig_name,
# t.name as theme_name,
# rt.name as root_theme_name,
# sc.rating,
# sc.score as minifig_score,
# im.quantity,
# m.has_unique_part,
# m.unique_parts,
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
# where sc.is_set = false and s.eol not in ('-1', '0') and s.num_parts > 0 and m.has_unique_part is not null and not m.is_minidoll and sp.retail_price is not null and i.is_latest
# order by s.set_num, m.name;

output_folder = 'public/%s'
rebrickable_img_url = 'https://cdn.rebrickable.com/media/thumbs/sets/'
alternate_base_search_url = 'https://www.alternate.ch/search-suggestions.xhtml?q=lego %s'

menu = [
    {'name': 'Brickadvisor', 'href': 'index.html', 'position': 'left', 'children': []},
    {'name': 'Minifiguren', 'href': None, 'position': 'left', 'children': [
        {'name': 'Alle Themen', 'href': 'minifigures/index.html', 'position': 'left', 'children': []}
    ]},
    {'name': 'Impressum', 'href': 'impressum.html', 'position': 'right', 'children': []},
    {'name': 'Datenschutz', 'href': 'privacy.html', 'position': 'right', 'children': []}
]

top_themes = [
    'Star Wars',
    'Harry Potter',
    'Super Heroes Marvel',
    'Super Heroes DC',
    'Ninjago',
    'Collectible Minifigures',
    'Icons',
    'Minecraft',
    'Indiana Jones'
]

max_star_rating = 4

star_mapping = {1: 'red', 2: 'orange', 3: 'yellow', 4: 'green'}
eol_mapping = {1: 'Verfügbar', 2: 'Einstellung in Kürze', 3: 'EOL erwartet'}
part_cat_mapping = {'Minifig Headwear': 'Kopfbedeckung', 'Minifig Lower Body': 'Beine', 'Minifig Upper Body': 'Torso', 'Minifig Heads': 'Kopf', 'Minifig Accessories': 'Zubehör', 'Flags, Signs, Plastics and Cloth': 'Bekleidung'}

get_star_color = lambda x: star_mapping[x] if x > 0 and x <= max_star_rating else ''
get_figure_part = lambda x: part_cat_mapping[x] if x in part_cat_mapping.keys() else x

generate_unique_parts = lambda x: ', '.join(sorted([get_figure_part(y) for y in x.split(';')]))
generate_rating = lambda prefix, x: '<div class="ui %s rating disabled"><span data-tooltip="%s%d von %d Herzen" data-variation="multiline" data-inverted="">%s</span></div>' % (get_star_color(x), prefix, x, max_star_rating, ''.join(['<i class="heart icon%s"></i>' % (' active' if i < x else '') for i in range(0, max_star_rating)])) if not np.isnan(x) else '-'
generate_exclusive_icon = lambda x,y: '<span class="right floated" data-tooltip="Figur besitzt mindestens ein exklusives Teil (%s)" data-variation="multiline" data-position="left center" data-inverted=""><i class="right floated orange gem icon"></i></span>' % generate_unique_parts(y) if x else ''
generate_unique_icon = lambda x: '<span class="right floated" data-tooltip="Erstauflage" data-position="left center" data-variation="multiline" data-inverted=""><i class="right floated yellow medal icon"></i></span>' if x else ''

df = pd.read_csv('figures.csv')
df = df.drop_duplicates()

df_alternate = getAlternateInfo(df['set_num'].drop_duplicates().to_list())
df = df.merge(df_alternate, how='left', on='set_num')

df['filename'] = df['minifig_img_link'].apply(lambda x: x.replace(rebrickable_img_url, '') if x.startswith(rebrickable_img_url) else None)
df['part_price'] = df.apply(lambda x: (x['set_price'] / (100 * x['num_parts'])) if x['set_price'] and not np.isnan(x['set_price']) else None, axis=1)
df['is_exclusive'] = df.apply(lambda x: generate_exclusive_icon(x['has_unique_part'], x['unique_parts']), axis=1)
df['minifig_rating_html'] = df.apply(lambda x: generate_rating('Minifigur-Bewertung: ', x['rating']), axis=1)
df['set_rating_html'] = df.apply(lambda x: generate_rating('Set-Bewertung: ', x['set_rating']), axis=1)
df['eol'] = df.apply(lambda x: eol_mapping[x['eol']], axis=1)
df['theme'] = df.apply(lambda x: '%s / %s' % (x['root_theme_name'], x['theme_name']) if x['theme_name'] != x['root_theme_name'] else x['theme_name'], axis=1)
df['has_stickers'] = df.apply(lambda x: 'Ja' if x['has_stickers'] else 'Nein', axis=1)
df['set_price'] = df.apply(lambda x: '%.2f' % (x['set_price'] / 100) if x['set_price'] and not np.isnan(x['set_price']) else '-', axis=1)
df['alternate_price'] = df.apply(lambda x: '%.2f' % (x['alternate_price'] / 100) if x['alternate_price'] and not np.isnan(x['alternate_price']) else '-', axis=1)
df['part_price'] = df.apply(lambda x: '%.4f' % x['part_price'] if x['set_price'] else '-', axis=1)
df['set_num'] = df.apply(lambda x: x['set_num'].split('-')[0], axis=1)
df['unique_character'] = df.apply(lambda x: generate_unique_icon(x['unique_character']), axis=1)
df['set_name'] = df.apply(lambda x: x['set_name_de'] if x['set_name_de'] else x['set_name'] , axis=1)
df['card_extra_content'] = df.apply(lambda x: generateCardExtraContent(x) , axis=1)
df['card_css'] = df.apply(lambda x: generateCardCss(x['has_unique_part'], x['unique_character'], x['rating'] == 4), axis=1)
df['card_content_css'] = df.apply(lambda x: generateCardContentCss(x['has_unique_part'], x['unique_character'], x['rating'] == 4), axis=1)
df['img_slug'] = df['fig_name'].apply(lambda x: 'lego-minifigure-' + re.search('^[\w\s]*', x).group().strip().lower().replace(' ', '-'))
df['img_slug'] = df['img_slug'] + '-' + df['filename'].apply(lambda x: x.split('/')[0].replace('fig-', '') if x else x)
df['theme_slug'] = df['root_theme_name'].apply(lambda x: re.search('^[\w\s]*', x).group().strip().lower().replace(' ', '-'))
df['minifig_img_link'] = df.apply(lambda x: '%s/%s.jpg' % (x['theme_slug'], x['img_slug']) if x['filename'] else 'nil_mf.jpg', axis=1)

df = df.sort_values(by=['minifig_score', 'unique_character', 'set_score'], ascending=[False, False, False])

for index, row in df[~df['filename'].isna()].iterrows():
    folder = row['theme_slug']
    filename = row['img_slug']
    createFolder('public/static/images/%s' % folder)
    download((rebrickable_img_url + '%s') % row['filename'], 'public/static/images/%s/%s.%s' % (folder, filename, row['filename'].split('.')[-1]))


df = df.drop(columns=['filename', 'theme_slug', 'minifig_score', 'set_score', 'img_slug'])

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
    tmp = main_js_template % {'figures': df.to_dict(orient='records'), 'figure_template': figure_card.replace('\n', ''), 'wiki_page': wiki_page.replace('\n', ''), 'info_page': info_page.replace('\n', '')}
    tmp = tmp.replace('True', 'true')
    tmp = tmp.replace('False', 'false')
    tmp = tmp.replace('None', 'null')
    tmp = tmp.replace(': nan', ': null')
    file.write(tmp)

for theme in top_themes:
    menu[1]['children'].append({'name': theme, 'href': 'minifigures/%s/index.html' % slugify(theme), 'position': 'left', 'children': []})


actualYear = datetime.now().year

createSnippet('Der Ratgeber für LEGO&#174; %s Minifiguren' % actualYear, '', 'brickadvisor,lego,figuren,wertanlage,preisvergleich,minifiguren,eol', 'Herzlich Willkommen bei Brickadvisor.ch', 'home', 'index.html')
# createSnippet('Wissenswertes', '', '', 'Wissenswertes', 'wiki', 'wiki.html')
createSnippet('Impressum', 'impressum,kelt 9,haftung,inhalte,links', 'Impressum der Webseite brickadvisor.ch', 'Impressum', 'impressum', 'impressum.html')
createSnippet('Datenschutz', 'datenschutz,kelt 9,haftungausschluss,datenschutzgesetz,artikel 13', '', 'Datenschutz', 'privacy', 'privacy.html')

createCardsSnippet(
    'Die besten LEGO&#174; Minifiguren %d' % actualYear,
    'minifigur,minifiguren,figur,figuren,ratgeber,lexikon,lego,seltenheit,eol,star wars,marvel,ninjago,dc,wertanlage,investment,geldanlage,uvp,links,exklusiv,exklusivität,bewertung,preis pro stein',
    'Das Nachschlagewerk der besten LEGO&#174; Minifiguren. Finde Erstauflagen, Figuren mit exklusiven oder seltenen Teilen sowie bald auslaufende Exemplare (End Of Life)',
    'Der Ratgeber für LEGO&#174; Minifiguren',
    'Durchsuche mit Hilfe von verschiedenen Filtern (Exklusivität, Erstausgaben von Charakteren, Bewertung der Einzelsteine, EOL-Status der dazugehörigen Sets) auf Brickadvisor die besten Lego&#174; Minifiguren %d. Egal ob als Sammelobjekt für die Vitrine, zum Tauschen unter Gleichgesinnten oder als Wertanlage, dank Brickadvisor verpasst Du keine interessante Figur mehr.' % actualYear,
    'figure_card',
    'minifigures/index.html',
    1
)

for theme in top_themes:
    createCardsSnippet(
        'Die besten LEGO&#174; %s Minifiguren %d' % (theme, actualYear),
        'minifigur,minifiguren,figur,figuren,ratgeber,lexikon,lego,seltenheit,eol,%s,wertanlage,investment,geldanlage,uvp,links,exklusiv,exklusivität,bewertung,preis pro stein' % theme.lower(),
        'Das Nachschlagewerk der besten LEGO&#174; %s Minifiguren %d. Finde Erstauflagen, Figuren mit exklusiven Teilen sowie bald auslaufende Exemplare (End Of Life)' % (theme, actualYear),
        'Der Ratgeber für LEGO&#174; %s Minifiguren' % theme,
        'Durchsuche mit Hilfe von verschiedenen Filtern (Exklusivität, Erstausgaben von Charakteren, Bewertung der Einzelsteine, EOL-Status der dazugehörigen Sets) auf Brickadvisor die besten Lego&#174; %s Minifiguren %d. Egal ob als Sammelobjekt für die Vitrine, zum Tauschen unter Gleichgesinnten oder als Wertanlage, dank Brickadvisor verpasst Du keine interessante Figur mehr.' % (theme, actualYear),
        'figure_card',
        'minifigures/%s/index.html' % slugify(theme),
        2
    )

createSitemap()
