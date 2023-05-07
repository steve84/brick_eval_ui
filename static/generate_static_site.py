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
    for item in menu:
        html += '<a class="%sitem" tabindex="%d" href="%s">%s</a>' % ('active ' if item['name'] == activeItem else '', i, item['href'], item['name'])
        i += 1
    html += '</div>'
    return html


def generateFooter():
    html = '<div class="ui horizontal list">'
    i = len(menu) + 1
    for item in footer:
        html += '<a class="item" tabindex="%d" href="%s">%s</a>' % (i, item['href'], item['name'])
        i += 1
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
        file.write(base_template.format(meta_keywords.lower(), meta_description.lower(), title, generateMenu(title), header, snippet, generateFooter()))


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
# left join (SELECT * FROM set_prices WHERE id IN (SELECT first_value(id) OVER (PARTITION BY set_id ORDER BY check_date DESC) from set_prices)) sp on sp.set_id = s.id
# where sc.is_set = false and s.eol not in ('-1', '0') and s.num_parts > 0 and m.has_unique_part is not null and not m.is_minidoll;

output_folder = 'public/%s'
rebrickable_img_url = 'https://cdn.rebrickable.com/media/sets/'

menu = [
    {'name': 'Home', 'href': 'index.html'},
    {'name': 'Figuren', 'href': 'figures.html'},
    #{'name': 'Über', 'href': 'about.html'},
    {'name': 'Wissenswertes', 'href': 'wiki.html'}
]

footer = [
    {'name': 'Impressum', 'href': 'impressum.html'},
    {'name': 'Datenschutz', 'href': 'privacy.html'}
]

max_star_rating = 4

star_mapping = {1: 'red', 2: 'orange', 3: 'yellow', 4: 'green'}
eol_mapping = {1: 'Verfügbar', 2: 'Einstellung in Kürze', 3: 'EOL erwartet'}

get_star_color = lambda x: star_mapping[x] if x > 0 and x <= max_star_rating else ''

generate_rating = lambda x: '<div class="ui %s rating disabled"><span data-tooltip="%d von %d Sternen" data-inverted="">%s</span></div>' % (get_star_color(x), x, max_star_rating, ''.join(['<i class="heart icon%s"></i>' % (' active' if i < x else '') for i in range(0, max_star_rating)])) if not np.isnan(x) else '-'
generate_exclusive_icon = lambda x: '<span class="right floated" data-tooltip="Figur besitzt mindestens ein exklusives Teil" data-position="left center" data-inverted=""><i class="right floated orange gem icon"></i></span>' if x else ''
generate_unique_icon = lambda x: '<span class="right floated" data-tooltip="Exklusiver Charakter im Lego-Universum" data-position="left center" data-inverted=""><i class="right floated yellow medal icon"></i></span>' if x else ''

df = pd.read_csv('figures.csv')
df = df.drop_duplicates()

df['filename'] = df['minifig_img_link'].apply(lambda x: x.replace(rebrickable_img_url, '') if x.startswith(rebrickable_img_url) else None)
df['part_price'] = df.apply(lambda x: (x['set_price'] / (100 * x['num_parts'])) if x['set_price'] and not np.isnan(x['set_price']) else None, axis=1)

df = df.sort_values(by=['has_unique_part', 'minifig_score', 'unique_character', 'part_price'], ascending=[False, False, False, True])

download('https://rebrickable.com/static/img/nil_mf.jpg', 'public/static/images/nil_mf.jpg')

for subpath in df[~df['filename'].isna()]['filename']:
    folder, filename = subpath.split('/')
    createFolder('public/static/images/%s' % folder)
    download((rebrickable_img_url + '%s') % subpath, 'public/static/images/%s/%s' % (folder, filename))


figure_card = ''
with open('snippets/figure_card.html', 'r') as file:
    figure_card = file.read()

