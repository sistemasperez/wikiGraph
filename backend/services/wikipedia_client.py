from fastapi import HTTPException
import requests
from bs4 import BeautifulSoup
import re
import time # Added for caching

WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php"

class WikipediaClient:
    def __init__(self):
        self.cache = {} # Added cache dictionary
        self.cache_ttl = 900 # Cache Time-To-Live in seconds (15 minutes)

    def _call_wikipedia_api(self, params: dict):
        try:
            response = requests.get(WIKIPEDIA_API_URL, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=503, detail=f"Error connecting to Wikipedia API: {e}")

    def search_articles(self, term: str):
        cache_key = f"search_{term}"
        if cache_key in self.cache and (time.time() - self.cache[cache_key]["timestamp"] < self.cache_ttl):
            return self.cache[cache_key]["data"]

        params = {
            "action": "query",
            "list": "search",
            "srsearch": term,
            "format": "json"
        }
        data = self._call_wikipedia_api(params)
        self.cache[cache_key] = {"data": data, "timestamp": time.time()}
        return data

    def get_article_summary(self, title: str) -> str:
        cache_key = f"summary_{title}"
        if cache_key in self.cache and (time.time() - self.cache[cache_key]["timestamp"] < self.cache_ttl):
            return self.cache[cache_key]["data"]

        params = {
            "action": "query",
            "prop": "extracts",
            "exintro": True,
            "explaintext": True,
            "titles": title,
            "format": "json",
            "redirects": 1,
        }
        data = self._call_wikipedia_api(params)
        try:
            page = next(iter(data["query"]["pages"].values()))
            summary = page.get("extract", "")
            self.cache[cache_key] = {"data": summary, "timestamp": time.time()}
            return summary
        except (KeyError, StopIteration):
            self.cache[cache_key] = {"data": "", "timestamp": time.time()} # Cache empty summary too
            return ""

    def get_article_content(self, title: str):
        params_parse = {
            "action": "parse",
            "page": title,
            "prop": "text",
            "format": "json",
            "redirects": 1,
        }
        data = self._call_wikipedia_api(params_parse)
        if "error" in data:
            raise HTTPException(status_code=404, detail=f'Article "{title}" not found.')
        try:
            html_content = data["parse"]["text"]["*"]
            final_article_title = data["parse"]["title"]
            return html_content, final_article_title
        except KeyError:
            raise HTTPException(status_code=404, detail=f'Content for "{title}" could not be processed.')

    def extract_links_from_html(self, html_content: str, current_article_title: str) -> set:
        soup = BeautifulSoup(html_content, "lxml")
        links = set()
        link_pattern = re.compile(r"^/wiki/([^:?#]+)$")

        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            match = link_pattern.match(href)
            if match:
                article_name = requests.utils.unquote(match.group(1)).replace("_", " ")
                if article_name.lower() != current_article_title.lower():
                    links.add(article_name)
        return links
