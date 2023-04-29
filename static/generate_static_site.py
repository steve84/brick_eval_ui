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
    get_response = requests.get(url, stream=True)
    with open(filename, 'wb') as f:
        for chunk in get_response.iter_content(chunk_size=1024):
            if chunk: # filter out keep-alive new chunks
                f.write(chunk)


def createFolder(path):
    Path(path).mkdir(parents=True, exist_ok=True)


def generateMenu(activeItem: str) -> str:
    html = '<div class="ui menu">'
    for item in menu:
        html += '<a class="%sitem" href="%s">%s</a>' % ('active ' if item['name'] == activeItem else '', item['href'], item['name'])
    html += '</div>'
    return html


def generateFooter():
    html = '<div class="ui horizontal list">'
    for item in footer:
        html += '<a class="item" href="%s">%s</a>' % (item['href'], item['name'])
    html += '</div>'
    return html


def createSnippet(title, header, snippet_name, outfile):
    base_template = ''
    with open('templates/base_template.html', 'r') as file:
        base_template = file.read()
    
    snippet = ''
    with open('snippets/%s.html' % snippet_name, 'r', encoding='utf-8') as file:
        snippet = file.read()
    
    with open(output_folder % outfile, 'w', encoding='utf-8') as file:
        file.write(base_template.format(title, generateMenu(title), header, snippet, generateFooter()))


# select
# case when m.rebrickable_id is not null
# then 'https://cdn.rebrickable.com/media/sets/' || m.fig_num || '/' || m.rebrickable_id || '.jpg'
# else 'https://rebrickable.com/static/img/nil_mf.jpg' end as minifig_img_link,
# m.name as fig_name,
# t.name as theme_name,
# rt.name as root_theme_name,
# sc.rating,
# im.quantity,
# m.has_unique_part,
# s.set_num,
# s.eol,
# s.name as set_name,
# s.num_parts,
# sc.year_of_publication,
# s.has_stickers,
# scs.rating as set_rating,
# sp.retail_price as set_price
# from (SELECT * FROM v_scores WHERE id IN (SELECT first_value(id) OVER (PARTITION BY is_set, entity_id ORDER BY calc_date DESC) from v_scores)) sc
# left join inventory_minifigs im on im.id = sc.entity_id
# left join minifigs m on m.id = im.fig_id
# left join inventories i on i.id = im.inventory_id
# left join sets s on s.id = i.set_id
# left join themes t on t.id = s.theme_id
# left join themes rt on rt.id = s.root_theme_id
# left join (SELECT * FROM v_scores WHERE id IN (SELECT first_value(id) OVER (PARTITION BY is_set, entity_id ORDER BY calc_date DESC) from v_scores)) scs on s.id = scs.entity_id and scs.is_set = true
# left join set_prices sp on sp.set_id = s.id
# where sc.is_set = false and s.eol not in ('-1', '0') and s.num_parts > 0 and m.has_unique_part is not null
# order by sc.rating desc, m.has_unique_part desc, scs.rating desc, scs.score desc;

output_folder = 'public/%s'
rebrickable_img_url = 'https://cdn.rebrickable.com/media/sets/'

menu = [
    {'name': 'Home', 'href': 'index.html'},
    {'name': 'Figuren', 'href': 'figures.html'},
    {'name': 'Über', 'href': 'about.html'},
    {'name': 'Wissenswerten', 'href': 'wiki.html'}
]

footer = [
    {'name': 'Impressum', 'href': 'impressum.html'},
    {'name': 'Datenschutz', 'href': 'privacy.html'}
]

max_star_rating = 4

star_mapping = {1: 'red', 2: 'orange', 3: 'yellow', 4: 'green'}
eol_mapping = {1: 'Verfügbar', 2: 'Einstellung in Kürze', 3: 'EOL erwartet'}

get_star_color = lambda x: star_mapping[x] if x > 0 and x <= max_star_rating else ''

