import os
import re
import json

base = r'c:\Excelora All Website\SparkleLove\docs\city-pages'
files = [
    'hyderabad-india.md',
    'chennai-india.md',
    'london-united-kingdom.md',
    'new-york-united-states.md',
    'toronto-canada.md',
    'sydney-australia.md',
    'dubai-uae.md',
    'singapore-singapore.md',
]

seo_fields = [
    'seo_title',
    'meta_description',
    'slug',
    'canonical_url',
    'og_title',
    'og_description',
    'twitter_title',
    'twitter_description',
    'keywords',
    'image_alt',
    'breadcrumb',
]

for fn in files:
    path = os.path.join(base, fn)
    try:
        with open(path, 'r', encoding='utf-8') as f:
            text = f.read()
    except FileNotFoundError:
        print(f'{fn}|MISSING')
        continue

    words = len(re.findall(r"\b\w+\'?\w*\b", text))
    frontmatter = bool(re.search(r'^---\n', text, re.M))
    metadata = {k: bool(re.search(r'^' + re.escape(k) + r':', text, re.M)) for k in seo_fields}
    faq_section = re.search(r'## FAQ(.*?)##', text, re.S)
    if not faq_section:
        faq_section = re.search(r'## FAQ(.*)```', text, re.S)
    faq_text = faq_section.group(1) if faq_section else ''
    faq_count = len(re.findall(r'^[ \t]*\d+\.|^- .*\?$', faq_text, re.M))

    json_valid = False
    jsonld_count = 0
    json_error = ''
    blocks = re.findall(r'```json\n(.*?)```', text, re.S)
    if blocks:
        for block in blocks:
            try:
                data = json.loads(block)
                json_valid = True
                graph = data.get('@graph') if isinstance(data, dict) else None
                if isinstance(graph, list):
                    for item in graph:
                        if item.get('@type') == 'FAQPage':
                            jsonld_count = len(item.get('mainEntity', []))
                            break
                break
            except Exception as e:
                json_error = str(e)

    print('|'.join([
        fn,
        str(words),
        str(frontmatter),
        str(all(metadata.values())),
        str(faq_count),
        str(json_valid),
        str(jsonld_count),
        json_error,
    ]))
