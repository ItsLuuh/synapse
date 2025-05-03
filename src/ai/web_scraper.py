import requests
from bs4 import BeautifulSoup
import os
import json
import re
from urllib.parse import urlparse, urljoin

class WebScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def scrape_url(self, url):
        """
        Scrape content from a URL and extract essential information
        """
        try:
            # Validate URL
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
                
            # Make request
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract essential information
            result = {
                'url': url,
                'title': self._extract_title(soup),
                'description': self._extract_description(soup),
                'keywords': self._extract_keywords(soup),
                'text_content': self._extract_text_content(soup),
                'links': self._extract_links(soup, url),
                'headings': self._extract_headings(soup),
            }
            
            return {
                'success': True,
                'data': result
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _extract_title(self, soup):
        """
        Extract the title of the webpage
        """
        title_tag = soup.find('title')
        if title_tag and title_tag.string:
            return title_tag.string.strip()
        return ''
    
    def _extract_description(self, soup):
        """
        Extract meta description
        """
        meta_desc = soup.find('meta', attrs={'name': 'description'}) or \
                   soup.find('meta', attrs={'property': 'og:description'})
        if meta_desc and meta_desc.get('content'):
            return meta_desc['content'].strip()
        return ''
    
    def _extract_keywords(self, soup):
        """
        Extract meta keywords and other significant terms
        """
        # Try meta keywords
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        if meta_keywords and meta_keywords.get('content'):
            keywords = [k.strip() for k in meta_keywords['content'].split(',')]
            return keywords
        
        # Extract significant terms from headings
        keywords = []
        for heading in soup.find_all(['h1', 'h2', 'h3']):
            if heading.text.strip():
                # Split by common separators and filter out short words
                words = re.split(r'[\s\-_|]', heading.text.strip())
                words = [w.strip() for w in words if len(w.strip()) > 3]
                keywords.extend(words)
        
        # Remove duplicates and limit to 20 keywords
        return list(set(keywords))[:20]
    
    def _extract_text_content(self, soup):
        """
        Extract main text content from the page while preserving structure
        """
        # Remove unwanted elements
        for unwanted in soup(['script', 'style', 'nav', 'footer', 'header', 'iframe', 'form']):
            unwanted.decompose()
        
        # Extract structured content
        content = {
            'main_content': '',
            'sections': [],
            'lists': [],
            'tables': []
        }
        
        # Get main content
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=lambda x: x and ('content' in x.lower() or 'main' in x.lower()))
        if main_content:
            content['main_content'] = ' '.join(main_content.stripped_strings)
        else:
            content['main_content'] = ' '.join(soup.body.stripped_strings) if soup.body else ''
        
        # Extract sections with headers
        for section in soup.find_all(['section', 'article', 'div']):
            header = section.find(['h1', 'h2', 'h3', 'h4'])
            if header:
                section_content = ' '.join(section.stripped_strings)
                if len(section_content) > 50:  # Ignore small sections
                    content['sections'].append({
                        'header': header.get_text(strip=True),
                        'content': section_content
                    })
        
        # Extract lists
        for list_elem in soup.find_all(['ul', 'ol']):
            items = [item.get_text(strip=True) for item in list_elem.find_all('li')]
            if items:
                content['lists'].append(items)
        
        # Extract tables
        for table in soup.find_all('table'):
            table_data = []
            headers = []
            header_row = table.find('thead')
            if header_row:
                headers = [th.get_text(strip=True) for th in header_row.find_all(['th', 'td'])]
            
            for row in table.find_all('tr'):
                row_data = [cell.get_text(strip=True) for cell in row.find_all(['td', 'th'])]
                if row_data:
                    table_data.append(row_data)
            
            if table_data:
                content['tables'].append({
                    'headers': headers,
                    'data': table_data
                })
        
        return content
    
    def _extract_links(self, soup, base_url):
        """
        Extract links from the page
        """
        links = []
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            # Make relative URLs absolute
            if not href.startswith(('http://', 'https://')):
                href = urljoin(base_url, href)
            
            # Only include http/https links
            if href.startswith(('http://', 'https://')):
                links.append({
                    'url': href,
                    'text': a_tag.get_text().strip() or href
                })
        
        # Remove duplicates
        unique_links = []
        seen_urls = set()
        for link in links:
            if link['url'] not in seen_urls:
                seen_urls.add(link['url'])
                unique_links.append(link)
        
        return unique_links[:50]  # Limit to 50 links
    
    def _extract_headings(self, soup):
        """
        Extract headings and their hierarchy
        """
        headings = []
        for i in range(1, 7):  # h1 to h6
            for heading in soup.find_all(f'h{i}'):
                if heading.text.strip():
                    headings.append({
                        'level': i,
                        'text': heading.text.strip()
                    })
        return headings