generate_rating = lambda x: '<div class="ui %s rating disabled">%s</div>' % (get_star_color(x), ''.join(['<i class="heart icon%s"></i>' % (' active' if i < x else '') for i in range(0, max_star_rating)]))
generate_unique_icon = lambda x: '<i class="right floated orange gem icon"></i>' if x else ''

df = pd.read_csv('figures.csv')
df = df.drop_duplicates()

df['filename'] = df['minifig_img_link'].apply(lambda x: x.replace(rebrickable_img_url, '') if x.startswith(rebrickable_img_url) else None)

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
    'is_exclusive': generate_unique_icon(x['has_unique_part']),
    'fig_name': x['fig_name'],
    'theme_name': x['theme_name'],
    'root_theme_name': x['root_theme_name'],
    'set_rating': generate_rating(x['set_rating']),
    'set_num': x['set_num'],
    'set_name': x['set_name'],
    'set_price': '%.2f' % (x['set_price'] / 100) if x['set_price'] and not np.isnan(x['set_price']) else '-',
    'eol': eol_mapping[x['eol']],
    'num_parts': x['num_parts'],
    'quantity': x['quantity'],
    'year_of_publication': '%.f' % x['year_of_publication'],
    'has_stickers': 'Ja' if x['has_stickers'] else 'Nein'}, axis=1)


df['year_of_publication'] = df['year_of_publication'].astype(object)


createSnippet('Über', 'Über', 'about', 'about.html')
createSnippet('Home', 'Herzlich Willkommen bei Brickadvisor.ch', 'home', 'index.html')
createSnippet('Wissenswertes', 'Wissenswertes', 'wiki', 'wiki.html')
createSnippet('Impressum', 'Impressum', 'impressum', 'impressum.html')
createSnippet('Datenschutz', 'Datenschutz', 'privacy', 'privacy.html')

base_template = ''
with open('templates/base_template.html', 'r') as file:
    base_template = file.read()


figure_cards = '<div class="ui five stackable cards">'
with open(output_folder % 'figures.html', 'w', encoding='utf-8') as file:
    for val in df[df['num_parts'] >= 15]['figure_card'].head(200).to_list():
        figure_cards += val
    
    figure_cards += '</div>'

    figure_label = '<div class="ui basic labels"><a class="ui olive label">Top<div class="detail">200</div></a>'
    for theme in df['root_theme_name'].unique():
        html_filename = slugify('figure-cards-%s' % theme.lower()) + '.html'
        df_tmp = df[df['root_theme_name'] == theme]
        figure_label += '<a class="ui label" href="./%s">%s<div class="detail">%d</div></a>' % (html_filename, theme, len(df_tmp))

    figure_label += '</div>'

    file.write(base_template.format('Figuren - Top 200', generateMenu('Figuren'), 'Figuren - Top 200', figure_label + figure_cards, generateFooter()))


for theme in df['root_theme_name'].unique():
    figure_label = '<div class="ui basic labels"><a class="ui label" href="figures.html">Top<div class="detail">200</div></a>'
    figure_cards = '<div class="ui five stackable cards">'
    html_filename = slugify('figure-cards-%s' % theme.lower()) + '.html'
    df_tmp = df[df['root_theme_name'] == theme]
    with open(output_folder % html_filename, 'w', encoding='utf-8') as file:
        for val in df_tmp['figure_card'].to_list():
            figure_cards += val
        
        figure_cards += '</div>'

        for sub_theme in df['root_theme_name'].unique():
            html_link = slugify('figure-cards-%s' % sub_theme.lower()) + '.html'
            figure_label += '<a class="ui %s label" href="./%s">%s<div class="detail">%d</div></a>' % ('olive' if sub_theme == theme else '', html_link, sub_theme, len(df[df['root_theme_name'] == sub_theme]))
        
        figure_label += '</div>'

        file.write(base_template.format('Figuren - %s' % theme, generateMenu('Figuren'), 'Figuren - %s' % theme, figure_label + figure_cards, generateFooter()))


        