df['figure_card'] = df.apply(lambda x: figure_card % {
    'minifig_img_link': 'static/images/%s' % x['filename'] if x['filename'] else 'static/images/nil_mf.jpg',
    'minifig_rating': generate_rating(x['rating']),
    'is_exclusive': generate_exclusive_icon(x['has_unique_part']),
    'unique_character': generate_unique_icon(x['unique_character']),
    'fig_name': x['fig_name'],
    'theme_name': x['theme_name'],
    'root_theme_name': x['root_theme_name'],
    'theme': '%s / %s' % (x['root_theme_name'], x['theme_name']) if x['theme_name'] != x['root_theme_name'] else x['theme_name'],
    'set_rating': generate_rating(x['set_rating']),
    'set_num': x['set_num'].split('-')[0],
    'set_name': x['set_name_de'],
    'lego_slug': x['lego_slug'],
    'set_price': '%.2f' % (x['set_price'] / 100) if x['set_price'] and not np.isnan(x['set_price']) else '-',
    'part_price': '%.4f' % x['part_price'] if x['set_price'] else '-',
    'eol': eol_mapping[x['eol']],
    'num_parts': x['num_parts'],
    'quantity': x['quantity'],
    'year_of_publication': '%.f' % x['year_of_publication'],
    'has_stickers': 'Ja' if x['has_stickers'] else 'Nein'}, axis=1)


df['year_of_publication'] = df['year_of_publication'].astype(object)


#createSnippet('Über', '', '', 'Über', 'about', 'about.html')
createSnippet('Home', '', 'brickadvisor,lego,figuren,wertanlage,preisvergleich,minifiguren,eol', 'Herzlich Willkommen bei Brickadvisor.ch', 'home', 'index.html')
createSnippet('Wissenswertes', '', '', 'Wissenswertes', 'wiki', 'wiki.html')
createSnippet('Impressum', 'impressum,kelt 9,haftung,inhalte,links', 'Impressum der Webseite brickadvisor.ch', 'Impressum', 'impressum', 'impressum.html')
createSnippet('Datenschutz', 'datenschutz,kelt 9,haftungausschluss,datenschutzgesetz,artikel 13', '', 'Datenschutz', 'privacy', 'privacy.html')

base_template = ''
with open('templates/base_template.html', 'r') as file:
    base_template = file.read()


figure_cards = '<div class="ui five stackable cards">'
with open(output_folder % 'figures.html', 'w', encoding='utf-8') as file:
    for val in df[df['num_parts'] >= 15]['figure_card'].head(200).to_list():
        figure_cards += val
    
    figure_cards += '</div>'

    figure_label = '<div class="ui basic labels" style="padding-bottom: 15px"><a class="ui inverted olive label" href="figures.html">Top<div class="detail">200</div></a>'
    for theme in df['root_theme_name'].unique():
        html_filename = slugify('figure-cards-%s' % theme.lower()) + '.html'
        df_tmp = df[df['root_theme_name'] == theme]
        figure_label += '<a class="ui label" href="./%s">%s<div class="detail">%d</div></a>' % (html_filename, theme, len(df_tmp))

    figure_label += '</div>'

    file.write(base_template.format('brickadvisor,lego,figuren,top 200,wertanlage,uvp,links,exklusiv,bewertung,preis pro stein', 'Lego Top 200 Minifiguren', 'Figuren - Top 200', generateMenu('Figuren'), 'Figuren - Top 200', figure_label + figure_cards, generateFooter()))


for theme in df['root_theme_name'].unique():
    figure_label = '<div class="ui basic labels" style="padding-bottom: 15px"><a class="ui label" href="figures.html">Top<div class="detail">200</div></a>'
    figure_cards = '<div class="ui five stackable cards">'
    html_filename = slugify('figure-cards-%s' % theme.lower()) + '.html'
    df_tmp = df[df['root_theme_name'] == theme]
    with open(output_folder % html_filename, 'w', encoding='utf-8') as file:
        for val in df_tmp['figure_card'].to_list():
            figure_cards += val
        
        figure_cards += '</div>'

        for sub_theme in df['root_theme_name'].unique():
            html_link = slugify('figure-cards-%s' % sub_theme.lower()) + '.html'
            figure_label += '<a class="ui %s label" href="./%s">%s<div class="detail">%d</div></a>' % ('inverted olive' if sub_theme == theme else '', html_link, sub_theme, len(df[df['root_theme_name'] == sub_theme]))
        
        figure_label += '</div>'

        file.write(base_template.format('brickadvisor,lego,figuren,%s,wertanlage,uvp,links,exklusiv,bewertung,preis pro stein' % theme.lower(), 'Lego %s Minifiguren' % theme.lower(), 'Figuren - %s' % theme, generateMenu('Figuren'), 'Figuren - %s' % theme, figure_label + figure_cards, generateFooter()))


        