"""Check the structure and local references of the DataStart static site."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import sys

ROOT = Path(__file__).resolve().parents[1]
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.refs = []
        self.stack = []
        self.errors = []
        self.h1_count = 0
        self.main_count = 0
        self.image_count = 0

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag not in VOID:
            self.stack.append(tag)
        if tag == 'h1':
            self.h1_count += 1
        if tag == 'main':
            self.main_count += 1
        identifier = attrs.get('id')
        if identifier:
            if identifier in self.ids:
                self.errors.append(f'Duplicate id: {identifier}')
            self.ids.add(identifier)
        if tag == 'html' and attrs.get('lang') != 'ru':
            self.errors.append('The page language must be ru')
        if tag == 'img':
            self.image_count += 1
            if not attrs.get('alt', '').strip():
                self.errors.append('An image is missing an alternative description')
            for dimension in ('width', 'height'):
                if not attrs.get(dimension, '').isdigit() or int(attrs[dimension]) <= 0:
                    self.errors.append(f'Invalid image {dimension}')
        for attribute in ('src', 'href'):
            if attrs.get(attribute):
                self.refs.append(attrs[attribute])

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            self.errors.append(f'Unexpected closing void tag: {tag}')
        elif not self.stack or self.stack[-1] != tag:
            self.errors.append(f'Mismatched closing tag: {tag}')
        else:
            self.stack.pop()

    def validate(self):
        if self.stack:
            self.errors.append('Unclosed tags: ' + ', '.join(self.stack))
        if self.h1_count != 1 or self.main_count != 1:
            self.errors.append('Exactly one h1 and one main are required')
        if self.image_count < 3:
            self.errors.append('At least three project photographs are required')
        for reference in self.refs:
            url = urlsplit(reference)
            if url.scheme or url.netloc:
                continue
            local = (ROOT / unquote(url.path)).resolve() if url.path else ROOT / 'index.html'
            if not local.is_relative_to(ROOT) or not local.is_file():
                self.errors.append(f'Missing or invalid local resource: {reference}')
            if url.fragment and local == ROOT / 'index.html' and unquote(url.fragment) not in self.ids:
                self.errors.append(f'Missing anchor: {reference}')
        return self.errors


if __name__ == '__main__':
    parser = SiteParser()
    parser.feed((ROOT / 'index.html').read_text(encoding='utf-8'))
    errors = parser.validate()
    for error in errors:
        print('ERROR:', error)
    if errors:
        sys.exit(1)
    print(f'PASS: HTML structure, {len(parser.ids)} unique ids, {parser.image_count} images, local files and anchors')
